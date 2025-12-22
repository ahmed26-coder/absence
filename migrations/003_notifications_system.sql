-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    type TEXT NOT NULL, -- 'general', 'educational', 'administrative', 'alert'
    priority TEXT NOT NULL, -- 'normal', 'important', 'urgent'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'student', 'course', 'all'
    target_ids TEXT[] DEFAULT '{}', -- Array of user IDs or course IDs
    channels TEXT[] NOT NULL DEFAULT '{website}', -- 'website', 'email', 'whatsapp'
    created_by UUID REFERENCES public.profiles(id)
);

-- Notification Recipients Table
CREATE TABLE IF NOT EXISTS public.notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    sent_channels TEXT[] DEFAULT '{}',
    UNIQUE(notification_id, student_id)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

-- Admins: Full access to everything
CREATE POLICY "Admins have full access to notifications"
ON public.notifications
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins have full access to notification_recipients"
ON public.notification_recipients
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Students: Read access to notifications they are recipients of
CREATE POLICY "Students can view their own recipients"
ON public.notification_recipients
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can update their own read status"
ON public.notification_recipients
FOR UPDATE
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view notifications they received"
ON public.notifications
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.notification_recipients
        WHERE notification_id = notifications.id AND student_id = auth.uid()
    )
);
