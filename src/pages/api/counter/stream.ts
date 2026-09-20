import type { APIRoute } from 'astro';
import { counterEvents } from '../../../lib/counterEvents';

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
