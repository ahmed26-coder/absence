"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react"

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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, NodeJS.Timeout>>({})

  const pushToast = (message: string, variant: ToastVariant = "default") => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, variant }])
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }

  useEffect(() => {
    const currentTimers = timers.current
    return () => {
      Object.values(currentTimers).forEach(clearTimeout)
    }
  }, [])

  const value = useMemo(() => ({ pushToast }), [])

  const iconFor = (variant: ToastVariant) => {
    if (variant === "success") return <CheckCircle2 className="text-emerald-600" size={18} />
    if (variant === "error") return <XCircle className="text-red-600" size={18} />
    if (variant === "warning") return <TriangleAlert className="text-amber-600" size={18} />
    return <Info className="text-primary" size={18} />
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed left-4 right-4 bottom-6 z-50 flex flex-col items-start gap-2 sm:left-auto sm:right-6 sm:w-80">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex w-full items-start gap-3 rounded-xl border border-border/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur"
          >
            {iconFor(toast.variant)}
            <p className="text-sm font-medium text-foreground leading-relaxed">{toast.message}</p>
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
