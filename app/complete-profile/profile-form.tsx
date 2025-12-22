"use client"

import { useActionState } from "react"
import { updateProfile } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCircle, Upload, Plus, Trash2, Mars, Venus } from "lucide-react"
import { useState, useEffect } from "react"

const initialState = {
    error: "",
    success: false,
}

interface ProfileFormProps {
    initialProfile?: any
    initialDebts?: any[]
    userAvatar?: string | null
    availableCourses?: any[]
}

export default function ProfileForm({ initialProfile, initialDebts = [], userAvatar, availableCourses = [] }: ProfileFormProps) {
    const [state, action] = useActionState(updateProfile, initialState)
    // Priority: Existing Profile Image -> Google Image (Auth) -> Placeholder (null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        initialProfile?.avatar_url || userAvatar || null
    )

    // Initialize Gender from props
    const [gender, setGender] = useState<string>(initialProfile?.gender || "")

    // Initialize Courses
    const [selectedCourses, setSelectedCourses] = useState<string[]>([])

    // Initialize Debts (map DB structure to form structure if needed)
    // Structure expected: { id, name, amount, paid }
    // DB structure might be: { id, name, amount_owed, amount_paid }
    const [debts, setDebts] = useState<{ id: number; name: string; amount: string; paid: string }[]>(
        initialDebts.map(d => ({
            id: d.id,
            name: d.name,
            amount: d.amount_owed?.toString() || "",
            paid: d.amount_paid?.toString() || ""
        }))
    )

    // Handle Avatar Preview
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const objectUrl = URL.createObjectURL(file)
            setAvatarPreview(objectUrl)
        }
    }

    // Handle Gender
    const selectGender = (val: string) => {
        setGender(val)
    }

    // Handle Debts
    const addDebt = () => {
        setDebts([...debts, { id: Date.now(), name: "", amount: "", paid: "" }])
    }

    const removeDebt = (id: number) => {
        setDebts(debts.filter(d => d.id !== id))
    }

    const updateDebt = (id: number, field: string, value: string) => {
        setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d))
    }

    const totalDebt = debts.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
    const totalPaid = debts.reduce((sum, d) => sum + (Number(d.paid) || 0), 0)

    return (
        <form action={action} className="space-y-8">
            {/* 1. Profile Image */}
            <div className="flex flex-col items-center space-y-4">
                <div className="relative group cursor-pointer w-24 h-24">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 ${avatarPreview ? 'border-emerald-500' : 'border-gray-200 bg-gray-100'}`}>
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle className="w-16 h-16 text-gray-400" />
                        )}
                    </div>
                    <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                        <Upload size={24} />
                    </label>
                    <input
                        id="avatar-upload"
                        name="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </div>
                <p className="text-xs text-gray-500">اضغط لتغيير الصورة (اختياري)</p>
            </div>

            {/* 2. Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الثلاثي *</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        placeholder="الاسم الأول - الأب - العائلة"
                        required
                        className="text-right"
                        defaultValue={initialProfile?.full_name}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        required
                        className="text-right"
                        dir="ltr"
                        defaultValue={initialProfile?.phone}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="age">العمر *</Label>
                    <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="مثال: 25"
                        required
                        defaultValue={initialProfile?.age}
                    />
                </div>
                <div className="space-y-2">
                    <Label>الجنس *</Label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => selectGender('male')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${gender === 'male'
                                ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                                }`}
                        >
                            <span className="font-medium flex">ذكر<Mars /></span>
                        </button>
                        <button
                            type="button"
                            onClick={() => selectGender('female')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${gender === 'female'
                                ? 'bg-pink-50 border-pink-500 text-pink-700 ring-1 ring-pink-500'
                                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                                }`}
                        >
                            <span className="font-medium flex">أنثى<Venus /></span>
                        </button>
                    </div>
                    {/* Hidden input to pass value to server action */}
                    <input type="hidden" name="gender" value={gender} required />
                </div>
            </div>

            {/* 3. Course Selection */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
                <Label className="text-lg font-semibold text-gray-800">اختر الدورات التي ترغب بالانضمام إليها</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableCourses.map((course) => (
                        <label
                            key={course.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-gray-50 ${selectedCourses.includes(course.id)
                                ? 'border-emerald-500 bg-emerald-50/50'
                                : 'border-gray-200'
                                }`}
                        >
                            <input
                                type="checkbox"
                                name="course_ids"
                                value={course.id}
                                checked={selectedCourses.includes(course.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedCourses([...selectedCourses, course.id])
                                    } else {
                                        setSelectedCourses(selectedCourses.filter(id => id !== course.id))
                                    }
                                }}
                                className="w-5 h-5 accent-emerald-600"
                            />
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm leading-tight">{course.name}</p>
                                <p className="text-[10px] text-gray-500">{course.instructor || "نخبة من العلماء"}</p>
                            </div>
                        </label>
                    ))}
                    {availableCourses.length === 0 && (
                        <p className="text-sm text-gray-500 col-span-full text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            لا توجد دورات متاحة حالياً.
                        </p>
                    )}
                </div>
            </div>

            {/* 3. Financial / Debt Details */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-gray-800">تفاصيل الديون (اختياري)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addDebt} className="gap-2">
                        <Plus size={16} /> إضافة دين
                    </Button>
                </div>

                {debts.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-500 text-sm">
                        لا يوجد ديون مسجلة. اضغط في الأعلى لإضافة تفاصيل.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {debts.map((debt, index) => (
                            <div key={debt.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                <div className="flex-1 space-y-1">
                                    <Input
                                        name={`debt_name_${index}`}
                                        placeholder="اسم الكتاب / الغرض"
                                        value={debt.name}
                                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="w-24 space-y-1">
                                    <Input
                                        name={`debt_amount_${index}`}
                                        type="number"
                                        placeholder="المبلغ"
                                        value={debt.amount}
                                        onChange={(e) => updateDebt(debt.id, 'amount', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="w-24 space-y-1">
                                    <Input
                                        name={`debt_paid_${index}`}
                                        type="number"
                                        placeholder="المدفوع"
                                        value={debt.paid}
                                        onChange={(e) => updateDebt(debt.id, 'paid', e.target.value)}
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeDebt(debt.id)}>
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Counter for server action loop */}
                <input type="hidden" name="debt_count" value={debts.length} />

                {debts.length > 0 && (
                    <div className="flex justify-between items-center text-sm font-medium bg-emerald-50 text-emerald-800 p-3 rounded-md">
                        <span>الإجمالي: {totalDebt}ج.م</span>
                        <span>المدفوع: {totalPaid}ج.م</span>
                        <span>المتبقي: {totalDebt - totalPaid}ج.م</span>
                    </div>
                )}
            </div>

            {state?.error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 text-center">
                    {state.error}
                </div>
            )}

            <Button type="submit" className="w-full text-lg py-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                حفظ ومتابعة
            </Button>
        </form>
    )
}
