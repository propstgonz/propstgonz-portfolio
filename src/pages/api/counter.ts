import type { APIRoute } from 'astro';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

// Self-contained counter: persists to a local JSON file instead of
// depending on an external counter microservice. Good enough for a
// personal-site click counter running on a single Node instance.
const DATA_PATH = process.env.COUNTER_FILE ?? '/tmp/propstgonz-counter.json';

async function readCount(): Promise<number> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as { count?: number };
    return typeof parsed.count === 'number' ? parsed.count : 0;
  } catch {
    return 0;
  }
}

async function writeCount(count: number): Promise<void> {
  await mkdir(dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify({ count }), 'utf-8');
}

export const GET: APIRoute = async () => {
  const count = await readCount();
  return new Response(JSON.stringify({ count }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async () => {
  const count = (await readCount()) + 1;
  await writeCount(count);
  return new Response(JSON.stringify({ count }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
