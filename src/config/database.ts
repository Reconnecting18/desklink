import path from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const relativePath = rawUrl.replace(/^file:/, '');

const url = path.isAbsolute(relativePath)
  ? relativePath
  : path.resolve(__dirname, '../../prisma', relativePath);

const adapter = new PrismaBetterSqlite3({ url });

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
