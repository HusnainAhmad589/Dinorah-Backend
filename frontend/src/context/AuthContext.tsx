import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { User } from "../types/user.types";
import { RegisterRequest, LoginRequest } from "../types/auth.types";
import { loginUser, registerUser, getCurrentUser } from "../services/auth.service";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("dinorah_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem("dinorah_token");
    setToken(null);
    setUser(null);
  }, []);

  const refetchUser = useCallback(async () => {
    const savedToken = localStorage.getItem("dinorah_token");
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        logout();
      }
    } catch (error) {
      console.warn("Failed to restore auth session:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await loginUser(data);
      if (res.token && res.user) {
        localStorage.setItem("dinorah_token", res.token);
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const res = await registerUser(data);
      if (res.token && res.user) {
        localStorage.setItem("dinorah_token", res.token);
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      refetchUser,
    }),
    [user, token, isLoading, login, register, logout, refetchUser]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
