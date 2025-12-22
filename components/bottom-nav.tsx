"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  NotebookPen,
  Users,
  BarChart3,
  CircleDollarSign,
  LayoutDashboard,
  UserCircle,
  BookOpen,
  Wallet,
  HelpCircle,
  Info,
  Bell
} from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

const items = [
  // Guest Links
  { href: "/", label: "الرئيسية", icon: Home, guestOnly: true },
  { href: "/our-sheikh", label: "عن شيخنا", icon: Info, guestOnly: true },
  { href: "/faq", label: "الأسئلة", icon: HelpCircle, guestOnly: true },

  // Admin Links
  { href: "/courses", label: "الدورات", icon: NotebookPen, adminOnly: true },
  { href: "/students", label: "الطلاب", icon: Users, adminOnly: true },
  { href: "/analytics", label: "الإحصائيات", icon: BarChart3, adminOnly: true },
  { href: "/debts", label: "الديون", icon: CircleDollarSign, adminOnly: true },
  { href: "/notifications", label: "الاشعارات", icon: Bell, adminOnly: true },

  // Student Links
  { href: "/student/dashboard", label: "لوحتي", icon: LayoutDashboard, studentOnly: true },
  { href: "/student/courses", label: "دوراتي", icon: BookOpen, studentOnly: true },
  { href: "/student/financial", label: "المالية", icon: Wallet, studentOnly: true },
  { href: "/student/profile", label: "ملفي", icon: UserCircle, studentOnly: true },
]

interface BottomNavProps {
  role: string
  user: User | null
}

export const BottomNav = ({ role, user }: BottomNavProps) => {
  const pathname = usePathname()
  const isAdmin = role === "admin"
  const isStudent = role === "user"

  const visibleItems = items.filter((item) => {
    if (item.adminOnly && !isAdmin) return false
    if (item.studentOnly && (!isStudent || !user)) return false
    if (item.guestOnly && user) return false
    return true
  })

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-white/95 backdrop-blur shadow-sm md:hidden">
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))`
        }}
      >
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold transition",
                active ? "text-primary bg-primary/5 shadow-[inset_0_-2px_0_0_rgba(var(--primary),0.1)]" : "text-muted-foreground hover:text-primary",
              )}
            >
              <Icon size={18} className={cn(active && "animate-in zoom-in-95 duration-300")} />
              <span className="truncate w-full text-center px-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
