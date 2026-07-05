import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number
  colorClassName?: string
  "aria-label"?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, colorClassName = "from-primary to-primary", ...props }, ref) => {
    // Consumers compute percentages that can be 0/0 (NaN); guard before clamping.
    const safe = Number.isFinite(value) ? value : 0
    const clamped = Math.max(0, Math.min(100, safe))

    return (
      <div
        ref={ref}
        data-slot="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-l shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition-[width] duration-300 ease-out",
            colorClassName,
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    )
  },
)

Progress.displayName = "Progress"

export { Progress }
