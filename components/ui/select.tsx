"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectContextValue {
    value?: string
    onValueChange?: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
    labels: Map<string, React.ReactNode>
    triggerId: string
    listboxId: string
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext(component: string) {
    const ctx = React.useContext(SelectContext)
    if (!ctx) throw new Error(`${component} must be used within <Select>`)
    return ctx
}

// Walk the JSX tree (rendered even while the menu is closed) to map each
// option value to its label, so the trigger can show the selected label.
function collectLabels(children: React.ReactNode, map: Map<string, React.ReactNode>) {
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return
        const props = child.props as { value?: string; children?: React.ReactNode }
        if ((child.type as { displayName?: string })?.displayName === "SelectItem" && props.value !== undefined) {
            map.set(props.value, props.children)
        } else if (props.children) {
            collectLabels(props.children, map)
        }
    })
}

interface SelectProps<T extends string = string> {
    children: React.ReactNode
    value?: T
    onValueChange?: (value: T) => void
}

export function Select<T extends string = string>({ children, value, onValueChange }: SelectProps<T>) {
    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const reactId = React.useId()

    const handleValueChange = React.useCallback(
        (val: string) => onValueChange?.(val as T),
        [onValueChange],
    )

    const labels = React.useMemo(() => {
        const map = new Map<string, React.ReactNode>()
        collectLabels(children, map)
        return map
    }, [children])

    React.useEffect(() => {
        if (!open) return
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleKey)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleKey)
        }
    }, [open])

    const ctx = React.useMemo<SelectContextValue>(
        () => ({
            value,
            onValueChange: handleValueChange,
            open,
            setOpen,
            labels,
            triggerId: `${reactId}-trigger`,
            listboxId: `${reactId}-listbox`,
        }),
        [value, handleValueChange, open, labels, reactId],
    )

    return (
        <SelectContext.Provider value={ctx}>
            <div className="relative w-full" ref={containerRef}>
                {children}
            </div>
        </SelectContext.Provider>
    )
}

export const SelectTrigger = ({
    children,
    className,
}: {
    children?: React.ReactNode
    className?: string
}) => {
    const { open, setOpen, triggerId, listboxId } = useSelectContext("SelectTrigger")
    return (
        <button
            type="button"
            id={triggerId}
            onClick={() => setOpen(!open)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
        >
            {children}
            <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
    )
}

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
    const { value, labels } = useSelectContext("SelectValue")
    const label = value !== undefined ? labels.get(value) : undefined
    return (
        <span className={cn("truncate", label === undefined && "text-muted-foreground")}>
            {label ?? placeholder}
        </span>
    )
}

export const SelectContent = ({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) => {
    const { open, listboxId, triggerId } = useSelectContext("SelectContent")
    const listRef = React.useRef<HTMLDivElement>(null)

    // Move keyboard focus into the list when it opens.
    React.useEffect(() => {
        if (open) {
            const selected = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
            ;(selected ?? listRef.current?.querySelector<HTMLElement>('[role="option"]'))?.focus()
        }
    }, [open])

    if (!open) return null

    const options = () => Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])

    const onKeyDown = (event: React.KeyboardEvent) => {
        const items = options()
        if (items.length === 0) return
        const currentIndex = items.findIndex((el) => el === document.activeElement)
        if (event.key === "ArrowDown") {
            event.preventDefault()
            items[currentIndex < 0 ? 0 : Math.min(items.length - 1, currentIndex + 1)]?.focus()
        } else if (event.key === "ArrowUp") {
            event.preventDefault()
            items[Math.max(0, currentIndex - 1)]?.focus()
        } else if (event.key === "Home") {
            event.preventDefault()
            items[0]?.focus()
        } else if (event.key === "End") {
            event.preventDefault()
            items[items.length - 1]?.focus()
        }
    }

    return (
        <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className={cn(
                "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
                className,
            )}
        >
            {children}
        </div>
    )
}

interface SelectItemProps {
    children: React.ReactNode
    value: string
    className?: string
}

export const SelectItem = ({ children, value, className }: SelectItemProps) => {
    const { value: selected, onValueChange, setOpen } = useSelectContext("SelectItem")
    const isSelected = selected === value

    const choose = () => {
        onValueChange?.(value)
        setOpen(false)
    }

    return (
        <div
            role="option"
            tabIndex={-1}
            aria-selected={isSelected}
            onClick={choose}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    choose()
                }
            }}
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                isSelected && "bg-accent/60 font-medium",
                className,
            )}
        >
            <span className="truncate">{children}</span>
            {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
        </div>
    )
}
SelectItem.displayName = "SelectItem"
