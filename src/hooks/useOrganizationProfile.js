"use client";

import { useOrganizationProfileContext } from "@/context/OrganizationProfileContext";

/*
 * Thin wrapper kept for every existing call site -- the actual fetch now
 * lives in OrganizationProfileProvider (mounted once at the root layout)
 * instead of here, so the data survives navigation instead of being
 * refetched by every component that reads it (sidebar, OrganizationProfileCard,
 * the auth pages) on every one of its own mounts.
 */
export default function useOrganizationProfile() {
  return useOrganizationProfileContext();
}
