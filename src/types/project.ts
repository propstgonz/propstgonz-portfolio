export interface Project {
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  repo?: string;
  extraRepo?: string;
  live?: string;
}
