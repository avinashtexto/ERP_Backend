import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, '../env', envFile) });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDailyTasks() {
  try {
    // 0. Ensure table column "priority" exists
    await pool.query('ALTER TABLE "sal_office_boy_task" ADD COLUMN IF NOT EXISTS "priority" varchar(20) DEFAULT \'Medium\' NOT NULL');

    // 1. Insert office boy record for Employee ID 6 (Avinash)
    // We explicitly set pk_ob_id to 6 because the controller maps the logged-in employee ID (6) directly as the fk_ob_id.
    const obResult = await pool.query(`
      INSERT INTO "sal_office_boy" (
        "pk_ob_id",
        "name",
        "mobile",
        "email",
        "address",
        "fk_user_id",
        "last_status",
        "ref_date",
        "contact_no",
        "sync",
        "sys_defined",
        "remarks",
        "refrence_file"
      ) VALUES (
        6,
        'Avinash Magar',
        '7058700755',
        'amagar@tionix.in',
        'Koparkhairne, Navi Mumbai',
        2,
        'Active',
        CURRENT_DATE,
        '7058700755',
        'N',
        false,
        'Dev Seed',
        ''
      )
      ON CONFLICT ("pk_ob_id") DO UPDATE 
      SET 
        "name" = 'Avinash Magar',
        "mobile" = '7058700755',
        "email" = 'amagar@tionix.in',
        "address" = 'Koparkhairne, Navi Mumbai',
        "fk_user_id" = 2,
        "last_status" = 'Active',
        "ref_date" = CURRENT_DATE,
        "contact_no" = '7058700755',
        "sync" = 'N',
        "sys_defined" = false,
        "remarks" = 'Dev Seed',
        "refrence_file" = ''
      RETURNING *
    `);

    console.log('✅ Office Boy record successfully seeded:', obResult.rows[0]);

    // 2. Insert sample tasks for Office Boy ID 6
    // Delete existing tasks for clean seeding
    await pool.query('DELETE FROM "sal_office_boy_task" WHERE "fk_ob_id" = 6');

    const tasks = [
      {
        task: 'Collect documents from Main Office',
        task_date: new Date(),
        task_time: new Date(),
        remarks: 'Please coordinate with the front desk.',
        status: 'Pending',
        priority: 'High',
      },
      {
        task: 'Deliver files to HR Department',
        task_date: new Date(),
        task_time: new Date(),
        remarks: 'Ensure HR signs the receipt copy.',
        status: 'Finished',
        priority: 'Medium',
      },
      {
        task: 'Verify inventory stock in store room',
        task_date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        task_time: new Date(Date.now() - 24 * 60 * 60 * 1000),
        remarks: 'Count remaining stationery and update sheet.',
        status: 'Finished',
        priority: 'Low',
      },
      {
        task: 'Arrange conference room for client meeting',
        task_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        task_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        remarks: 'Check projector connectivity and layout.',
        status: 'Pending',
        priority: 'High',
      }
    ];

    for (const t of tasks) {
      await pool.query(`
        INSERT INTO "sal_office_boy_task" (
          "fk_ob_id",
          "task",
          "task_date",
          "task_time",
          "remarks",
          "status",
          "priority"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [6, t.task, t.task_date, t.task_time, t.remarks, t.status, t.priority]);
    }

    const seededTasks = await pool.query('SELECT * FROM "sal_office_boy_task" WHERE "fk_ob_id" = 6');
    console.log(`✅ Successfully seeded ${seededTasks.rowCount} daily task record(s)`);

  } catch (error) {
    console.error('❌ Error seeding daily tasks:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDailyTasks();
