import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment relative to this script's directory
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, '../env', envFile) });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateEmployeeLocation() {
  try {
    // First, find the employee ID for "shnau kumar"
    const empResult = await pool.query(`
      SELECT "pk_emp_id", "employee" 
      FROM "sal_employee" 
      WHERE LOWER("employee") LIKE '%shnau%' OR LOWER("employee") LIKE '%kumar%'
    `);

    if (empResult.rows.length === 0) {
      console.log('❌ No employee found with name containing "shnau" or "kumar"');
      process.exit(1);
    }

    console.log('Found employees:', empResult.rows);
    
    // Use the first matching employee
    const empId = empResult.rows[0].pk_emp_id;
    const empName = empResult.rows[0].employee;
    
    console.log(`Updating location for employee: ${empName} (ID: ${empId})`);

    // Update employee location with new coordinates
    const result = await pool.query(`
      UPDATE "sal_structure" 
      SET 
        "latitude" = 19.11092,
        "longitude" = 73.0156555,
        "radius" = 25.00
      WHERE "fk_emp_id" = $1
    `, [empId]);

    console.log(`✅ Updated ${result.rowCount} employee record(s) with location data`);
    console.log(`   Latitude: 19.11092`);
    console.log(`   Longitude: 73.0156555`);
  } catch (error) {
    console.error('❌ Error updating employee location:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateEmployeeLocation();
