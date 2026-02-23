import type { Memory } from '@/memory/memory.js';
import { embedText } from '@/rag/embedder.js';
import type { IndexedChunk } from '@/types/indexedChunk.js';
import type { Route } from '@/types/route.js';
import type { RouterData } from '@/types/router.js';
import { cleanStopWords } from '@/utils/cleanStopWords.js';
import { cleanText } from '@/utils/cleanText.js';
import { getTopKSimilarities } from '../rag/cosine.js';

export class Router {
  private memory: Memory;
  constructor(memory: Memory) {
    this.memory = memory;
  }

  public async getQuestionScore(
    query: string,
    indexedChunks: IndexedChunk[],
    originalText: string,
  ): Promise<RouterData> {
    const normalizedQuery = cleanText(query);
    const embeddedQuery = await embedText(normalizedQuery);
    const similarities = getTopKSimilarities(embeddedQuery, indexedChunks);
    const maxSimilarity = similarities[0]?.score ?? 0;

    const cleanQuery = cleanStopWords(normalizedQuery);
    const originalTextNormalized = cleanStopWords(cleanText(originalText));
    const syntaxScore = this.sintaxSimilarityScore(cleanQuery, originalTextNormalized);

    const entityMatch = cleanQuery.some((token) => originalTextNormalized.includes(token));
    const decision = this.decision(syntaxScore, maxSimilarity, entityMatch);
    const topKSimilarities = similarities.map((similarity) => similarity.text);

    const isFollowUp = this.isFollowUp(normalizedQuery, maxSimilarity, entityMatch);

    if (isFollowUp) {
      return { decision: 'HIGH', metadata: { topKSimilarities, maxSimilarity, entityMatch } };
    }

    return { decision, metadata: { topKSimilarities, maxSimilarity, entityMatch } };
  }

  private sintaxSimilarityScore(query: string[], text: string[]): number {
    const commonWords = query.filter((word) => text.includes(word));
    return commonWords.length / query.length;
  }

  private decision(syntaxScore: number, maxSimilarity: number, entityMatch: boolean): Route {
    if (entityMatch && maxSimilarity >= 0.55) {
      return 'HIGH';
    } else if (syntaxScore <= 0.1 && maxSimilarity < 0.55) {
      return 'LOW';
    } else if (maxSimilarity >= 0.62) {
      return 'HIGH';
    } else if (syntaxScore > 0.6 && maxSimilarity >= 0.55) {
      return 'HIGH';
    } else {
      return 'MEDIUM';
    }
  }

  private isFollowUp(message: string, maxSimilarity: number, entityMatch: boolean): boolean {
    return (
      this.memory.lastAssistantMessageWasQuestion() &&
      this.memory.messageIsAmbiguous(message, maxSimilarity, entityMatch)
    );
  }
}
