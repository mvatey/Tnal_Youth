// components/navigation/ThemeToggle.jsx
"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/themeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex h-11 items-center gap-2 rounded-full border border-border bg-white pl-1.5 pr-4 text-sm transition hover:bg-bg-page-gray"
      aria-label="ប្ដូរពន្លឺផ្ទៃ"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-secondary/40 bg-white">
        {theme === "light" ? <Sun size={17} className="text-secondary" /> : <Moon size={17} className="text-secondary" />}
      </span>
      <span className="text-text-primary font-medium">Light/Dark</span>
    </button>
  );
}
