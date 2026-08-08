import { EventEmitter } from 'node:events';

// Shared in-process pub/sub: every open /api/counter/stream connection
// subscribes here, so the moment any client's POST writes a new count,
// every other open tab hears about it immediately — no polling, no
// external broker, just callbacks held by this one Node process.
export const counterEvents = new EventEmitter();
counterEvents.setMaxListeners(0);
