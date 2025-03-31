"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState } from "../types";

const mockUser: User = {
  id: "mock-user-id",
  email: "dev@example.com",
  name: "Development User",
  avatar_url: "https://via.placeholder.com/150",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const initialState: AuthState = {
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const MockAuthContext = createContext<
  AuthState & {
    login: () => Promise<boolean>;
    signup: () => Promise<boolean>;
    logout: () => Promise<boolean>;
  }
>({
  ...initialState,
  login: async () => false,
  signup: async () => false,
  logout: async () => false,
});

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const isAuthBypassed = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

  useEffect(() => {
    // If auth is bypassed, auto-login with mock user
    if (isAuthBypassed) {
      setState({
        session: {
          user: mockUser,
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
          expires_at: Date.now() + 3600000, // 1 hour from now
        },
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } else {
      setState({
        ...initialState,
        isLoading: false,
      });
    }
  }, [isAuthBypassed]);

  const login = async () => {
    setState({
      session: {
        user: mockUser,
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expires_at: Date.now() + 3600000, // 1 hour from now
      },
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    });
    return true;
  };

  const signup = async () => {
    setState({
      session: {
        user: mockUser,
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expires_at: Date.now() + 3600000, // 1 hour from now
      },
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    });
    return true;
  };

  const logout = async () => {
    setState({
      session: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
    return true;
  };

  return (
    <MockAuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export const useMockAuth = () => useContext(MockAuthContext);
