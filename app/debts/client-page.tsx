"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, Plus, X, Check } from "lucide-react"
import {
  addDebtToSupabase,
  deleteDebtFromSupabase,
  getDebtsFromSupabase,
  updateDebtInSupabase,
} from "@/lib/supabase-storage"

interface Debt {
  id: string
  name: string
  amount_owed: number
  amount_paid: number
}

const labels = {
  title: "متتبع الديون",
  addButton: "إضافة دين جديد",
  name: "الاسم",
  amountOwed: "المبلغ المستحق",
  amountPaid: "المبلغ المدفوع",
  remaining: "المتبقي",
  status: "الحالة",
  progress: "التقدم",
  actions: "الإجراءات",
  save: "حفظ",
  cancel: "إلغاء",
  delete: "حذف",
  edit: "تعديل",
  paid: "مدفوع",
  nearlyComplete: "قريب من الانتهاء",
  inProgress: "اقترب من الانتهاء",
  started: "تم البدء",
  notStarted: "لم يبدأ",
  totalOwed: "إجمالي المستحق",
  totalPaid: "إجمالي المدفوع",
  totalRemaining: "إجمالي المتبقي",
  overallProgress: "التقدم العام",
}

function getStatus(amountOwed: number, amountPaid: number) {
  const p = (amountPaid / (amountOwed || 1)) * 100 // تفادي القسمة على صفر

  if (p >= 100) {
    return { label: p > 100 ? "انتهى مع زيادة" : labels.paid, color: "bg-green-100 text-green-800", percentage: Math.min(100, p) }
  }
  if (p >= 75) {
    return { label: labels.nearlyComplete, color: "bg-amber-100 text-amber-800", percentage: p }
  }
  if (p >= 50) {
    return { label: labels.inProgress, color: "bg-blue-100 text-blue-800", percentage: p }
  }
  if (p > 0) {
    return { label: labels.started, color: "bg-slate-100 text-slate-800", percentage: p }
  }

  return { label: labels.notStarted, color: "bg-red-100 text-red-800", percentage: 0 }
}

function formatEGP(amount: number) {
  return `${amount.toLocaleString("ar-EG")} جنيه`
}

export default function DebtTable() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Debt | null>(null)

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newDebt, setNewDebt] = useState({ name: "", amountOwed: "", amountPaid: "" })

  // ⭐ تحميل البيانات من Supabase
  useEffect(() => {
    const load = async () => {
      const data = await getDebtsFromSupabase()
      setDebts(data)
      setLoading(false)
    }
    load()
  }, [])

  // ⭐ إضافة دين جديد
  const handleAddDebt = async () => {
    if (!newDebt.name || !newDebt.amountOwed) return

    const owed = Number(newDebt.amountOwed)
    const paid = Number(newDebt.amountPaid) || 0

    // نضيف كما هو، بدون تعديل للقيم (السماح بـ paid > owed)
    const res = await addDebtToSupabase({
      name: newDebt.name,
      amount_owed: owed,
      amount_paid: paid,
    })

    if (res) setDebts([...debts, res])

    setNewDebt({ name: "", amountOwed: "", amountPaid: "" })
    setIsAddingNew(false)
  }

  // ⭐ بدء التعديل (نستخدم القيم الكلية بدلاً من الـ deltas)
  const handleEditStart = (debt: Debt) => {
    setEditingId(debt.id)
    setEditData(debt) // القيم الكلية
  }

  // ⭐ حفظ التعديل (نستخدم القيم الكلية مباشرة)
  const handleEditSave = async () => {
    if (!editData || !editingId) return

    // نحدث بالقيم الجديدة الكلية مباشرة (بدون + original)
    let newAmountOwed = Number(editData.amount_owed) || 0
    let newAmountPaid = Number(editData.amount_paid) || 0

    // نضمن عدم سالب
    newAmountOwed = Math.max(0, newAmountOwed)
    newAmountPaid = Math.max(0, newAmountPaid)

    const success = await updateDebtInSupabase(editingId, {
      name: editData.name,
      amount_owed: newAmountOwed,
      amount_paid: newAmountPaid,
    })

    if (success) {
      setDebts(
        debts.map((d) =>
          d.id === editingId
            ? {
                ...d,
                name: editData.name,
                amount_owed: newAmountOwed,
                amount_paid: newAmountPaid,
              }
            : d,
        ),
      )
    }

    setEditingId(null)
    setEditData(null)
  }

  // ⭐ حذف
  const handleDeleteDebt = async (id: string) => {
    const ok = await deleteDebtFromSupabase(id)
    if (ok) setDebts(debts.filter((d) => d.id !== id))
  }

  if (loading) {
    return <p className="text-center py-10 text-slate-500">جاري تحميل البيانات...</p>
  }

  return (
    <div className="overflow-x-auto dir-rtl">
      {/* إضافة جديد */}
      {isAddingNew && (
        <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{labels.name}</label>
              <input
                type="text"
                value={newDebt.name}
                onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="أدخل الاسم"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{labels.amountOwed}</label>
              <input
                type="number"
                value={newDebt.amountOwed || ""}
                onChange={(e) => setNewDebt({ ...newDebt, amountOwed: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{labels.amountPaid}</label>
              <input
                type="number"
                value={newDebt.amountPaid || ""}
                onChange={(e) => setNewDebt({ ...newDebt, amountPaid: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="0"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddDebt}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium"
              >
                <Check size={18} className="inline mr-2" />
                {labels.save}
              </button>

              <button
                onClick={() => {
                  setIsAddingNew(false)
                  setNewDebt({ name: "", amountOwed: "", amountPaid: "" })
                }}
                className="px-4 py-2 bg-slate-300 text-slate-700 rounded-md hover:bg-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* زر إضافة */}
      {!isAddingNew && (
        <div className=" my-4 mx-2">
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium flex items-center gap-2"
          >
            <Plus size={18} />
            {labels.addButton}
          </button>
        </div>
      )}

      {/* الجدول */}
      <Table>
        <TableHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b-2 border-teal-100">
          <TableRow>
            <TableHead className="font-semibold text-slate-700 text-right">{labels.name}</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">{labels.amountOwed}</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">{labels.amountPaid}</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">{labels.remaining}</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">{labels.status}</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right w-32">{labels.progress}</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">{labels.actions}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {debts.map((debt) => {
            const remaining = Math.max(0, debt.amount_owed - debt.amount_paid)
            const status = getStatus(debt.amount_owed, debt.amount_paid)
            const isEditing = editingId === debt.id

            return (
              <TableRow key={debt.id} className="border-b border-teal-50 hover:bg-teal-50/50 transition-colors">
                {/* الاسم */}
                <TableCell className="font-medium text-slate-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData?.name || ""}
                      onChange={(e) => setEditData({ ...editData!, name: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    debt.name
                  )}
                </TableCell>

                {/* المستحق */}
                <TableCell className="text-right text-slate-700">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData?.amount_owed || 0}
                      onChange={(e) => setEditData({ ...editData!, amount_owed: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-right"
                    />
                  ) : (
                    formatEGP(debt.amount_owed)
                  )}
                </TableCell>

                {/* المدفوع */}
                <TableCell className="text-right text-teal-700 font-semibold">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData?.amount_paid || 0}
                      onChange={(e) => setEditData({ ...editData!, amount_paid: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-right"
                    />
                  ) : (
                    formatEGP(debt.amount_paid)
                  )}
                </TableCell>

                {/* المتبقي */}
                <TableCell className="text-right text-slate-700">{formatEGP(remaining)}</TableCell>

                {/* الحالة */}
                <TableCell>
                  <Badge className={`${status.color} border-0`}>{status.label}</Badge>
                </TableCell>

                {/* Progress Bar */}
                <TableCell>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all"
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 text-center">{Math.round(status.percentage)}%</p>
                </TableCell>

                {/* الإجراءات */}
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleEditSave}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditData(null)
                        }}
                        className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEditStart(debt)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteDebt(debt.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* الإحصائيات */}
      <div className="border-t border-teal-100 bg-gradient-to-r from-teal-50 to-blue-50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">{labels.totalOwed}</p>
            <p className="text-xl font-bold text-slate-900">
              {formatEGP(debts.reduce((sum, d) => sum + d.amount_owed, 0))}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-1">{labels.totalPaid}</p>
            <p className="text-xl font-bold text-teal-700">
              {formatEGP(debts.reduce((sum, d) => sum + d.amount_paid, 0))}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-1">{labels.totalRemaining}</p>
            <p className="text-xl font-bold text-slate-900">
              {formatEGP(debts.reduce((sum, d) => sum + Math.max(0, d.amount_owed - d.amount_paid), 0))}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-1">{labels.overallProgress}</p>
            <p className="text-xl font-bold text-teal-700">
              {Math.round(
                (debts.reduce((s, d) => s + d.amount_paid, 0) /
                  (debts.reduce((s, d) => s + d.amount_owed, 0) || 1)) *
                100,
              ) || 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}