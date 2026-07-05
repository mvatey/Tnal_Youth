// components/navigation/Topbar.jsx
"use client";
import { useState } from "react";
import { Bell, Sun, Moon } from "lucide-react";

export default function Topbar({ title }) {
  const [lang, setLang] = useState("km");
  const [dark, setDark] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setLang(lang === "km" ? "en" : "km")}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
        >
          🇰🇭 {lang === "km" ? "ខ្មែរ" : "EN"}
        </button>

        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
        >
          {dark ? <Moon size={16} /> : <Sun size={16} />}
          Light/Dark
        </button>

        <button className="relative text-text-secondary hover:text-text-primary">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full" />
        </button>
      </div>
    </header>
  );
}