import type { APIRoute } from 'astro';

// Resolves the visitor's public IP from proxy headers — Traefik sets
// X-Forwarded-For by default. Also checks X-Real-IP and CF-Connecting-IP
// (in case Cloudflare or another edge proxy sits in front of Traefik),
// falling back to the raw socket address as a last resort. No
// third-party "what is my ip" service is called.
export const GET: APIRoute = async ({ request, clientAddress }) => {
  const candidates = [
    request.headers.get('cf-connecting-ip'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
  ];

  let ip = candidates.find((v): v is string => !!v);

  if (!ip) {
    try {
      ip = clientAddress;
    } catch {
      // clientAddress throws when not available (e.g. static context)
    }
  }

  return new Response(JSON.stringify({ ip: ip ?? 'unknown' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
