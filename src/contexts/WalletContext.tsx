import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AgentiqWalletClient, WalletBalance } from '@/lib/wallet/agentiqClient';
import { 
  getOrCreateDID, 
  generateDIDJWT, 
  storeDIDJWT, 
  getDIDJWT,
  updateFioHandle 
} from '@/lib/wallet/didQube';
import { toast } from '@/hooks/use-toast';

interface WalletState {
  initialized: boolean;
  address: string | null;
  balances: Record<string, number>;
  fioHandle: string | null;
  policy: 'delegated' | 'local';
  did: string | null;
}

interface WalletContextType {
  state: WalletState;
  client: AgentiqWalletClient;
  initializeWallet: () => Promise<void>;
  linkFioHandle: (handle: string) => Promise<void>;
  refreshBalances: () => Promise<void>;
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
  });

  const client = useMemo(() => {
    const baseUrl = import.meta.env.VITE_AGENTIQ_WALLET_BASE_URL || 'http://localhost:8080';
    return new AgentiqWalletClient(baseUrl);
  }, []);

  const refreshBalances = async () => {
    if (!state.initialized) return;

    try {
      const balances = await client.getBalances();
      const balanceMap: Record<string, number> = {};
      balances.forEach(b => {
        balanceMap[b.asset] = b.amount;
      });
      setState(prev => ({ ...prev, balances: balanceMap }));
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    }
  };

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

      // 3. Set auth for wallet client
      if (session?.access_token) {
        client.setAuth(session.access_token);
      }

      // 4. Initialize wallet via API
      console.log('Calling wallet API at:', import.meta.env.VITE_AGENTIQ_WALLET_BASE_URL);
      const result = await client.initWallet('delegated');
      console.log('Wallet initialized:', result);
      
      // 5. Get initial balances
      const balances = await client.getBalances();
      const balanceMap: Record<string, number> = {};
      balances.forEach(b => {
        balanceMap[b.asset] = b.amount;
      });

      // 6. Subscribe to SSE updates
      client.subscribeToUpdates((event) => {
        if (event.type === 'balance_update') {
          setState(prev => ({
            ...prev,
            balances: {
              ...prev.balances,
              [event.asset]: event.amount,
            },
          }));
        } else if (event.type === 'transaction_update') {
          // Handle transaction status updates
          console.log('Transaction update:', event);
        }
      });

      setState(prev => ({
        ...prev,
        initialized: true,
        address: result.address,
        balances: balanceMap,
        policy: result.policy as 'delegated' | 'local',
        did,
      }));

      // Show onboarding if first time (no FIO handle)
      if (!state.fioHandle) {
        setShowOnboarding(true);
      }

      toast({
        title: 'Wallet Initialized',
        description: 'Your KNYT wallet is ready',
      });
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
      // 1. Request challenge from server
      const { challenge } = await client.requestFioChallenge(handle);

      // 2. Sign challenge using AgentiQ SDK (delegated signing)
      // In production, this would use the SDK's signing method
      const signature = `sig_${btoa(challenge).substring(0, 32)}`;

      // 3. Submit signed challenge
      const result = await client.linkFioHandle(handle, signature);

      if (result.success) {
        // 4. Update local state and database
        await updateFioHandle(user.id, handle);
        setState(prev => ({ ...prev, fioHandle: handle }));
        
        toast({
          title: 'FIO Handle Linked',
          description: `You can now sign with ${handle}`,
        });
      }
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
    if (session?.access_token && user?.id && !state.initialized) {
      client.setAuth(session.access_token);
      
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
      refreshBalances,
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
