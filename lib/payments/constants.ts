import type { FilterKey, PaymentStatus, SortKey } from "./types"

// Parallel 12-month name arrays. Like the design, the Hijri toggle is a display
// preference over the same month index — not a calendar-accurate conversion.
export const GREG_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
]
export const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
]

// Anchor pair defining the fixed Hijri display offset (HIJRI_YEAR - GREG_YEAR).
// The real year label is derived from the viewed period's Gregorian year in
// `yearNumber`, so these are not the literal year shown — they only set the
// Gregorian↔Hijri gap for the display-preference toggle.
export const GREG_YEAR = 2026
export const HIJRI_YEAR = 1448

export const INCOME_CATS = [
  "رسوم الدورات",
  "التبرعات",
  "الأوقاف",
  "الاشتراكات الشهرية",
  "الدعم الشهري من الإخوة",
]
export const EXPENSE_CATS = [
  "الإيجار",
  "مرتبات المعلمات",
  "الكهرباء",
  "الماء",
  "الغاز",
  "الإنترنت",
  "الكتب الشهرية",
  "اشتراك زوم",
  "اشتراك برنامج البث",
  "دعم الأسر المحتاجة",
]

interface StatusMetaEntry {
  label: string
  fg: string
  bg: string
  dot: string
  bar: string
}

/** Status → label + palette, copied verbatim from the design tokens. */
export const STATUS_META: Record<PaymentStatus, StatusMetaEntry> = {
  full:      { label: "مدفوع بالكامل", fg: "oklch(0.42 0.12 150)", bg: "oklch(0.965 0.03 150)",  dot: "oklch(0.52 0.13 150)", bar: "oklch(0.55 0.13 150)" },
  partial:   { label: "مدفوع جزئيًا",  fg: "oklch(0.46 0.1 66)",   bg: "oklch(0.965 0.05 78)",   dot: "oklch(0.6 0.12 66)",   bar: "oklch(0.62 0.12 70)" },
  unpaid:    { label: "لم يُدفع",       fg: "oklch(0.44 0.02 235)", bg: "oklch(0.96 0.015 235)",  dot: "oklch(0.55 0.03 235)", bar: "oklch(0.62 0.03 235)" },
  overdue:   { label: "متأخر",          fg: "oklch(0.48 0.16 25)",  bg: "oklch(0.965 0.03 25)",   dot: "oklch(0.55 0.17 25)",  bar: "oklch(0.55 0.16 25)" },
  notdue:    { label: "غير مستحق بعد",  fg: "oklch(0.5 0.03 145)",  bg: "oklch(0.96 0.012 145)",  dot: "oklch(0.62 0.02 145)", bar: "oklch(0.82 0.015 145)" },
  cancelled: { label: "ملغى",           fg: "oklch(0.55 0.01 145)", bg: "oklch(0.955 0.006 145)", dot: "oklch(0.7 0.008 145)", bar: "oklch(0.85 0.006 145)" },
}

export const TAB_DEFS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "fixed", label: "ثابتة" },
  { key: "variable", label: "متغيرة" },
  { key: "expense", label: "مصروفات" },
  { key: "partial", label: "جزئي" },
  { key: "overdue", label: "متأخرات" },
]

/** Full labels for the mobile filter sheet. */
export const FILTER_LABELS: Record<FilterKey, string> = {
  all: "كل العمليات",
  fixed: "المدفوعات الثابتة",
  variable: "المدفوعات المتغيرة",
  expense: "المصروفات",
  partial: "المدفوع جزئيًا",
  overdue: "المتأخرات",
}

export const SORT_DEFS: { key: SortKey; label: string }[] = [
  { key: "priority", label: "الأولوية" },
  { key: "due", label: "الاستحقاق" },
  { key: "amount", label: "المبلغ" },
]

/** Empty-state copy per active filter. */
export const EMPTY_COPY: Record<FilterKey, { title: string; body: string }> = {
  all: {
    title: "لا توجد مدفوعات هذا الشهر",
    body: "ابدأ بإضافة دفعة أو مصدر دخل ثابت لهذا الشهر لتتابع الوارد والمتبقي.",
  },
  fixed: {
    title: "لا توجد مدفوعات ثابتة",
    body: "لم تُسجَّل مصادر دخل ثابتة ضمن هذا الشهر بعد.",
  },
  variable: {
    title: "لا توجد مدفوعات متغيرة",
    body: "لم تُسجَّل مدفوعات متغيرة ضمن هذا الشهر بعد.",
  },
  expense: {
    title: "لا توجد مصروفات",
    body: "لم تُسجَّل أي مصروفات لهذا الشهر بعد.",
  },
  partial: {
    title: "لا يوجد مدفوع جزئيًا",
    body: "كل العمليات إما مكتملة أو لم يبدأ سدادها.",
  },
  overdue: {
    title: "لا توجد متأخرات ✓",
    body: "ما شاء الله، لا توجد مدفوعات فات موعد استحقاقها.",
  },
}
