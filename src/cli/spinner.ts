import ora, { type Ora } from 'ora';

export class Spinner {
  private spinner: Ora;

  constructor(prefix: string) {
    this.spinner = ora({
      text: `${prefix} 💭 Pensando...`,
      spinner: 'dots',
    });
  }

  setText(text: string) {
    this.spinner.text = text;
  }

  start() {
    this.spinner.start();
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
