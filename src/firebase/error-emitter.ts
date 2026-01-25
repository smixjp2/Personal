import { EventEmitter } from 'events';

// This is a global event emitter for handling specific errors app-wide.
export const errorEmitter = new EventEmitter();
