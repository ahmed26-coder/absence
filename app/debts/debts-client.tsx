"use client"

import { useState } from "react"
import { Check, X, CreditCard, User, FileText, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast-provider"
import { updatePaymentRequestStatus, type PaymentRequest } from "@/lib/supabase-storage"
import Image from "next/image"

interface DebtsClientProps {
    initialRequests: any[] // Should be typed properly if possible
}

export default function DebtsClient({ initialRequests }: DebtsClientProps) {
    console.log("CLIENT - initialRequests:", initialRequests);
    const [requests, setRequests] = useState(initialRequests)
    const { pushToast } = useToast()

    const handleAction = async (requestId: string, action: "approved" | "rejected") => {
        const success = await updatePaymentRequestStatus(requestId, action)
        if (success) {
            setRequests(prev => prev.filter(r => r.id !== requestId))
            pushToast(action === "approved" ? "تم قبول الطلب وتحديث الدين" : "تم رفض الطلب", action === "approved" ? "success" : "default")
        } else {
            pushToast("فشل تنفيذ الإجراء", "error")
        }
    }

    return (
        <div className="space-y-6 text-start" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">طلبات الدفع</h1>
                    <p className="text-muted-foreground mt-1">
                        مراجعة وإدارة طلبات السداد المقدمة من الطلاب.
                    </p>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-2xl bg-gray-50/50">
                    <div className="bg-white p-4 rounded-full shadow-xs mb-4">
                        <Check size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">لا توجد طلبات معلقة</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                        جميع طلبات الدفع تمت مراجعتها أو لا توجد طلبات جديدة حالياً.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {requests.map((request) => {
                        // Handle potential array or object structure from Supabase join
                        const debt = Array.isArray(request.debt) ? request.debt[0] : request.debt;

                        return (
                            <Card key={request.id} className="overflow-hidden border-gray-100 hover:shadow-md transition-all">
                                <CardHeader className="bg-gray-50/50 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {request.student?.avatar_url ? (
                                                <div className="relative h-8 w-8 rounded-full overflow-hidden border">
                                                    <Image
                                                        fill
                                                        src={request.student.avatar_url}
                                                        alt={request.student.full_name || "Avatar"}
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                                    {request.student?.full_name?.charAt(0) || "ط"}
                                                </div>
                                            )}
                                            <div>
                                                <CardTitle className="text-base font-bold">{request.student?.full_name || "طالب غير معروف"}</CardTitle>
                                                <CardDescription className="text-xs">
                                                    {new Date(request.created_at).toLocaleDateString("ar-EG")}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                            قيد المراجعة
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">الدين المتبقي</p>
                                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                            <span className="font-medium text-sm text-gray-900">{debt?.name || "دين غير معروف"}</span>
                                            <span className="font-bold text-rose-600 text-sm">
                                                {(debt?.amount_owed || 0) - (debt?.amount_paid || 0)} جنيه
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-dashed pt-4">
                                        <div className="flex items-baseline justify-between mb-2">
                                            <p className="text-sm font-semibold text-gray-700">المبلغ الذي يريد دفعه:</p>
                                            <p className="text-2xl font-black text-emerald-600">{request.amount} جنيه</p>
                                        </div>

                                        {request.note && (
                                            <div className="bg-emerald-50/50 p-3 rounded-xl mb-3">
                                                <div className="flex gap-2 text-emerald-800 text-xs font-bold mb-1">
                                                    <FileText size={12} />
                                                    ملاحظة الطالب:
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    "{request.note}"
                                                </p>
                                            </div>
                                        )}

                                        {request.proof_image_url ? (
                                            <div className="mt-3">
                                                <p className="flex items-center gap-1 text-xs font-bold text-gray-500 mb-2">
                                                    <ImageIcon size={12} /> صورة الإيصال:
                                                </p>
                                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gray-100">
                                                    {/* Uses standard img tag for external URLs if domain not configured in next.config.js, but Image is better if allowed */}
                                                    <Image
                                                        fill
                                                        src={request.proof_image_url}
                                                        alt="Proof"
                                                        className="object-cover hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-3 text-center py-2 bg-gray-50 rounded-lg border border-dashed text-xs text-muted-foreground">
                                                لا توجد صورة مرفقة
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-gray-50/30 gap-2 pt-4">
                                    <Button
                                        onClick={() => handleAction(request.id, "approved")}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold gap-2"
                                    >
                                        <Check size={16} />
                                        موافقة
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(request.id, "rejected")}
                                        variant="outline"
                                        className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 font-bold gap-2"
                                    >
                                        <X size={16} />
                                        رفض
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
