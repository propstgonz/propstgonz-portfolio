export async function getPosts(): Promise<{ id: string; url: string }[]> {
  const endpoint = process.env.POSTS_API_ENDPOINT;
  if (!endpoint) return [];

  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // Silently fail if endpoint is unreachable
    return [];
  }
}

export async function getPostContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
    return res.text();
  } catch (err) {
    throw new Error(`Post not found`);
  }
}

export async function getCounter(): Promise<number> {
  const API = process.env.API_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${API}/counter`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}
