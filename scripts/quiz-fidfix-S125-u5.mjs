#!/usr/bin/env node
// Stage 6 / Quiz — S125 ⑤-2 全量保真掃引 **U5** (2020r02o、60 問 / Sonnet 5 単 pass) の差分を是正する。
// 源: S125 の workflow `wf_4c528418-96c`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u5_2020r02o_sn.json
//     マニフェスト = data/ip/quiz/.phase2/u5_fidelity_input_2020r02o.json (precrop 59/60、q004 のみ crop 無し → page-03 直読)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 293 / AGENT_MISSED 7 / VERDICT_CONFLICT 0 / coverage 60/60
//                 (**MISSED 7 はすべて既知型の偽陽性**: q001 ア〜エ = 表型選択肢「a：RFI　b：RFP」の一行化 /
//                  q011 ア・ウ・エ = DFD 図 4 枚を文章化した選択肢の言い換え (D-141 型)。源を実読し、4 肢とも矢印の向きが
//                  図と一致することを確認済。machdiff 由来の追加是正は無い)
//
// 層・方針は quiz-fidfix-S122-u3a / S123-u3b / S124-u4 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される (q016 / q068 / q085 は clean のみ — 下記)
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2020r02o の sidecar / .phase1 のキーは `stem` / `choices` / `stem_jp_clean` (一部の題のみ) で、
// **`choices_jp_clean` は存在しない** (実測)。したがって選択肢は raw 3 層がそのまま出荷層であり、
// 下記の選択肢是正はすべて**学習者に見えていた**腐敗にあたる。stem は q004 / q016 / q068 / q085 が clean を持ち、表示は clean 層。
// 適用ループ本体は S122〜S124 で Rule D PASS 済のものを**逐字そのまま**流用している。
// 本 unit では stem 分岐・zh / en 分岐・EXPL 分岐 (distSub / correctSub) がいずれも実行される (pointSub のみ未実行)。
//
// 採用した差分 (15 題 / 24 論理差分 — agent の 24 件すべて。源 crop / 源ページを原寸〜16 倍で独立実読して確認):
//   2020r02o-q004 stem       (page-03、**crop 無し → 源ページ直読**) 「過去19年間」×2 → 源「過去10年間」×2。**semantic (数値)**。
//                            源の 0 は斜線入りゼロ (slashed zero) で、OCR が 9 と読んだ。4 倍で 2 箇所とも確定。
//                            raw 3 層 + clean 2 層 + zh/en stem + 解説 (correct / distractor エ の jp・zh・en) まで全層追随
//   2020r02o-q006 choice.ア  (page-04) ASCII 直引用符 "…" ×4 対 → 源 “…” (U+201C/U+201D)。**ア は正解肢** (correct_answer 不変)
//   2020r02o-q006 choice.イ  (page-04) ASCII 直引用符 "価値" → 源 “価値”
//   2020r02o-q016 stem       (page-09) clean 層「斬新な発想」→ 源「斬新的な発想」。5 倍で「的」を確定。
//                            **raw は既に「斬新的な」**で正 → raw 3 層は n=0 で skip、clean (sidecar + .phase1) のみ是正
//   2020r02o-q022 choice.ア  (page-11) 「人の上顔を認識し」→ 源「人の顔を認識し」(源に無い「上」の挿入)
//   2020r02o-q022 choice.ア  (page-11) 「解除ずる」→ 源「解除する」。紙面の「す」右肩に斑点があるが、画素実測で
//                            **単一の 3×4px 塊** (y 283〜286)。同 crop の実在濁点 (「ド」y 231〜236) は **2 本の斜画**で形が違う → 染み
//   2020r02o-q023 choice.エ  (page-11) 「経営企画都門」→ 源「経営企画部門」(部→都 の誤字)
//   2020r02o-q023 choice.エ  (page-11) 文末「。一 ll 一」→ 除去。**同ページ下端のノンブル「— 11 —」の混入**
//   2020r02o-q026 choice.ア  (page-13) 「防災品」→ 源「防炎品」。semantic。zh「防灾用品」/ en "fire-resistant disaster-prevention
//                            products" も 防災 を引き継いでいた → zh「阻燃用品」/ en "flame-retardant products" に追随
//   2020r02o-q026 choice.エ  (page-13) 「建、 物」→ 源「建物」(行送りを読点と誤認した挿入)
//   2020r02o-q045 choice.エ  (page-21) 「物理的 人的」→ 源「物理的，人的」(読点の脱落。S124 §11 で事前登記済の候補)
//   2020r02o-q049 choice.ウ  (page-22) 「問繁に」→ 源「頻繁に」
//   2020r02o-q054 choice.イ  (page-25) 「プロジェクト_ に」→ 源「プロジェクトに」。**イ は正解肢**
//   2020r02o-q054 choice.ウ  (page-25) 「テストエ工程」→ 源「テスト工程」
//   2020r02o-q068 stem       (page-31) clean「【対応】」→ 源「〔対応〕」(亀甲括弧)。raw は「【対応〕」で n=0 skip (N5)
//   2020r02o-q075 choice.ア  (page-35) 「609.00.11.aa.bb.cc」→ 源「00.00.11.aa.bb.cc」。semantic (数値、slashed zero 型)
//   2020r02o-q075 choice.イ  (page-35) 「950-1234-5678」→ 源「050-1234-5678」。semantic (数値、slashed zero 型)
//                            ア / イ は zh / en choices と解説 distractor (jp・zh・en) が腐敗値を引用 → 全層追随
//   2020r02o-q075 choice.エ  (page-35) 「http://www. example.co.jp/」→ 源「http://www.example.co.jp/」(URL 内空白)。zh/en は既に正
//   2020r02o-q078 choice.ア  (page-35) 「TIP 電話」→ 源「IP 電話」。zh/en は既に「IP 电话」/ "IP phones"。
//                            解説 distractor ア の「(選択肢の「TIP 電話」は「IP 電話」の表記誤り)」は是正後に偽になる → jp・zh・en から除去
//   2020r02o-q085 stem       (page-38) clean「「権限がないので保存できません」」→ 源 “…”。raw は「"…”」混在で n=0 skip (N5)
//   2020r02o-q089 choice.ア  (page-40) 「について.,見直し」→ 源「について，見直し」(源に無いピリオド)。**ア は正解肢**
//   2020r02o-q100 choice.ア  (page-45) 「正しい相手方から」→ 源「正しい相手から」。**ア は正解肢**
//   2020r02o-q100 choice.イ  (page-45) 「読み見られている」→ 源「盗み見られている」。解説 jp の「読み見られる」も追随
//
// jp 読点の字種は house rule の ASCII「, 」(D-147 §1)。
// 引用符・括弧は「源の字形が原寸で確定できるものだけ是正」(S118 §41)。q006 の ASCII " → “ ” は S115 が
// 「横断的な正規化課題」として見送った型だが、S119 規定 (引用符字種置換も計上) と U3a `2018h30h-q001` / U3b `2019h31h-q007`
// の「agent 計上 + 源で字形確定 → 是正」precedent、および S114 `2011h23tokubetsu-q003` (ASCII → 全角) に従い採用した (evidence §4)。
// zh / en の引用符・括弧 (q006 / q068 / q085) は ⑨-c 保留で不変。
//
// 指示から外した点: **なし**。主 context の要注意 11 項目と結果 JSON の 24 件をすべて源実読で確認し、全件採用。
//
// 見送り (evidence §10 に理由を明記):
//   2020r02o-q100 解説 correct_jp の「正しい相手方から」— 解説者自身の文で選択肢の引用ではない (U3b q015 precedent)
//   2020r02o-q026 解説の「防災 (被害の抑止)」— 解説者の分類語で選択肢の語の写しではない
//   expl_jp_*.json 内の key_guard.note_jp (「都門」「問繁」「TIP」「過去19年間」等に言及) — merge は generate_result の
//     key_guard を権威とし expl_jp 側を読まない (quiz-phase2-merge.mjs:40) ため**非出荷**。触らない (⑨ 登記)
//   raw stem の N5 残存 (clean が出荷層): q054「テストエ程」/ q068「【対応〕」「導 大 した」/ q085「"…”」/ q016「ac」「保 護」
//   読点「，」/「、」の字種差、英数字周囲の空白、全半角 — 従来どおり表記揺れ
//
// Run: node scripts/quiz-fidfix-S125-u5.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S125-u5.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2020r02o

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// 既定 = dry-run (読取専用)。`--apply` で書き込む (S125 指示。S124 までは既定 = 適用だった)。
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0; const log = [];

// assert-once: 対象文字列がちょうど 1 回だけ出ることを要求し、2 回以上なら中断 (誤爆防止)。
// 冪等: to ⊃ from で既に to が入っている、または from が 0 回なら skip。
// S121 reviewer 指摘: 置換が「本当に to を書けた」ことを肯定確認する (to が空でない場合のみ)。
function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  const next = s.replace(from, to);
  if (to && !next.includes(to)) throw new Error(`${where}: 置換後に to 「${to.slice(0, 36)}」 が見つからない — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」`); return true;
}

const FIX = {
  // ── 数値 (slashed zero を 9 と誤読) ──────────────────────────────────────────
  // from は「過去」を含めない: raw は「過去 19年間の気象」(空白あり)、clean は「過去19年間の気象」で、
  // 「19年間にわたる」「19年間の気象」なら両層とも各 1 回 (実測)。
  "2020r02o-q004": {
    jp: [
      ["stem", "19年間にわたる", "10年間にわたる"],
      ["stem", "19年間の気象", "10年間の気象"],
    ],
    zh: [
      ["stem", "19 年间各门店", "10 年间各门店"],
      ["stem", "19 年的气象", "10 年的气象"],
    ],
    en: [
      ["stem", "over the past 19 years", "over the past 10 years"],
      ["stem", "weather data from the past 19 years", "weather data from the past 10 years"],
    ],
  },
  "2020r02o-q075": {
    jp: [
      ["ア", "609.00.11.aa.bb.cc", "00.00.11.aa.bb.cc"],
      ["イ", "950-1234-5678", "050-1234-5678"],
      ["エ", "http://www. example.co.jp/", "http://www.example.co.jp/"],
    ],
    zh: [["ア", "609.00.11.aa.bb.cc", "00.00.11.aa.bb.cc"], ["イ", "950-1234-5678", "050-1234-5678"]],
    en: [["ア", "609.00.11.aa.bb.cc", "00.00.11.aa.bb.cc"], ["イ", "950-1234-5678", "050-1234-5678"]],
  },
  // ── 語義是正・誤字 ──────────────────────────────────────────────────────────
  // q016: raw は既に「斬新的な」→ raw 3 層は n=0 skip、clean 2 層のみ当たる。zh「新颖构思」/ en "novel idea" は不変。
  "2020r02o-q016": { jp: [["stem", "斬新な発想", "斬新的な発想"]] },
  "2020r02o-q022": { jp: [["ア", "人の上顔を認識し", "人の顔を認識し"], ["ア", "解除ずる。", "解除する。"]] },
  // q023: 文末の「一 ll 一」(U+4E00 / ASCII 空白 / l l) は page-11 下端のノンブル「— 11 —」の混入。
  "2020r02o-q023": { jp: [["エ", "経営企画都門の戦略である。一 ll 一", "経営企画部門の戦略である。"]] },
  "2020r02o-q026": {
    jp: [["ア", "防災品に取り替え", "防炎品に取り替え"], ["エ", "同規模の建、 物への", "同規模の建物への"]],
    zh: [["ア", "更换为防灾用品", "更换为阻燃用品"]],
    en: [["ア", "with fire-resistant disaster-prevention products", "with flame-retardant products"]],
  },
  "2020r02o-q049": { jp: [["ウ", "問繁に寄せられる", "頻繁に寄せられる"]] },
  // q078: zh「使用 IP 电话」/ en "IP phones" は既に源どおり。
  "2020r02o-q078": { jp: [["ア", "TIP 電話を用いた", "IP 電話を用いた"]] },
  // q100: ア は **正解肢**。zh「正确的发件方」/ en "the correct party"、イ zh「被窃看」/ en "eavesdropped (secretly read)" は既に源の語義。
  "2020r02o-q100": { jp: [["ア", "正しい相手方から", "正しい相手から"], ["イ", "途中で読み見られている", "途中で盗み見られている"]] },
  // ── 源に無い記号・字の挿入 / 区切りの脱落 (jp 字種は house rule の ASCII「, 」) ──
  "2020r02o-q045": { jp: [["エ", "物理的 人的", "物理的, 人的"]] },
  // q054: イ は **正解肢** (correct_answer=イ は不変)。
  "2020r02o-q054": { jp: [["イ", "プロジェクト_ に予備", "プロジェクトに予備"], ["ウ", "テストエ工程の遅延", "テスト工程の遅延"]] },
  // q089: ア は **正解肢** (correct_answer=ア は不変)。
  "2020r02o-q089": { jp: [["ア", "について.,見直し", "について, 見直し"]] },
  // ── 引用符・括弧の字種 (源 “ ” U+201C/U+201D、〔 〕 U+3014/U+3015) ─────────────
  // q006: ア は **正解肢**。ASCII " は同一肢に 8 個あるため対ごとに置換 (assert-once)。
  "2020r02o-q006": {
    jp: [
      ["ア", "\"財務の視点\"", "“財務の視点”"],
      ["ア", "\"顧客の視点\"", "“顧客の視点”"],
      ["ア", "\"業務プロセスの視点\"", "“業務プロセスの視点”"],
      ["ア", "\"成長と学習の視点\"", "“成長と学習の視点”"],
      ["イ", "\"価値\"", "“価値”"],
    ],
  },
  // q068 / q085: clean のみ。raw (「【対応〕」/「"権限…”」) は from と一致せず n=0 skip — N5 系列として見送り。
  "2020r02o-q068": { jp: [["stem", "【対応】", "〔対応〕"]] },
  "2020r02o-q085": { jp: [["stem", "「権限がないので保存できません」", "“権限がないので保存できません”"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  - q004: correct / distractor エ が「19年分」を jp・zh・en で引用 → 10 に追随 (points は年数に言及しない)
//  - q075: distractor ア / イ が腐敗値「609…」「950…」を jp・zh・en で引用 → 源の値に追随。
//          ア の論拠「数値のかたまりが6つ」「aa bb cc を含む」は源の値でもそのまま成立
//  - q078: distractor ア 末尾の「(選択肢の「TIP 電話」は「IP 電話」の表記誤り)」は是正後に偽 → jp・zh・en から除去
//  - q100: distractor イ jp「読み見られる」→「盗み見られる」(zh「被窃看」/ en "being read" は源の語義)
const EXPL = {
  "2020r02o-q004": {
    correctSub: {
      jp: [["19年分の膨大な", "10年分の膨大な"]],
      zh: [["19 年间庞大", "10 年间庞大"]],
      en: [["the vast 19 years of sales data", "the vast 10 years of sales data"]],
    },
    distSub: {
      エ: {
        jp: [["全国多店舗・19年分という", "全国多店舗・10年分という"]],
        zh: [["19 年间这样", "10 年间这样"]],
        en: [["nationwide and 19 years", "nationwide and 10 years"]],
      },
    },
  },
  "2020r02o-q075": {
    distSub: {
      ア: {
        jp: [["「609.00.11.aa.bb.cc」", "「00.00.11.aa.bb.cc」"]],
        zh: [["「609.00.11.aa.bb.cc」", "「00.00.11.aa.bb.cc」"]],
        en: [["“609.00.11.aa.bb.cc”", "“00.00.11.aa.bb.cc”"]],
      },
      イ: {
        jp: [["「950-1234-5678」", "「050-1234-5678」"]],
        zh: [["「950-1234-5678」", "「050-1234-5678」"]],
        en: [["“950-1234-5678”", "“050-1234-5678”"]],
      },
    },
  },
  "2020r02o-q078": {
    distSub: {
      ア: {
        jp: [["ため誤り (選択肢の「TIP 電話」は「IP 電話」の表記誤り)。", "ため誤り。"]],
        zh: [["故错误（选项中的「TIP 电话」是「IP 电话」的书写错误）。", "故错误。"]],
        en: [["so it is incorrect (the «TIP phone» in the choice is a typo for «IP phone»).", "so it is incorrect."]],
      },
    },
  },
  "2020r02o-q100": { distSub: { イ: { jp: [["途中で読み見られる危険性", "途中で盗み見られる危険性"]] } } },
};

const MARK = "fidfix-S125-u5";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触。
// 方針 (波 2 / 波 3 / U3a / U3b / U4 と同一): 語義是正 / 正解肢命中 / D-144 段 2 化 に限り追記する。
//   - 語義・数値: q004 q016 q022 q023 q026 q049 q075 q078 q100 / 正解肢命中: q006 q054 q089 (q100 は両方)
//   - 追記しない (誤答肢の記号・junk のみ、または stem の括弧・引用符のみ): q045 / q068 / q085
// 2020r02o の generate_result は final note が 97/100 問で空文字 (本 unit の 15 問はすべて空)。空への追記も純粋後置
// (`final.startsWith(round1)` は round1="" で真) で、merge は final≠round1 のため round1 ブロックを併記する (D-143 の設計どおり)。
// NOTE_SUB は本 unit では該当なし (既存 final note が空で、腐敗を現在形で主張する文が無い)。
const NOTE_APPEND = {
  "2020r02o-q004": (p) => `（S125 ⑤-2 U5: ${p} 実読で stem の「過去19年間」2 箇所を源の「過去10年間」に是正（源の 0 は斜線入りゼロで、OCR が 9 と読んでいた）。zh / en の stem と解説（正解理由・選択肢エ）の「19 年」も 10 に追随。蓄積データの期間が変わっても、大量データの相関分析と予測に AI 技術が適するという導出・答え（ウ）は不変 — ${MARK}）`,
  "2020r02o-q016": (p) => `（S125 ⑤-2 U5: ${p} 実読で 表示 stem の b「斬新な発想」を源の「斬新的な発想」に是正（「的」の脱落）。b はデザイン（意匠法の対象）で特許法の対象外という導出・答え（ア）は不変。zh「新颖构思」/ en "novel idea" は不変 — ${MARK}）`,
  "2020r02o-q022": (p) => `（S125 ⑤-2 U5: ${p} 実読で 選択肢ア「人の上顔を認識し, …解除ずる。」を源の「人の顔を認識し, …解除する。」に是正（源に無い「上」の挿入と、紙面の染みを濁点と誤読した「ず」）。誤答肢のため答え（イ）には影響せず、zh / en は既に源の語義 — ${MARK}）`,
  "2020r02o-q023": (p) => `（S125 ⑤-2 U5: ${p} 実読で 選択肢エの「経営企画都門」を源の「経営企画部門」に是正し、文末に混入していたノンブル由来の「一 ll 一」を除去。誤答肢のため答え（イ）には影響せず、zh「经营企划部门」/ en "corporate planning department" は既に源の語義 — ${MARK}）`,
  "2020r02o-q026": (p) => `（S125 ⑤-2 U5: ${p} 実読で 選択肢アの「防災品」を源の「防炎品」（燃えにくい加工品）に是正し、zh「阻燃用品」/ en "flame-retardant products" も追随。あわせて 選択肢エの「建、 物」を源の「建物」に是正。いずれも誤答肢で、事業継続の観点から答え（ウ）を導く論拠は不変 — ${MARK}）`,
  "2020r02o-q049": (p) => `（S125 ⑤-2 U5: ${p} 実読で 選択肢ウの「問繁に寄せられる」を源の「頻繁に寄せられる」に是正。誤答肢（FAQ の説明）のため答え（エ）には影響せず、zh「常被问到」/ en "frequently asked" は既に源の語義 — ${MARK}）`,
  "2020r02o-q054": (p) => `（S125 ⑤-2 U5: ${p} 実読で 選択肢イ「プロジェクト_ に予備の期間」を源の「プロジェクトに予備の期間」に是正（源に無い記号の混入）。**正解肢**だが変更は記号の除去のみで correct_answer=イ は不変。あわせて 選択肢ウの「テストエ工程」を源の「テスト工程」に是正 — ${MARK}）`,
  "2020r02o-q075": (p) => `（S125 ⑤-2 U5: ${p} 実読で 選択肢アを源の「00.00.11.aa.bb.cc」、選択肢イを源の「050-1234-5678」に是正（源の 0 は斜線入りゼロで、OCR が 6・9 と読んでいた）。zh / en の選択肢と解説の引用も追随。選択肢エの URL 内の空白も除去。いずれも誤答肢で、IPv4 は 4 オクテットの 10 進表記という導出・答え（ウ）は不変 — ${MARK}）`,
  "2020r02o-q078": (p) => `（S125 ⑤-2 U5: ${p} 実読で 選択肢アの「TIP 電話」を源の「IP 電話」に是正。解説の「(選択肢の「TIP 電話」は「IP 電話」の表記誤り)」は是正後に当たらなくなるため jp / zh / en から除去。誤答肢のため答え（イ）には影響しない — ${MARK}）`,
  "2020r02o-q089": (p) => `（S125 ⑤-2 U5: ${p} 実読で 選択肢ア「について.,見直し」を源の「について，見直し」に是正（源に無いピリオドの混入）。**正解肢**だが変更は区切り記号のみで correct_answer=ア は不変 — ${MARK}）`,
  "2020r02o-q100": (p) => `（S125 ⑤-2 U5: ${p} 実読で 選択肢ア「正しい相手方から」を源の「正しい相手から」に、選択肢イ「読み見られている」を源の「盗み見られている」に是正。ア は**正解肢**だが語義は同じで correct_answer=ア は不変。イの解説の「読み見られる」も追随、zh / en は既に源の語義 — ${MARK}）`,
  "2020r02o-q006": (p) => `（S125 ⑤-2 U5: ${p} 実読で 選択肢ア の 4 視点の ASCII 引用符を源の “ ” に、選択肢イ の "価値" を源の “価値” に是正。ア は**正解肢**だが変更は引用符の字種のみで correct_answer=ア は不変。zh / en の引用符は ⑨-c 保留で不変 — ${MARK}）`,
};
const NOTE_SUB = {};

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set([...Object.keys(NOTE_APPEND), ...Object.keys(NOTE_SUB)].map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const q = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[q, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[q, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); const j = rj(jf), tr = rj(tf);
  for (const [L, d] of Object.entries(ex.distSub ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    for (const [f, t] of d.jp ?? []) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${L}`);
    for (const [f, t] of d.zh ?? []) sub(dt, "zh", f, t, `${id} expl_tr.${L}.zh`);
    for (const [f, t] of d.en ?? []) sub(dt, "en", f, t, `${id} expl_tr.${L}.en`);
  }
  if (ex.correctSub) {
    for (const [f, t] of ex.correctSub.jp ?? []) sub(j, "correct_jp", f, t, `${id} expl_jp.correct_jp`);
    for (const [f, t] of ex.correctSub.zh ?? []) sub(tr.correct, "zh", f, t, `${id} expl_tr.correct.zh`);
    for (const [f, t] of ex.correctSub.en ?? []) sub(tr.correct, "en", f, t, `${id} expl_tr.correct.en`);
  }
  for (const p of ex.pointSub ?? []) {
    if (p.jp) { const [f, t] = p.jp; const arr = j.points_jp; if (typeof arr?.[p.idx] !== "string") throw new Error(`${id} points_jp[${p.idx}] missing`);
      const box = { v: arr[p.idx] }; if (sub(box, "v", f, t, `${id} expl_jp.points[${p.idx}]`)) arr[p.idx] = box.v; }
    if (p.zh) { const [f, t] = p.zh; sub(tr.points[p.idx], "zh", f, t, `${id} expl_tr.points[${p.idx}].zh`); }
    if (p.en) { const [f, t] = p.en; sub(tr.points[p.idx], "en", f, t, `${id} expl_tr.points[${p.idx}].en`); }
  }
  wj(jf, j); wj(tf, tr);
}

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const [id, mk] of Object.entries(NOTE_SUB)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  const [from, to] = mk(pg(id));
  if (!sub(r.key_guard, "note_jp", from, to, `${id} final note`)) throw new Error(`${id}: note segment not found`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S125-u5: applied ${applied}, skipped ${skipped}`);
