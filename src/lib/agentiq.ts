import { supabase } from '@/integrations/supabase/client';

const CORE_MODULE_URL = 'https://cdn.jsdelivr.net/npm/@qriptoagentiq/core-client@0.1.8/+esm';

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

  // Dynamically import from CDN to avoid bundler resolution issues
  const mod: any = await import(/* @vite-ignore */ CORE_MODULE_URL);
  const CoreCtor = mod?.Core || mod?.default?.Core || mod?.default || mod;
  if (typeof CoreCtor !== 'function') {
    throw new Error('Failed to load AgentiQ Core client from CDN');
  }

  coreInstance = new CoreCtor(session.access_token) as CoreLike;
  
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
