import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { request, testUser, authHeader, createTestToken } from '../helpers/auth.helper';
import { mockPrisma, resetMocks } from '../helpers/prisma.mock';

const TEST_PASSWORD_HASH = bcrypt.hashSync('password123', 12);

const mockDbUser = {
  id: 'user-1',
  email: testUser.email,
  passwordHash: TEST_PASSWORD_HASH,
  displayName: testUser.displayName,
  avatarUrl: null,
  role: 'MEMBER',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Auth Flow', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: testUser.email,
        displayName: testUser.displayName,
        role: 'MEMBER',
        createdAt: new Date(),
      });

      const res = await request
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('rejects duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockDbUser);

      const res = await request
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects missing displayName', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({ email: 'a@b.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects short password', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({ email: 'a@b.com', password: 'short', displayName: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid email format', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123', displayName: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockDbUser);

      const res = await request
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('rejects wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockDbUser);

      const res = await request
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('refreshes with valid token', async () => {
      const refreshToken = createTestToken({ userId: 'user-1', email: testUser.email }, '7d');
      mockPrisma.user.findUnique.mockResolvedValue(mockDbUser);

      const res = await request
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('rejects invalid token', async () => {
      const res = await request
        .post('/api/auth/refresh')
        .send({ refreshToken: 'garbage-token' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns profile for authenticated user', async () => {
      const token = createTestToken({ userId: 'user-1', email: testUser.email });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: testUser.email,
        displayName: testUser.displayName,
        avatarUrl: null,
        role: 'MEMBER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request
        .get('/api/auth/me')
        .set('Authorization', authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('rejects request without auth header', async () => {
      const res = await request.get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid token', async () => {
      const res = await request
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/auth/me', () => {
    it('updates profile successfully', async () => {
      const token = createTestToken({ userId: 'user-1', email: testUser.email });
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-1',
        email: testUser.email,
        displayName: 'New Name',
        avatarUrl: null,
        role: 'MEMBER',
        updatedAt: new Date(),
      });

      const res = await request
        .patch('/api/auth/me')
        .set('Authorization', authHeader(token))
        .send({ displayName: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.displayName).toBe('New Name');
    });

    it('rejects unauthorized request', async () => {
      const res = await request
        .patch('/api/auth/me')
        .send({ displayName: 'New Name' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
