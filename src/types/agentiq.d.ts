declare module '@qriptoagentiq/core-client' {
  export class Core {
    constructor(accessToken: string);
    ensureIamUser(): Promise<void>;
    kn0w1Feed(limit: number): Promise<any[]>;
    signedUrl(mediaAssetId: string): Promise<string>;
    uploadIntake(file: File): Promise<{ uploadId: string }>;
    uploadToStorage(uploadId: string, file: File): Promise<void>;
    emitMeter(mediaAssetId: string, eventType: string, metadata?: Record<string, any>): Promise<void>;
  }
}

declare module '@qriptoagentiq/kn0w1-client' {
  export class Kn0w1 {
    constructor(accessToken: string);
  }
}
