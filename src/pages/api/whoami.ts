import type { APIRoute } from 'astro';

// Resolves the visitor's IP from the request itself (via the standard
// X-Forwarded-For header set by Traefik/nginx in front of the Node
// adapter), so we don't depend on any third-party "what is my ip" service.
export const GET: APIRoute = async ({ request, clientAddress }) => {
  let ip = 'unknown';

  try {
    ip = clientAddress ?? 'unknown';
  } catch {
    // clientAddress throws when not available (e.g. static/prerendered context)
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  }

  return new Response(JSON.stringify({ ip }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
