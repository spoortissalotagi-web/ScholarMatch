'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  isConfigured: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Check localStorage for mock auth in local dev
      const localUser = localStorage.getItem('scholarmatch_local_user');
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          setUser(parsed);
          setIsAdmin(parsed.email?.includes('admin') || parsed.email?.includes('evaluator'));
        } catch (e) {}
      }
      setIsLoading(false);
      return;
    }

    // Supabase Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkIsAdmin(session?.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkIsAdmin(session?.user);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  function checkIsAdmin(currentUser: User | null | undefined) {
    if (!currentUser || !currentUser.email) {
      setIsAdmin(false);
      return;
    }
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'admin@scholarmatch.gov.in,evaluator@college.edu')
      .split(',')
      .map(e => e.trim().toLowerCase());

    const isEmailAdmin = adminEmails.includes(currentUser.email.toLowerCase()) || 
      currentUser.email.endsWith('@scholarmatch.gov.in') ||
      currentUser.user_metadata?.role === 'admin';

    setIsAdmin(isEmailAdmin);
  }

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      // Mock sign in for dev
      const mockUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email,
        user_metadata: { full_name: email.split('@')[0] }
      } as unknown as User;
      setUser(mockUser);
      localStorage.setItem('scholarmatch_local_user', JSON.stringify(mockUser));
      checkIsAdmin(mockUser);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email,
        user_metadata: { full_name: name || email.split('@')[0] }
      } as unknown as User;
      setUser(mockUser);
      localStorage.setItem('scholarmatch_local_user', JSON.stringify(mockUser));
      checkIsAdmin(mockUser);
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: name || email.split('@')[0] },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('scholarmatch_local_user');
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
