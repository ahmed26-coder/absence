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

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const Dialog: React.FC<DialogProps> = ({ open, onClose, title, description, children, className }) => {
  const [mounted, setMounted] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const backdropArmed = React.useRef(false)
  const previouslyFocused = React.useRef<HTMLElement | null>(null)
  const reactId = React.useId()
  const titleId = `${reactId}-title`
  const descId = `${reactId}-desc`

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Lock background scroll while open.
  React.useEffect(() => {
    if (!mounted || !open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev || ""
    }
  }, [open, mounted])

  // Focus management: move focus into the dialog on open, restore it on close.
  React.useEffect(() => {
    if (!mounted || !open) return
    previouslyFocused.current = document.activeElement as HTMLElement
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
    ;(focusables && focusables.length ? focusables[0] : panelRef.current)?.focus()
    return () => {
      previouslyFocused.current?.focus?.()
    }
  }, [open, mounted])

  // Escape to close + Tab focus trap.
  React.useEffect(() => {
    if (!mounted || !open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== "Tab") return
      const focusables = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, mounted, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in-0"
      // Close only when the press starts AND ends on the backdrop, so a drag
      // that begins inside an input doesn't discard the dialog.
      onMouseDown={(e) => {
        backdropArmed.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (backdropArmed.current && e.target === e.currentTarget) onClose()
        backdropArmed.current = false
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "w-full max-w-xl rounded-2xl border border-border/60 bg-card p-6 shadow-2xl max-h-[85vh] overflow-y-auto focus:outline-none",
          "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
          className,
        )}
      >
        {(title || description) && (
          <header className="mb-4 space-y-1">
            {title && <h3 id={titleId} className="text-xl font-bold text-foreground">{title}</h3>}
            {description && <p id={descId} className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
          </header>
        )}
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
