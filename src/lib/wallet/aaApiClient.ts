// AA-API Client for AigentZ (auth + SSE) and Gateway (quotes + intents)

export interface AaApiConfig {
  aigentzBase: string;
  gatewayProxyBase: string;
}

export interface Quote {
  id: string;
  chain: string;
  size_usd: number;
  price: number;
  timestamp: string;
  [key: string]: any;
}

export interface IntentProposal {
  quote_id: string;
  asset_id: string;
  recipient_did: string;
  [key: string]: any;
}

export interface IntentResponse {
  success: boolean;
  intent_id: string;
  status: string;
  [key: string]: any;
}

export interface SSEEvent {
  type: 'balance_update' | 'transaction_update' | 'fill' | 'pnl' | 'settlement';
  data: any;
  timestamp?: string;
}

export class AaApiClient {
  private aigentzBase: string;
  private gatewayProxyBase: string;
  private authToken: string | null = null;

  constructor(config: AaApiConfig) {
    this.aigentzBase = config.aigentzBase;
    this.gatewayProxyBase = config.gatewayProxyBase;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // AigentZ Auth Methods
  async authChallenge(did: string): Promise<{ challenge: string }> {
    return this.fetch(`${this.aigentzBase}/aa/v1/auth/challenge`, {
      method: 'POST',
      body: JSON.stringify({ did }),
    });
  }

  async authVerify(jws: string): Promise<{ token: string }> {
    return this.fetch(`${this.aigentzBase}/aa/v1/auth/verify`, {
      method: 'POST',
      body: JSON.stringify({ jws }),
    });
  }

  // AigentZ SSE Feed
  subscribeFeed(
    onMessage: (event: SSEEvent) => void,
    onError?: (error: Error) => void
  ): () => void {
    if (!this.authToken) {
      console.warn('No auth token for SSE subscription');
      return () => {};
    }

    const eventSource = new EventSource(
      `${this.aigentzBase}/aa/v1/updates?token=${encodeURIComponent(this.authToken)}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
        onError?.(error instanceof Error ? error : new Error('Parse error'));
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      onError?.(new Error('SSE connection failed'));
      eventSource.close();
    };

    return () => eventSource.close();
  }

  // Gateway Methods (via Edge Function Proxies)
  async getQuotes(params: { chain: string; size_usd: number }): Promise<Quote[]> {
    const queryParams = new URLSearchParams({
      chain: params.chain,
      size_usd: params.size_usd.toString(),
    });

    return this.fetch(`${this.gatewayProxyBase}/gateway-quotes?${queryParams}`);
  }

  async proposeIntent(payload: IntentProposal): Promise<IntentResponse> {
    return this.fetch(`${this.gatewayProxyBase}/gateway-intent`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
