import { POSTS_API_ENDPOINT } from 'astro:env/server';

type Post = {
  id: string;
  url: string;
};

const CACHE_KEY = 'posts:data';
const CACHE_TTL = 3600000; // 1 hour in ms

function getCachedPosts(): Post[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, expiresAt } = JSON.parse(cached);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedPosts(posts: Post[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data: posts,
        expiresAt: Date.now() + CACHE_TTL,
      })
    );
  } catch {
    // Storage error, continue without caching
  }
}

export async function fetchPosts(): Promise<{
  posts: Post[];
  hasError: boolean;
}> {
  try {
    const cachedPosts = getCachedPosts();
    if (cachedPosts) {
      return { posts: cachedPosts, hasError: false };
    }

    const response = await fetch(POSTS_API_ENDPOINT);

    if (!response.ok) {
      return { posts: [], hasError: true };
    }

    const responseData = (await response.json()) as {
      status: string;
      data: Post[];
    };
    const posts = responseData.data || [];

    setCachedPosts(posts);

    return { posts, hasError: false };
  } catch (err) {
    return { posts: [], hasError: true };
  }
}
