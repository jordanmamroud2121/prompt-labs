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

// Custom hook to determine if mock auth should be used
function useMockAuthEnabled() {
  const isMockEnabled = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  const isDev = process.env.NODE_ENV === 'development';
  return isDev && isMockEnabled;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const shouldUseMockAuth = useMockAuthEnabled();
  const auth = useAuth(); // Always call the hook at the top level

  // Conditionally render based on the result, not conditional hook call
  if (shouldUseMockAuth) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const shouldUseMockAuth = useMockAuthEnabled();
  const context = useContext(AuthContext); // Always call the hook at the top level
  const mockAuth = useMockAuth(); // Always call the hook at the top level

  // Return based on condition, but hooks are always called
  if (shouldUseMockAuth) {
    return mockAuth;
  }

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
} 