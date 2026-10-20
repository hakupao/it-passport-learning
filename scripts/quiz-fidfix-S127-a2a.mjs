#!/usr/bin/env node
// Stage 6 / Quiz — S127 A track **A2a** (D-150 §4 段 1 の源照合、85 題 / 162 field / 24 exam) の採用差分を是正する。
// 源: S127 の workflow `wf_6a20e0f8-cee` (Sonnet 単 pass)。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/a2a_fidelity_multi_sn.json
//     マニフェスト = data/ip/quiz/.phase2/a2a_fidelity_input_multi.json (多 exam、precrop 72/85)
//     対象リスト (A1 名指し候補) = data/ip/quiz/.phase2/a2a_targets_S127.json
//     機械 diff → same 410 / AGENT_MISSED 6 / UNREADABLE 1 (evidence/quiz_A2a_S127.md §3)
//
// 層・方針は quiz-fidfix-S127-u11 と同じ (sub() 肯定確認 / subN 事後確認 / expl 不使用 / MARK 冪等 /
// key_guard は final のみ・round1 不可触 / translations sidecar は再 merge 禁止 → sidecar と .phase1 の両方に同じ置換)。
// U11 からの変更点:
//   - 多 exam: BY / TR / GR を対象 exam ごとに開く (U11 も exam キーだったので適用ループは無変更)
//   - `stem_clean` (jp): 表示層 clean (sidecar + .phase1 の stem_jp_clean) だけに当てる。raw 3 層は触らない
//     (raw にも同じ見出し「問89 」がある 2015h27a-q089 で raw を変えないため)。sidecar に clean が無ければ throw
//   - CLEANN: clean だけに当てる subN (本 unit では空。2011h23a-q089 は中問 COPY 組の境界マーカーを兼ねるため見送り)
//
// 採用した差分 (evidence §5。源 crop / 源ページを原寸で独立実読して確認):
//   0b 訳層の数字・略語 (semantic):
//     2014h26a-q045 ア/イ zh・en「ISO 9091」「ISO 149661」→ 源・jp どおり「ISO 9001」「ISO 14001」
//                  (jp は S109b で是正済、訳層が追随していなかった)
//     2020r02o-q096 ウ zh・en「OSI (Open Source Initiative)」→ 源・jp どおり「ISO」(誤答肢の誤りを訳層が「正して」いた = U11 q070 型)
//   1 見出し混入 (表示層):
//     2015h27a-q089 jp clean / zh / en 先頭「問89 」等 /
//     2019h31h-q001 zh / en 先頭「问1 」「Q1 」/ 2021r03-q001 jp raw (出荷層) 先頭「問1 」(⑤-2 U6 の取りこぼし)
//   引用符・記号 (cosmetic、jp 表示層):
//     2012h24a-q042 clean「AB 間, BC 間, C-A 間」→ 源「A〜B 間, B〜C 間, C〜A 間」(zh 追随)
//     2016h28a-q034 / 2016h28h-q097 / 2018h30a-q009 閉じ ASCII " → ” / 2018h30a-q020 開き ASCII " → “ (raw = 出荷層)
//     2019h31h-q066 stem / 2019h31h-q097 ア〜エ (アは**正解肢**) ASCII " → “…” (raw = 出荷層)
//     2019r01a-q061 / 2022r04-q021 / 2025r07-q053 clean ASCII " → “…” / 2019r01a-q047 clean「不良密度」→ 源 “不良密度”
//     2017h29h-q032 clean 表見出し「平均単価（円）」「合計（円）」→ 在庫群の展開を揃えて「在庫平均単価（円）」「在庫合計（円）」(zh / en 追随)
//   7 行折返しの語中空白 (cosmetic、源は改行のみで空白・読点なし。raw = 出荷層、30 題 33 箇所。2021r03-q004 ア / q073 イ は**正解肢**)
//
// Run: node scripts/quiz-fidfix-S127-a2a.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S127-a2a.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>  (対象 exam ごと)
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

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。
// 事後確認は「置換前の to 出現数 + n」と完全一致。
function subN(obj, key, from, to, n, where) {
  const s = obj?.[key];
  if (typeof s !== "string") throw new Error(`${where}: field ${key} missing`);
  const k = s.split(from).length - 1;
  if (k === 0) { skipped++; return false; }
  if (k !== n) throw new Error(`${where}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  const before = s.split(to).length - 1;
  const next = s.split(from).join(to);
  if (next.split(to).length - 1 !== before + n) throw new Error(`${where}: 置換後の to 「${to}」 の出現数が ${before}+${n} と一致しない — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}

// 7 行折返しの語中空白: ctx の 1 個の ASCII 空白を除いたものを to にする。
const SP = (ctx) => {
  if ((ctx.match(/ /g) || []).length < 1) throw new Error(`SP: 空白が無い — ${ctx}`);
  return [ctx, ctx.replace(/([\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}ー]) ([\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}ー])/u, "$1$2")];
};

const FIX = {
  // ── 0b 訳層の数字・略語 (semantic) ─────────────────────────────────────────────
  "2014h26a-q045": {
    zh: [["ア", "依据 ISO 9091 质量管理体系标准实施。", "依据 ISO 9001 质量管理体系标准实施。"],
         ["イ", "确认对 ISO 149661 环境管理体系标准的符合性。", "确认对 ISO 14001 环境管理体系标准的符合性。"]],
    en: [["ア", "based on the ISO 9091 quality management", "based on the ISO 9001 quality management"],
         ["イ", "conformity with the ISO 149661 environmental", "conformity with the ISO 14001 environmental"]],
  },
  "2020r02o-q096": {
    zh: [["ウ", "所有产品都依据 OSI（开源促进会，Open Source Initiative）规定的开源许可证", "所有产品都依据 ISO 规定的开源许可证"]],
    en: [["ウ", "based on the open source license defined by the OSI (Open Source Initiative).", "based on the open source license defined by ISO."]],
  },
  // ── 1 見出し混入 + 引用符 (表示層) ───────────────────────────────────────────
  // 2011h23a-q089 (見出し「問 89」/「问 89」/「Q89」+ 引用符「」×10 + 読点脱落) は**適用しない**: 初回 --apply 後の
  // quiz-chumon-groups-build --check が、COPY 組 2011h23a-q089-copy の cut marker (「問 89 画素データを…」) 消失で throw し、
  // crosscheck A7 が前文 probe (「0」を含む先頭 40 字) の不一致で落ちた。見出しは組の境界マーカーを兼ね、前文は
  // q090〜q092 に複写されているので、是正は COPY 表と組全員の前文を同時に直す別作業 (evidence §6 / failures/) — 2011h23a の
  // translations は git checkout で適用前に戻した。
  "2015h27a-q089": {
    jp: [["stem_clean", "問89 メニュー別の売上高", "メニュー別の売上高"]],
    zh: [["stem", "问89 为了求出", "为了求出"]],
    en: [["stem", "Q89 To calculate", "To calculate"]],
  },
  "2019h31h-q001": {
    zh: [["stem", "问1 若将风险评估", "若将风险评估"]],
    en: [["stem", "Q1 If risk assessment", "If risk assessment"]],
  },
  "2021r03-q001": { jp: [["stem", "問1 E-R図を使用して", "E-R図を使用して"]] },
  // ── 引用符・記号 (cosmetic、jp 表示層) ─────────────────────────────────────────
  "2012h24a-q042": {
    jp: [["stem_clean", "AB 間, BC 間, C-A 間", "A〜B 間, B〜C 間, C〜A 間"]],
    zh: [["stem", "存在 AB 之间、BC 之间、C-A 之间", "存在 A～B 之间、B～C 之间、C～A 之间"]],
  },
  "2016h28a-q034": { jp: [["stem", "“金のなる木\" と名付け", "“金のなる木” と名付け"], ["stem", ...SP("区分し, 資源 配分の最適化")]] },
  "2016h28h-q097": { jp: [["stem", "拡張子 “avi\" が付く", "拡張子 “avi” が付く"]] },
  "2018h30a-q009": { jp: [["stem", "“クラウドコンピューティング\"に関する", "“クラウドコンピューティング”に関する"]] },
  "2018h30a-q020": { jp: [["stem", "協力の下で, \"調達から製造", "協力の下で, “調達から製造"]] },
  "2019h31h-q066": { jp: [["stem", "それぞれ \"m\" と \"k\" が用いられる", "それぞれ “m” と “k” が用いられる"]] },
  // q097: ア は **正解肢** (correct_answer=ア は不変、引用符の字種のみ)。
  "2019h31h-q097": {
    jp: [["ア", "1GHzCPU の \"1GHz\" は", "1GHzCPU の “1GHz” は"],
         ["イ", "の \"32\" や \"64\" は", "の “32” や “64” は"],
         ["ウ", "の \"一次\" や \"二次\" は", "の “一次” や “二次” は"],
         ["エ", "の \"デュアル\" や \"クアッド\" は", "の “デュアル” や “クアッド” は"]],
  },
  // q047: sidecar の clean は「」、.phase1 の clean は ASCII " (適用前からの乖離)。両方を源の “” に揃える (片方は n=0 skip)。
  "2019r01a-q047": { jp: [["stem_clean", "値を「不良密度」と定義", "値を“不良密度”と定義"], ["stem_clean", "値を\"不良密度\"と定義", "値を“不良密度”と定義"]] },
  "2019r01a-q061": {
    jp: [["stem_clean", "IPA \"組織における内部不正防止ガイドライン (第4版)\" にも", "IPA “組織における内部不正防止ガイドライン (第4版)” にも"],
         ["stem_clean", "組織内外に示す \"基本方針\" を策定し", "組織内外に示す “基本方針” を策定し"]],
  },
  "2022r04-q021": { jp: [["stem_clean", "政府が定める\"人間中心のAI社会原則\"では", "政府が定める“人間中心のAI社会原則”では"]] },
  "2025r07-q053": { jp: [["stem_clean", "一つである \"IT への対応\" に関する", "一つである “IT への対応” に関する"]] },
  "2017h29h-q032": {
    jp: [["stem_clean", "| 平均単価（円） | 合計（円） |", "| 在庫平均単価（円） | 在庫合計（円） |"]],
    zh: [["stem", "| 平均单价（日元） | 合计（日元） |", "| 库存平均单价（日元） | 库存合计（日元） |"]],
    en: [["stem", "| Average unit price (yen) | Total (yen) |", "| Stock average unit price (yen) | Stock total (yen) |"]],
  },
  // ── 7 行折返しの語中空白 (raw stem = 出荷層、源は改行のみ) ──────────────────────
  "2016h28a-q008": { jp: [["stem", ...SP("て個別システム についての企")]] },
  "2016h28a-q022": { jp: [["stem", ...SP("する外部業者の サービスとし")]] },
  "2016h28a-q057": { jp: [["stem", ...SP("専用線のように セキュリティ")]] },
  "2016h28h-q046": { jp: [["stem", ...SP("プロジェクトの コストを類推")]] },
  "2016h28h-q048": { jp: [["stem", ...SP("ための部屋を設 置して入退室")], ["stem", ...SP("電時のデータ消 失を防ぐため")]] },
  "2016h28h-q074": { jp: [["stem", ...SP("ESSIDの発 信を停止する")]] },
  "2017h29a-q032": { jp: [["stem", ...SP("れる。これに対 応する買い手")]] },
  "2017h29h-q039": { jp: [["stem", ...SP("ブレークダウン する手法はど")]] },
  "2018h30a-q061": { jp: [["stem", ...SP("しているサーバ のソフトウェ")]] },
  "2018h30a-q071": { jp: [["stem", ...SP("れるプロトコル はどれか。")]] },
  "2019h31h-q006": { jp: [["stem", ...SP("化計画プロセス で実施する作")]] },
  "2019r01a-q011": { jp: [["stem", ...SP("に, 重要な業 績評価の指標")]] },
  "2019r01a-q084": { jp: [["stem", ...SP("して, 最も適 切なものはど")]] },
  "2020r02o-q008": { jp: [["stem", ...SP("接続された電力 メータと通信")]] },
  "2020r02o-q084": { jp: [["stem", ...SP("セキュリティ管 理策の記述と")]] },
  // q004 ア / q073 イ は **正解肢** (correct_answer は不変、空白のみ)。
  "2021r03-q004": { jp: [["ア", ...SP("非定型なデータ を, 一元的")]] },
  "2021r03-q006": { jp: [["stem", ...SP("ックを受けて運 転の支援など")]] },
  "2021r03-q033": { jp: [["stem", ...SP("確定後に請負契 約を締結した")]] },
  "2021r03-q073": { jp: [["イ", ...SP("イス内のデータ を, 暗号鍵")]] },
  "2021r03-q082": { jp: [["stem", ...SP("によって, 仮 想的に高い処")]] },
  "2022r04-q031": { jp: [["stem", ...SP("ラフ, 累積百 分率を折れ線")]] },
  "2024r06-q029": { jp: [["stem", ...SP("ジネスモデルを デジタル技術")]] },
  "2024r06-q038": { jp: [["stem", ...SP("時間は最大何時 間か。")]] },
  "2025r07-q013": { jp: [["stem", ...SP("ソリューション の提供者に,")]] },
  "2025r07-q015": { jp: [["stem", ...SP("し, 一つの企 業の中に事業")]] },
  "2025r07-q020": { jp: [["stem", ...SP("時にベンダー企 業から収集す")]] },
  "2025r07-q022": { jp: [["stem", ...SP(", 各営業担当 者が提出する")], ["stem", ...SP("ている。この問 題を解決する")]] },
  "2025r07-q044": { jp: [["stem", ...SP("きるように確認 用のソフトウ")]] },
  "2025r07-q052": { jp: [["stem", ...SP("ロジェクトの品 質管理に係る")], ["stem", ...SP("人として, 適 切な者は誰か")]] },
};
// clean だけに当てる subN (FIX の後に走る)。2011h23a-q089 の「」×10 → “” ×10 を予定していたが上記の理由で空。
const CLEANN = {};

const MARK = "fidfix-S127-a2a";
const BANK = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8"));
const pg = (id) => { const b = (BANK.questions ?? BANK).find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 (訳層の数字・略語) + 正解肢命中。
//   語義: 2014h26a-q045 2020r02o-q096 / 正解肢命中: 2019h31h-q097 (ア) 2021r03-q004 (ア) 2021r03-q073 (イ)
//   追記しない: 見出し・引用符・表見出し・行折返し空白のみで正解肢に当たらない題
const NOTE_APPEND = {
  "2014h26a-q045": (p) => `（S127 A2a: ${p} 実読で 選択肢ア・イの zh / en に残っていた規格番号「ISO 9091」「ISO 149661」を源・jp どおり「ISO 9001」「ISO 14001」に是正（jp は S109b で是正済）。いずれも誤答肢で、情報システムのリスクに対するコントロールを検証・評価する = システム監査という導出・答え（エ）は不変 — ${MARK}）`,
  "2020r02o-q096": (p) => `（S127 A2a: ${p} 実読で 選択肢ウは源・jp とも「ISO で定められた」。zh / en が「OSI（Open Source Initiative）」と訳し替えていたのを源どおり「ISO」に是正。誤答肢のため、企業の社員が業務として開発に参加する製品もある = 適切という導出・答え（ア）は不変 — ${MARK}）`,
  "2019h31h-q097": (p) => `（S127 A2a: ${p} 実読で 選択肢ア〜エの引用符 ASCII " を源の “…” に是正。アは**正解肢**だが変更は引用符の字種のみで、1GHz = 1 秒間に 10 億回のクロック信号という導出・correct_answer=ア は不変 — ${MARK}）`,
  "2021r03-q004": (p) => `（S127 A2a: ${p} 実読で 選択肢アの「データ を」の行折返し由来の空白を除去（源は「データを，」）。アは**正解肢**だが変更は空白のみで、企業内の様々なシステムのデータを一元的に検索する = エンタープライズサーチという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2021r03-q073": (p) => `（S127 A2a: ${p} 実読で 選択肢イの「データ を」の行折返し由来の空白を除去（源は「データを，」）。イは**正解肢**だが変更は空白のみで、暗号鍵を内蔵するセキュリティチップで暗号化 = 耐タンパ性の向上という導出・correct_answer=イ は不変 — ${MARK}）`,
};

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set([...Object.keys(FIX), ...Object.keys(CLEANN)].map((id) => id.split("-q")[0]))].sort();
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));
const T1 = new Map();
const tr1 = (id) => { if (!T1.has(id)) { const f = P("data/ip/quiz/.phase1", `tr_${id}.json`); T1.set(id, { f, d: existsSync(f) ? rj(f) : null }); } return T1.get(id).d; };

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1 = tr1(id);
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem_clean") {
      if (!t?.stem_jp_clean) throw new Error(`${id}: stem_clean 指定だが sidecar に stem_jp_clean が無い`);
      sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else if (field === "stem") {
      for (const [o, w] of [[qq, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[qq, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
}
for (const [id, list] of Object.entries(CLEANN)) {
  const exam = id.split("-q")[0];
  const t = TR[exam].questions[id], t1 = tr1(id);
  if (!t?.stem_jp_clean) throw new Error(`${id}: CLEANN だが sidecar に stem_jp_clean が無い`);
  for (const [from, to, n] of list) {
    subN(t, "stem_jp_clean", from, to, n, `${id} translations.stem_jp_clean`);
    if (t1?.stem_jp_clean) subN(t1, "stem_jp_clean", from, to, n, `${id} .phase1 tr_.stem_jp_clean`);
  }
}
for (const { f, d } of T1.values()) if (d) wj(f, d);
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  exams (${exams.length}): ${exams.join(" ")}`);
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S127-a2a: applied ${applied}, skipped ${skipped}`);
