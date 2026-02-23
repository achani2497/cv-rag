import { extractPdfText } from '@/pdf/extractor.js';
import { Chunker } from '@/rag/chunker.js';
import { Agent } from './agent/agent.js';

// Initialize components
const chunker = new Chunker();

const text = await extractPdfText('./src/pdf/data/cv.pdf');
const indexedChunks = await chunker.getIndexedChunks(text);

const agent = new Agent(text, indexedChunks);

const questions = [
  '¿Qué es react?',
  'Si! quiero saber un poco mas, quiero mucho detalle por favor',
  '¿Cómo es el clima en buenos aires?',
  '¿Cuanto es 9 + 9?',
  'ok dale',
  '¿Trabajó con angular y desarrollando api rest?',
];

for (const question of questions) {
  console.log('User >', question);
  await agent.handleQuery(question);
}
