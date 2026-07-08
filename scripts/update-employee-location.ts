/**
 * Script to update employee location (latitude, longitude, radius) in sal_structure table
 *
 * Run: npx tsx scripts/update-employee-location.ts
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString:
    'postgresql://postgres.qxzvvkyhipwrfnerpocq:gi4t6KNvYNULzcgb@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres',
});

const TARGET_NAME = 'Avinash';
const LATITUDE = 19.1109068;
const LONGITUDE = 73.0156453;
const RADIUS = 25.00;

async function main(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log(`\n🔍 Searching for employee: "${TARGET_NAME}"`);
    console.log('═════════════════════════════════════════════');

    const empResult = await client.query<{ pk_emp_id: number; employee: string }>(
      `SELECT pk_emp_id, employee FROM sal_employee WHERE employee ILIKE $1 LIMIT 1`,
      [`%${TARGET_NAME}%`]
    );

    if (empResult.rows.length === 0) {
      console.log(`❌ No employee found matching "${TARGET_NAME}"`);
      return;
    }

    const emp = empResult.rows[0]!;
    console.log(`👤 Found: ${emp.employee} (emp_id=${emp.pk_emp_id})`);

    // 1. Check if structure exists
    const structResult = await client.query<{ pk_ss_id: string }>(
      `SELECT pk_ss_id FROM sal_structure WHERE fk_emp_id = $1 LIMIT 1`,
      [String(emp.pk_emp_id)]
    );

    if (structResult.rows.length === 0) {
      console.log(`ℹ️  No salary structure record found for ${emp.employee}. Creating one...`);
      // Get next available pk_ss_id
      const maxId = await client.query<{ next_id: string }>(
        `SELECT COALESCE(MAX(pk_ss_id::bigint), 0) + 1 AS next_id FROM sal_structure`
      );
      const nextId = maxId.rows[0]!.next_id;

      await client.query(
        `INSERT INTO sal_structure
          (pk_ss_id, fk_emp_id, sal_start, revise, sl, cl, ucl,
           basic, b_type, t_allowance, t_travelling, t_housing, t_daily,
           t_incentive, t_education, t_medical, t_other, r_day_i, r_day_ii,
           ph, wh, rwh, bl, bld, a_rule, otb, sync, last_status, fk_user_id,
           fk_s_acct_id, fk_l_acct_id, remarks, latitude, longitude, radius)
         VALUES ($1, $2, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 12, 10, 5,
           0, '', '', '', '', '', '', '', '', '', '', '', 0, 8, 8, 0, 0, '', 0, 'N', 'Added', '1',
           '', '', '', $3, $4, $5)`,
        [nextId, String(emp.pk_emp_id), LATITUDE, LONGITUDE, RADIUS]
      );
      console.log(`  ✅ Structure created with location details.`);
    } else {
      const struct = structResult.rows[0]!;
      await client.query(
        `UPDATE sal_structure
         SET latitude = $1, longitude = $2, radius = $3, last_status = 'Edited'
         WHERE pk_ss_id = $4`,
        [LATITUDE, LONGITUDE, RADIUS, struct.pk_ss_id]
      );
      console.log(`  ✅ Salary structure updated (pk_ss_id=${struct.pk_ss_id})`);
    }

    console.log(`📍 Successfully set location to:`);
    console.log(`   Latitude:  ${LATITUDE}`);
    console.log(`   Longitude: ${LONGITUDE}`);
    console.log(`   Radius:    ${RADIUS}m`);

  } catch (err: any) {
    console.error('❌ Location update failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
