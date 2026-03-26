import { vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key-minimum-16-chars';
process.env.RATE_LIMIT_MAX = '1000';

vi.mock('../src/config/database', () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      aiRequest: {
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
    },
  };
});
