"use client"

import { useState } from "react"
import { Plus, CreditCard, Upload, CheckCircle2, AlertCircle, Clock, X, Image as ImageIcon, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast-provider"
import { addDebtToSupabase, createPaymentRequest, uploadPaymentProof, type Debt } from "@/lib/supabase-storage"
import Link from "next/link"

interface FinancialClientProps {
    initialDebts: Debt[]
    studentId: string
}

export default function FinancialClient({ initialDebts, studentId }: FinancialClientProps) {
    const [debts, setDebts] = useState<Debt[]>(initialDebts)
    const { pushToast } = useToast()

    // Add Debt States
    const [isAddDebtOpen, setIsAddDebtOpen] = useState(false)
    const [newDebtName, setNewDebtName] = useState("")
    const [newDebtAmount, setNewDebtAmount] = useState("")
    const [newDebtPaid, setNewDebtPaid] = useState("0")

    // Pay Debt States
    const [isPayModalOpen, setIsPayModalOpen] = useState(false)
    const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null)
    const [payAmount, setPayAmount] = useState("")
    const [payNote, setPayNote] = useState("")
    const [payFile, setPayFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleAddDebt = async () => {
        if (!newDebtName || !newDebtAmount) {
            pushToast("يرجى ملء جميع الحقول المطلوبة", "error")
            return
        }

        const newDebt = await addDebtToSupabase({
            name: newDebtName,
            amount_owed: Number(newDebtAmount),
            amount_paid: Number(newDebtPaid),
            student_id: studentId
        })

        if (newDebt) {
            setDebts([newDebt, ...debts])
            setIsAddDebtOpen(false)
            setNewDebtName("")
            setNewDebtAmount("")
            setNewDebtPaid("0")
            pushToast("تم إضافة الدين بنجاح", "success")
        } else {
            pushToast("فشل إضافة الدين", "error")
        }
    }

    const handleOpenPayModal = (debtId: string) => {
        setSelectedDebtId(debtId)
        setIsPayModalOpen(true)
        setPayAmount("")
        setPayNote("")
        setPayFile(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setPayFile(file)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        const newPreviewUrl = URL.createObjectURL(file)
        setPreviewUrl(newPreviewUrl)
    }

    const handleRemoveFile = () => {
        setPayFile(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
    }

    const handleSubmitPayment = async () => {
        if (!selectedDebtId || !payAmount) {
            pushToast("يرجى إدخال المبلغ", "error")
            return
        }

        setIsUploading(true)
        let proofUrl = ""

        if (payFile) {
            const uploadedUrl = await uploadPaymentProof(payFile, studentId)
            if (!uploadedUrl) {
                pushToast("فشل رفع الصورة", "error")
                setIsUploading(false)
                return
            }
            proofUrl = uploadedUrl
        }

        const request = await createPaymentRequest({
            student_id: studentId,
            debt_id: selectedDebtId,
            amount: Number(payAmount),
            note: payNote,
            proof_image_url: proofUrl
        })

        setIsUploading(false)
        if (request) {
            setIsPayModalOpen(false)
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
            pushToast("تم إرسال طلب الدفع بنجاح بانتظار الموافقة", "success")
        } else {
            pushToast("فشل إرسال طلب الدفع", "error")
        }
    }

    const totalOwed = debts.reduce((acc, curr) => acc + (curr.amount_owed || 0), 0)
    const totalPaid = debts.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0)
    const remaining = totalOwed - totalPaid

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">الملف المالي</h1>
                <div className="flex gap-2">
                    <Link href="/student/financial/history">
                        <Button variant="outline" className="gap-2 font-bold">
                            <History size={16} />
                            سجل الدفعات
                        </Button>
                    </Link>
                    <Button
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold"
                        onClick={() => setIsAddDebtOpen(true)}
                    >
                        <Plus size={16} />
                        إضافة دين جديد
                    </Button>
                </div>

                <Dialog
                    open={isAddDebtOpen}
                    onClose={() => setIsAddDebtOpen(false)}
                    title="إضافة دين جديد"
                    description="قم بإضافة تفاصيل الرسوم المستحقة عليك يدوياً."
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-right">عنوان/وصف الدين</Label>
                            <Input
                                id="name"
                                value={newDebtName}
                                onChange={(e) => setNewDebtName(e.target.value)}
                                placeholder="مثلاً: رسوم شهر ديسمبر"
                                className="text-right"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount" className="text-right">المبلغ المستحق</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={newDebtAmount}
                                onChange={(e) => setNewDebtAmount(e.target.value)}
                                placeholder="0.00"
                                className="text-right"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="paid" className="text-right">المدفوع مسبقاً (إن وجد)</Label>
                            <Input
                                id="paid"
                                type="number"
                                value={newDebtPaid}
                                onChange={(e) => setNewDebtPaid(e.target.value)}
                                placeholder="0.00"
                                className="text-right"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleAddDebt} className="w-full font-bold">حفظ</Button>
                    </div>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">إجمالي الديون</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-rose-600">{totalOwed.toFixed(2)} جنيه</div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">المبلغ المدفوع</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-600">{totalPaid.toFixed(2)} جنيه</div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">المبلغ المتبقي</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-gray-900">{remaining.toFixed(2)} جنيه</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle>سجل الديون والمدفوعات</CardTitle>
                    <CardDescription>تفاصيل الديون وإجراءات السداد</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right font-bold">الوصف</TableHead>
                                <TableHead className="text-right font-bold">المبلغ المستحق</TableHead>
                                <TableHead className="text-right font-bold">المدفوع</TableHead>
                                <TableHead className="text-right font-bold">المتبقي</TableHead>
                                <TableHead className="text-right font-bold">الحالة</TableHead>
                                <TableHead className="text-right font-bold">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {debts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        لا توجد ديون مسجلة حالياً
                                    </TableCell>
                                </TableRow>
                            ) : (
                                debts.map((debt) => {
                                    const itemRemaining = debt.amount_owed - debt.amount_paid
                                    const isPaid = itemRemaining <= 0

                                    return (
                                        <TableRow key={debt.id}>
                                            <TableCell className="font-medium">{debt.name}</TableCell>
                                            <TableCell>{debt.amount_owed} جنيه</TableCell>
                                            <TableCell className="text-emerald-600 font-bold">{debt.amount_paid} جنيه</TableCell>
                                            <TableCell className="text-rose-600 font-bold">{Math.max(0, itemRemaining)} جنيه</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={isPaid ? "outline" : "destructive"}
                                                    className={isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                                                >
                                                    {isPaid ? "مدفوع بالكامل" : "مستحق الدفع"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {!isPaid && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenPayModal(debt.id)}
                                                        className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                                    >
                                                        <CreditCard size={14} />
                                                        دفع
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pay Modal */}
            <Dialog
                open={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                title="تسجيل عملية دفع"
                description="أدخل تفاصيل عملية الدفع وسيتم مراجعتها من قبل الإدارة."
            >
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="payAmount" className="text-right">مبلغ الدفع</Label>
                        <Input
                            id="payAmount"
                            type="number"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder="0.00"
                            className="text-right"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="payNote" className="text-right">تفاصيل الدفع</Label>
                        <Textarea
                            id="payNote"
                            value={payNote}
                            onChange={(e) => setPayNote(e.target.value)}
                            placeholder="مثلاً: تم التحويل عبر فودافون كاش للمستر فلان بتاريخ كذا..."
                            className="text-right min-h-[100px]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="payImage" className="text-right font-bold">صورة الإيصال (إثبات الدفع)</Label>
                        {!payFile ? (
                            <div
                                className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                                onClick={() => document.getElementById('payImage')?.click()}
                            >
                                <div className="p-3 bg-gray-50 rounded-full text-gray-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                                    <ImageIcon size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-700">اضغط هنا لاختيار صورة</p>
                                    <p className="text-xs text-muted-foreground mt-1">يُقبل الملفات بصيغة JPG, PNG</p>
                                </div>
                                <Input
                                    id="payImage"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        ) : (
                            <div className="relative group overflow-hidden rounded-xl border-2 border-emerald-100 bg-gray-50 aspect-video">
                                {previewUrl && (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="rounded-full h-8 w-8 p-0"
                                        onClick={handleRemoveFile}
                                    >
                                        <X size={16} />
                                    </Button>
                                    <p className="text-white text-xs font-bold">حذف وصورة أخرى</p>
                                </div>
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                            * يرجى التأكد من وضوح بيانات الإيصال (التاريخ، المبلغ، واسم المستلم).
                        </p>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSubmitPayment}
                        disabled={isUploading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Clock className="animate-spin" size={16} />
                                جاري الرفع...
                            </>
                        ) : (
                            "إرسال الطلب للمراجعة"
                        )}
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}
