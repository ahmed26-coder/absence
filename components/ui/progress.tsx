import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number
  colorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, colorClassName = "from-emerald-500 to-emerald-600", ...props }, ref) => {
    const clamped = Math.max(0, Math.min(100, value))

    return (
      <div
        ref={ref}
        data-slot="progress"
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
