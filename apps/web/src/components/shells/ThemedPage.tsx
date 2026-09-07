"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamic from "next/dynamic";
import type React from "react";

import { useTheme, type Theme } from "@/hooks/useTheme";

// "quiz" は D-135 (S86) 以降 /quiz が QuizSet を直接描画するため shell 経路が無く、S117 (D-144 段 4) で dead code を削除した
type PageName = "chat" | "tutor" | "glossary";

const VIEWS: Record<Theme, Record<PageName, React.ComponentType<any>>> = {
  gamified: {
    chat: dynamic(() => import("./gamified/GamifiedChat").then((m) => ({ default: m.GamifiedChat }))),
    tutor: dynamic(() => import("./gamified/GamifiedTutor").then((m) => ({ default: m.GamifiedTutor }))),
    glossary: dynamic(() => import("./gamified/GamifiedGlossary").then((m) => ({ default: m.GamifiedGlossary }))),
  },
  retro: {
    chat: dynamic(() => import("./retro/RetroChat").then((m) => ({ default: m.RetroChat }))),
    tutor: dynamic(() => import("./retro/RetroTutor").then((m) => ({ default: m.RetroTutor }))),
    glossary: dynamic(() => import("./retro/RetroGlossary").then((m) => ({ default: m.RetroGlossary }))),
  },
  terminal: {
    chat: dynamic(() => import("./terminal/TerminalChat").then((m) => ({ default: m.TerminalChat }))),
    tutor: dynamic(() => import("./terminal/TerminalTutor").then((m) => ({ default: m.TerminalTutor }))),
    glossary: dynamic(() => import("./terminal/TerminalGlossary").then((m) => ({ default: m.TerminalGlossary }))),
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

interface ThemedPageProps {
  page: PageName;
  props?: Record<string, unknown>;
}

export function ThemedPage({ page, props = {} }: ThemedPageProps): React.ReactElement {
  const { theme } = useTheme();
  const View = VIEWS[theme][page];
  return <View {...props} />;
}
