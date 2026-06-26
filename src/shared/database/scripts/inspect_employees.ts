import { db } from '../../../config/db.config.js';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Querying sal_employee table...');
  try {
    const res = await db.execute(sql`SELECT pk_emp_id, employee, emp_code FROM sal_employee`);
    console.log('Employees:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

main();
