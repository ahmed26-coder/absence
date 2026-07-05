"use client"

import { LogOut, LogIn, CircleUserRound } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import { cn, isActivePath } from "@/lib/utils"
import { Ta2seelLogo } from "./ta2seel-logo"
import { signout } from "@/app/auth/actions"

const links = [
  { href: "/", label: "الصفحة الرئيسية", guestOnly: true },
  { href: "/our-sheikh", label: " عن شيخنا", guestOnly: true },
  { href: "/faq", label: " الأسئلة الشائعة", guestOnly: true },
  { href: "/courses", label: "الدورات", adminOnly: true },
  { href: "/students", label: "الطلاب", adminOnly: true },
  { href: "/analytics", label: "الإحصائيات", adminOnly: true },
  { href: "/debts", label: "الديون", adminOnly: true },
  { href: "/notifications", label: "الاشعارات", adminOnly: true },
  // Student Links
  { href: "/student/dashboard", label: "لوحتي", studentOnly: true },
  { href: "/student/profile", label: "ملف تعريفي", studentOnly: true },
  { href: "/student/courses", label: "دوراتي", studentOnly: true },
  { href: "/student/financial", label: "المالية", studentOnly: true },
]

interface NavbarProps {
  user: User | null
  role: string
  profile?: any
}

export const Navbar = ({ user, role, profile }: NavbarProps) => {
  const pathname = usePathname()

  const isAdmin = role === "admin"
  const isStudent = role === "user"

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-3 py-1.5">
            <Ta2seelLogo animated size="nav" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">اكاديمية تأصيل</p>
              <p className="text-[11px] text-muted-foreground">نظام متابعة الحضور</p>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-2 text-sm font-semibold md:flex">
          {links.map((item: any) => {
            if (item.adminOnly && !isAdmin) return null
            if (item.studentOnly && (!isStudent || !user)) return null
            if (item.guestOnly && user) return null

            const active = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-2 transition hover:text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active ? "text-primary bg-primary/10 border border-primary/20" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Avatar - Desktop */}
              <div className="hidden md:block">
                <div className="h-9 w-9 overflow-hidden rounded-full border border-border/60 bg-muted flex items-center justify-center">
                  {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                    <Image
                      src={profile?.avatar_url || user.user_metadata?.avatar_url}
                      alt="الصورة الشخصية"
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CircleUserRound className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>
              </div>
              <form action={signout}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden gap-1 text-sm md:inline-flex text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="تسجيل خروج"
                  type="submit"
                >
                  <LogOut size={18} />
                  <span>تسجيل خروج</span>
                </Button>
              </form>
            </div>
          ) : (
            <Button
              asChild
              variant="default"
              size="sm"
              className="hidden md:inline-flex"
            >
              <Link href="/auth/login" className="gap-2">
                <LogIn size={18} />
                <span>تسجيل دخول</span>
              </Link>
            </Button>
          )}
          <div className="flex md:hidden">
            {user ? (
              <form action={signout} className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center text-sm gap-1 md:gap-2 rounded-lg px-3 py-2 text-destructive transition hover:bg-destructive/10"
                >
                  <LogOut size={18} />
                  تسجيل خروج
                </button>
              </form>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center text-sm gap-1 md:gap-2 rounded-lg px-3 py-2 text-primary transition hover:bg-primary/10"
              >
                <LogIn size={18} />
                تسجيل دخول
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
