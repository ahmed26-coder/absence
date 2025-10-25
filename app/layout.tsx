import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "نظام تتبع الحضور",
  description: "نظام ذكي لتتبع حضور وغياب طلاب شيخنا الفاضل أبو عبدالرحمن الأثري، مصمم بدقة لتسهيل تسجيل الحضور، الأعذار، والإحصائيات اليومية بطريقة منظمة وحديثة.",
  generator: "عمل خالص لوجه الله تعالى",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="ar">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
