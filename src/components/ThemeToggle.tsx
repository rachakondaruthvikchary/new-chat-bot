"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage unavailable (private browsing); theme just won't persist
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:bg-surface hover:text-foreground"
    >
      <span className="text-base leading-none">{isDark ? "🌙" : "☀️"}</span>
      {isDark ? "Dark" : "Light"}
    </button>
  );
}
