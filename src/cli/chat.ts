import { Agent } from '@/agent/agent.js';
import { Extractor } from '@/information/extractor.js';
import { Chunker } from '@/rag/chunker.js';
import chalk from 'chalk';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import { Spinner } from './spinner.js';

export class Chat {
  public async start() {
    // Inicialización
    const chunker = new Chunker();
    const extractor = new Extractor();
    let isRunning = true;

    // Extraction of the text that will be used as context for the model
    const knowledgeFiles = ['cv.pdf', 'complement.txt'];
    const knowledgeBase = await Promise.all(
      knowledgeFiles.map(async (fileName) => extractor.extractText(fileName)),
    );
    const text = knowledgeBase.join(' ');

    // Chunking of the text
    const indexedChunks = await chunker.getIndexedChunks(text);

    // Creation of the agent
    let agent = new Agent(text, indexedChunks);

    // Creation of the readline interface
    const rl = readline.createInterface({ input, output });

    process.on('SIGINT', () => {
      console.log('\nSaliendo...');
      isRunning = false;
      rl.close();
    });

    const userPrefix = chalk.greenBright('› ');
    const mooniePrefix = chalk.magentaBright('◉ ');
    const systemText = chalk.magentaBright;
    const errorText = chalk.redBright;

    const spinner = new Spinner(mooniePrefix);

    console.log(
      systemText(
        '\n◉ Hola! Soy Moonie, la asistente personal profesional de Ale, podes preguntarme lo que quieras sobre su experiencia profesional y laboral!',
      ),
    );
    console.log(systemText('Escribí /exit para salir o /reset para reiniciar la conversación.\n'));

    while (isRunning) {
      try {
        const userInput = await rl.question(userPrefix);

        const trimmed = userInput.trim();

        if (!trimmed) continue;

        if (trimmed === '/exit') {
          console.log(systemText('\nSaliendo...\n'));
          break;
        }

        if (trimmed === '/reset') {
          agent = new Agent(text, indexedChunks);
          console.log(systemText('\nMemoria reiniciada.\n'));
          continue;
        }

        spinner.start();
        const response = await agent.handleQuery(trimmed, (text) => spinner.setText(text));
        spinner.stop();
        console.log(mooniePrefix + response?.message?.content + '\n');
      } catch (err: any) {
        if (err?.code === 'ABORT_ERR') {
          console.log('\nSaliendo...');
          break;
        }

        if (err?.code === 'ERR_USE_AFTER_CLOSE') {
          break;
        }

        console.log(errorText('Ocurrió un error inesperado.\n'));
        console.error(err);
      }
    }

    rl.close();
    process.exit(0);
  }
}
