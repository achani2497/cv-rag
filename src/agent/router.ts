import { embedText } from '@/rag/embedder.js';
import type { IndexedChunk } from '@/types/indexedChunk.js';
import type { Route } from '@/types/route.js';
import { cleanStopWords } from '@/utils/cleanStopWords.js';
import { cleanText } from '@/utils/cleanText.js';
import { getTopKSimilarities } from '../rag/cosine.js';

function sintaxSimilarityScore(query: string[], text: string[]): number {
  const commonWords = query.filter((word) => text.includes(word));
  return commonWords.length / query.length;
}

function decision(syntaxScore: number, maxSimilarity: number): Route {
  if (syntaxScore === 0 && maxSimilarity < 0.55) {
    return 'LOW';
  } else if (maxSimilarity >= 0.62) {
    return 'HIGH';
  } else if (syntaxScore > 0.6 && maxSimilarity >= 0.55) {
    return 'HIGH';
  } else {
    return 'MEDIUM';
  }
}

export async function route(
  query: string,
  indexedChunks: IndexedChunk[],
  originalText: string,
): Promise<Route> {
  const normalizedQuery = cleanText(query);
  const embeddedQuery = await embedText(normalizedQuery);
  const similarities = getTopKSimilarities(embeddedQuery, indexedChunks);
  const maxSimilarity = similarities[0]?.score ?? 0;

  const cleanQuery = cleanStopWords(normalizedQuery);
  const originalTextNormalized = cleanStopWords(cleanText(originalText));
  const syntaxScore = sintaxSimilarityScore(cleanQuery, originalTextNormalized);

  console.log(query);
  console.log('syntaxScore: ', syntaxScore);
  console.log('maxSimilarity: ', maxSimilarity);
  return decision(syntaxScore, maxSimilarity);
}
