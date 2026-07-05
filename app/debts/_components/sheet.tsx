"use client"

import { useEffect, useRef } from "react"

type SheetVariant = "sheet" | "center"

interface SheetProps {
  open: boolean
  onClose: () => void
  label: string
  variant?: SheetVariant
  /** Tall sheets fill most of the viewport on mobile (detail/add). */
  tall?: boolean
  /** Desktop panel width in px for centered/sheet panels. */
  width?: number
  children: React.ReactNode
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * A bottom sheet on mobile / centered dialog on desktop, with a focus trap,
 * Escape-to-close, backdrop dismissal and background scroll lock. CSS motion is
 * neutralised automatically under prefers-reduced-motion (see globals.css).
 */
export function Sheet({
  open,
  onClose,
  label,
  variant = "sheet",
  tall = false,
  width = 520,
  children,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null

    const panel = panelRef.current
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panel)?.focus()

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== "Tab" || !panel) return
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null || n === document.activeElement,
      )
      if (nodes.length === 0) {
        e.preventDefault()
        panel.focus()
        return
      }
      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault()
        lastNode.focus()
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault()
        firstNode.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prevOverflow
      restoreRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const centered = variant === "center"
  const panelStyle: React.CSSProperties = centered
    ? { width: `min(${width}px, 100%)`, maxHeight: "90vh" }
    : { width: "100%", maxWidth: `${width}px`, maxHeight: tall ? "94vh" : "90vh" }

  return (
    <div
      className={
        "fixed inset-0 z-[70] flex justify-center " +
        (centered ? "items-center p-5" : "items-end md:items-center md:p-6")
      }
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[oklch(0.2_0.02_150/0.45)] motion-safe:animate-[payFade_.2s_ease]"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        style={panelStyle}
        className={
          "relative flex flex-col overflow-hidden bg-[var(--paper)] shadow-[0_-18px_40px_-20px_oklch(0.2_0.02_150/0.4)] outline-none " +
          (centered
            ? "rounded-[22px] motion-safe:animate-[payPop_.28s_cubic-bezier(.22,1,.36,1)]"
            : "rounded-t-[26px] md:rounded-[22px] motion-safe:animate-[payUp_.28s_cubic-bezier(.22,1,.36,1)]")
        }
      >
        {children}
      </div>
    </div>
  )
}

/** A small grab-handle shown at the top of bottom sheets. */
export function SheetGrip() {
  return <div className="mx-auto mt-1.5 mb-3 h-1 w-9 rounded-full bg-[var(--line)] md:hidden" />
}
