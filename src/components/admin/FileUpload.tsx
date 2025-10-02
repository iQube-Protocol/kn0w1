import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface FileUploadProps {
  onFileUploaded: (url: string, fileName: string) => void;
  accept: string;
  maxSize?: number; // in MB
  label: string;
  description?: string;
  currentFile?: string;
  onRemoveFile?: () => void;
}

export const FileUpload = ({ 
  onFileUploaded, 
  accept, 
  maxSize = 10, 
  label, 
  description,
  currentFile,
  onRemoveFile 
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const userId = user?.id || 'anonymous';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = `content/${userId}/${fileName}`;

      console.log('Starting upload:', { filePath, fileSize: file.size, fileType: file.type });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { data, error } = await supabase.storage
        .from('content-files')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        console.error('Upload error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          status: (error as any).status,
          statusText: (error as any).statusText
        });
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content-files')
        .getPublicUrl(filePath);

      onFileUploaded(publicUrl, file.name);
      
      toast({
        title: "Upload successful",
        description: `${file.name} uploaded successfully`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorDetails = [
        error.message || "Failed to upload file",
        error.status && `Status: ${error.status}`,
        error.statusText && `(${error.statusText})`
      ].filter(Boolean).join(' ');
      
      toast({
        title: "Upload failed",
        description: errorDetails,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {currentFile ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{currentFile.split('/').pop()}</p>
                  <p className="text-sm text-muted-foreground">Current file</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(currentFile, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {onRemoveFile && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileUpload}
          disabled={uploading}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">
          Max file size: {maxSize}MB. Accepted: {accept}
        </p>
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-muted-foreground">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
};