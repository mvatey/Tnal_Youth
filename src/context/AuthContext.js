"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { clearTelegramBannerDismissal } from "@/lib/telegramReminder";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const refreshPromiseRef = useRef(null);

  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      return {
        ok: response.ok,
        status: response.status,
      };
    })();

    try {
      return await refreshPromiseRef.current;
    } finally {
      refreshPromiseRef.current = null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setAuthLoading(true);

      let response = await fetch("/api/users/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        const sessionResult = await refreshSession();

        if (sessionResult.ok) {
          response = await fetch("/api/users/me", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });
        }
      }

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
  }, [refreshSession]);

  const logout = useCallback(async () => {
    // Captured before setUser(null) below clears it -- the Telegram
    // reminder's dismissal is keyed by this user's id (see
    // @/lib/telegramReminder), so it must be cleared here, at logout,
    // rather than on next login, or there'd be no user id left to key it
    // to at that point.
    const loggedOutUserId = user?.id;

    // Fired with keepalive and not awaited -- sidebar's handleLogout does
    // a full-page navigate right after calling this, and awaiting the
    // round trip first used to mean sitting on the current page (with no
    // sidebar, since setUser(null) below already fired) for however long
    // that request took, which could be a couple of visible seconds on a
    // slow backend. keepalive lets the request finish in the background
    // even though the page that started it is about to be torn down.
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      keepalive: true,
    }).catch((error) => {
      console.error("Logout failed:", error);
    });

    setUser(null);
    clearTelegramBannerDismissal(loggedOutUserId);
  }, [user]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const sessionResult = await refreshSession();

        if (sessionResult.status === 401 || sessionResult.status === 403) {
          setUser(null);
        }
      } catch (error) {
        console.error("Automatic session refresh failed:", error);
      }
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [refreshSession, user]);

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
