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
      className="flex h-9 items-center gap-1.5 rounded-full border border-border p-1 text-sm transition hover:bg-bg-page-gray sm:pr-3"
    >
      <span className="w-6 h-6 rounded-full bg-bg-page-gray flex items-center justify-center">
        {theme === "light" ? <Sun size={14} className="text-secondary" /> : <Moon size={14} className="text-secondary" />}
      </span>
      <span className="hidden font-medium text-text-primary sm:inline">Light/Dark</span>
    </button>
  );
}
