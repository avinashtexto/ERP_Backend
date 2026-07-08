/**
 * Seed script – adds sample data for Shanu (pk_emp_id=8, pk_user_id=6, fk_set_id=1)
 *
 * IMPORTANT: fk_user_id in sal_loan and sal_leave_request must equal the
 * employee's fk_set_id (= 1 for Shanu), NOT pk_user_id (= 6).
 * The mobile API filters own records via: sal_loan.fk_user_id = employee.fk_set_id
 *
 * Run: npx tsx scripts/seed-shanu.ts
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

const SHANU_EMP_ID = 10;
const SHANU_USER_ID = 8;
const SHANU_FK_SET_ID = 8; // Matches Shanu's fk_user_id in local database

// ─── helpers ─────────────────────────────────────────────────────────────────
const randomId = (): number => Math.floor(1000 + Math.random() * 9000);

function today(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0]!; // YYYY-MM-DD
}

function currentMonth(offsetMonths = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── LOANS ───────────────────────────────────────────────────────────────────
async function seedLoans(client: pg.PoolClient): Promise<void> {
  const loans = [
    {
      loan_no: `LN/2026/${randomId()}`,
      loan_date: today(-60),
      loan_type: 'Salary Advance',
      loan_amount: '15000.00',
      interest_rate: '0.00',
      installments: 3,
      return_through: 'Salary',
      deduct_from_month: currentMonth(-2),
      calc_method: 'Equated Monthly Method',
      remarks: 'Monthly salary advance',
      authorize: true,
      accepted: 'Accept',
      last_status: 'Added',
    },
    {
      loan_no: `LN/2026/${randomId()}`,
      loan_date: today(-30),
      loan_type: 'Festival Advance',
      loan_amount: '10000.00',
      interest_rate: '0.00',
      installments: 6,
      return_through: 'Salary',
      deduct_from_month: currentMonth(-1),
      calc_method: 'Interest Calculation',
      remarks: 'Festival advance for Diwali',
      authorize: false,
      accepted: '',
      last_status: 'Pending',
    },
    {
      loan_no: `LN/2026/${randomId()}`,
      loan_date: today(-7),
      loan_type: 'Personal Loan',
      loan_amount: '50000.00',
      interest_rate: '12.00',
      installments: 12,
      return_through: 'Salary',
      deduct_from_month: currentMonth(1),
      calc_method: 'Remaining Balance Calculation',
      remarks: 'Medical emergency personal loan',
      authorize: false,
      accepted: '',
      last_status: 'Pending',
    },
  ];

  for (const loan of loans) {
    await client.query(
      `INSERT INTO sal_loan
        (loan_no, loan_date, fk_emp_id, loan_type, loan_amount,
         interest_rate, installments, return_through, deduct_from_month,
         calc_method, remarks, fk_user_id, last_status, authorize, accepted, a_remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'')`,
      [
        loan.loan_no, loan.loan_date, SHANU_EMP_ID, loan.loan_type,
        loan.loan_amount, loan.interest_rate, loan.installments,
        loan.return_through, loan.deduct_from_month, loan.calc_method,
        loan.remarks, SHANU_FK_SET_ID, loan.last_status, loan.authorize, loan.accepted,
      ]
    );
    console.log(`  ✅ Loan: ${loan.loan_no} (${loan.loan_type}) [${loan.last_status}]`);
  }
}

// ─── LEAVE REQUESTS ──────────────────────────────────────────────────────────
async function seedLeaveRequests(client: pg.PoolClient): Promise<void> {
  const leaves = [
    {
      request_no: `LR/2026-2027/${randomId()}`,
      request_date: today(-45),
      from_date: today(-44),
      to_date: today(-43),
      total_leave: '2',
      sick_leave: '2',
      reason: 'Fever and cold',
      last_status: 'Added',
      authorize: true,
      accepted: 'Accept',
    },
    {
      request_no: `LR/2026-2027/${randomId()}`,
      request_date: today(-20),
      from_date: today(-18),
      to_date: today(-16),
      total_leave: '3',
      paid_casual: '3',
      reason: 'Family function attendance',
      last_status: 'Added',
      authorize: false,
      accepted: '',
    },
    {
      request_no: `LR/2026-2027/${randomId()}`,
      request_date: today(-3),
      from_date: today(2),
      to_date: today(4),
      total_leave: '3',
      paid_leave: '3',
      reason: 'Annual vacation',
      last_status: 'Pending',
      authorize: false,
      accepted: '',
    },
    {
      request_no: `LR/2026-2027/${randomId()}`,
      request_date: today(-10),
      from_date: today(-9),
      to_date: today(-9),
      total_leave: '1',
      unpaid_leave: '1',
      reason: 'Personal work',
      last_status: 'Added',
      authorize: true,
      accepted: 'Reject',
    },
  ];

  for (const lv of leaves) {
    await client.query(
      `INSERT INTO sal_leave_request
        (request_no, request_date, from_date, to_date, fk_emp_id,
         total_leave, sick_leave, paid_casual, paid_leave, unpaid_leave,
         reason, fk_user_id, last_status, authorize, accepted,
         bal_leave, bal_paid, bal_sick, bal_paid_casual, bal_unpaid_casual)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'10','5','4','3','2')`,
      [
        lv.request_no, lv.request_date, lv.from_date, lv.to_date, SHANU_EMP_ID,
        lv.total_leave,
        (lv as any).sick_leave ?? '0',
        (lv as any).paid_casual ?? '0',
        (lv as any).paid_leave ?? '0',
        (lv as any).unpaid_leave ?? '0',
        lv.reason, SHANU_FK_SET_ID, lv.last_status, lv.authorize, lv.accepted,
      ]
    );
    console.log(`  ✅ Leave: ${lv.request_no} — "${lv.reason}" [${lv.last_status}]`);
  }
}

// ─── TASKS (via sal_office_boy) ───────────────────────────────────────────────
async function seedTasks(client: pg.PoolClient): Promise<void> {
  const obResult = await client.query<{ pk_ob_id: number }>(
    `SELECT pk_ob_id FROM sal_office_boy WHERE fk_user_id = $1 LIMIT 1`,
    [SHANU_USER_ID]
  );

  let ob_id: number;
  if (obResult.rows.length === 0) {
    const maxObIdRes = await client.query<{ next_id: string }>(
      `SELECT COALESCE(MAX(pk_ob_id), 0) + 1 AS next_id FROM sal_office_boy`
    );
    const nextObId = Number(maxObIdRes.rows[0]!.next_id);

    const ins = await client.query<{ pk_ob_id: number }>(
      `INSERT INTO sal_office_boy (pk_ob_id, name, contact_no, fk_user_id, ref_date, address, remarks, refrence_file, sync, sys_defined, date_timestamp, last_status)
       VALUES ($1, 'Kumar Shanu', '9876543210', $2, NOW(), 'Navi Mumbai, India', '', '', 'N', false, NOW(), 'A')
       ON CONFLICT DO NOTHING RETURNING pk_ob_id`,
      [nextObId, SHANU_USER_ID]
    );
    if (!ins.rows[0]) {
      const existing = await client.query<{ pk_ob_id: number }>(
        `SELECT pk_ob_id FROM sal_office_boy WHERE fk_user_id = $1 LIMIT 1`,
        [SHANU_USER_ID]
      );
      ob_id = existing.rows[0]!.pk_ob_id;
    } else {
      ob_id = ins.rows[0].pk_ob_id;
    }
    console.log(`  ✅ Office Boy record created: ob_id=${ob_id}`);
  } else {
    ob_id = obResult.rows[0]!.pk_ob_id;
    console.log(`  ℹ️  Office Boy record found: ob_id=${ob_id}`);
  }

  const tasks = [
    { task: 'Prepare monthly attendance report for June 2026', task_date: today(-5), priority: 'High',   status: 'Finished', remarks: 'Submitted to HR on time' },
    { task: 'Coordinate with IT for new employee laptop setup',  task_date: today(-2), priority: 'Medium', status: 'Pending',  remarks: null },
    { task: 'Review and update employee leave balance records',   task_date: today(0),  priority: 'High',   status: 'Pending',  remarks: 'Complete by EOD' },
    { task: 'Schedule team meeting for Q3 performance review',   task_date: today(1),  priority: 'Medium', status: 'Pending',  remarks: null },
    { task: 'Submit PF declaration forms for new joinees',        task_date: today(3),  priority: 'Low',    status: 'Pending',  remarks: 'Deadline: end of month' },
    { task: 'Archive old salary slips from 2025',                 task_date: today(-15),priority: 'Low',    status: 'Canceled', remarks: 'Postponed to next quarter' },
  ];

  for (const t of tasks) {
    const taskDate = new Date(t.task_date);
    taskDate.setHours(9, 0, 0, 0);
    await client.query(
      `INSERT INTO sal_office_boy_task (fk_ob_id, task, task_date, task_time, priority, status, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [ob_id, t.task, taskDate, taskDate, t.priority, t.status, t.remarks]
    );
    console.log(`  ✅ Task: "${t.task.substring(0, 45)}..." [${t.status}]`);
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('\n🔑 Seeding data for: Kumar Shanu (emp_id=8, fk_set_id=1)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n📋 Loans...');
    await seedLoans(client);
    console.log('\n🌴 Leave Requests...');
    await seedLeaveRequests(client);
    console.log('\n✅ Daily Tasks...');
    await seedTasks(client);
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ All seed data inserted successfully!\n');
  } catch (err: any) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
