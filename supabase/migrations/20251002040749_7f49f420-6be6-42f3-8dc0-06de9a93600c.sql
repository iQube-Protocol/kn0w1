-- Temporarily allow any authenticated user to upload to content-files to unblock uploads
CREATE POLICY "Authenticated can upload to content-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-files');