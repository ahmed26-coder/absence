"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

export const Select = ({ children, value, onValueChange }: any) => {
    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative w-full" ref={containerRef}>
            {React.Children.map(children, (child) => {
                if (child.type === SelectTrigger) {
                    return React.cloneElement(child, {
                        onClick: () => setOpen(!open),
                        value: value
                    })
                }
                if (child.type === SelectContent && open) {
                    return React.cloneElement(child, {
                        onValueChange: (val: string) => {
                            onValueChange(val)
                            setOpen(false)
                        }
                    })
                }
                return null
            })}
        </div>
    )
}

export const SelectTrigger = ({ onClick, children, className, value }: any) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
)

export const SelectValue = ({ placeholder, value }: any) => (
    <span className="truncate">{value || placeholder}</span>
)

export const SelectContent = ({ children, onValueChange, className }: any) => (
    <div className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${className}`}>
        {React.Children.map(children, (child) =>
            React.cloneElement(child, {
                onClick: () => onValueChange(child.props.value)
            })
        )}
    </div>
)

export const SelectItem = ({ children, onClick, value, className }: any) => (
    <div
        onClick={onClick}
        className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer ${className}`}
    >
        {children}
    </div>
)
