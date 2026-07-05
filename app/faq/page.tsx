import type { Metadata } from "next"
import { HelpCircle } from "lucide-react"

import { FaqAccordion, type Faq } from "./faq-accordion"

export const metadata: Metadata = {
    title: "الأسئلة الشائعة – اكاديمية تأصيل",
    description: "أجوبة لأكثر الأسئلة تكراراً حول التسجيل، الرسوم، الشهادات، والدورات في أكاديمية تأصيل للعلوم الشرعية.",
    alternates: { canonical: "/faq" },
}

const faqs: Faq[] = [
    {
        q: "كيف يمكنني التسجيل في الأكاديمية؟",
        a: "يمكنك التسجيل بسهولة عبر الضغط على زر 'انضم للأكاديمية' في الصفحة الرئيسية، وملء البيانات المطلوبة، ثم الانضمام للدورات المتاحة.",
    },
    {
        q: "هل الدراسة مجانية أم بمقابل مادي؟",
        a: "الأصل في دوراتنا أنها مجانية لوجه الله تعالى، وهناك بعض الدورات المتخصصة قد تكون برسوم رمزية لتغطية التكاليف التشغيلية.",
    },
    {
        q: "هل توجد شهادات بعد إتمام الدورات؟",
        a: "نعم، يحصل الطالب على شهادة إتمام بعد اجتياز الاختبارات المقررة للدورة، وبعض الدورات المتقدمة تمنح إجازات بالسند المتصل.",
    },
    {
        q: "هل توجد دورات خاصة بالنساء؟",
        a: "نعم، نوفر بيئة تعليمية خاصة للأخوات، ودورات منفصلة أو فصول خاصة تراعي الضوابط الشرعية.",
    },
    {
        q: "ما هي المتطلبات التقنية للدراسة؟",
        a: "تحتاج فقط إلى جهاز (حاسوب أو هاتف ذكي) واتصال جيد بالإنترنت لمتابعة الدروس المباشرة أو المسجلة.",
    },
    {
        q: "كيف يمكنني التواصل مع الشيخ أو الإدارة؟",
        a: "يمكنك التواصل عبر نماذج الاتصال في الموقع أو عبر حساباتنا الرسمية على وسائل التواصل الاجتماعي الموضحة في أسفل الصفحة.",
    },
]

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
}

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-muted/30 py-12 md:py-16 px-4" dir="rtl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <div className="mx-auto max-w-3xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                        <HelpCircle size={32} aria-hidden="true" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">الأسئلة الشائعة</h1>
                    <p className="text-muted-foreground">تجد هنا أجوبة لأكثر الاستفسارات تكراراً</p>
                </div>

                <FaqAccordion faqs={faqs} />
            </div>
        </div>
    )
}
