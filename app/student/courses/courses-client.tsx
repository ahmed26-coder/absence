"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, CheckCircle2, Search, ChevronDown, ChevronUp, Percent, Clock, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/toast-provider"
import { enrollInCourse, updateAttendanceInSupabase } from "@/lib/supabase-storage"
import type { Course } from "@/lib/types"

interface StudentCoursesClientProps {
    initialAllCourses: Course[]
    initialEnrolledIds: string[]
    studentId: string
}

export default function StudentCoursesClient({
    initialAllCourses,
    initialEnrolledIds,
    studentId,
}: StudentCoursesClientProps) {
    const [view, setView] = useState<"my" | "all">("my")
    const [enrolledIds, setEnrolledIds] = useState<string[]>(initialEnrolledIds)
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const { pushToast } = useToast()

    const handleJoin = async (courseId: string) => {
        setIsLoading(courseId)
        const ok = await enrollInCourse(studentId, courseId)
        if (ok) {
            setEnrolledIds((prev) => [...prev, courseId])
            pushToast("تم الانضمام للدورة بنجاح", "success")
        } else {
            pushToast("فشل الانضمام للدورة", "error")
        }
        setIsLoading(null)
    }

    const enrolledCourses = initialAllCourses.filter((c) => enrolledIds.includes(c.id))
    const availableCourses = initialAllCourses // We show all in browse mode, but with state

    const typeLabels: Record<string, string> = {
        public: "عامة",
        private: "خاصة",
        women: "للنساء فقط"
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-900">إدارة الدورات</h1>
                <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setView("my")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === "my" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        دوراتي ({enrolledCourses.length})
                    </button>
                    <button
                        onClick={() => setView("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === "all" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        استعراض الكل
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {view === "my" ? (
                    enrolledCourses.length > 0 ? (
                        enrolledCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                isEnrolled={true}
                                typeLabels={typeLabels}
                            />
                        ))
                    ) : (
                        <Card className="col-span-full border-dashed p-12 text-center bg-gray-50/50">
                            <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                                <BookOpen size={48} />
                                <p className="text-lg">لست مسجلاً في أي دورة حالياً</p>
                                <Button onClick={() => setView("all")} className="bg-emerald-600 hover:bg-emerald-700">
                                    <Search className="ml-2 h-4 w-4" />
                                    استعراض الدورات المتاحة
                                </Button>
                            </div>
                        </Card>
                    )
                ) : (
                    availableCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isEnrolled={enrolledIds.includes(course.id)}
                            onJoin={() => handleJoin(course.id)}
                            isLoading={isLoading === course.id}
                            typeLabels={typeLabels}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

function CourseCard({
    course,
    isEnrolled,
    onJoin,
    isLoading,
    typeLabels,
}: {
    course: Course
    isEnrolled: boolean
    onJoin?: () => void
    isLoading?: boolean
    typeLabels: Record<string, string>
}) {
    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md ${isEnrolled ? 'border-emerald-100 bg-white' : 'border-gray-100 bg-white'}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <Badge variant={course.course_type === 'women' ? 'destructive' : 'secondary'} className="mb-2">
                        {typeLabels[course.course_type] || course.course_type}
                    </Badge>
                    {isEnrolled && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} />
                            تم الانضمام
                        </span>
                    )}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{course.name}</CardTitle>
                <CardDescription>{course.instructor || "نخبة من العلماء"}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 space-y-4">
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                    {course.description || "لا يوجد وصف متوفر لهذه الدورة حالياً."}
                </p>
            </CardContent>
            <CardFooter className="pt-0">
                {isEnrolled ? (
                    <Link href={`/student/courses/${course.id}`} className="w-full">
                        <Button className="w-full font-bold h-11 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900">
                            عرض التفاصيل وتسجيل الحضور
                        </Button>
                    </Link>
                ) : (
                    <Button
                        onClick={onJoin}
                        disabled={isLoading}
                        className="w-full font-bold h-11 rounded-xl transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                    >
                        {isLoading ? "جاري الانضمام..." : "انضم للدورة الآن"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
