import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import nodemailer from 'nodemailer';

// Only ever written to from /api/track, which is only ever called after
// the visitor accepts the consent banner (ConsentBanner.astro) — nothing
// here is reachable without that opt-in.
const DATA_PATH = process.env.METRICS_FILE ?? '/tmp/propstgonz-metrics.json';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly

interface VisitEntry {
  ip: string;
  timestamp: string;
}

interface PerIpStats {
  count: number;
  lastSeen: string;
}

interface MetricsData {
  // Visits since the last weekly report — cleared once that report is
  // actually sent, so it always reflects "this week so far."
  log: VisitEntry[];
  // Lifetime count per IP, never cleared — this is "the number of times
  // each IP visited" as its own running tally, independent of the
  // weekly reporting cycle.
  perIp: Record<string, PerIpStats>;
  lastReportAt: string;
}

function emptyData(): MetricsData {
  return { log: [], perIp: {}, lastReportAt: new Date().toISOString() };
}

async function readData(): Promise<MetricsData> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<MetricsData>;
    return {
      log: Array.isArray(parsed.log) ? parsed.log : [],
      perIp: parsed.perIp && typeof parsed.perIp === 'object' ? parsed.perIp : {},
      lastReportAt: typeof parsed.lastReportAt === 'string' ? parsed.lastReportAt : new Date().toISOString(),
    };
  } catch {
    return emptyData();
  }
}

async function writeData(data: MetricsData): Promise<void> {
  await mkdir(dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(data), 'utf-8');
}

// Serializes every read-modify-write cycle — a visit being recorded and
// the weekly reset both touch the same file, and must not interleave.
let lock: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  lock = run.then(() => {}, () => {});
  return run;
}

export function recordVisit(ip: string): Promise<void> {
  return withLock(async () => {
    const data = await readData();
    const now = new Date().toISOString();

    data.log.push({ ip, timestamp: now });

    const existing = data.perIp[ip];
    data.perIp[ip] = { count: (existing?.count ?? 0) + 1, lastSeen: now };

    await writeData(data);
  });
}

async function sendWeeklyReport(data: MetricsData): Promise<void> {
  const to = process.env.METRICS_REPORT_TO;
  if (!to) throw new Error('METRICS_REPORT_TO is not set');

  const uniqueVisitors = new Set(data.log.map((v) => v.ip)).size;
  const totalVisits = data.log.length;
  const from = new Date(data.lastReportAt);
  const until = new Date();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'propstgonz.baronette.es — weekly visitor report',
    text:
      `Visitor report: ${from.toISOString().slice(0, 10)} to ${until.toISOString().slice(0, 10)}\n\n` +
      `Unique visitors: ${uniqueVisitors}\n` +
      `Total visits: ${totalVisits}\n`,
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
      // Deliberately does NOT clear the log or advance lastReportAt on
      // failure (missing METRICS_REPORT_TO, SMTP hiccup, etc.) — the
      // next hourly check retries with the same accumulated data
      // instead of silently losing a week's numbers.
      console.error('[metrics] failed to send weekly report', err);
      return;
    }

    data.log = [];
    data.lastReportAt = new Date().toISOString();
    await writeData(data);
  });
}

// Starts once when this module first loads — Astro's Node adapter loads
// every route module to build its routing manifest at server startup,
// so this runs for the lifetime of the process without any external
// cron or extra container. Checking hourly against a persisted
// lastReportAt (rather than a single long setTimeout) means a container
// restart between checks just picks the countdown back up instead of
// losing it.
checkAndMaybeSendReport();
setInterval(checkAndMaybeSendReport, CHECK_INTERVAL_MS);
