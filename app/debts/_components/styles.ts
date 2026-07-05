import type { CSSProperties } from "react"

/** A segmented-control button (month/year, greg/hijri, sort). */
export function seg(on: boolean): CSSProperties {
  return {
    padding: "7px 12px",
    borderRadius: "9px",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12.5px",
    background: on ? "var(--paper)" : "transparent",
    color: on ? "var(--green-d)" : "var(--muted)",
    boxShadow: on ? "0 1px 3px oklch(0.3 0.05 150 / .12)" : "none",
  }
}

/** The wrapper around a group of segmented buttons. */
export const segGroup: CSSProperties = {
  display: "flex",
  background: "var(--bg)",
  border: "1px solid var(--line)",
  borderRadius: "11px",
  padding: "3px",
  gap: "2px",
}

/** A square outline icon button (filter, export, month step). */
export function iconBtn(size = 40): CSSProperties {
  return {
    width: `${size}px`,
    height: `${size}px`,
    flex: "none",
    borderRadius: "12px",
    border: "1px solid var(--line)",
    background: "var(--paper)",
    color: "var(--ink2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
  }
}

/** A filter/tab pill with active state. */
export function tabPill(on: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    flex: "none",
    height: "34px",
    padding: "0 13px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12.5px",
    border: on ? "1px solid var(--green)" : "1px solid var(--line)",
    background: on ? "var(--green)" : "var(--paper)",
    color: on ? "#fff" : "var(--ink2)",
  }
}

export function tabCount(on: boolean): CSSProperties {
  return {
    fontSize: "10.5px",
    fontWeight: 800,
    padding: "1px 6px",
    borderRadius: "8px",
    background: on ? "oklch(1 0 0 / .22)" : "var(--bg)",
    color: on ? "#fff" : "var(--muted)",
  }
}

/** The rounded status badge with a leading dot. */
export function badge(bg: string, fg: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "10.5px",
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: "999px",
    background: bg,
    color: fg,
  }
}

/** The small income/expense pill. */
export function flowPill(bg: string, fg: string): CSSProperties {
  return {
    fontSize: "10.5px",
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: "999px",
    background: bg,
    color: fg,
  }
}

/** Primary green button. */
export const primaryBtn: CSSProperties = {
  border: "none",
  background: "var(--green)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
}
