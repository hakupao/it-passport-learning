#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 batch S109 — SECOND explanation-repair round for 2015h27h,
// driven by the Rule A independent audit (wf_135c3c19-6a3, N=36: accurate 33/36,
// severity {none 8, low 25, medium 2, high 1}, bad key 0/36, keyGuardMismatch 0).
// Evidence: evidence/phase5/stage_06_quiz_phase2/ruleA_result_S109_2015h27h.json
//
// All three are user-facing reasoning defects in distractor explanations. None moves a key.
//
//   q017 エ (medium) — MY MISS: the fidelity repair pass updated q017's other fields but left
//     distractors.エ quoting the PRE-fix OCR wording 「頻繁な変更」. The choice now reads
//     「当初から頻繁に安売りしたことによって」 (source page-07), so the explanation was arguing
//     from words no longer present in the choice. 3 languages.
//
//   q087 エ (high) — PRE-EXISTING generator logic error, missed by the in-pipeline reviewer:
//     with a=「レコードの個数を計数」and b=「偶数である」, the cited example (入室2回・退室0回,
//     count 2 = even) WOULD be output, so calling it 見逃し (a false negative) is backwards.
//     The genuine miss is an odd count, e.g. 入室2回・退室1回 → 3. Rewritten to use that
//     example and to state both failure directions correctly. 3 languages.
//
//   q089 ア (medium) — PRE-EXISTING logic error contradicting the SAME explanation's correct.jp
//     (which states node 4 is reached on day 35). 図1: 1→(準備5)→2, 2→(作業1 20)→4,
//     2→(作業2 15)→3, 3→(作業3 15)→4, 4→(作業4 10)→5. Node 4 earliest = 5+max(20,30) = 35,
//     so day 35 is exactly when 作業4 CAN start — not a point where it cannot. 3 languages.
//
// Idempotent (exact-value compare). Run: node scripts/quiz-phase2-explfix2-S109.mjs
//   (then: node scripts/quiz-phase2-merge.mjs 2015h27h)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2015h27h";

const SET = [
  // ---- q017 エ : re-anchor on the corrected choice wording -------------------------
  {
    id: `${E}-q017`, letter: "エ", lang: "jp",
    value: "当初から頻繁に安売りしたことによって高級ブランドのイメージが損なわれたというのは、ブランド戦略・ブランド管理の失敗 (ブランドイメージの毀損) の事例である。値引きを繰り返して自らブランド価値という差別化要素を壊した話であり、市場全体で機能差がなくなって価格競争に陥るコモディティ化とは別の概念である。",
  },
  {
    id: `${E}-q017`, letter: "エ", lang: "zh",
    value: "因一开始就频繁降价促销而损害了高端品牌形象，这是品牌战略、品牌管理失败（品牌形象受损）的事例。它讲的是企业靠反复降价自己破坏了品牌价值这一差异化要素，与整个市场上功能差异消失、陷入价格竞争的同质化是不同的概念。",
  },
  {
    id: `${E}-q017`, letter: "エ", lang: "en",
    value: "Damaging a high-end brand image by discounting frequently from the very beginning is an example of a failure of brand strategy and brand management (damage to the brand image). It is a story of a company destroying brand value — its own element of differentiation — through repeated price cuts, and it is a different concept from commoditization, where functional differences disappear across the market and price competition sets in.",
  },
  // ---- q087 エ : fix the inverted false-negative / false-positive reasoning ---------
  {
    id: `${E}-q087`, letter: "エ", lang: "jp",
    value: "レコードの個数を数えて得られるのは「入室回数 + 退室回数」であり、その内訳が入室何回・退室何回なのかは分からない。個数の偶奇では回数の一致・不一致を判定できない。例えば入室2回・退室1回は回数が一致していないのに個数は3で奇数となり、b=「偶数である」に該当しないため抽出されず見逃してしまう。逆に入室1回・退室1回という正常なケースは個数2で偶数となり、出力すべきでないのに大量に出力されてしまう。取りこぼしと誤出力の両方が起きる基準であり、目的に合わない。",
  },
  {
    id: `${E}-q087`, letter: "エ", lang: "zh",
    value: "数记录的个数所得到的是「进入次数 + 离开次数」，无从知道其中进入了几次、离开了几次。个数的奇偶无法判定次数是否一致。例如进入2次、离开1次时次数并不一致，但个数为3是奇数，不满足 b=「为偶数」，因而抽取不出来而被漏掉。反过来，进入1次、离开1次这类正常情况个数为2是偶数，本不该输出却会被大量输出。这个基准既会漏检又会误报，与目的不符。",
  },
  {
    id: `${E}-q087`, letter: "エ", lang: "en",
    value: "Counting the number of records gives you the number of entries plus the number of exits, and tells you nothing about how many of them were entries and how many were exits. Whether that count is even or odd cannot decide whether the two match. For example, 2 entries and 1 exit do not match, yet the count is 3, which is odd, so it fails b = 「is even」 and is missed. Conversely a normal case such as 1 entry and 1 exit gives a count of 2, which is even, so it would be output in large numbers even though it should not be. The criterion produces both misses and false outputs, so it does not serve the purpose.",
  },
  // ---- q089 ア : day 35 is when Task 4 CAN start ------------------------------------
  {
    id: `${E}-q089`, letter: "ア", lang: "jp",
    value: "35日は経路1→2→4→5（5+20+10）だけを数えた値です。結合点4には作業1経由なら5+20=25日で到達しますが、作業2→作業3の経路（5+15+15=35日）が終わるまで作業4は開始できません。したがって結合点4の最早時刻は35日目であり、35日は作業4を「開始できる」時点にすぎません。そこから作業4に10日かかるので、全体の完了は45日となります。",
  },
  {
    id: `${E}-q089`, letter: "ア", lang: "zh",
    value: "35天只数了路径1→2→4→5（5+20+10）。经作业1到达节点4 只需 5+20=25 天，但必须等作业2→作业3 这条路径（5+15+15=35 天）结束后，作业4 才能开始。因此节点4 的最早时刻是第35天，35天只是「可以开始作业4」的时点。从那里还需要作业4 的10天，整体完成为45天。",
  },
  {
    id: `${E}-q089`, letter: "ア", lang: "en",
    value: "35 days counts only the path 1→2→4→5 (5+20+10). Node 4 is reached in 5+20 = 25 days via Task 1, but Task 4 cannot start until the Task 2 → Task 3 path (5+15+15 = 35 days) has also finished, so the earliest time for node 4 is day 35. Day 35 is therefore merely the point at which Task 4 CAN start; Task 4 then needs 10 more days, so the whole project completes on day 45.",
  },
];

const docs = new Map();
const load = (f) => {
  if (!docs.has(f)) docs.set(f, JSON.parse(readFileSync(P2(f), "utf-8")));
  return docs.get(f);
};

let changed = 0;
const touched = new Set();

for (const s of SET) {
  const jp = s.lang === "jp";
  const file = jp ? `expl_jp_${s.id}.json` : `expl_tr_${s.id}.json`;
  const doc = load(file);
  const holder = jp
    ? doc.distractors_jp?.find((d) => d.letter === s.letter)
    : doc.distractors?.find((d) => d.letter === s.letter);
  const key = jp ? "why_wrong_jp" : s.lang;
  if (!holder || typeof holder[key] !== "string") throw new Error(`${s.id} ${s.letter} ${s.lang}: target missing`);
  if (holder[key] === s.value) { console.log(`  ~ ${s.id} ${s.letter}.${s.lang}: already applied, skip`); continue; }
  holder[key] = s.value;
  touched.add(file);
  changed++;
  console.log(`  ✓ ${s.id} distractors.${s.letter}.${s.lang}`);
}

for (const f of touched) writeFileSync(P2(f), JSON.stringify(docs.get(f), null, 2) + "\n");
console.log(`✓ quiz-phase2-explfix2-S109: ${changed} field(s) → re-run: node scripts/quiz-phase2-merge.mjs ${E}`);
