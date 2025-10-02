-- Expand storage policies to include Uber Admins (MM super admins)
ALTER POLICY "Content admins can upload to content-files"
ON storage.objects
WITH CHECK (
  bucket_id = 'content-files'
  AND (
    public.has_admin_role(auth.uid(), 'super_admin'::public.admin_role)
    OR public.has_admin_role(auth.uid(), 'content_admin'::public.admin_role)
    OR public.is_mm_super_admin(auth.uid())
  )
);

ALTER POLICY "Content admins can update content-files"
ON storage.objects
USING (
  bucket_id = 'content-files'
  AND (
    public.has_admin_role(auth.uid(), 'super_admin'::public.admin_role)
    OR public.has_admin_role(auth.uid(), 'content_admin'::public.admin_role)
    OR public.is_mm_super_admin(auth.uid())
  )
);

ALTER POLICY "Content admins can delete from content-files"
ON storage.objects
USING (
  bucket_id = 'content-files'
  AND (
    public.has_admin_role(auth.uid(), 'super_admin'::public.admin_role)
    OR public.has_admin_role(auth.uid(), 'content_admin'::public.admin_role)
    OR public.is_mm_super_admin(auth.uid())
  )
);