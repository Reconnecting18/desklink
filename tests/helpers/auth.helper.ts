import { expect } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

export interface RegisteredUser {
  email: string;
  password: string;
  user: { id: string; email: string; displayName: string; role: string };
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(
  app: Express,
  overrides?: Partial<{ email: string; password: string; displayName: string }>,
): Promise<RegisteredUser> {
  const email = overrides?.email ?? `user-${Date.now()}@example.com`;
  const password = overrides?.password ?? 'password123';
  const displayName = overrides?.displayName ?? 'Test User';
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password, displayName });
  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  const { user, accessToken, refreshToken } = res.body.data;
  return { email, password, user, accessToken, refreshToken };
}

export async function loginUser(
  app: Express,
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  return res.body.data;
}

export async function createWorkspace(
  app: Express,
  accessToken: string,
  name = 'WS',
  slug?: string,
): Promise<{ id: string; name: string; slug: string }> {
  const s = slug ?? `ws-${Date.now()}`;
  const res = await request(app)
    .post('/api/workspaces')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name, slug: s });
  expect(res.status).toBe(201);
  return res.body.data;
}
