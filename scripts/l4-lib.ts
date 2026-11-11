// Track L step L4-b / L4-c (docs/phase5/PLAN_hosting_migration.md §3) — READ-ONLY field collector.
// The same sources and field recognition as scripts/lang-leak-scan.ts (L2), returned as groups
// {source, file, path of each language member, tag, ja / zh / en values} so the L4 proposal scripts can read a
// zh / en field next to its siblings. Writes nothing.
// Run: imported by scripts/l4-jpword-scan.ts and scripts/l4-hooks.ts (node ≥ 23 native type stripping).

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type Lang = "ja" | "zh" | "en";
export type Tag = "content" | "derived" | "ja-only";
export type Member = { path: string; value: unknown; scan: boolean; file?: string };
export type Group = { source: string; file: string; pattern: string; tag: Tag; members: Partial<Record<Lang, Member>> };

export const ROOT = path.resolve(import.meta.dirname, "..");
const LANG_OF: Record<string, Lang> = { jp: "ja", ja: "ja", zh: "zh", en: "en" };
const SUFFIX = /^(.*)_(jp|ja|zh|en)$/;
const SKIP_KEYS = new Set(["lang_status"]);
/** v1 compat fields (as L2): derived from the new fields by the merge, never edited directly. */
const DERIVED = /(^|\.)(terms\[\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))(\[\])?$/;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
export const pat = (p: string): string => p.replace(/\[\d+\]/g, "[]").replace(/\.\d{4}[a-z0-9]+-q\d+/g, ".<qid>").replace(/\.[アイウエ](?=\.|$)/g, ".<ch>");
const join = (at: string, k: string): string => (at ? `${at}.${k}` : k);
export const readJson = (f: string): any => JSON.parse(readFileSync(path.join(ROOT, f), "utf-8"));

export function collect(): Group[] {
  const groups: Group[] = [];
  const addGroup = (source: string, file: string, base: string, tag: Tag | null, members: Partial<Record<Lang, Member>>): void => {
    const p = pat(base);
    const only = Object.keys(members).length === 1 && members.ja;
    const t: Tag = tag ?? (DERIVED.test(p) ? "derived" : only ? "ja-only" : "content");
    groups.push({ source, file, pattern: p, tag: t, members });
  };
  const walk = (source: string, file: string, v: unknown, at: string): void => {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(source, file, x, `${at}[${i}]`));
    if (!isObj(v)) return;
    const used = new Set<string>();
    const labelKeys = Object.keys(v).filter((k) => LANG_OF[k] && (typeof v[k] === "string" || v[k] === undefined));
    if (labelKeys.some((k) => LANG_OF[k] !== "ja") || (labelKeys.length > 0 && ("zh" in v || "en" in v))) {
      const m: Partial<Record<Lang, Member>> = {};
      for (const k of labelKeys) {
        m[LANG_OF[k]] = { path: join(at, k), value: v[k], scan: true };
        used.add(k);
      }
      addGroup(source, file, at, null, m);
    }
    const bases = new Map<string, Partial<Record<Lang, string>>>();
    for (const k of Object.keys(v)) {
      const s = SUFFIX.exec(k);
      if (!s || SKIP_KEYS.has(k)) continue;
      const b = bases.get(s[1]) ?? {};
      b[LANG_OF[s[2]]] = k;
      bases.set(s[1], b);
    }
    for (const [b, keys] of bases) {
      if (!keys.ja && (keys.zh || keys.en) && b in v) keys.ja = b;
      const vals = Object.values(keys) as string[];
      if (vals.some((k) => isObj(v[k]))) continue;
      vals.forEach((k) => used.add(k));
      const arr = vals.some((k) => Array.isArray(v[k]));
      if (!arr) {
        const m: Partial<Record<Lang, Member>> = {};
        for (const [l, k] of Object.entries(keys) as [Lang, string][]) m[l] = { path: join(at, k), value: v[k], scan: true };
        addGroup(source, file, join(at, b), null, m);
      } else {
        const n = Math.max(...vals.map((k) => (Array.isArray(v[k]) ? (v[k] as unknown[]).length : 0)));
        for (let i = 0; i < n; i++) {
          const m: Partial<Record<Lang, Member>> = {};
          for (const [l, k] of Object.entries(keys) as [Lang, string][]) {
            const a = v[k];
            m[l] = { path: `${join(at, k)}[${i}]`, value: Array.isArray(a) ? a[i] : undefined, scan: true };
          }
          addGroup(source, file, `${join(at, b)}[${i}]`, null, m);
        }
      }
    }
    for (const [k, x] of Object.entries(v)) if (!used.has(k) && !SKIP_KEYS.has(k)) walk(source, file, x, join(at, k));
  };

  const UNITS_DIR = "data/ip/textbook/units";
  for (const f of readdirSync(path.join(ROOT, UNITS_DIR)).filter((x) => x.endsWith(".json")).sort())
    walk("textbook-units", `${UNITS_DIR}/${f}`, readJson(`${UNITS_DIR}/${f}`), "");
  walk("textbook-index", "data/ip/textbook/unit_index.json", readJson("data/ip/textbook/unit_index.json"), "");

  const QFILE = "data/ip/quiz/questions.json";
  const questions = new Map<string, any>();
  for (const q of readJson(QFILE).questions as any[]) questions.set(q.id, q);

  const TR_DIR = "data/ip/quiz/translations";
  for (const f of readdirSync(path.join(ROOT, TR_DIR)).filter((x) => x.endsWith(".json")).sort()) {
    const file = `${TR_DIR}/${f}`;
    const tr = readJson(file);
    for (const [qid, e] of Object.entries(tr.questions as Record<string, any>)) {
      const q = questions.get(qid);
      const at = `questions.${qid}`;
      const ja: Member =
        typeof e.stem_jp_clean === "string" ? { path: `${at}.stem_jp_clean`, value: e.stem_jp_clean, scan: true } : { path: `${QFILE}#${qid}.stem_jp`, value: q?.stem_jp, scan: false };
      addGroup("quiz-translations", file, `${at}.stem`, "content", { ja, zh: { path: `${at}.stem.zh`, value: e.stem?.zh, scan: true }, en: { path: `${at}.stem.en`, value: e.stem?.en, scan: true } });
      for (const [c, x] of Object.entries((e.choices ?? {}) as Record<string, any>))
        addGroup("quiz-translations", file, `${at}.choices.${c}`, "content", {
          ja: { path: `${QFILE}#${qid}.choices_jp.${c}`, value: q?.choices_jp?.[c], scan: false },
          zh: { path: `${at}.choices.${c}.zh`, value: x?.zh, scan: true },
          en: { path: `${at}.choices.${c}.en`, value: x?.en, scan: true },
        });
    }
  }

  const EX_DIR = "data/ip/quiz/explanations";
  for (const f of readdirSync(path.join(ROOT, EX_DIR)).filter((x) => x.endsWith(".json")).sort()) walk("quiz-explanations", `${EX_DIR}/${f}`, readJson(`${EX_DIR}/${f}`).questions, "questions");

  const MSG: Record<Lang, any> = { ja: readJson("apps/web/messages/ja.json"), zh: readJson("apps/web/messages/zh.json"), en: readJson("apps/web/messages/en.json") };
  const leaves = new Map<string, Partial<Record<Lang, unknown>>>();
  const flat = (l: Lang, v: unknown, at: string): void => {
    if (isObj(v)) for (const [k, x] of Object.entries(v)) flat(l, x, join(at, k));
    else if (Array.isArray(v)) v.forEach((x, i) => flat(l, x, `${at}[${i}]`));
    else {
      const e = leaves.get(at) ?? {};
      e[l] = v;
      leaves.set(at, e);
    }
  };
  for (const l of ["ja", "zh", "en"] as Lang[]) flat(l, MSG[l], "");
  for (const [k, e] of leaves) {
    const m: Partial<Record<Lang, Member>> = {};
    for (const l of ["ja", "zh", "en"] as Lang[]) m[l] = { path: k, value: e[l], scan: true, file: `apps/web/messages/${l}.json` };
    addGroup("ui-messages", "apps/web/messages/{ja,zh,en}.json", k, "content", m);
  }
  return groups;
}

/** Text with every [[jp:…]] replaced by spaces of the same length (indices kept). */
export const maskJp = (s: string): string => s.replace(/\[\[jp:(.+?)\]\]/g, (m) => " ".repeat(m.length));
