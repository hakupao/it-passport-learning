#!/usr/bin/env node
// Stage 7 Phase 3 batch B6 — the zh term table data/ip/textbook/zh_terms.json and its checks.
//
// Run (exactly one mode):
//   node scripts/textbook-v2-zh-terms.mjs --conflicts            v1 term_zh conflicts over all units (markdown)
//   node scripts/textbook-v2-zh-terms.mjs --seed [--out <file>]  write the seed table (default <data-root>/textbook/zh_terms.json)
//        only when absent or identical: once committed the table is hand-maintained (a different file → exit 1)
//   node scripts/textbook-v2-zh-terms.mjs --check-units [--unit <id> …]
//        the WARN check (lib zhTermWarnings) over the committed v2 units (default all of them); run it after any
//        table change — hits on already-published units go through the B3 patch procedure. Exit 1 when any hit.
//   node scripts/textbook-v2-zh-terms.mjs --probe-v1 [--top <n>]
//        the check's noise on v1 prose: every v1 unit's definition / explanation jp↔zh pairs → share of pairs with
//        a warning + the most frequent (term → zh) hits (B6 review: before / after rates in the B6 evidence)
//   [--data-root <dir>]
//
// Table: { schema, note,
//          terms:    { jp: zh }                       global (v1 term_zh of conflict-free headwords + pilot words),
//          per_unit: { jp: { unit_id: zh } }          the zh for that unit only (homographs, context-specific words),
//          excluded: { jp: reason } }                 never checked (known v1 mistranslations, OQ-15) }
// Seed (S135 D-201 plan B6): headword → its v1 term_zh when every unit agrees; the 4 known conflicts resolved as
// CONFLICT_RULES (a new conflict stops the seed: it needs a decision); PILOT_WORDS = the jp → zh pairs the S135
// pilot localisation settled on ([[jp:…]] glosses in management-10-27-u01〜u03), added where they are not headwords
// (a headword keeps its v1 term_zh: term_zh = v1 is a v2 invariant).
// The localiser and translation reviewer read only the unit's entries (prep writes <planning>/<id>/zh_terms.unit.json
// with lib zhTermsForUnit, the same matcher as the check); this table stays the single source for the checks; validate / merge print its WARN lines, never as issues (D-199,
// --write unaffected).
// Exit: 0 = ok, 1 = refused / hits (--check-units), 2 = usage error.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { dataPaths, jsonText, parseArgs, readJson, UNIT_ID_RE, zhTermWarnings } from "./lib/textbook-v2.mjs";

const V2_SCHEMA = "textbook-unit-v2";
export const TABLE_SCHEMA = "textbook-zh-terms-1";

/** How each known v1 term_zh conflict is seeded. */
export const CONFLICT_RULES = {
  MBO: { kind: "per_unit", why: "homograph: 目标管理 (management by objectives) vs 管理层收购 (management buyout)" },
  "E-R図": { kind: "unify", zh: "E-R图", why: "spelling only (E-R 图 / E-R图（实体-关联图）)" },
  デュアルシステム: { kind: "excluded", why: "OQ-15: v1 term_zh swapped with デュプレックスシステム across technology-16-43-u02 / technology-16-44-u03 (v1 mistranslation; term_zh = v1 invariant)" },
  デュプレックスシステム: { kind: "excluded", why: "OQ-15: v1 term_zh swapped with デュアルシステム across technology-16-43-u02 / technology-16-44-u03 (v1 mistranslation; term_zh = v1 invariant)" },
};

/**
 * Per-entry decisions over the v1 term_zh (B6 review F2). The headword's own term_zh is unchanged (v2 invariant);
 * the table value only widens what the zh text may use.
 *   パスワード: v1 term_zh 口令 (technology-23-63-u08), but the v1 body text with パスワード uses 密码 42× / 口令 13×
 *   and mainland everyday usage is 密码 (口令 is the GB/T security-standard word) → both accepted.
 *   最適化: v1 term_zh 最优化; the v1 body text uses 优化 in all 32 pairs that say 最適化 (最优化 6) → both.
 *   アンケート: v1 term_zh 问卷调查; the v1 body uses 问卷 in 26 / 26 pairs (问卷调查 9) → both.
 *   Left as advisory residue (both readings natural, no override): PC (电脑 18 / PC kept 32 of 45 pairs),
 *   SNS (社交媒体 11 / 社交网络 7 / SNS kept 16 of 30).
 *   生体認証 (S137, b02 u10 Rule A O1; not a headword): the b02 body text uses 生物特征认证; u10 title_zh /
 *   unit_summary_zh are v1 (生物识别认证, not checked: ZH_SKIP) and stay as they are.
 */
export const OVERRIDES = { パスワード: "口令（密码）", 最適化: "最优化（优化）", アンケート: "问卷调查（问卷）", 生体認証: "生物特征认证" };

/** The S135 pilot's settled jp → zh pairs (from its zh [[jp:…]] glosses). */
export const PILOT_WORDS = {
  global: {
    プロジェクト憲章: "项目章程",
    定常業務: "日常业务",
    立上げ: "启动",
    プロジェクトマネジメント計画書: "项目管理计划书",
    プロジェクトマネージャ: "项目经理",
    変更管理: "变更管理",
    プロジェクトメンバー: "项目成员",
    プロジェクト人的資源マネジメント: "项目人力资源管理",
    ステークホルダ: "利益相关者",
    利害関係者: "利害关系者",
    リスク: "风险",
    プロジェクトコミュニケーションマネジメント: "项目沟通管理",
    プッシュ型: "推式",
    プル型: "拉式",
    相互型: "交互式",
    プロジェクトスコープマネジメント: "项目范围管理",
    成果物スコープ: "产品范围",
    プロジェクトスコープ: "项目范围",
    スコープ記述書: "范围说明书",
    スコープの変更: "范围变更",
    統合マネジメント: "整合管理",
    ワークパッケージ: "工作包",
    WBS辞書: "WBS词典",
    アローダイアグラム: "箭线图",
    結合点: "节点",
    クリティカルパス: "关键路径",
    ガントチャート: "甘特图",
    マイルストーン: "里程碑",
    進捗管理: "进度管理",
    プロジェクトリスクマネジメント: "项目风险管理",
    発生確率: "发生概率",
    影響度: "影响程度",
    プラスのリスク: "正面风险",
    リスクの対応策: "风险应对措施",
    リスク対応計画: "风险应对计划",
    リスク対応計画の実行: "风险应对计划的实施",
    回避: "规避",
    軽減: "减轻",
    受容: "接受",
    コンティンジェンシー予備: "应急储备",
    転嫁: "转移",
  },
  // risk-treatment alternative names (JIS Q 31000 wording): only in the risk unit — elsewhere 保有 / 移転 / 低減
  // usually mean holding / relocation / reduction in general
  per_unit: {
    低減: { "management-10-27-u03": "降低" },
    移転: { "management-10-27-u03": "移转" },
    保有: { "management-10-27-u03": "保留" },
  },
};

/** jp headword → [{unit_id, term_zh, term_en}] for every headword whose term_zh differs between units. */
export function termZhConflicts(units) {
  const by = new Map();
  for (const u of units) for (const t of u.terms) (by.get(t.term) ?? by.set(t.term, []).get(t.term)).push({ unit_id: u.unit_id, term_zh: t.term_zh, term_en: t.term_en });
  const out = {};
  for (const [jp, rows] of by) if (new Set(rows.map((r) => r.term_zh)).size > 1) out[jp] = rows.sort((a, b) => (a.unit_id < b.unit_id ? -1 : 1));
  return out;
}

const sorted = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));

/** The seed table (deterministic). Throws on a conflict CONFLICT_RULES does not cover. */
export function seedTable(units) {
  const conflicts = termZhConflicts(units);
  const unknown = Object.keys(conflicts).filter((k) => !CONFLICT_RULES[k]);
  if (unknown.length > 0) throw new Error(`new term_zh conflict(s) without a rule: ${unknown.join(", ")}`);
  const terms = {};
  const per_unit = {};
  const excluded = {};
  const headwords = new Set();
  for (const u of units) {
    for (const t of u.terms) {
      headwords.add(t.term);
      if (!conflicts[t.term]) terms[t.term] = t.term_zh;
    }
  }
  for (const [jp, rule] of Object.entries(CONFLICT_RULES)) {
    if (!conflicts[jp]) continue;
    if (rule.kind === "unify") terms[jp] = rule.zh;
    else if (rule.kind === "per_unit") per_unit[jp] = Object.fromEntries(conflicts[jp].map((r) => [r.unit_id, r.term_zh]));
    else excluded[jp] = rule.why;
  }
  for (const [jp, zh] of Object.entries(PILOT_WORDS.global)) if (!headwords.has(jp)) terms[jp] = zh;
  for (const [jp, zh] of Object.entries(OVERRIDES)) terms[jp] = zh;
  for (const [jp, byUnit] of Object.entries(PILOT_WORDS.per_unit)) if (!headwords.has(jp)) per_unit[jp] = byUnit;
  return {
    schema: TABLE_SCHEMA,
    note: "zh terms for the v2 localiser (batch B6). Hand-maintained after the seed; after a change run textbook-v2-zh-terms.mjs --check-units (hits on published units → B3 patch). per_unit beats terms for its unit; excluded is never checked.",
    terms: sorted(terms),
    per_unit: sorted(per_unit),
    excluded: sorted(excluded),
  };
}

/** --probe-v1: {pairs, hit (pairs with ≥ 1 warning), warnings, top: [[label, n]]}. */
export function probeV1(units, table) {
  let pairs = 0;
  let hit = 0;
  const by = new Map();
  for (const u of units.filter((x) => x.schema_version !== V2_SCHEMA)) {
    const probe = { unit_id: u.unit_id, terms: u.terms.map((t) => ({ term: t.term, one_jp: t.definition_jp, one_zh: t.definition_zh, detail_jp: t.explanation_jp, detail_zh: t.explanation_zh })) };
    const w = zhTermWarnings(probe, table);
    pairs += probe.terms.length * 2;
    hit += new Set(w.map((x) => x.field)).size;
    for (const x of w) by.set(x.term, (by.get(x.term) ?? 0) + 1);
  }
  const map = new Map(Object.entries(table.terms ?? {}));
  const top = [...by].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([k, n]) => [`${k} → ${map.get(k) ?? "(per unit)"}`, n]);
  return { pairs, hit, warnings: [...by.values()].reduce((a, b) => a + b, 0), top };
}

export function conflictsMarkdown(conflicts) {
  const lines = ["| 用語 | 単元 | v1 term_zh | term_en | 処置 |", "|---|---|---|---|---|"];
  for (const [jp, rows] of Object.entries(conflicts)) {
    const r = CONFLICT_RULES[jp];
    const act = !r ? "（未定）" : r.kind === "unify" ? `統一 → ${r.zh}（${r.why}）` : r.kind === "per_unit" ? `単元別（${r.why}）` : `除外（${r.why}）`;
    rows.forEach((x, i) => lines.push(`| ${i === 0 ? jp : ""} | ${x.unit_id} | ${x.term_zh} | ${x.term_en} | ${i === 0 ? act : ""} |`));
  }
  return `${lines.join("\n")}\n`;
}

const allUnits = (P) => readJson(P.index).topics.flatMap((t) => t.units.map((u) => readJson(P.unit(u.unit_id))));

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let opt;
  try {
    opt = parseArgs(process.argv.slice(2), { conflicts: "bool", seed: "bool", "check-units": "bool", "probe-v1": "bool", top: "string", unit: "list", out: "string", "data-root": "string" });
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(2);
  }
  const modes = ["conflicts", "seed", "check-units", "probe-v1"].filter((k) => opt[k]);
  if (modes.length !== 1 || (opt.unit && !opt["check-units"])) {
    console.error("usage: textbook-v2-zh-terms.mjs (--conflicts | --seed [--out <file>] | --check-units [--unit <id> …] | --probe-v1 [--top <n>]) [--data-root <dir>]");
    process.exit(2);
  }
  const P = dataPaths(opt["data-root"]);
  const units = allUnits(P);
  if (opt["probe-v1"]) {
    const r = probeV1(units, readJson(P.zhTerms));
    console.log(`v1 definition / explanation pairs ${r.pairs}: ${r.hit} with a warning (${((100 * r.hit) / r.pairs).toFixed(1)}%), ${r.warnings} warning(s)`);
    for (const [k, n] of r.top.slice(0, Number(opt.top ?? 15))) console.log(`  ${n}  ${k}`);
  } else if (opt.conflicts) {
    process.stdout.write(conflictsMarkdown(termZhConflicts(units)));
  } else if (opt.seed) {
    const out = path.resolve(opt.out ?? P.zhTerms);
    const text = jsonText(seedTable(units));
    if (existsSync(out)) {
      if (readFileSync(out, "utf-8") !== text) {
        console.error(`✗ ${out} exists and differs from the seed — the table is hand-maintained; not overwritten`);
        process.exit(1);
      }
      console.log(`= ${out} (seed, unchanged)`);
    } else {
      writeFileSync(out, text);
      console.log(`✓ ${out}`);
    }
  } else {
    const table = readJson(P.zhTerms);
    const v2 = units.filter((u) => u.schema_version === V2_SCHEMA);
    for (const id of opt.unit ?? []) {
      if (!UNIT_ID_RE.test(id) || !v2.some((u) => u.unit_id === id)) {
        console.error(`✗ ${id}: not a committed v2 unit`);
        process.exit(2);
      }
    }
    const pick = opt.unit ? v2.filter((u) => opt.unit.includes(u.unit_id)) : v2;
    let hits = 0;
    for (const u of pick) {
      const w = zhTermWarnings(u, table);
      hits += w.length;
      console.log(`${w.length === 0 ? "✓" : "!"} ${u.unit_id}: ${w.length} zh-term warning(s)`);
      for (const x of w) console.log(`  warn  ${x.code}  ${x.field}  ${x.message}`);
    }
    process.exit(hits === 0 ? 0 : 1);
  }
}
