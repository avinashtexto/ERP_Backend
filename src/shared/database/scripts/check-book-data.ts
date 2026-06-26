import path from 'path';

import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { accountBookTable, activeServerTable } from '../schemas/account-book.schema.js';

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

async function checkBookData() {
  try {
    console.log('Checking book data in AAAcommon database...\n');

    // Check if book with pk_book_id = "1" exists
    const books = await db
      .select()
      .from(accountBookTable)
      .where(eq(accountBookTable.pk_book_id, 1));
    console.log(`Books with pk_book_id = "1": ${books.length}`);
    if (books.length > 0) {
      console.log('Book details:', JSON.stringify(books[0], null, 2));
    }

    // Check if user "admin" exists for this book
    const servers = await db
      .select()
      .from(activeServerTable)
      .where(eq(activeServerTable.fk_book_id, 1));
    console.log(`\nActive servers for book_id = 1: ${servers.length}`);
    if (servers.length > 0) {
      console.log('Server details:', JSON.stringify(servers, null, 2));
    }

    // Check all books
    const allBooks = await db.select().from(accountBookTable);
    console.log(`\nTotal books in database: ${allBooks.length}`);
    if (allBooks.length > 0) {
      console.log(
        'All books:',
        allBooks.map((b) => ({ id: b.pk_book_id, name: b.book_name })),
      );
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkBookData();
