// utils/auth-context.tsx
"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from "@/app/utils/supabase/client";
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session_token: Session | null;
  loading: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session_token: null,
  loading: true,
  isLoading: true,
  refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session_token, setSessionToken] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const refreshUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  useEffect(() => {
    refreshUser();
    setLoading(false);
    setIsLoading(false);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session?.user) {
        setUser(session.user);
        setSessionToken(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session_token, loading, isLoading, refreshUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);