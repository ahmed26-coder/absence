-- Create a new storage bucket for payment proofs
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

-- Set up access control for the bucket
-- Allow authenticated users to upload files to their own folder (student_id)
create policy "Allow students to upload payment proofs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'payment-proofs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow everyone to view the files (since public=true)
create policy "Allow public viewing of payment proofs"
on storage.objects for select
to public
using (bucket_id = 'payment-proofs');

-- Allow students to delete their own proofs if needed (optional)
create policy "Allow students to delete their own payment proofs"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'payment-proofs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);
