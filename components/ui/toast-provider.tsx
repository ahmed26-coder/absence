"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type ToastVariant = "default" | "success" | "error" | "warning"

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  pushToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// Give readers enough time: scale with message length, minimum 4s (5s for errors).
function durationFor(message: string, variant: ToastVariant) {
  const base = variant === "error" || variant === "warning" ? 5000 : 4000
  return Math.min(12000, base + message.length * 45)
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current[id]
    if (timer) {
      clearTimeout(timer)
      delete timers.current[id]
    }
  }, [])

  const scheduleDismiss = useCallback(
    (id: string, delay: number) => {
      timers.current[id] = setTimeout(() => dismiss(id), delay)
    },
    [dismiss],
  )

  const pushToast = useCallback(
    (message: string, variant: ToastVariant = "default") => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, variant }])
      scheduleDismiss(id, durationFor(message, variant))
    },
    [scheduleDismiss],
  )

  useEffect(() => {
    const currentTimers = timers.current
    return () => {
      Object.values(currentTimers).forEach(clearTimeout)
    }
  }, [])

  const value = useMemo(() => ({ pushToast }), [pushToast])

  const iconFor = (variant: ToastVariant) => {
    if (variant === "success") return <CheckCircle2 className="shrink-0 text-emerald-600" size={18} aria-hidden="true" />
    if (variant === "error") return <XCircle className="shrink-0 text-destructive" size={18} aria-hidden="true" />
    if (variant === "warning") return <TriangleAlert className="shrink-0 text-amber-600" size={18} aria-hidden="true" />
    return <Info className="shrink-0 text-primary" size={18} aria-hidden="true" />
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Persistent live region so screen readers announce every insertion. */}
      <div
        className="fixed left-4 right-4 bottom-6 z-50 flex flex-col items-start gap-2 sm:left-auto sm:right-6 sm:w-80"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.variant === "error" || toast.variant === "warning" ? "alert" : "status"}
            onMouseEnter={() => {
              const timer = timers.current[toast.id]
              if (timer) clearTimeout(timer)
            }}
            onMouseLeave={() => scheduleDismiss(toast.id, 2000)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border border-border/70 bg-card/95 px-4 py-3 shadow-lg backdrop-blur",
              "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2",
            )}
          >
            {iconFor(toast.variant)}
            <p className="flex-1 text-sm font-medium leading-relaxed text-foreground">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="إغلاق التنبيه"
              className="-me-1 shrink-0 rounded-md p-0.5 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
