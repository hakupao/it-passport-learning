#!/usr/bin/env node
// Stage 6 / Quiz — S117 ① 本番 batch 2 (2018h30h / 2025r07 / 2015h27a) の保真核験差分を是正する。
// 源: S117 log §15 の 12 workflow (A = s7x 双 pass 52 問、B-note = 13 問)。差分 37 (双 pass 一致 30 + 片側/表現差 7)。
// 見送り (判断): 2015h27a-q100 の中問D 前文の要約 4 件 — S99 の incomplete-source 是正で意図的に投入した前文 (D-141 系) であり
//   源の逐字ではないことは既知。問100 本文自体の脱落「Aさんが処分するPCにおいて，」だけを是正する。
// 層: quiz-fidfix-S117-batch1.mjs と同じ。translations は再 merge 禁止 (sidecar + .phase1 入力層に同じ置換)。
// note の書き換え (D-143): 腐敗を述べた文の差し替えは「差し替え文に token を含めない + 適用済みマーカー」で冪等化。
//   数値が note 全体に及ぶ q039 / q064 は全文書き換え。
// Run: node scripts/quiz-fidfix-S117-batch2.mjs [--dry-run] → node scripts/quiz-phase2-merge.mjs {2018h30h,2025r07,2015h27a}

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0; const log = [];

function sub(obj, key, from, to, where, { all = false } = {}) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1 && !all) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  obj[key] = all ? s.split(from).join(to) : s.replace(from, to);
  applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 36)}」→「${to.slice(0, 36)}」${n > 1 ? ` ×${n}` : ""}`); return true;
}

// ── 差分表 ─────────────────────────────────────────────────────────────────────
const FIX = {
  // 2018h30h — A 側
  "2018h30h-q019": { jp: [["ア", "売上総利益が，1,500百万円増", "売上総利益が1,500百万円増"], ["イ", "50%も増となった", "50%増となった"]] },
  "2018h30h-q021": { jp: [["stem", "不正アクセス行為は，ネットワーク", "不正アクセス行為とは，ネットワーク"]] },
  "2018h30h-q049": { jp: [["エ", "図った行政機関", "図った行政機構"]], zh: [["エ", "的行政机关", "的行政机构"]], en: [["エ", "An administrative agency that", "An administrative organization that"]] },
  "2018h30h-q054": { jp: [["stem", "ウォーターフォールモデル", "ウォータフォールモデル"]] },
  "2018h30h-q090": { jp: [["ウ", "プロセスの導入，運用を行う。", "プロセス及び手順の導入，運用を行う。"]], zh: [["ウ", "导入并运行流程。", "导入并运行流程及步骤。"]], en: [["ウ", "Introduce and operate the processes.", "Introduce and operate the processes and procedures."]] },
  // 2018h30h — B-note 側
  "2018h30h-q017": { jp: [["エ", "小売店舗綱", "小売店舗網"]] },
  "2018h30h-q020": { jp: [["ア", "自由奏放", "自由奔放"]] },
  "2018h30h-q039": {
    jp: [["stem", "受付後30分以内に", "受付後20分以内に"], ["stem", "受付後2分以内に", "受付後20分以内に"], // raw は「2分以内」に腐敗
         ["ア", "受付の39分後に", "受付の30分後に"], ["イ", "受付の1分後に", "受付の10分後に"], ["ウ", "39分後に部門 B", "30分後に部門 B"]],
    zh: [["stem", "在受理故障报告后 30 分钟以内", "在受理故障报告后 20 分钟以内"], ["ア", "在受理 39 分钟后", "在受理 30 分钟后"], ["イ", "在受理 1 分钟后", "在受理 10 分钟后"], ["ウ", "39 分钟后向部门B", "30 分钟后向部门B"]],
    en: [["stem", "Within 30 minutes after receiving a fault report", "Within 20 minutes after receiving a fault report"], ["ア", "39 minutes after receiving the report", "30 minutes after receiving the report"], ["イ", "1 minute after receiving the report", "10 minutes after receiving the report"], ["ウ", "and 39 minutes after, notified", "and 30 minutes after, notified"]],
  },
  "2018h30h-q048": { jp: [["エ", "ー一つのプロジェクト", "一つのプロジェクト"]] },
  "2018h30h-q052": { jp: [["エ", "分担して実施する。 -", "分担して実施する。"]] },
  "2018h30h-q064": {
    jp: [["stem", "srv91", "srv01"], ["stem", "srv61", "srv01"], ["stem", "abc.htmU", "abc.html"], // raw は srv61 / htmU
         ["ア", "“ipa.go.jp がWeb", "“ipa.go.jp” がWeb"], ["エ", "ipa.9o.jp", "ipa.go.jp"]],
    zh: [["stem", "srv91", "srv01"]], en: [["stem", "srv91", "srv01"]], all: true,
  },
  "2018h30h-q070": { jp: [["ア", "轟威", "脅威"]] },
  "2018h30h-q091": { jp: [["イ", "可用性が高い。こう", "可用性が高い。"]] },
  "2018h30h-q097": { jp: [["イ", "角罪", "犯罪"]] },
  // 2025r07
  "2025r07-q017": { jp: [["エ", "手段である。eg 8 了", "手段である。"]] },
  "2025r07-q031": { jp: [["ウ", 'によ"って', "によって"], ["ウ", "目指すナシステム", "目指すシステム"]] },
  "2025r07-q059": { jp: [["イ", "JIS Q 27991", "JIS Q 27001"]] },
  "2025r07-q069": { jp: [["stem", "に入る字句の組合せのうち，適切なものはどれか。", "に入れる字句の適切な組合せはどれか。"]], zh: [["stem", "填入 a、b 的字句组合中，恰当的是哪一项？", "填入 a、b 的字句的恰当组合是哪一项？"]] },
  "2025r07-q076": { jp: [["stem", "ワークシートである。", "ワークシートがある。"]], zh: [["stem", "这是一张用于计算商品含税价格的电子表格工作表。", "有一张用于计算商品含税价格的电子表格工作表。"]], en: [["stem", "This is a spreadsheet worksheet for calculating", "There is a spreadsheet worksheet for calculating"]] },
  // 2015h27a
  "2015h27a-q061": { jp: [["エ", "ユニバーサルデザイン        -", "ユニバーサルデザイン"]] },
  "2015h27a-q071": { jp: [["stem", "データBを作成する，データAを削除する。", "データBを作成し，データAを削除する。"], ["stem", "| 3 | トランザクション3 | データBを作成する。 |", "| 3 | トランザクション3 | データAを作成する。 |"]] }, // 2 件目は raw のみ (clean は源どおり)
  "2015h27a-q085": { jp: [["stem", "| 202 | 200 | 2 | 3 | 4 | 3 | 3 | 3 |", "| 202 | 200 | 2 | 3 | 2 | 3 | 3 | 3 |"]], zh: [["stem", "| 202 | 200 | 2 | 3 | 4 | 3 | 3 | 3 |", "| 202 | 200 | 2 | 3 | 2 | 3 | 3 | 3 |"]], en: [["stem", "| 202 | 200 | 2 | 3 | 4 | 3 | 3 | 3 |", "| 202 | 200 | 2 | 3 | 2 | 3 | 3 | 3 |"]] },
  "2015h27a-q086": { jp: [["stem", "アンケート抽出表中の抽出対象", "アンケート抽出表中への抽出対象"]] },
  "2015h27a-q098": { jp: [["stem", "液晶ディスプレー一体型", "液晶ディスプレイ一体型"]] },
  "2015h27a-q100": { jp: [["stem", "専用ソフトの説明書によって,そのソフトウェア", "Aさんが処分するPCにおいて,専用ソフトの説明書によって,そのソフトウェア"]], zh: [["stem", "根据专用软件的说明书，得知", "对于A先生要处分的PC，根据专用软件的说明书，得知"]], en: [["stem", "From the software's manual, the processing speed", "For the PCs Mr. A will dispose of, the software's manual shows that the processing speed"]] },
};

// q086 抽出表: 列字母が 1 列左にずれている (H は空列、I=通番 … O=総合評価)。表ブロックを機械的に 1 列右へシフトする。
function shiftExtractTable(s, headerStart) {
  const i = s.indexOf(headerStart); if (i < 0) return s;
  const lines = s.slice(i).split("\n"); const out = [];
  for (let k = 0; k < lines.length; k++) {
    const L = lines[k];
    if (k === 0) { // header: "| 　 | H 通番 | I 店舗 | J … | N 総合評価 | O |" → "| 　 | H | I 通番 | J 店舗 | … | O 総合評価 |"
      const cells = L.split("|").slice(1, -1).map((c) => c.trim()); // [corner, H x, I x, ..., O]
      const labels = cells.slice(1).map((c) => c.replace(/^[H-O]\s*/, "")).filter((_, idx) => idx < 7); // 7 labels under H..N
      out.push("| " + [cells[0] || "　", "H", ...labels.map((lab, idx) => `${"IJKLMNO"[idx]} ${lab}`)].join(" | ") + " |"); continue; // 角セルの全角空白は trim で消えるので復元
    }
    if (/^\|---/.test(L)) { out.push(L); continue; }
    if (!L.startsWith("|")) { out.push(...lines.slice(k)); break; } // end of table
    const cells = L.split("|").slice(1, -1).map((c) => c.trim()); // [rownum, c1..c8]
    if (cells.length !== 9 || cells[8] !== "") { out.push(L); continue; }
    out.push("| " + [cells[0], "", ...cells.slice(1, 8)].join(" | ") + " |");
  }
  return s.slice(0, i) + out.join("\n");
}
const TABLE_HEADERS = { jp: "| 　 | H 通番 |", zh: "| 　 | H 序号 |", en: "| 　 | H No. |" };

// ── 解説 ──────────────────────────────────────────────────────────────────────
const EXPL = {
  "2018h30h-q039": {
    jpSub: [["correct_jp", "受付後30分以内に各利用部門", "受付後20分以内に各利用部門"], ["correct_jp", "30分以内を満たし", "20分以内を満たし"]],
    distractors: {
      "ア": { jp: "障害発生の連絡が受付の30分後であり、「20分以内に障害発生を連絡する」という規定を超過している。復旧連絡自体は30分後（2時間以内）だが、発生連絡の期限を守れていないため不遵守。",
              zh: "故障发生的通知是在受理 30 分钟后才发出，超过了「在 20 分钟以内通知故障发生」的规定。故障恢复通知本身在 30 分钟后（属于 2 小时以内），但发生通知的期限没能遵守，因此不遵守。",
              en: "The fault-occurrence notification is sent 30 minutes after receipt, exceeding the rule to notify the fault occurrence within 20 minutes. The recovery notification itself is at 30 minutes (within 2 hours), but the deadline for the occurrence notification is not met, so it does not comply." },
      "ウ": { jp: "部門Bの管理者への障害発生連絡が受付の30分後で、20分以内の規定を超過している（部門Aは10分でよいが、Bが期限超過）。1つでも条件を欠くと遵守にならない。",
              zh: "向部门B 的管理者通知故障发生是在受理 30 分钟后，超过了 20 分钟以内的规定（部门A 是 10 分钟没问题，但部门B 超过了期限）。只要缺一个条件，就不算遵守。",
              en: "The fault-occurrence notification to the manager of Department B is 30 minutes after receipt, exceeding the within-20-minutes rule (Department A at 10 minutes is fine, but B exceeds the deadline). Missing even one condition means it does not comply." },
    },
    pointsJpSub: [["発生連絡=30分以内", "発生連絡=20分以内"]],
    trAll: [["30 分钟以内", "20 分钟以内"], ["within 30 minutes", "within 20 minutes"], ["within-30-minutes", "within-20-minutes"], ["30 分钟／", "20 分钟／"], ["30 minutes /", "20 minutes /"]],
  },
  "2018h30h-q064": { deepAll: [["srv91", "srv01"]] },
  "2018h30h-q090": { distSub: { "ウ": { jp: [["「プロセスの導入，運用を行う」", "「プロセス及び手順の導入，運用を行う」"]], zh: [["「导入并运行流程」", "「导入并运行流程及步骤」"]], en: [["'Introduce and operate the processes'", "'Introduce and operate the processes and procedures'"]] } } },
  "2018h30h-q049": { distSub: { "エ": { jp: [["図った行政機関」", "図った行政機構」"]], zh: [["行政机关", "行政机构"]], en: [["administrative agency", "administrative organization"]] } } },
  "2025r07-q059": { distSub: { "イ": { jp: [["(なお選択肢中の規格番号表記は誤記で正しくは JIS Q 27001)", ""]], zh: [["（此外选项中的标准编号写法有误，正确应为 JIS Q 27001）", ""]], en: [[" (note: the standard number shown in the choice is a typo; it should be JIS Q 27001)", ""]] } } },
};

// ── key_guard final note (D-143) ───────────────────────────────────────────────
const MARK = "fidfix-S117-batch2";
const NOTE_SENT = { // 腐敗を述べた文を差し替え (差し替え文は token を含まない)
  "2018h30h-q017": { match: /小売店舗綱/, replace: `選択肢エの「網」の字形誤りは S117 に page-09 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2018h30h-q020": { match: /自由奏放/, replace: `選択肢ア「自由奔放」の字形誤り (奔→奏) は S117 に page-10 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2018h30h-q048": { match: /ーーつ|字化け/, replace: `選択肢エ先頭の余剰長音記号は S117 に page-22 実読 (双 pass 一致) で除去済 (${MARK})` },
  "2018h30h-q052": { match: /OCR ノイズ/, replace: `選択肢エ末尾のスキャン汚れ由来の記号は S117 に page-23 実読 (双 pass 一致) で除去済 (${MARK})` },
  "2018h30h-q070": { match: /轟威/, replace: `選択肢ア「脅威」の字形誤り (脅→轟) は S117 に page-31 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2018h30h-q091": { match: /『こう』/, replace: `選択肢イ末尾に流入していた次肢のルビは S117 に page-40 実読 (双 pass 一致) で除去済 (${MARK})` },
  "2018h30h-q097": { match: /角罪/, replace: `正解肢イ「犯罪」の字形誤り (犯→角) は S117 に page-43 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2025r07-q017": { match: /eg 8 了/, replace: `選択肢エ末尾のノンブル由来ノイズは S117 に page-08 実読 (双 pass 一致) で除去済 (${MARK})` },
  "2025r07-q031": { match: /ナシステム/, replace: `選択肢ウの混入字 (行折り返し位置の引用符、余剰の「ナ」) は S117 に page-14 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2025r07-q059": { match: /27991/, replace: `選択肢イの規格番号の字形誤り (0→9) は S117 に page-28 実読 (双 pass 一致) で JIS Q 27001 に是正済 (${MARK})` },
  "2015h27a-q061": { match: /ハイフン/, replace: `選択肢エ末尾のスキャン汚れ由来の記号は S117 に page-24 実読 (双 pass 一致) で除去済 (${MARK})` },
};
const NOTE_FULL = {
  "2018h30h-q039": `図なしの論理問。stem_jp_clean (権威) を採用。SLA 2 条件 = (1) 発生連絡は受付後 20 分以内に各利用部門 A・B の管理者へ、(2) 復旧連絡は受付後 2 時間以内に解決し通報者 C 及び A・B の管理者へ。エ = 15 分後に A・B へ発生連絡 (20 分以内○)、1 時間後に C + A・B へ復旧連絡 (2 時間以内かつ連絡先完備○) で両条件を満たす → エ。ア = 発生連絡 30 分 > 20 分で違反、イ = 復旧連絡に通報者 C 欠落で違反、ウ = 部門 B への発生連絡 30 分 > 20 分で違反。導出 = エ、stored key = エ と一致。S117: SLA の閾値 (源 20 分 → 30 分に腐敗) と選択肢ア・ウの時刻 (源 30 分 → 39 分)・イの時刻 (源 10 分 → 1 分) を page-18 実読 (双 pass 一致) で是正済 (${MARK})。腐敗値のままでは源のアが「30 分以内」を満たして正解に見えたため answer_affecting 級の差分だったが、是正後は正解の見え方は源どおりエで不変。round-1 は腐敗した閾値 30 分を前提に「39 > 30 で違反」と導出しており、結論は偶然一致していた。`,
  "2018h30h-q064": `図はなく、stem_jp_clean だけで導出可能。URL「http://srv01.ipa.go.jp/abc.html」を分解すると、http がスキーム (通信プロトコル)、srv01.ipa.go.jp が FQDN、そのうち ipa.go.jp がドメイン名、先頭ラベル srv01 がそのドメインに属する個々のコンピュータ (Web サーバ) を指すホスト名、末尾 /abc.html が取得ファイルのパスとなる。よって srv01 はホスト名を表し、エが導出される (stored key と一致)。S117: 設問文のホスト名 (源 srv01 → srv91 に腐敗、2 箇所) と正解肢エのドメイン名 (源 ipa.go.jp → ipa.9o.jp に腐敗)、肢アの閉じ引用符脱落を page-28 実読 (双 pass 一致) で是正済 (${MARK})。腐敗状態では正解肢エのドメイン名が設問文の URL と食い違っており answer_affecting 級だったが、是正後は源どおりエで不変。round-1 は「ipa.9o.jp は答えに影響しない」と記していた。`,
};

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0]; const opt = { all: !!fx.all };
  const q = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[q, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`, opt);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`, opt);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`, opt);
    } else for (const [o, w] of [[q, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`, opt);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`, opt); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`, opt); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`, opt); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`, opt); }
  }
  if (id === "2015h27a-q086") { // 既適用分の角セル復元 (初版が全角空白を trim していた)
    for (const [obj, key] of [[t, "stem_jp_clean"], [t.stem, "zh"], [t.stem, "en"]]) if (typeof obj?.[key] === "string" && obj[key].includes("\n|  | H | I ")) { obj[key] = obj[key].replace("\n|  | H | I ", "\n| 　 | H | I "); applied++; log.push(`  ✓ ${id} ${key}: 角セル復元`); }
  }
  if (id === "2015h27a-q086") { // 抽出表の列シフト (clean / zh / en / .phase1)
    for (const [obj, key, hdr, w] of [[t, "stem_jp_clean", TABLE_HEADERS.jp, "translations.stem_jp_clean"], [t.stem, "zh", TABLE_HEADERS.zh, "translations.stem.zh"], [t.stem, "en", TABLE_HEADERS.en, "translations.stem.en"],
      ...(t1 ? [[t1, "stem_jp_clean", TABLE_HEADERS.jp, ".phase1 tr_.stem_jp_clean"], [t1.stem, "zh", TABLE_HEADERS.zh, ".phase1 tr_.stem.zh"], [t1.stem, "en", TABLE_HEADERS.en, ".phase1 tr_.stem.en"]] : [])]) {
      if (typeof obj?.[key] !== "string") continue;
      const before = obj[key]; const after = shiftExtractTable(before, hdr);
      if (after !== before) { obj[key] = after; applied++; log.push(`  ✓ ${id} ${w}: 抽出表の列字母を 1 列シフト (H 空列, I=通番 … O=総合評価)`); } else skipped++;
    }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); const j = rj(jf), tr = rj(tf);
  for (const [k, f, t] of ex.jpSub ?? []) sub(j, k, f, t, `${id} expl_jp.${k}`);
  for (const [f, t] of ex.pointsJpSub ?? []) j.points_jp = j.points_jp.map((p) => { if (p.includes(f)) { applied++; log.push(`  ✓ ${id} points_jp: 「${f}」→「${t}」`); return p.replace(f, t); } return p; });
  for (const [L, d] of Object.entries(ex.distractors ?? {})) { const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (dj.why_wrong_jp !== d.jp) { dj.why_wrong_jp = d.jp; applied++; log.push(`  ✓ ${id} expl_jp.${L}: rewritten`); } else skipped++;
    if (dt.zh !== d.zh || dt.en !== d.en) { dt.zh = d.zh; dt.en = d.en; applied++; log.push(`  ✓ ${id} expl_tr.${L}: rewritten`); } else skipped++; }
  for (const [L, d] of Object.entries(ex.distSub ?? {})) { const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    for (const [f, t] of d.jp ?? []) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${L}`); for (const [f, t] of d.zh ?? []) sub(dt, "zh", f, t, `${id} expl_tr.${L}.zh`); for (const [f, t] of d.en ?? []) sub(dt, "en", f, t, `${id} expl_tr.${L}.en`); }
  for (const [f, t] of ex.trAll ?? []) { // expl_tr 全体 (correct / distractors / points) に全置換
    const walk = (o) => { for (const k of Object.keys(o)) { if (typeof o[k] === "string") { if (o[k].includes(f)) { const n = o[k].split(f).length - 1; o[k] = o[k].split(f).join(t); applied += n; log.push(`  ✓ ${id} expl_tr ${k}: 「${f}」→「${t}」 ×${n}`); } } else if (o[k] && typeof o[k] === "object") walk(o[k]); } };
    walk(tr);
  }
  for (const [f, t] of ex.deepAll ?? []) { for (const doc of [j, tr]) { const walk = (o) => { for (const k of Object.keys(o)) { if (typeof o[k] === "string") { if (o[k].includes(f)) { const n = o[k].split(f).length - 1; o[k] = o[k].split(f).join(t); applied += n; } } else if (o[k] && typeof o[k] === "object") walk(o[k]); } }; walk(doc); } log.push(`  ✓ ${id} expl_jp/expl_tr: 「${f}」→「${t}」 (deep)`); }
  wj(jf, j); wj(tf, tr);
}

for (const [id, nf] of Object.entries(NOTE_SENT)) {
  const exam = id.split("-q")[0]; const r = GR[exam].results.find((x) => x.id === id); if (!r?.key_guard) throw new Error(id);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  const sents = r.key_guard.note_jp.split("。"); const idx = sents.findIndex((s) => nf.match.test(s));
  if (idx < 0) { log.push(`  ⚠ ${id}: note sentence not found for ${nf.match}`); skipped++; continue; }
  sents.splice(idx, 1, nf.replace); r.key_guard.note_jp = sents.join("。").replace(/。。/g, "。"); applied++; log.push(`  ✓ ${id} final note: 腐敗記述 1 文を差し替え (round1 untouched)`);
}
for (const [id, note] of Object.entries(NOTE_FULL)) {
  const exam = id.split("-q")[0]; const r = GR[exam].results.find((x) => x.id === id); if (!r?.key_guard) throw new Error(id);
  if (r.key_guard.note_jp !== note) { r.key_guard.note_jp = note; applied++; log.push(`  ✓ ${id} final note: 全文書き換え (round1 untouched)`); } else skipped++;
}
for (const e of exams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S117-batch2: applied ${applied}, skipped ${skipped}`);
