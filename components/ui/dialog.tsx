"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, title, description, children, className }) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-xl rounded-2xl border border-border/60 bg-white p-6 shadow-2xl",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <header className="mb-4 space-y-1">
            {title && <h3 className="text-xl font-bold text-foreground">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
          </header>
        )}
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
