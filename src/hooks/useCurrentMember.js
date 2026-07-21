"use client";

import { useEffect, useState } from "react";
import { combineAuthUserWithMember } from "@/lib/currentMember";

export default function useCurrentMember() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentMember() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/users/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("មិនអាចទាញយកព័ត៌មានគណនីបាន");
        }

        const authUser = await response.json();

        /*
         * Some API routes return the user directly.
         * Others wrap it inside data.
         */
        const userData = authUser.data || authUser;

        if (!cancelled) {
          setMember(combineAuthUserWithMember(userData));
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message);
          setMember(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCurrentMember();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    member,
    loading,
    error,
  };
}