"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Activity, BarChart3, CalendarClock, Users } from "lucide-react"

import type { Student } from "@/lib/types"
import { getStudentStats } from "@/lib/storage"
import { Progress } from "./ui/progress"

interface StatisticsPanelProps {
  students: Student[]
  startDate: string
  endDate: string
}

const buildTrend = (students: Student[], endDate: string) => {
  const baseDate = endDate ? new Date(endDate) : new Date()
  const days = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() - idx)
    return d.toISOString().split("T")[0]
  }).sort()

  return days.map((date) => {
    let present = 0
    let absent = 0
    let excused = 0

    students.forEach((student) => {
      const record = student.attendance?.[date]
      if (record?.status === "H") present += 1
      else if (record?.status === "G") absent += 1
      else if (record?.status === "E") excused += 1
    })

    return { date, present, absent, excused }
  })
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ students, startDate, endDate }) => {
  const totalStats = {
    present: 0,
    absent: 0,
    excused: 0,
  }

  students.forEach((student) => {
    const stats = getStudentStats(student, startDate, endDate)
    totalStats.present += stats.present
    totalStats.absent += stats.absent
    totalStats.excused += stats.excused
  })

  const total = totalStats.present + totalStats.absent + totalStats.excused
  const presentPercentage = total > 0 ? Math.round((totalStats.present / total) * 100) : 0
  const absentPercentage = total > 0 ? Math.round((totalStats.absent / total) * 100) : 0
  const excusedPercentage = total > 0 ? Math.round((totalStats.excused / total) * 100) : 0
  const trend = buildTrend(students, endDate)

  const cards = [
    {
      title: "إجمالي الطلاب المسجلين",
      value: students.length,
      helper: "قائمة مشتركة لكل الدورات",
      icon: Users,
      tone: "from-emerald-500/15 via-emerald-400/10 to-emerald-500/10",
    },
    {
      title: "الحضور خلال المدى",
      value: totalStats.present,
      helper: `${presentPercentage}% من إجمالي السجلات`,
      icon: CalendarClock,
      tone: "from-sky-500/15 via-sky-400/10 to-sky-500/10",
      progress: presentPercentage,
    },
    {
      title: "الغياب/الأعذار",
      value: totalStats.absent,
      helper: `غياب ${absentPercentage}% - أعذار ${excusedPercentage}%`,
      icon: Activity,
      tone: "from-amber-500/15 via-amber-400/10 to-amber-500/10",
    },
    {
      title: "إجمالي الأيام المحتسبة",
      value: total || 0,
      helper: "يشمل الحضور، الغياب، والأعذار",
      icon: BarChart3,
      tone: "from-indigo-500/15 via-indigo-400/10 to-indigo-500/10",
    },
  ]

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white/70 p-5 shadow-sm backdrop-blur"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.tone} opacity-60 group-hover:opacity-80 transition-opacity`}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.helper}</p>
              </div>
              <div className="rounded-xl bg-white/70 p-2 shadow-inner text-primary">
                <card.icon size={18} />
              </div>
            </div>
            {card.progress !== undefined && (
              <div className="mt-3 space-y-2">
                <Progress value={card.progress} />
                <p className="text-[11px] text-muted-foreground">نسبة الالتزام بالجلسات المحددة</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">الاتجاه خلال الأيام الأخيرة</h3>
          <span className="text-xs text-muted-foreground">تفاعل سريع لحضور الجلسات</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {trend.map((session) => {
            const totalForDay = session.present + session.absent + session.excused || 1
            const dailyRate = Math.round((session.present / totalForDay) * 100)
            return (
              <div
                key={session.date}
                className="rounded-xl border border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 p-3"
              >
                <p className="text-[11px] text-muted-foreground mb-1">{session.date}</p>
                <p className="text-lg font-semibold text-foreground mb-1">{dailyRate}%</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">حضور</span>
                    <span className="text-emerald-600 font-semibold">{session.present}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">غياب</span>
                    <span className="text-red-500 font-semibold">{session.absent}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">أعذار</span>
                    <span className="text-amber-600 font-semibold">{session.excused}</span>
                  </div>
                  <Progress value={dailyRate} className="h-1.5" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
