import type { Metadata } from "next"

import { LandingContent } from "./landing-client"

const metadataBase = new URL("https://ta2seel.example.com") // TODO: replace with real domain

export const metadata: Metadata = {
  title: "الرئيسية – اكاديمية تأصيل",
  description:
    "ترحيب بمنصة اكاديمية تأصيل للعلوم الشرعية لإدارة حضور الطلاب والإحصائيات بواجهة عربية سهلة.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "اكاديمية تأصيل – نظام متابعة الحضور",
    description: "منصة لمتابعة حضور طلاب الدورات الشرعية مع إحصائيات واضحة وسهلة.",
    url: metadataBase.toString(),
    siteName: "اكاديمية تأصيل",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "اكاديمية تأصيل – نظام متابعة الحضور",
    description: "منصة عربية لمتابعة حضور طلاب الدورات الشرعية.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "اكاديمية تأصيل للعلوم الشرعية",
  url: metadataBase.toString(),
  description:
    "نظام عربي لمتابعة حضور الطلاب في الدورات الشرعية، مع إحصائيات لكل طالب ولكل دورة، مصمم لسهولة استخدام المعلمين والإدارة.",
  applicationCategory: "Education",
  inLanguage: "ar",
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        suppressHydrationWarning
      />
      <LandingContent />
    </>
  )
}
