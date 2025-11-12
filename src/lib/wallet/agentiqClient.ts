import { getCore } from '@/lib/agentiq';

export interface WalletBalance {
  asset: string;
  amount: number;
  symbol: string;
}

export interface X402Quote {
  txId: string;
  amount: number;
  asset: string;
  to: string;
  from: string;
  expires: string;
}

export interface X402Transaction {
  txId: string;
  status: 'pending' | 'signed' | 'sent' | 'settled' | 'failed';
  amount: number;
  asset: string;
  timestamp: string;
}

export class AgentiqWalletClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuth(token: string) {
    this.authToken = token;
  }

  private async fetch(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async initWallet(policy: 'delegated' | 'local' = 'delegated'): Promise<{ address: string; policy: string }> {
    return this.fetch('/wallet/init', {
      method: 'POST',
      body: JSON.stringify({ policy }),
    });
  }

  async getBalances(): Promise<WalletBalance[]> {
    return this.fetch('/wallet/balances');
  }

  async linkFioHandle(handle: string, signature: string): Promise<{ success: boolean; handle: string }> {
    return this.fetch('/wallet/link-fio', {
      method: 'POST',
      body: JSON.stringify({ handle, signature }),
    });
  }

  async requestFioChallenge(handle: string): Promise<{ challenge: string }> {
    return this.fetch('/wallet/fio-challenge', {
      method: 'POST',
      body: JSON.stringify({ handle }),
    });
  }

  async createX402Quote(params: { to: string; amount: number; asset: string }): Promise<X402Quote> {
    return this.fetch('/x402/quote', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async signX402Transaction(txId: string, signature: string): Promise<{ success: boolean }> {
    return this.fetch('/x402/sign', {
      method: 'POST',
      body: JSON.stringify({ txId, signature }),
    });
  }

  async sendX402Payment(txId: string): Promise<{ success: boolean; txId: string }> {
    return this.fetch('/x402/send', {
      method: 'POST',
      body: JSON.stringify({ txId }),
    });
  }

  async getX402Status(txId: string): Promise<X402Transaction> {
    return this.fetch(`/x402/status/${txId}`);
  }

  async getEntitlements(): Promise<any[]> {
    return this.fetch('/entitlements');
  }

  subscribeToUpdates(callback: (event: any) => void): () => void {
    if (!this.authToken) {
      console.warn('No auth token for SSE subscription');
      return () => {};
    }

    const eventSource = new EventSource(`${this.baseUrl}/sse`, {
      withCredentials: false,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    return () => eventSource.close();
  }
}

// Sign message using AgentiQ SDK
export async function signWithAgentiQ(message: string): Promise<string> {
  const core = await getCore();
  // Use AgentiQ SDK for signing (delegated key management)
  // For now, return a mock signature - real implementation will use SDK's signing method
  return `sig_${btoa(message).substring(0, 32)}`;
}
