import type { PostFrontmatter } from '../lib/frontmatter';

export interface PostMeta {
  id: string;
  url: string;
}

export interface PostSummary extends PostMeta {
  slug: string;
  title: string;
  description: string;
  pubDate?: string;
  image?: PostFrontmatter['image'];
}
