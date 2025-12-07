export type AttendanceStatus = "H" | "G" | "E" | null

export interface AttendanceRecord {
  date: string
  status: AttendanceStatus
  reason?: string
}

export interface Student {
  id: string
  name: string
  attendance: Record<string, AttendanceRecord>
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
