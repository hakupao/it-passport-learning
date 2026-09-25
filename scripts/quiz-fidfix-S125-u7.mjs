#!/usr/bin/env node
// Stage 6 / Quiz — S125 ⑤-2 全量保真掃引 **U7** (2022r04、75 問 / Sonnet 5 単 pass) の差分を是正する。
// 源: S125 の workflow `wf_9220b31c-fa2`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u7_2022r04_sn.json
//     マニフェスト = data/ip/quiz/.phase2/u7_fidelity_input_2022r04.json (precrop 46/75、29 問は crop 無し → 源ページ直読)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 366 / AGENT_MISSED 9 / VERDICT_CONFLICT 0 / coverage 75/75
//                 (**MISSED 9 = 実残差 4 + 偽陽性 5**。実残差: q001 stem 先頭の見出し「問1 」/ q017 イ「業務に→業務で」/
//                  q018 ウ「大量生産の…生産への移行→大量生産品の…での製造」/ q018 エ「動力を→動力の」。
//                  偽陽性: q006 stem = agent の source_text が題幹 1 文目で切れている (a〜c 列挙は源にある) /
//                  q032 ア〜エ = transcript の「[図]」接頭辞 (U3a q005 と同型))
//
// 層・方針は quiz-fidfix-S122-u3a / S123-u3b / S124-u4 / S125-u5 / S125-u6 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される (q012 / q027 は clean のみ、q066 は raw / clean で腐敗値が違う — 下記)
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2022r04 の sidecar / .phase1 のキーは `stem` / `choices` / `stem_jp_clean` (68 題) で、**`choices_jp_clean` は存在しない** (実測)。
// したがって選択肢は raw 3 層がそのまま出荷層であり、下記の選択肢是正はすべて**学習者に見えていた**腐敗にあたる。
// 適用ループ本体は S122〜S125-u6 で Rule D PASS 済のものを**逐字そのまま**流用している。
// 本 unit では stem 分岐・zh / en 分岐・EXPL 分岐 (distSub / correctSub) が実行される (pointSub のみ未実行)。
//
// **q032 (選択肢が図) は本 script では触らない**。`scripts/quiz-choicefig-D144s2.mjs --only 2022r04-q032` が
// D-144 段 2 ②-a として choice_figures 化する (U3a `2018h30h-q005` precedent、evidence §4)。
//
// 採用した差分 (19 題 / 36 論理差分 — agent の 32 件 + machdiff 実残差 4 件。源 crop / 源ページを原寸〜2 倍で独立実読して確認):
//   2022r04-q001 stem        (page-02) 先頭の見出し「問1 」混入 → 除去 (machdiff 由来、U3b `2019h31h-q001` / U6 `q100` 型)。
//                            **zh「问1 」/ en「Q1 」にも混入していた** → zh / en stem も除去 (U6 q100 との違い)
//   2022r04-q012 stem        (page-06) clean「違いによって貸付型」→ 源「違いによって, 貸付型」(読点脱落)。raw は空白で n=0 skip (N5)
//   2022r04-q014 choice.ウ   (page-07) 「一定期間リフトウェア」→ 源「一定期間ソフトウェア」
//   2022r04-q014 choice.エ   (page-07) 末尾「ー 以m␣×33」」→ 除去 (源に無い記号列)
//   2022r04-q015 choice.エ   (page-08) 末尾「 .」→ 除去。**エ は正解肢**。源の該当位置は 2×3px・5 画素・平均輝度 150 の淡い点で、
//                            同ページの実在の句点 (8×7px・37 画素・輝度 90) と別物 = 紙面の染み (evidence §4)
//   2022r04-q017 choice.ア   (page-09) 「業務に私的に」→ 源「業務中に私的に」
//   2022r04-q017 choice.イ   (page-09) 「業務に使用する」→ 源「業務で使用する」(machdiff 由来)
//   2022r04-q017 choice.エ   (page-09) 「業務に私的に」→ 源「業務中に私的に」。zh「在工作中」/ en "during work" は既に源の語義
//   2022r04-q018 choice.ア   (page-09) 「短期間での提供」→ 源「短納期での提供」。**ア は正解肢**。zh「短周期」/ en "in a short time" も
//                            源の語 (納期) に追随 → zh「短交期」/ en "with short delivery times" (解説 correct の「短交付周期」/ "short delivery time" と揃える)
//   2022r04-q018 choice.ウ   (page-09) 「大量生産の更なる低コストの生産への移行」→ 源「大量生産品の更なる低コストでの製造」(machdiff 由来)。
//                            zh / en も腐敗文の「转向 / shift」を訳していた → 源の語義に追随
//   2022r04-q018 choice.エ   (page-09) 「動力を電力や石油」→ 源「動力の電力や石油」(machdiff 由来)。zh / en は既に源の語義
//   2022r04-q022 choice.ウ   (page-11) 「調達 開発,製造,販売, サービス」→ 源「調達，開発，製造，販売，サービス」の読点を復元し house rule「, 」で統一
//   2022r04-q023 choice.ウ   (page-11) 「進めていたが決済」→ 源「進めていたが，決済」(読点脱落)
//   2022r04-q027 stem        (page-13) clean「「要配慮個人情報」」→ 源 “要配慮個人情報” (引用符字種、U3a q001 precedent)。raw「“…"」は n=0 skip (N5)
//   2022r04-q036 choice.ア   (page-17) 「定義むする」→ 源「定義する」。**ア は正解肢**
//   2022r04-q040 choice.イ   (page-19) 「の-つ一つ」→ 源「の一つ一つ」
//   2022r04-q047 choice.エ   (page-21) 「開発其間中」→ 源「開発期間中」
//   2022r04-q066 stem        (page-30) raw「“199mAh”」/ clean「“109mAh”」→ 源「“100mAh”」(slashed zero 型、U5 q004 / q075 precedent)。
//   2022r04-q066 choice.ア   (page-30) 「109mA」→ 源「100mA」。**ア は正解肢**
//   2022r04-q066 choice.イ   (page-30) 「190分間」→ 源「100分間」
//                            zh / en の stem・ア・イ と解説 (correct・distractor イ / ウ の jp・zh・en) まで全層追随
//   2022r04-q071 choice.イ   (page-32) 「名読点」→ 源「句読点」。**イ は正解肢**
//   2022r04-q073 choice.ア〜エ (page-33) 「TIPv4 / TIPv5 / TIPv6 / TIPv8」→ 源「IPv4 / IPv5 / IPv6 / IPv8」。**ウ は正解肢**。zh / en は既に正
//   2022r04-q077 choice.ア   (page-34) 「素引」→ 源「索引」
//   2022r04-q077 choice.エ   (page-34) 末尾「間」→ 除去 (源に無い字)
//   2022r04-q089 choice.ウ   (page-40) 「文字別」→ 源「文字列」。**ウ は正解肢**。「ハイパリンク」は源どおり (不変)
//   2022r04-q100 choice.ア〜エ (page-45) 文末句点「。」の脱落 → 復元 (波 2 `2016h28h-q089` precedent)。**ウ は正解肢**。zh / en は言語側の体裁で不変
//
// jp 読点の字種は house rule の ASCII「, 」(D-147 §1)。
//
// 指示から外した点: **なし** (evidence §6)。
//
// 見送り (evidence §10 に理由を明記):
//   expl_jp_*.json 内の key_guard.note_jp (「TIPv*」「名読点」「素引」「定義むする」「109mAh」等に言及) — merge が読まず**非出荷** (⑨ 継続)
//   raw stem の N5 残存 (clean が出荷層): q012「違いによって 貸付型」「4A 社」/ q027「“要配慮個人情報"」/ q001 raw「a 一 c」「適切かもの」ほか
//   q027 解説の「要配慮個人情報」の鉤括弧 — 解説者の法令用語の表記で設問の引用ではない。zh / en の引用符は ⑨-c 保留
//   q100 zh / en の文末句点 — 各言語の体裁 (⑨-c と同じ扱い)
//   英数字周囲の空白 (q012「A社」ほか)、読点字種 — 従来どおり表記揺れ
//
// Run: node scripts/quiz-fidfix-S125-u7.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S125-u7.mjs --apply
//      node scripts/quiz-choicefig-D144s2.mjs --only 2022r04-q032
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/build-quiz-figures.mjs
//   → node scripts/quiz-phase2-merge.mjs 2022r04

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// 既定 = dry-run (読取専用)。`--apply` で書き込む (S125 指示)。
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
  // ── 見出し・読点・引用符 (stem) ─────────────────────────────────────────────
  // q001: raw・clean とも先頭が「問1 著作権」。zh「问1 」/ en「Q1 」も同じ見出しを訳していた (U6 q100 は zh / en に混入なし)。
  "2022r04-q001": {
    jp: [["stem", "問1 著作権及び", "著作権及び"]],
    zh: [["stem", "问1 关于著作权", "关于著作权"]],
    en: [["stem", "Q1 Among statements", "Among statements"]],
  },
  // q012: clean のみ。raw は「違いによって 貸付型」(空白) で n=0 skip (N5)。
  "2022r04-q012": { jp: [["stem", "違いによって貸付型", "違いによって, 貸付型"]] },
  // q027: clean のみ。raw「“要配慮個人情報"」(閉じが ASCII) は n=0 skip (N5、U5 q085 と同型)。zh / en の引用符は ⑨-c 保留。
  "2022r04-q027": { jp: [["stem", "「要配慮個人情報」", "“要配慮個人情報”"]] },
  // ── 数値 (slashed zero を 9 と誤読) ──────────────────────────────────────────
  // q066: raw「“199mAh”」と clean「“109mAh”」で腐敗値が違う → 2 行 (各層で片方だけが当たり、他方は n=0 skip)。
  "2022r04-q066": {
    jp: [
      ["stem", "“199mAh”", "“100mAh”"],
      ["stem", "“109mAh”", "“100mAh”"],
      ["ア", "109mA の電流", "100mA の電流"],
      ["イ", "190分間の充電", "100分間の充電"],
    ],
    zh: [
      ["stem", "“109mAh”", "“100mAh”"],
      ["ア", "以 109mA 的电流", "以 100mA 的电流"],
      ["イ", "充电 190 分钟后", "充电 100 分钟后"],
    ],
    en: [
      ["stem", "\"109mAh\"", "\"100mAh\""],
      ["ア", "a current of 109mA for", "a current of 100mA for"],
      ["イ", "charging for 190 minutes", "charging for 100 minutes"],
    ],
  },
  // ── 語義是正・誤字 (字の挿入 / 脱落 / 置換) ──────────────────────────────────
  "2022r04-q014": {
    jp: [
      ["ウ", "一定期間リフトウェアの利用", "一定期間ソフトウェアの利用"],
      ["エ", "契約は成立する。ー 以m" + " ".repeat(33) + "」", "契約は成立する。"],
    ],
  },
  // q017: zh ア / エ「在工作中」/ en "during work"、イ「用于业务」/ "for work" は既に源の語義。
  "2022r04-q017": {
    jp: [
      ["ア", "スマートフォンを業務に私的に", "スマートフォンを業務中に私的に"],
      ["イ", "スマートフォンを業務に使用する", "スマートフォンを業務で使用する"],
      ["エ", "スマートフォンを業務に私的に", "スマートフォンを業務中に私的に"],
    ],
  },
  // q018: ア は **正解肢** (correct_answer=ア は不変)。
  "2022r04-q018": {
    jp: [
      ["ア", "コスト低減と短期間での提供", "コスト低減と短納期での提供"],
      ["ウ", "大量生産の更なる低コストの生産への移行", "大量生産品の更なる低コストでの製造"],
      ["エ", "動力を電力や石油", "動力の電力や石油"],
    ],
    zh: [
      ["ア", "以低成本、短周期地提供", "以低成本、短交期地提供"],
      ["ウ", "从而使大规模生产转向成本更低的生产。", "从而以更低的成本制造大批量生产的产品。"],
    ],
    en: [
      ["ア", "at low cost and in a short time", "at low cost and with short delivery times"],
      ["ウ", "The shift of mass production to even lower-cost production through", "Manufacturing mass-produced goods at even lower cost through"],
    ],
  },
  "2022r04-q022": { jp: [["ウ", "調達 開発,製造,販売, サービス", "調達, 開発, 製造, 販売, サービス"]] },
  "2022r04-q023": { jp: [["ウ", "進めていたが決済", "進めていたが, 決済"]] },
  // q036: ア は **正解肢** (correct_answer=ア は不変)。
  "2022r04-q036": { jp: [["ア", "成果物を定義むするので", "成果物を定義するので"]] },
  "2022r04-q040": { jp: [["イ", "作業項目の-つ一つ", "作業項目の一つ一つ"]] },
  "2022r04-q047": { jp: [["エ", "システム開発其間中", "システム開発期間中"]] },
  // q071: イ は **正解肢** (correct_answer=イ は不変)。zh「标点符号」/ en "punctuation mark" は既に源の語義。
  "2022r04-q071": { jp: [["イ", "置こうとした名読点や", "置こうとした句読点や"]] },
  // q073: 4 肢とも同じ「T」の挿入。ウ は **正解肢** (correct_answer=ウ は不変)。zh / en は既に「IPv4」等。
  "2022r04-q073": { jp: [["ア", "TIPv4", "IPv4"], ["イ", "TIPv5", "IPv5"], ["ウ", "TIPv6", "IPv6"], ["エ", "TIPv8", "IPv8"]] },
  "2022r04-q077": {
    jp: [
      ["ア", "素引を用意する", "索引を用意する"],
      ["エ", "防ぐことができる。間", "防ぐことができる。"],
    ],
  },
  // q089: ウ は **正解肢** (correct_answer=ウ は不変)。zh「文字串」/ en "text string" は既に源の語義。
  "2022r04-q089": { jp: [["ウ", "任意の文字別に", "任意の文字列に"]] },
  // ── 源に無い記号の混入 / 文末句点の脱落 ──────────────────────────────────────
  // q015: エ は **正解肢** (correct_answer=エ は不変)。
  "2022r04-q015": { jp: [["エ", "業務で必要となる人の役割 .", "業務で必要となる人の役割"]] },
  // q100: 4 肢とも源は「。」で終わる。to ⊃ from なので 2 回目以降は skip (冪等)。ウ は **正解肢**。
  "2022r04-q100": {
    jp: [
      ["ア", "再インストールする", "再インストールする。"],
      ["イ", "定義ファイルを最新にする", "定義ファイルを最新にする。"],
      ["ウ", "ネットワークから隔離する", "ネットワークから隔離する。"],
      ["エ", "暗号化方式を変更する", "暗号化方式を変更する。"],
    ],
  },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  - q066: correct / distractor イ・ウ が腐敗値 109 / 190 を jp・zh・en で引用 → 源の 100 に追随。
//          correct の「半分の約55mA / 2倍の218mA」は 109 からの派生値 → 100 の半分・2 倍 (50mA / 200mA) に。
//          distractor イ の論拠「190 という数値も109mAh から導けない」は是正後に偽 (両方 100 になる) → 論拠を
//          「100mAh の 100 は電流の値で充電時間ではない」に**書き換え** (置換ではなく意味の書換 — evidence §4 / Rule D 確認点)
//  - q014: distractor ウ 末尾の「(なお選択肢中の「リフトウェア」は「ソフトウェア」の OCR 誤読)」は是正後に偽 → jp・zh・en から除去
//          (U5 `2020r02o-q078`「TIP 電話」precedent)
const EXPL = {
  "2022r04-q066": {
    correctSub: {
      jp: [
        ["したがって109mAh は、109mA の電流を", "したがって100mAh は、100mA の電流を"],
        ["「109mA の電流を1時間放電できる」", "「100mA の電流を1時間放電できる」"],
        ["電流を半分の約55mA にすれば約2時間、2倍の218mA にすれば約30分", "電流を半分の50mA にすれば約2時間、2倍の200mA にすれば約30分"],
      ],
      zh: [
        ["因此 109mAh 表示能够持续输出 109mA 电流", "因此 100mAh 表示能够持续输出 100mA 电流"],
        ["「可以以 109mA 的电流放电 1 小时」", "「可以以 100mA 的电流放电 1 小时」"],
        ["减半到约 55mA 就能用约 2 小时，加倍到 218mA 则约 30 分钟", "减半到 50mA 就能用约 2 小时，加倍到 200mA 则约 30 分钟"],
      ],
      en: [
        ["Therefore 109mAh means a capacity that can supply a current of 109mA", "Therefore 100mAh means a capacity that can supply a current of 100mA"],
        ["“It can discharge a current of 109mA for 1 hour”", "“It can discharge a current of 100mA for 1 hour”"],
        ["halving the current to about 55mA lets it last about 2 hours while doubling it to 218mA", "halving the current to 50mA lets it last about 2 hours while doubling it to 200mA"],
      ],
    },
    distSub: {
      イ: {
        jp: [["「190分間の充電で」という記述は容量の定義に含まれておらず、190 という数値も109mAh から導けない。",
          "「100分間の充電で」という記述は容量の定義に含まれていない。100mAh の「100」は電流 (mA) の値であり、充電時間 (分) を表すものではない。"]],
        zh: [["「充电 190 分钟后」这一说法并不包含在容量的定义中，190 这个数值也无法从 109mAh 推导出来。",
          "「充电 100 分钟后」这一说法并不包含在容量的定义中。100mAh 中的「100」是电流（mA）的数值，并不表示充电时间（分钟）。"]],
        en: [["The phrase “after charging for 190 minutes” is not part of the definition of capacity, and the number 190 cannot be derived from 109mAh either.",
          "The phrase “after charging for 100 minutes” is not part of the definition of capacity; the “100” in 100mAh is a current value (mA), not a charging time (minutes)."]],
      },
      ウ: {
        jp: [["≒ 1667mAh となり、109mAh とは大きく異なる", "≒ 1667mAh となり、100mAh とは大きく異なる"]],
        zh: [["与 109mAh 相差甚远", "与 100mAh 相差甚远"]],
        en: [["vastly different from 109mAh", "vastly different from 100mAh"]],
      },
    },
  },
  "2022r04-q014": {
    distSub: {
      ウ: {
        jp: [["点が誤り (なお選択肢中の「リフトウェア」は「ソフトウェア」の OCR 誤読)。", "点が誤り。"]],
        zh: [["这一点是错误的（另外，日文原选项中的「リフトウェア」是「ソフトウェア／软件」的 OCR 误读）。", "这一点是错误的。"]],
        en: [["is the error (note: the “リフトウェア” in the original Japanese choice is an OCR misreading of “ソフトウェア／software”).", "is the error."]],
      },
    },
  },
};

const MARK = "fidfix-S125-u7";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触。
// 方針 (波 2 / 波 3 / U3a〜U6 と同一): 語義是正 / 正解肢命中 / D-144 段 2 化 に限り追記する。
//   - 語義・数値: q014 q017 q018 q040 q047 q066 q077 / 正解肢命中: q015 q036 q071 q073 q089 q100 (q018 q066 は両方)
//     / D-144 段 2: q032 (本 script が note を書き、choice_figures 化は quiz-choicefig-D144s2.mjs)
//   - 追記しない (stem の見出し・読点・引用符のみ、または誤答肢の読点のみ): q001 / q012 / q022 / q023 / q027
// 2022r04 の generate_result は本 unit の 19 問すべてで final note・round1 note とも空文字。空への追記も純粋後置
// (`final.startsWith(round1)` は round1="" で真) で、merge は final≠round1 のため round1 ブロックを併記する (D-143 の設計どおり)。
const NOTE_APPEND = {
  "2022r04-q014": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢ウの「リフトウェア」を源の「ソフトウェア」に是正し、選択肢エ末尾の源に無い記号列「ー 以m …」」を除去。解説ウの「リフトウェア」への注記は是正後に当たらなくなるため jp / zh / en から除去。いずれも誤答肢で、開封時点で契約成立というシュリンクラップ契約の定義から答え（ア）を導く論拠は不変 — ${MARK}）`,
  "2022r04-q015": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢エ末尾の「 .」を除去（源の該当位置は紙面の微小な染みで、活字の句読点ではない）。**正解肢**だが変更は記号の除去のみで correct_answer=エ は不変 — ${MARK}）`,
  "2022r04-q017": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢ア・エの「業務に私的に」を源の「業務中に私的に」に、選択肢イの「業務に使用する」を源の「業務で使用する」に是正。いずれも誤答肢で、私物端末・業務利用・会社の許可という BYOD の三要素から答え（ウ）を導く論拠は不変。zh / en は既に源の語義 — ${MARK}）`,
  "2022r04-q018": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢アの「短期間での提供」を源の「短納期での提供」に、選択肢ウの「大量生産の更なる低コストの生産への移行」を源の「大量生産品の更なる低コストでの製造」に、選択肢エの「動力を」を源の「動力の」に是正。zh / en のア・ウも源の語義に追随。ア は**正解肢**だが、マスカスタマイゼーション（個別仕様・低コスト・短納期）がインダストリー4.0 の特徴という導出・答え（ア）は不変 — ${MARK}）`,
  "2022r04-q032": (p) => `（S125 ⑤-2 U7: ${p} と複合図を実読。源の 4 肢は**図のみ**（ア＝直列、イ＝工程図への戻りループ、ウ＝全工程の戻りループ、エ＝階段状の重複）で、dataset のテキスト肢は図に無い注記「（直列）」「（一部並行）」「（全工程並行）」「（縦列）」を加え、イ・ウの戻りループを「並行」、正解肢エの重複を「縦列」と取り違えていた。D-144 段 2 ②-a として choice_figures 化し、テキストは中立な「図ア」〜「図エ」に置換済。上記の導出は元から図の内容に基づいており不変 — ${MARK}）`,
  "2022r04-q036": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢アの「定義むする」を源の「定義する」に是正（源に無い「む」の挿入）。**正解肢**だが語義は変わらず correct_answer=ア は不変 — ${MARK}）`,
  "2022r04-q040": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢イの「作業項目の-つ一つ」を源の「作業項目の一つ一つ」に是正（「一」がハイフンに化けていた）。誤答肢（共通フレームの説明）のため答え（ウ）には影響しない — ${MARK}）`,
  "2022r04-q047": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢エの「開発其間中」を源の「開発期間中」に是正。誤答肢のため、法律改正に伴う修正も保守に含まれるという導出・答え（ウ）は不変 — ${MARK}）`,
  "2022r04-q066": (p) => `（S125 ⑤-2 U7: ${p} 実読で stem の「109mAh」（raw は「199mAh」）、選択肢アの「109mA」、選択肢イの「190分間」をいずれも源の「100」に是正（源の 0 は斜線入りゼロで、OCR が 9 と読んでいた）。zh / en の stem・選択肢と、解説（正解理由・選択肢イ / ウ）の数値も追随し、選択肢イの解説は「100mAh の 100 は電流の値で充電時間ではない」という論拠に改めた。ア は**正解肢**で、X mAh = X mA を 1 時間流せる容量という導出・答え（ア）は不変 — ${MARK}）`,
  "2022r04-q071": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢イの「名読点」を源の「句読点」に是正。**正解肢**だが語の誤字の是正のみで、行頭禁則の例という導出・correct_answer=イ は不変 — ${MARK}）`,
  "2022r04-q073": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢ア〜エの「TIPv4 / TIPv5 / TIPv6 / TIPv8」を源の「IPv4 / IPv5 / IPv6 / IPv8」に是正（4 肢とも源に無い「T」の挿入）。ウ は**正解肢**だが、128 ビット = IPv6 という導出・correct_answer=ウ は不変。zh / en は既に正しい表記 — ${MARK}）`,
  "2022r04-q077": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢アの「素引」を源の「索引」に是正し、選択肢エ末尾の源に無い「間」を除去。いずれも誤答肢で、原子性の定義から答え（イ）を導く論拠は不変 — ${MARK}）`,
  "2022r04-q089": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢ウの「文字別」を源の「文字列」に是正。**正解肢**だが語の誤字の是正のみで correct_answer=ウ は不変。zh「文字串」/ en "text string" は既に源の語義 — ${MARK}）`,
  "2022r04-q100": (p) => `（S125 ⑤-2 U7: ${p} 実読で 選択肢ア〜エの文末に脱落していた句点「。」を復元（正解肢ウ を含む）。変更は句点のみで、まずネットワークから隔離するという導出・correct_answer=ウ は不変 — ${MARK}）`,
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S125-u7: applied ${applied}, skipped ${skipped}`);
