import type { CourseOverview } from "./course-data"

const COURSES_KEY = "courses_data"

const safeParse = (value: string | null): CourseOverview[] => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const getStoredCourses = (): CourseOverview[] => {
  if (typeof window === "undefined") return []
  return safeParse(localStorage.getItem(COURSES_KEY))
}

export const saveCourses = (courses: CourseOverview[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses))
}

export const upsertCourse = (course: CourseOverview) => {
  if (typeof window === "undefined") return []
  const current = getStoredCourses()
  const exists = current.some((c) => c.id === course.id)
  const next = exists ? current.map((c) => (c.id === course.id ? course : c)) : [...current, course]
  saveCourses(next)
  return next
}

export const deleteCourseById = (id: string) => {
  if (typeof window === "undefined") return []
  const next = getStoredCourses().filter((c) => c.id !== id)
  saveCourses(next)
  return next
}
