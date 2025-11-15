import React, { createContext, useContext, useMemo, useState } from "react";

interface User {
  id: string;
  name: string;
  email?: string;
  level?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (user?: Partial<User>) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (u?: Partial<User>) => {
    setUser({
      id: u?.id ?? "demo-user",
      name: u?.name ?? "Utente",
      email: u?.email ?? "",
      level: u?.level ?? "Bronze",
      avatarUrl: u?.avatarUrl,
    });
  };

  const logout = () => setUser(null);

  const updateProfile = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const value = useMemo(
    () => ({ isLoggedIn: !!user, user, login, logout, updateProfile }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
