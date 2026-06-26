import { db } from '../../../config/db.config.js';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Querying sal_loan table...');
  try {
    const res = await db.execute(sql`SELECT pk_loan_id, loan_no, fk_emp_id, fk_user_id, loan_amount, last_status, accepted FROM sal_loan LIMIT 10`);
    console.log('Loans:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

main();
