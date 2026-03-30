import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app';
import { config } from '../../src/config';
import { registerUser } from '../helpers/auth.helper';

describe('auth integration', () => {
  const app = createApp();

  describe('POST /api/auth/register', () => {
    it('registers a valid user', async () => {
      const u = await registerUser(app);
      expect(u.user.email).toContain('@example.com');
      expect(u.accessToken).toBeTruthy();
      expect(u.refreshToken).toBeTruthy();
    });

    it('rejects duplicate email', async () => {
      const email = `dup-${Date.now()}@example.com`;
      await registerUser(app, { email });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email, password: 'password123', displayName: 'Two' });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects validation errors', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'short', displayName: 'X' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      const { email, password } = await registerUser(app);
      const res = await request(app).post('/api/auth/login').send({ email, password });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeTruthy();
    });

    it('rejects wrong password', async () => {
      const { email } = await registerUser(app);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword123' });
      expect(res.status).toBe(401);
    });

    it('rejects unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'missing@example.com', password: 'password123' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns new tokens for valid refresh token', async () => {
      const { refreshToken } = await registerUser(app);
      const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeTruthy();
      expect(res.body.data.refreshToken).toBeTruthy();
    });

    it('rejects invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'not-a-jwt' });
      expect(res.status).toBe(401);
    });

    it('rejects expired refresh token', async () => {
      const expired = jwt.sign(
        { userId: '00000000-0000-0000-0000-000000000001', email: 'x@y.com' },
        config.JWT_SECRET,
        { expiresIn: '-1h' },
      );
      const res = await request(app).post('/api/auth/refresh').send({ refreshToken: expired });
      expect(res.status).toBe(401);
    });
  });

  describe('GET/PATCH /api/auth/me', () => {
    it('GET /me returns profile when authenticated', async () => {
      const { accessToken, user } = await registerUser(app);
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(user.id);
      expect(res.body.data.email).toBe(user.email);
    });

    it('PATCH /me updates profile', async () => {
      const { accessToken } = await registerUser(app);
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ displayName: 'Updated Name' });
      expect(res.status).toBe(200);
      expect(res.body.data.displayName).toBe('Updated Name');
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});

