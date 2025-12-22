"use client"

import { useState } from "react"
import { ArrowRight, Clock, CheckCircle2, XCircle, FileText, Image as ImageIcon, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface PaymentRequest {
    id: string
    amount: number
    note: string | null
    proof_image_url: string | null
    status: "pending" | "approved" | "rejected"
    created_at: string
    debt: { name: string } | null
}

interface HistoryClientProps {
    initialRequests: PaymentRequest[]
}

export default function HistoryClient({ initialRequests }: HistoryClientProps) {
    const [requests] = useState(initialRequests)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">تمت الموافقة</Badge>
            case "rejected":
                return <Badge className="bg-rose-100 text-rose-700 border-rose-200">تم الرفض</Badge>
            default:
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200">قيد الانتظار</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle2 className="text-emerald-500" size={20} />
            case "rejected":
                return <XCircle className="text-rose-500" size={20} />
            default:
                return <Clock className="text-amber-500" size={20} />
        }
    }

    return (
        <div className="space-y-6 text-start" dir="rtl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/student/financial">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowRight size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">سجل المدفوعات</h1>
                        <p className="text-muted-foreground mt-1">تتبع طلبات السداد الخاصة بك وحالتها.</p>
                    </div>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="flex flex-col py-16 text-center border-2 border-dashed rounded-2xl bg-gray-50/50">
                    <Calendar size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">لا يوجد سجل مدفوعات</h3>
                    <p className="text-muted-foreground text-sm mt-1">لم تقم بإرسال أي طلبات دفع حتى الآن.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {requests.map((request) => (
                        <Card key={request.id} className="overflow-hidden border-gray-100 hover:shadow-sm transition-all">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Status Bar (Mobile Top / Desktop Right) */}
                                    <div className={`w-full md:w-2 bg-gray-100 ${request.status === 'approved' ? 'bg-emerald-500' :
                                            request.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                                        }`} />

                                    <div className="flex-1 py-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-50 rounded-2xl">
                                                    {getStatusIcon(request.status)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 mb-1">
                                                        {new Date(request.created_at).toLocaleDateString("ar-EG", {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                    <h3 className="font-bold text-gray-900">
                                                        سداد لـ: {request.debt?.name || "دين غير معروف"}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="text-left md:text-right w-full md:w-auto">
                                                <p className="text-2xl font-black text-emerald-600 leading-none">{request.amount} <span className="text-sm">جنيه</span></p>
                                                <div className="mt-2">{getStatusBadge(request.status)}</div>
                                            </div>
                                        </div>

                                        {(request.note || request.proof_image_url) && (
                                            <div className="mt-6 pt-6 border-t border-gray-50 grid md:grid-cols-2 gap-6">
                                                {request.note && (
                                                    <div className="space-y-2">
                                                        <p className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                            <FileText size={14} /> ملاحظة الطالب:
                                                        </p>
                                                        <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl italic">
                                                            "{request.note}"
                                                        </p>
                                                    </div>
                                                )}

                                                {request.proof_image_url && (
                                                    <div className="space-y-2">
                                                        <p className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                            <ImageIcon size={14} /> إثبات الدفع:
                                                        </p>
                                                        <div className="relative aspect-video w-full max-w-[300px] overflow-hidden rounded-xl border bg-gray-50 group">
                                                            <Image
                                                                fill
                                                                src={request.proof_image_url}
                                                                alt="Payment Proof"
                                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
