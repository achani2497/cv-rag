import { extractPdfText } from '@/pdf/extractor.js';
import { getChunks } from '@/rag/chunker.js';
import { embedText } from '@/rag/embedder.js';
import type { EmbeddedText } from '@/types/embeddedChunk.js';
import type { IndexedChunk } from '@/types/indexedChunk.js';
import { route } from './agent/router.js';

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

const routerResult = await route('¿En qué tecnologías tengo experiencia?', indexedChunks, text);
console.log('routerResult: ', routerResult);
const routerResult2 = await route('¿Qué es React?', indexedChunks, text);
console.log('routerResult2: ', routerResult2);
const routerResult3 = await route('¿Cómo es el clima en buenos aires?', indexedChunks, text);
console.log('routerResult3: ', routerResult3);
const routerResult4 = await route('¿Cuanto es 9 + 9?', indexedChunks, text);
console.log('routerResult4: ', routerResult4);
const routerResult5 = await route(
  '¿Trabajó con angular y desarrollando api rest?',
  indexedChunks,
  text,
);
console.log('routerResult5: ', routerResult5);
// const query = await embedText(cleanQuery);
// console.log(getTopKSimilarities(query, indexedChunks));
// const query2 = await embedText('¿Qué es React?');
// console.log(getTopKSimilarities(query2, indexedChunks));
// const query3 = await embedText('¿Cómo es el clima en buenos aires');
// console.log(getTopKSimilarities(query3, indexedChunks));
// const query4 = await embedText('¿Cuanto es 9 + 9?');
// console.log(getTopKSimilarities(query4, indexedChunks));
// const query5 = await embedText('¿Trabajó con angular y desarrollando api rest?');
// console.log(getTopKSimilarities(query5, indexedChunks));
