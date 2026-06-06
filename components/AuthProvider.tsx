"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";

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
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        setLoading(true);
        let targetRole = "";
        if (pathname.startsWith("/admin")) {
          targetRole = "admin";
        } else if (pathname.startsWith("/coordinator")) {
          targetRole = "coordinator";
        } else if (pathname.startsWith("/faculty")) {
          targetRole = "faculty";
        } else if (pathname.startsWith("/research-guide")) {
          targetRole = "research_guide";
        } else if (pathname.startsWith("/scholar")) {
          targetRole = "scholar";
        }

        if (targetRole) {
          const res = await apiGet<{ items: User[] }>(`/users?role=${targetRole}`);
          if (!isMounted) return;
          if (res.items && res.items.length > 0) {
            setUser(res.items[0]);
          } else {
            setUser({
              _id: "mock-id-123",
              name: `Mock ${targetRole.toUpperCase()} User`,
              email: `${targetRole}@univ.edu`,
              role: targetRole,
              roles: [targetRole],
            });
          }
        } else {
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error("Auto-auth resolution failed:", error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const login = (token: string, userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
