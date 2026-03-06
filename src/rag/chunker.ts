import { embedText } from '@/rag/embedder.js';
import type { EmbeddedText } from '@/types/embeddedChunk.js';
import type { IndexedChunk } from '@/types/indexedChunk.js';
import { env } from '@/config/env.js';
import { Tiktoken } from 'js-tiktoken';
import cl100k_base from 'js-tiktoken/ranks/cl100k_base';

export class Chunker {
  private encoder: Tiktoken;

  constructor() {
    this.encoder = new Tiktoken(cl100k_base);
  }

  public tokenizeText(text: string): number[] {
    return this.encoder.encode(text);
  }

  public detokenizeText(tokens: number[]): string {
    return this.encoder.decode(tokens);
  }

  public getTotalTokens(text: string): number {
    return this.tokenizeText(text).length;
  }

  private getChunks(text: string): string[] {
    const tokens = this.tokenizeText(text);
    const totalTokens = tokens.length;

    const chunks = [];
    let chunkPivot = 0;
    while (chunkPivot < totalTokens) {
      const chunk = tokens.slice(chunkPivot, chunkPivot + env.CHUNK_SIZE);
      chunks.push(this.encoder.decode(chunk));
      chunkPivot += env.CHUNK_SIZE - env.CHUNK_OVERLAP;
    }

    return chunks;
  }

  public async getIndexedChunks(textToChunk: string): Promise<IndexedChunk[]> {
    const chunks = this.getChunks(textToChunk);

    const indexedChunks: IndexedChunk[] = [];

    for (const chunk of chunks) {
      const embededText: EmbeddedText = await embedText(chunk);
      const indexedChunk: IndexedChunk = {
        text: chunk,
        embedding: embededText,
      };
      indexedChunks.push(indexedChunk);
    }

    return indexedChunks;
  }
}
