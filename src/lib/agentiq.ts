import { Core } from '@qriptoagentiq/core-client';
import { supabase } from '@/integrations/supabase/client';

let coreInstance: Core | null = null;

/**
 * Bootstrap the AgentiQ Core SDK
 * This calls ensureIamUser() which creates/updates the iam_user entry
 */
export async function getCore(): Promise<Core> {
  if (coreInstance) {
    return coreInstance;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session - user must be logged in');
  }

  coreInstance = new Core(session.access_token);
  
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
