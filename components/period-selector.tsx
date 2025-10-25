"use client"

import type React from "react"
import { Button } from "@/components/ui/button"

interface PeriodSelectorProps {
  selectedPeriod: number
  onPeriodChange: (days: number) => void
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { label: "3 أيام", days: 3 },
    { label: "أسبوع", days: 7 },
    { label: "10 أيام", days: 10 },
    { label: "15 أيام", days: 15 },
    { label: "شهر", days: 30 },
    { label: "45 يوم", days: 45 },
    { label: "90 يوم", days: 90 },
  ]

  return (
    <div className="flex gap-2 flex-wrap">
      {periods.map((period) => (
        <Button
          key={period.days}
          variant={selectedPeriod === period.days ? "default" : "outline"}
          onClick={() => onPeriodChange(period.days)}
          size="sm"
        >
          {period.label}
        </Button>
      ))}
    </div>
  )
}
