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

import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
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
  const { branches } = useBranch();

  // Raw member detail from the backend, WITHOUT branch enrichment -- the
  // branch name is looked up from BranchContext's own already-fetched
  // list below instead of a second independent `/api/lookups/branches`
  // call. BranchContext and this context used to each fetch that same
  // endpoint on every page load, racing each other for bandwidth.
  const [memberDetail, setMemberDetail] = useState(null);
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
        setMemberDetail(null);
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
      }

      if (isMountedRef.current) {
        setMemberDetail(memberData);
      }
    } catch (loadError) {
      if (isMountedRef.current) {
        setError(loadError.message);
        setMemberDetail(null);
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

  // Recomputes whenever BranchContext's list changes -- no extra network
  // call, and it self-updates the moment that shared fetch resolves even
  // if it lands after the member fetch above.
  const member = useMemo(() => {
    if (!user) return null;

    const branchId = memberDetail?.branch_id ?? memberDetail?.branchId;

    let enrichedDetail = memberDetail;

    if (branchId && Array.isArray(branches) && branches.length > 0) {
      const branch = branches.find(
        (option) => String(option.id) === String(branchId),
      );

      if (branch) {
        enrichedDetail = {
          ...memberDetail,
          branch: { id: branchId, nameKm: branch.nameKm },
        };
      }
    }

    return combineAuthUserWithMember(user, enrichedDetail);
  }, [user, memberDetail, branches]);

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
