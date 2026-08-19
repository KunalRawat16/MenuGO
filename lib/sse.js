import { EventEmitter } from 'events';

/**
 * Global SSE event emitter for real-time order broadcasting.
 *
 * Pattern: Server-Sent Events (one-directional: server → client)
 * Room key: `order:{restaurantSlug}`
 *
 * Why global singleton?
 * Next.js hot-reloads modules in dev, creating duplicate emitters.
 * Attaching to `global` prevents multiple instances.
 *
 * Production scaling note:
 * For multi-instance deployments (multiple Node processes), replace
 * this with a Redis pub/sub adapter (e.g., ioredis).
 */
global.menugoOrderEmitter = global.menugoOrderEmitter || new EventEmitter();

// Increase listener limit per room (1 listener per open dashboard tab)
global.menugoOrderEmitter.setMaxListeners(200);

export const orderEmitter = global.menugoOrderEmitter;
