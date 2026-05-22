'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const TOKEN_KEY = 'repolyx_token';

export interface User {
  id: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          removeToken();
        }
      } else {
        setUser(null);
        removeToken();
      }
    } catch (error) {
      console.error('Error fetching auth status:', error);
      setUser(null);
      removeToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setToken(token);
        window.history.replaceState({}, '', window.location.pathname);
        setLoading(false);
        return;
      }
    }
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      const token = getToken();
      await fetch(`/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      removeToken();
      setUser(null);
      router.push('/');
    }
  };

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === '/';
    const isProtectedRoute = !isAuthRoute;

    if (isProtectedRoute && !user) {
      router.push('/');
    } else if (isAuthRoute && user) {
      router.push('/overview');
    }
  }, [user, loading, pathname, router]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex h-screen w-screen items-center justify-center bg-[#04060a] text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-accent border-solid border-t-accent border-r-transparent"></div>
            <p className="font-mono text-sm tracking-wider text-neutral-400">LOADING REPOLYX...</p>
          </div>
        </div>
      ) : (
        children
      )}
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
