-- Add RLS policies for business-documents storage bucket

-- Allow users to upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'business-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all documents
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'business-documents' AND
  public.is_admin(auth.uid())
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);