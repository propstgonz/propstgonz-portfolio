
export interface PostFrontmatter {
  title?: string;
  pubDate?: string;
  author?: string;
  description?: string;
  image?: { url: string; alt: string };
}

function stripQuotes(value: string): string {
  const singleQuoted = value.match(/^'([^']*)'$/);
  if (singleQuoted) return singleQuoted[1];
  const doubleQuoted = value.match(/^"([^"]*)"$/);
  if (doubleQuoted) return doubleQuoted[1];
  return value;
}

export function parseFrontmatter(raw: string): { data: PostFrontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const [, block, body] = match;
  const data: PostFrontmatter = {};
  let inImage = false;

  for (const line of block.split(/\r?\n/)) {
    if (/^image:\s*$/.test(line)) {
      inImage = true;
      continue;
    }

    const nested = inImage ? line.match(/^\s+(\w+):\s*(.*)$/) : null;
    if (nested) {
      const [, key, value] = nested;
      const clean = stripQuotes(value.trim());
      if (key === 'url') data.image = { url: clean, alt: data.image?.alt ?? '' };
      else if (key === 'alt') data.image = { url: data.image?.url ?? '', alt: clean };
      continue;
    }

    inImage = false;
    const top = line.match(/^(\w+):\s*(.*)$/);
    if (!top) continue;
    const [, key, value] = top;
    const clean = stripQuotes(value.trim());
    if (key === 'title') data.title = clean;
    else if (key === 'pubDate') data.pubDate = clean;
    else if (key === 'author') data.author = clean;
    else if (key === 'description') data.description = clean;
  }

  return { data, body };
}

export function extractExcerpt(body: string, maxLen = 160): string {
  const text = body
    .replace(/\r\n/g, '\n')
    .replace(/<\/?h[1-6]>/gi, ' ')
    .replace(/<a\b[^>]*>/gi, ' ')
    .replace(/<\/a>/gi, ' ')
    .split('\n')
    .map((line) =>
      line
        .replace(/^#{1,6}\s+/, '')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<img\b[^>]*>/gi, '')
        .replace(/[*_`]/g, '')
        .trim()
    )
    .filter(Boolean)
    .join(' ')
    .trim();

  if (text.length <= maxLen) return text;

  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
