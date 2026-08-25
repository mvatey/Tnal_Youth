"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { combineAuthUserWithMember } from "@/lib/currentMember";

export default function useCurrentMember() {
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
      const memberId =
        userData.memberId ?? userData.member_id ?? null;
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
        setMember(combineAuthUserWithMember(userData, memberData));
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(error.message);
        setMember(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCurrentMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    member,
    loading,
    error,
    /*
     * Callers (e.g. My Account save handlers) can await this after a
     * successful save so the on-screen data reflects the change right
     * away, instead of only updating after a manual page reload.
     */
    refetch: loadCurrentMember,
  };
}
