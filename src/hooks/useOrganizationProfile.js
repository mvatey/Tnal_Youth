"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const DEFAULT_ORGANIZATION_PROFILE = {
  name_km: "សមាគមថ្នាលយុវជនកម្ពុជា",
  name_en: "Cambodian Youth Nursery Association",
  tagline_km: "",
  tagline_en: "",
  about_km: "",
  about_en: "",
  logo_url: "/logo.png",
};

function normalizeBackendUrl(url) {
  if (!url) return "/logo.png";
  if (url.startsWith("/api/backend/")) return url;
  if (url.startsWith("/api/")) return `/api/backend/${url.slice(5)}`;
  return url;
}

export default function useOrganizationProfile() {
  const { locale } = useLanguage();
  const [profile, setProfile] = useState(DEFAULT_ORGANIZATION_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/backend/organization-profile", {
          credentials: "include",
          signal: controller.signal,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || data?.error || "Cannot load organization profile.");
        }

        setProfile({
          ...DEFAULT_ORGANIZATION_PROFILE,
          ...(data || {}),
          logo_url: normalizeBackendUrl(data?.logo_url),
          cover_url: normalizeBackendUrl(data?.cover_url),
        });
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message);
          setProfile(DEFAULT_ORGANIZATION_PROFILE);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => controller.abort();
  }, []);

  const localized = useMemo(() => {
    const isEnglish = locale === "en";
    const name = isEnglish
      ? profile.name_en || profile.name_km
      : profile.name_km || profile.name_en;
    const tagline = isEnglish
      ? profile.tagline_en || profile.tagline_km
      : profile.tagline_km || profile.tagline_en;
    const about = isEnglish
      ? profile.about_en || profile.about_km
      : profile.about_km || profile.about_en;

    return {
      name,
      tagline,
      about,
      logoUrl: normalizeBackendUrl(profile.logo_url),
    };
  }, [locale, profile]);

  return {
    profile,
    localized,
    loading,
    error,
    setProfile,
  };
}
