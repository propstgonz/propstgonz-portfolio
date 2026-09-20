import type { APIRoute } from 'astro';
import { resolveClientIp } from '../../lib/ip';

export const GET: APIRoute = ({ request, clientAddress }) => {
  const ip = resolveClientIp({ request, clientAddress });
  return new Response(JSON.stringify({ ip }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
