# Attendance System Migration Guide

## Overview
The attendance system has been refactored to support **course-specific attendance**. Instead of global attendance records, each attendance entry now belongs to a specific course, preventing cross-course data contamination.

## Database Migration

### Step 1: Apply the Supabase Migration
You need to run the SQL migration to add the `course_id` column to your `attendance` table.

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `migrations/001_add_course_id_to_attendance.sql`
4. Execute the query

**Option B: Using Supabase CLI** (if installed)
```bash
supabase db push
```

### Step 2: Verify the Migration
After running the migration, verify the changes:

```sql
-- Check the attendance table structure
\d attendance

-- Verify the new constraint exists
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'attendance' AND constraint_type = 'UNIQUE';
```

The output should show:
- Column `course_id` (uuid, nullable, foreign key to `courses.id`)
- Unique constraint: `attendance_student_id_course_id_date_key`

## Code Changes

### TypeScript Type Changes
- `Student.attendance` structure changed from:
  ```typescript
  Record<string, AttendanceRecord>  // date -> record
  ```
  to:
  ```typescript
  Record<string, Record<string, AttendanceRecord>>  // courseId -> date -> record
  ```

### API Changes

#### `updateAttendance()`
**Old signature:**
```typescript
updateAttendance(studentId: string, date: string, status: AttendanceStatus, reason?: string)
```

**New signature:**
```typescript
updateAttendance(studentId: string, courseId: string | null, date: string, status: AttendanceStatus, reason?: string)
```

#### `getAttendanceRecord()`
**New helper function:**
```typescript
getAttendanceRecord(student: Student, date: string, courseId?: string | null): AttendanceRecord | null
```
- If `courseId` specified: returns attendance for that course
- If `courseId` not specified: returns attendance from any course for that date

#### `getStudentStats()`
**Updated signature:**
```typescript
getStudentStats(
  student: Student, 
  startDate?: string | null, 
  endDate?: string | null, 
  courseId?: string | null  // NEW: optional course filter
): Statistics
```

## Data Compatibility

### Old Data Migration
If you have existing attendance records without `course_id`:
1. They will continue to work (course_id is nullable)
2. Use the following SQL to assign them to courses based on student enrollment:

```sql
UPDATE attendance a
SET course_id = sc.course_id
FROM student_courses sc
WHERE a.student_id = sc.student_id
AND a.course_id IS NULL
LIMIT 1000;  -- Run in batches if you have many records
```

Or to assign all to a single default course:
```sql
UPDATE attendance
SET course_id = 'your-default-course-uuid'
WHERE course_id IS NULL;
```

## Backward Compatibility

The code now supports **both** the old and new schema:
- If the new constraint `(student_id, course_id, date)` doesn't exist, it falls back to the legacy `(student_id, date)` constraint
- This allows gradual migration without downtime
- Enhanced error logging helps identify schema-related issues

## Testing the Changes

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test attendance updates:**
   - Navigate to a course page
   - Update a student's attendance for the course
   - Verify the update appears only for that course

3. **Verify isolation:**
   - Add a student to multiple courses
   - Update attendance in one course
   - Confirm it doesn't affect the other course

4. **Check the database:**
   ```sql
   SELECT student_id, course_id, date, status FROM attendance 
   WHERE student_id = 'your-test-student-id'
   ORDER BY date DESC;
   ```

## Troubleshooting

### "Error updating attendance: {}"
This usually means:
1. The migration hasn't been applied yet → Apply the SQL migration
2. The environment variables are missing → Check `.env.local`
3. Supabase credentials are invalid → Verify connection

### Attendance not showing in course view
1. Check that the record has a `course_id` set
2. Verify the student is enrolled in that course
3. Check browser console for detailed error messages

## Support

For issues or questions about the migration, refer to:
- `lib/supabase-storage.ts` – Updated storage functions with fallback logic
- `lib/storage.ts` – Updated localStorage functions for new structure
- `migrations/001_add_course_id_to_attendance.sql` – The SQL migration script
