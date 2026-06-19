import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMe,
  useLogin,
  useLogout,
  getGetMeQueryKey,
  setAuthTokenGetter,
} from "@workspace/api-client-react";
import type { AdminUser } from "@workspace/api-client-react";
import { useLocation } from "wouter";

const TOKEN_KEY = "admin_token";

// Wire up the custom fetch layer to always send the stored JWT
setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (data: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isMeLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetMeQueryKey(),
    },
  });

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const login = async (data: { username: string; password: string }) => {
    const res = await loginMutation.mutateAsync({ data });
    setToken(res.token);
    await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    setLocation("/");
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // ignore logout errors
    }
    setToken(null);
    queryClient.clear();
    setLocation("/login");
  };

  const isLoading = (!!token && isMeLoading) || loginMutation.isPending || logoutMutation.isPending;

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
