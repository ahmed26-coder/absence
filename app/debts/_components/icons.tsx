// Icons ported from the Payments design so the look matches exactly. Colour
// comes from the surrounding `color` (currentColor); size/stroke are overridable.
import type { CSSProperties, ReactNode } from "react"

interface IconProps {
  size?: number
  sw?: number
  className?: string
  style?: CSSProperties
}

function Svg({
  size = 18,
  sw = 1.8,
  className,
  style,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const FilterIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 5h18M6 12h12M10 19h4" />
  </Svg>
)

export const ExportIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9V3.5h12V9" />
    <rect x="6" y="13" width="12" height="7.5" rx="1" />
    <path d="M4 9h16v6a1 1 0 0 1-1 1h-1" />
    <path d="M6 16H5a1 1 0 0 1-1-1V9" />
  </Svg>
)

export const FileIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </Svg>
)

export const PrintIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9V3h12v6" />
    <rect x="6" y="13" width="12" height="8" rx="1" />
    <path d="M4 9h16v6h-2" />
    <path d="M6 15H4V9" />
  </Svg>
)

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.4" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </Svg>
)

export const ChevronRight = (p: IconProps) => (
  <Svg sw={2} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
)

export const ChevronLeft = (p: IconProps) => (
  <Svg sw={2} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
)

export const ChevronDown = (p: IconProps) => (
  <Svg sw={2} {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
)

export const PlusIcon = (p: IconProps) => (
  <Svg sw={2.2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const CheckIcon = (p: IconProps) => (
  <Svg sw={2.4} {...p}>
    <path d="M4 12l5 5L20 6" />
  </Svg>
)

export const ArrowApply = (p: IconProps) => (
  <Svg sw={2.4} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
)

export const AlertTriangle = (p: IconProps) => (
  <Svg sw={1.9} {...p}>
    <path d="M12 3.5 22 20H2L12 3.5z" />
    <path d="M12 10v4M12 17.2v.1" />
  </Svg>
)

export const ClockIcon = (p: IconProps) => (
  <Svg sw={1.9} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
)

export const CoinsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Svg>
)

export const HalfPie = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 12V3a9 9 0 0 1 0 18" />
  </Svg>
)

export const RemainingIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4l3 2" />
  </Svg>
)

export const TrendingUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M21 7v5h-5" />
  </Svg>
)

export const XIcon = (p: IconProps) => (
  <Svg sw={2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)

export const TrashIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Svg>
)

export const TrashFull = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </Svg>
)

export const NoteLines = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5h16M4 12h16M4 19h9" />
  </Svg>
)

export const CalendarBig = (p: IconProps) => (
  <Svg sw={1.6} {...p}>
    <rect x="3" y="5" width="18" height="15" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
)

export const ArrowUp = (p: IconProps) => (
  <Svg sw={2} {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Svg>
)

export const ArrowDown = (p: IconProps) => (
  <Svg sw={2} {...p}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </Svg>
)

export const HomeIcon = (p: IconProps) => (
  <Svg sw={1.9} {...p}>
    <path d="M4 21V8l8-5 8 5v13" />
    <path d="M4 21h16M10 21v-5h4v5" />
  </Svg>
)

export const InfoCircle = (p: IconProps) => (
  <Svg sw={2} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.1" />
  </Svg>
)

/** The two-square "knowledge" mark used decoratively in the hero. */
export const DiamondMark = ({ size = 13, className, style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <rect x="6" y="6" width="12" height="12" rx="1" />
    <rect x="6" y="6" width="12" height="12" rx="1" transform="rotate(45 12 12)" />
  </svg>
)
