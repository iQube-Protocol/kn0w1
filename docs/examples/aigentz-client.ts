/**
 * AigentZ Client - Thin Client Helper
 * 
 * A minimal TypeScript helper for external agents to:
 * - Authenticate against AA-API (challenge/verify flow)
 * - Call AA-API routes with proper token management
 * - Access DiDQube reputation via Aigent Z HTTP routes
 * 
 * Usage:
 * ```ts
 * const client = new AigentZClient({
 *   did: 'did:example:aigent-z',
 *   signNonce: async (nonce) => {
 *     // Sign nonce with your agent key
 *     return yourSignFunction(nonce);
 *   }
 * });
 * 
 * const token = await client.getToken();
 * await client.transferQct({ fromAgentId: 'a', toAgentId: 'b', amountQct: 100 });
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface AigentZClientConfig {
  /** Agent DID for authentication */
  did: string;
  
  /** Function to sign nonce with agent key */
  signNonce: (nonce: string) => Promise<string>;
  
  /** Optional: AA-API base URL (default: env AIGENT_Z_AA_BASE) */
  aaBaseUrl?: string;
  
  /** Optional: Aigent Z app base URL for identity routes (default: env AIGENT_Z_APP_BASE) */
  appBaseUrl?: string;
}

export interface AATokenResponse {
  aa_token: string;
  tenant_id: string;
}

export interface ChallengeResponse {
  nonce: string;
}

export interface ReputationBucket {
  bucket: string;
  score: number;
  skill_category: string;
  last_updated: string;
  evidence_count: number;
}

export interface ReputationResponse {
  ok: boolean;
  data?: ReputationBucket;
  error?: string;
}

// ============================================================================
// AigentZ Client Class
// ============================================================================

export class AigentZClient {
  private config: Required<AigentZClientConfig>;
  private aaToken: string | null = null;
  private tenantId: string | null = null;

  constructor(config: AigentZClientConfig) {
    // Resolve base URLs from env if not provided
    const aaBaseUrl = config.aaBaseUrl 
      || process.env.AIGENT_Z_AA_BASE 
      || process.env.AIGENT_Z_API_BASE + '/aa/v1'
      || 'https://aa.dev-beta.aigentz.me/aa/v1';

    const appBaseUrl = config.appBaseUrl
      || process.env.AIGENT_Z_APP_BASE
      || 'https://dev-beta.aigentz.me';

    this.config = {
      ...config,
      aaBaseUrl,
      appBaseUrl,
    };
  }

  /**
   * Build AA-API URL for a given path
   */
  private aaUrl(path: string): string {
    const base = new URL(this.config.aaBaseUrl);
    return new URL(path, base).toString();
  }

  /**
   * Build Aigent Z app URL for a given path
   */
  private appUrl(path: string): string {
    const base = new URL(this.config.appBaseUrl);
    return new URL(path, base).toString();
  }

  /**
   * Get or refresh AA token
   */
  async getToken(forceRefresh = false): Promise<string> {
    if (this.aaToken && !forceRefresh) {
      return this.aaToken;
    }

    // Step 1: Challenge
    const chalRes = await fetch(this.aaUrl('auth/challenge'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ did: this.config.did }),
    });

    if (!chalRes.ok) {
      const text = await chalRes.text();
      throw new Error(`Challenge failed: ${chalRes.status} ${text}`);
    }

    const { nonce } = await chalRes.json() as ChallengeResponse;

    // Step 2: Sign nonce
    const signature = await this.config.signNonce(nonce);

    // Step 3: Verify
    const verifyRes = await fetch(this.aaUrl('auth/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        did: this.config.did,
        signature,
      }),
    });

    if (!verifyRes.ok) {
      const text = await verifyRes.text();
      throw new Error(`Verify failed: ${verifyRes.status} ${text}`);
    }

    const { aa_token, tenant_id } = await verifyRes.json() as AATokenResponse;
    
    this.aaToken = aa_token;
    this.tenantId = tenant_id;
    
    return aa_token;
  }

  /**
   * Make authenticated fetch to AA-API
   */
  async fetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.getToken();
    
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    return fetch(this.aaUrl(path), {
      ...init,
      headers,
    });
  }

  /**
   * Transfer Q¢ between agents
   */
  async transferQct(params: {
    fromAgentId: string;
    toAgentId: string;
    amountQct: number;
  }): Promise<Response> {
    return this.fetch('payments/transfer', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Check entitlement for asset + action
   */
  async checkEntitlement(params: {
    assetId: string;
    action: string;
  }): Promise<Response> {
    return this.fetch('entitlements/check', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Register an asset
   */
  async registerAsset(assetData: Record<string, unknown>): Promise<Response> {
    return this.fetch('assets', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  }

  /**
   * Query assets
   */
  async queryAssets(filters?: Record<string, unknown>): Promise<Response> {
    const query = filters ? '?' + new URLSearchParams(filters as Record<string, string>).toString() : '';
    return this.fetch(`assets${query}`, {
      method: 'GET',
    });
  }
}

// ============================================================================
// DiDQube Reputation Helpers (via Aigent Z app HTTP routes)
// ============================================================================

/**
 * Get reputation bucket for a partition ID
 * 
 * @param partitionId - e.g. 'agent:aigent-z', 'persona:abc', 'iqb:xyz'
 * @param appBaseUrl - Optional override for AIGENT_Z_APP_BASE
 */
export async function getReputationBucket(
  partitionId: string,
  appBaseUrl?: string
): Promise<ReputationResponse> {
  const base = appBaseUrl || process.env.AIGENT_Z_APP_BASE || 'https://dev-beta.aigentz.me';
  const url = `${base}/api/identity/reputation/bucket?partitionId=${encodeURIComponent(partitionId)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return {
        ok: false,
        error: `HTTP ${res.status}: ${await res.text()}`,
      };
    }

    const json = await res.json();
    return {
      ok: json.ok ?? true,
      data: json.data,
      error: json.error,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Create initial reputation bucket
 * 
 * @param params - Bucket creation parameters
 * @param appBaseUrl - Optional override for AIGENT_Z_APP_BASE
 */
export async function createReputationBucket(
  params: {
    partitionId: string;
    skillCategory: string;
    initialScore: number;
  },
  appBaseUrl?: string
): Promise<ReputationResponse> {
  const base = appBaseUrl || process.env.AIGENT_Z_APP_BASE || 'https://dev-beta.aigentz.me';
  const url = `${base}/api/identity/reputation/bucket`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `HTTP ${res.status}: ${await res.text()}`,
      };
    }

    const json = await res.json();
    return {
      ok: json.ok ?? true,
      data: json.data,
      error: json.error,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Example: Bootstrap agent and make a payment
 */
export async function exampleUsage() {
  // 1. Create client
  const client = new AigentZClient({
    did: 'did:example:aigent-z',
    signNonce: async (nonce) => {
      // TODO: Replace with real signature
      // For Phase 1 dev, any non-empty string works
      console.log('Signing nonce:', nonce);
      return nonce; // TEMP stub
    },
  });

  // 2. Authenticate (get aa_token)
  const token = await client.getToken();
  console.log('Got aa_token:', token);

  // 3. Transfer Q¢
  const transferRes = await client.transferQct({
    fromAgentId: 'aigent-z',
    toAgentId: 'aigent-moneypenny',
    amountQct: 100,
  });

  const transferJson = await transferRes.json();
  console.log('Transfer result:', transferJson);

  // 4. Check reputation
  const rep = await getReputationBucket('agent:aigent-z');
  if (rep.ok && rep.data) {
    console.log('Reputation bucket:', rep.data.bucket);
    console.log('Score:', rep.data.score);
    console.log('Skill:', rep.data.skill_category);
  } else {
    console.log('No reputation or error:', rep.error);
  }

  // 5. Create reputation bucket if needed
  if (!rep.ok || !rep.data) {
    const created = await createReputationBucket({
      partitionId: 'agent:aigent-z',
      skillCategory: 'cross_chain_ops',
      initialScore: 75,
    });
    console.log('Created bucket:', created);
  }
}
