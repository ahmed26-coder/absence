"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"

const faqs = [
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

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <div className="min-h-screen bg-gray-50 py-12 md:py-16 px-4">
            <div className="mx-auto max-w-3xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <HelpCircle size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">الأسئلة الشائعة</h1>
                    <p className="text-gray-500">تجد هنا أجوبة لأكثر الاستفسارات تكراراً</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${openIndex === idx ? "border-emerald-500 shadow-md" : "border-gray-200 shadow-sm"
                                }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="flex w-full items-center justify-between px-6 py-5 text-right hover:bg-gray-50/50 transition-colors"
                            >
                                <span className={`font-bold text-lg ${openIndex === idx ? "text-emerald-700" : "text-gray-700"}`}>
                                    {faq.q}
                                </span>
                                {openIndex === idx ? (
                                    <ChevronUp className="h-5 w-5 text-emerald-500 shrink-0" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                                )}
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out ${openIndex === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="border-t border-gray-100 px-6 py-4 text-gray-600 leading-relaxed bg-gray-50/30">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
