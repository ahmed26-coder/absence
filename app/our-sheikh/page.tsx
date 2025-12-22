import type { Metadata } from "next"
import { Book, GraduationCap, Library, ScrollText, User, Users, Heart } from "lucide-react"

export const metadata: Metadata = {
    title: "شيخنا – أكاديمية تأصيل",
    description: "السيرة الذاتية لفضيلة الشيخ عمرو بن أبي الفتوح.",
}

export default function OurSheikhPage() {
    return (
        <div className="bg-linear-to-b from-amber-50/50 to-white min-h-screen">
            <div className="mx-auto max-w-4xl px-4 py-12 md:py-16 space-y-12">

                {/* Header / Bio */}
                <section className="space-y-6 text-center">
                    <div className="mx-auto w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shadow-md">
                        <User size={64} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-emerald-900 mb-2 font-heading">فضيلة الشيخ عمرو بن أبي الفتوح</h1>
                        <p className="text-xl text-muted-foreground">المشرف العام على أكاديمية تأصيل للعلوم الشرعية</p>
                    </div>
                </section>

                {/* Biography & Early Life */}
                <section className="bg-white rounded-3xl p-8 border border-amber-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-amber-50 pb-4">
                        <ScrollText className="text-amber-600" />
                        <h2 className="text-2xl font-bold text-gray-800">نبذة ومسيرة طلب العلم</h2>
                    </div>
                    <div className="prose prose-lg text-gray-600 leading-loose max-w-none text-justify">
                        <p>
                            [نص السيرة الذاتية: ولد الشيخ حفظه الله في بيئة علمية محافظة، وبدأ رحلته في طلب العلم في سن مبكرة. حفظ القرآن الكريم وأتقنه، ثم انطلق ينهل من معين العلوم الشرعية على يد نخبة من علماء عصره...]
                        </p>
                        <p>
                            تميز الشيخ بجلد وصبر في التحصيل، حيث تنقل بين البلدان للقاء الشيوخ والأخذ عنهم، جامعاً بين المنقول والمعقول، ومركزاً على تأصيل المسائل العلمية وضبطها.
                        </p>
                    </div>
                </section>

                {/* Certifications (Ijazat) */}
                <section className="space-y-6">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <GraduationCap className="text-emerald-600 w-8 h-8" />
                        <h2 className="text-3xl font-bold text-gray-800">الإجازات العلمية والأسانيد</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {[
                            "إجازة في القراءات العشر المتواترة",
                            "إجازة في الكتب الستة بالأسانيد المتصلة",
                            "إجازة في الفقه الشافعي",
                            "شهادة التخصص في علوم الحديث",
                            "تزكية علمية من كبار العلماء",
                            "إجازة في تدريس العقيدة الواسطية والطحاوية"
                        ].map((cert, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
                                <div className="mt-1 bg-emerald-50 p-2 rounded-full text-emerald-600 shrink-0">
                                    <ScrollText size={18} />
                                </div>
                                <p className="font-semibold text-gray-700">{cert}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Teaching & Libraries */}
                <div className="grid gap-8 md:grid-cols-2">
                    <section className="bg-white rounded-3xl p-8 border border-blue-50 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="text-blue-600" />
                            <h3 className="text-xl font-bold">جهوده الدعوية والتعليمية</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            للشيخ جهود بارزة في نشر العلم، حيث يعقد مجالس إقراء وتعليم مستمرة، تخرج منها مئات الطلاب. يتميز أسلوبه بالوضوح والتركيز على البناء المنهجي للطالب.
                        </p>
                    </section>

                    <section className="bg-white rounded-3xl p-8 border border-purple-50 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Library className="text-purple-600" />
                            <h3 className="text-xl font-bold">مكتبة الشيخ ومؤلفاته</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            يمتلك الشيخ مكتبة عامرة بكتب التراث والمخطوطات، وله عدد من المصنفات والتحقيقات العلمية التي أثرت المكتبة الإسلامية، منها شروح في العقيدة والفقه.
                        </p>
                    </section>
                </div>

                {/* Conclusion / Dua */}
                <section className="text-center py-8 bg-emerald-900 rounded-3xl text-emerald-50 shadow-lg px-6">
                    <Heart className="mx-auto mb-4 text-emerald-300 w-10 h-10" />
                    <h3 className="text-2xl font-bold mb-4">نسأل الله أن ينفع به وبعلمه</h3>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
                        اللهم بارك في عمر شيخنا وفي علمه وعمله، واجزه عن الإسلام والمسلمين خير الجزاء، واجعل ما يقدمه في ميزان حسناته صدقة جارية إلى يوم الدين.
                    </p>
                </section>

            </div>
        </div>
    )
}
