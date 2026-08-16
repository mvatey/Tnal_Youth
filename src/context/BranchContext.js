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

/*
 * Roles that are only ever responsible for a subset of branches.
 * For these roles the sidebar/dashboard branch selector must only
 * offer the branch(es) this specific account is actually assigned
 * to (its primary branch plus any additional branch_staff rows —
 * see the branch multiselect on the member personal-info page),
 * never the full list of every branch in the system.
 */
function isScopedRole(role) {
  const normalized = String(role || "")
    .trim()
    .toLowerCase();

  return (
    normalized === "secretary" ||
    normalized === "branch_leader"
  );
}

export function BranchProvider({ children, branches = [] }) {
  const { user, isLoggedIn, authLoading } = useAuth();
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

    function applyAccessibleBranches(normalized) {
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
        // access to more than one branch (e.g. an admin, or now a
        // secretary responsible for more than one branch) should
        // default to the aggregate "all branches" view instead of
        // silently landing on whichever branch happens to be first.
        return normalized.length === 1 ? String(normalized[0].id) : "all";
      });
    }

    async function loadOwnBranches() {
      try {
        const response = await fetch("/api/backend/my-account/personal-info", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const body = await response.json();

        applyAccessibleBranches(normalizeOwnBranches(body));
      } catch {
        // Keep whatever branch list is already loaded rather than
        // showing a global error for this best-effort scoping fetch.
      }
    }

    async function loadAllBranches() {
      try {
        const response = await fetch("/api/lookups/branches", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const body = await response.json();

        applyAccessibleBranches(normalizeBranches(body));
      } catch {
        // Authentication pages can render before a user is logged in.
        // Keep the provider empty there instead of showing a global error.
      }
    }

    if (isScopedRole(user?.role)) {
      loadOwnBranches();
    } else {
      loadAllBranches();
    }

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, user?.role]);

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

/*
 * Builds the branch list for a scoped (secretary / branch leader)
 * account straight from its own personal-info response: the
 * primary/home branch (branch_id + branch_name_km) plus any
 * additional branches from assigned_branches, deduplicated.
 */
function normalizeOwnBranches(body) {
  const list = [];
  const seenIds = new Set();

  const primaryId = body?.branch_id ?? body?.branchId;

  if (primaryId != null && String(primaryId) !== "") {
    const id = String(primaryId);

    seenIds.add(id);

    list.push({
      id,
      nameKm:
        body.branch_name_km ||
        body.branchNameKm ||
        `សាខា ${id}`,
      nameEn:
        body.branch_name_en ||
        body.branchNameEn ||
        `Branch ${id}`,
    });
  }

  const assignedBranches = Array.isArray(body?.assigned_branches)
    ? body.assigned_branches
    : Array.isArray(body?.assignedBranches)
      ? body.assignedBranches
      : [];

  assignedBranches.forEach((branch) => {
    const rawId = branch?.id ?? branch?.branchId ?? branch?.branch_id;

    if (rawId == null) return;

    const id = String(rawId);

    if (seenIds.has(id)) return;

    seenIds.add(id);

    list.push({
      id,
      nameKm: branch.name_km || branch.nameKm || `សាខា ${id}`,
      nameEn: branch.name_en || branch.nameEn || `Branch ${id}`,
    });
  });

  return list;
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
