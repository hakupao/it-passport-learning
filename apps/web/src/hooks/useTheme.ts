"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const THEMES = ["gamified", "retro", "terminal"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "gamified";
export const THEME_STORAGE_KEY = "itp:theme:v1";

export function isValidTheme(value: unknown): value is Theme {
  return typeof value === "string" && THEMES.includes(value as Theme);
}

export function loadTheme(storage: Pick<Storage, "getItem">): Theme {
  try {
    const raw = storage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(raw) ? raw : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(storage: Pick<Storage, "setItem">, theme: Theme): void {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Quota exceeded / private mode — swallow.
  }
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useThemeProvider(): ThemeContextValue {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loaded = loadTheme(window.localStorage);
    setThemeState(loaded);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      saveTheme(window.localStorage, t);
    }
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return { theme, setTheme };
}
