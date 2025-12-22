-- Migration: Add course_type column to courses table
-- This migration adds support for different course visibility types

-- 1. Add course_type column with default value 'public'
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS course_type text DEFAULT 'public'
CHECK (course_type IN ('public', 'private', 'women_only'));

-- 2. Add index for faster filtering by course type
CREATE INDEX IF NOT EXISTS idx_courses_course_type ON courses(course_type);

-- 3. Add comment for documentation
COMMENT ON COLUMN courses.course_type IS 'Course visibility type: public (default), private, or women_only';

-- 4. Update existing courses to have 'public' type if null
UPDATE courses
SET course_type = 'public'
WHERE course_type IS NULL;
