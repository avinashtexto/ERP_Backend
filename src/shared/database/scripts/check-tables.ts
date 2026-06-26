import { db } from '../../../config/db.config.js';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('--- DATABASE TABLES ---');
    console.log(result.rows.map((r: any) => r.table_name));
    console.log('-----------------------');
  } catch (error) {
    console.error('Error listing tables:', error);
  }
  process.exit(0);
}

main();
