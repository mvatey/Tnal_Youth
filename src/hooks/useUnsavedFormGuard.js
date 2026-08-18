"use client";

import { useEffect } from "react";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";

/*
 * Wires a page's "is this form dirty" flag and its save function into
 * the shared UnsavedChangesContext, so the tab-nav bar knows to show
 * the save/discard/cancel popup before navigating to another tab
 * while this page has unsaved edits.
 *
 *   useUnsavedFormGuard(isDirty, handleSave);
 *
 * - isDirty: boolean, recomputed every render — typically a
 *   JSON.stringify comparison of the current form state against a
 *   "last loaded/saved" snapshot kept in a ref.
 * - onSave: the page's existing save function (no args). Resolving to
 *   `false` is treated as a failed save (the popup stays open);
 *   anything else — including no return value — is treated as
 *   success and navigation continues.
 *
 * Safe to call from a page that isn't wrapped in an
 * UnsavedChangesProvider — useUnsavedChanges() falls back to a
 * no-op in that case.
 */
export default function useUnsavedFormGuard(isDirty, onSave) {
  const { setIsDirty, registerSaveHandler } = useUnsavedChanges();

  useEffect(() => {
    setIsDirty(Boolean(isDirty));
  }, [isDirty, setIsDirty]);

  useEffect(() => {
    registerSaveHandler(onSave);
  }, [onSave, registerSaveHandler]);

  // Unmounting this page (navigating away, or the guard already let
  // a navigation through) always clears both the flag and the
  // handler, so a stale save function from a since-unmounted page
  // can never be invoked by the next one.
  useEffect(() => {
    return () => {
      registerSaveHandler(null);
      setIsDirty(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
