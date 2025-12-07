import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"

const cairo = Cairo({
  variable: "--font-base",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={`${cairo.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
