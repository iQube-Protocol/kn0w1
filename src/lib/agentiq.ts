import { supabase } from '@/integrations/supabase/client';
import { Core } from '@qriptoagentiq/core-client';

type CoreLike = {
  ensureIamUser(): Promise<void>;
  kn0w1Feed?: (limit: number) => Promise<any[]>;
  signedUrl?: (mediaAssetId: string) => Promise<string>;
  uploadIntake?: (file: File) => Promise<{ uploadId: string }>;
  uploadToStorage?: (uploadId: string, file: File) => Promise<void>;
  emitMeter?: (mediaAssetId: string, eventType: string, metadata?: Record<string, any>) => Promise<void>;
};

let coreInstance: CoreLike | null = null;

export async function getCore(): Promise<CoreLike> {
  if (coreInstance) {
    return coreInstance;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session - user must be logged in');
  }

  // Use npm package directly instead of CDN to avoid bundling issues
  coreInstance = new Core(session.access_token) as CoreLike;
  
  // Bootstrap - this calls ensureIamUser() internally
  await coreInstance.ensureIamUser();
  
  return coreInstance;
}

/**
 * Clear the core instance (useful for logout)
 */
export function clearCore() {
  coreInstance = null;
}
