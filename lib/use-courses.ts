"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from "react"

import type { CourseOverview } from "./course-data"
import { deleteCourseById, getStoredCourses, saveCourses, upsertCourse } from "./course-storage"

export const useCourses = () => {
  const [courses, setCourses] = useState<CourseOverview[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setCourses(getStoredCourses())
    setHydrated(true)
  }, [])

  const addOrUpdateCourse = useCallback((course: CourseOverview) => {
    const next = upsertCourse(course)
    setCourses(next)
    return next
  }, [])

  const removeCourse = useCallback((id: string) => {
    const next = deleteCourseById(id)
    setCourses(next)
    return next
  }, [])

  const setAllCourses = useCallback((list: CourseOverview[]) => {
    saveCourses(list)
    setCourses(list)
  }, [])

  return { courses, hydrated, addOrUpdateCourse, removeCourse, setAllCourses }
}
