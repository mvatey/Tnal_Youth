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
      className="flex items-center h-9 bg-bg-page-white border border-border rounded-full p-1 gap-1 hover:shadow transition-shadow"
    >
      {/* KM side */}
      <span
        className={`flex items-center h-full gap-1.5 rounded-full px-3 text-sm transition-all duration-200 ${
          lang === "km"
            ? "bg-bg-page-white shadow-md border border-border text-text-primary font-medium"
            : "text-text-mute"
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
        className={`flex items-center h-full gap-1.5 rounded-full px-3 text-sm transition-all duration-200 ${
          lang === "en"
            ? "bg-bg-page-white shadow-md border border-border text-text-primary font-medium"
            : "text-text-mute"
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
