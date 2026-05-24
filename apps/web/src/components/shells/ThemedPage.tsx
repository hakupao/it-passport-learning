"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamic from "next/dynamic";
import type React from "react";

import { useTheme, type Theme } from "@/hooks/useTheme";

type PageName = "chat" | "tutor" | "quiz" | "glossary" | "book";

// Each view component has specific typed props (e.g. chapters, summaries).
// We store them as ComponentType<any> here because ThemedPage passes props
// through as Record<string, unknown>; the individual components enforce their
// own prop shapes at their call sites (quiz/page.tsx, tutor/page.tsx, etc.).
const VIEWS: Record<Theme, Record<PageName, React.ComponentType<any>>> = {
  gamified: {
    chat: dynamic(() => import("./gamified/GamifiedChat").then((m) => ({ default: m.GamifiedChat }))),
    tutor: dynamic(() => import("./gamified/GamifiedTutor").then((m) => ({ default: m.GamifiedTutor }))),
    quiz: dynamic(() => import("./gamified/GamifiedQuiz").then((m) => ({ default: m.GamifiedQuiz }))),
    glossary: dynamic(() => import("./gamified/GamifiedGlossary").then((m) => ({ default: m.GamifiedGlossary }))),
    book: dynamic(() => import("./gamified/GamifiedBook").then((m) => ({ default: m.GamifiedBook }))),
  },
  retro: {
    chat: dynamic(() => import("./retro/RetroChat").then((m) => ({ default: m.RetroChat }))),
    tutor: dynamic(() => import("./retro/RetroTutor").then((m) => ({ default: m.RetroTutor }))),
    quiz: dynamic(() => import("./retro/RetroQuiz").then((m) => ({ default: m.RetroQuiz }))),
    glossary: dynamic(() => import("./retro/RetroGlossary").then((m) => ({ default: m.RetroGlossary }))),
    book: dynamic(() => import("./retro/RetroBook").then((m) => ({ default: m.RetroBook }))),
  },
  terminal: {
    chat: dynamic(() => import("./terminal/TerminalChat").then((m) => ({ default: m.TerminalChat }))),
    tutor: dynamic(() => import("./terminal/TerminalTutor").then((m) => ({ default: m.TerminalTutor }))),
    quiz: dynamic(() => import("./terminal/TerminalQuiz").then((m) => ({ default: m.TerminalQuiz }))),
    glossary: dynamic(() => import("./terminal/TerminalGlossary").then((m) => ({ default: m.TerminalGlossary }))),
    book: dynamic(() => import("./terminal/TerminalBook").then((m) => ({ default: m.TerminalBook }))),
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
