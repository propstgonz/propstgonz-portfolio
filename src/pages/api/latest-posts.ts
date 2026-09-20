import type { APIRoute } from 'astro';
import { getPostSummaries } from '../../lib/api';

export const GET: APIRoute = async () => {
  try {
    const posts = await getPostSummaries();
    const latest = posts.slice(0, 3).map((p) => ({
      title: p.title,
      slug: p.slug,
    }));
    return new Response(JSON.stringify({ posts: latest }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ posts: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
