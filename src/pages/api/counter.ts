import type { APIRoute } from 'astro';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

// Self-contained counter: persists to a JSON file instead of depending
// on an external counter microservice, so the count is one shared
// number for every visitor. In production the path is a bind-mounted
// host directory (see docker-compose.yml's `volumes:` and COUNTER_FILE)
// so the count survives container rebuilds/redeploys.
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

// Serializes the read-modify-write cycle so two clicks arriving close
// together can't both read the same starting count and silently lose
// one of the increments. Only guards against races within this one
// Node process, which is all this deployment ever runs.
let lock: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  lock = run.then(() => {}, () => {});
  return run;
}

export const GET: APIRoute = async () => {
  const count = await readCount();
  return new Response(JSON.stringify({ count }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async () => {
  const count = await withLock(async () => {
    const next = (await readCount()) + 1;
    await writeCount(next);
    return next;
  });
  return new Response(JSON.stringify({ count }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
