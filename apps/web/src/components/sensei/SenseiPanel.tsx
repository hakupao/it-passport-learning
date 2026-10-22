// D-181 Task A4 — the AI 先生 conversation panel: a modal drawer (full screen on
// phones, a right-hand drawer from `sm` up). Radix Dialog gives Esc-to-close and
// the focus trap; on close, focus goes back to the button that opened it.
//
// One panel per page (AskSensei's SenseiHost); the anchor changes when the
// learner asks about another question, and useSensei switches threads (the old
// thread's reply in flight is stopped and kept in its own thread).
//
// - No key → KeySettings is shown and sending is disabled (the typed question
//   stays). An invalid key (401) → 「key が無効です」 and the settings open.
// - Errors and refusals (§0-11) put the question that failed back into the input.
// - Before the first token: a visible 「考え中…」 (first token is 2–4 s on Sonnet).
// - The conversation is an aria-live="polite" log; Stop while generating.
// - A refused save (quota) shows a non-blocking notice (§0-6).

"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { UIMessage } from "ai";

import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { useSensei } from "@/hooks/useSensei";
import type { SenseiError } from "@/lib/sensei/errors";
import type { ThreadKind } from "@/lib/sensei/threadStore";

import { KeySettings } from "./KeySettings";
import { SenseiMarkdown } from "./SenseiMarkdown";

export interface SenseiAnchor {
  kind: ThreadKind;
  anchorId: string;
  title: string;
  anchorText: string;
}

function textOf(m: UIMessage): string {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function SenseiPanel({
  anchor,
  open,
  onOpenChange,
  returnFocusTo,
}: {
  anchor: SenseiAnchor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusTo: RefObject<HTMLElement | null>;
}): React.ReactElement {
  const t = useTranslations("Sensei");
  const s = useSensei(anchor);
  const [input, setInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lastSent = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // A new thread starts with an empty composer.
  const threadKey = `${anchor.kind}:${anchor.anchorId}`;
  const [composerFor, setComposerFor] = useState(threadKey);
  if (composerFor !== threadKey) {
    setComposerFor(threadKey);
    setInput("");
    setSettingsOpen(false);
  }
  useEffect(() => {
    lastSent.current = null;
  }, [threadKey]);

  // A failed or refused turn: its question goes back into the input (unless the
  // learner already typed something new); an invalid key opens the settings.
  const { error, hasKey } = s;
  useEffect(() => {
    if (!error || lastSent.current === null) return;
    const text = lastSent.current;
    lastSent.current = null;
    setInput((cur) => (cur.trim() === "" ? text : cur));
    if (error.kind === "auth" && hasKey) setSettingsOpen(true);
  }, [error, hasKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [s.messages]);

  const generating = s.status === "submitted" || s.status === "streaming";
  const last = s.messages.at(-1);
  const thinking = generating && !(last?.role === "assistant" && textOf(last) !== "");
  const canSend = s.hasKey && !generating && input.trim() !== "";

  function send(): void {
    const text = input.trim();
    if (!canSend) return;
    lastSent.current = text;
    setInput("");
    void s.sendMessage({ text });
  }

  function errorText(err: SenseiError): string {
    switch (err.kind) {
      case "auth":
        return s.hasKey ? t("errorAuth") : t("keyMissing");
      case "rate":
        return t("errorRate");
      case "refusal":
        return t("errorRefusal");
      case "network":
        return t("errorNetwork");
      default:
        return t("errorOther", { message: err.message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          data-testid="sensei-panel"
          className="fixed inset-0 z-50 flex flex-col bg-background text-foreground shadow-lg outline-none sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[28rem] sm:max-w-full sm:border-l"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnFocusTo.current?.focus();
          }}
        >
          <header className="flex shrink-0 items-start gap-2 border-b p-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base">{t("panelTitle")}</DialogTitle>
              <DialogDescription className="truncate text-xs opacity-70">{anchor.title}</DialogDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={settingsOpen || !s.hasKey}
              onClick={() => setSettingsOpen((v) => !v)}
            >
              {t("settings")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={s.messages.length === 0 && !generating}
              onClick={() => {
                lastSent.current = null;
                s.clear();
              }}
            >
              {t("clear")}
            </Button>
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="outline" size="sm">
                {t("close")}
              </Button>
            </DialogPrimitive.Close>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {!s.hasKey || settingsOpen ? (
              <div className="rounded-md border p-3">
                {!s.hasKey ? (
                  <p className="mb-2 text-sm font-semibold" data-testid="sensei-key-missing">
                    {t("keyMissing")}
                  </p>
                ) : null}
                <KeySettings onChange={s.refreshKey} />
              </div>
            ) : null}

            <div role="log" aria-live="polite" aria-label={t("panelTitle")} className="space-y-3" data-testid="sensei-log">
              {s.messages.length === 0 && !generating ? <p className="text-sm opacity-70">{t("emptyHint")}</p> : null}
              {s.messages.map((m) => {
                const text = textOf(m);
                if (text === "") return null;
                return m.role === "user" ? (
                  <div key={m.id} data-role="user" className="ml-8 rounded-md bg-black/5 p-2 text-sm dark:bg-white/10">
                    <span className="sr-only">{t("you")}: </span>
                    <p className="whitespace-pre-wrap">{text}</p>
                  </div>
                ) : (
                  <div key={m.id} data-role="assistant" className="prose prose-sm prose-inherit max-w-none text-sm">
                    <span className="sr-only">{t("sensei")}: </span>
                    <SenseiMarkdown text={text} />
                  </div>
                );
              })}
              {thinking ? (
                <p className="text-sm opacity-70" data-testid="sensei-thinking">
                  {t("thinking")}
                </p>
              ) : null}
            </div>

            {s.error ? (
              <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-800" data-testid="sensei-error">
                {errorText(s.error)}
              </p>
            ) : null}
            {s.saveFailed ? (
              <p role="status" className="text-xs opacity-70" data-testid="sensei-save-failed">
                {t("saveFailed")}
              </p>
            ) : null}
            <div ref={endRef} />
          </div>

          <form
            className="shrink-0 space-y-2 border-t p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            {s.messages.length === 0 && input === "" ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setInput(t("suggestWhy"))}>
                {t("suggestWhy")}
              </Button>
            ) : null}
            <label htmlFor="sensei-input" className="sr-only">
              {t("inputLabel")}
            </label>
            <textarea
              id="sensei-input"
              ref={inputRef}
              rows={3}
              className="w-full resize-none rounded-md border bg-transparent p-2 text-sm"
              placeholder={t("inputPlaceholder")}
              aria-describedby="sensei-input-hint"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <div className="flex items-center justify-between gap-2">
              <span id="sensei-input-hint" className="text-xs opacity-70">
                {t("sendHint")}
              </span>
              {generating ? (
                <Button type="button" variant="outline" onClick={() => void s.stop()}>
                  {t("stop")}
                </Button>
              ) : (
                <Button type="submit" disabled={!canSend}>
                  {t("send")}
                </Button>
              )}
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
