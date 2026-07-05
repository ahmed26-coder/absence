import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Whether a nav item should be highlighted for the current pathname.
 * The home route matches exactly; every other section matches its prefix so
 * nested routes (e.g. /students/123) keep their parent tab active.
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Today's date as YYYY-MM-DD in a fixed timezone (defaults to Cairo).
 * Using the UTC-based toISOString() would roll over to the previous day for
 * this GMT+2/+3 audience during the first hours after local midnight.
 */
export function getLocalDateISO(timeZone = "Africa/Cairo"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}
