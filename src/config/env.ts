import { config as loadEnv } from 'dotenv';

loadEnv();

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }

  return value;
}

function getRequiredNumberEnv(name: string): number {
  const value = Number(getRequiredEnv(name));

  if (Number.isNaN(value)) {
    throw new Error(`La variable de entorno ${name} debe ser un numero valido`);
  }

  return value;
}

export const env = {
  MODEL_NAME: getRequiredEnv('MODEL_NAME'),
  MODEL_URL: getRequiredEnv('MODEL_URL'),
  CHUNK_SIZE: getRequiredNumberEnv('CHUNK_SIZE'),
  CHUNK_OVERLAP: getRequiredNumberEnv('CHUNK_OVERLAP'),
  TOP_K: getRequiredNumberEnv('TOP_K'),
  MEMORY_TOKEN_LIMIT: getRequiredNumberEnv('MEMORY_TOKEN_LIMIT'),
  RAW_MESSAGES_LIMIT: getRequiredNumberEnv('RAW_MESSAGES_LIMIT'),
  SUMMARY_TOKEN_LIMIT: getRequiredNumberEnv('SUMMARY_TOKEN_LIMIT'),
} as const;
