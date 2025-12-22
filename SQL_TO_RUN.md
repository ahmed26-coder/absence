# Apply This SQL to Your Supabase Database

## Migration 003: Course Enrollment System (Fixed)

Go to: https://app.supabase.com → Your Project → SQL Editor → New Query

### Paste this entire block:

```sql
-- 1. Create student_courses junction table
-- This table links students (auth.users) with courses
CREATE TABLE IF NOT EXISTS public.student_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (student_id, course_id)
);

-- 2. Enable RLS on student_courses
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;

-- 3. Comprehensive RLS Policies for student_courses
CREATE POLICY "Students can manage their own enrollments"
ON public.student_courses FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- 4. Admins can manage everything
CREATE POLICY "Admins can manage all enrollments"
ON public.student_courses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

## Migration 004: Course-Specific Attendance

Go to: https://app.supabase.com → Your Project → SQL Editor → New Query

### Paste this entire block:

```sql
-- 1. Add course_id column to attendance if it doesn't exist
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE;

-- 2. Drop old unique constraint if it exists
ALTER TABLE public.attendance
DROP CONSTRAINT IF EXISTS attendance_student_id_date_key;

-- 3. Create new unique constraint including course_id
ALTER TABLE public.attendance
ADD CONSTRAINT attendance_student_id_course_id_date_key UNIQUE (student_id, course_id, date);

-- 4. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON public.attendance(course_id);
```

## Migration 005: Attendance RLS Policies

Go to: https://app.supabase.com → Your Project → SQL Editor → New Query

### Paste this entire block:

```sql
-- 1. Enable RLS on attendance table (if not already enabled)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 2. Allow students to manage (Select, Insert, Update) their OWN attendance
DROP POLICY IF EXISTS "Students can manage their own attendance" ON public.attendance;
CREATE POLICY "Students can manage their own attendance"
ON public.attendance FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- 3. Allow admins to manage EVERYTHING
DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;
CREATE POLICY "Admins can manage all attendance"
ON public.attendance FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

## After running:

1. Click **Run** button for each block.
2. Wait for success ✓
3. Hard refresh your app (Ctrl+Shift+R)
4. Everything should now work perfectly!