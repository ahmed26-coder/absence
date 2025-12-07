"use client"

import { useEffect, useMemo, useState } from "react"
import { Menu, Settings } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "#top", label: "الصفحة الرئيسية" },
  { href: "#courses", label: "الدورات" },
  { href: "#students", label: "الطلاب" },
  { href: "#analytics", label: "الإحصائيات" },
]

export const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>("top")
  const pathname = usePathname()

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const ids = ["top", "courses", "students", "analytics"]

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) setActiveId(id)
            })
          },
          { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
        )
        observer.observe(el)
        observers.push(observer)
      }
    })

    return () => observers.forEach((observer) => observer.disconnect())
  }, [])

  const navItems = useMemo(() => {
    return links.map((link) => ({
      ...link,
      active: pathname === "/" && activeId === link.href.replace("#", ""),
    }))
  }, [pathname, activeId])

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-3 py-1.5">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              ح
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">منصة متابعة الحضور</p>
              <p className="text-[11px] text-muted-foreground">إدارة حضور الدورات</p>
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-1 text-sm font-semibold md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-2 transition hover:text-primary hover:bg-primary/10",
                item.active ? "text-primary bg-primary/10 border border-primary/20" : "text-muted-foreground",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" className="hidden md:inline-flex">
            <Settings size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="md:hidden"
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
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 transition hover:text-primary hover:bg-primary/10",
                  item.active ? "text-primary bg-primary/10 border border-primary/20" : "text-muted-foreground",
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
