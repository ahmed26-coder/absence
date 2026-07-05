/**
 * Central brand + SEO configuration. Set the environment variables below in
 * production so metadata, canonical URLs, robots, sitemap, and structured data
 * all resolve to the real domain and channels.
 */

/** Canonical site origin (no trailing slash). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000"
).replace(/\/$/, "")

export const SITE_NAME = "أكاديمية تأصيل للعلوم الشرعية"
export const SITE_NAME_SHORT = "أكاديمية تأصيل"
export const SITE_NAME_EN = "Ta'seel Academy for Islamic Sciences"

export const SITE_DESCRIPTION =
  "أكاديمية تأصيل للعلوم الشرعية: منصة تعليمية عربية لتعلّم العلوم الشرعية عبر الإنترنت — دروس مباشرة وتسجيلات مرئية ومقررات مكتوبة، مع إجازات وشهادات معتمدة، لطلاب العلم في مصر والعالم."

export const SITE_DESCRIPTION_EN =
  "Ta'seel Academy for Islamic Sciences — an Arabic online platform to study the Islamic sciences with live lessons, recorded courses, certified ijazat and diplomas, serving students in Egypt and worldwide."

/**
 * Keyword pool blending Egypt-focused and international, Arabic and
 * transliterated/English terms. Egypt-first, then the wider Arab world & global.
 */
export const SITE_KEYWORDS = [
  // Brand
  "أكاديمية تأصيل",
  "تأصيل",
  "Ta'seel Academy",
  "Taseel Academy",
  // Core topic (Arabic)
  "تعلم العلوم الشرعية",
  "دراسة العلوم الشرعية أونلاين",
  "دورات شرعية",
  "دروس شرعية مباشرة",
  "تعليم شرعي عن بعد",
  "حفظ القرآن الكريم",
  "علوم الحديث",
  "الفقه والعقيدة",
  "إجازات وأسانيد",
  "طلب العلم الشرعي",
  // Egypt-targeted
  "دورات شرعية مصر",
  "تعليم شرعي في مصر",
  "أكاديمية شرعية مصرية",
  "معهد شرعي أونلاين مصر",
  // International / transliterated
  "Islamic studies online",
  "learn Islamic sciences",
  "online Quran and Hadith courses",
  "Islamic academy online",
  "Sharia courses online",
  "دورات إسلامية للجاليات",
]

/** BCP-47 locale, Egypt-first. */
export const SITE_LOCALE = "ar-EG"
export const OG_LOCALE = "ar_EG"
export const OG_LOCALE_ALT = ["ar_SA", "en_US"]

/** hreflang alternates for <link rel="alternate">. Same URL, language signal. */
export const HREFLANG_ALTERNATES: Record<string, string> = {
  "ar-EG": SITE_URL,
  ar: SITE_URL,
  en: SITE_URL,
  "x-default": SITE_URL,
}

/** Public social profiles — fill these in to strengthen entity recognition
 * (they feed schema.org sameAs). Leave empty rather than adding wrong URLs. */
export const SOCIAL_LINKS: string[] = [
  // "https://www.facebook.com/...",
  // "https://www.youtube.com/@...",
  // "https://t.me/...",
  // "https://x.com/...",
]

/** Brand colors (kept in sync with the primary token in globals.css). */
export const THEME_COLOR = "#2f7d4f"
export const THEME_BACKGROUND = "#f7faf5"
