#!/usr/bin/env node
// Stage 6 / Quiz (Session 101, D-140 scale 方針) — OCR-garble cleanup fix list +
// canonical fixes JSON generator (single source of truth).
//
// The Session-100 deterministic detector (scripts/quiz-ocr-garble-scan.mjs) found 74
// candidate hits across 55 questions. 主 context adjudicated every hit against the
// zh/en translations (the Phase-1 translator saw through the OCR garble → authoritative
// meaning reference) and the IPA source page images (data/ip/exams/pages/<exam>/). The
// result: 57 choices_jp fields carry real OCR garble; the remaining hits are FALSE
// POSITIVES that must NOT be touched (see FALSE_POSITIVES below).
//
// Only `to` (the cleaned full-field text) is authored by hand; `from` (exact current
// value), zh, en and the source page are pulled from the data files so there is zero
// whitespace transcription risk. Each fix is a FULL-FIELD replacement → maximally
// drift-proof: the applier asserts choices_jp[L] === from before setting it to `to`.
//
// Display note (quizModel.ts:117): the app shows stem_jp_clean (translation sidecar)
// for stems, so the 6 stem hits — all legitimate diagram boxes [　　]/[…] or IPA list
// spacing in stem_jp_clean — are FALSE POSITIVES (display already clean). Choices have
// no clean sidecar: choices_jp (raw bank) IS displayed, so all real garble is here.
//
// Run:  node scripts/quiz-ocr-cleanup-S101.fixes.mjs   (writes the fixes JSON)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BANK = path.join(ROOT, "data/ip/exams/question_bank.json");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const OUT = path.join(ROOT, "evidence/phase5/stage_06_quiz_ocr_cleanup/ocr_cleanup_fixes_S101.json");

// Each fix: {id, L, to, cls, why}. `to` = full cleaned choices_jp[L].
// cls ∈ zero_in_alpha | trailing_junk | page_marker | period_comma | ascii_period_in_jp.
const FIXES = [
  // ── ascii_period_in_jp (。/、 OCR → ASCII comma, or spurious period removal) ─────
  { id: "2009h21a-q006", L: "ア", cls: "ascii_period_in_jp",
    to: "サービス提供事業者が, インターネット経由で業務ソフトウェアを提供するサービス",
    why: "が.→が, (OCR 、); strip trailing spaces+「 junk." },
  { id: "2009h21a-q063", L: "エ", cls: "ascii_period_in_jp",
    to: "複数の媒体にまたがるデータの格納領域を, 一つの連続した格納領域に見せかける。",
    why: "見せかけ.る→見せかける (spurious mid-word .); strip trailing ' 「 junk." },
  { id: "2010h22h-q047", L: "イ", cls: "ascii_period_in_jp",
    to: "テスト仕様は, システム要件を定義する際に作成する。",
    why: "は.→は, (OCR 、); 定義むする→定義する (spurious む)." },
  { id: "2011h23a-q066", L: "イ", cls: "ascii_period_in_jp",
    to: "OSS の利用者は, その OSS を販売したり, 無料配布したりすることはできない。",
    why: "は.→は, (OCR 、)." },
  { id: "2012h24h-q024", L: "ア", cls: "ascii_period_in_jp",
    to: "仕事のプロセスで発生する可能性がある障害をあらかじめ予測し, 対応策を計画する。",
    why: "計.     画→計画 (spurious . + spaces splitting word)." },
  { id: "2013h25h-q005", L: "エ", cls: "ascii_period_in_jp",
    to: "品質, コスト, 納期の目標値と優先順位を設定する。",
    why: "品質.→品質, (OCR 、)." },
  { id: "2015h27h-q058", L: "ア", cls: "ascii_period_in_jp",
    to: "自己複製し, ネットワークなどを経由して感染を拡大するウイルスの一種",
    why: "複製し.→複製し, (OCR 、)." },
  { id: "2017h29h-q019", L: "ウ", cls: "ascii_period_in_jp",
    to: "業務要件を実現するために必要なシステムの機能, システム構成条件",
    why: "機能.→機能, (OCR 、)." },
  { id: "2019r01a-q029", L: "ア", cls: "ascii_period_in_jp",
    to: "SNS に立ち上げたコミュニティの参加者に, そのコミュニティの目的に合った検索結果を表示する。",
    why: "参加者に.→参加者に, (OCR 、)." },
  { id: "2021r03-q001", L: "エ", cls: "ascii_period_in_jp",
    to: "データ項目を詳細に検討し, データベースの実装方法を明らかにする。",
    why: "検討し.→検討し, (OCR 、)." },
  { id: "2021r03-q020", L: "エ", cls: "ascii_period_in_jp",
    to: "ヘルプデスクの画面に, システムの使い方についての問合せを文字で入力すると, 会話形式で応答を得ることができるようになった。",
    why: "画面に.→画面に, (OCR 、); strip trailing ー 舌 一 junk." },
  { id: "2022r04-q069", L: "エ", cls: "ascii_period_in_jp",
    to: "本文中に他者への転送を促す文言が記述された迷惑な電子メールが, 不特定多数を対象に, ネットワーク上で次々と転送されること",
    why: "対象に.→対象に, (OCR 、, page-31 confirmed); strip trailing こ 8 junk → ends 「されること」." },
  { id: "2025r07-q057", L: "エ", cls: "ascii_period_in_jp",
    to: "Web サーバのコンテンツが検索結果の上位に表示されるように, その Web サーバが管理するコンテンツを書き換える。",
    why: "その.→その (spurious . before noun Webサーバ)." },
  { id: "2026r08-q091", L: "ウ", cls: "ascii_period_in_jp",
    to: "同じハッシュ関数を用いる場合, 入力したデータが同じであれば, 得られるハッシュ値は常に同じになる。",
    why: "場合.→場合, (OCR 、)." },
  { id: "2019h31h-q084", L: "エ", cls: "ascii_period_in_jp",
    to: "利用者の PC やタブレットに内蔵された補助記憶装置の容量を増やせば, オンラインストレージの容量も自動的に増える。",
    why: "strip trailing ー. 超過 junk (sentence ends 増える。)." },

  // ── zero_in_alpha (digit 0 misread for letter O / spurious 0) ──────────────────
  { id: "2009h21h-q084", L: "ア", cls: "zero_in_alpha",
    to: "PCをネットワークから切り離した後, OS の再インストールをする。", why: "0S→OS (zh/en=OS)." },
  { id: "2010h22a-q054", L: "ウ", cls: "zero_in_alpha",
    to: "コンピュータの機種や OS に依存しないソフトウェアが開発できる, オブジェクト指向型の言語である。", why: "0S→OS." },
  { id: "2010h22h-q056", L: "ア", cls: "zero_in_alpha",
    to: "OS が異なっていても OS とアプリケーションプログラム間のインタフェースは統一されているので, アプリケーションプログラムは OS の種別を意識せずに処理を行うことができる。",
    why: "0S→OS (2nd occurrence; 1st OS already correct)." },
  { id: "2012h24a-q067", L: "エ", cls: "zero_in_alpha",
    to: "マルチプログラミング環境で, 実行可能な状態にあるプロセスが, OS から割り当てられたCPU時間を使い切った状態", why: "0S→OS." },
  { id: "2012h24h-q004", L: "ア", cls: "zero_in_alpha",
    to: "OS などに存在するセキュリティ上の弱点を電気通信回線を通じて攻撃してコンピュータを不正利用する行為", why: "0S→OS." },
  { id: "2013h25a-q070", L: "ア", cls: "zero_in_alpha",
    to: "1台のPC に複数の OS をインストールしておき, 起動時に OS を選択できる。", why: "0S→OS ×2." },
  { id: "2013h25a-q070", L: "イ", cls: "zero_in_alpha",
    to: "OS はPC を起動させるためのアプリケーションプログラムであり, PC の起動後は, OS は機能を停止する。", why: "0S→OS ×2." },
  { id: "2013h25a-q070", L: "ウ", cls: "zero_in_alpha",
    to: "OS はグラフィカルなインタフェースをもつ必要があり, 全ての操作は, そのインタフェースで行う。", why: "0S→OS." },
  { id: "2013h25a-q070", L: "エ", cls: "zero_in_alpha",
    to: "OS は, ハードディスクドライブだけから起動することになっている。", why: "0S→OS." },
  { id: "2013h25h-q066", L: "ア", cls: "zero_in_alpha",
    to: "BIOS, OS, 常駐アプリケーションプログラム", why: "0S→OS (BIOS unchanged)." },
  { id: "2013h25h-q066", L: "イ", cls: "zero_in_alpha",
    to: "OS, BIOS, 常駐アプリケーションプログラム", why: "0S→OS." },
  { id: "2013h25h-q066", L: "ウ", cls: "zero_in_alpha",
    to: "OS, 常駐アプリケーションプログラム, BIOS", why: "0S→OS + BIO0S→BIOS." },
  { id: "2013h25h-q066", L: "エ", cls: "zero_in_alpha",
    to: "常駐アプリケーションプログラム, BIOS, OS", why: "0S→OS." },
  { id: "2014h26a-q050", L: "ウ", cls: "zero_in_alpha",
    to: "スマートフォンの購入時が最もセキュリティが高い状態なので, OS の更新はしないで使い続ける。", why: "0S→OS." },
  { id: "2014h26a-q053", L: "ウ", cls: "zero_in_alpha",
    to: "複数のコアはハードウェアだけによって制御され, OS に特別な機能は必要ない。", why: "0S→OS." },
  { id: "2014h26h-q078", L: "ア", cls: "zero_in_alpha",
    to: "1台のPCにインストールして起動することのできる OS は1 種類だけである。", why: "0S→OS." },
  { id: "2014h26h-q078", L: "イ", cls: "zero_in_alpha",
    to: "64 ビット CPU に対応する PC 用 OS は開発されていない。", why: "0S→OS." },
  { id: "2014h26h-q078", L: "ウ", cls: "zero_in_alpha",
    to: "OS のバージョンアップに伴い, 旧バージョンの OS 環境で動作していた全てのアプリケーションソフトは動作しなくなる。", why: "0S→OS ×2." },
  { id: "2014h26h-q078", L: "エ", cls: "zero_in_alpha",
    to: "PC の OS には, ハードディスク以外の CD-ROM や USB メモリなどの外部記憶装置を利用して起動できるものもある。", why: "0S→OS." },
  { id: "2015h27a-q005", L: "イ", cls: "zero_in_alpha",
    to: "サービス事業者から提供されるサーバ, OS 及び汎用データベースの機能を利用して, 自社の購買システムを構築し, インターネット経由で利用する。",
    why: "0S→OS + 構築し.→構築し, (combined ascii_period)." },
  { id: "2015h27a-q077", L: "エ", cls: "zero_in_alpha",
    to: "メーカやOSが異なる機器同士でも, 同じ通信プロトコルを使えば互いに通信することができる。", why: "0S→OS." },
  { id: "2015h27h-q066", L: "ア", cls: "zero_in_alpha",
    to: "OS やソフトウェアの動作を不安定にする。", why: "0S→OS." },
  { id: "2017h29h-q008", L: "エ", cls: "zero_in_alpha",
    to: "多くのPC 組立メーカが特定のメーカの半導体や OS を採用した。", why: "0S→OS." },
  { id: "2017h29h-q082", L: "エ", cls: "zero_in_alpha",
    to: "ハードディスクを初期化の上, OS を再インストールする。", why: "0S→OS." },
  { id: "2018h30h-q056", L: "ア", cls: "zero_in_alpha",
    to: "アプリケーションや OS ごとに特定の機能を割り当てられたキー", why: "0S→OS." },
  { id: "2018h30h-q083", L: "イ", cls: "zero_in_alpha",
    to: "PC の電源投入直後に起動され, OS が動作する前に, ハードディスクやキーボードなどに対する基本的な入出力ができるようにするソフトウェア", why: "0S→OS." },
  { id: "2019h31h-q088", L: "ア", cls: "zero_in_alpha",
    to: "OS やアプリケーションだけではなく, 機器に組み込まれたファームウェアも感染することがある。", why: "0S→OS." },
  { id: "2019h31h-q088", L: "ウ", cls: "zero_in_alpha",
    to: "感染が判明した PC はネットワークにつなげたままにして, 直ちに OS やセキュリティ対策ソフトのアップデート作業を実施する。", why: "0S→OS." },
  { id: "2019h31h-q089", L: "ア", cls: "zero_in_alpha",
    to: "OSを常に最新の状態で利用する。", why: "0S→OS." },
  { id: "2020r02o-q096", L: "ウ", cls: "zero_in_alpha",
    to: "どの製品も, ISO で定められたオープンソースライセンスによって同じ条件で提供されている。",
    why: "ISO0→ISO (spurious trailing 0; page-44 source literally reads ISO — blind re-derivation + 主 context high-mag crop confirmed I-S-O). NB: zh/en translator silently corrected ISO→OSI = translation-fidelity backlog, NOT patched into the JP source transcription." },
  { id: "2024r06-q091", L: "ア", cls: "zero_in_alpha",
    to: "OS が用意しているファイル削除の機能を使って, PC 内のデータファイルを全て削除する。", why: "0S→OS." },
  { id: "2025r07-q059", L: "ア", cls: "zero_in_alpha",
    to: "JIS Q 27001の要求事項及び組織自体が規定した要求事項によって定める監査基準への適合性だけでなく, ISMS 活動の組織に対する有効性も判定する。",
    why: "0Q→Q (spurious 0; zh/en=JIS Q 27001)." },
  { id: "2025r07-q068", L: "ア", cls: "zero_in_alpha",
    to: "OS やアプリケーションソフトウェアのセキュリティパッチを定期的に適用する。", why: "0S→OS." },

  // ── trailing_junk (drop trailing OCR noise after real content) ─────────────────
  { id: "2014h26h-q095", L: "エ", cls: "trailing_junk",
    to: "問題があれば差戻しを行う際の処理",
    why: "strip 「[マネジメント]」 = leaked 〔マネジメント〕 section header of next Q96 (page-43 confirmed)." },
  { id: "2015h27a-q037", L: "ウ", cls: "trailing_junk",
    to: "実行では, スケジュールやコストなどの予実管理やプロジェクト作業の変更管理を行う。", why: "strip trailing spaces+・." },
  { id: "2016h28h-q082", L: "ア", cls: "trailing_junk",
    to: "A", why: "single-letter answer; strip trailing spaces+。 (zh/en=A)." },
  { id: "2019h31h-q065", L: "エ", cls: "trailing_junk",
    to: "情報, 正当化, 動機", why: "strip trailing spaces+・." },
  { id: "2025r07-q014", L: "ア", cls: "trailing_junk",
    to: "CVC (Corporate Venture Capital)", why: "strip trailing spaces+] junk." },

  // ── page_marker (drop leaked 「ーー N …」 page-number markers) ──────────────────
  { id: "2012h24h-q013", L: "エ", cls: "page_marker",
    to: "民間への住民情報の公開を促進する。", why: "strip 「ーー 5 >」 page marker." },
  { id: "2015h27a-q014", L: "エ", cls: "page_marker",
    to: "コスト削減によって競合他社に対する優位性を築く。", why: "strip 「ーー 0 mi」 page marker." },
  { id: "2017h29h-q014", L: "エ", cls: "page_marker",
    to: "データの流れに着目し, 業務のデータの流れと処理の関係を表記する。", why: "strip 「ーー 6 9」 page marker." },
  { id: "2022r04-q010", L: "エ", cls: "page_marker",
    to: "複数の特許権者同士が, それぞれの保有する特許の実施権を相互に許諾すること",
    why: "strip 「にーー 5 =三」 (page-05 confirmed ends 「許諾すること」, the に is junk)." },

  // ── period_comma (「。 ,」 OCR) ────────────────────────────────────────────────
  { id: "2020r02o-q022", L: "エ", cls: "period_comma",
    to: "洋書に記載されている英文をカメラで読み取り, 要約された日本文として編集する。",
    why: "編集 。する。→編集する。 (spurious 。); strip trailing spaces+, junk." },
];

// Hits the detector flagged that are FALSE POSITIVES — recorded for the evidence trail,
// NEVER applied:
const FALSE_POSITIVES = [
  { id: "2023r05-q063", fields: ["stem", "choice.ア", "choice.イ", "choice.ウ", "choice.エ"],
    pattern: "zero_in_alpha", reason: "RAID0 / RAID1 are legitimate RAID levels (zh/en keep RAID0/RAID1)." },
  { id: "2014h26a-q089", fields: ["choice.ア", "choice.イ", "choice.ウ", "choice.エ"],
    pattern: "zero_in_alpha", reason: "ESSID A0B1C2D3E4 is a real alphanumeric identifier (zh/en identical)." },
  { id: "2009h21a-q044", fields: ["stem"], pattern: "trailing_junk/interior_fw_space",
    reason: "stem_jp_clean flow-diagram boxes [　　] → [ A ] → … are legitimate (raw stem_jp is clean; clean is what displays)." },
  { id: "2013h25h-q074", fields: ["stem"], pattern: "trailing_junk",
    reason: "stem_jp_clean diagram [ブラウザ] ― … ― [Webサーバ] ends in legitimate ] (clean displays)." },
  { id: "2015h27h-q009", fields: ["stem"], pattern: "interior_fw_space",
    reason: "IPA option-list full-width spacing a　アルバイト　　b　… (legitimate formatting; clean displays)." },
  { id: "2015h27h-q087", fields: ["stem"], pattern: "interior_fw_space",
    reason: "IPA list full-width spacing (legitimate; clean displays)." },
  { id: "2016h28h-q010", fields: ["stem"], pattern: "trailing_junk",
    reason: "stem_jp_clean diagram box [網掛け] ends in legitimate ] (raw stem_jp |・ junk is NOT displayed; clean displays)." },
];

// ── build the JSON (pull from/zh/en/page from data; only `to` is hand-authored) ──
const bank = JSON.parse(readFileSync(BANK, "utf-8"));
const byId = new Map(bank.questions.map((q) => [q.id, q]));
const trCache = new Map();
function tr(examId) {
  if (!trCache.has(examId)) {
    const f = path.join(TR_DIR, `${examId}.json`);
    trCache.set(examId, existsSync(f) ? JSON.parse(readFileSync(f, "utf-8")).questions : {});
  }
  return trCache.get(examId);
}

const records = [];
const errors = [];
for (const f of FIXES) {
  const q = byId.get(f.id);
  if (!q) { errors.push(`${f.id}: not in bank`); continue; }
  const from = q.choices_jp?.[f.L];
  if (typeof from !== "string") { errors.push(`${f.id} ${f.L}: choices_jp missing`); continue; }
  if (from === f.to) { errors.push(`${f.id} ${f.L}: from === to (already clean?)`); continue; }
  const examId = f.id.replace(/-q\d+$/, "");
  const t = tr(examId)[f.id];
  const page = q.source?.page_image ?? null;
  records.push({
    id: f.id, letter: f.L, cls: f.cls, why: f.why,
    from, to: f.to,
    zh: t?.choices?.[f.L]?.zh ?? null,
    en: t?.choices?.[f.L]?.en ?? null,
    correct_answer: q.correct_answer,
    page,
  });
}

if (errors.length) {
  console.error("✗ fixes generation errors:\n  " + errors.join("\n  "));
  process.exit(1);
}

writeFileSync(OUT, JSON.stringify({
  session: "S101", basis: "D-140 deterministic OCR-garble detector backlog (S100)",
  total_fixes: records.length, false_positives: FALSE_POSITIVES, fixes: records,
}, null, 2) + "\n");
console.log(`✓ wrote ${records.length} fixes + ${FALSE_POSITIVES.length} FP groups → ${path.relative(ROOT, OUT)}`);
const byCls = records.reduce((m, r) => ((m[r.cls] = (m[r.cls] || 0) + 1), m), {});
console.log("  by class:", JSON.stringify(byCls));
