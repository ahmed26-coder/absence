"use client"

import { useState } from "react"
import { Menu, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Ta2seelLogo } from "./ta2seel-logo"

const links = [
  { href: "/", label: "الصفحة الرئيسية" },
  { href: "/courses", label: "الدورات" },
  { href: "/students", label: "الطلاب" },
  { href: "/analytics", label: "الإحصائيات" },
  { href: "/debts", label: "الديون" },
]

export const Navbar = () => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
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

        <nav className="hidden items-center gap-2 text-sm font-semibold md:flex">
          {links.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 transition hover:text-primary hover:bg-primary/10",
                  active ? "text-primary bg-primary/10 border border-primary/20" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            disabled
            aria-label="الإعدادات ستتوفر قريباً"
          >
            <Settings size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="فتح القائمة"
          >
            <Menu size={18} />
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-white md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3 text-sm font-semibold">
            {links.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 transition hover:text-primary hover:bg-primary/10",
                    active ? "text-primary bg-primary/10 border border-primary/20" : "text-muted-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
