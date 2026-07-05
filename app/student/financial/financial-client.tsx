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
    const [isAddingDebt, setIsAddingDebt] = useState(false)

    // Pay Debt States
    const [isPayModalOpen, setIsPayModalOpen] = useState(false)
    const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null)
    const [payAmount, setPayAmount] = useState("")
    const [payNote, setPayNote] = useState("")
    const [payFile, setPayFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleAddDebt = async () => {
        if (isAddingDebt) return
        const owed = Number(newDebtAmount)
        const paid = Number(newDebtPaid) || 0
        if (!newDebtName.trim() || !newDebtAmount) {
            pushToast("يرجى ملء جميع الحقول المطلوبة", "error")
            return
        }
        if (!Number.isFinite(owed) || owed <= 0) {
            pushToast("أدخل مبلغاً صحيحاً أكبر من صفر", "error")
            return
        }
        if (paid < 0 || paid > owed) {
            pushToast("المبلغ المدفوع يجب أن يكون بين صفر والمبلغ المستحق", "error")
            return
        }

        setIsAddingDebt(true)
        try {
            const newDebt = await addDebtToSupabase({
                name: newDebtName.trim(),
                amount_owed: owed,
                amount_paid: paid,
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
        } finally {
            setIsAddingDebt(false)
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
        if (isUploading) return
        const amount = Number(payAmount)
        if (!selectedDebtId || !payAmount) {
            pushToast("يرجى إدخال المبلغ", "error")
            return
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            pushToast("أدخل مبلغاً صحيحاً أكبر من صفر", "error")
            return
        }
        const selectedDebt = debts.find((d) => d.id === selectedDebtId)
        if (selectedDebt) {
            const debtRemaining = (selectedDebt.amount_owed || 0) - (selectedDebt.amount_paid || 0)
            if (amount > debtRemaining) {
                pushToast(`المبلغ يتجاوز المتبقي على هذا الدين (${Math.max(0, debtRemaining)} جنيه)`, "error")
                return
            }
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
            amount,
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold text-foreground">الملف المالي</h1>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="gap-2 font-bold">
                        <Link href="/student/financial/history">
                            <History size={16} />
                            سجل الدفعات
                        </Link>
                    </Button>
                    <Button
                        className="gap-2 font-bold"
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
                        <Button onClick={handleAddDebt} disabled={isAddingDebt} aria-busy={isAddingDebt} className="w-full font-bold gap-2">
                            {isAddingDebt ? (<><Clock className="animate-spin" size={16} aria-hidden="true" /> جاري الحفظ...</>) : "حفظ"}
                        </Button>
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
                            <label
                                htmlFor="payImage"
                                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                            >
                                <div className="p-3 bg-muted rounded-full text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                    <ImageIcon size={32} aria-hidden="true" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-foreground">اضغط هنا لاختيار صورة</p>
                                    <p className="text-xs text-muted-foreground mt-1">يُقبل الملفات بصيغة JPG, PNG, WEBP (حتى 5 ميجابايت)</p>
                                </div>
                                <input
                                    id="payImage"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                            </label>
                        ) : (
                            <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-muted aspect-video">
                                {previewUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={previewUrl}
                                        alt="معاينة صورة الإيصال"
                                        className="w-full h-full object-contain"
                                    />
                                )}
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-2 end-2 h-8 w-8 rounded-full p-0"
                                    onClick={handleRemoveFile}
                                    aria-label="حذف الصورة واختيار صورة أخرى"
                                >
                                    <X size={16} aria-hidden="true" />
                                </Button>
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
                        aria-busy={isUploading}
                        className="w-full font-bold gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Clock className="animate-spin" size={16} aria-hidden="true" />
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
