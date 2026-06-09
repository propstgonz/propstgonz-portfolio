import type { APIRoute } from 'astro';

const API = process.env.API_URL ?? 'http://localhost:3000';

// Pipes the backend SSE stream straight through to the browser.
export const GET: APIRoute = async ({ request }) => {
  try {
    const upstream = await fetch(`${API}/counter/stream`, {
      headers: { Accept: 'text/event-stream' },
      signal:  request.signal,
    });

    if (!upstream.ok) {
      return new Response('error', { status: 500 });
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type':      'text/event-stream',
        'Cache-Control':     'no-cache',
        'Connection':        'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch {
    return new Response('error', { status: 500 });
  }
};
