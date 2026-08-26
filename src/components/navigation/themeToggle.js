// components/navigation/ThemeToggle.jsx
"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/themeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme() ?? {
    theme: "light",
    toggleTheme: () => {},
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm transition hover:bg-bg-page-gray sm:w-auto sm:gap-1.5 sm:pl-1 sm:pr-3"
      aria-label="Toggle light or dark theme"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-page-gray">
        {theme === "light" ? <Sun size={14} className="text-secondary" /> : <Moon size={14} className="text-secondary" />}
      </span>
      <span className="hidden font-medium text-text-primary sm:inline">Light/Dark</span>
    </button>
  );
}
