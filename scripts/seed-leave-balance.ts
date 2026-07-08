/**
 * Seed leave balance data for all employees missing it.
 *
 * Tables populated:
 *  • sal_annual_leave  — yearly annual leave quota
 *  • sal_structure     — sl/cl/ucl entitlements (updated if existing)
 *
 * Run: npx tsx scripts/seed-leave-balance.ts
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

const CAL_YEAR = 2026;

interface EmpLeaveConfig {
  emp_id: number;
  name: string;
  tot_al: number;
  py_bal: number;
  al_roff: number;
  sl: number;
  cl: number;
  ucl: number;
}

// Only employees that were previously missing leave balance
const EMPLOYEE_LEAVE_CONFIG: EmpLeaveConfig[] = [
  { emp_id: 10, name: 'Kumar Shanu',     tot_al: 20, py_bal: 3, al_roff: 0, sl: 12, cl: 10, ucl: 5 },
  { emp_id: 9,  name: 'satish',          tot_al: 20, py_bal: 5, al_roff: 0, sl: 12, cl: 10, ucl: 5 },
  { emp_id: 6,  name: 'Avinash Magar',   tot_al: 20, py_bal: 8, al_roff: 2, sl: 12, cl: 10, ucl: 5 },
];

async function main(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('\n🌿 Seeding Leave Balance Data');
    console.log('══════════════════════════════════════════');

    for (const emp of EMPLOYEE_LEAVE_CONFIG) {
      console.log(`\n👤 ${emp.name} (emp_id=${emp.emp_id})`);

      // ── 1. sal_annual_leave ─────────────────────────────────────────────
      const existing = await client.query<{ pk_sal_id: number }>(
        `SELECT pk_sal_id FROM sal_annual_leave WHERE fk_emp_id = $1 AND cal_year = $2`,
        [String(emp.emp_id), CAL_YEAR]
      );

      if (existing.rows.length === 0) {
        const nextSalId = `al_emp${emp.emp_id}_${CAL_YEAR}`;

        await client.query(
          `INSERT INTO sal_annual_leave (pk_sal_id, fk_emp_id, cal_year, al_roff, py_bal, tot_al)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [nextSalId, String(emp.emp_id), CAL_YEAR, emp.al_roff, emp.py_bal, emp.tot_al]
        );
        console.log(`  ✅ Annual leave inserted: tot_al=${emp.tot_al}, py_bal=${emp.py_bal}`);
      } else {
        await client.query(
          `UPDATE sal_annual_leave SET al_roff=$1, py_bal=$2, tot_al=$3
           WHERE fk_emp_id=$4 AND cal_year=$5`,
          [emp.al_roff, emp.py_bal, emp.tot_al, String(emp.emp_id), CAL_YEAR]
        );
        console.log(`  ♻️  Annual leave updated: tot_al=${emp.tot_al}`);
      }

      // ── 2. sal_structure – ensure sl/cl/ucl are set ────────────────────
      const struct = await client.query<{ pk_ss_id: string; sl: string; cl: string; ucl: string }>(
        `SELECT pk_ss_id, sl, cl, ucl FROM sal_structure WHERE fk_emp_id = $1
         ORDER BY sal_start DESC LIMIT 1`,
        [String(emp.emp_id)]
      );

      if (struct.rows.length === 0) {
        // Generate pk_ss_id manually (it is a plain numeric PK, not auto-generated)
        const maxId = await client.query<{ next_id: string }>(
          `SELECT COALESCE(MAX(pk_ss_id::bigint), 0) + 1 AS next_id FROM sal_structure`
        );
        const nextId = maxId.rows[0]!.next_id;

        await client.query(
          `INSERT INTO sal_structure
            (pk_ss_id, fk_emp_id, sal_start, revise, sl, cl, ucl, r_day_i, r_day_ii, sandwich)
           VALUES ($1, $2, '2026-01-01 00:00:00', '2026-12-31 23:59:59', $3, $4, $5, '8', '8', 'N')`,
          [nextId, String(emp.emp_id), emp.sl, emp.cl, emp.ucl]
        );
        console.log(`  ✅ Salary structure created: sl=${emp.sl}, cl=${emp.cl}, ucl=${emp.ucl}`);
      } else {
        const row = struct.rows[0]!;
        if (Number(row.sl) !== emp.sl || Number(row.cl) !== emp.cl || Number(row.ucl) !== emp.ucl) {
          await client.query(
            `UPDATE sal_structure SET sl=$1, cl=$2, ucl=$3 WHERE pk_ss_id=$4`,
            [emp.sl, emp.cl, emp.ucl, row.pk_ss_id]
          );
          console.log(`  ♻️  Salary structure updated: sl=${emp.sl}, cl=${emp.cl}, ucl=${emp.ucl}`);
        } else {
          console.log(`  ℹ️  Salary structure already correct: sl=${row.sl}, cl=${row.cl}, ucl=${row.ucl}`);
        }
      }
    }

    // ── Verification ───────────────────────────────────────────────────────
    console.log('\n\n📊 Leave Balance Summary (all employees)');
    console.log('══════════════════════════════════════════');
    const summary = await client.query(`
      SELECT
        e.pk_emp_id AS emp_id,
        e.employee  AS name,
        COALESCE(a.tot_al::text, '—')  AS annual_total,
        COALESCE(a.py_bal::text, '—')  AS prev_yr_bal,
        COALESCE(s.sl::text, '—')      AS sick_leave,
        COALESCE(s.cl::text, '—')      AS casual_leave,
        COALESCE(s.ucl::text, '—')     AS unpaid_casual
      FROM sal_employee e
      LEFT JOIN sal_annual_leave a
        ON a.fk_emp_id = e.pk_emp_id::text AND a.cal_year = ${CAL_YEAR}
      LEFT JOIN sal_structure s
        ON s.fk_emp_id::numeric = e.pk_emp_id
      ORDER BY e.pk_emp_id
    `);
    console.table(summary.rows);
    console.log('\n✅ Leave balance seed complete!\n');
  } catch (err: any) {
    console.error('❌ Seed failed:', err.message);
    console.error(err.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
