import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRoles: string[];
  isAdmin: boolean;
  isUberAdmin: boolean;
  hasAgentSite: boolean;
  currentSiteId: string | null;
  setCurrentSiteId: (siteId: string | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [hasAgentSite, setHasAgentSite] = useState<boolean>(false);
  const [isUberAdmin, setIsUberAdmin] = useState<boolean>(false);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        console.debug('[Auth] onAuthStateChange', {
          event: _event,
          hasSession: Boolean(session),
          hasUser: Boolean(session?.user),
          email: session?.user?.email,
        });

        if (session?.user) {
          const uid = session.user.id;
          // Defer Supabase calls to avoid deadlocks inside the callback
          setTimeout(() => {
            Promise.all([
              supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', uid),
              supabase
                .from('agent_sites')
                .select('id')
                .eq('owner_user_id', uid)
                .limit(1),
              supabase.rpc('is_mm_super_admin', { uid })
            ]).then(
              ([rolesResult, sitesResult, uberAdminResult]) => {
                setUserRoles(rolesResult.data?.map(r => r.role) || []);
                setHasAgentSite((sitesResult.data?.length || 0) > 0);
                setIsUberAdmin(!!uberAdminResult.data);
                console.debug('[Auth] roles and site loaded (auth state change)', {
                  roles: rolesResult.data?.map(r => r.role) || [],
                  hasAgentSite: (sitesResult.data?.length || 0) > 0,
                  isUberAdmin: !!uberAdminResult.data
                });
                setLoading(false);
              },
              (err) => {
                console.debug('[Auth] roles/site load failed (auth state change)', err);
                setUserRoles([]);
                setHasAgentSite(false);
                setIsUberAdmin(false);
                setLoading(false);
              }
            );
          }, 0);
        } else {
          setUserRoles([]);
          setHasAgentSite(false);
          setIsUberAdmin(false);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      console.debug('[Auth] getSession resolved', {
        hasSession: Boolean(session),
        hasUser: Boolean(session?.user),
        email: session?.user?.email,
      });

      if (session?.user) {
        const uid = session.user.id;
        Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', uid),
          supabase
            .from('agent_sites')
            .select('id')
            .eq('owner_user_id', uid)
            .limit(1),
          supabase.rpc('is_mm_super_admin', { uid })
        ]).then(
          ([rolesResult, sitesResult, uberAdminResult]) => {
            setUserRoles(rolesResult.data?.map(r => r.role) || []);
            setHasAgentSite((sitesResult.data?.length || 0) > 0);
            setIsUberAdmin(!!uberAdminResult.data);
            console.debug('[Auth] roles and site loaded (initial)', {
              roles: rolesResult.data?.map(r => r.role) || [],
              hasAgentSite: (sitesResult.data?.length || 0) > 0,
              isUberAdmin: !!uberAdminResult.data
            });
            setLoading(false);
          },
          (err) => {
            console.debug('[Auth] roles/site load failed (initial)', err);
            setUserRoles([]);
            setHasAgentSite(false);
            setIsUberAdmin(false);
            setLoading(false);
          }
        );
      } else {
        setUserRoles([]);
        setHasAgentSite(false);
        setIsUberAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Prefer local sign-out to avoid server errors when refresh token is missing/expired
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.warn('[Auth] signOut error, proceeding with client cleanup', err);
    } finally {
      // Proactively clear auth-related client state
      setUser(null);
      setSession(null);
      setUserRoles([]);
      setHasAgentSite(false);
      setIsUberAdmin(false);
      setCurrentSiteId(null);

      // Remove any Supabase auth tokens from localStorage (sb- prefix)
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('sb-')) localStorage.removeItem(k);
        });
      } catch {}

      // Redirect to Auth
      window.location.assign('/auth');
    }
  };
  // Check if user is admin either by having admin roles OR by email containing 'admin', 'nakamoto', or specific admin emails
  const isAdmin = userRoles.length > 0 || (user?.email && (user.email.includes('admin') || user.email.includes('nakamoto') || user.email === 'dele@metame.com'));

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      userRoles,
      isAdmin,
      isUberAdmin,
      hasAgentSite,
      currentSiteId,
      setCurrentSiteId,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}