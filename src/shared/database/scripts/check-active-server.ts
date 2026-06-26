import path from 'path';

import dotenv from 'dotenv';
import { eq, and } from 'drizzle-orm';
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

async function checkActiveServer() {
  try {
    console.log('Checking active_server table...\n');

    // Get the actual book ID
    const books = await db.select().from(accountBookTable);
    const bookId = books[0]?.pk_book_id;
    console.log(`Actual book ID: ${bookId}`);

    // Check for user BANTI with correct book ID
    const { sql } = await import('drizzle-orm');

    // Query without email column since it doesn't exist in DB
    const result = await db.execute(sql`
      SELECT active_server, product_id, parent_id, user_id, mobile, password, fk_book_id
      FROM active_server
      WHERE fk_book_id = ${bookId} AND user_id = 'BANTI'
    `);

    console.log(
      `\nActive server records for user BANTI with book_id ${bookId}: ${result.rows.length}`,
    );
    if (result.rows.length > 0) {
      console.log('Server details:', JSON.stringify(result.rows, null, 2));
    }

    // Check all active_server records for this book
    const allServers = await db.execute(sql`
      SELECT active_server, product_id, parent_id, user_id, mobile, password, fk_book_id
      FROM active_server
      WHERE fk_book_id = ${bookId}
    `);

    console.log(`\nAll active_server records for book_id ${bookId}: ${allServers.rows.length}`);
    if (allServers.rows.length > 0) {
      console.log('All servers:', JSON.stringify(allServers.rows, null, 2));
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkActiveServer();
