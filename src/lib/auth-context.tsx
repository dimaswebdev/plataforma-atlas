"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  adminLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  adminLoading: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveAuthState(currentUser: User | null) {
      if (cancelled) return;
      clearTimeout(authTimeout);

      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        setAdminLoading(true);
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 5000);

        try {
          const token = await currentUser.getIdToken();
          const res = await fetch("/api/admin/check", {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          const data = await res.json();
          if (!cancelled) setIsAdmin(Boolean(data.isAdmin));
        } catch (error) {
          console.error("Error checking admin status:", error);
          if (!cancelled) setIsAdmin(false);
        } finally {
          window.clearTimeout(timeout);
          if (!cancelled) setAdminLoading(false);
        }
      } else {
        setIsAdmin(false);
        setAdminLoading(false);
      }
    }

    const authTimeout = setTimeout(() => {
      void resolveAuthState(auth.currentUser);
    }, 4500);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      void resolveAuthState(currentUser);
    });

    return () => {
      cancelled = true;
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, adminLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
