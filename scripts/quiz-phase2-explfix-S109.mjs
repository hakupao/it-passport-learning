#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 batch S109 — explanation-sidecar repair + key_guard resolution
// for 2015h27h. All fixes adjudicated by 主 context against source pages 07/20/21/24/25/34/35/40.
// All key-invariant (no correct_answer moves).
//
// Layer 1a STRIP_CAVEATS (anchor → end): stale OCR caveats that describe corruption the user
//   no longer sees after stemfix/trfix-S109.
//     q051 correct.{jp,zh,en} — 「なおアの文中の「05」は OCR による誤読」 (choice now reads OS).
//     q064 distractor イ .{jp,zh,en} — 「「確率を下げない」は原典「確率を下げる」が崩れたもの」
//       (choice now reads 「下げていく」; note the generator's guess 「下げる」 was itself off).
//
// Layer 1b REPLACE: explanation prose that QUOTES a choice whose text changed.
//     q017 correct.{jp,zh,en} — quoted ア with the generator's WRONG reconstruction
//       「他社商品との…低価格競争」; source page-07 reads 「他社商品が追随して…低価格化競争」.
//     q062 distractors ア/エ .jp — quoted the choices that lost 「集合の」. zh/en already
//       render these as "complement/补集", which stays correct → no zh/en row.
//
// Layer 1c SET (full-field rewrite): q062 correct.{jp,zh,en}.
//   The generator wrote the correct-answer explanation against the CORRUPTED choice ウ
//   (「(A∩B) は B の部分集合」) and argued A∩B ⊆ B. Source page-24 reads
//   「（A∩B）は，（A∪B）の部分集合である」 → the body must argue A∩B ⊆ A∪B instead. Both
//   statements are true, which is exactly why no key-guard or reviewer signal ever fired.
//   points_jp already states 「常に A∩B ⊆ A ⊆ A∪B かつ A∩B ⊆ B ⊆ A∪B」 → unchanged.
//   (This rewrite is authored in 主 context and verified INDEPENDENTLY by the Rule A critic
//    and the s7x fidelity pass — Rule D writer≠reviewer is preserved.)
//
// Layer 2 resolves each generate_result key_guard to post-fix reality. NOTE: q087 and q092
//   keep figure_derivable=false (and therefore stay SUSPECT) because their 中問 preamble /
//   図1 linkage-gap is NOT fixed by any text edit — only their OCR flags are cleared.
//
// Idempotent. Run: node scripts/quiz-phase2-explfix-S109.mjs
//   (then: node scripts/quiz-phase2-verify-result.mjs 2015h27h && node scripts/quiz-phase2-merge.mjs 2015h27h)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2015h27h";

const dJp = (L) => (d) => [d.distractors_jp.find((x) => x.letter === L), "why_wrong_jp"];
const dTr = (L, lang) => (d) => [d.distractors.find((x) => x.letter === L), lang];

// ---- Layer 1a: strip stale OCR caveat (anchor → end, trim trailing whitespace) ------
const STRIP_CAVEATS = [
  { file: `expl_jp_${E}-q051.json`, locate: (d) => [d, "correct_jp"], anchor: "なおアの文中の" },
  { file: `expl_tr_${E}-q051.json`, locate: (d) => [d.correct, "zh"], anchor: "另外，ア 的原文中的" },
  { file: `expl_tr_${E}-q051.json`, locate: (d) => [d.correct, "en"], anchor: "Note that “05”" },
  { file: `expl_jp_${E}-q064.json`, locate: dJp("イ"), anchor: "加えて、この選択肢の" },
  { file: `expl_tr_${E}-q064.json`, locate: dTr("イ", "zh"), anchor: "另外，本选项中" },
  { file: `expl_tr_${E}-q064.json`, locate: dTr("イ", "en"), anchor: "In addition, the wording" },
];

// ---- Layer 1b: substring replacement (assert exactly once, idempotent) --------------
const REPLACE = [
  {
    file: `expl_jp_${E}-q017.json`, locate: (d) => [d, "correct_jp"],
    from: "アは「他社商品との機能の差別化が失われ、最終的に低価格競争に陥ってしまった」という",
    to: "アは「他社商品が追随して機能の差別化が失われ、最終的に低価格化競争に陥ってしまった」という",
  },
  {
    file: `expl_tr_${E}-q017.json`, locate: (d) => [d.correct, "zh"],
    from: "「与其他公司商品之间的功能差异化丧失，最终陷入了低价竞争」",
    to: "「其他公司商品纷纷跟进，功能差异化丧失，最终陷入了低价竞争」",
  },
  {
    file: `expl_tr_${E}-q017.json`, locate: (d) => [d.correct, "en"],
    from: "「the functional differentiation from other companies' products was lost, ultimately leading to a low-price competition」",
    to: "「other companies' products followed suit and the functional differentiation was lost, ultimately leading to a low-price competition」",
  },
  {
    file: `expl_jp_${E}-q062.json`, locate: dJp("ア"),
    from: "「(A∪B) は (A∩B) でない部分集合である」は誤りです",
    to: "「(A∪B) は (A∩B) でない集合の部分集合である」は誤りです",
  },
  {
    file: `expl_jp_${E}-q062.json`, locate: dJp("エ"),
    from: "「(A∩B) は A でない部分集合である」は誤りです",
    to: "「(A∩B) は A でない集合の部分集合である」は誤りです",
  },
];

// ---- Layer 1c: full-field rewrite (q062 correct — argued the wrong true statement) --
const Q062_JP = "正解はウ。積集合 A∩B は「A にも B にも属する要素」だけを集めたもの、和集合 A∪B は「A と B の少なくとも一方に属する要素」を集めたものです。A∩B の要素をどれか一つとると、それは定義から A にも B にも属しているので、「少なくとも一方に属する」という条件も当然に満たし、A∪B に属します。したがって A∩B のすべての要素が A∪B の要素であり、A∩B ⊆ A∪B が常に成立します。これは A と B がどんな集合であっても、たとえ A∩B が空集合であっても（空集合はどんな集合の部分集合でもある）成り立ちます。ベン図で見ると、A の円と B の円が重なった部分は、必ず二つの円を合わせた領域の内側に収まっていることから直感的に確認できます。同じ理由で A∩B ⊆ A、A∩B ⊆ B も常に成立します。";
const Q062_ZH = "正确答案是ウ。交集 A∩B 只收集「既属于 A 又属于 B 的元素」，并集 A∪B 收集「至少属于 A、B 之一的元素」。任取 A∩B 中的一个元素，按定义它既属于 A 也属于 B，因此当然满足「至少属于其中之一」这个条件，从而属于 A∪B。所以 A∩B 的所有元素都是 A∪B 的元素，即 A∩B ⊆ A∪B 恒成立。无论 A 和 B 是什么集合，甚至当 A∩B 为空集时（空集是任何集合的子集）也同样成立。从维恩图看，A 圆与 B 圆重叠的部分必定落在两个圆合并而成的区域内部，可以直观地确认这一点。同理，A∩B ⊆ A 和 A∩B ⊆ B 也恒成立。";
const Q062_EN = "The answer is ウ. The intersection A∩B collects only 「elements that belong to both A and B」, while the union A∪B collects 「elements that belong to at least one of A and B」. Take any element of A∩B: by definition it belongs to both A and B, so it certainly satisfies the condition of belonging to at least one of them, and therefore belongs to A∪B. Hence every element of A∩B is an element of A∪B, that is, A∩B ⊆ A∪B always holds. This is true no matter what sets A and B are, and even when A∩B is the empty set (the empty set is a subset of every set). In a Venn diagram, the overlapping part of circle A and circle B always lies inside the region formed by combining the two circles, which confirms it intuitively. For the same reason A∩B ⊆ A and A∩B ⊆ B also always hold.";

const SET_FIELDS = [
  { file: `expl_jp_${E}-q062.json`, locate: (d) => [d, "correct_jp"], value: Q062_JP, mustContain: "A∩B ⊆ A∪B" },
  { file: `expl_tr_${E}-q062.json`, locate: (d) => [d.correct, "zh"], value: Q062_ZH, mustContain: "A∩B ⊆ A∪B" },
  { file: `expl_tr_${E}-q062.json`, locate: (d) => [d.correct, "en"], value: Q062_EN, mustContain: "A∩B ⊆ A∪B" },
];

let changed = 0;
const byFile = new Map();
const load = (f) => {
  if (!byFile.has(f)) byFile.set(f, JSON.parse(readFileSync(P2(f), "utf-8")));
  return byFile.get(f);
};

for (const f of STRIP_CAVEATS) {
  const [obj, key] = f.locate(load(f.file));
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.file}: locate failed`);
  const cur = obj[key];
  const idx = cur.indexOf(f.anchor);
  if (idx === -1) { console.log(`  ~ ${f.file} ${key}: caveat already stripped, skip`); continue; }
  const stripped = cur.slice(0, idx).replace(/\s+$/, "");
  if (!stripped) throw new Error(`${f.file} ${key}: strip would empty the field — aborting`);
  obj[key] = stripped;
  changed++;
  console.log(`  ✓ ${f.file} ${key}: stripped stale OCR caveat`);
}

for (const f of REPLACE) {
  const [obj, key] = f.locate(load(f.file));
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.file}: locate failed`);
  const cur = obj[key];
  if (cur.includes(f.to) && !cur.includes(f.from)) { console.log(`  ~ ${f.file} ${key}: already replaced, skip`); continue; }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.file} ${key}: expected exactly 1 occurrence of the quoted text but found ${n} — aborting`);
  obj[key] = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.file} ${key}: re-quoted the corrected choice text`);
}

for (const f of SET_FIELDS) {
  const [obj, key] = f.locate(load(f.file));
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.file}: locate failed`);
  if (obj[key] === f.value) { console.log(`  ~ ${f.file} ${key}: already rewritten, skip`); continue; }
  if (!f.value.includes(f.mustContain)) throw new Error(`${f.file} ${key}: replacement lost "${f.mustContain}" — aborting`);
  obj[key] = f.value;
  changed++;
  console.log(`  ✓ ${f.file} ${key}: rewrote correct-answer body (A∩B ⊆ A∪B)`);
}

for (const [file, doc] of byFile) writeFileSync(P2(file), JSON.stringify(doc, null, 2) + "\n");

// ---- Layer 2: resolve key_guard in generate_result ---------------------------------
const R = (derived, note, extra = {}) => ({
  figure_derivable: true, derived_answer: derived, matches_key: true, stem_corruption_suspected: false,
  note_jp: note, ...extra,
});

const RESOLVED = {
  [`${E}-q017`]: R("ア", "概念問 (コモディティ化)。stem 是正後 (S109: source page-07、choice ア「他社商品で」→「他社商品が追随して」+ 英単語 competition→競争、イ「の売上」復元、エ「変更が生じた」→「安売りした」) は表示クリーン。差別化の喪失→価格競争 の因果を述べるのはアのみ=key 一致。round-1 は ア の choice-OCR を捕捉し stem_corruption_suspected=true を立てた (推定文言「他社商品との」は源と不一致で、主 context 源実読が「が追随して」を確定)。イ/エ の腐敗は round-1 未検出 (どちらも文法的に成立する語句置換のため信号なし) で、源実読により捕捉・是正。全て是正済のため解決 = suspect=false。"),
  [`${E}-q051`]: R("ア", "概念問 (互換CPU)。stem 是正後 (S109: source page-20、正解肢アの字形 OCR「05」→「OS」) は表示クリーン。同一命令セット→オリジナル向け OS/アプリがそのまま動く=ア が key と一致。zh/en は既に OS と読めていたため翻訳側の是正なし。解説末尾の OCR 注記は strip 済。round-1 の choice-OCR flag は是正済のため解決 = suspect=false。"),
  [`${E}-q053`]: R("エ", "概念問 (リスク回避)。stem 是正後 (S109: source page-21、正解肢エ末尾の OCR junk「こう」strip) は表示クリーン。活動そのものを取りやめる=撤退=エ が key と一致。round-1 の choice-OCR flag は是正済のため解決 = suspect=false。"),
  [`${E}-q062`]: R("ウ", "概念問 (集合)。**round-1 は腐敗を検出できなかった (stem_corruption_suspected=false)**: 腐敗版の正解肢ウ「(A∩B) は B の部分集合である」も数学的に真であり、key とも矛盾しないため信号が生じなかった。主 context の source page-24 実読で源は「（A∩B）は，（A∪B）の部分集合である」と確定 → 正解肢ウ + 誤答肢ア/エ の「集合の」脱落を是正 (S109 stemfix/trfix)。解説 correct.{jp,zh,en} は A∩B ⊆ B を論じていたため A∩B ⊆ A∪B に書き換え (explfix-S109)。key ウ は不変。是正済のため解決 = suspect=false。"),
  [`${E}-q064`]: R("ウ", "概念問 (信頼性設計)。stem 是正後 (S109: source page-25、choice イ の否定反転「下げない」→「下げていく」+ ア/イ の「など」脱落復元) は表示クリーン。障害発生時も処理続行=フォールトトレランス=ウ が key と一致。イ の zh/en にも否定反転が伝播していたため trfix-S109 で是正、解説イの stale 腐敗注記は strip 済。round-1 の flag は是正済のため解決 = suspect=false。"),
  [`${E}-q086`]: R("イ", "表題 (主キー)。**表示上 answer-affecting だった腐敗**: 下線注記が イ=区画番号 / ウ=許可区分 / エ=社員番号,区画番号 と誤っており、腐敗版のままだと エ が真の複合キーに見え、正解肢 イ は単独キーに見えていた。主 context の source page-34 を 6 倍拡大で実読し ア=社員番号 / イ=社員番号+区画番号 / ウ=社員番号+許可区分 / エ=3列すべて を確定 → JP + zh/en を是正 (S109)。社員×区画の多対多を仲介する表の最小一意キーは {社員番号, 区画番号} = イ で公式キーと一致 (key 不変)。解説本文は元から正しい下線配置を前提に書かれていたため本文修正は不要。是正済のため解決 = suspect=false。"),
  [`${E}-q091`]: R("イ", "計算問 (アローダイアグラム)。stem 是正後 (S109: source page-40、Z 脱落・「(5)で」→「(5)が」・「とした場合…実施して」復元) は表示クリーン。最短45日、作業4は全経路が通るため回避必須 (5万)、作業2+作業3=30日は余裕0で両方回避必須 (15+15)、作業1は+5日でも25≤30 で回避不要 → 5+15+15=35万円=イ で key と一致。round-1 の flag は是正済のため解決 = suspect=false。図1 は page-38 の中問共有図で本問 figure に未添付 (linkage-gap) だが、本問は併読で導出可能・解説も表値を内包し自己完結。"),
};

// q087 / q092: OCR flag cleared, but the 中問 preamble / 図1 linkage-gap is NOT fixed by any
// text edit → figure_derivable stays false so merge keeps them SUSPECT (honest record).
const RESOLVED_GAP = {
  [`${E}-q087`]: {
    figure_derivable: false, derived_answer: "イ", matches_key: true, stem_corruption_suspected: false,
    note_jp: "中問A。stem 是正後 (S109: source page-35、正解肢イの a 欄を源文言「入退室区分の値を合計」に復元) は表示クリーンで、解説本文とも整合。入退室区分 (入室=1/退室=-1) の合計は「入室回数−退室回数」を表し、一致すれば0・不一致なら0以外 → イ が key と一致。**figure_derivable=false は維持**: 入退室区分の値の定義は中問A前書き〔入退室管理の概要〕(3) (page-32)、表構成は図1 (page-33) にあり、いずれも本問の配信データに未添付 (figure/scenario linkage-gap)。この gap はテキスト是正では解消せず別 track の backlog。",
  },
  [`${E}-q092`]: {
    figure_derivable: false, derived_answer: "ア", matches_key: true, stem_corruption_suspected: false,
    note_jp: "中問B。stem 是正後 (S109: source page-40、OCR d→B・〔Zプロジェクトの状況〕の Z 脱落×2・「うち」→「うちで」を JP clean/raw + zh/en で是正) は表示クリーン。要員を増やさず工期のみ半減する(1)だけが軽減要因のない計画内在リスク → ア が key と一致。**figure_derivable=false は維持**: 選択肢(1)〜(4)の中身である〔Zプロジェクトの状況〕前文 (page-37) が本問の配信 stem に未添付 (scenario linkage-gap) で、学習者には参照先が見えない。この gap はテキスト是正では解消せず別 track の backlog。",
  },
};

const grPath = P2(`generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
let grChanged = false;
for (const [id, kg] of Object.entries({ ...RESOLVED, ...RESOLVED_GAP })) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`generate_result_${E}: ${id} not found`);
  const wantSuspect = kg.figure_derivable === false || kg.matches_key === false;
  // Compare note_jp too: q062 was never flagged (already suspect=false / corruption=false),
  // so a flags-only check would silently skip writing its adjudication record.
  if (rec.key_guard?.stem_corruption_suspected === false && rec.key_guard?.figure_derivable === kg.figure_derivable && rec.suspect === wantSuspect && rec.key_guard?.note_jp === kg.note_jp) {
    console.log(`  ~ generate_result ${id} key_guard: already resolved, skip`);
    continue;
  }
  rec.key_guard = { ...kg };
  rec.key_guard_round1 = { ...kg };
  rec.suspect = wantSuspect;
  grChanged = true;
  changed++;
  console.log(`  ✓ generate_result ${id}: key_guard resolved (derived ${kg.derived_answer} / suspect ${wantSuspect})`);
}
if (grChanged) writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");

console.log(`✓ quiz-phase2-explfix-S109: ${changed} change(s) → re-run verify-result + merge (${E})`);
