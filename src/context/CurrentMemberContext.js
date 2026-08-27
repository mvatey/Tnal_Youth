"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { combineAuthUserWithMember } from "@/lib/currentMember";

const CurrentMemberContext = createContext(null);

/*
 * Every top-level section (/dashboard, /member, /donation, ...) has its
 * own layout.js that mounts a fresh <Sidebar/>, which fully unmounts and
 * remounts on every section-to-section navigation. useCurrentMember() used
 * to fetch its own data locally inside that hook, so each remount briefly
 * reset it to null and re-fetched from scratch -- visible as the sidebar's
 * profile name/role flashing to a default before settling back. Hoisting
 * the fetch here, at the root layout (which never remounts), means the
 * data survives every section navigation instead of reloading each time.
 */
export function CurrentMemberProvider({ children }) {
  const { user, authLoading } = useAuth();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCurrentMember = useCallback(async () => {
    if (!user) {
      if (isMountedRef.current) {
        setMember(null);
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError("");

      const memberId = user.memberId ?? user.member_id ?? null;
      let memberData = null;

      if (memberId) {
        const memberResponse = await fetch(`/api/members/${memberId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!memberResponse.ok) {
          throw new Error("មិនអាចទាញយកប្រវត្តិរូបសមាជិកដែលភ្ជាប់ជាមួយគណនីនេះបានទេ");
        }

        const memberBody = await memberResponse.json();
        memberData = memberBody.data || memberBody;

        const branchId = memberData.branch_id ?? memberData.branchId;
        if (branchId) {
          const branchResponse = await fetch("/api/lookups/branches", {
            credentials: "include",
            cache: "no-store",
          });
          if (branchResponse.ok) {
            const branchBody = await branchResponse.json();
            const branches = Array.isArray(branchBody) ? branchBody : [];
            const branch = branches.find(
              (option) => Number(option.value ?? option.id) === Number(branchId),
            );
            if (branch) {
              memberData.branch = {
                id: branchId,
                nameKm:
                  branch.labelKm || branch.label_km || branch.label || branch.code,
              };
            }
          }
        }
      }

      if (isMountedRef.current) {
        setMember(combineAuthUserWithMember(user, memberData));
      }
    } catch (loadError) {
      if (isMountedRef.current) {
        setError(loadError.message);
        setMember(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadCurrentMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, user?.memberId]);

  const value = {
    member,
    loading: authLoading || loading,
    error,
    /*
     * Callers (e.g. My Account save handlers) can await this after a
     * successful save so the on-screen data reflects the change right
     * away, instead of only updating after a manual page reload.
     */
    refetch: loadCurrentMember,
  };

  return (
    <CurrentMemberContext.Provider value={value}>
      {children}
    </CurrentMemberContext.Provider>
  );
}

export function useCurrentMemberContext() {
  const context = useContext(CurrentMemberContext);

  if (!context) {
    throw new Error(
      "useCurrentMember must be used inside CurrentMemberProvider",
    );
  }

  return context;
}
