import type { APIRoute } from 'astro';
import { counterEvents } from '../../../lib/counterEvents';

// Server-Sent Events: pushes the new count to every open tab the moment
// anyone's click writes it (via /api/counter's POST handler), instead of
// each client polling on a timer. Traefik's `no-buffer` middleware
// (docker-compose.yml) exists specifically so this streams in real time
// instead of sitting in a proxy buffer.
export const GET: APIRoute = async ({ request }) => {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (count: number) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ count })}\n\n`));
        } catch {
          counterEvents.off('count', send);
        }
      };

      counterEvents.on('count', send);

      // Keeps the connection alive through proxies that close idle
      // connections after a timeout — Traefik included.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        counterEvents.off('count', send);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
};
