import fs from 'fs';
import mammoth from 'mammoth';
import { readFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

interface ExtractorEstrategy {
  extractText(path: string): Promise<string>;
}

export class Extractor {
  private getExtractorEstrategy(fileName: string) {
    let extractorEstrategy: ExtractorEstrategy;
    const extension = fileName.split('.').pop();
    switch (extension) {
      case 'txt':
        extractorEstrategy = new TxtExtractor();
        break;
      case 'pdf':
        extractorEstrategy = new PdfExtractor();
        break;
      case 'docx':
        extractorEstrategy = new WordExtractor();
        break;
      default:
        extractorEstrategy = new TxtExtractor();
    }
    return extractorEstrategy;
  }

  public async extractText(fileName: string) {
    const filePath = `./src/information/data/${fileName}`;
    const extractorEstrategy = this.getExtractorEstrategy(fileName);
    return extractorEstrategy.extractText(filePath);
  }
}

class TxtExtractor implements ExtractorEstrategy {
  public async extractText(filePath: string): Promise<string> {
    const content = await readFile(filePath, 'utf-8');
    return this.normalizeText(content);
  }

  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}

class PdfExtractor implements ExtractorEstrategy {
  public async extractText(path: string) {
    const pdf = await fs.promises.readFile(path);
    const parser = new PDFParse({ data: pdf });
    const pdfData = await parser.getText();
    return pdfData.text;
  }
}

class WordExtractor implements ExtractorEstrategy {
  public async extractText(filePath: string): Promise<string> {
    const buffer = await readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }
}
