#!/usr/bin/env node
// Stage 6 / Quiz — S117 ① 本番 batch 1 (2022r04 / 2020r02o / 2016h28h) の保真核験差分を是正する。
// 源: S117 log §13 の 8 workflow (A = s7x 双 pass 68 問、B-note = 2016h28h 13 問)。差分 43 (双 pass 一致 41 + 片側 2)。
// 見送り: 2022r04-q097「〔図〕IoTシステム構成図」(cr のみ、図テキスト化の見出しマーカー = dataset 規約、源の文言ではないが誤りでもない)。
//
// 層は quiz-fidfix-S117-pilot.mjs と同じ: JP (questions / question_bank / by_year / translations.stem_jp_clean / .phase1 tr_ clean)、
// zh/en (translations sidecar + .phase1 tr_ — **translations は再 merge 禁止**)、解説 (.phase2 expl_jp/expl_tr → 再 merge)、
// key_guard final note (.phase2 generate_result、D-143: 腐敗を記述している文だけを現在形に書き換え、round1 不可触)。
// Run: node scripts/quiz-fidfix-S117-batch1.mjs [--dry-run]  → node scripts/quiz-phase2-merge.mjs {2022r04,2020r02o,2016h28h}

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0; const log = [];

function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  obj[key] = s.replace(from, to); applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 36)}」→「${to.slice(0, 36)}」`); return true;
}

// ── 差分表 (field: "stem" | ア..エ) ───────────────────────────────────────────────
const FIX = {
  // 2016h28h — A 側
  "2016h28h-q012": { jp: [["stem", "B社は，A社の製品も", "B社では，A社の製品も"]] },
  "2016h28h-q022": { jp: [["stem", "利用者数は毎年4,000人で一定", "利用者は毎年4,000人で一定"]] },
  "2016h28h-q033": { jp: [["stem", "地点XからYまで行く", "地点Xから地点Yまで行く"]], zh: [["stem", "从地点X到Y的最短时间", "从地点X到地点Y的最短时间"]], en: [["stem", "travel from point X to Y?", "travel from point X to point Y?"]] },
  "2016h28h-q054": { jp: [["ア", "プロジェクトに参加する", "プロジェクトに参画する"], ["イ", "作業効率上などの恩恵", "作業効率向上などの恩恵"]] },
  "2016h28h-q086": {
    jp: [["ウ", "パスワードなどを盗み入手する。", "パスワードなどを不正に入手する。"], ["エ", "ソフトウェアをダウンロードさせる。", "ソフトウェアをダウンロードする。"]],
    zh: [["ウ", "盗取并获取密码等信息。", "非法获取密码等信息。"], ["エ", "让用户下载一旦运行就会进行非法操作的软件。", "用户一旦运行，就会下载进行非法操作的软件。"]],
    en: [["ウ", "to steal passwords and other information.", "to illegitimately obtain passwords and other information."], ["エ", "Getting users to download software that performs malicious operations when run.", "When run by the user, it downloads software that performs malicious operations."]],
  },
  "2016h28h-q098": { jp: [["stem", "点灯消灯の操作", "点灯／消灯の操作"]] },
  // 2016h28h — B-note 側 (選択肢の OCR 崩れ)
  "2016h28h-q007": { jp: [["イ", "洞穴できること", "洞察できること"]] },
  "2016h28h-q015": { jp: [["ア", "成部度", "成熟度"], ["エ", "体系的に示したもの7 ドー", "体系的に示したもの"]] },
  "2016h28h-q023": { jp: [["エ", "実用新案権。 著作権, 特許権", "実用新案権, 著作権, 特許権"]] },
  "2016h28h-q039": { jp: [["イ", "適切なかモニタリング", "適切なモニタリング"]] },
  "2016h28h-q043": { jp: [["エ", "検証する。” 宝一", "検証する。"]] },
  "2016h28h-q045": { jp: [["ア", "自社シルステム", "自社システム"], ["ウ", "自社ルステム", "自社システム"], ["エ", "自社ルステム", "自社システム"]] },
  "2016h28h-q058": { jp: [["ア", "導入する。ぜい", "導入する。"]] },
  "2016h28h-q059": { jp: [["ア", "TInternet Explorer", "Internet Explorer"], ["イ", "TInternet Explorer", "Internet Explorer"], ["ウ", "「Firefox", "Firefox"]] },
  "2016h28h-q063": { jp: [["ウ", "網黄した", "網羅した"]] },
  "2016h28h-q068": { jp: [["ア", "もつつ機器", "もつ機器"], ["イ", "もつつ機器", "もつ機器"]] },
  "2016h28h-q075": { jp: [["ウ", "切り替と オンライ ン処理", "切り替え, オンライン処理"], ["エ", "分散Hする", "分散する"]] },
  "2016h28h-q092": { jp: [["エ", "バックアップファイルーれー", "バックアップファイル"]] },
  "2016h28h-q093": { jp: [["ウ", "登録しておけぱば,", "登録しておけば,"]] },
  // 2020r02o
  "2020r02o-q048": {
    jp: [["ウ", "指揮命令の多寡によって報酬を確定させる契約", "指摘事項の多寡によって報酬を確定できる契約"]],
    zh: [["ウ", "签订根据指挥命令的多少来确定报酬的合同并实施审计。", "签订可根据指出事项的多少来确定报酬的合同并实施审计。"]],
    en: [["ウ", "Enter into a contract that determines the remuneration based on the degree of supervisory command, and conduct the audit.", "Enter into a contract under which the remuneration can be determined by the number of findings, and conduct the audit."]],
  },
  "2020r02o-q083": { jp: [["ア", "デジタルサイネージ", "ディジタルサイネージ"]] },
  "2020r02o-q094": {
    jp: [["ア", "| ア | 可用性 | 完全性 | 完全性 |", "| ア | 可用性 | 完全性 | 機密性 |"], ["ウ", "| ウ | 完全性 | 可用性 | 完全性 |", "| ウ | 完全性 | 可用性 | 機密性 |"]],
    zh: [["ア", "| ア | 可用性 | 完整性 | 完整性 |", "| ア | 可用性 | 完整性 | 机密性 |"], ["ウ", "| ウ | 完整性 | 可用性 | 完整性 |", "| ウ | 完整性 | 可用性 | 机密性 |"]],
    en: [["ア", "| ア | Availability | Integrity | Integrity |", "| ア | Availability | Integrity | Confidentiality |"], ["ウ", "| ウ | Integrity | Availability | Integrity |", "| ウ | Integrity | Availability | Confidentiality |"]],
  },
  "2020r02o-q095": {
    jp: [["stem", "1 Gバイト＝10⁹ Bバイトとする。", "1 Gバイト＝10³ Mバイトとする。"], ["stem", "1 Gバイト＝10⁹ バイトとする。", "1 Gバイト＝10³ Mバイトとする。"]],
    zh: [["stem", "设 1 GB＝10⁹ 字节。", "设 1 GB＝10³ MB。"]],
    en: [["stem", "let 1 GB = 10⁹ bytes.", "let 1 GB = 10³ MB."]],
  },
  // 横断: 全 corpus の表示層走査で見つかった同族 (「適切なか」= 「適切な」への「か」混入、2016h28h-q039 と同型)
  "2017h29h-q036": { jp: [["ウ", "適切なかセキュリティ", "適切なセキュリティ"]] }, // 選択肢イ (raw stem の「適切なかもの」は clean で解消済)
  // 2022r04
  "2022r04-q046": { jp: [["ウ", "b, c", "b, d"]], zh: [["ウ", "b, c", "b, d"]], en: [["ウ", "b, c", "b, d"]] },
  "2022r04-q060": { jp: [["ウ", "b: A 社の秘密鍵", "b: A 社の公開鍵"]] },
  "2022r04-q090": { jp: [["stem", "組合せで、最も適切な", "組合せとして、最も適切な"]] },
  "2022r04-q098": { jp: [["stem", "| H004 | 午前桜子 | G02 |", "| H004 | 午前桜子 | G03 |"]], zh: [["stem", "| H004 | 午前樱子 | G02 |", "| H004 | 午前樱子 | G03 |"]], en: [["stem", "| H004 | Sakurako Gozen | G02 |", "| H004 | Sakurako Gozen | G03 |"]] },
};

// ── 解説の書き換え (腐敗テキストを前提に書かれていた誤答理由) ─────────────────────
const EXPL = {
  "2020r02o-q048": { letter: "ウ",
    jp: "指摘事項の多寡によって報酬が決まる契約 (成功報酬型) は、指摘を増やす、あるいは減らす動機を監査人に与え、監査に不可欠な独立性・客観性を損なう。報酬体系で中立性が揺らぐ形は不適切。",
    zh: "根据指出事项的多少来决定报酬的合同（成功报酬型），会给审计人带来增加或减少指出事项的动机，损害审计不可或缺的独立性与客观性。以报酬体系动摇中立性的做法是不恰当的。",
    en: "A contract in which the remuneration depends on the number of findings (a success-fee arrangement) gives the auditor an incentive to inflate or suppress findings, undermining the independence and objectivity essential to an audit. A fee structure that shakes neutrality is inappropriate." },
  "2022r04-q046": { letter: "ウ",
    jp: "d「無停電電源装置の設置」は設備・電源環境の維持でファシリティマネジメントに該当するが、b「マルウェア対策ソフトの導入と更新管理」は情報セキュリティ管理であり該当しない。また該当する a「入退館の管理」を落としているため、a と d の両方を挙げた組合せになっておらず誤り。",
    zh: "d「安装不间断电源装置」属于设施与电源环境的维护，属于设施管理；但 b「引入并更新管理恶意软件防护软件」属于信息安全管理，不属于设施管理。此外还漏掉了应当包含的 a「出入馆管理」，没有把 a 与 d 都列出，因此错误。",
    en: "d (installing an uninterruptible power supply) is maintenance of the facility and power environment and does belong to facility management, but b (introducing and updating anti-malware software) is information security management and does not. It also omits a (controlling entry to the building), so it fails to list both a and d and is wrong." },
  "2016h28h-q086": { letter: "エ", subJp: [["ソフトウェアをダウンロードさせるのは", "ソフトウェアをダウンロードするのは"]],
    subZh: [["让用户下载一旦运行就会进行非法操作的软件，", "一旦运行就会下载进行非法操作的软件，"]],
    subEn: [["Getting users to download software that performs malicious operations when run is", "Software that, when run, downloads software performing malicious operations is"]] },
};

// ── key_guard final note: 腐敗を記述した文を現在形に差し替え (D-143、round1 不可触) ──────────────
// match = 差し替え対象の文を特定する正規表現 (文単位 = 「。」区切り)、replace = 新しい文 (末尾「。」なし)
const NOTES = {
  "2016h28h-q007": { match: /洞穴/, replace: "選択肢イ「洞穴できること」→「洞察できること」は S117 に page-04 実読 (双 pass 一致) で是正済 (fidfix-S117-batch1)。round-1 は当該箇所を誤答肢の字形腐敗として記録していた" },
  "2016h28h-q015": { match: /成部度/, replace: "選択肢ア「成部度」→「成熟度」(正解肢上の非語)、選択肢エ末尾のノンブル由来ノイズ「7 ドー」は S117 に page-07 実読 (双 pass 一致) で是正済 (fidfix-S117-batch1)。round-1 は両者を choice レベルの OCR ノイズとして記録していた" },
  "2016h28h-q023": { match: /句点になった/, replace: "選択肢エの区切り「実用新案権。 著作権」→「実用新案権, 著作権」は S117 に page-11 実読 (双 pass 一致) で是正済 (fidfix-S117-batch1)" },
  "2016h28h-q039": { match: /適切なか/, replace: "選択肢イの混入字「適切なかモニタリング」→「適切なモニタリング」は S117 に page-18 実読 (双 pass 一致) で是正済 (fidfix-S117-batch1)" },
  "2016h28h-q043": { match: /宝一/, replace: "選択肢エ末尾の OCR ノイズ「” 宝一」は S117 に page-20 実読 (双 pass 一致) で除去済 (fidfix-S117-batch1)" },
  "2016h28h-q045": { match: /シルステム/, replace: "選択肢ア「自社シルステム」・ウ/エ「自社ルステム」→「自社システム」は S117 に page-21 実読 (双 pass 一致) で是正済 (fidfix-S117-batch1)" },
  "2016h28h-q058": { match: /ぜい/, replace: "選択肢ア末尾に流入していた次行ルビ「ぜい」は S117 に page-27 実読 (双 pass 一致) で除去済 (fidfix-S117-batch1)" },
  "2016h28h-q059": { match: /TInternet/, replace: "選択肢ア/イ先頭の「T」、ウ (正解肢) 先頭の「「」は S117 に page-28 実読 (双 pass 一致) で除去済 (fidfix-S117-batch1)" },
  "2016h28h-q063": { match: /網黄/, replace: "選択肢ウ「網黄した」→「網羅した」は S117 に page-29 実読 (双 pass 一致) で是正済 (fidfix-S117-batch1)" },
  "2016h28h-q068": { match: /もつつ/, replace: "選択肢ア (正解肢)/イ「もつつ機器」→「もつ機器」は S117 に page-31 実読 (双 pass 一致) で是正済 (fidfix-S117-batch1)" },
  "2016h28h-q075": { match: /切り替と/, replace: "選択肢ウ「切り替と オンライ ン」→「切り替え, オンライン」、エ「分散Hする」→「分散する」は S117 に page-33 実読 (双 pass 一致) で是正済 (fidfix-S117-batch1)" },
  "2016h28h-q092": { match: /ーれー/, replace: "選択肢エ末尾の OCR ノイズ「ーれー」は S117 に page-41 実読 (双 pass 一致) で除去済 (fidfix-S117-batch1)" },
  "2016h28h-q093": { match: /おけぱば/, replace: "選択肢ウ「登録しておけぱば」→「登録しておけば」は S117 に page-41 実読 (双 pass 一致) で是正済 (fidfix-S117-batch1)" },
};

// ── 適用 ─────────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

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
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
  const j = rj(jf), tr = rj(tf); const dj = j.distractors_jp.find((d) => d.letter === ex.letter), dt = tr.distractors.find((d) => d.letter === ex.letter);
  if (ex.jp) { if (dj.why_wrong_jp !== ex.jp) { dj.why_wrong_jp = ex.jp; applied++; log.push(`  ✓ ${id} expl_jp.${ex.letter}: rewritten`); } else skipped++;
    if (dt.zh !== ex.zh || dt.en !== ex.en) { dt.zh = ex.zh; dt.en = ex.en; applied++; log.push(`  ✓ ${id} expl_tr.${ex.letter}: rewritten`); } else skipped++; }
  for (const [f, t] of ex.subJp ?? []) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${ex.letter}`);
  for (const [f, t] of ex.subZh ?? []) sub(dt, "zh", f, t, `${id} expl_tr.${ex.letter}.zh`);
  for (const [f, t] of ex.subEn ?? []) sub(dt, "en", f, t, `${id} expl_tr.${ex.letter}.en`);
  wj(jf, j); wj(tf, tr);
}

for (const [id, nf] of Object.entries(NOTES)) {
  const exam = id.split("-q")[0]; const r = GR[exam].results.find((x) => x.id === id); if (!r?.key_guard) throw new Error(id);
  if (r.key_guard.note_jp.includes("fidfix-S117-batch1")) { skipped++; continue; } // 冪等性: 差し替え文自体が token を含むため、適用済みマーカーで判定
  const sents = r.key_guard.note_jp.split("。"); const idx = sents.findIndex((s) => nf.match.test(s));
  if (idx < 0) { skipped++; continue; }
  // 腐敗を述べた文 (と、それに続く同一話題の文があれば 1 文まで) を差し替える
  const drop = (idx + 1 < sents.length && /choice-OCR|答えには影響|正解の判定|cosmetic|別トラック|backlog/.test(sents[idx + 1])) ? 2 : 1;
  sents.splice(idx, drop, nf.replace); r.key_guard.note_jp = sents.join("。").replace(/。。/g, "。");
  applied++; log.push(`  ✓ ${id} final note: 腐敗記述 ${drop} 文を現在形に差し替え (round1 untouched)`);
}
for (const e of exams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S117-batch1: applied ${applied}, skipped ${skipped}`);
