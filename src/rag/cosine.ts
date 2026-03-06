import { env } from '@/config/env.js';
import type { IndexedChunk } from '@/types/indexedChunk.js';

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Los vectores deben tener la misma dimensión: El primer vector es de dimension ${a.length} y el segundo de dimension ${b.length}`,
    );
  }
  const denominator = magnitude(a) * magnitude(b);
  if (denominator === 0) {
    return 0;
  }
  return dotProduct(a, b) / denominator;
}

export function getTopKSimilarities(query: number[], chunks: IndexedChunk[]) {
  let similarities: { chunk: IndexedChunk; similarity: number }[] = [];
  for (const chunk of chunks) {
    similarities.push({
      chunk,
      similarity: cosineSimilarity(query, chunk.embedding),
    });
  }

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, env.TOP_K)
    .map((similarity) => ({
      text: similarity.chunk.text,
      score: similarity.similarity,
    }));
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((acc, ai, i) => acc + ai * b[i]!, 0);
}

function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((acc, ai) => acc + ai * ai, 0));
}
