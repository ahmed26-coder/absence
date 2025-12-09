"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import type { AttendanceStatus } from "@/lib/types"

interface AttendanceStatusButtonProps {
  status: AttendanceStatus | null
  onStatusChange: (status: AttendanceStatus | "E" | null, reason?: string) => Promise<void>
  date: string
  currentReason?: string
  isLoading?: boolean
}

export const AttendanceStatusButton: React.FC<AttendanceStatusButtonProps> = ({
  status,
  onStatusChange,
  currentReason,
  isLoading = false,
}) => {
  const [showReasonInput, setShowReasonInput] = useState(status === "E")
  const [reason, setReason] = useState(currentReason || "")
  const [pendingStatus, setPendingStatus] = useState<AttendanceStatus | "E" | null>(null)

  useEffect(() => {
    setReason(currentReason || "")
  }, [currentReason])

  const handleStatusClick = async (newStatus: AttendanceStatus | "E") => {
    if (isLoading || pendingStatus) return

    setPendingStatus(newStatus)

    try {
      if (status === newStatus) {
        await onStatusChange(null)
        setShowReasonInput(false)
        setReason("")
      } else {
        setShowReasonInput(newStatus === "E")
        await onStatusChange(newStatus, newStatus === "E" ? reason : undefined)
      }
    } catch {
      console.error("فشل تحديث الحالة")
    } finally {
      setPendingStatus(null)
    }
  }

  const isButtonLoading = (btn: AttendanceStatus | "E") => pendingStatus === btn

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {/* حاضر */}
        <Button
          size="sm"
          className="text-white bg-green-500 hover:bg-green-600 flex items-center gap-2"
          onClick={() => handleStatusClick("H")}
          disabled={pendingStatus !== null}
        >
          {isButtonLoading("H") && <Loader2 className="animate-spin w-4 h-4" />}
          <span>حاضر</span>
        </Button>

        {/* غياب */}
        <Button
          size="sm"
          className="text-white bg-red-500 hover:bg-red-600 flex items-center gap-2"
          onClick={() => handleStatusClick("G")}
          disabled={pendingStatus !== null}
        >
          {isButtonLoading("G") && <Loader2 className="animate-spin w-4 h-4" />}
          <span>غياب</span>
        </Button>

        {/* عذر */}
        <Button
          size="sm"
          className="text-white bg-yellow-500 hover:bg-yellow-600 flex items-center gap-2"
          onClick={() => handleStatusClick("E")}
          disabled={pendingStatus !== null}
        >
          {isButtonLoading("E") && <Loader2 className="animate-spin w-4 h-4" />}
          <span>عذر</span>
        </Button>
      </div>

      {showReasonInput && (
        <Input
          type="text"
          placeholder="سبب الغياب"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="text-sm"
          disabled={pendingStatus !== null}
        />
      )}
    </div>
  )
}
