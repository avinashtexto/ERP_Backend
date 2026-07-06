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
    // Update employee 6 with office location (Main Office coordinates)
    const result = await pool.query(`
      UPDATE "sal_structure" 
      SET 
        "latitude" = 19.1026655,
        "longitude" = 73.008672,
        "radius" = 25.00
      WHERE "fk_emp_id" = 6
    `);

    console.log(`✅ Updated ${result.rowCount} employee record(s) with location data`);
  } catch (error) {
    console.error('❌ Error updating employee location:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateEmployeeLocation();
