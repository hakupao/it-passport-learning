#!/usr/bin/env node
// Stage 6 / Quiz — S128 B track **B2** (2014h26h、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S128 の workflow `wf_ceb882b0-99e`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b2_2014h26h_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b2_fidelity_input_2014h26h.json (precrop 86/100、skip 14 = page_mismatch 2 (q067 / q086) + chumon 12 (q089〜q100))
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 465 / AGENT_MISSED 13 (q042 エ = 実残差、q039 ア〜エ = [表] 書式、q090 ア〜エ = 図説明 (transcript 空)、
//                 q091 / q092 / q100 = 中問前文、q097 = 表示層の並び) / QUOTE_ASCII 3 (q051 stem / q057 エ / q087 ウ、いずれも採用) / VERDICT_CONFLICT 0
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S128-b1 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2014h26h の sidecar のキーは `stem` / `choices` / `stem_jp_clean` (100 題中 55 題) で、**`choices_jp_clean` は存在しない** (実測)。
// 選択肢は raw 3 層がそのまま出荷層。q001 / q003 / q020 / q051 / q072 は stem_jp_clean を持たない (raw stem が出荷層)。
//
// 適用ループ (sub / FIX / expl 単一読み / NOTE_APPEND) は B1 / U11 から無変更で流用 (B1 の CHN は不要なので持たない)。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q001 stem   (p02) raw「"優良顧客の維持"」→ 源「“優良顧客の維持”」
//   q003 stem   (p02) raw「構 築」→ 源「構築」(改行由来の空白、fixer 走査)
//   q007 stem   (p04) clean「提示し, 調達先」→ 源「提示して, 調達先」
//   q020 stem   (p08) raw「計 画している。 研修」→ 源「計画している。研修」(改行由来の空白、fixer 走査)
//   q030 stem   (p10) clean「「製品」「価格」「流通」「販売促進」」→ 源「“製品”，“価格”，“流通”，“販売促進”」
//   q039 stem   (p14) raw / clean「記述中の a、b」→ 源「記述中の、a、b」
//   q051 stem   (p19) raw「"0" から "9"」→ 源「“0” から “9”」
//   q057 stem   (p21) clean「「賛成」「反対」」×6 → 源「“賛成”」「“反対”」
//   q068 stem   (p27) raw / clean「“..￥..￥B￥B”によって」→ 源「..￥..￥B￥B によって」(源に引用符なし)
//   q072 stem   (p28) raw「及び リスク」→ 源「及びリスク」(改行由来の空白、fixer 走査)
//   q085 stem   (p34) clean「運用管理部門が,…「データ管理要領」」→ 源「運用管理部門,…〔データ管理要領〕」
//   q087 stem   (p36) clean「「時間給×勤務時間」」→ 源「“時間給×勤務時間”」
//   q097 stem   (p44) clean 注記に源の最終行「( ) 内の数値は各作業に要する時間を表す。」を補う (zh / en 追随)
//   q010 ア     (p05) 「渡じた」→ 源「渡した」
//   q041 エ     (p14) 末尾の源に無い「。」を除去
//   q042 エ     (p15) 「しなくてよい」→ 源「しなくてもよい」(machdiff)
//   q048 ア     (p17) 「実効内容」→ 源「実施内容」
//   q048 エ     (p17) 「適切な要求」→ 源「過剰な要求」(zh / en と解説も追随)
//   q057 イ     (p21) 「“賛成′ …“殖成"」→ 源「“賛成” …“賛成”」
//   q057 エ     (p21) 「“賛成"」→ 源「“賛成”」(エは**正解肢**、引用符のみ)
//   q071 エ     (p28) 末尾「ぜい」(q072 の「脆」のルビ) 除去 (エは**正解肢**)
//   q072 イ     (p28) 「田威」→ 源「脅威」(解説の OCR 注記も除去)
//   q073 ア     (p29) 「インタフェエース」→ 源「インタフェース」(アは**正解肢**)
//   q085 ア / ウ (p34) 「データ管理澄」→ 源「データ管理簿」、「一且」→ 源「一旦」
//   q087 ウ     (p36) 「"時間給×勤務時間×人数"」→ 源「“時間給×勤務時間×人数”」
//   q094 ウ / エ (p42) 「東議」→ 源「稟議」
//   q095 ア〜ウ  (p43) 「東議」→ 源「稟議」
//
// Run: node scripts/quiz-fidfix-S128-b2.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S128-b2.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2014h26h
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const LOADED = new Map();
const rj = (f) => { const d = JSON.parse(readFileSync(f, "utf-8")); LOADED.set(f, JSON.stringify(d, null, 2)); return d; };
const written = [];
const wj = (f, d) => {
  const next = JSON.stringify(d, null, 2);
  if (LOADED.get(f) === next) return;
  written.push(path.relative(ROOT, f));
  if (!DRY) writeFileSync(f, next + "\n");
};
let applied = 0, skipped = 0; const log = [];

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
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  "2014h26h-q001": { jp: [["stem", "\"優良顧客の維持\"", "“優良顧客の維持”"]] },
  "2014h26h-q003": { jp: [["stem", "システムを構 築する", "システムを構築する"]] },
  "2014h26h-q007": { jp: [["stem", "RFP をベンダに提示し, 調達先", "RFP をベンダに提示して, 調達先"]] },
  "2014h26h-q020": { jp: [["stem", "研修を計 画している。 研修に", "研修を計画している。研修に"]] },
  "2014h26h-q030": { jp: [["stem", "「製品」「価格」「流通」「販売促進」の四つ", "“製品”，“価格”，“流通”，“販売促進”の四つ"]] },
  "2014h26h-q039": { jp: [["stem", "次の記述中の a、b に入れる", "次の記述中の、a、b に入れる"]] },
  "2014h26h-q051": { jp: [["stem", "\"0\" から \"9\" の10種類", "“0” から “9” の10種類"]] },
  // q057: clean の引用符 6 箇所を 1 文の範囲で置換 (raw は別の崩れで from 不在 → N5)。
  "2014h26h-q057": {
    jp: [
      ["stem", "入力は「賛成」か「反対」のいずれかであり、入力が二つとも「賛成」のときだけ「賛成」と出力し、その他のときは「反対」と出力する。",
        "入力は“賛成”か“反対”のいずれかであり、入力が二つとも“賛成”のときだけ“賛成”と出力し、その他のときは“反対”と出力する。"],
      ["イ", "“賛成′ のときは常に, “殖成\" と出力", "“賛成” のときは常に, “賛成” と出力"],
      ["エ", "“賛成\" のときだけ", "“賛成” のときだけ"],
    ],
  },
  "2014h26h-q068": { jp: [["stem", "相対パス指定で“..￥..￥B￥B”によって", "相対パス指定で ..￥..￥B￥B によって"]] },
  "2014h26h-q072": {
    jp: [
      ["stem", "脆弱性及び リスクの大きさ", "脆弱性及びリスクの大きさ"],
      ["イ", "大きさは, 田威, 脆弱性", "大きさは, 脅威, 脆弱性"],
    ],
  },
  "2014h26h-q085": {
    jp: [
      ["stem", "運用管理部門が,販売部門から受領したデータを「データ管理要領」に沿って", "運用管理部門,販売部門から受領したデータを〔データ管理要領〕に沿って"],
      ["ア", "データ管理澄には", "データ管理簿には"],
      ["ウ", "一且データを返却し", "一旦データを返却し"],
    ],
  },
  "2014h26h-q087": {
    jp: [
      ["stem", "費用は、「時間給×勤務時間」で算出", "費用は、“時間給×勤務時間”で算出"],
      ["ウ", "\"時間給×勤務時間×人数\"の総和", "“時間給×勤務時間×人数”の総和"],
    ],
  },
  // q097: 源 p44 の注記は 4 行。clean は最終行「( ) 内の数値は各作業に要する時間を表す。」を落としていた。
  "2014h26h-q097": {
    jp: [["stem", "点線の矢印はダミー作業を表す。", "点線の矢印はダミー作業を表す。( ) 内の数値は各作業に要する時間を表す。"]],
    zh: [["stem", "虚线箭头表示虚拟作业（哑作业）。", "虚线箭头表示虚拟作业（哑作业）。（ ）内的数值表示各作业所需的时间。"]],
    en: [["stem", "The dotted arrow represents a dummy activity.", "The dotted arrow represents a dummy activity. The values in parentheses represent the time required for each activity."]],
  },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  "2014h26h-q010": { jp: [["ア", "個人情報を渡じた。", "個人情報を渡した。"]] },
  "2014h26h-q041": { jp: [["エ", "変更のしやすさの度合い。", "変更のしやすさの度合い"]] },
  "2014h26h-q042": { jp: [["エ", "要素分解をしなくてよい。", "要素分解をしなくてもよい。"]] },
  "2014h26h-q048": {
    jp: [
      ["ア", "サービスの実効内容に基づき", "サービスの実施内容に基づき"],
      ["エ", "内容に関する適切な要求を受ける", "内容に関する過剰な要求を受ける"],
    ],
    zh: [["エ", "关于服务内容的恰当要求", "关于服务内容的过分要求"]],
    en: [["エ", "without receiving appropriate requests regarding", "without receiving excessive requests regarding"]],
  },
  "2014h26h-q071": { jp: [["エ", "IP アドレスを回答する。ぜい", "IP アドレスを回答する。"]] },
  "2014h26h-q073": { jp: [["ア", "AV 機器向けのインタフェエースである。", "AV 機器向けのインタフェースである。"]] },
  "2014h26h-q094": {
    jp: [
      ["ウ", "東議内容が,", "稟議内容が,"],
      ["エ", "東議内容に対して,", "稟議内容に対して,"],
    ],
  },
  "2014h26h-q095": {
    jp: [
      ["ア", "申請前に東議を", "申請前に稟議を"],
      ["イ", "同意者が東議を", "同意者が稟議を"],
      ["ウ", "承認者が東議を", "承認者が稟議を"],
    ],
  },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q048: ア / エ の why_wrong は選択肢の直接引用。エは腐敗語「適切な要求」を前提に理由を書いていたので、引用と理由の文を源の「過剰な要求」に合わせて書き直す。
//  q072: イ の why_wrong 末尾の「田威は OCR 誤り」注記は是正後に偽になるので除去 (jp / zh / en)。
const EXPL = {
  "2014h26h-q048": {
    dist: {
      ア: { jp: ["「サービスの実効内容に基づき", "「サービスの実施内容に基づき"] },
      エ: {
        jp: [
          "「サービスの内容に関する適切な要求を受けることなく業務を遂行できる」は、提供者側だけの都合を述べたものであるうえ、SLA の趣旨とも正反対である。SLA はむしろ利用者の要求水準を明確な形で取り決め、提供者がそれを満たすことを約束する文書であり、適切な要求を受け付けなくてよくなるわけではない。利用者にとっては要求が通らなくなるだけで、利点ですらない。",
          "「サービスの内容に関する過剰な要求を受けることなく業務を遂行できる」は、提供者側だけの都合を述べたものであり、設問が求める「双方の利点」にはあたらない。SLA は利用者の要求水準を明確な形で取り決め、提供者がそれを満たすことを約束する文書であり、合意した水準を超える要求を断りやすくなるのは提供者側の事情にすぎない。利用者にとっては利点ではない。",
        ],
        zh: [
          "「无需接受关于服务内容的恰当要求即可执行业务。」只讲了提供方一方的便利，而且与 SLA 的宗旨完全相反。SLA 恰恰是把使用方的要求水准以明确的形式约定下来、并由提供方承诺予以满足的文件，并不意味着可以不再接受恰当的要求。对使用方而言这只意味着要求无法被采纳，根本谈不上好处。",
          "「无需接受关于服务内容的过分要求即可执行业务。」只讲了提供方一方的便利，不属于本题所要求的「双方的好处」。SLA 是把使用方的要求水准以明确的形式约定下来、并由提供方承诺予以满足的文件，更容易拒绝超出约定水准的要求，只是提供方一方的情况。对使用方而言这并不是好处。",
        ],
        en: [
          "The statement that they can carry out the work without receiving appropriate requests regarding the service content describes only the provider's own convenience, and it is the exact opposite of the purpose of an SLA. On the contrary, an SLA is a document in which the levels required by the user are agreed upon in an explicit form and the provider commits to meeting them, so it does not mean that appropriate requests no longer have to be accepted. For the user it would simply mean that requests no longer get through, which is not a benefit at all.",
          "The statement that they can carry out the work without receiving excessive requests regarding the service content describes only the provider's own convenience, so it does not count as a benefit for both sides as the question requires. An SLA is a document in which the levels required by the user are agreed upon in an explicit form and the provider commits to meeting them; being able to decline requests that exceed the agreed levels more easily is merely a matter on the provider's side. For the user it is not a benefit.",
        ],
      },
    },
  },
  "2014h26h-q072": {
    dist: {
      イ: {
        jp: ["順序が逆である。なお、この選択肢の「田威」は「脅威」の文字認識誤りである。", "順序が逆である。"],
        zh: ["顺序恰好相反。另外，本选项的日文原文中的「田威」是「脅威」（威胁）的文字识别错误。", "顺序恰好相反。"],
        en: ["the order is the other way around. Note also that «田威» in the Japanese text of this choice is a character-recognition error for «脅威» (threat).", "the order is the other way around."],
      },
    },
  },
};

const MARK = "fidfix-S128-b2";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 (U3a〜B1 と同一方針)。
//   語義: q007 q010 q042 q048 q057 (イ) q072 q073 q085 q094 q095 q097 / 正解肢命中: q057 (エ、引用符のみ) q071 (エ、残渣) q073 (ア)
//   追記しない (括弧・引用符・空白・残渣のみ、非正解肢): q001 q003 q020 q030 q039 q041 q051 q068 q087
const NOTE_APPEND = {
  "2014h26h-q007": (p) => `（S128 B2: ${p} 実読で 題幹 clean の「提示し, 調達先」を源の「提示して, 調達先」に是正（「て」の脱落）。RFI = 技術動向調査書、RFP = 提案書 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2014h26h-q010": (p) => `（S128 B2: ${p} 実読で 選択肢アの「渡じた」を源の「渡した」に是正済み（上記の「渡じた」の記述は是正前の状態）。誤答肢のため、フランチャイズ本部への提供は第三者提供で本人同意が必要 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2014h26h-q042": (p) => `（S128 B2: ${p} 実読で 選択肢エの「しなくてよい」を源の「しなくてもよい」に是正（「も」の脱落）。誤答肢のため、管理できるレベルまで要素分解する = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2014h26h-q048": (p) => `（S128 B2: ${p} 実読で 選択肢アの「実効内容」を源の「実施内容」に、エの「適切な要求」を源の「過剰な要求」に是正（zh / en とエの解説も追随。上記の「エ は要求を受けずに…」の記述は是正前の文言に基づく）。ア・エは誤答肢のまま（いずれも一方の側だけの利点）で、共通認識をもてる = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2014h26h-q057": (p) => `（S128 B2: ${p} 実読で 選択肢イの「“賛成′」「“殖成"」を源の「“賛成”」に、エの「“賛成"」を源の「“賛成”」に、題幹 clean の「」を源の “” に是正済み（上記の腐敗スコープの記述は是正前の状態）。エは**正解肢**だが変更は引用符の字種のみで、三入力の AND = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2014h26h-q071": (p) => `（S128 B2: ${p} 実読で 選択肢エ末尾の「ぜい」（次問 q072 の「脆」のルビの混入）を除去済み（上記の「ぜい」の記述は是正前の状態）。エは**正解肢**だが変更は文末の残渣のみで、ホスト名から IP アドレスを回答する = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2014h26h-q072": (p) => `（S128 B2: ${p} 実読で 選択肢イの「田威」を源の「脅威」に是正済み（上記の「田威」の記述は是正前の状態。解説の同旨の注記は除去）。題幹の「及び リスク」の空白も除去。誤答肢のため、リスクの大きさは資産価値・脅威・脆弱性で決まる = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2014h26h-q073": (p) => `（S128 B2: ${p} 実読で 選択肢アの「インタフェエース」を源の「インタフェース」に是正済み（上記の記述は是正前の状態。ウの語中空白は現表示に無い）。アは**正解肢**だが変更は改行をまたいだ重複字の除去のみで、映像・音声・制御信号を 1 本で伝送 = HDMI = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2014h26h-q085": (p) => `（S128 B2: ${p} 実読で 題幹 clean の「運用管理部門が,」を源の「運用管理部門,」に（源に無い「が」を除去）、「データ管理要領」を源の「〔データ管理要領〕」に、選択肢アの「データ管理澄」を源の「データ管理簿」に、ウの「一且」を源の「一旦」に是正済み（上記の (1)(3) の記述は是正前の状態）。受領した事実を記録しないイが不適切 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2014h26h-q094": (p) => `（S128 B2: ${p} 実読で 選択肢ウ・エの「東議内容」を源の「稟議内容」に是正済み（上記の記述は是正前の状態）。誤答肢のため、種別と決裁金額の項目間チェック = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2014h26h-q095": (p) => `（S128 B2: ${p} 実読で 選択肢ア〜ウの「東議」を源の「稟議」に是正済み（上記の「choices_jp が未是正」の記述は是正前の状態）。誤答肢のため、差戻しで流れが戻る = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2014h26h-q097": (p) => `（S128 B2: ${p} 実読で 題幹 clean の注記に源の最終行「( ) 内の数値は各作業に要する時間を表す。」を補う（zh / en も追随）。S1→S2→S3 の 7.0 時間後に M3 (2.0)・M4 (5.0) で 14.0 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
};

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[qq, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[qq, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

// expl は id ごとに 1 回だけ読み、全ループで共有する。
const EXPLDOC = new Map();
const expl = (id) => {
  if (!EXPLDOC.has(id)) {
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    EXPLDOC.set(id, { jf, tf, j: rj(jf), tr: rj(tf) });
  }
  return EXPLDOC.get(id);
};
for (const [id, ex] of Object.entries(EXPL)) {
  const { j, tr } = expl(id);
  for (const [L, d] of Object.entries(ex.dist ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id} distractor ${L} missing`);
    if (d.jp) sub(dj, "why_wrong_jp", d.jp[0], d.jp[1], `${id} expl_jp.${L}`);
    if (d.zh) sub(dt, "zh", d.zh[0], d.zh[1], `${id} expl_tr.${L}.zh`);
    if (d.en) sub(dt, "en", d.en[0], d.en[1], `${id} expl_tr.${L}.en`);
  }
}
for (const { jf, tf, j, tr } of EXPLDOC.values()) { wj(jf, j); wj(tf, tr); }

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S128-b2: applied ${applied}, skipped ${skipped}`);
