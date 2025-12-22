"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock, Users, XCircle, Calendar, MapPin, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-provider"
import { updateAttendanceInSupabase } from "@/lib/supabase-storage"
import type { Course } from "@/lib/types"

interface StudentCourseDetailClientProps {
    course: Course
    studentId: string
    isEnrolled: boolean
    initialAttendance: any[]
}

const StatsCard = ({
    label,
    value,
    icon: Icon,
    tone = "default",
}: {
    label: string
    value: number | string
    icon: any
    tone?: "default" | "success" | "danger" | "muted"
}) => {
    const toneClasses =
        tone === "success"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : tone === "danger"
                ? "bg-rose-50 text-rose-700 border-rose-100"
                : tone === "muted"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-slate-50 text-slate-800 border-slate-100"

    return (
        <div className={`flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm ${toneClasses}`}>
            <div className="space-y-1">
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-2xl font-black">{value}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-current shadow-inner">
                <Icon size={18} />
            </span>
        </div>
    )
}

export default function StudentCourseDetailClient({
    course,
    studentId,
    isEnrolled,
    initialAttendance
}: StudentCourseDetailClientProps) {
    const { pushToast } = useToast()
    const [attendance, setAttendance] = useState(initialAttendance)
    const today = new Date().toISOString().split("T")[0]

    const handleAttendance = async (status: "H" | "G" | "E") => {
        if (!isEnrolled) {
            pushToast("يجب أن تكون مسجلاً في الدورة لتسجيل الحضور", "error")
            return
        }

        const success = await updateAttendanceInSupabase(studentId, course.id, today, status)

        if (success) {
            setAttendance(prev => {
                const filtered = prev.filter(r => !(r.date === today))
                return [...filtered, {
                    student_id: studentId,
                    course_id: course.id,
                    date: today,
                    status,
                }]
            })
            pushToast("تم تسجيل حالتك بنجاح", "success")
        } else {
            pushToast("فشل تسجيل الحالة", "error")
        }
    }

    const stats = useMemo(() => {
        const total = attendance.length
        const present = attendance.filter(r => r.status === 'H').length
        const absent = attendance.filter(r => r.status === 'G').length
        const excused = attendance.filter(r => r.status === 'E').length

        const todayRecord = attendance.find(r => r.date === today)

        return { total, present, absent, excused, todayStatus: todayRecord?.status }
    }, [attendance, today])

    return (
        <div className="min-h-screen bg-emerald-50">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">

                {/* Header */}
                <div className="flex flex-col gap-3 text-start" dir="rtl">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link href="/student/courses" className="inline-flex items-center gap-1 text-emerald-600 hover:underline">
                            <ArrowRight size={14} className="rotate-180" />
                            عودة إلى دوراتي
                        </Link>
                        <span className="text-gray-300">/</span>
                        <span className="font-semibold text-gray-900">{course.name}</span>
                    </div>
                </div>

                {/* Course Info Card */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-start" dir="rtl">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-4 flex-1">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 mb-2">{course.name}</h1>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                                    {course.description || "لا يوجد وصف للدورة حالياً."}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Users size={16} className="text-emerald-600" />
                                    <span>الشيخ: <span className="font-semibold text-gray-900">{course.instructor || "غير محدد"}</span></span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Calendar size={16} className="text-blue-600" />
                                    <span>الجدول: <span className="font-semibold text-gray-900">{course.schedule || "غير محدد"}</span></span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <MapPin size={16} className="text-rose-600" />
                                    <span>الموقع: <span className="font-semibold text-gray-900">{course.location || "غير محدد"}</span></span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <BookOpen size={16} className="text-amber-600" />
                                    <span>المستوى: <span className="font-semibold text-gray-900">{course.level || "غير محدد"}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col gap-2 min-w-[150px]">
                            {isEnrolled ? (
                                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} />
                                    مسجل في الدورة
                                </div>
                            ) : (
                                <div className="bg-gray-50 text-gray-500 border border-gray-200 px-4 py-2 rounded-xl text-center font-medium text-sm">
                                    غير مسجل
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">إحصائياتي في الدورة</h2>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                            <StatsCard label="عدد مرات الحضور" value={stats.present} icon={CheckCircle2} tone="success" />
                            <StatsCard label="عدد مرات الغياب" value={stats.absent} icon={XCircle} tone="danger" />
                            <StatsCard label="عدد مرات العذر" value={stats.excused} icon={Clock} tone="muted" />
                        </div>

                        {/* Attendance Action */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">تسجيل الحضور اليومي</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        التاريخ: <span dir="ltr" className="font-mono font-medium">{today}</span>
                                    </p>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    <Button
                                        onClick={() => handleAttendance("H")}
                                        variant={stats.todayStatus === 'H' ? 'default' : 'outline'}
                                        className={`flex-1 md:flex-none gap-2 font-bold ${stats.todayStatus === 'H' ? "bg-emerald-600 hover:bg-emerald-700" : "hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"}`}
                                        disabled={!isEnrolled}
                                    >
                                        <CheckCircle2 size={16} />
                                        حاضر
                                    </Button>
                                    <Button
                                        onClick={() => handleAttendance("G")}
                                        variant={stats.todayStatus === 'G' ? 'destructive' : 'outline'}
                                        className="flex-1 md:flex-none gap-2 font-bold"
                                        disabled={!isEnrolled}
                                    >
                                        <XCircle size={16} />
                                        غائب
                                    </Button>
                                    <Button
                                        onClick={() => handleAttendance("E")}
                                        variant={stats.todayStatus === 'E' ? 'secondary' : 'outline'}
                                        className="flex-1 md:flex-none gap-2 font-bold"
                                        disabled={!isEnrolled}
                                    >
                                        <Clock size={16} />
                                        عذر
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
