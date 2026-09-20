import type { PostMeta, PostSummary } from '../types/post';
import { parseFrontmatter, extractExcerpt } from './frontmatter';

interface BackendPostsResponse {
  status: 'success' | 'error';
  data: PostMeta[];
  timestamp: string;
}

export function env(key: string): string | undefined {
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  if (fromProcess) return fromProcess;
  return (import.meta.env as Record<string, string | undefined>)[key];
}

function isPostMeta(value: unknown): value is PostMeta {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.url === 'string';
}

export async function getPosts(): Promise<PostMeta[]> {
  const endpoint = env('POSTS_API_ENDPOINT');
  if (!endpoint) return [];

  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];

    const body: unknown = await res.json();

    const list = Array.isArray(body)
      ? body
      : Array.isArray((body as Partial<BackendPostsResponse> | null)?.data)
        ? (body as BackendPostsResponse).data
        : null;

    if (!list) return [];
    return list.filter(isPostMeta);
  } catch {
    return [];
  }
}

function getAllowedContentOrigins(): string[] {
  const configured = (env('POSTS_CONTENT_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const endpoint = env('POSTS_API_ENDPOINT');
  let endpointOrigin: string | null = null;
  if (endpoint) {
    try {
      endpointOrigin = new URL(endpoint).origin;
    } catch {
      endpointOrigin = null;
    }
  }

  return [...new Set([...configured, ...(endpointOrigin ? [endpointOrigin] : [])])];
}

export async function getPostContent(url: string): Promise<string> {
  const allowedOrigins = getAllowedContentOrigins();

  if (allowedOrigins.length > 0) {
    let targetOrigin: string;
    try {
      targetOrigin = new URL(url).origin;
    } catch {
      throw new Error('Invalid post URL');
    }
    if (!allowedOrigins.includes(targetOrigin)) {
      throw new Error('Post URL origin not allowed');
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

export async function getPostSummaries(): Promise<PostSummary[]> {
  const posts = await getPosts();

  const summaries = await Promise.all(
    posts.map(async (post): Promise<PostSummary | null> => {
      try {
        const raw = await getPostContent(post.url);
        const { data, body } = parseFrontmatter(raw);
        const slug = slugFromUrl(post.url);
        return {
          ...post,
          slug,
          title: data.title ?? slug.replace(/-/g, ' '),
          description: data.description ?? extractExcerpt(body),
          pubDate: data.pubDate,
          image: data.image,
        };
      } catch {
        return null;
      }
    })
  );

  const valid = summaries.filter((s): s is PostSummary => s !== null);

  return valid.sort((a, b) => {
    const bTime = b.pubDate ? Date.parse(b.pubDate) : NaN;
    const aTime = a.pubDate ? Date.parse(a.pubDate) : NaN;
    return (Number.isNaN(bTime) ? -Infinity : bTime) - (Number.isNaN(aTime) ? -Infinity : aTime);
  });
}
