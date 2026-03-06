import ora, { type Ora } from 'ora';

export class Spinner {
  private spinner: Ora;

  constructor(prefix: string) {
    this.spinner = ora({
      text: `${prefix} 💭 Pensando...`,
      spinner: 'dots',
    });
  }

  start() {
    this.spinner.start();
  }

  searching() {
    this.spinner.text = '🔎 Buscando información relevante...';
  }

  reasoning() {
    this.spinner.text = '🧠 Conectando ideas...';
  }

  generating() {
    this.spinner.text = '✍️ Generando respuesta...';
  }

  stop() {
    this.spinner.stop();
  }

  succeed() {
    this.spinner.succeed();
  }

  fail() {
    this.spinner.fail();
  }
}
