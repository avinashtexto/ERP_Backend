export * from './app-user.schema.js';
export * from './new-id.schema.js';
export * from './app-user-right.schema.js';
export * from './app-user-report.schema.js';
export * from './app-user-other.schema.js';
export * from './app-user-special.schema.js';
export * from './app-user-branch.schema.js';
export * from './app-user-dashboard.schema.js';
export * from './app-user-process.schema.js';
export * from './attendance.schema.js';
export * from './auth.schema.js';
export * from './account-book.schema.js';
export * from './acct-group.schema.js';
export * from './app-questions.schema.js';
export * from './email-config.schema.js';
// Master Salary Schemas
export * from './sal-religion.schema.js';
export * from './sal-castes.schema.js';
export * from './sal-schedule-type.schema.js';
export * from './sal-skintone.schema.js';
export * from './sal-nature-of-work.schema.js';
export * from './sal-it-section.schema.js';

// Master Employee Schemas
export * from './sal-employees.schema.js';
export * from './sal-emp-contact.schema.js';
export * from './sal-emp-documents.schema.js';

// Master Contacts Schemas

export * from './cont-department.schema.js';
export * from './cont-designation.schema.js';
export * from './cont-qualification.schema.js';
export * from './cont-relationship.schema.js';
export * from './cont-title.schema.js';
export * from './cont-category.schema.js';
export * from './cont-mode-of-contact.schema.js';
export * from './cont-moc-type.schema.js';
export * from './cont-country.schema.js';
export * from './cont-state.schema.js';
export * from './cont-city.schema.js';
export * from './cont-address.schema.js';
export * from './cont-common.schema.js';
export * from './cont-region.schema.js';
export * from './cont-individual.schema.js';

// Leave Request module schemas
export * from './sal_annual_leave.schema.js';
export * from './sal_leave_encashment.schema.js';
export * from './sal_holidays.schema.js';
export * from './sal_sel_holidays.schema.js';
export * from './sal_attendance.schema.js';
export * from './sal_m_attendance.schema.js';
export * from './sal_m_atten_date.schema.js';
export * from './sal_leave_request.schema.js';
export * from './sal_lr_details.schema.js';
export * from './hr_notification.schema.js';
export * from './sal_structure.schema.js';
export * from './sal_shift_timing.schema.js';
export * from './temp_table.schema.js';

// Loan Request module schemas
export * from './sal-loan.schema.js';
export * from './sal-loan-schedule.schema.js';

// Personal Work module schemas
export * from './sal-personal-work.schema.js';

// Office Boy module schemas
export * from './sal-office-boy.schema.js';
export * from './sal-office-boy-task.schema.js';

// Snake case aliases for compatibility
export { appUser as app_user } from './app-user.schema.js';
export { appUserRight as app_user_right } from './app-user-right.schema.js';
export { contDepartment as cont_department } from './cont-department.schema.js';
export { contDesignation as cont_designation } from './cont-designation.schema.js';
export { salEmployee as sal_employee } from './sal-employees.schema.js';
export * from './hr-announcement.schema.js';
export * from './user-devices.schema.js';
export * from './sal-comp-employees.schema.js';



