"use client"

import { useState } from "react"
import { Send, Users, BookOpen, Globe, Mail, MessageSquare, AlertCircle, Info, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useToast } from "@/components/ui/toast-provider"
import { createNotification } from "@/lib/notifications"
import type {
    NotificationType,
    NotificationPriority,
    NotificationTargetType,
    NotificationChannel,
    Student,
    Course
} from "@/lib/types"

interface NotificationSenderProps {
    students: Student[]
    courses: Course[]
}

export const NotificationSender: React.FC<NotificationSenderProps> = ({ students, courses }) => {
    const { pushToast } = useToast()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "general" as NotificationType,
        priority: "normal" as NotificationPriority,
        target_type: "all" as NotificationTargetType,
        target_ids: [] as string[],
        channels: ["website"] as NotificationChannel[]
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.content) {
            pushToast("يرجى إدخال العنوان والمحتوى", "error")
            return
        }

        if (formData.target_type !== "all" && formData.target_ids.length === 0) {
            pushToast("يرجى اختيار المستهدفين", "error")
            return
        }

        if (formData.channels.length === 0) {
            pushToast("يرجى اختيار قناة واحدة على الأقل", "error")
            return
        }

        setLoading(true)
        try {
            const result = await createNotification(formData)
            if (result) {
                pushToast("تم إرسال التنبيه بنجاح", "success")
                setFormData({
                    ...formData,
                    title: "",
                    content: "",
                    target_ids: []
                })
            } else {
                pushToast("فشل إرسال التنبيه", "error")
            }
        } catch (error) {
            console.error(error)
            pushToast("حدث خطأ غير متوقع", "error")
        } finally {
            setLoading(false)
        }
    }

    const toggleChannel = (channel: NotificationChannel) => {
        setFormData(prev => ({
            ...prev,
            channels: prev.channels.includes(channel)
                ? prev.channels.filter(c => c !== channel)
                : [...prev.channels, channel]
        }))
    }

    const toggleTargetId = (id: string) => {
        setFormData(prev => ({
            ...prev,
            target_ids: prev.target_ids.includes(id)
                ? prev.target_ids.filter(tid => tid !== id)
                : [...prev.target_ids, id]
        }))
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-start" dir="rtl">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-emerald-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <Send size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">إرسال تنبيه جديد</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">يمكنك إرسال التنبيهات عبر الموقع أو البريد أو واتساب.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>عنوان التنبيه</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="مثلاً: تنبيه هام بخصوص موعد الاختبار"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>محتوى التنبيه</Label>
                            <Textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder="اكتب رسالتك هنا..."
                                className="min-h-[120px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>نوع التنبيه</Label>
                                <Select value={formData.type} onValueChange={(val: NotificationType) => setFormData({ ...formData, type: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">عام</SelectItem>
                                        <SelectItem value="educational">تعليمي</SelectItem>
                                        <SelectItem value="administrative">إداري</SelectItem>
                                        <SelectItem value="alert">تحذير</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>الأولوية</Label>
                                <Select value={formData.priority} onValueChange={(val: NotificationPriority) => setFormData({ ...formData, priority: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">عادي</SelectItem>
                                        <SelectItem value="important">هام</SelectItem>
                                        <SelectItem value="urgent">عاجل</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Target & Channels */}
                    <div className="space-y-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 font-bold mb-2">
                                <Users size={16} className="text-emerald-600" />
                                المستهدفون
                            </Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="target"
                                        checked={formData.target_type === 'all'}
                                        onChange={() => setFormData({ ...formData, target_type: 'all', target_ids: [] })}
                                    />
                                    <span className="text-sm">الجميع</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="target"
                                        checked={formData.target_type === 'student'}
                                        onChange={() => setFormData({ ...formData, target_type: 'student', target_ids: [] })}
                                    />
                                    <span className="text-sm">طلاب محددين</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="target"
                                        checked={formData.target_type === 'course'}
                                        onChange={() => setFormData({ ...formData, target_type: 'course', target_ids: [] })}
                                    />
                                    <span className="text-sm">دورات محددة</span>
                                </label>
                            </div>

                            {formData.target_type === 'student' && (
                                <div className="max-h-40 overflow-y-auto border rounded-xl p-2 bg-white scrollbar-custom">
                                    {students.map(s => (
                                        <label key={s.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                                            <Checkbox
                                                checked={formData.target_ids.includes(s.id)}
                                                onCheckedChange={() => toggleTargetId(s.id)}
                                            />
                                            {s.name}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {formData.target_type === 'course' && (
                                <div className="max-h-40 overflow-y-auto border rounded-xl p-2 bg-white scrollbar-custom">
                                    {courses.map(c => (
                                        <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                                            <Checkbox
                                                checked={formData.target_ids.includes(c.id)}
                                                onCheckedChange={() => toggleTargetId(c.id)}
                                            />
                                            {c.name}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pt-2 border-t border-gray-100">
                            <Label className="flex items-center gap-2 font-bold mb-2">
                                <Globe size={16} className="text-blue-600" />
                                قنوات الإرسال
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => toggleChannel("website")}
                                    className={`flex items-center gap-2 p-3 rounded-xl border transition ${formData.channels.includes("website")
                                            ? "bg-blue-50 border-blue-200 text-blue-700 font-bold"
                                            : "bg-white border-gray-100 hover:border-blue-100"
                                        }`}
                                >
                                    <Globe size={16} />
                                    <span className="text-xs">الموقع</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleChannel("email")}
                                    className={`flex items-center gap-2 p-3 rounded-xl border transition ${formData.channels.includes("email")
                                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                                            : "bg-white border-gray-100 hover:border-emerald-100"
                                        }`}
                                >
                                    <Mail size={16} />
                                    <span className="text-xs">البريد</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleChannel("whatsapp")}
                                    className={`flex items-center gap-2 p-3 rounded-xl border transition ${formData.channels.includes("whatsapp")
                                            ? "bg-green-50 border-green-200 text-green-700 font-bold"
                                            : "bg-white border-gray-100 hover:border-green-100"
                                        }`}
                                >
                                    <MessageSquare size={16} />
                                    <span className="text-xs">واتساب</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-50">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-xl gap-2 min-w-[150px]"
                    >
                        {loading ? "جاري الإرسال..." : (
                            <>
                                <Send size={18} />
                                إرسال الآن
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
