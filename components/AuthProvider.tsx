"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { apiGet, apiPostJson } from "@/lib/api";
import { useRouter } from "next/navigation";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  department?: string;
  researchCenter?: any;
  guide?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const res = await apiGet<{ user: User }>("/auth/me");
          setUser(res.user);
        } catch (error) {
          console.error("Auth check failed:", error);
          Cookies.remove("token");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set("token", token, { expires: 1 });
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
