
-- 1. Enable RLS on debts table
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can manage all debts" ON public.debts;
DROP POLICY IF EXISTS "Students can view their own debts" ON public.debts;

-- 3. Create policy for Admins
-- This allows users with the 'admin' role in user_roles table to perform any action on debts
CREATE POLICY "Admins can manage all debts"
ON public.debts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 4. Create policy for Students
-- This allows students to see only their own debt records
CREATE POLICY "Students can view their own debts"
ON public.debts FOR SELECT
USING (auth.uid() = student_id);

-- 5. Allow students to insert their own debts (if needed for profile completion)
DROP POLICY IF EXISTS "Students can insert their own debts" ON public.debts;
CREATE POLICY "Students can insert their own debts"
ON public.debts FOR INSERT
WITH CHECK (auth.uid() = student_id);
