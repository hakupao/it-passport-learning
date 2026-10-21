// Stage 6 (D-179 / D-180) — glossary term chip on quiz questions.
//
// With a dictionary card: a button (aria-expanded) that toggles an inline
// popover with the active-locale gloss, definition, memory hook and a link to
// /glossary/<termId>. Esc closes and returns focus to the button; a pointer
// press outside the chip closes it. Without a card (term not in the textbook
// dictionary): plain text. Client component — only `import type` from
// lib/glossary/dictionary (it pulls in server-only modules).

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { TermCard } from "@/lib/glossary/dictionary";

import styles from "./glossary.module.css";

interface Props {
  card: TermCard | undefined;
  label: string;
  locale: string;
}

export function TermChip({ card, label, locale }: Props): React.ReactElement {
  const t = useTranslations("Glossary");
  const popId = `${useId()}-pop`;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key !== "Escape") return;
      setOpen(false);
      btnRef.current?.focus();
    }
    function onPointer(e: PointerEvent): void {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  if (!card) return <span className={styles.chipText}>{label}</span>;

  return (
    <span ref={wrapRef} className={styles.chip}>
      <button
        ref={btnRef}
        type="button"
        className={styles.chipBtn}
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      {open ? (
        <span id={popId} role="dialog" aria-label={card.term} className={styles.chipPop}>
          <span className={styles.chipHead}>
            {card.term}
            {card.gloss !== card.term ? <span className={styles.gloss}>{card.gloss}</span> : null}
          </span>
          <span className={styles.chipField}>
            <span className={styles.fieldLabel}>{t("definition")}</span>
            {card.definition}
          </span>
          {card.memoryHook.trim() !== "" ? (
            <span className={styles.chipField}>
              <span className={styles.fieldLabel}>{t("memoryHook")}</span>
              {card.memoryHook}
            </span>
          ) : null}
          <Link href={`/glossary/${card.id}`} locale={locale} className={styles.chipLink}>
            {t("openInGlossary")} →
          </Link>
        </span>
      ) : null}
    </span>
  );
}
