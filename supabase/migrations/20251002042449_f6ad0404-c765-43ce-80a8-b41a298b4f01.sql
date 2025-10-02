-- Clean up ALL existing content-files policies first
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname ILIKE '%content%file%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Create minimal, explicit policy set for content-files bucket
-- SELECT: public can view files
CREATE POLICY "Public can view content-files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'content-files');

-- INSERT: temporary public upload to unblock (will tighten later)
CREATE POLICY "Temp: Public can upload to content-files"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'content-files');

-- UPDATE/DELETE: only admins
CREATE POLICY "Admins can update content-files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-files' AND (
    public.has_admin_role(auth.uid(), 'super_admin'::public.admin_role) OR
    public.has_admin_role(auth.uid(), 'content_admin'::public.admin_role) OR
    public.is_mm_super_admin(auth.uid())
  )
);

CREATE POLICY "Admins can delete content-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-files' AND (
    public.has_admin_role(auth.uid(), 'super_admin'::public.admin_role) OR
    public.has_admin_role(auth.uid(), 'content_admin'::public.admin_role) OR
    public.is_mm_super_admin(auth.uid())
  )
);