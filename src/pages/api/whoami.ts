import type { APIRoute } from 'astro';
import { resolveClientIp } from '../../lib/ip';

// No third-party "what is my ip" service is called — see resolveClientIp
// in src/lib/ip.ts for how the address is worked out from proxy headers.
export const GET: APIRoute = async ({ request, clientAddress }) => {
  const ip = resolveClientIp({ request, clientAddress });
  return new Response(JSON.stringify({ ip }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
