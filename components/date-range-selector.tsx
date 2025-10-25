"use client"

import type React from "react"
import { Input } from "@/components/ui/input"

interface DateRangeSelectorProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div>
        <label className="block text-sm font-medium mb-2">تاريخ البداية</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full md:w-auto"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">تاريخ النهاية</label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full md:w-auto"
        />
      </div>
    </div>
  )
}
