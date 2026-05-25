"use client";

import { useTransition } from "react";
import { useTheme, THEMES, type Theme } from "@/hooks/useTheme";

const LABELS: Record<Theme, string> = {
  gamified: "🎮 Gamified",
  retro: "🖥️ Retro OS",
  terminal: "⌨️ Terminal",
};

export function ThemeSwitcher(): React.ReactElement {
  const { theme, setTheme } = useTheme();
  const [, startTransition] = useTransition();

  return (
    <select
      value={theme}
      onChange={(e) => {
        const next = e.target.value as Theme;
        startTransition(() => {
          setTheme(next);
        });
      }}
      aria-label="Switch theme"
      className="text-xs bg-transparent border border-current/20 rounded px-1 py-0.5"
    >
      {THEMES.map((t) => (
        <option key={t} value={t} className="text-black bg-white">{LABELS[t]}</option>
      ))}
    </select>
  );
}
