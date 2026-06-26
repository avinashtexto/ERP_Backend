import { db } from '../../../config/db.config.js';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Querying account_book table using default db...');
  try {
    const res = await db.execute(sql`SELECT pk_book_id, book_name, database_nar FROM account_book`);
    console.log('Tenants:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

main();
