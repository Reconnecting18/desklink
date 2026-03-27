import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL ?? 'postgresql://desklink:desklink@localhost:5432/desklink',
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
} as any);
