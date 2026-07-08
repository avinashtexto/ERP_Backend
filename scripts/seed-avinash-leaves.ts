/**
 * Script to seed realistic leave requests for Avinash Magar (emp_id = 6, user_id = 2)
 *
 * Run: npx tsx scripts/seed-avinash-leaves.ts
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, '../env', envFile) });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/tionix_one',
});

const AVINASH_EMP_ID = 6;
const AVINASH_USER_ID = 2;

const randomId = (): number => Math.floor(1000 + Math.random() * 9000);

async function main(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log(`\n🔑 Seeding Leaves for Avinash Magar (emp_id=${AVINASH_EMP_ID})`);
    console.log('═══════════════════════════════════════════════════════════');

    // 1. Delete any zero-day leaves or old test leaves to keep it clean
    await client.query(
      `DELETE FROM sal_leave_request WHERE fk_emp_id = $1 AND (total_leave = '0' OR reason LIKE '%test%')`,
      [AVINASH_EMP_ID]
    );

    const leaves = [
      {
        request_no: `LR/2026-2027/${randomId()}`,
        request_date: '2026-06-10',
        from_date: '2026-06-15',
        to_date: '2026-06-16',
        total_leave: '2',
        reason: 'Family function in hometown',
        last_status: 'Approved',
        accepted: 'Approved',
        authorize: true,
      },
      {
        request_no: `LR/2026-2027/${randomId()}`,
        request_date: '2026-07-02',
        from_date: '2026-07-05',
        to_date: '2026-07-05',
        total_leave: '1',
        reason: 'Doctor appointment & medical checkup',
        last_status: 'Approved',
        accepted: 'Approved',
        authorize: true,
      },
      {
        request_no: `LR/2026-2027/${randomId()}`,
        request_date: '2026-07-06',
        from_date: '2026-07-10',
        to_date: '2026-07-12',
        total_leave: '3',
        reason: 'Urgent personal work at home',
        last_status: 'Pending',
        accepted: 'Pending',
        authorize: false,
      },
      {
        request_no: `LR/2026-2027/${randomId()}`,
        request_date: '2026-05-18',
        from_date: '2026-05-20',
        to_date: '2026-05-21',
        total_leave: '2',
        reason: 'Going to vacation trip',
        last_status: 'Rejected',
        accepted: 'Rejected',
        authorize: false,
        a_remarks: 'Rejected due to project release deadline',
      }
    ];

    for (const lv of leaves) {
      // Find a unique primary key if not auto-generated
      const maxIdRes = await client.query<{ next_id: string }>(
        `SELECT COALESCE(MAX(pk_lr_id), 0) + 1 AS next_id FROM sal_leave_request`
      );
      const nextId = Number(maxIdRes.rows[0]!.next_id);

      await client.query(
        `INSERT INTO sal_leave_request
          (pk_lr_id, request_no, request_date, from_date, to_date, fk_emp_id,
           bal_leave, bal_paid, bal_sick, bal_paid_casual, bal_unpaid_casual,
           rest_day, unpaid_leave, paid_holiday, sick_leave, paid_casual,
           unpaid_casual, maternity, paid_leave, total_leave, absent,
           reason, remarks, date_timestamp, fk_user_id, last_status,
           authorize, a_timestamp, fk_a_user_id, accepted, a_remarks)
         VALUES
          ($1, $2, $3, $4, $5, $6,
           '20', '8', '12', '10', '5',
           '0', '0', '0', '0', '0',
           '0', '0', '0', $7, '0',
           $8, '', NOW(), $9, $10,
           $11, $12, null, $13, $14)`,
        [
          nextId,
          lv.request_no,
          lv.request_date,
          lv.from_date,
          lv.to_date,
          AVINASH_EMP_ID,
          lv.total_leave,
          lv.reason,
          AVINASH_USER_ID,
          lv.last_status,
          lv.authorize,
          lv.authorize ? new Date() : null,
          lv.accepted,
          lv.a_remarks || '',
        ]
      );
      console.log(`  ✅ Seeded Leave Request: ${lv.request_no} — "${lv.reason}" [${lv.last_status}]`);
    }

    console.log('\n🎉 Leave seeding for Avinash Magar completed successfully!');
  } catch (err: any) {
    console.error('❌ Leave seeding failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
