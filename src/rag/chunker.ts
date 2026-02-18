import { config as loadEnv } from 'dotenv';
import { Tiktoken } from 'js-tiktoken';
import cl100k_base from 'js-tiktoken/ranks/cl100k_base';

loadEnv();

export function getChunks(text: string): string[] {
  const encoder = new Tiktoken(cl100k_base);

  const tokens = encoder.encode(text);
  const totalTokens = tokens.length;

  const chunks = [];
  let chunkPivot = 0;
  while (chunkPivot < totalTokens) {
    const chunk = tokens.slice(chunkPivot, chunkPivot + Number(process.env.CHUNK_SIZE));
    chunks.push(encoder.decode(chunk));
    chunkPivot += Number(process.env.CHUNK_SIZE) - Number(process.env.CHUNK_OVERLAP);
  }

  return chunks;
}
