import type { Message } from './message.js';

export type MemoryType = {
  summary: string | null;
  messages: Message[];
};
