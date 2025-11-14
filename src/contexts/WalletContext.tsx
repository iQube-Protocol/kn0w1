import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AaApiClient, SSEEvent } from '@/lib/wallet/aaApiClient';
import { 
  getOrCreateDID, 
  generateDIDJWT, 
  storeDIDJWT, 
  getDIDJWT,
  updateFioHandle,
  signDIDChallenge 
} from '@/lib/wallet/didQube';
import { toast } from '@/hooks/use-toast';

interface WalletState {
  initialized: boolean;
  address: string | null;
  balances: Record<string, number>;
  fioHandle: string | null;
  policy: 'delegated' | 'local';
  did: string | null;
  sseConnected: boolean;
  lastUpdate: string | null;
}

interface WalletContextType {
  state: WalletState;
  client: AaApiClient;
  initializeWallet: () => Promise<(() => void) | undefined>;
  linkFioHandle: (handle: string) => Promise<void>;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [state, setState] = useState<WalletState>({
    initialized: false,
    address: null,
    balances: {},
    fioHandle: null,
    policy: 'delegated',
    did: null,
    sseConnected: false,
    lastUpdate: null,
  });

  const client = useMemo(() => {
    // Note: VITE_AIGENT_Z_API is only used for SSE subscriptions
    // Auth challenge/verify goes through edge functions which use AIGENT_Z_API_BASE secret
    const aigentzBase = import.meta.env.VITE_AIGENT_Z_API || 'https://dev-beta.aigentz.me';
    const gatewayProxyBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    
    console.log('[Wallet] Using AigentZ API for SSE:', aigentzBase);
    console.log('[Wallet] Gateway proxy:', gatewayProxyBase);
    
    return new AaApiClient({
      aigentzBase,
      gatewayProxyBase,
    });
  }, []);

  const initializeWallet = async () => {
    if (!user?.id) {
      console.warn('No user ID for wallet initialization');
      return;
    }

    try {
      console.log('Starting wallet initialization for user:', user.id);
      
      // 1. Get or create DID
      const did = await getOrCreateDID(user.id);
      console.log('DID retrieved:', did);
      
      // 2. Generate DID JWT
      const jwt = await generateDIDJWT(user.id, did);
      storeDIDJWT(jwt);
      console.log('DID JWT generated and stored');

      // 3. Request auth challenge from AigentZ
      console.log('Requesting auth challenge from AigentZ...');
      const { challenge } = await client.authChallenge(did);
      console.log('Challenge received:', challenge);

      // 4. Sign challenge with DID
      const jws = await signDIDChallenge(challenge, did);
      console.log('Challenge signed');

      // 5. Verify signature and get auth token
      const { token } = await client.authVerify(jws);
      client.setAuthToken(token);
      console.log('Auth token received and set');

      // 6. Subscribe to SSE feed for real-time updates
      console.log('Subscribing to SSE feed...');
      const unsubscribe = client.subscribeFeed((event: SSEEvent) => {
        console.log('SSE event received:', event.type, event);
        
        if (event.type === 'balance_update') {
          setState(prev => ({
            ...prev,
            balances: {
              ...prev.balances,
              [event.data.asset]: event.data.amount,
            },
            lastUpdate: new Date().toISOString(),
          }));
        } else if (event.type === 'transaction_update') {
          // Handle transaction status updates
          console.log('Transaction update:', event);
        }
      });

      setState(prev => ({
        ...prev,
        initialized: true,
        address: did, // Use DID as address
        did,
        sseConnected: true,
        lastUpdate: new Date().toISOString(),
      }));

      // Show onboarding if first time (no FIO handle)
      if (!state.fioHandle) {
        setShowOnboarding(true);
      }

      toast({
        title: 'Wallet Connected',
        description: 'Your wallet has been initialized successfully',
      });

      // Store unsubscribe function for cleanup
      return () => {
        console.log('Cleaning up SSE subscription');
        unsubscribe();
      };
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      toast({
        title: 'Wallet Initialization Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const linkFioHandle = async (handle: string) => {
    if (!user?.id) return;

    try {
      // Update FIO handle in database
      await updateFioHandle(user.id, handle);
      setState(prev => ({ ...prev, fioHandle: handle }));
      
      toast({
        title: 'FIO Handle Linked',
        description: `You can now use ${handle}`,
      });
    } catch (error) {
      console.error('Failed to link FIO handle:', error);
      toast({
        title: 'FIO Handle Linking Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Auto-initialize wallet when user logs in
  useEffect(() => {
    if (user?.id && !state.initialized) {
      // Check if user already has DID JWT
      const existingJWT = getDIDJWT();
      if (existingJWT) {
        // Wallet was previously initialized, restore state
        initializeWallet();
      } else {
        // First time - will show onboarding
        initializeWallet();
      }
    }
  }, [session, user]);

  return (
    <WalletContext.Provider value={{ 
      state, 
      client, 
      initializeWallet, 
      linkFioHandle,
      showOnboarding,
      setShowOnboarding,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
