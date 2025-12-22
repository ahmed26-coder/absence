-- Run this in Supabase SQL Editor to diagnose the issue
-- It will show the table structure and current policies

-- 1. Check table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'attendance';

-- 2. Check unique constraints
SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE contype = 'u' AND conname LIKE '%attendance%';

-- 3. Check RLS status
SELECT relname, relrowsecurity
FROM pg_class
WHERE oid = 'public.attendance'::regclass;

-- 4. Check policies
SELECT *
FROM pg_policies
WHERE tablename = 'attendance';
