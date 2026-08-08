import type { PostMeta, PostSummary } from '../types/post';
import { parseFrontmatter, extractExcerpt } from './frontmatter';

// The real backend (propstgonz-portfolio-backend) wraps the posts array
// in { status, data, timestamp } — it is NOT a bare array. Support both
// shapes defensively, but the wrapped one is what actually gets sent.
interface BackendPostsResponse {
  status: 'success' | 'error';
  data: PostMeta[];
  timestamp: string;
}

// Astro loads .env into import.meta.env, NOT into process.env. In Docker the
// vars come from docker-compose's `environment:`, so they land in the real
// process.env — reading only one of the two works in exactly one of the two
// environments. Read import.meta.env first, fall back to process.env.
function env(key: string): string | undefined {
  const fromViteEnv = (import.meta.env as Record<string, string | undefined>)[key];
  if (fromViteEnv) return fromViteEnv;
  return typeof process !== 'undefined' ? process.env?.[key] : undefined;
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

// Origins allowed for fetching individual post content (SSRF guard).
// Always includes POSTS_API_ENDPOINT's own origin, plus anything listed
// in POSTS_CONTENT_ORIGINS (comma-separated) — needed because posts are
// stored as full URLs pointing at a *different* host than the API
// itself (the nginx "bucket" service, e.g. bucket.baronette.es).
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

// Fetches every post's own content to read its frontmatter (title, image,
// pubDate) and derive a short excerpt — used by /blog and /api/latest-posts
// so listings show the real title from the .md instead of one guessed from
// the URL slug. Fetched in parallel; a post whose content fails to load
// (unreachable bucket, disallowed origin, ...) is silently dropped rather
// than breaking the whole listing, consistent with getPosts()'s behavior.
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

  // Most recent first. A post with a missing/unparseable pubDate sorts as
  // if it were oldest, rather than throwing off the order of the rest.
  return valid.sort((a, b) => {
    const bTime = b.pubDate ? Date.parse(b.pubDate) : NaN;
    const aTime = a.pubDate ? Date.parse(a.pubDate) : NaN;
    return (Number.isNaN(bTime) ? -Infinity : bTime) - (Number.isNaN(aTime) ? -Infinity : aTime);
  });
}
