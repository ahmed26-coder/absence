import { createClient as createBrowserClient } from "./supabase/client"
import type {
    Notification,
    NotificationType,
    NotificationPriority,
    NotificationTargetType,
    NotificationChannel
} from "./types"

export interface SendNotificationPayload {
    type: NotificationType
    priority: NotificationPriority
    title: string
    content: string
    target_type: NotificationTargetType
    target_ids: string[]
    channels: NotificationChannel[]
}

export const createNotification = async (payload: SendNotificationPayload, supabaseClient?: any) => {
    try {
        const supabase = supabaseClient || createBrowserClient()
        if (!supabase) return null

        // 1. Insert Notification Template
        const { data: notification, error: notifError } = await supabase
            .from("notifications")
            .insert([{
                type: payload.type,
                priority: payload.priority,
                title: payload.title,
                content: payload.content,
                target_type: payload.target_type,
                target_ids: payload.target_ids,
                channels: payload.channels
            }])
            .select()
            .single()

        if (notifError || !notification) {
            console.error("Error creating notification template:", notifError)
            return null
        }

        // 2. Identify Recipients
        let studentIds: string[] = []

        if (payload.target_type === "all") {
            const { data: profiles } = await supabase.from("profiles").select("id")
            studentIds = (profiles || []).map((p: any) => p.id)
        } else if (payload.target_type === "student") {
            studentIds = payload.target_ids
        } else if (payload.target_type === "course") {
            const { data: enrollments } = await supabase
                .from("student_courses")
                .select("student_id")
                .in("course_id", payload.target_ids)

            // Unique student IDs
            studentIds = Array.from(new Set((enrollments || []).map((e: any) => e.student_id)))
        }

        if (studentIds.length === 0) return notification

        // 3. Insert Recipients
        const recipientEntries = studentIds.map(sid => ({
            notification_id: notification.id,
            student_id: sid,
            sent_channels: payload.channels
        }))

        const { error: recipError } = await supabase
            .from("notification_recipients")
            .insert(recipientEntries)

        if (recipError) {
            console.error("Error creating notification recipients:", recipError)
        }

        // 4. Trigger External Channels (Mock)
        if (payload.channels.includes("email") || payload.channels.includes("whatsapp")) {
            const { data: recipientDetails } = await supabase
                .from("profiles")
                .select("id, email, phone, full_name")
                .in("id", studentIds)

            recipientDetails?.forEach((recipient: any) => {
                if (payload.channels.includes("email") && recipient.email) {
                    console.log(`[MOCK EMAIL] Sending to ${recipient.full_name} (${recipient.email}): ${payload.title}`);
                }
                if (payload.channels.includes("whatsapp") && recipient.phone) {
                    console.log(`[MOCK WHATSAPP] Sending to ${recipient.full_name} (${recipient.phone}): ${payload.title}`);
                }
            })
        }

        return notification
    } catch (error) {
        console.error("Unexpected error in createNotification:", error)
        return null
    }
}

export const getStudentNotifications = async (studentId: string, supabaseClient?: any) => {
    try {
        const supabase = supabaseClient || createBrowserClient()
        if (!supabase) return []

        const { data, error } = await supabase
            .from("notification_recipients")
            .select(`
        *,
        notification:notifications(*)
      `)
            .eq("student_id", studentId)
            .order("created_at", { referencedTable: "notifications", ascending: false })

        if (error) {
            console.error("Error fetching student notifications:", error)
            return []
        }

        return data
    } catch (error) {
        console.error("Unexpected error in getStudentNotifications:", error)
        return []
    }
}

export const markNotificationAsRead = async (recipientId: string, supabaseClient?: any) => {
    try {
        const supabase = supabaseClient || createBrowserClient()
        if (!supabase) return false

        const { error } = await supabase
            .from("notification_recipients")
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq("id", recipientId)

        return !error
    } catch (error) {
        console.error("Error marking notification as read:", error)
        return false
    }
}

export const getCourseNotifications = async (courseId: string, supabaseClient?: any) => {
    try {
        const supabase = supabaseClient || createBrowserClient()
        if (!supabase) return []

        // Fetch notifications where courseId is in target_ids AND target_type is 'course'
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("target_type", "course")
            .contains("target_ids", [courseId])
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching course notifications:", error)
            return []
        }

        return data as Notification[]
    } catch (error) {
        console.error("Unexpected error in getCourseNotifications:", error)
        return []
    }
}
