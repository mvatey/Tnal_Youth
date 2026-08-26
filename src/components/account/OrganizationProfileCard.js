"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Building2, Camera, Info } from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";
import { useLanguage } from "@/context/LanguageContext";
import useOrganizationProfile from "@/hooks/useOrganizationProfile";

function normalizeLogoUrl(url) {
  if (!url) return "/logo.png";
  if (url.startsWith("/api/backend/")) return url;
  if (url.startsWith("/api/")) return `/api/backend/${url.slice(5)}`;
  return url;
}

export default function OrganizationProfileCard({ canEdit = false }) {
  const { t } = useLanguage();
  const { profile, localized, loading, error, setProfile } = useOrganizationProfile();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(profile);
  const [logoPreview, setLogoPreview] = useState("/logo.png");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm(profile);
    setLogoPreview(normalizeLogoUrl(profile.logo_url));
  }, [profile]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setMessage("");
    setFormError("");

    if (!String(form.name_km || "").trim()) {
      setFormError(t("organizationProfile.nameKmRequired"));
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/backend/organization-profile", {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || t("organizationProfile.saveFailed"));
      }

      setProfile({
        ...form,
        ...(data || {}),
        logo_url: normalizeLogoUrl(data?.logo_url ?? data?.logoUrl ?? form.logo_url),
      });
      setMessage(t("organizationProfile.saved"));
    } catch (saveError) {
      setFormError(saveError.message || t("organizationProfile.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoChange(event) {
    const file = event.target.files?.[0];
    setMessage("");
    setFormError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError(t("memberPage.imageOnly"));
      event.target.value = "";
      return;
    }

    const data = new FormData();
    data.append("file", file);

    try {
      setSaving(true);
      const response = await fetch("/api/backend/organization-profile/logo", {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || body?.error || t("organizationProfile.logoFailed"));
      }

      setProfile({
        ...form,
        ...body,
        logo_url: normalizeLogoUrl(body?.logo_url ?? body?.logoUrl),
      });
      setMessage(t("organizationProfile.logoSaved"));
    } catch (uploadError) {
      setFormError(uploadError.message || t("organizationProfile.logoFailed"));
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-page-white p-5 text-sm text-text-secondary">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="min-w-0 rounded-xl border border-border bg-bg-page-white p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-bg-page-gray">
            <Image src={logoPreview} alt={localized.name} fill sizes="80px" className="object-cover" unoptimized onError={() => setLogoPreview("/logo.png")} />
            {canEdit && (
              <>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-white shadow" aria-label={t("organizationProfile.changeLogo")}>
                  <Camera size={14} />
                </button>
              </>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Building2 size={16} />
              {t("organizationProfile.title")}
            </div>
            <h2 className="mt-1 truncate text-lg font-bold text-text-primary">{localized.name}</h2>
            {localized.tagline && <p className="mt-1 text-sm text-text-secondary">{localized.tagline}</p>}
          </div>
        </div>
      </div>

      {canEdit ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TextField label={t("organizationProfile.nameKm")} value={form.name_km || ""} onChange={(value) => updateField("name_km", value)} required />
          <TextField label={t("organizationProfile.nameEn")} value={form.name_en || ""} onChange={(value) => updateField("name_en", value)} />
          <TextField label={t("organizationProfile.taglineKm")} value={form.tagline_km || ""} onChange={(value) => updateField("tagline_km", value)} />
          <TextField label={t("organizationProfile.taglineEn")} value={form.tagline_en || ""} onChange={(value) => updateField("tagline_en", value)} />
          <TextField label={t("organizationProfile.heroHeadlineKm")} value={form.hero_headline_km || ""} onChange={(value) => updateField("hero_headline_km", value)} />
          <TextField label={t("organizationProfile.heroHeadlineEn")} value={form.hero_headline_en || ""} onChange={(value) => updateField("hero_headline_en", value)} />
          <TextareaField label={t("organizationProfile.heroDescriptionKm")} value={form.hero_description_km || ""} onChange={(value) => updateField("hero_description_km", value)} />
          <TextareaField label={t("organizationProfile.heroDescriptionEn")} value={form.hero_description_en || ""} onChange={(value) => updateField("hero_description_en", value)} />
          <TextareaField label={t("organizationProfile.aboutKm")} value={form.about_km || ""} onChange={(value) => updateField("about_km", value)} />
          <TextareaField label={t("organizationProfile.aboutEn")} value={form.about_en || ""} onChange={(value) => updateField("about_en", value)} />
        </div>
      ) : (
        <div className="rounded-lg bg-bg-page-gray p-4 text-sm leading-7 text-text-secondary">
          <div className="mb-2 flex items-center gap-2 font-semibold text-text-primary">
            <Info size={16} />
            {t("organizationProfile.description")}
          </div>
          {localized.about || t("organizationProfile.noDescription")}
        </div>
      )}

      {(formError || error) && <p className="mt-4 text-sm font-medium text-error">{formError || error}</p>}
      {message && <p className="mt-4 text-sm font-medium text-success">{message}</p>}

      {canEdit && (
        <div className="mt-5 flex justify-end">
          <SaveButton type="submit" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </SaveButton>
        </div>
      )}
    </form>
  );
}

function TextField({ label, value, onChange, required = false }) {
  return (
    <label className="block text-sm font-medium text-text-primary">
      {label}
      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-[36px] w-full rounded-lg border border-border bg-bg-page-white px-3 text-sm font-normal text-text-secondary outline-none focus:border-primary"
      />
    </label>
  );
}

function TextareaField({ label, value, onChange }) {
  return (
    <label className="block text-sm font-medium text-text-primary">
      {label}
      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-y rounded-lg border border-border bg-bg-page-white px-3 py-2 text-sm font-normal text-text-secondary outline-none focus:border-primary"
      />
    </label>
  );
}
