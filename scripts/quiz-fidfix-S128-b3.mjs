#!/usr/bin/env node
// Stage 6 / Quiz — S128 B track **B3** (2014h26a、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S128 の workflow `wf_9acfde38-db3`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b3_2014h26a_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b3_fidelity_input_2014h26a.json (precrop 84/100、skip 16 = page_mismatch 4 (q039 / q040 / q075 / q076) + chumon 12 (q085〜q092 / q097〜q100))
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 479 / AGENT_MISSED 6 (q100 stem = 実残差「結果になった」、q031 / q048 / q084 = 図の言語化、
//                 q092 = 中問前文、q093 = 表の ⋮ 行) / QUOTE_ASCII 0 / VERDICT_CONFLICT 0 / UNREADABLE 1 (q098、fixer が p47〜p49 を実読)
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S128-b2 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2014h26a の sidecar のキーは `stem` / `choices` / `stem_jp_clean` (100 題中 66 題) で、`choices_jp_clean` は存在しない (実測)。
// 選択肢は raw 3 層がそのまま出荷層。
// 中問C (q093〜q096) は A4 が mqC 前文を stem 冒頭に埋め込んだ後の状態で当てる (D-152)。前文領域は触らず、from は設問文側の部分一致。
//
// 適用ループ (sub / FIX / expl 単一読み / NOTE_APPEND) は B2 から無変更で流用。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q001 stem   (p02) clean「単位：円」→ 源「単位　円」(源に無いコロン)
//   q075 stem   (p30) clean (5)「“.” “..” “/”」→ 源「“/”, “.”, “..”」(列挙順と読点、zh / en 追随)
//   q086 stem   (p34) clean 表1 の後に源の「図1は，表1に基づいて作成したアローダイアグラムである。」を補う (zh / en 追随)
//   q094 stem   (p44) clean (2)(3) の式〔…（…）〕→ 源 “…(…)” (zh / en 追随)
//   q099 stem   (p50) clean「「承認」」×2 → 源「“承認”」
//   q100 stem   (p51) clean「結果になった」→「結果となった」、「かかって」→「掛かって」、「申請の承認」→「申請での承認」
//   q052 ア     (p21) 末尾の空白 31 字 +「に」除去
//   q063 ウ     (p26) 「伝科」→ 源「伝達」(ウは**正解肢**)
//   q094 ア〜エ  (p44) 式〔…〕→ 源 “…”、ア に「式」を補う (エは**正解肢**、区切りのみ。zh / en 追随)
//
// Run: node scripts/quiz-fidfix-S128-b3.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S128-b3.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2014h26a
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
  "2014h26a-q001": { jp: [["stem", "単位：円", "単位　円"]] },
  "2014h26a-q075": {
    jp: [["stem", "(5) 始まりが “.” “..” “/” のいずれでもないときは", "(5) 始まりが “/”, “.”, “..” のいずれでもないときは"]],
    zh: [["stem", "当开头不是 “.” “..” “/” 中的任何一个时", "当开头不是 “/”，“.”，“..” 中的任何一个时"]],
    en: [["stem", "When the start is none of “.”, “..”, or “/”,", "When the start is none of “/”, “.”, or “..”,"]],
  },
  // q086: 源 p34 の中問A 前文は表1の直後に「図1は，表1に基づいて作成したアローダイアグラムである。」を置く。
  //   同じ前文を持つ q085 / q087 / q088 の clean・zh・en にはこの文があり、q086 だけ落ちている。
  "2014h26a-q086": {
    jp: [["stem", "| H | 7 | 12 | C, E, G |\n\nXソフトの開発が表1", "| H | 7 | 12 | C, E, G |\n\n図1は，表1に基づいて作成したアローダイアグラムである。\n\nXソフトの開発が表1"]],
    zh: [["stem", "| H | 7 | 12 | C, E, G |\n\n当X软件的开发", "| H | 7 | 12 | C, E, G |\n\n图1是根据表1绘制的箭线图。\n\n当X软件的开发"]],
    en: [["stem", "| H | 7 | 12 | C, E, G |\n\nWhen the development", "| H | 7 | 12 | C, E, G |\n\nFigure 1 is the arrow diagram created based on Table 1.\n\nWhen the development"]],
  },
  // q094: 源 p44 の式は “…” で囲み、括弧は半角 (D-155: 原典の字形に題ごとに従う)。表示は 〔…（…）〕 で、
  //   節見出し 〔〕 (D-157) と同じ字形になっていた。区切りと括弧だけを源に合わせ、演算子 * / は ASCII のまま据え置く。
  //   zh / en も同じ区切りに揃える (zh は “…” + 半角括弧、en は […] → “…”、D-156)。
  //   ア は「次にセルH54に式“合計…”」の「式」が脱落していたので jp / zh / en とも補う (semantic)。
  //   前文 (A4 が埋め込んだ mqC 前文) は触らない。from は設問文側の部分一致。
  "2014h26a-q094": {
    jp: [
      ["stem", "セルH52に，式〔合計（B52～G52）〕を入力する。", "セルH52に，式“合計(B52～G52)”を入力する。"],
      ["stem", "セルB53に，式〔平均（B2～B36）〕を入力し，", "セルB53に，式“平均(B2～B36)”を入力し，"],
      ["ア", "セルB54に，式〔B52*B53〕を入力し，セルC54～G54に複写する。次にセルH54に〔合計（B54～G54）〕を入力する。最後に，セルH53に式〔H54/H52〕を入力する。",
        "セルB54に，式“B52*B53”を入力し，セルC54～G54に複写する。次にセルH54に式“合計(B54～G54)”を入力する。最後に，セルH53に式“H54/H52”を入力する。"],
      ["イ", "式〔合計（B2～G36）/H52〕を入力する。", "式“合計(B2～G36)/H52”を入力する。"],
      ["ウ", "式〔平均（B2～G36）〕を入力する。", "式“平均(B2～G36)”を入力する。"],
      ["エ", "式〔平均（B53～G53）〕を入力する。", "式“平均(B53～G53)”を入力する。"],
    ],
    zh: [
      ["stem", "输入公式〔合计（B52～G52）〕。", "输入公式“合计(B52～G52)”。"],
      ["stem", "输入公式〔平均（B2～B36）〕，", "输入公式“平均(B2～B36)”，"],
      ["ア", "在单元格B54中输入公式〔B52*B53〕，并复制到单元格C54～G54。然后在单元格H54中输入〔合计（B54～G54）〕。最后，在单元格H53中输入公式〔H54/H52〕。",
        "在单元格B54中输入公式“B52*B53”，并复制到单元格C54～G54。然后在单元格H54中输入公式“合计(B54～G54)”。最后，在单元格H53中输入公式“H54/H52”。"],
      ["イ", "输入公式〔合计（B2～G36）/H52〕。", "输入公式“合计(B2～G36)/H52”。"],
      ["ウ", "输入公式〔平均（B2～G36）〕。", "输入公式“平均(B2～G36)”。"],
      ["エ", "输入公式〔平均（B53～G53）〕。", "输入公式“平均(B53～G53)”。"],
    ],
    en: [
      ["stem", "Enter the formula [sum(B52 to G52)] into cell H52.", "Enter the formula “sum(B52 to G52)” into cell H52."],
      ["stem", "Enter the formula [average(B2 to B36)] into cell B53,", "Enter the formula “average(B2 to B36)” into cell B53,"],
      ["ア", "Enter the formula [B52*B53] into cell B54, and copy it to cells C54 to G54. Then enter [sum(B54 to G54)] into cell H54. Finally, enter the formula [H54/H52] into cell H53.",
        "Enter the formula “B52*B53” into cell B54, and copy it to cells C54 to G54. Then enter the formula “sum(B54 to G54)” into cell H54. Finally, enter the formula “H54/H52” into cell H53."],
      ["イ", "Enter the formula [sum(B2 to G36)/H52] into cell H53.", "Enter the formula “sum(B2 to G36)/H52” into cell H53."],
      ["ウ", "Enter the formula [average(B2 to G36)] into cell H53.", "Enter the formula “average(B2 to G36)” into cell H53."],
      ["エ", "Enter the formula [average(B53 to G53)] into cell H53.", "Enter the formula “average(B53 to G53)” into cell H53."],
    ],
  },
  "2014h26a-q099": {
    jp: [
      ["stem", "かつ，承認区分が「承認」のものとする。", "かつ，承認区分が“承認”のものとする。"],
      ["stem", "申請日が前月かつ承認区分が「承認」のデータを抽出する。", "申請日が前月かつ承認区分が“承認”のデータを抽出する。"],
    ],
  },
  "2014h26a-q100": {
    jp: [
      ["stem", "次のような結果になった。", "次のような結果となった。"],
      ["stem", "1回の申請で12分かかっていたものが", "1回の申請で12分掛かっていたものが"],
      ["stem", "1回の申請の承認が72秒から", "1回の申請での承認が72秒から"],
    ],
  },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  "2014h26a-q052": { jp: [["ア", `問題が生じなくなる。${" ".repeat(31)}に`, "問題が生じなくなる。"]] },
  "2014h26a-q063": { jp: [["ウ", "電話で重要情報を伝科するときの", "電話で重要情報を伝達するときの"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  本 unit は why_wrong / 解説本文の是正なし (腐敗語の言及は key_guard note のみで、D-143 により NOTE_APPEND で扱う)。
const EXPL = {};

const MARK = "fidfix-S128-b3";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が腐敗 / 原典一致を述べている題。
//   語義: q063 q086 q094 (ア) q100 / 正解肢命中: q063 (ウ) q094 (エ、区切りのみ) / note 言及: q052 (「に」) q075 (「原典どおり」)
//   追記しない (括弧・引用符・空白のみ、note に言及なし): q001 q099
const NOTE_APPEND = {
  "2014h26a-q052": (p) => `（S128 B3: ${p} 実読で 選択肢ア末尾の余剰文字「に」(空白 31 字の後) を除去済み（上記の「に」の記述は是正前の状態）。誤答肢のため、IPv6 でアドレス不足が解消される = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2014h26a-q063": (p) => `（S128 B3: ${p} 実読で 選択肢ウの「伝科」を源の「伝達」に是正済み（上記の「伝科」の記述は是正前の状態）。ウは**正解肢**だが変更は字形誤りの是正のみで、電話での重要情報の伝達手順 = 人的対策 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2014h26a-q075": (p) => `（S128 B3: ${p} 実読で 指定方法 (5) の列挙順を源の「“/”, “.”, “..”」に是正（表示は「“.” “..” “/”」で順序と読点が崩れていた。上記の「(1)〜(5) の文言も原典どおり」は是正前の状態についての記述。zh / en も追随）。B → .. → A → D → E = ../D/E/img.jpg = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2014h26a-q086": (p) => `（S128 B3: ${p} / page-34 (前文) 実読で 中問A 前文の表1の直後に源の一文「図1は，表1に基づいて作成したアローダイアグラムである。」を補う（同前文の q085 / q087 / q088 と揃える、zh / en 追随）。10日目までの完了作業 A(2日目)・F(4)・B(5)・D(6)・C(9) で累計 5→10→17→22→26 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2014h26a-q094": (p) => `（S128 B3: ${p} 実読で 式の区切りを源の “…” と半角括弧に是正（表示は〔…（…）〕。題幹 (2)(3) と選択肢ア〜エ、zh / en 追随）、選択肢アの「次にセルH54に〔合計…〕」に源の「式」を補う。エは**正解肢**だが変更は区切りの字種のみで、組ごとの平均点を単純平均すると受講生数の違いを無視する = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2014h26a-q100": (p) => `（S128 B3: ${p} 実読で 題幹の「結果になった」を源の「結果となった」に、(1)「かかって」を源の「掛かって」に、(3)「1回の申請の承認」を源の「1回の申請での承認」に是正（「で」の脱落）。30 + 32/60×20 + 60/3600×200 + 12 ≒ 56 時間 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S128-b3: applied ${applied}, skipped ${skipped}`);
