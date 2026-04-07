-- Create the identity-documents storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('identity-documents', 'identity-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own identity documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'identity-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own documents
CREATE POLICY "Users can read own identity documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'identity-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Doctors can read documents of patients in their consultations
CREATE POLICY "Doctors can read patient identity documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'identity-documents'
  AND EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'doctor'
  )
  AND EXISTS (
    SELECT 1
    FROM public.consultations c
    WHERE c.doctor_id = auth.uid()
      AND c.patient_id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Service role can do anything (upload, read, update, delete)
CREATE POLICY "Service role has full access to identity documents"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'identity-documents')
WITH CHECK (bucket_id = 'identity-documents');
