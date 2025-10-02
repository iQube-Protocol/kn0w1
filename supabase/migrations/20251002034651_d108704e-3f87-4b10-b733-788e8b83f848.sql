-- Allow content admins to upload files to content-files bucket
CREATE POLICY "Content admins can upload to content-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-files' 
  AND (
    has_admin_role(auth.uid(), 'super_admin'::admin_role) 
    OR has_admin_role(auth.uid(), 'content_admin'::admin_role)
  )
);

-- Allow content admins to update files in content-files bucket
CREATE POLICY "Content admins can update content-files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-files' 
  AND (
    has_admin_role(auth.uid(), 'super_admin'::admin_role) 
    OR has_admin_role(auth.uid(), 'content_admin'::admin_role)
  )
);

-- Allow content admins to delete files in content-files bucket  
CREATE POLICY "Content admins can delete from content-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-files' 
  AND (
    has_admin_role(auth.uid(), 'super_admin'::admin_role) 
    OR has_admin_role(auth.uid(), 'content_admin'::admin_role)
  )
);

-- Allow public read access to content-files bucket
CREATE POLICY "Public can view content-files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'content-files');