// Type declarations for @qriptoagentiq packages
// Remove this file once the SDK packages include proper TypeScript declarations

declare module '@qriptoagentiq/core-client' {
  export interface AgentiqClient {
    ensureIamUser(): Promise<void>;
    kn0w1Feed(limit: number): Promise<any[]>;
    uploadIntake(params: {
      ctx: { tenantId: string; siteId: string };
      instanceId: string;
      file: File;
      sensitive: boolean;
    }): Promise<{ payloadId: string; storageUri: string }>;
    uploadToStorage(uri: string, file: File): Promise<void>;
    signedUrl(params: { payloadId: string; isoCountry?: string }): Promise<string>;
    emitMeter(params: {
      subjectType: 'tenant' | 'site' | 'user';
      subjectId: string;
      metric: string;
      qty: number;
      sku: string;
    }): Promise<void>;
  }

  export function initAgentiqClient(): AgentiqClient;
}

declare module '@qriptoagentiq/kn0w1-client' {
  export * from '@qriptoagentiq/core-client';
}
