"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ActivityCreateDraftContext = createContext(null);

const EMPTY_DRAFT = {
  form: null,
  selectedMemberIds: [],
  activityImages: [],
  activityDocuments: [],
  incomeRows: null,
  expenseRows: null,
};

export function ActivityCreateDraftProvider({ children }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const updateDraft = useCallback((changes) => {
    setDraft((current) => ({
      ...current,
      ...(typeof changes === "function" ? changes(current) : changes),
    }));
  }, []);

  const clearDraft = useCallback(() => setDraft(EMPTY_DRAFT), []);

  const value = useMemo(
    () => ({ draft, updateDraft, clearDraft }),
    [draft, updateDraft, clearDraft],
  );

  return (
    <ActivityCreateDraftContext.Provider value={value}>
      {children}
    </ActivityCreateDraftContext.Provider>
  );
}

export function useActivityCreateDraft() {
  const context = useContext(ActivityCreateDraftContext);
  if (!context) {
    throw new Error("useActivityCreateDraft must be used inside ActivityCreateDraftProvider.");
  }
  return context;
}
