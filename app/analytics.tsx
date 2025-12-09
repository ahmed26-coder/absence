"use client"

import { useEffect, useState } from "react"
import { ShieldCheck } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Stats {
  totalStudents: number
  totalCourses: number
  present: number
  absent: number
  excuses: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalCourses: 0,
    present: 0,
    absent: 0,
    excuses: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      // جلب الطلاب
      const { data: students } = await supabase.from("students").select("*")
      const { data: courses } = await supabase.from("courses").select("*")
      const { data: attendance } = await supabase.from("attendance").select("*")

      const totalStudents = students?.length || 0
      const totalCourses = courses?.length || 0

      const present = attendance?.filter((a) => a.status === "present").length || 0
      const absent = attendance?.filter((a) => a.status === "absent").length || 0
      const excuses = attendance?.filter((a) => a.status === "excuse").length || 0

      setStats({
        totalStudents,
        totalCourses,
        present,
        absent,
        excuses,
      })
    }

    fetchStats()
  }, [])

  const presentPercent = stats.totalStudents ? Math.round((stats.present / stats.totalStudents) * 100) : 0
  const absentPercent = stats.totalStudents ? Math.round((stats.absent / stats.totalStudents) * 100) : 0
  const excusesPercent = stats.totalStudents ? Math.round((stats.excuses / stats.totalStudents) * 100) : 0

  return (
    <div className="relative grid gap-4">
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-primary/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-primary">الحضور اليومي</p>
          <p className="text-xs text-muted-foreground">تسجيل سريع لكل دورة</p>
        </div>
        <ShieldCheck size={24} className="text-primary" />
      </div>

      <div className="rounded-xl border border-border/60 bg-white/90 p-4 shadow-xs">
        <p className="text-sm font-semibold text-foreground mb-2">مقتطف الإحصائيات</p>
        <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-muted-foreground">
          <div className="rounded-lg bg-emerald-50 px-3 py-2">
            <p>حضور</p>
            <p className="text-lg font-bold text-emerald-700">{presentPercent}%</p>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-2">
            <p>غياب</p>
            <p className="text-lg font-bold text-amber-700">{absentPercent}%</p>
          </div>
          <div className="rounded-lg bg-sky-50 px-3 py-2">
            <p>أعذار</p>
            <p className="text-lg font-bold text-sky-700">{excusesPercent}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="rounded-lg border border-border/60 bg-white/80 px-3 py-2 shadow-xs">
          <p className="font-semibold text-foreground">عدد الطلاب</p>
          <p className="text-lg font-bold text-primary">+{stats.totalStudents}</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-white/80 px-3 py-2 shadow-xs">
          <p className="font-semibold text-foreground">عدد الدورات</p>
          <p className="text-lg font-bold text-emerald-700">{stats.totalCourses}</p>
        </div>
      </div>
    </div>
  )
}
