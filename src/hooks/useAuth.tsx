import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRoles: string[];
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

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
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', uid)
              .then(
                ({ data: roles }) => {
                  setUserRoles(roles?.map(r => r.role) || []);
                  console.debug('[Auth] roles loaded (auth state change)', roles?.map(r => r.role) || []);
                },
                (err) => {
                  console.debug('[Auth] roles load failed (auth state change)', err);
                  setUserRoles([]);
                }
              );
          }, 0);
        } else {
          setUserRoles([]);
        }

        // Important: resolve loading synchronously here
        setLoading(false);
        console.debug('[Auth] loading=false (auth state change)');
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
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', uid)
          .then(
            ({ data: roles }) => {
              setUserRoles(roles?.map(r => r.role) || []);
              console.debug('[Auth] roles loaded (initial)', roles?.map(r => r.role) || []);
            },
            (err) => {
              console.debug('[Auth] roles load failed (initial)', err);
              setUserRoles([]);
            }
          );
      } else {
        setUserRoles([]);
      }
    }).finally(() => {
      setLoading(false);
      console.debug('[Auth] loading=false (initial)');
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
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