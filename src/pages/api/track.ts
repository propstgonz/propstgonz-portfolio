import type { APIRoute } from 'astro';
import { resolveClientIp } from '../../lib/ip';
import { recordVisit } from '../../lib/metrics';

// Only ever called from ConsentBanner.astro, and only after the visitor
// explicitly accepts data collection — declining means this route is
// simply never hit, so no IP is ever resolved or stored for that visit.
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = resolveClientIp({ request, clientAddress });
  await recordVisit(ip);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
