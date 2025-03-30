'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MockAuthProvider, useMockAuth } from './MockAuthProvider';
import { LoginCredentials, SignupCredentials, User } from '../types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isMockEnabled = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  const isDev = process.env.NODE_ENV === 'development';

  // Use mock auth in development if SKIP_AUTH is enabled
  if (isDev && isMockEnabled) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  // Otherwise use the real auth provider
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const isMockEnabled = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  const isDev = process.env.NODE_ENV === 'development';

  // Use mock auth in development if SKIP_AUTH is enabled
  if (isDev && isMockEnabled) {
    return useMockAuth();
  }

  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 