// Stage 7 Phase 1 Task 12 (DESIGN §3.4 / §6.8) — the settings page /settings.
//
//   - Study settings (the v2 record's `settings`, last-writer-wins, synced between the owner's
//     devices with the record): exam date (<input type="date">), daily review cap and daily new
//     target (number inputs, bounds from SETTING_RANGES), question translation default (hidden /
//     shown radios). One 「保存」 submits; the form uses noValidate so an out-of-range number is
//     clamped (record.setSetting) instead of blocked, and the clamped values are shown after saving
//     (settingsForm.submitSettings). The role=status line says 「已保存」, plus a hint when a cleared
//     exam date was kept (the record cannot unset a setting). Editing a field clears the line.
//   - The fields mount once the record has loaded, with its values as their initial state (the
//     server render and the first client frame show a reserved block, no values — no 30 → 50 jump).
//     A later merge (another tab) does not reset fields being edited.
//   - Interface language: the 日 / 中 / EN links to this page in the other locale (LocaleSwitcherLinks;
//     no query string here, so no useSearchParams / Suspense).
//   - 「AI 老师：对话记录与自由提问」 → /sensei: the page's fixed entry since the theme shells went
//     (DESIGN §3.4; no extra link next to 设置 in the AppShell). The API key stays on /sensei until
//     Phase 4.

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { LocaleSwitcherLinks } from "@/components/LocaleSwitcher";
import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link } from "@/i18n/navigation";
import { SETTING_RANGES, type LearningRecord } from "@/lib/learning/record";
import {
  formValuesOf,
  submitSettings,
  type SetSetting,
  type SettingsFormValues,
  type TransDefault,
} from "@/lib/settings/settingsForm";

import styles from "./settings.module.css";

const TRANS: readonly TransDefault[] = ["hidden", "shown"];

function Fields({
  initial,
  record,
  set,
}: {
  initial: SettingsFormValues;
  record: LearningRecord;
  set: SetSetting;
}): React.ReactElement {
  const t = useTranslations("Settings");
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState("");
  const edit = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]): void => {
    setValues((v) => ({ ...v, [key]: value }));
    setStatus("");
  };
  const [capMin, capMax] = SETTING_RANGES.dailyReviewCap;
  const [newMin, newMax] = SETTING_RANGES.dailyNewTarget;

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const res = submitSettings(values, record, set);
        setValues(res.values);
        setStatus(res.examDateKept ? `${t("saved")} ${t("examDateKept", { date: res.values.examDate })}` : t("saved"));
      }}
    >
      <div className={styles.field}>
        <label htmlFor="settings-exam-date" className={styles.label}>
          {t("examDate")}
        </label>
        <input
          id="settings-exam-date"
          type="date"
          className={styles.input}
          value={values.examDate}
          aria-describedby="settings-exam-date-hint"
          onChange={(e) => edit("examDate", e.target.value)}
        />
        <p id="settings-exam-date-hint" className={styles.hint}>
          {t("examDateHint")}
        </p>
      </div>
      <div className={styles.field}>
        <label htmlFor="settings-review-cap" className={styles.label}>
          {t("reviewCap")}
        </label>
        <input
          id="settings-review-cap"
          type="number"
          inputMode="numeric"
          min={capMin}
          max={capMax}
          step={1}
          className={`${styles.input} ${styles.number}`}
          value={values.dailyReviewCap}
          aria-describedby="settings-review-cap-hint"
          onChange={(e) => edit("dailyReviewCap", e.target.value)}
        />
        <p id="settings-review-cap-hint" className={styles.hint}>
          {t("reviewCapHint", { min: capMin, max: capMax })}
        </p>
      </div>
      <div className={styles.field}>
        <label htmlFor="settings-new-target" className={styles.label}>
          {t("newTarget")}
        </label>
        <input
          id="settings-new-target"
          type="number"
          inputMode="numeric"
          min={newMin}
          max={newMax}
          step={1}
          className={`${styles.input} ${styles.number}`}
          value={values.dailyNewTarget}
          aria-describedby="settings-new-target-hint"
          onChange={(e) => edit("dailyNewTarget", e.target.value)}
        />
        <p id="settings-new-target-hint" className={styles.hint}>
          {t("newTargetHint", { min: newMin, max: newMax })}
        </p>
      </div>
      <fieldset className={styles.fieldset} aria-describedby="settings-trans-hint">
        <legend className={styles.label}>{t("transDefault")}</legend>
        <div className={styles.radios}>
          {TRANS.map((v) => (
            <span key={v} className={styles.radio}>
              <input
                id={`settings-trans-${v}`}
                type="radio"
                name="transDefault"
                value={v}
                checked={values.transDefault === v}
                onChange={() => edit("transDefault", v)}
              />
              <label htmlFor={`settings-trans-${v}`}>{t(`trans_${v}`)}</label>
            </span>
          ))}
        </div>
        <p id="settings-trans-hint" className={styles.hint}>
          {t("transHint")}
        </p>
      </fieldset>
      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary}>
          {t("save")}
        </button>
        <p role="status" className={styles.status}>
          {status}
        </p>
      </div>
    </form>
  );
}

export function SettingsForm(): React.ReactElement {
  const t = useTranslations("Settings");
  const { record, loaded, setSetting } = useLearningRecord();

  return (
    <main className={styles.page} data-settings="">
      <h1 className={styles.title}>{t("title")}</h1>

      <h2 className={styles.h2}>{t("studyTitle")}</h2>
      {loaded ? (
        <Fields initial={formValuesOf(record)} record={record} set={setSetting} />
      ) : (
        <div className={styles.pending} data-pending="" aria-busy="true">
          <span className="sr-only">{t("loading")}</span>
        </div>
      )}
      <p className={styles.hint} data-sync-note="">
        {t("syncNote")}
      </p>

      <h2 className={styles.h2}>{t("languageTitle")}</h2>
      <div className={styles.section}>
        <LocaleSwitcherLinks />
      </div>

      <h2 className={styles.h2}>{t("senseiTitle")}</h2>
      <div className={styles.section}>
        <p className={styles.hint}>{t("senseiLead")}</p>
        <p className={styles.sectionLink}>
          <Link href="/sensei" className={styles.link}>
            {t("senseiLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
