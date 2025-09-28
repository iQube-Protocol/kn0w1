-- Create storage bucket for content files if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-files', 'content-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for content files bucket
CREATE POLICY "Anyone can view content files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'content-files');

CREATE POLICY "Admins can upload content files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'content-files' AND (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email LIKE '%admin%'
  )
));

CREATE POLICY "Admins can update content files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'content-files' AND (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email LIKE '%admin%'
  )
));

CREATE POLICY "Admins can delete content files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'content-files' AND (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email LIKE '%admin%'
  )
));