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
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const fkEmpId = 6;
    const year = 2026;

    console.log(`Setting up leave balances for Employee ID: ${fkEmpId} for year: ${year}...`);

    // 1. Manage Annual Leave Balance
    const alCheck = await pool.query('SELECT * FROM "sal_annual_leave" WHERE "fk_emp_id" = $1 AND "cal_year" = $2', [String(fkEmpId), year]);
    if (alCheck.rows.length > 0) {
      await pool.query('UPDATE "sal_annual_leave" SET "tot_al" = 12 WHERE "fk_emp_id" = $1 AND "cal_year" = $2', [String(fkEmpId), year]);
      console.log('✅ Updated Annual Leave to 12 days.');
    } else {
      const pkSalId = `al_emp${fkEmpId}_${year}`;
      await pool.query('INSERT INTO "sal_annual_leave" ("pk_sal_id", "fk_emp_id", "cal_year", "tot_al") VALUES ($1, $2, $3, 12)', [pkSalId, String(fkEmpId), year]);
      console.log(`✅ Inserted Annual Leave with 12 days (ID: ${pkSalId}).`);
    }

    // 2. Manage Salary Structure (sl, cl, ucl)
    const structCheck = await pool.query('SELECT * FROM "sal_structure" WHERE "fk_emp_id" = $1 ORDER BY "sal_start" DESC LIMIT 1', [String(fkEmpId)]);
    if (structCheck.rows.length > 0) {
      const ssId = structCheck.rows[0].pk_ss_id;
      await pool.query(
        'UPDATE "sal_structure" SET "sl" = 10.0, "cl" = 8.0, "ucl" = 15.0, "sal_start" = \'2026-01-01 00:00:00\', "revise" = \'2026-12-31 23:59:59\' WHERE "pk_ss_id" = $1',
        [ssId]
      );
      console.log(`✅ Updated existing salary structure (ID: ${ssId}) to sl = 10, cl = 8, ucl = 15.`);
    } else {
      const maxIdRes = await pool.query('SELECT COALESCE(MAX(pk_ss_id::numeric), 0) as max_id FROM "sal_structure"');
      const nextId = Number(maxIdRes.rows[0].max_id) + 1;

      await pool.query(
        `INSERT INTO "sal_structure" (
          "pk_ss_id", "fk_emp_id", "sal_start", "revise", "sl", "cl", "ucl", "basic", "b_type", "remarks", "sync", "sys_defined", "ph", "wh", "rwh", "bl", "bld", "a_rule", "otb", "cal_pt", "cal_pf", "cal_esic", "cal_tds", "fk_s_acct_id", "fk_user_id", "last_status"
        ) VALUES (
          $1, $2, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 10.0, 8.0, 15.0, 20000.0, '', 'Leave Balance Seeding', 'N', false, 0, 0, 0, 0, 0, '', 0, false, false, false, false, '', '1', 'Active'
        )`,
        [nextId, fkEmpId]
      );
      console.log(`✅ Created new salary structure (ID: ${nextId}) with sl = 10, cl = 8, ucl = 15.`);
    }

    console.log('🚀 Leave balances added successfully for employee 6!');
  } catch (err) {
    console.error('❌ Error setting leave balances:', err);
  } finally {
    await pool.end();
  }
}

main();
