import type { APIRoute } from 'astro';
import { resolveClientIp } from '../../lib/ip';
import { recordVisit } from '../../lib/metrics';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = resolveClientIp({ request, clientAddress });
  await recordVisit(ip);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
