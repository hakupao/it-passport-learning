// D-149 (Session 126) — owner-only per-question problem report.
//
// Rendered by the practice ExplanationPane only when the server page resolved the D-148 owner cookie
// (`isOwner` prop), so non-owners never see it; the API also re-checks (403).
// Inline disclosure panel (no modal): trigger has aria-expanded/aria-controls,
// first category radio receives focus on open, Esc closes and returns focus to
// the trigger, submit/list results are announced via aria-live.

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_NOTE_MAX,
  type FeedbackCategory,
  type FeedbackRecord,
} from "@/lib/quiz/feedbackModel";

import styles from "./feedback.module.css";

type ListState = "loading" | "ready" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error" | "unavailable";

export function QuizFeedback({
  questionId,
  locale,
}: {
  questionId: string;
  locale: string;
}): React.ReactElement {
  const t = useTranslations("Practice");
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const titleId = `${baseId}-title`;
  const noteId = `${baseId}-note`;

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [note, setNote] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [listState, setListState] = useState<ListState>("loading");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstRadioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    firstRadioRef.current?.focus();
    let cancelled = false;
    setListState("loading");
    fetch(`/api/quiz/feedback?question_id=${encodeURIComponent(questionId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { records: FeedbackRecord[] };
        if (!cancelled) {
          // Merge by id: a record submitted while this fetch was in flight
          // must not be dropped by the (older) server snapshot.
          setRecords((prev) => {
            const byId = new Map(data.records.map((r) => [r.id, r]));
            for (const r of prev) if (!byId.has(r.id)) byId.set(r.id, r);
            return [...byId.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
          });
          setListState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setListState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [open, questionId]);

  function close(): void {
    setOpen(false);
    triggerRef.current?.focus();
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!category || submitState === "submitting") return;
    setSubmitState("submitting");
    try {
      const res = await fetch("/api/quiz/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, locale, category, note }),
      });
      if (res.status === 201) {
        const rec = (await res.json()) as FeedbackRecord;
        setRecords((prev) => [rec, ...prev.filter((r) => r.id !== rec.id)]);
        setListState("ready");
        setCategory(null);
        setNote("");
        setSubmitState("success");
      } else {
        setSubmitState(res.status === 503 || res.status === 403 ? "unavailable" : "error");
      }
    } catch {
      setSubmitState("error");
    }
  }

  return (
    <div className={styles.fbWrap}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.fbTrigger}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {t("fbReport")}
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={titleId}
          className={styles.fbPanel}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
        >
          <p id={titleId} className={styles.fbTitle}>
            {t("fbTitle")}
          </p>

          <form onSubmit={submit}>
            <fieldset className={styles.fbFieldset}>
              <legend className={styles.fbLegend}>{t("fbCategory")}</legend>
              {FEEDBACK_CATEGORIES.map((c, i) => (
                <label key={c} className={styles.fbOption}>
                  <input
                    ref={i === 0 ? firstRadioRef : undefined}
                    type="radio"
                    name={`${baseId}-category`}
                    value={c}
                    checked={category === c}
                    onChange={() => setCategory(c)}
                    required
                  />
                  <span>{t(`fbCat_${c}`)}</span>
                </label>
              ))}
            </fieldset>

            <label htmlFor={noteId} className={styles.fbLegend}>
              {t("fbNote", { max: FEEDBACK_NOTE_MAX })}
            </label>
            <textarea
              id={noteId}
              className={styles.fbTextarea}
              rows={3}
              maxLength={FEEDBACK_NOTE_MAX}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className={styles.fbActions}>
              <button
                type="submit"
                className={styles.fbSubmit}
                disabled={!category || submitState === "submitting"}
              >
                {submitState === "submitting" ? t("fbSubmitting") : t("fbSubmit")}
              </button>
              <button type="button" className={styles.fbClose} onClick={close}>
                {t("fbClose")}
              </button>
              <span
                role="status"
                aria-live="polite"
                className={submitState === "success" ? styles.fbOk : styles.fbErr}
              >
                {submitState === "success"
                  ? t("fbSuccess")
                  : submitState === "error"
                    ? t("fbError")
                    : submitState === "unavailable"
                      ? t("fbUnavailable")
                      : ""}
              </span>
            </div>
          </form>

          <p className={styles.fbListHead}>{t("fbExisting")}</p>
          <div aria-live="polite">
            {listState === "loading" ? (
              <p className={styles.fbMeta}>{t("fbLoading")}</p>
            ) : listState === "error" ? (
              <p className={styles.fbErr}>{t("fbLoadError")}</p>
            ) : records.length === 0 ? (
              <p className={styles.fbMeta}>{t("fbNone")}</p>
            ) : (
              <ul className={styles.fbList}>
                {records.map((r) => (
                  <li key={r.id} className={styles.fbItem}>
                    <span
                      className={r.status === "resolved" ? styles.fbBadgeResolved : styles.fbBadgeOpen}
                    >
                      {t(`fbStatus_${r.status}`)}
                    </span>{" "}
                    <strong>{t(`fbCat_${r.category}`)}</strong>{" "}
                    <span className={styles.fbMeta}>
                      {new Date(r.created_at).toLocaleString(locale)}
                    </span>
                    {r.note ? <p className={styles.fbNoteText}>{r.note}</p> : null}
                    {r.status === "resolved" && r.resolution_note ? (
                      <p className={styles.fbNoteText}>
                        {t("fbResolution")}: {r.resolution_note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
