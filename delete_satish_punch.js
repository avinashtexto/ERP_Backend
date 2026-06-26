import { db } from './src/config/db.config.js';
import { sal_employee, attendanceTable } from './src/shared/database/schemas/index.js';
import { eq, ilike, and } from 'drizzle-orm';

async function deleteSatishPunch() {
  try {
    // Find Satish's employee ID
    const [satish] = await db
      .select({ pk_emp_id: sal_employee.pk_emp_id, emp_code: sal_employee.emp_code, employee: sal_employee.employee })
      .from(sal_employee)
      .where(ilike(sal_employee.employee, '%Satish%'))
      .limit(1);

    if (!satish) {
      console.log('Employee Satish not found');
      return;
    }

    console.log('Found employee:', satish);

    // Get today's date in Asia/Kolkata timezone
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    console.log('Today\'s date:', todayStr);

    // Find today's punch records for Satish
    const punchRecords = await db
      .select()
      .from(attendanceTable)
      .where(
        and(
          eq(attendanceTable.empCode, satish.emp_code),
          eq(attendanceTable.atDate, todayStr)
        )
      );

    console.log(`Found ${punchRecords.length} punch records for Satish today:`);
    console.log(punchRecords);

    if (punchRecords.length === 0) {
      console.log('No punch records found for Satish today');
      return;
    }

    // Delete the punch records
    const deleted = await db
      .delete(attendanceTable)
      .where(
        and(
          eq(attendanceTable.empCode, satish.emp_code),
          eq(attendanceTable.atDate, todayStr)
        )
      )
      .returning();

    console.log(`Successfully deleted ${deleted.length} punch records for Satish today`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteSatishPunch();
