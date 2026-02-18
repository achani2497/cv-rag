import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export async function extractPdfText(path: string) {
  const pdf = await fs.promises.readFile(path);
  const parser = new PDFParse({ data: pdf });
  const pdfData = await parser.getText();
  return pdfData.text;
}
