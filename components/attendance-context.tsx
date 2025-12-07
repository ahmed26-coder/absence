"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { AttendanceData, Student } from "@/lib/types"
import {
  getStorageData,
  addStudentToSupabase,
  deleteStudentFromSupabase,
  updateAttendanceInSupabase,
  updateStudentInSupabase,
} from "@/lib/supabase-storage"

interface AttendanceContextType {
  data: AttendanceData
  addStudent: (name: string) => Promise<Student | null>
  deleteStudent: (studentId: string) => void
  updateAttendance: (studentId: string, date: string, status: string | null, reason?: string) => void
  updateStudent: (studentId: string, name: string) => void
  refreshData: () => void
  isLoading: boolean
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined)

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AttendanceData>({ students: [], lastUpdated: new Date().toISOString() })
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
    async (name: string) => {
      try {
        setIsLoading(true)
        const created = await addStudentToSupabase(name)
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
    async (studentId: string, name: string) => {
      try {
        setIsLoading(true)
        await updateStudentInSupabase(studentId, name)
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

  return (
    <AttendanceContext.Provider
      value={{ data, addStudent, deleteStudent, updateAttendance, updateStudent, refreshData, isLoading }}
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
