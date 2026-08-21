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
import { getEffectiveRole } from "@/lib/navigation";
import BranchSwitchConfirmModal from "@/components/popup/BranchSwitchConfirmModal";

const BranchContext = createContext(null);

export function BranchProvider({ children, branches = [] }) {
  const { user, isLoggedIn, authLoading } = useAuth();
  const [selectedBranch, setSelectedBranchState] = useState("all");
  const [accessibleBranches, setAccessibleBranches] = useState(() =>
    normalizeBranches(branches),
  );

  // The currently-mounted page/form registers itself here (see
  // registerBranchChangeGuard below) to report whether it has unsaved
  // progress. Only ever one guard active at a time -- whatever main-content
  // page is currently on screen. A plain ref (not state) because
  // registering must never itself trigger a re-render.
  const branchChangeGuardRef = useRef(null);
  const [pendingBranch, setPendingBranch] = useState(null);
  const [branchSwitchBusy, setBranchSwitchBusy] = useState(false);
  const [branchSwitchError, setBranchSwitchError] = useState("");

  const role = getEffectiveRole(user);

  // SECRETARY and BRANCH_LEADER are always scoped to exactly one branch at
  // a time -- never the combined "all branches" aggregate -- even when
  // they're staff of more than one branch (e.g. a secretary covering two
  // branches). The sidebar's branch dropdown is what switches which single
  // branch is active for them; it never offers an "all" option (see
  // components/navigation/sidebar.js). ADMIN/VIEWER keep the old
  // behavior: default to the aggregate "all branches" view unless they
  // only have access to exactly one branch.
  const isBranchScopedRole = role === "secretary" || role === "branch_leader";

  useEffect(() => {
    let cancelled = false;

    if (authLoading) return undefined;

    if (!isLoggedIn) {
      setAccessibleBranches(normalizeBranches(branches));
      setSelectedBranchState("all");
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
        setSelectedBranchState((current) => {
          if (isBranchScopedRole) {
            // "all" is never a valid selection for a branch-scoped
            // role -- not even as a previously-kept selection (e.g.
            // the initial "all" default before this fetch resolves).
            // Keep the current branch if it's still one they can
            // access, otherwise fall back to the first accessible one.
            if (
              current !== "all" &&
              normalized.some((branch) => String(branch.id) === String(current))
            ) {
              return String(current);
            }

            return normalized.length > 0 ? String(normalized[0].id) : "all";
          }

          // Keep the current selection ("all" or a specific branch id)
          // whenever it is still valid — reloading the branch list
          // (e.g. after the sidebar filter was reset back to "all")
          // must not silently jump back to a specific branch.
          if (current === "all" || normalized.some((branch) => String(branch.id) === String(current))) {
            return String(current);
          }

          // Someone with access to exactly one branch has no real
          // "all branches" choice to make, so default straight to
          // that branch. Anyone with access to more than one branch
          // (e.g. an admin) should default to the aggregate "all
          // branches" view instead of silently landing on whichever
          // branch happens to be first.
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
  }, [authLoading, isLoggedIn, isBranchScopedRole]);

  // A page/form with in-progress, unsaved edits calls this (typically from
  // a useEffect keyed on whatever "am I dirty" state it already tracks) to
  // report itself as the thing that must be asked about before the sidebar
  // switches branches out from under it. guard: { isDirty, onSave, onReset }.
  // Registering again (e.g. the guard identity changes on re-render) simply
  // replaces the previous one; unregistering only clears the ref if it's
  // still the same guard, so an unmount race can't clobber whichever page
  // mounted after it.
  const registerBranchChangeGuard = useCallback((guard) => {
    branchChangeGuardRef.current = guard;
    return () => {
      if (branchChangeGuardRef.current === guard) {
        branchChangeGuardRef.current = null;
      }
    };
  }, []);

  const requestBranchChange = useCallback((next) => {
    const guard = branchChangeGuardRef.current;
    if (!guard?.isDirty?.()) {
      setSelectedBranchState(next);
      return;
    }
    setBranchSwitchError("");
    setPendingBranch(next);
  }, []);

  const cancelPendingBranchChange = useCallback(() => {
    setPendingBranch(null);
    setBranchSwitchError("");
  }, []);

  const discardAndSwitchBranch = useCallback(() => {
    branchChangeGuardRef.current?.onReset?.();
    setSelectedBranchState(pendingBranch);
    setPendingBranch(null);
    setBranchSwitchError("");
  }, [pendingBranch]);

  const saveAndSwitchBranch = useCallback(async () => {
    const guard = branchChangeGuardRef.current;
    if (!guard?.onSave) {
      discardAndSwitchBranch();
      return;
    }
    setBranchSwitchBusy(true);
    setBranchSwitchError("");
    try {
      const saved = await guard.onSave();
      if (!saved) {
        setBranchSwitchError(
          "មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត ឬបោះបង់ការកែប្រែ។",
        );
        return;
      }
      guard.onReset?.();
      setSelectedBranchState(pendingBranch);
      setPendingBranch(null);
    } catch (error) {
      setBranchSwitchError(error?.message || "មិនអាចរក្សាទុកបានទេ។");
    } finally {
      setBranchSwitchBusy(false);
    }
  }, [pendingBranch, discardAndSwitchBranch]);

  const value = useMemo(
    () => ({
      branches: accessibleBranches,
      selectedBranch,
      setSelectedBranch: requestBranchChange,
      registerBranchChangeGuard,
    }),
    [accessibleBranches, selectedBranch, requestBranchChange, registerBranchChangeGuard],
  );

  return (
    <BranchContext.Provider value={value}>
      {children}
      <BranchSwitchConfirmModal
        open={pendingBranch != null}
        busy={branchSwitchBusy}
        error={branchSwitchError}
        onCancel={cancelPendingBranchChange}
        onDiscard={discardAndSwitchBranch}
        onSave={saveAndSwitchBranch}
      />
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
      registerBranchChangeGuard: () => () => {},
    };
  }

  return context;
}

// Convenience wrapper around registerBranchChangeGuard for a page/form with
// its own in-progress editing state. isDirty/onSave/onReset are read fresh
// on every call (via a ref) so the caller can pass plain inline functions
// without needing to memoize them themselves.
//
//   useBranchChangeGuard({
//     isDirty: () => hasUnsavedEdits,
//     onSave: async () => handleSave(members),   // must resolve truthy on success
//     onReset: () => { /* clear the form back to its starting state */ },
//   });
export function useBranchChangeGuard({ isDirty, onSave, onReset }) {
  const { registerBranchChangeGuard } = useBranch();
  const latestRef = useRef({ isDirty, onSave, onReset });
  latestRef.current = { isDirty, onSave, onReset };

  useEffect(() => {
    const guard = {
      isDirty: () => latestRef.current.isDirty?.() ?? false,
      onSave: (...args) => latestRef.current.onSave?.(...args),
      onReset: (...args) => latestRef.current.onReset?.(...args),
    };
    return registerBranchChangeGuard(guard);
  }, [registerBranchChangeGuard]);
}
