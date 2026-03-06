import { Router } from '@/agent/router.js';
import { env } from '@/config/env.js';
import { Memory } from '@/memory/memory.js';
import { postFetch } from '@/shared/axiosWrapper/invoker.js';
import type { IndexedChunk } from '@/types/indexedChunk.js';
import type { Message } from '@/types/message.js';
import type { Route } from '@/types/route.js';
import { highAnswerPrompt, mediumAnswerPrompt } from '@/utils/prompts.js';
export class Agent {
  private memory: Memory;
  private router: Router;
  private indexedChunks: IndexedChunk[] = [];
  private originalText: string;

  constructor(originalText: string, originalTextIndexedChunks: IndexedChunk[]) {
    this.memory = new Memory();
    this.router = new Router(this.memory);
    this.indexedChunks = originalTextIndexedChunks;
    this.originalText = originalText;
  }

  public async handleQuery(message: string): Promise<{ message: { content: string } }> {
    const { decision: questionScore, metadata } = await this.router.getQuestionScore(
      message,
      this.indexedChunks,
      this.originalText,
    );

    let response: any = '';
    if (questionScore === 'LOW') {
      response = {
        message: { content: 'Esa consulta está fuera de mi alcance de conocimiento.' },
      };
    } else {
      const prompt = this.getPrompt(questionScore, message, metadata.topKSimilarities);

      response = await postFetch<any>(`${env.MODEL_URL}/chat`, {
        model: env.MODEL_NAME,
        messages: prompt,
        stream: false,
      });
    }

    await this.memory.addMessage('user', message);
    await this.memory.addMessage('assistant', response?.message?.content);

    return response;
  }

  private getPrompt(questionScore: Route, message: string, topKSimilarities: string[]): Message[] {
    const context = this.memory.getContext();

    return [
      {
        role: 'system',
        content: questionScore === 'MEDIUM' ? mediumAnswerPrompt : highAnswerPrompt,
      },
      {
        role: 'system',
        content: 'Contexto del CV: ' + topKSimilarities.join(' '),
      },
      ...context,
      {
        role: 'user',
        content: message,
      },
    ];
  }
}
