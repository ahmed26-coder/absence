-- FIX RLS POLICIES FOR ATTENDANCE TABLE

-- 1. Enable RLS (just in case)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing conflicting policies to ensure a clean slate
DROP POLICY IF EXISTS "Students can manage their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can insert their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can update their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance;

-- 3. Create comprehensive policies for Students

-- Allow SELECT (View)
CREATE POLICY "Students can view their own attendance"
ON public.attendance FOR SELECT
USING (auth.uid() = student_id);

-- Allow INSERT (Add)
CREATE POLICY "Students can insert their own attendance"
ON public.attendance FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Allow UPDATE (Edit)
CREATE POLICY "Students can update their own attendance"
ON public.attendance FOR UPDATE
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- 4. Create comprehensive policies for Admins
CREATE POLICY "Admins can do everything with attendance"
ON public.attendance FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
