-- Create payment_requests table
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    debt_id uuid REFERENCES public.debts(id) ON DELETE CASCADE NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0),
    note text,
    proof_image_url text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Policies for Students
CREATE POLICY "Students can view their own requests"
ON public.payment_requests FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own requests"
ON public.payment_requests FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Policies for Admins
CREATE POLICY "Admins can manage all requests"
ON public.payment_requests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_student_id ON public.payment_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);
