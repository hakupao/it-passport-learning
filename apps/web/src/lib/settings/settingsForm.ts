// Stage 7 Phase 1 Task 12 (DESIGN §6.8) — the settings form's pure layer (no React; relative imports).
//
//   - formValuesOf: the record's settings (settingValue: stored or default) as form strings; no exam
//     date → "".
//   - planSettingsSave(form, baseline, r): form → the setSetting calls and the values the form shows
//     after saving. `baseline` = the values the fields were last filled from (mount / resync / save).
//     A key is written only when the user changed it from the baseline (compared normalised: "30.2"
//     is still 30) AND it differs from the current record — so a field the user did not touch never
//     gets a new LWW stamp that would revert a newer value synced from another device (fix round 1
//     I-2); an untouched field shows the record's current value. Numbers are rounded and clamped
//     exactly as record.setSetting does (it is applied to a scratch copy and read back), so the form
//     can show the clamped value at once. An empty / non-numeric number field keeps the current value
//     and sets `numberKept` (the form says so). Exam date: a real YYYY-MM-DD is written; "" (or a
//     non-date) writes nothing — the record has no "unset" (setSetting cannot remove a key), so a
//     stored date is kept and `examDateKept` (the user cleared a date the field had) asks the form to
//     say so.
//   - resyncUntouched(values, baseline, fresh): after the record changed (another tab, the owner's
//     sync), fields still equal to their baseline take the record's new value; edited fields keep the
//     user's text.
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
  /** a number field was empty / not a number: its current value is kept */
  numberKept: boolean;
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
const KEYS = ["examDate", "dailyReviewCap", "dailyNewTarget", "transDefault"] as const satisfies readonly (keyof SettingsFormValues)[];

/** The value record.setSetting would store for `raw` (rounded, clamped); null when not a number. */
function normalizedNumber(r: LearningRecord, key: NumberKey, raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return settingValue(setSetting(r, key, n, 0), key);
}

export function planSettingsSave(form: SettingsFormValues, baseline: SettingsFormValues, r: LearningRecord): SettingsSave {
  const writes: SettingWrite[] = [];
  const values = formValuesOf(r); // untouched fields show the record's current value
  let examDateKept = false;
  let numberKept = false;

  const storedDate = settingValue(r, "examDate");
  const date = form.examDate.trim();
  if (date !== "" && isCalendarDate(date)) {
    if (date !== baseline.examDate.trim()) {
      if (date !== storedDate) writes.push(["examDate", date]);
      values.examDate = date;
    }
  } else if (baseline.examDate.trim() !== "" && storedDate !== undefined) {
    examDateKept = true; // the user cleared the date the field had
  }

  for (const key of ["dailyReviewCap", "dailyNewTarget"] as const) {
    const n = normalizedNumber(r, key, form[key]);
    if (n === null) {
      numberKept = true;
      continue;
    }
    if (n === normalizedNumber(r, key, baseline[key])) continue; // untouched
    if (n !== settingValue(r, key)) writes.push([key, n]);
    values[key] = String(n);
  }

  if (form.transDefault !== baseline.transDefault) {
    if (form.transDefault !== settingValue(r, "transDefault")) writes.push(["transDefault", form.transDefault]);
    values.transDefault = form.transDefault;
  }

  return { writes, values, examDateKept, numberKept };
}

export function resyncUntouched(
  values: SettingsFormValues,
  baseline: SettingsFormValues,
  fresh: SettingsFormValues,
): SettingsFormValues {
  const out = { ...values };
  for (const k of KEYS) if (values[k] === baseline[k]) (out as Record<string, string>)[k] = fresh[k];
  return out;
}

export function submitSettings(
  form: SettingsFormValues,
  baseline: SettingsFormValues,
  r: LearningRecord,
  set: SetSetting,
): SettingsSave {
  const plan = planSettingsSave(form, baseline, r);
  for (const [key, value] of plan.writes) (set as (k: SettingKey, v: unknown) => void)(key, value);
  return plan;
}
