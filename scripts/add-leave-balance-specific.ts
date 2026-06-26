import { db } from '../src/config/db.config.ts';
import { sal_annual_leave, sal_employee } from '../src/shared/database/schemas/index.ts';
import { eq, sql } from 'drizzle-orm';

async function addLeaveBalanceForEmployees() {
  console.log('Adding leave balance for Rohit and Avinash...');
  
  try {
    const currentYear = new Date().getFullYear();
    
    // Find Rohit's employee ID
    const [rohit] = await db.select({
      pk_emp_id: sal_employee.pk_emp_id,
      employee: sal_employee.employee,
    }).from(sal_employee).where(sql`LOWER(${sal_employee.employee}) LIKE '%rohit%'`);
    
    // Find Avinash's employee ID
    const [avinash] = await db.select({
      pk_emp_id: sal_employee.pk_emp_id,
      employee: sal_employee.employee,
    }).from(sal_employee).where(sql`LOWER(${sal_employee.employee}) LIKE '%avinash%'`);
    
    console.log('Found employees:');
    console.log('Rohit:', rohit);
    console.log('Avinash:', avinash);
    
    const employees = [rohit, avinash].filter(Boolean);
    
    for (const emp of employees) {
      const empId = String(emp.pk_emp_id);
      
      // Check if employee already has a record for current year
      const existingRecords = await db.select()
        .from(sal_annual_leave)
        .where(eq(sal_annual_leave.fk_emp_id, empId));
      
      const yearRecord = existingRecords.find(r => r.cal_year === currentYear);
      
      if (!yearRecord) {
        // Get previous year balance if exists
        const prevYearRecord = existingRecords.find(r => r.cal_year === currentYear - 1);
        const py_bal = prevYearRecord?.tot_al ?? 0;
        
        // pk_sal_id is now auto-generated integer
        await db.insert(sal_annual_leave).values({
          fk_emp_id: empId,
          cal_year: currentYear,
          al_roff: 0,
          py_bal: py_bal,
          tot_al: 0,
        });
        console.log(`Inserted leave balance for ${emp.employee} (ID: ${emp.pk_emp_id})`);
      } else {
        console.log(`Leave balance already exists for ${emp.employee} (ID: ${emp.pk_emp_id})`);
      }
    }
    
    console.log('Leave balance update completed successfully!');
    
  } catch (error) {
    console.error('Error adding leave balance:', error);
    process.exit(1);
  }
}

addLeaveBalanceForEmployees().then(() => process.exit(0));
