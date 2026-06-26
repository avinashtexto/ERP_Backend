-- Migration to change pk_sal_id from varchar(50) to integer with auto-increment identity
-- Also change al_roff, py_bal, tot_al from varchar to integer
-- This migration alters the sal_annual_leave table to use integer primary key and integer values

-- Step 1: Create a new table with the correct schema
CREATE TABLE sal_annual_leave_new (
    pk_sal_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    fk_emp_id VARCHAR(50) NOT NULL,
    cal_year INTEGER NOT NULL,
    al_roff INTEGER DEFAULT 0,
    py_bal INTEGER DEFAULT 0,
    tot_al INTEGER DEFAULT 0
);

-- Step 2: Copy data from old table to new table (pk_sal_id will be auto-generated)
-- Convert varchar values to integer, defaulting to 0 if conversion fails
INSERT INTO sal_annual_leave_new (fk_emp_id, cal_year, al_roff, py_bal, tot_al)
SELECT 
    fk_emp_id, 
    cal_year, 
    COALESCE(CAST(NULLIF(al_roff, '') AS INTEGER), 0),
    COALESCE(CAST(NULLIF(py_bal, '') AS INTEGER), 0),
    COALESCE(CAST(NULLIF(tot_al, '') AS INTEGER), 0)
FROM sal_annual_leave;

-- Step 3: Drop the old table
DROP TABLE sal_annual_leave;

-- Step 4: Rename the new table to the original name
ALTER TABLE sal_annual_leave_new RENAME TO sal_annual_leave;

-- Step 5: Recreate the index on fk_emp_id and cal_year
CREATE INDEX idx_sal_annual_leave_emp_year ON sal_annual_leave(fk_emp_id, cal_year);
