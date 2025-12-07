"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { AttendanceData, Student, Course } from "@/lib/types"
import {
  getStorageData,
  addStudentToSupabase,
  deleteStudentFromSupabase,
  updateAttendanceInSupabase,
  updateStudentInSupabase,
  addCourseToSupabase,
  updateCourseInSupabase,
  deleteCourseFromSupabase,
} from "@/lib/supabase-storage"

interface AttendanceContextType {
  data: AttendanceData
  addStudent: (payload: Pick<Student, "name"> & Partial<Student> & { courses: string[] }) => Promise<Student | null>
  deleteStudent: (studentId: string) => void
  updateAttendance: (studentId: string, date: string, status: string | null, reason?: string) => void
  updateStudent: (studentId: string, updates: Partial<Omit<Student, "id" | "attendance">> & { courses?: string[] }) => void
  courses: Course[]
  addCourse: (course: Course) => Promise<Course | null>
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<boolean>
  deleteCourse: (courseId: string) => Promise<boolean>
  refreshData: () => void
  isLoading: boolean
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined)

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AttendanceData>({ students: [], courses: [], lastUpdated: new Date().toISOString() })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedData = await getStorageData()
        setData(loadedData)
      } catch (error) {
        console.error("[v0] Error loading data:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [])

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true)
      const loadedData = await getStorageData()
      setData(loadedData)
    } catch (error) {
      console.error("[v0] Error refreshing data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addStudent = useCallback(
    async (payload) => {
      try {
        setIsLoading(true)
        const created = await addStudentToSupabase(payload)
        await refreshData()
        return created
      } catch (error) {
        console.error("[v0] Error adding student:", error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [refreshData],
  )

  const deleteStudent = useCallback(
    async (studentId: string) => {
      try {
        setIsLoading(true)
        await deleteStudentFromSupabase(studentId)
        await refreshData()
      } catch (error) {
        console.error("[v0] Error deleting student:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [refreshData],
  )

  const updateAttendance = useCallback(
    async (studentId: string, date: string, status: string | null, reason?: string) => {
      try {
        setIsLoading(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updateAttendanceInSupabase(studentId, date, status as any, reason)
        await refreshData()
      } catch (error) {
        console.error("[v0] Error updating attendance:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [refreshData],
  )

  const updateStudent = useCallback(
    async (studentId: string, updates) => {
      try {
        setIsLoading(true)
        await updateStudentInSupabase(studentId, updates)
        await refreshData()
      } catch (error) {
        console.error("[v0] Error updating student:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [refreshData],
  )

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>
  }

  const addCourse = async (course: Course) => {
    try {
      setIsLoading(true)
      const created = await addCourseToSupabase(course)
      await refreshData()
      return created
    } catch (error) {
      console.error("[v0] Error adding course:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateCourse = async (courseId: string, updates: Partial<Course>) => {
    try {
      setIsLoading(true)
      const ok = await updateCourseInSupabase(courseId, updates)
      await refreshData()
      return ok
    } catch (error) {
      console.error("[v0] Error updating course:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCourse = async (courseId: string) => {
    try {
      setIsLoading(true)
      const ok = await deleteCourseFromSupabase(courseId)
      await refreshData()
      return ok
    } catch (error) {
      console.error("[v0] Error deleting course:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AttendanceContext.Provider
      value={{
        data,
        addStudent,
        deleteStudent,
        updateAttendance,
        updateStudent,
        refreshData,
        isLoading,
        courses: data.courses,
        addCourse,
        updateCourse,
        deleteCourse,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  )
}

export const useAttendance = () => {
  const context = useContext(AttendanceContext)
  if (!context) {
    throw new Error("useAttendance must be used within AttendanceProvider")
  }
  return context
}
