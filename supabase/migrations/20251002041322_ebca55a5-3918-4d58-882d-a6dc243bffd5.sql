-- TEMP: allow public inserts to content-files to diagnose remaining 403
CREATE POLICY "Public can upload to content-files (temp)"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'content-files');