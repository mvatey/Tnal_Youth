"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import UnsavedChangesModal from "@/components/modals/UnsavedChangesModal";

/*
 * Shared "is the current tab's form dirty" tracker + the
 * save/discard/cancel popup that gates tab navigation while it is.
 *
 * One provider is mounted per section (member details, my-account)
 * high enough in the layout tree to wrap both the tab-nav bar and
 * every page it can navigate between — see
 * member/memberInfo/[id]/layout.js and myAcc/layout.js.
 *
 * A page that wants to be guarded calls the useUnsavedFormGuard(...)
 * hook (src/hooks/useUnsavedFormGuard.js) with its own dirty flag and
 * save function. A tab-nav component calls useUnsavedChanges()
 * directly to read `isDirty` and wrap its navigation in
 * `guardNavigate(...)`.
 */

const UnsavedChangesContext = createContext(null);

export function UnsavedChangesProvider({ children }) {
  const [isDirty, setIsDirty] = useState(false);
  const [pendingNavigate, setPendingNavigate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const saveHandlerRef = useRef(null);

  const registerSaveHandler = useCallback((fn) => {
    saveHandlerRef.current = fn || null;
  }, []);

  const guardNavigate = useCallback(
    (navigate) => {
      if (!isDirty) {
        navigate();
        return;
      }

      setSaveError("");
      setPendingNavigate(() => navigate);
    },
    [isDirty],
  );

  const handleCancel = useCallback(() => {
    if (saving) return;
    setSaveError("");
    setPendingNavigate(null);
  }, [saving]);

  const handleDiscard = useCallback(() => {
    if (saving) return;

    const navigate = pendingNavigate;

    setIsDirty(false);
    setSaveError("");
    setPendingNavigate(null);

    navigate?.();
  }, [pendingNavigate, saving]);

  const handleSaveAndContinue = useCallback(async () => {
    const navigate = pendingNavigate;
    const saveFn = saveHandlerRef.current;

    if (!saveFn) {
      setIsDirty(false);
      setPendingNavigate(null);
      navigate?.();
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const result = await saveFn();

      if (result === false) {
        setSaveError(
          "មិនអាចរក្សាទុកបានទេ សូមព្យាយាមម្តងទៀត។",
        );
        return;
      }

      setIsDirty(false);
      setPendingNavigate(null);
      navigate?.();
    } catch {
      setSaveError(
        "មិនអាចរក្សាទុកបានទេ សូមព្យាយាមម្តងទៀត។",
      );
    } finally {
      setSaving(false);
    }
  }, [pendingNavigate]);

  const value = useMemo(
    () => ({
      isDirty,
      setIsDirty,
      registerSaveHandler,
      guardNavigate,
    }),
    [isDirty, registerSaveHandler, guardNavigate],
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}

      <UnsavedChangesModal
        open={Boolean(pendingNavigate)}
        saving={saving}
        error={saveError}
        onCancel={handleCancel}
        onDiscard={handleDiscard}
        onSaveAndContinue={handleSaveAndContinue}
      />
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);

  if (!context) {
    // No provider above this component — behave as a harmless no-op
    // instead of crashing, so a page/component using this hook never
    // breaks a route that hasn't been wrapped in a provider.
    return {
      isDirty: false,
      setIsDirty: () => {},
      registerSaveHandler: () => {},
      guardNavigate: (navigate) => navigate(),
    };
  }

  return context;
}
