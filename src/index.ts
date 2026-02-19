import { extractPdfText } from '@/pdf/extractor.js';
import { getChunks } from '@/rag/chunker.js';
import { embedText } from '@/rag/embedder.js';
import type { EmbeddedText } from '@/types/embeddedChunk.js';
import type { IndexedChunk } from '@/types/indexedChunk.js';
import { Router } from './agent/router.js';

const text = await extractPdfText('./src/pdf/data/cv.pdf');
const chunks = getChunks(text);

const indexedChunks: IndexedChunk[] = [];

for (const chunk of chunks) {
  const embededText: EmbeddedText = await embedText(chunk);
  const indexedChunk: IndexedChunk = {
    text: chunk,
    embedding: embededText,
  };
  indexedChunks.push(indexedChunk);
}

const router = new Router();

const routerResult = await router.getQuestionScore(
  '¿En qué tecnologías tengo experiencia?',
  indexedChunks,
  text,
);
console.log('routerResult: ', routerResult);
const routerResult2 = await router.getQuestionScore('¿Qué es React?', indexedChunks, text);
console.log('routerResult2: ', routerResult2);
const routerResult3 = await router.getQuestionScore(
  '¿Cómo es el clima en buenos aires?',
  indexedChunks,
  text,
);
console.log('routerResult3: ', routerResult3);
const routerResult4 = await router.getQuestionScore('¿Cuanto es 9 + 9?', indexedChunks, text);
console.log('routerResult4: ', routerResult4);
const routerResult5 = await router.getQuestionScore(
  '¿Trabajó con angular y desarrollando api rest?',
  indexedChunks,
  text,
);
console.log('routerResult5: ', routerResult5);
