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
      className="flex items-center h-9 gap-1.5 border border-border rounded-full pl-1 pr-3 text-sm hover:bg-bg-page-gray transition"
    >
      <span className="w-6 h-6 rounded-full bg-bg-page-gray flex items-center justify-center">
        {theme === "light" ? <Sun size={14} className="text-secondary" /> : <Moon size={14} className="text-secondary" />}
      </span>
      <span className="text-text-primary font-medium">Light/Dark</span>
    </button>
  );
}
