-- Fix foreign key relationship to allow joins with profiles
ALTER TABLE public.payment_requests 
DROP CONSTRAINT IF EXISTS payment_requests_student_id_fkey;

ALTER TABLE public.payment_requests
ADD CONSTRAINT payment_requests_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;
