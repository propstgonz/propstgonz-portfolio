import type { APIRoute } from 'astro';

const API = process.env.API_URL ?? 'http://localhost:3000';

// GET  /api/api       → list posts
// POST /api/api       → increment click counter  (body: { action: 'click' })
// GET  /api/api?count → get current click count

export const GET: APIRoute = async ({ url }) => {
  try {
    // ?count=true → proxy to counter endpoint
    if (url.searchParams.has('count')) {
      const res  = await fetch(`${API}/counter`);
      const data = res.ok ? await res.json() : { count: 0 };
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Default: list posts
    const res  = await fetch(`${API}/posts`);
    const data = res.ok ? await res.json() : [];
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({})) as { action?: string };

    if (body.action === 'click') {
      const res  = await fetch(`${API}/counter/click`, { method: 'POST' });
      const data = res.ok ? await res.json() : { count: 0 };
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
