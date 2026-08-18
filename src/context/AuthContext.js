"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { clearTelegramBannerDismissal } from "@/lib/telegramReminder";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      setAuthLoading(true);

      const response = await fetch("/api/users/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return null;
      }

      const currentUser = await response.json();

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      console.error(
        "Failed to load current user:",
        error
      );

      setUser(null);

      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // Captured before setUser(null) below clears it -- the Telegram
    // reminder's dismissal is keyed by this user's id (see
    // @/lib/telegramReminder), so it must be cleared here, at logout,
    // rather than on next login, or there'd be no user id left to key it
    // to at that point.
    const loggedOutUserId = user?.id;

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      clearTelegramBannerDismissal(loggedOutUserId);
    }
  }, [user]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isLoggedIn: Boolean(user),
      authLoading,
      refreshUser,
      logout,
    }),
    [
      user,
      authLoading,
      refreshUser,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}