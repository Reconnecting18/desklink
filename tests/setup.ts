process.env.NODE_ENV = 'test';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://desklink:desklink@localhost:5432/desklink_test';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-minimum-16-chars';
}

import { afterAll, beforeEach } from 'vitest';
import { prisma } from '../src/config/database';
import { cleanDatabase } from './helpers/db';

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});
