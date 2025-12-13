"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, NotebookPen, Users, BarChart3, CircleDollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/courses", label: "الدورات", icon: NotebookPen, adminOnly: true },
  { href: "/students", label: "الطلاب", icon: Users, adminOnly: true },
  { href: "/analytics", label: "الإحصائيات", icon: BarChart3 },
  { href: "/debts", label: "الديون", icon: CircleDollarSign, adminOnly: true },
]
interface NavbarProps {
  role: string
}
export const BottomNav = ({ role }: NavbarProps) => {
  const pathname = usePathname()
  const isAdmin = role === "admin"
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-white/95 backdrop-blur shadow-sm md:hidden">
      <div className={cn(
        "overflow-x-auto",
        isAdmin ? "grid grid-cols-5" : "grid grid-cols-4"
      )}>
        {items.map((item) => {
          const Icon = item.icon
          if (item.adminOnly && !isAdmin) return null
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold transition",
                active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary",
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
