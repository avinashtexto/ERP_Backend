import path from 'path';

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
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

async function createBookOne() {
  try {
    console.log('Creating book with pk_book_id = "1"...\n');

    // Hash the password
    const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash('passwd', saltRounds);

    // Insert the book
    const [insertedBook] = await db
      .insert(accountBookTable)
      .values({
        pk_book_id: 1,
        book_name: 'Test Book',
        active: true,
        file_name: '',
        database_name: 'test_book',
        product_id: '1',
        parent_id: '1',
        add_path: 'IERPCom',
        backup_path: '',
      })
      .returning();

    console.log('Book created:', insertedBook);

    // Insert the admin user for this book
    await db.insert(activeServerTable).values({
      active_server: 'localhost',
      product_id: 1,
      parent_id: 1,
      user_id: 'admin',
      password: hashedPassword,
      fk_book_id: 1,
    });

    console.log('Admin user created for book');

    await pool.end();
    console.log('\nDone! You can now login with:');
    console.log('  username: admin');
    console.log('  password: passwd');
    console.log('  bookId: 1');
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

createBookOne();
