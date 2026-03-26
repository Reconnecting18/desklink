import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app';

export const app = createApp();
export const request = supertest(app);

export const TEST_JWT_SECRET = 'test-secret-key-minimum-16-chars';

export const testUser = {
  email: 'test@example.com',
  password: 'password123',
  displayName: 'Test User',
};

export function authHeader(token: string) {
  return `Bearer ${token}`;
}

export function createTestToken(payload: { userId: string; email: string }, expiresIn = '15m') {
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn });
}
