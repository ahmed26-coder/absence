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
}

export interface AttendanceData {
  students: Student[]
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