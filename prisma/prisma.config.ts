import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL') ?? 'postgresql://desklink:desklink@localhost:5432/desklink',
  },
  migrate: {
    async development() {
      return {
        url: env('DATABASE_URL') ?? 'postgresql://desklink:desklink@localhost:5432/desklink',
      };
    },
  },
});
