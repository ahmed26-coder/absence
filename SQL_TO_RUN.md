# Apply This SQL to Your Supabase Database

## Copy the SQL below and run it in Supabase SQL Editor

Go to: https://app.supabase.com → Your Project → SQL Editor → New Query

### Paste this entire block:

```sql
-- Migration: Add course_id to attendance table for course-specific attendance tracking
-- This migration adds a foreign key relationship and updates the unique constraint

-- 1. Add course_id column if it doesn't exist
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES courses(id) ON DELETE CASCADE;

-- 2. Drop old unique constraint if it exists
ALTER TABLE attendance
DROP CONSTRAINT IF EXISTS attendance_student_id_date_key;

-- 3. Create new unique constraint including course_id
-- Note: This allows null course_id for global/unfiled attendance
ALTER TABLE attendance
ADD CONSTRAINT attendance_student_id_course_id_date_key UNIQUE (student_id, course_id, date);

-- 4. Add index for faster queries by course
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON attendance(course_id);
```

## After running:

1. Click **Run** button
2. Wait for success ✓
3. Hard refresh your app (Ctrl+Shift+R)
4. Try updating attendance again - it should work!

## To verify it worked:

In Supabase SQL Editor, run:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'attendance' ORDER BY ordinal_position;
```

You should see a `course_id` column with type `uuid`.

---

**That's it!** Your database is now ready for course-specific attendance. 🎉
