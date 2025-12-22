"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { User, Mail, Phone, Calendar, BookOpen, BarChart3, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AttendanceRecord {
    id: string
    student_id: string
    course_id: string | null
    date: string
    status: "H" | "G" | "E" | null
    reason?: string
}

interface Course {
    id: string
    name: string
    type?: string
}

interface Student {
    id: string
    name: string
    email?: string
    phone?: string
    age?: number
    notes?: string
}

interface StudentProfileClientProps {
    student: Student
    courses: Course[]
    attendanceRecords: AttendanceRecord[]
}

export default function StudentProfileClient({
    student,
    courses,
    attendanceRecords,
}: StudentProfileClientProps) {
    // Calculate statistics per course
    const courseStats = useMemo(() => {
        return courses.map((course) => {
            const courseAttendance = attendanceRecords.filter(
                (record) => record.course_id === course.id
            )

            const totalSessions = courseAttendance.length
            const present = courseAttendance.filter((r) => r.status === "H").length
            const absent = courseAttendance.filter((r) => r.status === "G").length
            const excused = courseAttendance.filter((r) => r.status === "E").length

            const attendancePercentage =
                totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0

            // Get most recent session
            const recentSession = courseAttendance[0]

            return {
                courseId: course.id,
                courseName: course.name,
                totalSessions,
                present,
                absent,
                excused,
                attendancePercentage,
                recentSession,
            }
        })
    }, [courses, attendanceRecords])

    const getStatusDisplay = (status: string | null) => {
        if (status === "H") return { label: "حاضر", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2 }
        if (status === "G") return { label: "غياب", color: "text-red-700", bg: "bg-red-100", icon: XCircle }
        if (status === "E") return { label: "عذر", color: "text-yellow-700", bg: "bg-yellow-100", icon: AlertCircle }
        return { label: "-", color: "text-gray-700", bg: "bg-gray-100", icon: AlertCircle }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="rounded-3xl border border-border/60 bg-white/90 p-6 shadow-md backdrop-blur"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 mb-2">
                                <User size={14} />
                                ملف الطالب
                            </p>
                            <h1 className="text-3xl font-black text-foreground">{student.name}</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                عرض شامل لبيانات الطالب وسجل الحضور في جميع الدورات
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/students">العودة للطلاب</Link>
                        </Button>
                    </div>
                </motion.div>

                {/* Student Info Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Mail size={16} />
                                البريد الإلكتروني
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-foreground break-words">{student.email || "—"}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Phone size={16} />
                                رقم الهاتف
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-foreground">{student.phone || "—"}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Calendar size={16} />
                                العمر
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-foreground">{student.age || "—"}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Notes Section */}
                {student.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">ملاحظات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">{student.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Enrolled Courses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen size={20} />
                            الدورات المسجل بها ({courses.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {courseStats.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">لا توجد دورات مسجلة</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {courseStats.map((stat) => {
                                    const statusInfo = getStatusDisplay(stat.recentSession?.status || null)
                                    const StatusIcon = statusInfo.icon

                                    return (
                                        <div
                                            key={stat.courseId}
                                            className="rounded-xl border border-border/60 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/70 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <div>
                                                    <h3 className="text-base font-bold text-foreground">{stat.courseName}</h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        إجمالي الجلسات: {stat.totalSessions}
                                                    </p>
                                                </div>
                                                <Link href={`/courses/${stat.courseId}`}>
                                                    <Button size="sm" variant="outline" className="text-xs">
                                                        عرض الدورة
                                                    </Button>
                                                </Link>
                                            </div>

                                            {/* Attendance Stats */}
                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                                <div className="rounded-lg bg-green-50 p-2 text-center">
                                                    <p className="text-xs text-green-600 mb-1">حاضر</p>
                                                    <p className="text-lg font-bold text-green-800">{stat.present}</p>
                                                </div>
                                                <div className="rounded-lg bg-red-50 p-2 text-center">
                                                    <p className="text-xs text-red-600 mb-1">غياب</p>
                                                    <p className="text-lg font-bold text-red-800">{stat.absent}</p>
                                                </div>
                                                <div className="rounded-lg bg-yellow-50 p-2 text-center">
                                                    <p className="text-xs text-yellow-600 mb-1">عذر</p>
                                                    <p className="text-lg font-bold text-yellow-800">{stat.excused}</p>
                                                </div>
                                            </div>

                                            {/* Attendance Percentage */}
                                            <div className="space-y-1 mb-3">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">نسبة الحضور</span>
                                                    <span className="font-semibold text-foreground">{stat.attendancePercentage}%</span>
                                                </div>
                                                <Progress value={stat.attendancePercentage} className="h-2" />
                                            </div>

                                            {/* Most Recent Session */}
                                            {stat.recentSession && (
                                                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                                    <span className="text-xs text-muted-foreground">آخر جلسة:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium">{stat.recentSession.date}</span>
                                                        <Badge className={`${statusInfo.bg} ${statusInfo.color} hover:${statusInfo.bg} flex items-center gap-1`}>
                                                            <StatusIcon size={12} />
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
