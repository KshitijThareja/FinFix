// utils/auth-context.tsx
"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from "@/app/utils/supabase/client";
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session_token: Session | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session_token: null,
  refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session_token, setSessionToken] = useState<Session | null>(null);
  const supabase = createClient();
  const refreshUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  useEffect(() => {
    refreshUser();

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
    <AuthContext.Provider value={{ user, session_token, refreshUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);