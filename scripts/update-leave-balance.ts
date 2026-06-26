import { db } from '../src/config/db.config.ts';
import { sal_annual_leave, sal_employee } from '../src/shared/database/schemas/index.ts';
import { eq } from 'drizzle-orm';

async function updateLeaveBalance() {
  console.log('Starting leave balance update...');
  
  try {
    const currentYear = new Date().getFullYear();
    const defaultAnnualLeave = 12; // Default 12 days per year
    
    // Get all employees
    const employees = await db.select({
      pk_emp_id: sal_employee.pk_emp_id,
    }).from(sal_employee);
    
    console.log(`Found ${employees.length} employees`);
    
    let updated = 0;
    let inserted = 0;
    
    for (const employee of employees) {
      const empId = String(employee.pk_emp_id);
      
      // Check if employee already has a record for current year
      const existingRecords = await db.select()
        .from(sal_annual_leave)
        .where(eq(sal_annual_leave.fk_emp_id, empId));
      
      const currentYearRecord = existingRecords.find(r => r.cal_year === currentYear);
      
      if (currentYearRecord) {
        // Update if tot_al is zero or null
        if (!currentYearRecord.tot_al || currentYearRecord.tot_al === 0) {
          await db.update(sal_annual_leave)
            .set({ tot_al: defaultAnnualLeave })
            .where(eq(sal_annual_leave.pk_sal_id, currentYearRecord.pk_sal_id));
          updated++;
          console.log(`Updated leave balance for employee ${employee.pk_emp_id}`);
        }
      } else {
        // Insert new record - pk_sal_id is auto-generated
        await db.insert(sal_annual_leave).values({
          fk_emp_id: empId,
          cal_year: currentYear,
          al_roff: 0,
          py_bal: 0,
          tot_al: defaultAnnualLeave,
        });
        inserted++;
        console.log(`Inserted leave balance for employee ${employee.pk_emp_id}`);
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`- Inserted: ${inserted} new records`);
    console.log(`- Updated: ${updated} existing records`);
    console.log(`- Total employees processed: ${employees.length}`);
    console.log('Leave balance update completed successfully!');
    
  } catch (error) {
    console.error('Error updating leave balance:', error);
    process.exit(1);
  }
}

updateLeaveBalance().then(() => process.exit(0));
