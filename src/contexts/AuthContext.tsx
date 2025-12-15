import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  level?: string;
  points?: number;
  avatar_url?: string;
  onboarding_completed?: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isBusinessMode: boolean;
  setBusinessMode: (value: boolean) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BUSINESS_MODE_KEY = 'onetable_business_mode';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isBusinessMode, setIsBusinessMode] = useState<boolean>(() => {
    return sessionStorage.getItem(BUSINESS_MODE_KEY) === 'true';
  });

  const setBusinessMode = (value: boolean) => {
    setIsBusinessMode(value);
    if (value) {
      sessionStorage.setItem(BUSINESS_MODE_KEY, 'true');
    } else {
      sessionStorage.removeItem(BUSINESS_MODE_KEY);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetching with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          // Clear business mode on sign out
          setBusinessMode(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
  };

  const logout = async () => {
    // Clear state immediately for faster UI response
    setUser(null);
    setSession(null);
    setProfile(null);
    setBusinessMode(false);
    
    // Then perform the actual sign out
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    // Update local state immediately for faster UI response
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  const value = useMemo(
    () => ({ 
      isLoggedIn: !!user, 
      user, 
      profile,
      session,
      isBusinessMode,
      setBusinessMode,
      logout, 
      updateProfile 
    }),
    [user, profile, session, isBusinessMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
