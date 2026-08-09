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
            throw new Error("The member profile linked to this account could not be loaded");
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

        if (!cancelled) {
          setMember(combineAuthUserWithMember(userData, memberData));
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
