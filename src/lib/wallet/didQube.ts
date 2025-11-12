import { supabase } from '@/integrations/supabase/client';

export const DID_JWT_KEY = 'did_jws';

export function storeDIDJWT(jwt: string) {
  localStorage.setItem(DID_JWT_KEY, jwt);
}

export function getDIDJWT(): string | null {
  return localStorage.getItem(DID_JWT_KEY);
}

export function clearDIDJWT() {
  localStorage.removeItem(DID_JWT_KEY);
}

export async function getOrCreateDID(userId: string): Promise<string> {
  // Check existing DID
  const { data: existingDid } = await supabase
    .from('did_identities')
    .select('did')
    .eq('user_id', userId)
    .single();

  if (existingDid?.did) {
    return existingDid.did;
  }

  // Create new DID
  const did = `did:kn0w1:${userId.replace(/-/g, '')}`;
  
  await supabase
    .from('did_identities')
    .insert({
      user_id: userId,
      did,
    });

  return did;
}

export async function generateDIDJWT(userId: string, did: string): Promise<string> {
  // Generate DID JWT via edge function
  const { data, error } = await supabase.functions.invoke('wallet-did-jwt', {
    body: { userId, did }
  });

  if (error) {
    console.error('Failed to generate DID JWT:', error);
    // Fallback to client-side generation for development
    const payload = {
      sub: did,
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24h
    };
    return btoa(JSON.stringify(payload));
  }

  return data.jwt;
}

export async function updateFioHandle(userId: string, handle: string): Promise<void> {
  await supabase
    .from('did_identities')
    .update({ 
      agent_handle: handle,
    })
    .eq('user_id', userId);
}
