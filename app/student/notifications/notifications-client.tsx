"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCircle, Clock, AlertCircle, Info, ChevronRight, Check, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStudentNotifications, markNotificationAsRead } from "@/lib/notifications"
import { useToast } from "@/components/ui/toast-provider"
import type { NotificationRecipient } from "@/lib/types"

interface NotificationsClientProps {
    studentId: string
    initialNotifications: any[]
}

export default function NotificationsClient({ studentId, initialNotifications }: NotificationsClientProps) {
    const [notifications, setNotifications] = useState<NotificationRecipient[]>(initialNotifications)
    const [loading, setLoading] = useState(false)
    const { pushToast } = useToast()

    const handleMarkAsRead = async (id: string) => {
        const success = await markNotificationAsRead(id)
        if (success) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent": return "bg-rose-100 text-rose-700 border-rose-200"
            case "important": return "bg-amber-100 text-amber-700 border-amber-200"
            default: return "bg-blue-100 text-blue-700 border-blue-200"
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "alert": return <AlertCircle size={18} className="text-rose-500" />
            case "educational": return <Clock size={18} className="text-emerald-500" />
            case "administrative": return <ShieldAlert size={18} className="text-amber-500" />
            default: return <Info size={18} className="text-blue-500" />
        }
    }

    return (
        <div className="space-y-6 text-start" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">التنبيهات</h1>
                    <p className="text-muted-foreground mt-1">تابع آخر الأخبار والتحديثات الخاصة بك.</p>
                </div>
                <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
                    <Bell className="text-emerald-600" size={24} />
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-2xl bg-gray-50/50">
                    <Bell size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">لا توجد تنبيهات حالياً</h3>
                    <p className="text-muted-foreground text-sm mt-1">ستظهر هنا التنبيهات التي يتم إرسالها إليك من قبل الإدارة.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {notifications.map((rec) => {
                        const n = rec.notification
                        if (!n) return null

                        return (
                            <Card
                                key={rec.id}
                                className={`overflow-hidden transition-all border-r-4 ${rec.is_read ? "border-gray-100" : "border-emerald-500 bg-emerald-50/10 shadow-sm"
                                    }`}
                            >
                                <CardContent className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="mt-1">
                                                {getTypeIcon(n.type)}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className={`font-bold text-lg ${rec.is_read ? "text-gray-700" : "text-gray-900"}`}>
                                                        {n.title}
                                                    </h3>
                                                    <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getPriorityColor(n.priority)}`}>
                                                        {n.priority === 'urgent' ? 'عاجل' : n.priority === 'important' ? 'هام' : 'عادي'}
                                                    </Badge>
                                                    {!rec.is_read && (
                                                        <Badge className="bg-emerald-500 text-white text-[10px] px-2 py-0 border-none">جديد</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                    {n.content}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(n.created_at).toLocaleString("ar-EG")}
                                                </p>
                                            </div>
                                        </div>

                                        {!rec.is_read && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-2 shrink-0 self-end md:self-start"
                                                onClick={() => handleMarkAsRead(rec.id)}
                                            >
                                                <Check size={16} />
                                                تمت القراءة
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
