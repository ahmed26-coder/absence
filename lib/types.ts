export type AttendanceStatus = "H" | "G" | "E" | null

export interface AttendanceRecord {
  status: AttendanceStatus
  reason?: string
  date?: string
}

export interface Student {
  id: string
  name: string // maps to full_name in DB
  attendance: Record<string, Record<string, AttendanceRecord>>
  courses?: string[]
  phone?: string
  email?: string
  notes?: string // maps to debt_description or similar
  age?: number
  total_debt?: number
  total_paid?: number
  warnings?: number
  avatar_url?: string
  gender?: "male" | "female"
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
  course_type: "public" | "private" | "women" // renamed from course_type and updated values
}

export type NotificationType = "general" | "educational" | "administrative" | "alert"
export type NotificationPriority = "normal" | "important" | "urgent"
export type NotificationTargetType = "student" | "course" | "all"
export type NotificationChannel = "website" | "email" | "whatsapp"

export interface Notification {
  id: string
  created_at: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  content: string
  target_type: NotificationTargetType
  target_ids: string[]
  channels: NotificationChannel[]
  created_by?: string
}

export interface NotificationRecipient {
  id: string
  notification_id: string
  student_id: string
  is_read: boolean
  read_at?: string
  sent_channels: NotificationChannel[]
  notification?: Notification // Joined data
}

