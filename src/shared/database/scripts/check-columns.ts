import path from 'path';

import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({
  path: path.resolve(process.cwd(), 'env/.env.dev'),
});

async function listColumns() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'sal_employee'
    `);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

listColumns();
