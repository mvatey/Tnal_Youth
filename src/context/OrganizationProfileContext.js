"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLanguage } from "@/context/LanguageContext";

const DEFAULT_ORGANIZATION_PROFILE = {
  name_km: "សមាគមថ្នាលយុវជនកម្ពុជា",
  name_en: "Cambodian Youth Nursery Association",
  tagline_km: "ការគ្រប់គ្រងប្រព័ន្ធយុវជន",
  tagline_en: "Youth management system",
  hero_headline_km: "សមាជិក · សកម្មភាព · វិភាគទាន",
  hero_headline_en: "Members · Activities · Donations",
  hero_description_km: "គ្រប់គ្រងទិន្នន័យសមាជិក ការបង់វិភាគទាន និងសកម្មភាពទាំងនៅទីនេះដោយពួកគេ",
  hero_description_en: "Manage member data, donations, and activities in one place.",
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

function normalizeProfile(data = {}) {
  return {
    ...DEFAULT_ORGANIZATION_PROFILE,
    ...(data || {}),
    name_km: data.name_km ?? data.nameKm ?? DEFAULT_ORGANIZATION_PROFILE.name_km,
    name_en: data.name_en ?? data.nameEn ?? DEFAULT_ORGANIZATION_PROFILE.name_en,
    tagline_km: data.tagline_km ?? data.taglineKm ?? DEFAULT_ORGANIZATION_PROFILE.tagline_km,
    tagline_en: data.tagline_en ?? data.taglineEn ?? DEFAULT_ORGANIZATION_PROFILE.tagline_en,
    hero_headline_km: data.hero_headline_km ?? data.heroHeadlineKm ?? DEFAULT_ORGANIZATION_PROFILE.hero_headline_km,
    hero_headline_en: data.hero_headline_en ?? data.heroHeadlineEn ?? DEFAULT_ORGANIZATION_PROFILE.hero_headline_en,
    hero_description_km: data.hero_description_km ?? data.heroDescriptionKm ?? DEFAULT_ORGANIZATION_PROFILE.hero_description_km,
    hero_description_en: data.hero_description_en ?? data.heroDescriptionEn ?? DEFAULT_ORGANIZATION_PROFILE.hero_description_en,
    about_km: data.about_km ?? data.aboutKm ?? DEFAULT_ORGANIZATION_PROFILE.about_km,
    about_en: data.about_en ?? data.aboutEn ?? DEFAULT_ORGANIZATION_PROFILE.about_en,
    logo_url: normalizeBackendUrl(data.logo_url ?? data.logoUrl ?? DEFAULT_ORGANIZATION_PROFILE.logo_url),
    cover_url: normalizeBackendUrl(data.cover_url ?? data.coverUrl),
  };
}

const OrganizationProfileContext = createContext(null);

/*
 * Mounted once at the root layout so the organization's branding (name,
 * tagline, logo, ...) is fetched once per session instead of on every
 * mount of whatever reads it -- previously both the sidebar (remounts on
 * every top-level navigation) and OrganizationProfileCard (myAcc, for
 * ADMIN) independently ran their own /api/backend/organization-profile
 * fetch every time they mounted, which is what made the admin's My
 * Account page visibly sit on a loading state for a second or two on
 * every visit.
 */
export function OrganizationProfileProvider({ children }) {
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
        let response = await fetch("/api/backend/organization-profile", {
          credentials: "include",
          signal: controller.signal,
        });

        // This provider mounts on every full page load and fires its
        // fetch immediately, racing AuthContext's own startup refresh
        // (see AuthContext#refreshUser) -- on a fresh load the access
        // token cookie is very often already expired at that instant,
        // and this used to surface as a permanent "session expired"
        // error even though the session itself was fine (AuthContext's
        // own retry-after-refresh always succeeded right after). Retry
        // once through the same refresh endpoint before giving up, so
        // this fetch doesn't lose that race.
        if (response.status === 401) {
          const refreshResponse = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          });

          if (refreshResponse.ok) {
            response = await fetch("/api/backend/organization-profile", {
              credentials: "include",
              signal: controller.signal,
            });
          }
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || data?.error || "Cannot load organization profile.");
        }

        setProfile(normalizeProfile(data || {}));
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
    const heroHeadline = isEnglish
      ? profile.hero_headline_en || profile.hero_headline_km || tagline
      : profile.hero_headline_km || profile.hero_headline_en || tagline;
    const heroDescription = isEnglish
      ? profile.hero_description_en || profile.hero_description_km || profile.about_en || profile.about_km
      : profile.hero_description_km || profile.hero_description_en || profile.about_km || profile.about_en;
    const about = isEnglish
      ? profile.about_en || profile.about_km
      : profile.about_km || profile.about_en;

    return {
      name,
      tagline,
      heroHeadline,
      heroDescription,
      about,
      logoUrl: normalizeBackendUrl(profile.logo_url),
    };
  }, [locale, profile]);

  const value = {
    profile,
    localized,
    loading,
    error,
    setProfile,
  };

  return (
    <OrganizationProfileContext.Provider value={value}>
      {children}
    </OrganizationProfileContext.Provider>
  );
}

export function useOrganizationProfileContext() {
  const context = useContext(OrganizationProfileContext);

  if (!context) {
    throw new Error(
      "useOrganizationProfile must be used inside OrganizationProfileProvider",
    );
  }

  return context;
}
