import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from env/.env.local
dotenv.config({
  path: path.resolve(process.cwd(), 'env/.env.local'),
});

import { db } from './src/config/db.config.js';
import { salEmployee } from './src/shared/database/schemas/index.js';
import { eq, ilike } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function updateSatishPassword() {
  try {
    // Find Satish's employee record
    const [satish] = await db
      .select({ 
        pk_emp_id: salEmployee.pk_emp_id, 
        emp_code: salEmployee.emp_code, 
        employee: salEmployee.employee,
        username: salEmployee.username 
      })
      .from(salEmployee)
      .where(ilike(salEmployee.employee, '%Satish%'))
      .limit(1);

    if (!satish) {
      console.log('Employee Satish not found');
      process.exit(1);
      return;
    }

    console.log('Found employee:', satish);

    // Hash the new password
    const newPassword = 'satish@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('Updating password...');

    // Update the password
    const updated = await db
      .update(salEmployee)
      .set({ 
        password: hashedPassword,
        date_time_stamp: new Date()
      })
      .where(eq(salEmployee.pk_emp_id, satish.pk_emp_id))
      .returning();

    console.log(`Successfully updated password for ${satish.employee} (${satish.username})`);
    console.log(`New password: ${newPassword}`);
    console.log('Updated record:', updated[0]);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateSatishPassword();
