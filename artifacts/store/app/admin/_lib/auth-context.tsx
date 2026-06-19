"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

const TOKEN_KEY = "admin_token";

export interface AdminUser { username: string; email: string | null; }

interface AuthCtx {
  user: AdminUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async (t: string) => {
    try {
      const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) { setUser(await res.json()); }
      else { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); }
    } catch { setUser(null); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) { setToken(stored); fetchMe(stored); }
    else { setIsLoading(false); }
  }, [fetchMe]);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Login failed"); }
    const { token: t, user: u } = await res.json();
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t); setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null); setUser(null);
  };

  return <Ctx.Provider value={{ user, isLoading, login, logout, token }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
