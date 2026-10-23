// Stage 7 Phase 1 Task 12 (DESIGN §6.8) — the settings form's pure layer (no React; relative imports).
//
//   - formValuesOf: the record's settings (settingValue: stored or default) as form strings; no exam
//     date → "".
//   - planSettingsSave: form → the setSetting calls and the values the form shows after saving.
//     Numbers are rounded and clamped exactly as record.setSetting does (it is applied to a scratch
//     copy and read back), so the form can show the clamped value at once. Only keys whose value
//     changes are written: an untouched field never gets a new LWW stamp that would override a
//     change made on another device. An empty / non-numeric number field keeps the current value.
//     Exam date: a real YYYY-MM-DD is written; "" (or a non-date) writes nothing — the record has
//     no "unset" (setSetting cannot remove a key), so a stored date is kept and `examDateKept` asks
//     the form to say so.
//   - submitSettings: planSettingsSave + one setSetting call per write (the page's
//     useLearningRecord().setSetting).

import { isCalendarDate, setSetting, settingValue, type LearningRecord, type SettingKey, type SettingValue } from "../learning/record";

export type TransDefault = "hidden" | "shown";

export interface SettingsFormValues {
  /** YYYY-MM-DD or "" */
  examDate: string;
  /** raw input text */
  dailyReviewCap: string;
  /** raw input text */
  dailyNewTarget: string;
  transDefault: TransDefault;
}

export type SettingWrite = { [K in SettingKey]: [K, SettingValue<K>] }[SettingKey];

export interface SettingsSave {
  writes: SettingWrite[];
  /** what the form shows after saving (clamped numbers, the kept exam date) */
  values: SettingsFormValues;
  /** the exam date field was cleared but a date is stored: it is kept */
  examDateKept: boolean;
}

export type SetSetting = <K extends SettingKey>(key: K, value: SettingValue<K>) => void;

export function formValuesOf(r: LearningRecord): SettingsFormValues {
  return {
    examDate: settingValue(r, "examDate") ?? "",
    dailyReviewCap: String(settingValue(r, "dailyReviewCap")),
    dailyNewTarget: String(settingValue(r, "dailyNewTarget")),
    transDefault: settingValue(r, "transDefault"),
  };
}

type NumberKey = "dailyReviewCap" | "dailyNewTarget";

/** The value record.setSetting would store for `raw` (rounded, clamped); null when not a number. */
function normalizedNumber(r: LearningRecord, key: NumberKey, raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return settingValue(setSetting(r, key, n, 0), key);
}

export function planSettingsSave(form: SettingsFormValues, r: LearningRecord): SettingsSave {
  const writes: SettingWrite[] = [];
  const current = formValuesOf(r);
  const values: SettingsFormValues = { ...current };

  const storedDate = settingValue(r, "examDate");
  const date = form.examDate.trim();
  let examDateKept = false;
  if (date !== "" && isCalendarDate(date)) {
    if (date !== storedDate) writes.push(["examDate", date]);
    values.examDate = date;
  } else if (storedDate !== undefined) {
    examDateKept = true;
  }

  for (const key of ["dailyReviewCap", "dailyNewTarget"] as const) {
    const n = normalizedNumber(r, key, form[key]);
    if (n === null) continue;
    if (n !== settingValue(r, key)) writes.push([key, n]);
    values[key] = String(n);
  }

  if (form.transDefault !== settingValue(r, "transDefault")) writes.push(["transDefault", form.transDefault]);
  values.transDefault = form.transDefault;

  return { writes, values, examDateKept };
}

export function submitSettings(form: SettingsFormValues, r: LearningRecord, set: SetSetting): SettingsSave {
  const plan = planSettingsSave(form, r);
  for (const [key, value] of plan.writes) (set as (k: SettingKey, v: unknown) => void)(key, value);
  return plan;
}
