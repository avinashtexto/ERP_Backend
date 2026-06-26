import { db } from '../../../config/db.config.js';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Listing database tables...');
  try {
    const res = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Tables:', res.rows.map(r => r.table_name));
  } catch (err: any) {
    console.error('Error:', err.message || err);
  }
  process.exit(0);
}

main();
