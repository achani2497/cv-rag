export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z\s]/g, '') // quita puntuación/símbolos
    .replace(/\s+/g, ' ')
    .trim();
}
