"use client"

import type React from "react"
import type { Student } from "@/lib/types"
import { getStudentStats } from "@/lib/storage"

interface StatisticsPanelProps {
  students: Student[]
  startDate: string
  endDate: string
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <p className="text-sm text-gray-600">إجمالي الحضور</p>
        <p className="text-2xl font-bold text-green-600">{totalStats.present}</p>
        <p className="text-xs text-gray-500">{presentPercentage}%</p>
      </div>
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <p className="text-sm text-gray-600">إجمالي الغياب</p>
        <p className="text-2xl font-bold text-red-600">{totalStats.absent}</p>
        <p className="text-xs text-gray-500">{absentPercentage}%</p>
      </div>
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <p className="text-sm text-gray-600">إجمالي الأعذار</p>
        <p className="text-2xl font-bold text-yellow-600">{totalStats.excused}</p>
        <p className="text-xs text-gray-500">{excusedPercentage}%</p>
      </div>
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-gray-600">إجمالي الأيام</p>
        <p className="text-2xl font-bold text-blue-600">{total}</p>
      </div>
    </div>
  )
}
