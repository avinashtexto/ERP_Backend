-- Add leave balances for employee ID 6 (Avinash Magar)
-- Insert annual leave record for current year
INSERT INTO "sal_annual_leave" ("pk_sal_id", "fk_emp_id", "cal_year", "al_roff", "py_bal", "tot_al")
VALUES ('al_emp6_2026', '6', 2026, '0', '0', '12')
ON CONFLICT ("fk_emp_id", "cal_year") DO NOTHING;

-- Insert salary structure record for employee 6 with leave entitlements
INSERT INTO "sal_structure" ("pk_ss_id", "fk_emp_id", "sal_start", "revise", "sl", "cl", "ucl", "r_day_i", "r_day_ii", "sandwich")
VALUES (1006, 6, '2024-01-01', '2026-12-31', '6', '6', '3', '0', '0', false)
ON CONFLICT DO NOTHING;
