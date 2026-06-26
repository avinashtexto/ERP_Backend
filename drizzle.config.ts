import { defineConfig } from 'drizzle-kit';
import path from 'path';
import dotenv from 'dotenv';
if (!process.env.DATABASE_URL) {
  dotenv.config({
    path: path.resolve(process.cwd(), 'env/.env.dev'),
  });
}

export default defineConfig({
  out: './src/shared/database/migrations',
  schema: './public/dist/shared/database/schemas/index.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
