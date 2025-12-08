/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AttendanceStatus } from "@/lib/types"

interface AttendanceStatusButtonProps {
  status: AttendanceStatus
  onStatusChange: (status: AttendanceStatus, reason?: string) => void
  date: string
  currentReason?: string
}

export const AttendanceStatusButton: React.FC<AttendanceStatusButtonProps> = ({
  status,
  onStatusChange,
  currentReason,
}) => {
  const [showReasonInput, setShowReasonInput] = useState(status === "E")
  const [reason, setReason] = useState(currentReason || "")

  useEffect(() => {
    setReason(currentReason || "")
  }, [currentReason])

  const getStatusColor = (s: AttendanceStatus) => {
    if (s === "H") return " hover:bg-green-600"
    if (s === "G") return " hover:bg-red-600"
    if (s === "E") return " hover:bg-yellow-600"
    return "bg-gray-200 hover:bg-gray-300"
  }

  const handleStatusClick = (newStatus: AttendanceStatus) => {
    if (status === newStatus) {
      onStatusChange(null)
      setShowReasonInput(false)
      setReason("")
    } else {
      onStatusChange(newStatus, newStatus === "E" ? reason : undefined)
      setShowReasonInput(newStatus === "E")
    }
  }

  const handleReasonChange = (newReason: string) => {
    setReason(newReason)
    if (status === "E") {
      onStatusChange("E", newReason)
    }
  }

  const handleReasonBlur = () => {
    if (reason.trim()) {
      setShowReasonInput(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <Button
          size="sm"
          className={`${getStatusColor(status === "H" ? "H" : null)} text-white bg-green-500 hover:bg-green-600`}
          onClick={() => handleStatusClick("H")}
        >
          حاضر
        </Button>
        <Button
          size="sm"
          className={`${getStatusColor(status === "G" ? "G" : null)} text-white bg-red-500 hover:bg-red-600 `}
          onClick={() => handleStatusClick("G")}
        >
          غياب
        </Button>
        <Button
          size="sm"
          className={`${getStatusColor(status === "E" ? "E" : null)} text-white bg-yellow-500 hover:bg-yellow-600`}
          onClick={() => handleStatusClick("E")}
        >
          عذر
        </Button>
      </div>
      {showReasonInput && (
        <Input
          type="text"
          placeholder="سبب الغياب"
          value={reason}
          onChange={(e) => handleReasonChange(e.target.value)}
          onBlur={handleReasonBlur}
          className="text-sm"
          autoFocus
        />
      )}
    </div>
  )
}
