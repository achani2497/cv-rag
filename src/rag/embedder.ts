import { postFetch } from '@/shared/axiosWrapper/invoker.js';
import type { EmbeddedText } from '@/types/embeddedChunk.js';

export async function embedText(text: string): Promise<EmbeddedText> {
  const data = await postFetch<{ embedding: number[] }>(`${process.env.MODEL_URL!}/embeddings`, {
    model: 'nomic-embed-text',
    prompt: text,
  });

  return data.embedding;
}
