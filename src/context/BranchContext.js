"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";

const BranchContext = createContext(null);

export function BranchProvider({ children, branches = [] }) {
  const { isLoggedIn, authLoading } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [accessibleBranches, setAccessibleBranches] = useState(() =>
    normalizeBranches(branches),
  );

  useEffect(() => {
    let cancelled = false;

    if (authLoading) return undefined;

    if (!isLoggedIn) {
      setAccessibleBranches(normalizeBranches(branches));
      setSelectedBranch("all");
      return undefined;
    }

    async function loadAccessibleBranches() {
      try {
        const response = await fetch("/api/lookups/branches", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const body = await response.json();
        const normalized = normalizeBranches(body);

        if (cancelled) return;

        setAccessibleBranches(normalized);
        setSelectedBranch((current) => {
          // Keep the current selection ("all" or a specific branch id)
          // whenever it is still valid — reloading the branch list
          // (e.g. after the sidebar filter was reset back to "all")
          // must not silently jump back to a specific branch.
          if (current === "all" || normalized.some((branch) => String(branch.id) === String(current))) {
            return String(current);
          }

          // Someone with access to exactly one branch (a branch
          // leader/secretary) has no real "all branches" choice to
          // make, so default straight to that branch. Anyone with
          // access to more than one branch (e.g. an admin) should
          // default to the aggregate "all branches" view instead of
          // silently landing on whichever branch happens to be first.
          return normalized.length === 1 ? String(normalized[0].id) : "all";
        });
      } catch {
        // Authentication pages can render before a user is logged in.
        // Keep the provider empty there instead of showing a global error.
      }
    }

    loadAccessibleBranches();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn]);

  const value = useMemo(
    () => ({
      branches: accessibleBranches,
      selectedBranch,
      setSelectedBranch,
    }),
    [accessibleBranches, selectedBranch],
  );

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
}

function normalizeBranches(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((branch) => {
      if (typeof branch === "string") {
        return {
          id: branch,
          nameKm: branch,
          nameEn: branch,
        };
      }

      const id = branch?.value ?? branch?.id ?? branch?.branchId;

      if (id == null) return null;

      return {
        id: String(id),
        nameKm:
          branch.labelKm ??
          branch.nameKm ??
          branch.branchNameKm ??
          branch.label ??
          branch.code ??
          `សាខា ${id}`,
        nameEn:
          branch.labelEn ??
          branch.nameEn ??
          branch.branchNameEn ??
          branch.label ??
          branch.code ??
          `Branch ${id}`,
      };
    })
    .filter(Boolean);
}

export function useBranch() {
  const context = useContext(BranchContext);

  if (!context) {
    return {
      branches: [],
      selectedBranch: "all",
      setSelectedBranch: () => {},
    };
  }

  return context;
}
