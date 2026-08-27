"use client";

import { useCurrentMemberContext } from "@/context/CurrentMemberContext";

/*
 * Thin wrapper kept for every existing call site -- the actual fetch now
 * lives in CurrentMemberProvider (mounted once at the root layout) instead
 * of here, so the data survives navigation between top-level sections
 * instead of being refetched on every page's own layout remount.
 */
export default function useCurrentMember() {
  return useCurrentMemberContext();
}
