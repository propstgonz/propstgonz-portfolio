import type { PostMeta } from '../types/post';

function isPostMeta(value: unknown): value is PostMeta {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.url === 'string';
}

export async function getPosts(): Promise<PostMeta[]> {
  const endpoint = process.env.POSTS_API_ENDPOINT;
  if (!endpoint) return [];

  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];

    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];

    return data.filter(isPostMeta);
  } catch {
    return [];
  }
}

export async function getPostContent(url: string): Promise<string> {
  const endpoint = process.env.POSTS_API_ENDPOINT;

  // Only fetch URLs that point at the configured posts origin, so a
  // malformed/malicious entry from the endpoint can't be used to make
  // the server request arbitrary internal or external resources.
  if (endpoint) {
    try {
      const allowedOrigin = new URL(endpoint).origin;
      const targetOrigin = new URL(url).origin;
      if (targetOrigin !== allowedOrigin) {
        throw new Error('Post URL origin not allowed');
      }
    } catch {
      throw new Error('Invalid post URL');
    }
  }

  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
  return res.text();
}

export function slugFromUrl(url: string): string {
  const seg = url.split('/').pop() ?? url;
  return seg.replace(/\.md$/, '');
}
