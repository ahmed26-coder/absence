-- =============================================================================
-- 004_security_hardening.sql
--
-- Closes the row-level-security gaps found in the audit. Because all writes in
-- this app go straight from the browser with the anon key, RLS is the ONLY
-- server-side authorization layer — every business rule that only lives in the
-- client is bypassable with a copy of the anon key.
--
-- ⚠️  REVIEW AND TEST IN STAGING BEFORE APPLYING TO PRODUCTION.
--     This file was authored from the schema in the other migrations and was
--     NOT executed against the live database. Verify table/column names and
--     the `courses.course_type` values before running.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. is_admin() — SECURITY DEFINER so it reads user_roles WITHOUT triggering
--    that table's RLS. Using it inside policies avoids the "infinite recursion
--    detected in policy" error you get when a user_roles policy queries
--    user_roles directly.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- 1. user_roles — the root of every admin policy, currently unprotected.
--    Without RLS a student can UPDATE their own row to role = 'admin' and gain
--    full access to every admin table.
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
CREATE POLICY "Users can read their own role"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

-- A user may create ONLY their own row and ONLY as a non-privileged 'user'.
-- (Prefer moving this to a trigger on auth.users so it also covers OAuth.)
DROP POLICY IF EXISTS "Users can create their own user role" ON public.user_roles;
CREATE POLICY "Users can create their own user role"
ON public.user_roles FOR INSERT
WITH CHECK ((user_id = auth.uid() AND role = 'user') OR public.is_admin());

-- Only admins may change or delete role rows (no self-escalation).
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. debts — a student could self-insert a row with amount_paid already set,
--    fabricating settled payments. Force amount_paid = 0 on student inserts.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can insert their own debts" ON public.debts;
CREATE POLICY "Students can insert their own debts"
ON public.debts FOR INSERT
WITH CHECK (
  public.is_admin()
  OR (auth.uid() = student_id AND COALESCE(amount_paid, 0) = 0 AND amount_owed > 0)
);

-- -----------------------------------------------------------------------------
-- 3. payment_requests — a student could file a request against ANY debt id and
--    for an arbitrary amount. Require ownership of the debt and cap the amount
--    at the remaining balance.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can insert their own requests" ON public.payment_requests;
CREATE POLICY "Students can insert their own requests"
ON public.payment_requests FOR INSERT
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM public.debts d
    WHERE d.id = debt_id
      AND d.student_id = auth.uid()
      AND amount <= (COALESCE(d.amount_owed, 0) - COALESCE(d.amount_paid, 0))
  )
);

-- -----------------------------------------------------------------------------
-- 4. notification_recipients — the student UPDATE policy lets a student rewrite
--    notification_id on their own row and read notifications never sent to them.
--    Lock the mutable columns to (is_read, read_at) with a trigger.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lock_notification_recipient_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.notification_id IS DISTINCT FROM OLD.notification_id
     OR NEW.student_id IS DISTINCT FROM OLD.student_id
     OR NEW.sent_channels IS DISTINCT FROM OLD.sent_channels THEN
    RAISE EXCEPTION 'Only is_read/read_at may be updated on notification_recipients';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_notification_recipient_columns ON public.notification_recipients;
CREATE TRIGGER trg_lock_notification_recipient_columns
BEFORE UPDATE ON public.notification_recipients
FOR EACH ROW EXECUTE FUNCTION public.lock_notification_recipient_columns();

-- -----------------------------------------------------------------------------
-- 5. student_courses — a FOR ALL "manage own enrollments" policy lets a student
--    enroll themselves into private/women-only courses. Restrict self-enroll to
--    public courses; leave restricted courses to admins.
--    NOTE: confirm the course_type value used for public courses ('public').
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can manage their own enrollments" ON public.student_courses;

DROP POLICY IF EXISTS "Students can enroll in public courses" ON public.student_courses;
CREATE POLICY "Students can enroll in public courses"
ON public.student_courses FOR INSERT
WITH CHECK (
  public.is_admin()
  OR (
    auth.uid() = student_id
    AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.course_type = 'public')
  )
);

DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.student_courses;
CREATE POLICY "Students can view their own enrollments"
ON public.student_courses FOR SELECT
USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "Students can unenroll themselves" ON public.student_courses;
CREATE POLICY "Students can unenroll themselves"
ON public.student_courses FOR DELETE
USING (auth.uid() = student_id OR public.is_admin());
