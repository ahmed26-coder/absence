# Quick Setup: Course-Specific Attendance

## The Problem You're Seeing
When updating attendance, you're getting the error:
```
[v0] Error updating attendance: {}
```

This happens because **your Supabase database schema hasn't been updated yet** to support course-specific attendance.

## Quick Fix (5 minutes)

### Step 1: Get the SQL Migration
The migration file is located at:
```
migrations/001_add_course_id_to_attendance.sql
```

### Step 2: Apply It to Supabase

**Method A: Using Supabase Web Dashboard (Easiest)**

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy **all** the SQL from `migrations/001_add_course_id_to_attendance.sql`
6. Paste it into the editor
7. Click **Run**
8. Wait for success message ✓

**Method B: Using Supabase CLI**

```bash
# If you have supabase CLI installed
supabase db push
```

### Step 3: Test It

After applying the migration:

1. Refresh your browser (hard refresh: Ctrl+Shift+R)
2. Go to a course page
3. Try updating a student's attendance
4. It should now work! ✓

## What the Migration Does

The SQL file makes these changes to your `attendance` table:

1. **Adds `course_id` column** - Associates each attendance record with a specific course
2. **Adds foreign key** - Ensures course_id references a valid course
3. **Updates unique constraint** - Changed from `(student_id, date)` to `(student_id, course_id, date)`
4. **Adds index** - Speeds up queries filtering by course

## If You Need Help

### "The migration failed with an error"
- Check that your Supabase credentials are correct
- Make sure you have admin access to the database
- Try running the query in smaller pieces if needed

### "Still getting the error after migration"
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console (F12) for detailed error messages
3. Verify the migration succeeded:
   - In Supabase dashboard, go to **Tables** → **attendance**
   - Scroll right to see if `course_id` column exists

### "How do I know if my database is updated?"
In Supabase SQL Editor, run:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'attendance';
```

You should see `course_id` in the list.

## Fallback Mode

If your database hasn't been migrated yet, the app will still work in **"fallback mode"**:
- Updates use the old `(student_id, date)` constraint
- All attendance goes to the "global" scope
- This is temporary – you should still apply the migration for full functionality

Once you apply the migration, everything will automatically use the new course-specific structure.

## Next Steps

After applying the migration:
1. Test updating attendance in different courses
2. Verify it doesn't affect other courses
3. Everything should work as intended!

## Documentation

For detailed information, see:
- `MIGRATION_GUIDE.md` - Full technical migration guide
- `lib/supabase-storage.ts` - Fallback logic and error handling
- `migrations/001_add_course_id_to_attendance.sql` - The actual SQL migration
