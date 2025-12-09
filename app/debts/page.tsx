import DebtTable from "./client-page"

export const metadata = {
  title: "متتبع الديون",
  description: "إدارة ومراقبة الديون المستحقة",
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-teal-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">متتبع الديون</h1>
          <p className="text-slate-600 text-sm mt-1">إدارة ومراقبة الديون المستحقة</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-teal-100">
          <DebtTable />
        </div>
      </div>
    </main>
  )
}
