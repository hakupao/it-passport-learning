// Phase 3 Step 2 — <SelectionToolbar /> floating in-text toolbar (LD-2).
//
// D-101 §2.3 selection mental model = "Notion / Safari": user highlights
// a passage with mouse/touch → small floating toolbar appears near the
// selection with translate-only buttons (zh / en). Click → opens
// <ParagraphTranslate /> modal. No chat / no quiz buttons here (LD-2
// sub-clarification: avoid two interaction modes confusion).
//
// Scope guard: toolbar only fires when the selection's anchor + focus
// both live inside an element with `data-chapter-content="true"`. This
// keeps the toolbar from popping up over chrome (NavTabs, ChapterEnd
// buttons, modal text, etc.) where translation is meaningless.
//
// A11y:
//   - role="toolbar" with aria-label.
//   - Each button is a real <button> with focus-visible ring.
//   - Keyboard escape: ESC clears the selection and hides the toolbar.

"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { ParagraphTranslate } from "./ParagraphTranslate";
import type { ParagraphTranslateRequest } from "./ParagraphTranslate";

interface ToolbarState {
  text: string;
  /** Viewport-relative position of the toolbar (top-left corner, px). */
  left: number;
  top: number;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

const TOOLBAR_HEIGHT_ESTIMATE = 36;
const TOOLBAR_VERTICAL_GAP = 6;
const MIN_SELECTION_CHARS = 2;

function isInsideChapterContent(node: Node | null): boolean {
  let cur: Node | null = node;
  while (cur) {
    if (cur.nodeType === Node.ELEMENT_NODE) {
      const el = cur as HTMLElement;
      if (el.dataset?.chapterContent === "true") return true;
    }
    cur = cur.parentNode;
  }
  return false;
}

export function SelectionToolbar(): React.ReactElement | null {
  const t = useTranslations("Book");
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null);
  const [request, setRequest] = useState<ParagraphTranslateRequest | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const updateToolbarFromSelection = useCallback(() => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setToolbar(null);
      return;
    }
    const text = sel.toString().trim();
    if (text.length < MIN_SELECTION_CHARS) {
      setToolbar(null);
      return;
    }
    if (
      !isInsideChapterContent(sel.anchorNode) ||
      !isInsideChapterContent(sel.focusNode)
    ) {
      setToolbar(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setToolbar(null);
      return;
    }
    // Anchor above the selection if there is room; else below.
    const wantsAbove = rect.top > TOOLBAR_HEIGHT_ESTIMATE + TOOLBAR_VERTICAL_GAP;
    const top = wantsAbove
      ? rect.top - TOOLBAR_HEIGHT_ESTIMATE - TOOLBAR_VERTICAL_GAP
      : rect.bottom + TOOLBAR_VERTICAL_GAP;
    const left = Math.max(
      8,
      Math.min(rect.left, window.innerWidth - 220),
    );
    setToolbar({ text, left, top });
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    // selectionchange fires on every cursor adjustment, so debounce to a
    // microtask via rAF — this is plenty for visual smoothness and avoids
    // re-rendering 60×/sec while the user is dragging the selection.
    let rafId: number | null = null;
    const onSelectionChange = (): void => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateToolbarFromSelection();
      });
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        window.getSelection()?.removeAllRanges();
        setToolbar(null);
      }
    };
    const onScroll = (): void => {
      // While scrolling, re-anchor the toolbar against the updated rect;
      // if selection collapses or leaves the viewport the toolbar hides.
      updateToolbarFromSelection();
    };
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [updateToolbarFromSelection]);

  // Pressing the toolbar should not collapse the selection (which would
  // race with the click handler). Intercept mousedown to stop the browser
  // from clearing the selection before the button's click fires.
  const handleToolbarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const openTranslate = useCallback(
    (target: "zh" | "en") => {
      if (!toolbar) return;
      setRequest({ source: toolbar.text, target });
      setToolbar(null);
      if (typeof window !== "undefined") {
        window.getSelection()?.removeAllRanges();
      }
    },
    [toolbar],
  );

  return (
    <>
      {toolbar && (
        <div
          ref={containerRef}
          role="toolbar"
          aria-label={t("translateToolbarLabel")}
          onMouseDown={handleToolbarMouseDown}
          style={{
            position: "fixed",
            left: `${toolbar.left}px`,
            top: `${toolbar.top}px`,
            zIndex: 40,
          }}
          className="flex items-center gap-1 bg-white dark:bg-black text-black dark:text-white border border-black/15 dark:border-white/20 rounded-lg shadow-lg px-1 py-1"
        >
          <button
            type="button"
            onClick={() => openTranslate("zh")}
            className={`text-xs sm:text-sm rounded-md px-2 py-1 hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors ${FOCUS_RING}`}
          >
            {t("translateZh")}
          </button>
          <button
            type="button"
            onClick={() => openTranslate("en")}
            className={`text-xs sm:text-sm rounded-md px-2 py-1 hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors ${FOCUS_RING}`}
          >
            {t("translateEn")}
          </button>
        </div>
      )}
      <ParagraphTranslate
        request={request}
        onClose={() => setRequest(null)}
      />
    </>
  );
}
