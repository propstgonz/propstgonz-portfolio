import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import nodemailer from 'nodemailer';
import { env } from './api';

const DATA_PATH = env('METRICS_FILE') ?? '/tmp/propstgonz-metrics.json';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const TZ = 'Europe/Madrid';

const MAX_LOG = 20000;
const MAX_PER_IP = 5000;
const PER_IP_TTL_MS = 180 * 24 * 60 * 60 * 1000;

export interface Visit {
  ip: string;
  session: string;
  path: string;
  referrer: string;
  browser: string;
  os: string;
}

interface VisitEntry extends Visit {
  timestamp: string;
}

interface PerIpStats {
  count: number;
  firstSeen: string;
  lastSeen: string;
}

export interface MetricsData {
  log: VisitEntry[];
  perIp: Record<string, PerIpStats>;
  lastReportAt: string;
  previous: { views: number; visitors: number } | null;
}

export function parseUserAgent(ua: string): { browser: string; os: string } {
  const browser = /\bEdg\//.test(ua)
    ? 'Edge'
    : /\bOPR\/|\bOpera\b/.test(ua)
      ? 'Opera'
      : /\bFirefox\//.test(ua)
        ? 'Firefox'
        : /\bChrome\//.test(ua)
          ? 'Chrome'
          : /\bSafari\//.test(ua)
            ? 'Safari'
            : 'other';

  const os = /\bWindows\b/.test(ua)
    ? 'Windows'
    : /\bAndroid\b/.test(ua)
      ? 'Android'
      : /\biPhone\b|\biPad\b|\biPod\b/.test(ua)
        ? 'iOS'
        : /\bMacintosh\b|\bMac OS X\b/.test(ua)
          ? 'macOS'
          : /\bLinux\b/.test(ua)
            ? 'Linux'
            : 'other';

  return { browser, os };
}

export const INTERNAL = 'internal';

export function referrerHost(referrer: string, selfHost: string): string {
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    const self = selfHost.split(':')[0].replace(/^www\./, '');
    return host === self ? INTERNAL : host;
  } catch {
    return '';
  }
}

function emptyData(): MetricsData {
  return { log: [], perIp: {}, lastReportAt: new Date().toISOString(), previous: null };
}

async function readData(): Promise<MetricsData> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<MetricsData>;
    return {
      log: Array.isArray(parsed.log) ? parsed.log : [],
      perIp: parsed.perIp && typeof parsed.perIp === 'object' ? parsed.perIp : {},
      lastReportAt:
        typeof parsed.lastReportAt === 'string' ? parsed.lastReportAt : new Date().toISOString(),
      previous: parsed.previous ?? null,
    };
  } catch {
    return emptyData();
  }
}

async function writeData(data: MetricsData): Promise<void> {
  await mkdir(dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(data), 'utf-8');
}

function prune(data: MetricsData): void {
  if (data.log.length > MAX_LOG) {
    data.log = data.log.slice(data.log.length - MAX_LOG);
  }

  const cutoff = Date.now() - PER_IP_TTL_MS;
  for (const [ip, stats] of Object.entries(data.perIp)) {
    if (new Date(stats.lastSeen).getTime() < cutoff) delete data.perIp[ip];
  }

  const ips = Object.keys(data.perIp);
  if (ips.length > MAX_PER_IP) {
    const stale = ips
      .sort(
        (a, b) =>
          new Date(data.perIp[a].lastSeen).getTime() - new Date(data.perIp[b].lastSeen).getTime(),
      )
      .slice(0, ips.length - MAX_PER_IP);
    for (const ip of stale) delete data.perIp[ip];
  }
}

let lock: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  lock = run.then(
    () => {},
    () => {},
  );
  return run;
}

export function recordVisit(visit: Visit): Promise<void> {
  return withLock(async () => {
    const data = await readData();
    const now = new Date().toISOString();

    data.log.push({ ...visit, timestamp: now });

    const existing = data.perIp[visit.ip];
    data.perIp[visit.ip] = {
      count: (existing?.count ?? 0) + 1,
      firstSeen: existing?.firstSeen ?? now,
      lastSeen: now,
    };

    prune(data);
    await writeData(data);
  });
}

function pad(text: string, width: number): string {
  return text.length >= width ? text : text + ' '.repeat(width - text.length);
}

function tally(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function ranked(counts: Map<string, number>, limit: number): string {
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  if (!rows.length) return '  (none)\n';
  const width = Math.max(24, ...rows.map(([label]) => label.length + 2));
  return rows.map(([label, n]) => `  ${pad(label, width)}${n}\n`).join('');
}

function maskIp(ip: string): string {
  if (ip.includes(':')) return `${ip.split(':').slice(0, 2).join(':')}:xx`;
  const parts = ip.split('.');
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.x.x` : ip;
}

function dayKey(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: TZ }).format(new Date(iso));
}

function activityByDay(log: VisitEntry[]): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts = tally(log.map((v) => dayKey(v.timestamp)));
  const max = Math.max(1, ...days.map((d) => counts.get(d) ?? 0));

  return days
    .map((day) => {
      const n = counts.get(day) ?? 0;
      const bar = '#'.repeat(Math.round((n / max) * 20));
      return `  ${day}  ${pad(bar, 21)}${n}\n`;
    })
    .join('');
}

export function buildReport(data: MetricsData, from: Date, until: Date): string {
  const { log } = data;
  const periodStart = from.getTime();

  const views = log.length;
  const sessions = new Set(log.map((v) => v.session).filter(Boolean)).size;
  const visitorIps = [...new Set(log.map((v) => v.ip))];
  const visitors = visitorIps.length;

  const returning = visitorIps.filter((ip) => {
    const first = data.perIp[ip]?.firstSeen;
    return first !== undefined && new Date(first).getTime() < periodStart;
  }).length;

  const delta = data.previous
    ? (() => {
        const before = data.previous.views;
        if (!before) return `no baseline (${before} views)`;
        const pct = Math.round(((views - before) / before) * 100);
        return `${pct >= 0 ? '+' : ''}${pct}% (${before} views)`;
      })()
    : 'no previous week yet';

  const repeat = visitorIps
    .map((ip) => ({ ip, stats: data.perIp[ip], week: log.filter((v) => v.ip === ip).length }))
    .filter((r) => r.week > 1)
    .sort((a, b) => b.week - a.week)
    .slice(0, 10);

  const repeatRows = repeat.length
    ? repeat
        .map(
          (r) =>
            `  ${pad(maskIp(r.ip), 20)}${pad(`${r.week} views`, 12)}${pad(`${r.stats?.count ?? r.week} total`, 12)}last: ${dayKey(r.stats?.lastSeen ?? '')}\n`,
        )
        .join('')
    : '  (none)\n';

  return [
    `propstgonz.baronette.es - weekly visitor report`,
    `${from.toISOString().slice(0, 10)} to ${until.toISOString().slice(0, 10)}`,
    ``,
    `TOTALS`,
    `  ${pad('page views', 24)}${views}`,
    `  ${pad('sessions', 24)}${sessions}`,
    `  ${pad('unique visitors', 24)}${visitors}`,
    `  ${pad('new / returning', 24)}${visitors - returning} / ${returning}`,
    `  ${pad('vs last week', 24)}${delta}`,
    ``,
    `TOP PAGES`,
    ranked(tally(log.map((v) => v.path || '/')), 10).trimEnd(),
    ``,
    `ARRIVED FROM`,
    ranked(
      tally(log.filter((v) => v.referrer !== INTERNAL).map((v) => v.referrer || 'direct')),
      10,
    ).trimEnd(),
    ``,
    `BROWSER / OS`,
    ranked(tally(log.map((v) => `${v.browser} / ${v.os}`)), 10).trimEnd(),
    ``,
    `ACTIVITY BY DAY`,
    activityByDay(log).trimEnd(),
    ``,
    `REPEAT VISITORS`,
    repeatRows.trimEnd(),
    ``,
  ].join('\n');
}

async function sendWeeklyReport(data: MetricsData): Promise<void> {
  const to = env('METRICS_REPORT_TO');
  if (!to) throw new Error('METRICS_REPORT_TO is not set');

  const user = env('SMTP_USER');
  const transporter = nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT') ?? 587),
    secure: env('SMTP_SECURE') === 'true',
    auth: { user, pass: env('SMTP_PASS') },
  });

  await transporter.sendMail({
    from: user,
    to,
    subject: 'propstgonz.baronette.es - weekly visitor report',
    text: buildReport(data, new Date(data.lastReportAt), new Date()),
  });
}

async function checkAndMaybeSendReport(): Promise<void> {
  await withLock(async () => {
    const data = await readData();
    const elapsed = Date.now() - new Date(data.lastReportAt).getTime();
    if (elapsed < WEEK_MS) return;

    try {
      await sendWeeklyReport(data);
    } catch (err) {
      console.error('[metrics] failed to send weekly report', err);
      return;
    }

    data.previous = {
      views: data.log.length,
      visitors: new Set(data.log.map((v) => v.ip)).size,
    };
    data.log = [];
    data.lastReportAt = new Date().toISOString();
    await writeData(data);
  });
}

checkAndMaybeSendReport();
setInterval(checkAndMaybeSendReport, CHECK_INTERVAL_MS);
