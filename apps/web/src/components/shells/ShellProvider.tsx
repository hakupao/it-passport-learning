"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { ThemeContext, useThemeProvider, type Theme } from "@/hooks/useTheme";

const GamifiedShell = dynamic(() => import("./gamified/GamifiedShell").then(m => ({ default: m.GamifiedShell })));
const RetroShell = dynamic(() => import("./retro/RetroShell").then(m => ({ default: m.RetroShell })));
const TerminalShell = dynamic(() => import("./terminal/TerminalShell").then(m => ({ default: m.TerminalShell })));

const SHELL_MAP: Record<Theme, React.ComponentType<{ children: ReactNode }>> = {
  gamified: GamifiedShell,
  retro: RetroShell,
  terminal: TerminalShell,
};

interface ShellProviderProps {
  children: ReactNode;
}

export function ShellProvider({ children }: ShellProviderProps): React.ReactElement {
  const themeValue = useThemeProvider();
  const Shell = SHELL_MAP[themeValue.theme];

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className="transition-opacity duration-150">
        <Shell>{children}</Shell>
      </div>
    </ThemeContext.Provider>
  );
}
