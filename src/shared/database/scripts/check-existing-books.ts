import path from 'path';

import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { accountBookTable } from '../schemas/account-book.schema.js';

dotenv.config({
  path: path.resolve(process.cwd(), 'env/.env.dev'),
});

const databaseUrl = process.env.DATABASE_URL;

// Connect to AAAcommon database
let commonDatabaseUrl = databaseUrl;
if (databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    parsed.pathname = '/AAAcommon';
    commonDatabaseUrl = parsed.toString();
  } catch {
    commonDatabaseUrl = databaseUrl.replace(/\/([^/?]+)(\?|$)/, '/AAAcommon$2');
  }
}

const pool = new pg.Pool({
  connectionString: commonDatabaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool);

async function checkBooks() {
  try {
    console.log('Checking all books in AAAcommon database...\n');

    const allBooks = await db.select().from(accountBookTable);
    console.log(`Total books in database: ${allBooks.length}`);
    if (allBooks.length > 0) {
      console.log('\nAll books:');
      allBooks.forEach((b) => {
        console.log(
          `  - ID: ${b.pk_book_id}, Name: ${b.book_name}, Database: ${b.database_name}, Active: ${b.active}`,
        );
      });
    } else {
      console.log('No books found in database.');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkBooks();
