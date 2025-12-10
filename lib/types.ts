export type AttendanceStatus = "H" | "G" | "E" | null

export interface AttendanceRecord {
  status: AttendanceStatus
  reason?: string
  date?: string
}

export interface Student {
  id: string
  name: string
  // attendance is now scoped by course: { [courseId]: { [date]: AttendanceRecord } }
  // we keep string keys so a 'global' or null-course entries can be represented if needed
  attendance: Record<string, Record<string, AttendanceRecord>>
  courses?: string[]
  phone?: string
  email?: string
  notes?: string
  age?: number
  debt?: number
  warnings?: number
}

export interface AttendanceData {
  students: Student[]
  courses: Course[]
  lastUpdated: string
}

export interface Statistics {
  present: number
  absent: number
  excused: number
  presentPercentage: number
  absentPercentage: number
  excusedPercentage: number
}

export interface Course {
  id: string
  name: string
  instructor?: string
  schedule?: string
  level?: string
  focus?: string
  location?: string
  color?: string
  description?: string
  notes?: string
}
