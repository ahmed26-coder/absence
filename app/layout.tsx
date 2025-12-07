import type { Metadata } from "next"
import { Cairo, Noto_Naskh_Arabic } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { ToastProvider } from "@/components/ui/toast-provider"
import { BottomNav } from "@/components/bottom-nav"

const cairo = Cairo({
  variable: "--font-base",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const naskh = Noto_Naskh_Arabic({
  variable: "--font-heading",
  subsets: ["arabic"],
  weight: ["600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "نظام تتبع الحضور",
  description:
    "نظام ذكي لتتبع حضور وغياب طلاب شيخنا الفاضل أبو عبدالرحمن الأثري، مصمم بدقة لتسهيل تسجيل الحضور، الأعذار، والإحصائيات اليومية بطريقة منظمة وحديثة.",
  generator: "عمل خالص لوجه الله تعالى",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html dir="rtl" lang="ar">
      <body className={`${cairo.variable} ${naskh.variable} antialiased`}>
        <ToastProvider>
          <Navbar />
          <main className="pt-20 md:pt-24 pb-20 md:pb-0">{children}</main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  )
}
