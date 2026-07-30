// components/navigation/LanguageSwitcher.jsx
"use client";
import { useState } from "react";

const LANGUAGES = {
  km: { label: "ខ្មែរ", flag: "/kh_flag.png" },
  en: { label: "EN", flag: "/uk_flag.png" },
};

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("km");

  function toggleLang() {
    setLang((prev) => (prev === "km" ? "en" : "km"));
  }

  return (
    <button
      onClick={toggleLang}
      className="flex h-9 items-center gap-0 rounded-full border border-border bg-white p-1 transition-shadow hover:shadow sm:gap-1"
    >
      {/* KM side */}
      <span
        className={`flex h-full items-center gap-1.5 rounded-full px-1.5 text-xs transition-all duration-200 sm:px-3 sm:text-sm ${
          lang === "km"
            ? "bg-white shadow-md border border-gray-100 text-text-primary font-medium"
            : "text-gray-400"
        }`}
      >
        {lang === "km" && (
          <span className="w-6 h-4 rounded-sm overflow-hidden shrink-0">
            <img src={LANGUAGES.km.flag} alt="km" className="w-full h-full object-cover" />
          </span>
        )}
        {LANGUAGES.km.label}
      </span>

      {/* EN side */}
      <span
        className={`hidden h-full items-center gap-1.5 rounded-full px-3 text-sm transition-all duration-200 sm:flex ${
          lang === "en"
            ? "bg-white shadow-md border border-gray-100 text-text-primary font-medium"
            : "text-gray-400"
        }`}
      >
        {lang === "en" && (
          <span className="w-6 h-4 rounded-sm overflow-hidden shrink-0">
            <img src={LANGUAGES.en.flag} alt="en" className="w-full h-full object-cover" />
          </span>
        )}
        {LANGUAGES.en.label}
      </span>
    </button>
  );
}
