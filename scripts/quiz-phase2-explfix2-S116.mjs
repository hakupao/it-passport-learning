#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explfix2 S116 (2009h21a): Rule A 独立抽検 + trsweep 再核験の指摘を是正。
//
// ══ 出所 ══
// (1) Rule A `wf_cb5bc196-237` (N=40, critic = pr-review-toolkit:code-reviewer):
//     accurate 35/40・key_guard 不一致 0・medium 5 件。
// (2) trsweep `wf_c345531c-d7c` の監査 (2009h21a-q071 unfaithful) と、
//     その再訳案に対する 2 段の独立核験 (`wf_a8ebd98d-446`)。
//
// ══ 是正 ══
// A. q064 ウ — 誤答の「由来」説明が成立しない (jp 原文の欠陥 → 3 言語に伝播)。
//    旧: 「8進数 55 の上位桁 5 を 16 の重みで数え…た場合に生じる誤り」
//    しかし 5×16+5 = 85 = 0x55 であって 4D にはならない。**捏造された機構**なので、
//    数値事実だけを述べる形に書き換える (4D = 77(10) = 115(8) ≠ 45(10))。
// B. q096 イ — 「2品目」になる筋の説明が自己矛盾 (自ら対象外と述べた商品を根拠にしている)。
//    正しい誤り筋は「10 回**以下**」を「10 回**以上**」と読み違える型。
//    累計70%以内は え(9.2)・う(12.0)・あ(14.4) で、10 回以上は う・あ の 2 品目 → イ が生じる。
// C. q078 正解解説 — 「文中の『硬故障性』は『耐故障性』の誤植」の注記が陳腐化。
//    choices_jp.ア は既に「耐故障性」に是正済 (S116) で、表示テキストに「硬故障性」は無い。
// D. q085 エ — 「文末には原典のページノイズが混入している」の注記が陳腐化。
//    choices_jp.エ は既に「被認証者のディジタル署名を安全に送付する。」に是正済 (S116)。
// E. q071 訳文 — trsweep 監査が JP↔訳文の保真不成立と判定した 3 点。
//    **再訳案の全面差し替えは採らない**: 2 段目の独立核験が、再訳案は監査指摘 3 点を確かに
//    解消している一方で、**disk 版より悪化した箇所を 4 件持ち込んでいる**と判定したため
//    (「同报投递」← disk「群发同一内容」/ 読点挿入による連体修飾の切断 / 語釈なしの裸 opt-in /
//     字母のカッコ囲み)。よって **disk 版に監査指摘 3 点だけを当てる**方式に切り替える。
//    これは「直すと同時に劣化を持ち込む」再訳のリスク (S115 で 3 件とも核験が止めた) を
//    最小化する選択で、Rule B に従い再訳案そのものは failures/ に保管する。
//
// Run: node scripts/quiz-phase2-explfix2-S116.mjs
//   (then: node scripts/quiz-phase2-merge.mjs 2009h21a && node scripts/quiz-phase2-verify-result.mjs 2009h21a)

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const ARCHIVE = path.join(ROOT, "failures", "quiz_phase2_S116_2009h21a_trsweep");

// ─────────── 置換定義 ───────────
// file: "jp" | "tr"、path は explfix-S115 と同じ解決規則
const EDITS = [
  // ── A. q064 ウ ──
  {
    id: "2009h21a-q064", file: "jp", path: "distractors_jp[letter=ウ].why_wrong_jp",
    from: "4D は 10進数で 4×16 + 13 = 77 です。これは 8進数 55 の上位桁 5 を 16 の重みで数えたり、桁の並びをそのまま置き換えたりした場合に生じる誤りで、正しい基数変換の結果ではありません。",
    to: "4D は 10進数で 4×16 + 13 = 77 (8進数では 115) であり、8進数 55 = 10進数 45 とは別の値です。実際に基数変換をせずに字面の似た値を選ぶと引っかかる誤答肢です。",
    why: "Rule A medium: 旧文の『上位桁 5 を 16 の重みで数える』は 5×16+5 = 85 = 0x55 であって 4D にならず、機構の説明が成立していなかった (捏造)。数値事実だけを述べる形に是正",
  },
  {
    id: "2009h21a-q064", file: "tr", path: "distractors[letter=ウ].zh",
    from: "4D 在十进制中是 4×16 + 13 = 77。这是把八进制 55 的高位 5 按 16 的权重来计算，或者把各位数字原样替换时产生的错误，并不是正确基数转换的结果。",
    to: "4D 在十进制中是 4×16 + 13 = 77（八进制为 115），与八进制 55 = 十进制 45 是不同的值。如果不实际做基数转换，只挑字面相近的值，就会掉进这个误答项。",
    why: "同上 (zh)",
  },
  {
    id: "2009h21a-q064", file: "tr", path: "distractors[letter=ウ].en",
    from: "4D is 4×16 + 13 = 77 in decimal. This error arises from counting the upper digit 5 of octal 55 with a weight of 16, or from simply replacing the digits as they stand; it is not the result of a correct radix conversion.",
    to: "4D is 4×16 + 13 = 77 in decimal (115 in octal), which is a different value from octal 55 = decimal 45. It is the trap for anyone who picks a similar-looking value without actually carrying out the radix conversion.",
    why: "同上 (en)",
  },
  // ── B. q096 イ ──
  {
    id: "2009h21a-q096", file: "jp", path: "distractors_jp[letter=イ].why_wrong_jp",
    from: "2品目になるのは、累計70%の枠を1品目ぶん広げて商品こ（累計76.9%、回転率14.0回）まで含めた場合などですが、こは70%を超えるうえ回転率も10回超なので対象外です。累計70%以内の え・う・あ のうち回転率10回以下は え のみで、2品目にはなりません。",
    to: "2品目になるのは、抽出条件を「商品回転率が 10 回**以上**」と読み違えた場合です。累計70%以内に入るのは え（9.2回）・う（12.0回）・あ（14.4回）の3品目で、このうち10回以上は う と あ の2品目だからです。設問の条件は「10 回以下」なので、該当するのは え の1品目だけです。",
    why: "Rule A medium: 旧文は「商品こを含めた場合に2品目」と述べながら同じ文で「こは対象外」と自ら否定しており自己矛盾。かつ こ を足しても該当は え 1 品目のままで 2 にはならない。正しい誤り筋 (以下↔以上 の読み違え) に差し替え",
  },
  {
    id: "2009h21a-q096", file: "tr", path: "distractors[letter=イ].zh",
    from: "要得到2个品目，需要把累计70%的范围再放宽一个品目、把商品癸（累计76.9%、周转率14.0次）也算进来等情形；但癸既超过70%，周转率也超过10次，所以不在对象之内。在累计70%以内的丁、丙、甲当中，周转率10次以下的只有丁，不会是2个品目。",
    to: "会得到2个品目，是把抽取条件误读成「商品周转率在 10 次**以上**」的情况。落在累计70%以内的是丁（9.2次）、丙（12.0次）、甲（14.4次）这3个品目，其中10次以上的是丙和甲共2个。而题目的条件是「10 次以下」，所以符合的只有丁这1个品目。",
    why: "同上 (zh)",
  },
  {
    id: "2009h21a-q096", file: "tr", path: "distractors[letter=イ].en",
    from: "Two items would result if, for example, the 70% cumulative range were widened by one more item to include Product J (cumulative 76.9%, turnover 14.0 times). But J exceeds 70% and its turnover is also over 10 times, so it is out of scope. Among D, C, and A, which are within the 70% cumulative ratio, only D has a turnover of 10 times or less, so the answer is not 2.",
    to: "Two items result when the extraction condition is misread as a turnover of 10 times or **more**. The three items within the 70% cumulative ratio are D (9.2), C (12.0) and A (14.4), and two of them, C and A, have a turnover of 10 or more. The condition in the question is 10 times or less, so only D qualifies, giving one item.",
    why: "同上 (en)",
  },
  // ── C. q078 陳腐化 caveat ──
  {
    id: "2009h21a-q078", file: "jp", path: "correct_jp",
    from: " (文中の「硬故障性」は「耐故障性」の誤植)",
    to: "",
    why: "Rule A medium: choices_jp.ア は既に「耐故障性」に是正済で、表示テキストに「硬故障性」は存在しない。学習者に現行画面に無い誤植を告げる陳腐化注記",
  },
  {
    id: "2009h21a-q078", file: "tr", path: "correct.zh",
    from: "（原文中的「硬故障性」是「耐故障性（容错性）」的印刷错误）",
    to: "",
    why: "同上 (zh)",
  },
  {
    id: "2009h21a-q078", file: "tr", path: "correct.en",
    from: " (The Japanese text has a typo: 硬故障性 should read 耐故障性, meaning fault tolerance.)",
    to: "",
    why: "同上 (en)",
  },
  // ── D. q085 陳腐化 caveat ──
  {
    id: "2009h21a-q085", file: "jp", path: "distractors_jp[letter=エ].why_wrong_jp",
    from: "なお、この選択肢の文末には原典のページノイズが混入している。",
    to: "",
    why: "Rule A medium: choices_jp.エ は既に S116 で是正済でノンブル等のノイズは無い。表示本文と矛盾する stale note",
  },
  {
    id: "2009h21a-q085", file: "tr", path: "distractors[letter=エ].zh",
    from: "另外，该选项句末混入了原始资料的页面噪声。",
    to: "",
    why: "同上 (zh)",
  },
  {
    id: "2009h21a-q085", file: "tr", path: "distractors[letter=エ].en",
    from: " Note that page noise from the original source material has been mixed into the end of this choice.",
    to: "",
    why: "同上 (en)",
  },
  // ── E. q071 訳文 (disk 版に監査指摘 3 点だけを当てる) ──
  {
    id: "2009h21a-q071", file: "tr", path: "distractors[letter=ウ].zh",
    from: "连锁邮件（chain mail，即「幸运信」式邮件）",
    to: "连锁邮件（chain mail，即「不幸信」式邮件）",
    why: "trsweep 監査 medium: JP「不幸の手紙型メール」を zh が「幸运信」(幸運) と**意味を反転**させていた",
  },
  {
    id: "2009h21a-q071", file: "tr", path: "distractors[letter=ウ].en",
    from: "This describes chain mail. Its characteristic is",
    to: "This describes chain mail (the unlucky-letter type). Its characteristic is",
    why: "trsweep 監査 medium: JP の括弧書き「不幸の手紙型メール」が en から完全に脱落していた",
  },
  {
    id: "2009h21a-q071", file: "tr", path: "points[1].en",
    from: "electronic bulletin board (a post-and-read information exchange system)",
    to: "electronic bulletin board (a post-type information exchange system)",
    why: "trsweep 監査 low: JP「書き込み型」に無い read の側面を en が足していた",
  },
  {
    id: "2009h21a-q071", file: "tr", path: "distractors[letter=イ].en",
    from: "This describes a mailing list. It delivers the same email",
    to: "This describes a mailing list. It is a mechanism that delivers the same email",
    why: "trsweep 監査 low: JP「同じメールを配信する仕組み」の『仕組み』(機構) の明示が en で落ちていた",
  },
];

// ─────────── path 解決 (explfix-S115 と同一規則 + points[i]) ───────────
const resolve = (obj, p) => {
  let cur = obj;
  for (const seg of p.split(".")) {
    const mLetter = seg.match(/^([A-Za-z_]+)\[letter=(.+)\]$/);
    const mIndex = seg.match(/^([A-Za-z_]+)\[(\d+)\]$/);
    if (mLetter) {
      const arr = cur[mLetter[1]];
      if (!Array.isArray(arr)) throw new Error(`not an array: ${mLetter[1]}`);
      const hit = arr.find((x) => x.letter === mLetter[2]);
      if (!hit) throw new Error(`letter ${mLetter[2]} not found in ${mLetter[1]}`);
      cur = hit;
    } else if (mIndex) {
      const arr = cur[mIndex[1]];
      if (!Array.isArray(arr)) throw new Error(`not an array: ${mIndex[1]}`);
      cur = arr[Number(mIndex[2])];
      if (cur == null) throw new Error(`index ${mIndex[2]} out of range in ${mIndex[1]}`);
    } else cur = cur[seg];
    if (cur == null) throw new Error(`path segment missing: ${seg}`);
  }
  return cur;
};
const resolveParent = (obj, p) => {
  const ks = p.split(".");
  const last = ks.pop();
  return [ks.length ? resolve(obj, ks.join(".")) : obj, last];
};

// ─────────── Rule B: 是正前テキストを保管 ───────────
mkdirSync(ARCHIVE, { recursive: true });
for (const id of [...new Set(EDITS.map((e) => e.id))]) {
  for (const f of ["jp", "tr"]) {
    const src = P2(`expl_${f}_${id}.json`);
    const dst = path.join(ARCHIVE, `expl_${f}_${id}.BEFORE.json`);
    if (existsSync(src) && !existsSync(dst)) copyFileSync(src, dst);
  }
}

// ─────────── 適用 ───────────
let applied = 0;
const cache = new Map();
const load = (fp) => {
  if (!cache.has(fp)) cache.set(fp, JSON.parse(readFileSync(fp, "utf-8")));
  return cache.get(fp);
};
for (const e of EDITS) {
  const fp = P2(`expl_${e.file}_${e.id}.json`);
  const doc = load(fp);
  const [parent, key] = resolveParent(doc, e.path);
  const cur = parent[key];
  if (typeof cur !== "string") throw new Error(`${e.id} ${e.path}: not a string`);
  const n = cur.split(e.from).length - 1;
  if (n === 0 && (e.to === "" || cur.includes(e.to))) {
    console.log(`  = ${e.id} [${e.file}] ${e.path}: 既に是正済 → skip`);
    continue;
  }
  if (n !== 1) throw new Error(`${e.id} ${e.path}: from が ${n} 回出現 (1 回であること) — 中止`);
  const next = cur.replace(e.from, e.to).replace(/\s{2,}/g, " ").replace(/\s+([。．、，])/g, "$1").trim();
  if (!next) throw new Error(`${e.id} ${e.path}: 是正後が空 — 中止`);
  parent[key] = next;
  applied++;
  console.log(`  ✓ ${e.id} [${e.file}] ${e.path}\n      ${e.why}`);
}
for (const [fp, doc] of cache) writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");

// ─────────── 是正後 assert: 陳腐化語が残っていないこと ───────────
const mustBeGone = [
  ["2009h21a-q078", "硬故障性"], ["2009h21a-q078", "印刷错误"], ["2009h21a-q078", "typo"],
  ["2009h21a-q085", "ページノイズ"], ["2009h21a-q085", "页面噪声"], ["2009h21a-q085", "page noise"],
  ["2009h21a-q071", "幸运信"], ["2009h21a-q071", "post-and-read"],
];
for (const [id, term] of mustBeGone) {
  for (const f of ["jp", "tr"]) {
    // **user-facing フィールドだけ**を走査する。`key_guard.note_jp` は内部監査証跡であり、
    // 「どの腐敗をいつ是正したか」を記録するために腐敗前の字を**意図的に含む**ので除外する
    // (ここを含めて走査した初版は、q078 の裁決履歴を「是正漏れ」と誤検出して止まった)。
    const doc = JSON.parse(readFileSync(P2(`expl_${f}_${id}.json`), "utf-8"));
    delete doc.key_guard;
    if (JSON.stringify(doc).includes(term)) throw new Error(`${id} [${f}]: 「${term}」が残存 — 是正が不完全`);
  }
}
console.log(`✓ quiz-phase2-explfix2-S116: ${applied} 箇所是正 (Rule A medium 4 問 + trsweep 監査 1 問)`);
console.log(`  Rule B: ${path.relative(ROOT, ARCHIVE)}/ に是正前テキストを保管`);
console.log(`  next: node scripts/quiz-phase2-merge.mjs 2009h21a && node scripts/quiz-phase2-verify-result.mjs 2009h21a`);
