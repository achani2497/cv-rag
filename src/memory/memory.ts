import { Chunker } from '@/rag/chunker.js';
import { postFetch } from '@/shared/axiosWrapper/invoker.js';
import type { Message, MessageRole } from '@/types/message.js';
import { config as loadEnv } from 'dotenv';
loadEnv();

const sumarizePrompt = [
  'Resumí la siguiente conversación manteniendo:',
  'Tecnologías mencionadas',
  'Experiencia laboral/profesional discutida',
  'Preguntas pendientes',
  'Decisiones tomadas',
  'Preferencias del usuario',
  'Contexto necesario para continuar la conversación',
  'El resumen debe ser claro, conciso y no superar 300 tokens.',
].join('\n');

export class Memory {
  private summary: string | null = null;
  private messages: Message[] = [];
  private chunker: Chunker;
  private totalTokens: number = 0;

  constructor() {
    this.chunker = new Chunker();
  }

  public getContext(): Message[] {
    if (this.summary) {
      return [{ role: 'system', content: this.summary }, ...this.messages];
    } else {
      return [...this.messages];
    }
  }

  public async addMessage(role: MessageRole, content: string): Promise<void> {
    const contentTokens = this.chunker.getTotalTokens(content);
    this.totalTokens += contentTokens;
    this.messages.push({ role, content });

    while (this.shouldCompress()) {
      await this.compress();
    }
  }

  public shouldCompress() {
    return (
      this.messages.length > Number(process.env.RAW_MESSAGES_LIMIT) ||
      this.totalTokens > Number(process.env.MEMORY_TOKEN_LIMIT)
    );
  }

  public lastAssistantMessageWasQuestion(): boolean {
    const messages = this.messages.filter((message) => message.role === 'assistant');
    const lastMessage = messages.pop();

    if (!lastMessage) return false;

    return lastMessage.content.trim().endsWith('?');
  }

  public messageIsAmbiguous(message: string, maxSimilarity: number, entityMatch: boolean): boolean {
    const tokensAmount = this.chunker.getTotalTokens(message);

    return tokensAmount <= 12 && !entityMatch && maxSimilarity < 0.5;
  }

  private getSummarizedMessages(messages: Message[], oldSummary: string): string {
    let formattedMessages: string =
      oldSummary.length > 0 ? oldSummary + '\n' + 'Conversacion: \n' : 'Conversacion: \n';

    formattedMessages += messages
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n');

    return formattedMessages;
  }

  private async compress(): Promise<void> {
    console.log('Compressing memory...');
    let tokensToFree = 0;
    const oldSummary = this.summary ?? '';
    const oldSummaryTokens = this.chunker.getTotalTokens(oldSummary);

    if (this.messages.length <= 1) return;

    const messagesToKeep = this.messages.slice(-4);
    const messagesToSumarize = this.messages.slice(0, -4);

    if (messagesToSumarize.length === 0) return;

    tokensToFree += messagesToSumarize.reduce(
      (acc, message) => acc + this.chunker.getTotalTokens(message.content),
      0,
    );

    const { rawSummary, rawSummaryTokens } = await this.getNewSummary(
      messagesToSumarize,
      oldSummary,
    );

    if (rawSummaryTokens === 0) return;

    this.totalTokens = this.totalTokens - tokensToFree - oldSummaryTokens + rawSummaryTokens;
    this.summary = rawSummary;
    this.messages = messagesToKeep;
  }

  private async getNewSummary(
    messagesToSumarize: Message[],
    oldSummary: string,
  ): Promise<{ rawSummary: string; rawSummaryTokens: number }> {
    let conversationToSummarize = this.getSummarizedMessages(messagesToSumarize, oldSummary);

    let response = await postFetch<any>(`${process.env.MODEL_URL}/chat`, {
      model: 'deepseek-r1:8b',
      messages: [
        { role: 'system', content: sumarizePrompt },
        { role: 'user', content: conversationToSummarize },
      ],
    });

    if (!response?.choices?.[0]?.message?.content) return { rawSummary: '', rawSummaryTokens: 0 };

    let rawSummary: string =
      'Resumen de conversación previa: ' + response.choices[0].message.content;

    let rawSummaryTokens = this.chunker.getTotalTokens(rawSummary);
    if (rawSummaryTokens > 300) {
      const newSummaryTokens = this.chunker.tokenizeText(rawSummary);
      rawSummary = this.chunker.detokenizeText(newSummaryTokens.slice(0, 300));
      rawSummaryTokens = this.chunker.getTotalTokens(rawSummary);
    }

    return { rawSummary, rawSummaryTokens };
  }
}
