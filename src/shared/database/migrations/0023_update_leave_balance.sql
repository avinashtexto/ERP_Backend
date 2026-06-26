-- Migration to update leave balance for all employees
-- This script ensures all employees have proper leave balance records for the current year

-- Update or insert leave balance for all active employees for the current year
-- Default annual leave: 12 days (can be adjusted based on company policy)

INSERT INTO sal_annual_leave (pk_sal_id, fk_emp_id, cal_year, al_roff, py_bal, tot_al)
SELECT 
    'AL_' || se.pk_emp_id || '_' || EXTRACT(YEAR FROM CURRENT_DATE) as pk_sal_id,
    se.pk_emp_id as fk_emp_id,
    EXTRACT(YEAR FROM CURRENT_DATE) as cal_year,
    '0' as al_roff,
    '0' as py_bal,
    '12' as tot_al  -- Default 12 days annual leave
FROM sal_employee se
WHERE NOT EXISTS (
    SELECT 1 FROM sal_annual_leave sal 
    WHERE sal.fk_emp_id = se.pk_emp_id 
    AND sal.cal_year = EXTRACT(YEAR FROM CURRENT_DATE)
);

-- Update existing records that have zero total annual leave
UPDATE sal_annual_leave
SET tot_al = '12'  -- Default 12 days annual leave
WHERE cal_year = EXTRACT(YEAR FROM CURRENT_DATE)
AND (tot_al = '0' OR tot_al IS NULL OR tot_al = '');

-- Optional: Update previous year balance if needed
-- This would typically be calculated based on leave carried over from previous year
-- For now, keeping it as '0' unless specified otherwise
