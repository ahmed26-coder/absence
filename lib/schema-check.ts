import { getSupabaseClient } from "./supabase"

/**
 * Check if the Supabase schema has been migrated to support course-specific attendance
 * This is a one-time check that runs at app initialization
 */
export const checkAttendanceSchema = async (): Promise<{
  hasCourseId: boolean
  message: string
}> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return {
        hasCourseId: false,
        message: "Supabase not configured"
      }
    }

    // Try a simple query to the attendance table to check schema
    const { error } = await supabase
      .from("attendance")
      .select("course_id")
      .limit(1)

    if (error) {
      // If we get a column not found error, schema hasn't been migrated
      if (error.message?.includes("course_id") || error.code === "42703") {
        return {
          hasCourseId: false,
          message: "⚠️ Database schema needs migration. Please run: migrations/001_add_course_id_to_attendance.sql"
        }
      }
      throw error
    }

    return {
      hasCourseId: true,
      message: "✓ Attendance schema is up to date"
    }
  } catch (error) {
    console.warn("[schema-check] Warning:", error)
    return {
      hasCourseId: false,
      message: "Could not verify schema. Continuing with fallback mode."
    }
  }
}
