import type { EmbeddedText } from '@/types/embeddedChunk.js';
import axios from 'axios';

export async function embedText(text: string): Promise<EmbeddedText> {
  return axios
    .post(`${process.env.EMBEDDER_URL}`, {
      model: 'nomic-embed-text',
      prompt: text,
    })
    .then((res) => res.data.embedding);
}
