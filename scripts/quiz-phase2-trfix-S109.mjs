#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S109 (D-137 / D-140) — drift-proof TRANSLATION
// SIDECAR fixes (2015h27h).
//
// Same contract as quiz-phase2-trfix-S102..S108.mjs. Every fix adjudicated by 主 context
// against the source page. Asserts `from` occurs EXACTLY ONCE in the field. correct_answer
// never touched.
//
//   q017 choices ア/イ/エ (source page-07): the JP corruption propagated into zh/en —
//         ア lost 「(他社商品)が追随して」, イ lost 「の売上」, エ read 「変更が生じた」 for
//         「安売りした」. All three are distractor-or-key TEXT fidelity, key ア unchanged.
//   q062 choice ウ (source page-24): 「Bの部分集合」→「(A∪B)の部分集合」 propagated to zh/en.
//         ア/エ zh/en already render 「…でない集合の部分集合」 as "subset of the complement",
//         so the JP-only 「集合の」 restoration needs no translation change.
//   q064 choice イ (source page-25): the negation flip 「下げない」 propagated to zh/en
//         (「概率不降低」/「Not lowering」). Restored to 「下げていく」 semantics.
//         choice ア's 「など」 restoration is a JP hedge that zh/en idiomatically drop → no change.
//   q086 choices イ/ウ/エ (source page-34): the wrong underline annotations propagated to
//         zh/en verbatim. ANSWER-AFFECTING as displayed → must be fixed in all three languages.
//   q087 choice イ: zh/en ALREADY read 「値を合計 / Sum the values」 (i.e. the source wording)
//         while JP had been paraphrased → JP-only fix in stemfix-S109, no trfix row.
//   q091 / q092 stems (source page-40): stem_jp_clean is the JP display authority; zh/en had
//         drifted with it (q091 「(5)中…以下情况」 for 「(5)が…原因になる」; q092 dropped the Z
//         of 〔Zプロジェクトの状況〕 in both languages, twice each).
//
// Run:  node scripts/quiz-phase2-trfix-S109.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR = (exam) => path.join(ROOT, `data/ip/quiz/translations/${exam}.json`);
const E = "2015h27h";

// {exam, id, field, from, to}. field = "stem_jp_clean" | "stem.zh" | "stem.en" | "choices.<letter>.zh|en"
const FIXES = [
  // ---- q091 stem: clean (JP display authority) + zh/en ----------------------------
  { exam: E, id: `${E}-q091`, field: "stem_jp_clean", from: "Aさんは,〔Zプロジェクトの状況〕の(5)で,開発", to: "Aさんは〔Zプロジェクトの状況〕の(5)が,開発" },
  { exam: E, id: `${E}-q091`, field: "stem_jp_clean", from: "可能性があるときに,回避策を実施し,図1", to: "可能性があるとした場合,回避策を実施して,図1" },
  { exam: E, id: `${E}-q091`, field: "stem.zh", from: "A 在〔Z 项目状况〕的 (5) 中，认为以下情况会成为开发进度延迟的原因", to: "A 认为〔Z 项目状况〕的 (5) 会成为开发进度延迟的原因" },
  { exam: E, id: `${E}-q091`, field: "stem.en", from: "In item (5) of [Project Z Status], A determined that the following situations could cause delays in the development schedule", to: "A determined that item (5) of [Project Z Status] could cause delays in the development schedule" },
  // ---- q092 stem: clean + zh/en (Z restored in both occurrences per language) ------
  { exam: E, id: `${E}-q092`, field: "stem_jp_clean", from: "Aさんは Bさんから，〔プロジェクトの状況〕の(5)以外", to: "AさんはBさんから，〔Zプロジェクトの状況〕の(5)以外" },
  { exam: E, id: `${E}-q092`, field: "stem_jp_clean", from: "〔プロジェクトの状況〕の(1)～(4)のうち，", to: "〔Zプロジェクトの状況〕の(1)～(4)のうちで，" },
  { exam: E, id: `${E}-q092`, field: "stem.zh", from: "除〔项目状况〕的 (5) 之外", to: "除〔Z 项目状况〕的 (5) 之外" },
  { exam: E, id: `${E}-q092`, field: "stem.zh", from: "在〔项目状况〕的 (1)～(4) 中", to: "在〔Z 项目状况〕的 (1)～(4) 中" },
  { exam: E, id: `${E}-q092`, field: "stem.en", from: "item (5) of [Project Status]", to: "item (5) of [Project Z Status]" },
  { exam: E, id: `${E}-q092`, field: "stem.en", from: "items (1) to (4) of [Project Status]", to: "items (1) to (4) of [Project Z Status]" },
  // ---- q017 choices ア/イ/エ -------------------------------------------------------
  { exam: E, id: `${E}-q017`, field: "choices.ア.zh", from: "与其他公司商品之间的功能差异化丧失", to: "其他公司商品纷纷跟进，功能差异化丧失" },
  { exam: E, id: `${E}-q017`, field: "choices.ア.en", from: "the functional differentiation from other companies' products was lost", to: "other companies' products followed suit and the functional differentiation was lost" },
  { exam: E, id: `${E}-q017`, field: "choices.イ.zh", from: "的商品被新商品抢走了市场", to: "的商品的销售额被新商品抢走了" },
  { exam: E, id: `${E}-q017`, field: "choices.イ.en", from: "had their market taken away by the new product", to: "had their sales taken away by the new product" },
  { exam: E, id: `${E}-q017`, field: "choices.エ.zh", from: "但由于从一开始就频繁发生变更", to: "但由于从一开始就频繁降价促销" },
  { exam: E, id: `${E}-q017`, field: "choices.エ.en", from: "frequent changes from the very beginning damaged", to: "frequent discounting from the very beginning damaged" },
  // ---- q062 choice ウ (correct choice) ---------------------------------------------
  { exam: E, id: `${E}-q062`, field: "choices.ウ.zh", from: "(A∩B)是B的子集。", to: "(A∩B)是(A∪B)的子集。" },
  { exam: E, id: `${E}-q062`, field: "choices.ウ.en", from: "(A∩B) is a subset of B.", to: "(A∩B) is a subset of (A∪B)." },
  // ---- q064 choice イ (negation flip) ----------------------------------------------
  { exam: E, id: `${E}-q064`, field: "choices.イ.zh", from: "使设备发生故障的概率不降低", to: "不断降低设备等发生故障的概率" },
  { exam: E, id: `${E}-q064`, field: "choices.イ.en", from: "Not lowering the probability of equipment failure", to: "Progressively lowering the probability of failure of equipment and the like" },
  // ---- q086 choices イ/ウ/エ (answer-affecting underline annotations) ---------------
  { exam: E, id: `${E}-q086`, field: "choices.イ.zh", from: "（下划线：区域编号）", to: "（下划线：员工编号, 区域编号）" },
  { exam: E, id: `${E}-q086`, field: "choices.イ.en", from: "(underline: Zone number)", to: "(underline: Employee number, Zone number)" },
  { exam: E, id: `${E}-q086`, field: "choices.ウ.zh", from: "（下划线：许可类别）", to: "（下划线：员工编号, 许可类别）" },
  { exam: E, id: `${E}-q086`, field: "choices.ウ.en", from: "(underline: Permission category)", to: "(underline: Employee number, Permission category)" },
  { exam: E, id: `${E}-q086`, field: "choices.エ.zh", from: "（下划线：员工编号, 区域编号）", to: "（下划线：员工编号, 区域编号, 许可类别）" },
  { exam: E, id: `${E}-q086`, field: "choices.エ.en", from: "(underline: Employee number, Zone number)", to: "(underline: Employee number, Zone number, Permission category)" },
];

function getField(entry, field) {
  if (field === "stem_jp_clean") return { obj: entry, key: "stem_jp_clean" };
  if (field === "stem.zh") return { obj: entry.stem, key: "zh" };
  if (field === "stem.en") return { obj: entry.stem, key: "en" };
  const m = field.match(/^choices\.(.+)\.(zh|en)$/);
  if (m) return { obj: entry.choices?.[m[1]], key: m[2] };
  throw new Error(`unknown field ${field}`);
}

const byExam = new Map();
for (const f of FIXES) {
  if (!byExam.has(f.exam)) byExam.set(f.exam, JSON.parse(readFileSync(TR(f.exam), "utf-8")));
}

let changed = 0;
for (const f of FIXES) {
  const doc = byExam.get(f.exam);
  const entry = doc.questions?.[f.id];
  if (!entry) throw new Error(`${f.id}: not in translations/${f.exam}.json`);
  const { obj, key } = getField(entry, f.field);
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.id} ${f.field}: field missing`);
  const cur = obj[key];
  if (cur.includes(f.to) && !cur.includes(f.from)) {
    console.log(`  ~ ${f.id} ${f.field}: already fixed, skip`);
    continue;
  }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${f.field}: expected exactly 1 occurrence of "${f.from}" but found ${n} — aborting`);
  obj[key] = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.id} ${f.field}`);
}

for (const [exam, doc] of byExam) writeFileSync(TR(exam), JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-phase2-trfix-S109: ${changed} field(s) applied`);
