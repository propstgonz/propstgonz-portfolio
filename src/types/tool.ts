import type { ImageMetadata } from 'astro';

export interface Tool {
  name: string;
  icon: ImageMetadata;
  href?: string;
}
