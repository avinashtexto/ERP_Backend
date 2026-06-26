-- MANUAL SQL SCRIPT TO UPDATE LEAVE BALANCE
-- Run this script directly on your database using psql or your database admin tool
-- Replace 'YOUR_DATABASE_NAME' with your actual database name

-- Step 1: Insert leave balance for employees who don't have a record for current year
-- Uses previous year's balance if available, otherwise 0 (no static defaults)
INSERT INTO sal_annual_leave (pk_sal_id, fk_emp_id, cal_year, al_roff, py_bal, tot_al)
SELECT 
    'AL_' || se.pk_emp_id || '_' || EXTRACT(YEAR FROM CURRENT_DATE) as pk_sal_id,
    se.pk_emp_id as fk_emp_id,
    EXTRACT(YEAR FROM CURRENT_DATE) as cal_year,
    '0' as al_roff,
    COALESCE(prev_year.tot_al, '0') as py_bal,  -- Use previous year's total if available
    '0' as tot_al  -- No static default - will be updated when data is available
FROM sal_employee se
LEFT JOIN sal_annual_leave prev_year ON 
    prev_year.fk_emp_id = se.pk_emp_id 
    AND prev_year.cal_year = EXTRACT(YEAR FROM CURRENT_DATE) - 1
WHERE NOT EXISTS (
    SELECT 1 FROM sal_annual_leave sal 
    WHERE sal.fk_emp_id = se.pk_emp_id 
    AND sal.cal_year = EXTRACT(YEAR FROM CURRENT_DATE)
);

-- Note: This script only creates the record structure with database-derived values.
-- The actual tot_al (total annual leave) should be populated through HR processes
-- or salary structure settings, not through static defaults.

-- Verify the update
SELECT fk_emp_id, cal_year, tot_al, py_bal, al_roff 
FROM sal_annual_leave 
WHERE cal_year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY fk_emp_id;
