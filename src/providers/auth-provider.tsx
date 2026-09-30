"use client";

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
  type ReactNode,
} from "react";

export interface GuestUser {
  id: string;
  username: string;
  role: "player" | "admin";
  games_played: number;
  games_won: number;
  tournaments_played: number;
  tournaments_won: number;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: GuestUser | null;
  profile: GuestUser | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GuestUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) { setUser(null); return; }
      const data = await res.json();
      setUser(data as GuestUser | null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, profile: user, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
