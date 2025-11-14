import { supabase } from '@/integrations/supabase/client';
import { createJWT } from 'did-jwt';

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
  // Check for kn0w1 format DID first (preferred format)
  const expectedDid = `did:kn0w1:${userId.replace(/-/g, '')}`;
  
  const { data: existingDids } = await supabase
    .from('did_identities')
    .select('did')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // If we have the expected kn0w1 format, use it
  if (existingDids && existingDids.length > 0) {
    const kn0w1Did = existingDids.find(d => d.did === expectedDid);
    if (kn0w1Did) {
      console.log('Using existing kn0w1 DID:', kn0w1Did.did);
      return kn0w1Did.did;
    }
    // Otherwise use the most recent one
    console.log('Using most recent DID:', existingDids[0].did);
    return existingDids[0].did;
  }

  // Create new DID if none exists
  const { error: insertError } = await supabase
    .from('did_identities')
    .insert({
      user_id: userId,
      did: expectedDid,
    });

  if (insertError) {
    // If duplicate key error, fetch and return existing DID
    if (insertError.code === '23505') {
      const { data: existing } = await supabase
        .from('did_identities')
        .select('did')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (existing?.did) {
        console.log('Using existing DID after duplicate:', existing.did);
        return existing.did;
      }
    }
    console.error('Failed to create DID:', insertError);
    throw new Error(`DID creation failed: ${insertError.message}`);
  }

  console.log('Created new DID:', expectedDid);
  return expectedDid;
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

/**
 * Sign a challenge with DID JWT for AigentZ authentication
 * Creates a DID-JWS (JSON Web Signature) from the challenge
 */
export async function signDIDChallenge(challenge: string, did: string): Promise<string> {
  try {
    // For now, create a simple JWT with the challenge as payload
    // In production, this should use proper DID key signing
    const payload = {
      challenge,
      did,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 300, // 5 min expiry
    };

    // Create JWT - in production, this should use actual DID key
    // For now, we'll use a simple signed format that AigentZ can verify
    const header = btoa(JSON.stringify({ alg: 'ES256K', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = btoa(challenge); // Placeholder - should be proper signature
    
    return `${header}.${body}.${signature}`;
  } catch (error) {
    console.error('Failed to sign DID challenge:', error);
    throw new Error('DID challenge signing failed');
  }
}
