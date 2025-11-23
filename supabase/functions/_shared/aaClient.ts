// Reusable AA-API client following Aigent Z integration guide
// Pattern A: AIGENT_Z_AA_BASE includes /aa/v1, paths are relative

export interface AaAuthTokenResponse {
  aa_token: string;
  tenant_id: string;
}

export interface AaChallengeResponse {
  nonce: string;
}

/**
 * Build AA-API URL from relative path
 * Expects AIGENT_Z_AA_BASE to be set to: https://dev-beta.aigentz.me/aa/v1
 */
export function aaUrl(path: string): string {
  const base = Deno.env.get('AIGENT_Z_AA_BASE');
  if (!base) {
    throw new Error('AIGENT_Z_AA_BASE environment variable not set');
  }
  
  // Validate it's a proper URL
  if (!base.startsWith('http://') && !base.startsWith('https://')) {
    throw new Error('AIGENT_Z_AA_BASE must be a valid URL (e.g., https://dev-beta.aigentz.me/aa/v1)');
  }
  
  // Simple relative path joining (no leading slash on path)
  const baseUrl = base.endsWith('/') ? base : `${base}/`;
  return new URL(path, baseUrl).toString();
}

/**
 * Request authentication challenge from AA-API
 */
export async function requestChallenge(did: string): Promise<AaChallengeResponse> {
  const response = await fetch(aaUrl('auth/challenge'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ did }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AA-API] Challenge error: ${response.status} - ${errorText}`);
    throw new Error(`AA-API challenge failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Verify signature and get aa_token
 */
export async function verifySignature(did: string, signature: string): Promise<AaAuthTokenResponse> {
  const response = await fetch(aaUrl('auth/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ did, signature }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AA-API] Verify error: ${response.status} - ${errorText}`);
    throw new Error(`AA-API verify failed: ${response.status}`);
  }

  return response.json();
}
