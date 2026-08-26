// components/navigation/LanguageSwitcher.jsx
"use client";

import { useLanguage } from "@/context/LanguageContext";

const LANGUAGES = {
  km: { label: "ខ្មែរ", flag: "/kh_flag.png" },
  en: { label: "EN", flag: "/uk_flag.png" },
};

export default function LanguageSwitcher() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="flex h-9 items-center gap-0.5 rounded-full border border-border bg-bg-page-white p-1 transition-shadow hover:shadow sm:gap-1"
      aria-label={`Switch language to ${locale === "km" ? "English" : "Khmer"}`}
    >
      {/* KM side */}
      <span
        className={`flex h-full items-center gap-1.5 rounded-full px-2 text-sm transition-all duration-200 sm:px-3 ${
          locale === "km"
            ? "bg-bg-page-white shadow-md border border-border text-text-primary font-medium"
            : "text-text-mute"
        }`}
      >
        <span className={`${locale === "km" ? "block" : "hidden sm:block"} h-4 w-6 shrink-0 overflow-hidden rounded-sm`}>
            <img src={LANGUAGES.km.flag} alt="km" className="w-full h-full object-cover" />
        </span>
        <span className="hidden sm:inline">{LANGUAGES.km.label}</span>
      </span>

      {/* EN side */}
      <span
        className={`flex h-full items-center gap-1.5 rounded-full px-2 text-sm transition-all duration-200 sm:px-3 ${
          locale === "en"
            ? "bg-bg-page-white shadow-md border border-border text-text-primary font-medium"
            : "text-text-mute"
        }`}
      >
        <span className={`${locale === "en" ? "block" : "hidden sm:block"} h-4 w-6 shrink-0 overflow-hidden rounded-sm`}>
            <img src={LANGUAGES.en.flag} alt="en" className="w-full h-full object-cover" />
        </span>
        <span className="hidden sm:inline">{LANGUAGES.en.label}</span>
      </span>
    </button>
  );
}
