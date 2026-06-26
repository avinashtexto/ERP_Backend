-- =============================================================================
-- Reset & Re-seed: acct_group — all groups at level 0 (self-referencing roots)
-- IDs start from 1
-- =============================================================================

BEGIN;

-- Step 1: Delete previously seeded rows (IDs 143-157) ────────────────────────
DELETE FROM acct_group WHERE pk_grp_id BETWEEN 143 AND 157;

-- Step 2: Reset the identity sequence to 1 ───────────────────────────────────
ALTER TABLE acct_group ALTER COLUMN pk_grp_id RESTART WITH 1;

-- Step 3: Insert all 15 groups as self-referencing roots (level 0) ────────────
-- For each row: fk_main_id = fk_sub_id = fk_prt_id = own pk_grp_id
-- We use a temp table to stage names + attributes, then INSERT + UPDATE.

DO $$
DECLARE
  rec  RECORD;
  nid  INTEGER;
BEGIN
  FOR rec IN
    SELECT *
    FROM (VALUES
      --  name,                       grouping, prefix, dc
      ('Balance Sheet',               0,        'B',    'C'),
      ('Profit & Loss Group',         0,        'P',    'C'),
      ('Capital',                     1,        '+',    'C'),
      ('Current Liabilities',         2,        '+',    'C'),
      ('Long Term Liabilities',       3,        '+',    'C'),
      ('Provisions',                  4,        '+',    'C'),
      ('Current Assets',              5,        '+',    'D'),
      ('Fixed Assets',                6,        '+',    'D'),
      ('Investments',                 7,        '+',    'D'),
      ('Incomes',                     8,        '-',    'C'),
      ('Expenses',                    9,        '+',    'D'),
      ('Direct Incomes',             10,        '-',    'C'),
      ('Indirect Incomes',           11,        '-',    'C'),
      ('Direct Expenses',            12,        '+',    'D'),
      ('Indirect Expenses',          13,        '+',    'D')
    ) AS t(group_name, grouping, prefix, dc)
  LOOP
    -- Get next sequence value
    nid := nextval(pg_get_serial_sequence('acct_group', 'pk_grp_id'));

    -- Insert with all FK columns pointing to itself (self-referencing root)
    INSERT INTO acct_group
      (pk_grp_id, group_name, fk_main_id, fk_sub_id, fk_prt_id,
       grouping, prefix, dc, date_time_stamp, fk_user_id, last_status)
    OVERRIDING SYSTEM VALUE
    VALUES (
      nid,
      rec.group_name,
      nid, nid, nid,          -- all FK = self
      rec.grouping,
      rec.prefix,
      rec.dc,
      '2004-03-12 18:02:18',
      1,
      'Added'
    );

    RAISE NOTICE 'Inserted: % (id=%)', rec.group_name, nid;
  END LOOP;
END $$;

COMMIT;

-- Verify
SELECT pk_grp_id AS id, group_name, fk_main_id, fk_sub_id, fk_prt_id, dc
FROM acct_group
ORDER BY pk_grp_id;
