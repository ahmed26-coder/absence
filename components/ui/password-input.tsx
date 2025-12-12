import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false)

        return (
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("pr-10", className)}
                    ref={ref}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-0 flex h-full items-center px-3 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">{showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}</span>
                </button>
            </div>
        )
    }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
