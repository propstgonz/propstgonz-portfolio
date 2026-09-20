import type { APIRoute } from 'astro';
import { resolveClientIp } from '../../lib/ip';
import { recordVisit, parseUserAgent, referrerHost } from '../../lib/metrics';

const MAX_PATH = 200;
const MAX_SESSION = 64;
const MAX_REFERRER = 500;

function str(value: unknown, max: number): string {
  return typeof value === 'string' && value.length <= max ? value : '';
}

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  const ok = new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ok;
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const rawPath = str(payload.path, MAX_PATH);
  const session = str(payload.session, MAX_SESSION).replace(/[^\w-]/g, '');
  const { browser, os } = parseUserAgent(request.headers.get('user-agent') ?? '');

  await recordVisit({
    ip: resolveClientIp({ request, clientAddress }),
    session,
    path: rawPath.startsWith('/') ? rawPath : '/',
    referrer: referrerHost(str(payload.referrer, MAX_REFERRER), url.host),
    browser,
    os,
  });

  return ok;
};
