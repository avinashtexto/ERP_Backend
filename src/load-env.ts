import path from 'path';
import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  // In production, we primarily use the hosting provider's environment variables (e.g. Render Dashboard).
  // We can load a root .env file if it exists, or fallback.
  dotenv.config();
} else {
  // In development, load env/.env.dev
  dotenv.config({
    path: path.resolve(process.cwd(), 'env/.env.dev'),
  });
}

