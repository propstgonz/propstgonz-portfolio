import { EventEmitter } from 'node:events';

export const counterEvents = new EventEmitter();
counterEvents.setMaxListeners(0);
