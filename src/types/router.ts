import type { Route } from './route.js';

export type RouterData = {
  decision: Route;
  metadata: { topKSimilarities: string[]; maxSimilarity: number; entityMatch: boolean };
};
