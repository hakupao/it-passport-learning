#!/usr/bin/env node
// Stage 6 / Quiz — S127 A track **A1** (D-150 §4 段 1 = 方式 A、0 token): ⑨ backlog の決定的な機械走査。
// 全 2,900 題について「源照合 (A2) に回す候補」を型ごとに抽出する。**データは一切書き換えない** (読み取り専用)。
// 候補は欠陥ではない。各ルールは正規表現 / 文字列比較だけで定義し、定義は md に全文を書き出す。
//
// 型 (⑨ 番号は evidence/quiz_full52_summary.md §7.1):
//   0a  s975 / clean 層の推測補完   raw stem_jp ↔ stem_jp_clean の文字 LCS 差分 → 語置換・数字差・clean 挿入
//   0b  訳層の数字・英字の不対応     表示 jp ↔ zh / en の数字集合・ASCII 略語・単字ラベル
//   0c  jp 異常字の残る field の訳   表示 jp の OCR 異常 (孤立漢字列・英字混入・括弧不整合・同形字) → zh / en を併記
//   0q  ASCII "                     jp 表示層 / jp raw / zh / en (擬似言語リテラル・en 英文組版は別区分)
//   1   見出し混入                   ^問N / ^问N / ^QN (stem・選択肢先頭) + field 中途の見出し
//   7   読点脱落 / 行跨ぎ読点後の空白 / 語中改行空白   (U4 §11 の規則を再現 + 除外類を sub-tag 化)
//   10  選択肢末尾の空白列+残渣 / ノンブル / 「.,」型
//   2   斜線ゼロ候補                 9 / 6 を含む数字列 (+ 0 化で端数が消える / 他層に 0 化形がある sub-flag)
//   T   stem 内 markdown 表           表の有無・図との併存・数値セル数 + 層間の数値不一致 sub-flag
//
// 走査層 (quizModel.ts:120 と同じ表示規則):
//   jp      stem = translations/<exam>.json の stem_jp_clean (trim 非空) があればそれ、無ければ questions.json の stem_jp
//           choice = questions.json の choices_jp (choices_jp_clean は全 29 exam で存在しない = raw がそのまま表示)
//   jp_raw  clean を持つ題の raw stem_jp (学習者には不可視。0a の比較元、0q / 1 / 2 / T では別層として計上)
//   zh / en translations/<exam>.json の stem / choices
//   fig     data/ip/exams/question_bank.json の figure_description (gitignored、265 題。2 と T の sub-flag だけに使う)
//   射程外  explanations の本文 (0c の語頻度表にだけ使う)、by_year / question_bank の stem・choices、.phase1
//
// 区分: full52_population_S118.json の exams[].excluded[].id → excluded (392)、exams に無い exam → 13exam (1,300)、
//       それ以外 → pop (⑤-2 母数内 1,208)。
//
// recall 検査: 既知実例 (RECALL) を同じ pass の中で判定する。是正済の実例は是正 commit の親 (`<commit>^`) の
// questions.json / translations を `git show` で読む (commit 固定なので出力は再現的)。
//
// 決定性: 時刻を出力しない。exam は readdir の sort 順、候補は (id, layer, field, rule, excerpt) で sort。
// 0c の孤立漢字列は Node 組込みの ICU (Intl.Segmenter "ja" word) に依存する → 出力に ICU 版を記録する。
//
// Run: node scripts/quiz-backlog-scan-A1.mjs
//   → evidence/phase5/stage_06_quiz_fidelity/backlog_scan_A1_S127.json
//   → evidence/backlog_scan_A1_S127.md
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RULES as S118_RULES, normStr } from "./quiz-choice-defect-scan.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...s) => path.join(ROOT, ...s);
const OUT_JSON = "evidence/phase5/stage_06_quiz_fidelity/backlog_scan_A1_S127.json";
const OUT_MD = "evidence/backlog_scan_A1_S127.md";
const LETTERS = ["ア", "イ", "ウ", "エ"];
const S118 = Object.fromEntries(S118_RULES.map((r) => [r.id, r]));

// ── 文字クラス ───────────────────────────────────────────────────────────────
const RE_KANJI = /[㐀-䶿一-鿿]/;
const RE_HIRA = /[ぁ-ゖ]/;
const RE_KATA = /[ァ-ヺー]/;
const JP = "\\u3041-\\u3096\\u30A1-\\u30FA\\u30FC\\u3400-\\u4DBF\\u4E00-\\u9FFF";
const isKanji = (c) => !!c && RE_KANJI.test(c);
const isHira = (c) => !!c && RE_HIRA.test(c);
const isKata = (c) => !!c && RE_KATA.test(c);
const isJP = (c) => isKanji(c) || isHira(c) || isKata(c);
const isContent = (c) => isJP(c) || /[A-Za-z0-9]/.test(c);

const excerptAt = (s, i, len = 1, pad = 18) => {
  const a = Math.max(0, i - pad), b = Math.min(s.length, i + len + pad);
  return (a > 0 ? "…" : "") + s.slice(a, b).replace(/\n/g, "⏎") + (b < s.length ? "…" : "");
};
const clip = (s, n = 90) => { const t = String(s ?? "").replace(/\n/g, "⏎"); return t.length > n ? t.slice(0, n) + "…" : t; };

// 表 / 擬似言語ブロック (quiz-choice-defect-scan.mjs の非 export 定義と同義)
const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
const hasTable = (s) => /(^|\n)\s*\|/.test(String(s)) || /^\s*\[表\]/.test(String(s));
const PROG_MARK = /^\s*[\[〔［【][^\]］】〕\n]{0,10}プログラム/;
const progOffset = (s) => {
  const lines = String(s).split("\n");
  const i = lines.findIndex((l) => PROG_MARK.test(l));
  return i < 0 ? -1 : lines.slice(0, i).reduce((n, l) => n + l.length + 1, 0);
};

// ── 入力 ─────────────────────────────────────────────────────────────────────
const sha = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 16);
const INPUT_HASH = {};
const readJson = (rel) => { const b = readFileSync(P(rel)); INPUT_HASH[rel] = sha(b); return JSON.parse(b.toString("utf-8")); };
const gitJson = (rev, rel) => JSON.parse(execFileSync("git", ["-C", ROOT, "show", `${rev}:${rel}`], { encoding: "utf-8", maxBuffer: 1 << 28 }));

const QUESTIONS = readJson("data/ip/quiz/questions.json").questions;
const EXAMS = readdirSync(P("data/ip/quiz/translations")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const TR = Object.fromEntries(EXAMS.map((e) => [e, readJson(`data/ip/quiz/translations/${e}.json`).questions]));
const EXPL = Object.fromEntries(EXAMS.map((e) => [e, existsSync(P(`data/ip/quiz/explanations/${e}.json`)) ? readJson(`data/ip/quiz/explanations/${e}.json`).questions : {}]));
const BANK_REL = "data/ip/exams/question_bank.json";
const FIGDESC = new Map();
if (existsSync(P(BANK_REL))) for (const b of readJson(BANK_REL).questions) if (b.figure_description) FIGDESC.set(b.id, b.figure_description);
const POP = readJson("evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json");
const POP_EXAMS = new Set(Object.values(POP.exams).map((x) => x.exam_id));
const EXCLUDED = new Set(Object.values(POP.exams).flatMap((x) => x.excluded.map((e) => e.id)));
const sectorOf = (id, exam) => (EXCLUDED.has(id) ? "excluded" : POP_EXAMS.has(exam) ? "pop" : "13exam");
const SECTORS = ["pop", "excluded", "13exam"];
const FIG_MISMATCH = readJson("evidence/phase5/stage_06_quiz_keyaudit/fig_stem_mismatch_S127.json").map((x) => x.id);

// 1 題分の層を組み立てる (tr = sidecar の当該題、q = questions.json の当該題)
function layersOf(q, tr) {
  const clean = typeof tr?.stem_jp_clean === "string" && tr.stem_jp_clean.trim() ? tr.stem_jp_clean : null;
  const f = [];
  f.push({ layer: "jp", field: "stem", text: clean ?? q.stem_jp ?? "", src: clean ? "clean" : "raw" });
  if (clean) f.push({ layer: "jp_raw", field: "stem", text: q.stem_jp ?? "" });
  for (const L of LETTERS) f.push({ layer: "jp", field: `choice.${L}`, text: q.choices_jp?.[L] ?? "" });
  for (const lang of ["zh", "en"]) {
    f.push({ layer: lang, field: "stem", text: tr?.stem?.[lang] ?? "" });
    for (const L of LETTERS) f.push({ layer: lang, field: `choice.${L}`, text: tr?.choices?.[L]?.[lang] ?? "" });
  }
  return { clean, raw: q.stem_jp ?? "", fields: f };
}
const pick = (fields, layer, field) => fields.find((x) => x.layer === layer && x.field === field)?.text ?? "";

// ── 0c 用の語頻度表 (現行 corpus の jp 全文 + 解説 jp。題単位の文書頻度) ──────────
const SEG = new Intl.Segmenter("ja", { granularity: "word" });
const BIGRAM_DF = new Map();
const KANJI_DF = new Map();
{
  const jpStrings = (o, out) => {
    if (!o || typeof o !== "object") return out;
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === "string" && (k === "jp" || k.endsWith("_jp"))) out.push(v);
      else if (v && typeof v === "object") jpStrings(v, out);
    }
    return out;
  };
  for (const q of QUESTIONS) {
    const tr = TR[q.exam_id]?.[q.id];
    const texts = [q.stem_jp, tr?.stem_jp_clean, ...LETTERS.map((L) => q.choices_jp?.[L]), ...jpStrings(EXPL[q.exam_id]?.[q.id], [])].filter(Boolean).join("\n");
    const bg = new Set(), kj = new Set();
    for (let i = 0; i < texts.length; i++) {
      if (!isKanji(texts[i])) continue;
      kj.add(texts[i]);
      if (isKanji(texts[i + 1])) bg.add(texts[i] + texts[i + 1]);
    }
    for (const b of bg) BIGRAM_DF.set(b, (BIGRAM_DF.get(b) ?? 0) + 1);
    for (const k of kj) KANJI_DF.set(k, (KANJI_DF.get(k) ?? 0) + 1);
  }
}

// ── ルール定義 (md にそのまま書き出す) ───────────────────────────────────────
const RULE_DEFS = [];
const def = (type, id, layers, definition, exclusions = "") => RULE_DEFS.push({ type, id, layers, definition, exclusions });

// ─ 0a: raw ↔ clean の文字 LCS 差分 ─
def("0a", "0a.diff", "jp_raw ↔ jp(clean)", "clean を持つ題の raw stem_jp と stem_jp_clean を normStr (quiz-choice-defect-scan.mjs: ①→(1)、NFKC、空白削除、読点 `，、,`→`,`、句点、引用符 `“”\"「」『』`→`\"`、括弧・コロン・ダッシュ統一) で正規化し、文字単位の LCS で差分 hunk を取る。各 hunk を次の sub に分類", "");
def("0a", "0a.num", "jp_raw ↔ jp(clean)", "hunk の raw 側または clean 側に数字 [0-9] がある (q085 型。**別フラグ**)", "");
def("0a", "0a.word", "jp_raw ↔ jp(clean)", "置換 hunk (両側に内容字 = 仮名・漢字・英数字) で、raw 側または clean 側の内容字が 2 字以上 (q014 佑典→強み / q011 新→変革 型)", "同形字の対 (力↔カ 一↔ー 工↔エ 口↔ロ 二↔ニ 八↔ハ 夕↔タ 卜↔ト 千↔チ 才↔オ) だけからなる 1 字置換は 0a.glyph");
def("0a", "0a.char", "jp_raw ↔ jp(clean)", "置換 hunk で両側とも内容字 1 字 (q070 量正→修正 型)", "同形字の対は 0a.glyph (候補に数えない)");
def("0a", "0a.ins", "jp_raw ↔ jp(clean)", "clean 側だけに内容字 2 字以上がある挿入 hunk (raw に無い語を clean が補った)", "1 字の挿入 (脱字の復元) は件数のみ");
def("0a", "0a.region", "jp_raw ↔ jp(clean)", "置換 hunk のどちらかの側が 30 字超 (図の文字化け域・表の再構成)。候補には数えるが A2 の優先度は低", "");
def("0a", "(不計上)", "jp_raw ↔ jp(clean)", "削除のみの hunk (clean が raw の崩れを落とした = D-136-C の図文字除去) / 記号のみの hunk / 同形字の 1 字置換 / 1 字挿入 は件数だけ数え、候補に入れない", "");

// ─ 0b: 訳層の数字・英字 ─
def("0b", "0b.num_missing", "jp → zh / en", "表示 jp の数字トークン (NFKC、3 桁区切りの `,` を除去、`\\d+(\\.\\d+)?`) の換算値がどれも zh / en の数字集合に無い。換算: jp の N万 / N億 / N千 → N×10^4 / 10^8 / 10^3、en の N million / billion / thousand / Nk → ×10^6 / 10^9 / 10^3。数字集合には en の数詞 (zero〜twenty、first〜twentieth、twice、half、double、single、once、hundred、thousand) と数を表す語 (hexadecimal 16 / decimal 10 / binary 2 / octal 8 / annual 等 1 / 月名と略称 1〜12)、zh / jp の漢数字列 (十六 = 16 と 1 字ずつの値)、jp の単位見出し「万」「千」「億」(→ 10^4 / 10^3 / 10^8) を加える", "見出し `問N` / `问N` / `QN` の数字 (型 1 が担当) と、値 1 (en の冠詞 a / per 等に訳され機械照合できない) は除く。`9:00` の `00` は全言語で除く");
def("0b", "0b.num_extra", "zh / en → jp", "zh / en の数字トークンの換算値がどれも表示 jp の数字集合 (上記の漢数字・単位見出しを含む) に無い", "見出しの数字、`9:00` の `00` (全言語)");
def("0b", "0b.abbr_missing", "jp → zh / en", "表示 jp の ASCII 略語 (`[A-Z]{2,}[a-z]*` または `[A-Z][a-z]+[A-Z][A-Za-z]*` = ISMS / IoT / GHz / HRTech、PC3 は PC) が、英数字以外を除き小文字化した zh / en に部分文字列として無い", "慣用訳される略語: zh = OS / EC / PC / FAX / USB / EU / OA、en = EC");
def("0b", "0b.label_extra", "zh → jp", "zh に独立した大文字 1 字 (前後が英数字・`&`・`-` でない A〜Z) があり、表示 jp に同じ独立大文字が無い (2026r08-q032 イ「( 社」型の逆側)", "M&A / P2P / L1 / A-GPS 型の複合、zh の「U 盘」。en は冠詞 A・代名詞 I と区別できないので対象外");
def("0b", "(射程外)", "", "カタカナ語・固有語 → en の綴り対応は辞書が無いと機械判定できない (翻字表が要る) ので実装しない", "");

// ─ 0c: jp 異常字 ─
def("0c", "0c.isolated_kanji", "jp", "Intl.Segmenter(\"ja\",word) が 1 漢字ずつに分割した隣接 2 語 X|Y (= ICU 辞書に無い漢字 2 字並び) で、漢字 bigram XY の題単位文書頻度 (現行 corpus の stem / clean / 選択肢 / 解説 jp) が 1 以下 (模|僚・佑|典・量|正 型)", "直前が数字 (1 日減 / 2手目 / 30 個買 = 数字 + 助数詞)。擬似言語ブロック以降");
def("0c", "0c.rare_kanji", "jp", "題単位文書頻度 1 の漢字 1 字 (corpus でこの題にしか出ない字)。**弱い信号** (津波・摩擦・函館 等の正当な稀字が大半)", "擬似言語ブロック以降");
def("0c", "0c.latin_in_kana", "jp", "空白を挟まず `[仮名漢字][A-Z][ひらがな]` (販売才とだ民Lた 型)", "直後の仮名が と は の を に が で や も へ か さ よ ま だ (製品Aと / Bさん = ラベル用法)。S118 R4b (仮名中の孤立英字) は数学変数で FP 20/20 → 大文字・前後無空白に限定");
def("0c", "0c.R1a", "jp", `S118 R1a 再利用: ${S118.R1a.why}`, "");
def("0c", "0c.R1b", "jp", `S118 R1b 再利用: ${S118.R1b.why}`, "");
def("0c", "0c.R1c", "jp", `S118 R1c 再利用: ${S118.R1c.why}`, "");
def("0c", "0c.R3", "jp", `S118 R3 再利用: ${S118.R3.why}`, "ASCII `\"` の奇数は型 0q が担当するのでここでは数えない");
def("0c", "0c.R4a", "jp", `S118 R4a 再利用: ${S118.R4a.why}`, "");
def("0c", "0c.symbol", "jp", "擬似言語ブロック外の `%%` / 半角カナ `[ｦ-ﾟ]` / 縦線 `|` が 1 本だけの行の `|` / ASCII `[` `]` の開閉数不一致", "markdown 表行、`[表]` を含む行、縦線 2 本以上の行 (選択肢の一行表)");
def("0c", "→ 訳層", "zh / en", "上記のいずれかが命中した jp field について、同じ field の zh / en を候補に併記する (U11 q070 イ 模僚→「再発」型の推測訳の照合対象)", "");

// ─ 0q: ASCII " ─
def("0q", "0q.prose", "jp / jp_raw / zh", "ASCII `\"` (U+0022) の出現", "下の literal に当たるものを除く");
def("0q", "0q.literal", "jp / jp_raw / zh", "擬似言語ブロック (PROG_MARK 行以降) 内、または `\"` の内側が ASCII 英数字 1〜20 字で、外側の直前・直後が `←=＝+,(（)）` のいずれか (文字列リテラル)", "");
def("0q", "0q.en", "en", "en の ASCII `\"` (英文の通常組版。⑨ #11 の方針決定の対象であり源照合の対象ではない。件数のみ)", "");

// ─ 1: 見出し ─
def("1", "1.head", "jp / jp_raw / zh / en", "field 先頭: jp `^\\s*問\\s*\\d+` / zh `^\\s*[问問]\\s*\\d+` / en `^\\s*(Q|Question)\\s*\\d+\\b`", "");
def("1", "1.mid", "jp / jp_raw / zh / en", "field 中途の行頭: jp `\\n\\s*問\\s*\\d+[\\s　]` / zh `\\n\\s*问\\s*\\d+` / en `\\n\\s*Q\\d+\\b`", "");

// ─ 7: 読点 / 空白 ─
def("7", "7.space", "jp", "表示 jp で `[仮名漢字ー] [仮名漢字ー]` (ASCII 空白ちょうど 1 個、U4 §11 の「日本語文字 + ASCII 空白 1 個 + 日本語文字」)。sub: prose (読点脱落の強い信号) / particle (空白の直後が助詞 は を に が の で と も へ や = U4 の「助詞前の空白型」) / kata (両側とも片仮名 = 語中改行空白、S118 R8a 型) / kanji (両側とも漢字 = 語中改行空白、R8b 型)", "U4 の除外類 → 表型 (field に markdown 表行 / `[表]` / `=` を含む) と図の言語化 (field に `［図］` / `[図]` を含む) は sub=table / figure として件数だけ数える。擬似言語ブロック以降は対象外");
def("7", "7.comma_nospace", "jp", "`[仮名漢字ー],[仮名漢字ー]` (ASCII 読点の後に空白が無い = 行跨ぎ読点後の空白欠落、U9 NIT-4 の 310 件型)。同一 field に `, ` も併存するものは sub=mixed", "表型・擬似言語ブロックは対象外");
def("7", "7.newline", "jp (選択肢)", "選択肢の `[仮名漢字ー]\\n[仮名漢字ー]` (語中改行)", "表型は対象外");

// ─ 10: 末尾残渣 ─
def("10", "10.tail_residue", "jp", "`[ 　]{3,}[^\\s]{0,4}$` (空白 3 個以上 + 0〜4 字の残渣で終わる、U11 q049「␠×5「」型)", "最終行が表行 (`|` で始まるか終わる) の field");
def("10", "10.nombre", "jp", "`[-－ー一—―−][ 　]+[0-9０-９lI]{1,3}[ 　]+[-－ー一—―−]` (ノンブル「- 39 -」「ー 39 一」「一 ll 一」型)", "");
def("10", "10.dotcomma", "jp", "`\\.,` または `,\\.` (「.,」型)", "数字に挟まれたもの (`1.,2` 等) は除く");
def("10", "10.R2a / R2b / R2e", "jp", `S118 再利用: R2a ${S118.R2a.why} / R2b ${S118.R2b.why} / R2e ${S118.R2e.why}`, "最終行が表行の field (S118 と同じ)");

// ─ 2: 斜線ゼロ ─
def("2", "2.nine_six", "jp / jp_raw / fig", "数字トークン (NFKC、`\\d[\\d,]*(\\.\\d+)?`) に 9 または 6 を含む。sub-flag: ends96 = 最下位桁が 9 / 6 (0 に置くと端数が消える: 19→10、59→50、109→100) / cross = 同じ題の他層 (jp / jp_raw / zh / en / fig) に 9・6 を 0 に置いた形があり元の形が無い / year = 4 桁 1950〜2035 で直後が 年 か年度 (sub-flag の候補から外す)", "");

// ─ T: stem 内 markdown 表 ─
def("T", "T.table", "jp / jp_raw", "stem に markdown 表行 `^\\s*\\|.*\\|\\s*$` が 2 行以上ある。has_figure・数値セル数 (`\\d` を含むセル) を記録", "");
def("T", "T.num_raw_clean", "jp_raw ↔ jp(clean)", "表を両層に持つ題で、表セルの数字トークン集合が raw と clean で違う", "");
def("T", "T.num_vs_fig", "jp ↔ fig", "表示 jp の表セルの数字トークンのうち figure_description に無いもの (figure_description が数字を含む題に限る)", "");
def("T", "T.num_vs_tr", "jp ↔ zh / en", "表示 jp の表セルの数字トークンが zh・en の stem のどちらにも無い", "");

// ── 補助: 数字 ───────────────────────────────────────────────────────────────
const EN_NUM = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20, twice: 2, half: 2, double: 2, single: 1, once: 1, hundred: 100, thousand: 1000 };
const KAN_NUM = { "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10, "两": 2, "百": 100, "千": 1000 };
// 漢数字列 → 値 (十六 = 16、五十 = 50、二百三十 = 230)。位取りの無い列 (一二) は 1 字ずつの値も別に足す
function kanjiNum(s) {
  let total = 0, cur = 0;
  for (const c of s) {
    const v = KAN_NUM[c];
    if (v >= 10) { total += (cur || 1) * v; cur = 0; } else cur = cur * 10 + v;
  }
  return total + cur;
}
const HEAD_STRIP = /^\s*(?:問|问|Q|Question)\s*\d+\s*/;
const nfkc = (s) => String(s ?? "").normalize("NFKC");
const stripSep = (s) => s.replace(/(\d),(?=\d{3}(?!\d))/g, "$1");
const fmt = (n) => String(Number(n.toPrecision(12)));
// en の語で数を表すもの (月名・進数名を含む)。jp の「16進数」→ hexadecimal、「6月」→ June の取りこぼしを防ぐ
const EN_LEX = { hexadecimal: 16, decimal: 10, binary: 2, octal: 8, annual: 1, annually: 1, yearly: 1, monthly: 1, daily: 1, pair: 2, triple: 3, dozen: 12, quarter: 4, january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12, jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
/** 数字トークン列。各トークンは字面値 v と換算値の集合 alts を持つ。all = 全 alts + 数詞 */
function numSet(text, lang) {
  let t = stripSep(nfkc(text).replace(HEAD_STRIP, ""));
  t = t.replace(/(\d):00\b/g, "$1");                                  // 9:00 の 00 は時刻表記 (訳で 9 a.m. 等になる)
  const toks = [], all = new Set();
  for (const m of t.matchAll(/\d+(?:\.\d+)?/g)) {
    const v = fmt(Number(m[0])), alts = new Set([v]);
    const after = t.slice(m.index + m[0].length).replace(/^\s+/, "");
    const mul = lang === "en"
      ? (/^million/i.test(after) ? 1e6 : /^billion/i.test(after) ? 1e9 : /^(thousand|k\b)/i.test(after) ? 1e3 : 0)
      : (/^万/.test(after) ? 1e4 : /^億/.test(after) ? 1e8 : /^千/.test(after) ? 1e3 : 0);
    if (mul) alts.add(fmt(Number(v) * mul));
    toks.push({ v, alts }); for (const a of alts) all.add(a);
  }
  if (lang === "en") {
    for (const m of t.toLowerCase().matchAll(/[a-z]+/g)) {
      if (m[0] in EN_NUM) all.add(String(EN_NUM[m[0]]));
      if (m[0] in EN_LEX) all.add(String(EN_LEX[m[0]]));
    }
  } else {
    for (const m of t.matchAll(/[一二三四五六七八九十百千两]+/g)) { all.add(String(kanjiNum(m[0]))); for (const c of m[0]) all.add(String(KAN_NUM[c])); }
    // 単位だけの「万円」「千円」見出し (en は 10k yen 等と数で書く)
    if (/万/.test(t)) all.add("10000"); if (/千/.test(t)) all.add("1000"); if (/億/.test(t)) all.add("100000000");
  }
  return { toks, all, base: new Set(toks.map((x) => x.v)) };
}
// 略語 = 大文字 2 字以上を含む ASCII トークン (Web / Open 等の 1 大文字語は対象外)。
// zh / en が慣用訳に置き換えるもの (OS→操作系统、EC→电子商务 / e-commerce) は除外
const ABBR_RE = /[A-Z]{2,}[a-z]*|[A-Z][a-z]+[A-Z][A-Za-z]*/g;           // ISMS / IoT / GHz / HRTech (PC3 → PC)
const ABBR_TRANSLATED = { zh: new Set(["OS", "EC", "PC", "FAX", "USB", "EU", "OA"]), en: new Set(["EC"]) };
const abbrs = (t, lang) => [...new Set([...nfkc(t).matchAll(ABBR_RE)].map((m) => m[0]).filter((w) => !ABBR_TRANSLATED[lang].has(w)))];
const alnum = (s) => nfkc(s).toLowerCase().replace(/[^a-z0-9]/g, "");
// 単字ラベル = 前後が英数字・& ・ - でない大文字 1 字 (M&A / P2P / L1 / A-GPS を除く)。zh の「U 盘」(USB メモリ) も除く
const labels = (t) => new Set([...nfkc(t).replace(/U\s*盘/g, "").matchAll(/(?<![A-Za-z0-9&\-])[A-Z](?![A-Za-z0-9&\-])/g)].map((m) => m[0]));
const labelsLoose = (t) => new Set([...nfkc(t).matchAll(/(?<![A-Za-z])[A-Z](?![A-Za-z])/g)].map((m) => m[0]));   // jp 側 (A-B直列 / 3－H も拾う)

// ── 補助: LCS 差分 ───────────────────────────────────────────────────────────
const LCS_MAX_CELLS = 2.5e7;
function lcsHunks(a, b) {
  let s = 0; while (s < a.length && s < b.length && a[s] === b[s]) s++;
  let e = 0; while (e < a.length - s && e < b.length - s && a[a.length - 1 - e] === b[b.length - 1 - e]) e++;
  const A = a.slice(s, a.length - e), B = b.slice(s, b.length - e);
  const n = A.length, m = B.length;
  if (!n && !m) return { hunks: [] };
  if ((n + 1) * (m + 1) > LCS_MAX_CELLS) return { hunks: null };
  const W = m + 1, dp = new Uint16Array((n + 1) * W);
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i * W + j] = A[i] === B[j] ? dp[(i + 1) * W + j + 1] + 1 : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
  const hunks = []; let i = 0, j = 0, cur = null;
  const flush = () => { if (cur) { hunks.push(cur); cur = null; } };
  while (i < n || j < m) {
    if (i < n && j < m && A[i] === B[j]) { flush(); i++; j++; continue; }
    if (!cur) cur = { a0: s + i, b0: s + j, a: "", b: "" };
    if (j < m && (i >= n || dp[i * W + j + 1] >= dp[(i + 1) * W + j])) cur.b += B[j++];
    else cur.a += A[i++];
  }
  flush();
  return { hunks };
}
const GLYPH = new Set(["力カ", "一ー", "工エ", "口ロ", "二ニ", "八ハ", "夕タ", "卜ト", "千チ", "才オ"].flatMap((p) => [p, p[1] + p[0]]));
const contentOf = (s) => [...s].filter(isContent).join("");

// ── 型別の走査 ───────────────────────────────────────────────────────────────
function scan0a(raw, clean) {
  const A = normStr(raw), B = normStr(clean);
  const { hunks } = lcsHunks(A, B);
  if (hunks === null) return { hits: [], stats: { too_long: 1 } };
  const hits = [], stats = { hunks: hunks.length, del: 0, ins1: 0, glyph: 0, symbol: 0 };
  for (const h of hunks) {
    const ca = contentOf(h.a), cb = contentOf(h.b);
    const winA = A.slice(Math.max(0, h.a0 - 8), h.a0 + h.a.length + 8), winB = B.slice(Math.max(0, h.b0 - 8), h.b0 + h.b.length + 8);
    const ctx = `raw「${clip(winA, 60)}」→ clean「${clip(winB, 60)}」`;
    const diff = `「${clip(h.a, 40)}」→「${clip(h.b, 40)}」`;
    // struct = 表・図の域 (縦線 / [図] / ⋮ / <br> が前後 8 字にある)。raw 形 = raw 側 ±3 字に 0c の異常 or 想定外の記号があるか
    const struct = /[|⋮]|\[図|図\]|<br>/.test(winA + winB) ? "struct" : "prose";
    const rawWin = A.slice(Math.max(0, h.a0 - 3), h.a0 + h.a.length + 3);
    const garbled = scan0c(rawWin).length > 0 || /[^ぁ-ゖァ-ヺー㐀-䶿一-鿿A-Za-z0-9,.()"\-~:/%・]/.test(h.a);
    const tag = (k) => `${k}/${struct}/${garbled ? "raw_garbled" : "raw_fluent"}`;
    if (/[0-9]/.test(h.a + h.b)) { hits.push({ rule: "0a.num", sub: tag("num"), excerpt: `${diff} ${ctx}` }); continue; }
    if (!cb) { if (ca) stats.del++; else stats.symbol++; continue; }
    if (!ca) { if (cb.length >= 2) hits.push({ rule: "0a.ins", sub: tag("ins"), excerpt: `${diff} ${ctx}` }); else stats.ins1++; continue; }
    if (h.a.length > 30 || h.b.length > 30) { hits.push({ rule: "0a.region", sub: tag("region"), excerpt: `${diff} ${ctx}` }); continue; }
    if (ca.length === 1 && cb.length === 1) {
      if (GLYPH.has(ca + cb)) { stats.glyph++; continue; }
      hits.push({ rule: "0a.char", sub: tag("char"), excerpt: `${diff} ${ctx}` }); continue;
    }
    hits.push({ rule: "0a.word", sub: tag("word"), excerpt: `${diff} ${ctx}` });
  }
  return { hits, stats };
}

function scan0b(jp, zh, en) {
  const hits = [];
  const J = numSet(jp, "jp"), Z = numSet(zh, "zh"), E = numSet(en, "en");
  for (const [lang, X] of [["zh", Z], ["en", E]]) {
    const txt = lang === "zh" ? zh : en; if (!txt) continue;
    const miss = [...new Set(J.toks.filter((x) => x.v !== "1" && ![...x.alts].some((a) => X.all.has(a))).map((x) => x.v))];
    const extra = [...new Set(X.toks.filter((x) => ![...x.alts].some((a) => J.all.has(a))).map((x) => x.v))];
    if (miss.length) hits.push({ rule: "0b.num_missing", lang, excerpt: `jp 数字 {${miss.join(",")}} が ${lang} に無い｜jp「${clip(jp, 50)}」｜${lang}「${clip(txt, 60)}」` });
    if (extra.length) hits.push({ rule: "0b.num_extra", lang, excerpt: `${lang} 数字 {${extra.join(",")}} が jp に無い｜jp「${clip(jp, 50)}」｜${lang}「${clip(txt, 60)}」` });
    const ab = abbrs(jp, lang).filter((w) => !alnum(txt).includes(alnum(w)));
    if (ab.length) hits.push({ rule: "0b.abbr_missing", lang, excerpt: `jp 略語 {${ab.join(",")}} が ${lang} に無い｜jp「${clip(jp, 50)}」｜${lang}「${clip(txt, 60)}」` });
  }
  if (zh) {
    const lj = labelsLoose(jp), ex = [...labels(zh)].filter((c) => !lj.has(c));
    if (ex.length) hits.push({ rule: "0b.label_extra", lang: "zh", excerpt: `zh 単字ラベル {${ex.join(",")}} が jp に無い｜jp「${clip(jp, 50)}」｜zh「${clip(zh, 60)}」` });
  }
  return hits;
}

const LABEL_NEXT = new Set([..."とはのをにがでやもへかさよまだ"]);
function scan0c(t) {
  const hits = [];
  if (!t) return hits;
  const off = progOffset(t);
  const inScope = (i) => off < 0 || i < off;
  // isolated_kanji / rare_kanji
  const segs = [...SEG.segment(t)];
  for (let k = 0; k + 1 < segs.length; k++) {
    const x = segs[k], y = segs[k + 1];
    if (x.segment.length === 1 && y.segment.length === 1 && isKanji(x.segment) && isKanji(y.segment) && inScope(x.index)) {
      if (/[0-9０-９]\s*$/.test(t.slice(0, x.index))) continue;   // 数字 + 助数詞 (1 日減 / 2手目 / 30 個買) は除外
      const bg = x.segment + y.segment;
      if ((BIGRAM_DF.get(bg) ?? 0) <= 1) hits.push({ rule: "0c.isolated_kanji", excerpt: `${bg}｜${excerptAt(t, x.index, 2)}` });
    }
  }
  const seenK = new Set();
  for (let i = 0; i < t.length; i++) if (isKanji(t[i]) && !seenK.has(t[i]) && (KANJI_DF.get(t[i]) ?? 0) <= 1 && inScope(i)) { seenK.add(t[i]); hits.push({ rule: "0c.rare_kanji", excerpt: `${t[i]}｜${excerptAt(t, i)}` }); }
  // 直後が助詞・「さん」等の仮名 = 「製品Aと」「Bさん」型のラベル用法 (S118 R4b の FP 類) は除外
  for (const m of t.matchAll(new RegExp(`[${JP}][A-Z][\\u3041-\\u3096]`, "g"))) if (inScope(m.index) && !LABEL_NEXT.has(m[0][2])) hits.push({ rule: "0c.latin_in_kana", excerpt: excerptAt(t, m.index, 3) });
  for (const id of ["R1a", "R1b", "R1c", "R4a"]) for (const h of S118[id].run(t)) if (inScope(h.index)) hits.push({ rule: `0c.${id}`, excerpt: `${h.suggestion ?? ""}｜${h.excerpt}` });
  for (const h of S118.R3.run(t)) if (!/^" が奇数/.test(h.suggestion ?? "")) hits.push({ rule: "0c.R3", excerpt: `${h.suggestion}｜${h.excerpt}` });
  // symbol (選択肢の一行表「[表] | a | b |」と縦線 2 本以上の行は表とみなして除外)
  const lines = t.split("\n"); let pos = 0;
  for (const l of lines) {
    if (inScope(pos) && !isTableRow(l) && !/\[表\]/.test(l) && (l.match(/\|/g) ?? []).length < 2) {
      for (const m of l.matchAll(/%%|[ｦ-ﾟ]+|\|/g)) hits.push({ rule: "0c.symbol", excerpt: `「${m[0]}」｜${excerptAt(t, pos + m.index, m[0].length)}` });
    }
    pos += l.length + 1;
  }
  const scope = off < 0 ? t : t.slice(0, off);
  const ob = (scope.match(/\[/g) ?? []).length, cb = (scope.match(/\]/g) ?? []).length;
  if (ob !== cb) { const i = scope.search(ob > cb ? /\[/ : /\]/); hits.push({ rule: "0c.symbol", excerpt: `[] が ${ob}/${cb}｜${excerptAt(t, i)}` }); }
  return hits;
}

function scan0q(t, layer) {
  const hits = [];
  if (!t || !t.includes('"')) return hits;
  if (layer === "en") { hits.push({ rule: "0q.en", excerpt: `" ×${t.split('"').length - 1}｜${excerptAt(t, t.indexOf('"'))}` }); return hits; }
  const off = progOffset(t);
  for (let i = t.indexOf('"'); i >= 0; i = t.indexOf('"', i + 1)) {
    const inProg = off >= 0 && i >= off;
    const near = t.slice(Math.max(0, i - 24), i + 25);
    const lit = /[←=＝+,(（)）]\s*"[A-Za-z0-9]{1,20}"|"[A-Za-z0-9]{1,20}"\s*[←=＝+,(（)）]/.test(near);
    hits.push({ rule: inProg || lit ? "0q.literal" : "0q.prose", excerpt: excerptAt(t, i) });
  }
  return hits;
}

const HEAD = { jp: [/^\s*問\s*\d+/, /\n\s*問\s*\d+[\s　]/], jp_raw: [/^\s*問\s*\d+/, /\n\s*問\s*\d+[\s　]/], zh: [/^\s*[问問]\s*\d+/, /\n\s*问\s*\d+/], en: [/^\s*(?:Q|Question)\s*\d+\b/, /\n\s*Q\d+\b/] };
function scan1(t, layer) {
  const re = HEAD[layer]; if (!re || !t) return [];
  const out = [];
  const m0 = t.match(re[0]); if (m0) out.push({ rule: "1.head", excerpt: excerptAt(t, m0.index, m0[0].length) });
  const m1 = t.match(re[1]); if (m1) out.push({ rule: "1.mid", excerpt: excerptAt(t, m1.index + 1, m1[0].length - 1) });
  return out;
}

const PARTICLE = new Set([..."はをにがのでともへや"]);
const tableish = (t) => hasTable(t) || /=/.test(t);
function scan7(t, field) {
  const out = []; if (!t) return out;
  const off = progOffset(t);
  const lim = off < 0 ? t.length : off;
  const figure = /［図］|\[図\]/.test(t), table = tableish(t);
  for (const m of t.matchAll(new RegExp(`[${JP}] [${JP}]`, "g"))) {
    if (m.index >= lim) continue;
    const p = m[0][0], n = m[0][2];
    const sub = table ? "table" : figure ? "figure" : PARTICLE.has(n) ? "particle" : isKata(p) && isKata(n) ? "kata" : isKanji(p) && isKanji(n) ? "kanji" : "prose";
    out.push({ rule: "7.space", sub, excerpt: excerptAt(t, m.index + 1, 1) });
  }
  if (!table) {
    const mixed = new RegExp(`[${JP}], [${JP}]`).test(t.slice(0, lim));
    for (const m of t.matchAll(new RegExp(`[${JP}],[${JP}]`, "g"))) if (m.index < lim) out.push({ rule: "7.comma_nospace", sub: mixed ? "mixed" : "plain", excerpt: excerptAt(t, m.index + 1, 1) });
    if (field.startsWith("choice.")) for (const m of t.matchAll(new RegExp(`[${JP}]\\n[${JP}]`, "g"))) out.push({ rule: "7.newline", excerpt: excerptAt(t, m.index + 1, 1) });
  }
  return out;
}

function scan10(t) {
  const out = []; if (!t) return out;
  const ls = t.split("\n").filter((l) => l.trim());
  const lastIsTable = ls.length > 0 && (/^\s*\|/.test(ls[ls.length - 1]) || /\|\s*$/.test(ls[ls.length - 1]));
  const m = lastIsTable ? null : t.match(/[ 　]{3,}[^\s]{0,4}$/); if (m) out.push({ rule: "10.tail_residue", excerpt: excerptAt(t, m.index, m[0].length) });
  for (const x of t.matchAll(/[-－ー一—―−][ 　]+[0-9０-９lI]{1,3}[ 　]+[-－ー一—―−]/g)) out.push({ rule: "10.nombre", excerpt: excerptAt(t, x.index, x[0].length) });
  for (const x of t.matchAll(/\.,|,\./g)) { if (/\d/.test(t[x.index - 1] ?? "") && /\d/.test(t[x.index + 2] ?? "")) continue; out.push({ rule: "10.dotcomma", excerpt: excerptAt(t, x.index, 2) }); }
  if (!lastIsTable) for (const id of ["R2a", "R2b", "R2e"]) for (const h of S118[id].run(t)) out.push({ rule: `10.${id}`, excerpt: `${h.suggestion ?? ""}｜${h.excerpt}` });
  return out;
}

const NUMTOK = /\d[\d,]*(?:\.\d+)?/g;
const numTokens = (t) => [...nfkc(t).matchAll(NUMTOK)].map((m) => ({ v: m[0].replace(/,+$/, ""), i: m.index }));
function scan2(t, otherText) {
  const out = []; if (!t) return { hits: out, hasDigit: false };
  const n = nfkc(t); const toks = numTokens(t);
  for (const { v, i } of toks) {
    if (!/[96]/.test(v)) continue;
    const plain = v.replace(/,/g, "");
    const after = n.slice(i + v.length, i + v.length + 2);
    const year = /^\d{4}$/.test(plain) && +plain >= 1950 && +plain <= 2035 && /^年/.test(after);
    const ends96 = /[96]$/.test(plain.replace(/\.\d+$/, ""));
    const zeroed = new Set();
    const pos = [...plain].map((c, k) => (c === "9" || c === "6" ? k : -1)).filter((k) => k >= 0);
    for (let mask = 1; mask < 1 << Math.min(pos.length, 6); mask++) {
      const arr = [...plain]; pos.forEach((k, b) => { if (mask & (1 << b)) arr[k] = "0"; }); zeroed.add(arr.join(""));
    }
    const other = new Set(numTokens(otherText).map((x) => x.v.replace(/,/g, "")));
    const cross = !other.has(plain) && [...zeroed].some((z) => other.has(z));
    const flags = [ends96 && !year ? "ends96" : null, cross ? "cross" : null, year ? "year" : null].filter(Boolean);
    out.push({ rule: "2.nine_six", sub: flags.join("+") || "-", excerpt: `${v}｜${excerptAt(t, i, v.length)}` });
  }
  return { hits: out, hasDigit: toks.length > 0 };
}

function tableInfo(t) {
  const rows = String(t ?? "").split("\n").filter(isTableRow);
  if (rows.length < 2) return null;
  const cells = rows.flatMap((r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim())).filter((c) => !/^:?-{2,}:?$/.test(c));
  const numCells = cells.filter((c) => /\d/.test(nfkc(c)));
  const nums = new Set(numCells.flatMap((c) => numTokens(c).map((x) => x.v.replace(/,/g, ""))));
  return { rows: rows.length, numCells: numCells.length, nums };
}

// ── 1 題の走査 ───────────────────────────────────────────────────────────────
function scanQuestion(q, tr, figDesc) {
  const { clean, raw, fields } = layersOf(q, tr);
  const hits = []; const stats = { a0: null, digitFields: { jp: 0, jp_raw: 0, fig: 0 } };
  const push = (type, layer, field, h) => hits.push({ type, layer, field, rule: h.rule, sub: h.sub ?? null, excerpt: h.excerpt });

  if (clean) { const r = scan0a(raw, clean); stats.a0 = r.stats; for (const h of r.hits) push("0a", "jp_raw→jp", "stem", h); }

  for (const f of fields.filter((x) => x.layer === "jp")) {
    const zh = pick(fields, "zh", f.field), en = pick(fields, "en", f.field);
    for (const h of scan0b(f.text, zh, en)) push("0b", h.lang, f.field, h);
    const an = scan0c(f.text);
    for (const h of an) push("0c", "jp", f.field, h);
    if (an.length) {
      const rules = [...new Set(an.map((h) => h.rule.replace(/^0c\./, "")))].join(",");
      push("0c", "zh", f.field, { rule: "0c.tr_of_anomaly", sub: rules, excerpt: `jp「${clip(f.text, 50)}」｜zh「${clip(zh, 70)}」` });
      push("0c", "en", f.field, { rule: "0c.tr_of_anomaly", sub: rules, excerpt: `jp「${clip(f.text, 50)}」｜en「${clip(en, 80)}」` });
    }
    for (const h of scan7(f.text, f.field)) push("7", "jp", f.field, h);
    for (const h of scan10(f.text)) push("10", "jp", f.field, h);
  }
  for (const f of fields) {
    for (const h of scan0q(f.text, f.layer)) push("0q", f.layer, f.field, h);
    for (const h of scan1(f.text, f.layer)) push("1", f.layer, f.field, h);
  }
  // cross 比較の相手 = 同じ題の他 field 全部 (自 field だけを除く。figure_description は fig 層の自 field)
  const pool = [...fields.map((x) => ({ key: `${x.layer}|${x.field}`, text: x.text })), { key: "fig|figure_description", text: figDesc ?? "" }];
  const s2 = (layer, field, t) => {
    const others = pool.filter((x) => x.key !== `${layer}|${field}`).map((x) => x.text).join("\n");
    const r = scan2(t, others); if (r.hasDigit) stats.digitFields[layer]++;
    for (const h of r.hits) push("2", layer, field, h);
  };
  for (const f of fields.filter((x) => x.layer === "jp" || x.layer === "jp_raw")) s2(f.layer, f.field, f.text);
  if (figDesc) s2("fig", "figure_description", figDesc);

  const tDisp = tableInfo(fields[0].text), tRaw = clean ? tableInfo(raw) : null;
  let table = null;
  if (tDisp || tRaw) {
    table = { has_figure: !!q.has_figure, layers: [tDisp ? (clean ? "jp(clean)" : "jp(raw)") : null, tRaw ? "jp_raw" : null].filter(Boolean), rows: (tDisp ?? tRaw).rows, num_cells: (tDisp ?? tRaw).numCells, sub: [] };
    push("T", tDisp ? "jp" : "jp_raw", "stem", { rule: "T.table", sub: `fig=${q.has_figure ? 1 : 0} num_cells=${table.num_cells}`, excerpt: clip((tDisp ? fields[0].text : raw).split("\n").filter(isTableRow).slice(0, 3).join(" "), 90) });
    if (tDisp && tRaw) {
      const a = [...tRaw.nums].filter((v) => !tDisp.nums.has(v)), b = [...tDisp.nums].filter((v) => !tRaw.nums.has(v));
      if (a.length || b.length) { table.sub.push("num_raw_clean"); push("T", "jp_raw↔jp", "stem", { rule: "T.num_raw_clean", excerpt: `raw のみ {${a.join(",")}} / clean のみ {${b.join(",")}}` }); }
    }
    if (tDisp && figDesc && /\d/.test(figDesc)) {
      const fd = new Set(numTokens(figDesc).map((x) => x.v.replace(/,/g, "")));
      const miss = [...tDisp.nums].filter((v) => !fd.has(v));
      if (miss.length) { table.sub.push("num_vs_fig"); push("T", "jp↔fig", "stem", { rule: "T.num_vs_fig", excerpt: `表のみ {${miss.slice(0, 12).join(",")}${miss.length > 12 ? ",…" : ""}} (表 ${tDisp.nums.size} / fig ${fd.size})` }); }
    }
    if (tDisp) {
      const tz = new Set([...numSet(pick(fields, "zh", "stem"), "zh").all, ...numSet(pick(fields, "en", "stem"), "en").all]);
      const miss = [...tDisp.nums].map((v) => fmt(Number(v))).filter((v) => !tz.has(v));
      if (miss.length) { table.sub.push("num_vs_tr"); push("T", "jp↔zh/en", "stem", { rule: "T.num_vs_tr", excerpt: `訳に無い {${miss.slice(0, 12).join(",")}${miss.length > 12 ? ",…" : ""}}` }); }
    }
  }
  return { hits, stats, table, hasClean: !!clean };
}

// ── 全量走査 ─────────────────────────────────────────────────────────────────
const ALL = [];
const PERQ = new Map();
const A0 = { questions_with_clean: 0, hunks: 0, del: 0, ins1: 0, glyph: 0, symbol: 0, too_long: 0 };
const DIGIT_FIELDS = Object.fromEntries(SECTORS.map((k) => [k, { jp: 0, jp_raw: 0, fig: 0 }]));
const TABLES = [];
for (const q of QUESTIONS) {
  const sector = sectorOf(q.id, q.exam_id);
  const r = scanQuestion(q, TR[q.exam_id]?.[q.id], FIGDESC.get(q.id));
  PERQ.set(q.id, r);
  if (r.hasClean) { A0.questions_with_clean++; for (const k of Object.keys(r.stats.a0 ?? {})) A0[k] += r.stats.a0[k]; }
  for (const l of Object.keys(r.stats.digitFields)) DIGIT_FIELDS[sector][l] += r.stats.digitFields[l];
  if (r.table) TABLES.push({ id: q.id, sector, ...r.table });
  for (const h of r.hits) ALL.push({ id: q.id, exam: q.exam_id, sector, ...h });
}
const cmpStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
ALL.sort((a, b) => cmpStr(a.id, b.id) || cmpStr(a.type, b.type) || cmpStr(a.layer, b.layer) || cmpStr(a.field, b.field) || cmpStr(a.rule, b.rule) || cmpStr(a.excerpt, b.excerpt));

// ── recall 検査 ──────────────────────────────────────────────────────────────
// snap: "current" = 現行データ、それ以外 = 是正 commit の親。expect = 拾われるべきルール (いずれか)。
const C0 = ["0c.isolated_kanji", "0c.rare_kanji", "0c.latin_in_kana", "0c.R1a", "0c.R1b", "0c.R1c", "0c.R3", "0c.R4a", "0c.symbol"];
const RECALL = [
  { id: "2023r05-q011", snap: "15d50bc^", type: "0a", field: "stem", expect: ["0a.word", "0a.char", "0a.ins"], must: "変革", note: "clean 推測補完 刷新→変革 (raw「新」)" },
  { id: "2025r07-q014", snap: "7aa7af8^", type: "0a", field: "stem", expect: ["0a.word", "0a.char"], must: "強み", note: "s975 俯瞰→強み (raw「佑典」)" },
  { id: "2025r07-q070", snap: "7aa7af8^", type: "0a", field: "stem", expect: ["0a.word", "0a.char"], must: "修", note: "s975 是正→修正 (raw「量正」)" },
  { id: "2025r07-q085", snap: "7aa7af8^", type: "0a", field: "stem", expect: ["0a.num"], must: "89", note: "s975 30% / 35%→89% / 90%" },
  { id: "2026r08-q070", snap: "afbfcd0^", type: "0c", field: "choice.イ", expect: C0, layer: "jp", must: "模僚", note: "jp 模僚 → zh/en「再発」推測訳 (jp 異常の命中 = zh/en が候補に入る)" },
  { id: "2026r08-q032", snap: "afbfcd0^", type: "0c", field: "choice.イ", expect: C0, layer: "jp", must: "( 社", note: "jp「( 社」→ zh/en C を落として訳出" },
  { id: "2026r08-q032", snap: "afbfcd0^", type: "0c", field: "choice.ア", expect: C0, layer: "jp", must: "民L", note: "jp「販売才とだ民Lた」(同題の別肢)" },
  { id: "2026r08-q032", snap: "afbfcd0^", type: "0c", field: "choice.ウ", expect: C0, layer: "jp", must: "加エ", note: "jp「加エ」(正解肢、同題の別肢)" },
  { id: "2026r08-q066", snap: "afbfcd0^", type: "0c", field: "stem", expect: ["0c.*", "0b.num_missing", "0b.num_extra", "0b.abbr_missing"], layer: null, note: "jp 煩雑→複雑 (流暢な誤り) → 复杂 / complex" },
  { id: "2026r08-q057", snap: "current", type: "0q", field: "*", expect: ["0q.prose", "0q.literal"], note: "ASCII \" (母数 excluded)" },
  { id: "2026r08-q084", snap: "afbfcd0^", type: "0q", field: "*", expect: ["0q.prose", "0q.literal"], note: "4 肢 ASCII \" (U11 是正済)" },
  { id: "2026r08-q025", snap: "afbfcd0^", type: "0q", field: "stem", expect: ["0q.prose", "0q.literal"], note: "clean「\"ビッグデータ\"」(U11 是正済)" },
  { id: "2019h31h-q001", snap: "current", type: "1", field: "stem", layer: "zh", expect: ["1.head"], note: "zh「问1」" },
  { id: "2019h31h-q001", snap: "current", type: "1", field: "stem", layer: "en", expect: ["1.head"], note: "en「Q1」" },
  { id: "2015h27a-q089", snap: "current", type: "1", field: "*", expect: ["1.head", "1.mid"], note: "見出し混入 (母数 excluded、raw・clean・zh・en)" },
  { id: "2010h22h-q023", snap: "current", type: "7", field: "choice.ウ", expect: ["7.space"], sub: ["prose", "kanji", "kata"], note: "読点脱落「検査を行い␣サンプル中の」" },
  { id: "2013h25a-q043", snap: "current", type: "7", field: "choice.イ", expect: ["7.space"], sub: ["prose", "kanji", "kata"], note: "読点脱落 (同一肢 2 箇所)" },
  { id: "2013h25a-q043", snap: "current", type: "7", field: "choice.ウ", expect: ["7.space"], sub: ["prose", "kanji", "kata"], note: "読点脱落" },
  { id: "2013h25a-q043", snap: "current", type: "7", field: "choice.エ", expect: ["7.space"], sub: ["prose", "kanji", "kata"], note: "読点脱落" },
  { id: "2024r06-q005", snap: "current", type: "7", field: "choice.ウ", expect: ["7.space"], sub: ["prose", "kanji", "kata"], note: "読点脱落「国や学術機関␣他の企業など」(excluded)" },
  { id: "2024r06-q012", snap: "current", type: "7", field: "choice.イ", expect: ["7.comma_nospace"], note: "行跨ぎ読点後の空白欠落「開発, 提供,利用」(U9 NIT-4、**未是正** = 現行データに残存)" },
  { id: "2024r06-q012", snap: "current", type: "7", field: "choice.ウ", expect: ["7.comma_nospace"], note: "行跨ぎ読点後の空白欠落「使用方法,結果」(U9 NIT-4、未是正)" },
  { id: "2019r01a-q041", snap: "current", type: "7", field: "choice.エ", expect: ["7.comma_nospace"], note: "同一肢内で ASCII 読点の空白有無が割れる「リスクの識別,コントロール」(U4 §11、未是正)" },
  { id: "2019r01a-q016", snap: "d697b6e^", type: "7", field: "choice.イ", expect: ["7.space"], sub: ["prose", "kanji", "kata"], note: "読点脱落「行い␣システム」(正解肢、U4 是正済)" },
  { id: "2011h23tokubetsu-q033", snap: "current", type: "10", field: "choice.ア", expect: ["10.dotcomma"], note: "「.,」型 (13exam)" },
  { id: "2012h24h-q017", snap: "current", type: "10", field: "choice.イ", expect: ["10.dotcomma"], note: "「.,」型 (13exam)" },
  { id: "2025r07-q091", snap: "7aa7af8^", type: "10", field: "choice.ア", expect: ["10.tail_residue", "10.nombre", "10.R2a", "10.R2b", "10.R2e"], note: "末尾残渣 (U10 是正済)" },
  { id: "2025r07-q052", snap: "7aa7af8^", type: "10", field: "choice.イ", expect: ["10.tail_residue", "10.nombre", "10.R2a", "10.R2b", "10.R2e"], note: "末尾残渣 (U10 是正済)" },
  { id: "2026r08-q049", snap: "afbfcd0^", type: "10", field: "choice.ウ", expect: ["10.tail_residue"], note: "末尾「␠×5「」(U11 是正済)" },
  { id: "2026r08-q049", snap: "afbfcd0^", type: "10", field: "choice.エ", expect: ["10.tail_residue"], note: "末尾「␠×7「」(U11 是正済)" },
  { id: "2026r08-q082", snap: "afbfcd0^", type: "10", field: "choice.エ", expect: ["10.nombre", "10.tail_residue"], note: "「ー 39 一␠×5“」(U11 是正済)" },
  { id: "2026r08-q091", snap: "afbfcd0^", type: "10", field: "choice.イ", expect: ["10.tail_residue"], note: "末尾「␠×16「」(U11 是正済)" },
  { id: "2020r02o-q004", snap: "dc03c27^", type: "2", field: "stem", expect: ["2.nine_six"], must: "19", note: "斜線ゼロ 10年→19年 (U5 是正済)" },
  { id: "2023r05-q025", snap: "15d50bc^", type: "2", field: "*", expect: ["2.nine_six"], must: "19万", note: "斜線ゼロ 10万円→19万円 (U8 是正済)" },
  { id: "2024r06-q059", snap: "c698a79^", type: "2", field: "choice.ア", expect: ["2.nine_six"], must: "19cnm", note: "斜線ゼロ 10cm→19cnm (U9 是正済)" },
  { id: "2022r04-q066", snap: "33cf9be^", type: "2", field: "*", expect: ["2.nine_six"], must: "109", note: "斜線ゼロ 100 (U7 是正済)" },
  { id: "2018h30h-q085", snap: "current", type: "2", field: "stem", layer: "jp_raw", expect: ["2.nine_six"], must: "9個", note: "raw のみ 9個以上←0個以上" },
  { id: "2019h31h-q053", snap: "current", type: "2", field: "stem", layer: "jp_raw", expect: ["2.nine_six"], must: "59本", note: "raw のみ 59本←50本" },
  { id: "2020r02o-q075", snap: "dc03c27^", type: "2", field: "choice.ア", expect: ["2.nine_six"], must: "609", note: "斜線ゼロ 100→609 型 (U5 是正済)" },
  { id: "2023r05-q004", snap: "current", type: "2", field: "stem", layer: "jp_raw", expect: ["2.nine_six"], must: "306", note: "raw のみの斜線ゼロ (表示層は clean)" },
  { id: "2017h29a-q012", snap: "ce3e31e^", type: "2", field: "choice.イ", expect: ["2.nine_six"], must: "19人", note: "19人←10人 (波 2 是正済)" },
  { id: "2017h29h-q070", snap: "ce3e31e^", type: "2", field: "choice.ウ", expect: ["2.nine_six"], must: "16", note: "16進数←10進数 (**aa**、波 3 是正済)" },
  { id: "2021r03-q100", snap: "818497d^", type: "1", field: "stem", expect: ["1.head"], note: "見出し「問100」(U6 是正済)" },
  { id: "2022r04-q001", snap: "33cf9be^", type: "1", field: "stem", expect: ["1.head"], note: "見出し「問1」(U7 是正済)" },
  { id: "2020r02o-q023", snap: "dc03c27^", type: "10", field: "choice.エ", expect: ["10.nombre", "10.tail_residue", "10.R2a", "10.R2b", "10.R2e"], note: "ノンブル「一 ll 一」(U5 是正済)" },
  { id: "2015h27a-q062", snap: "ce3e31e^", type: "10", field: "choice.エ", expect: ["10.tail_residue", "10.nombre", "10.R2a", "10.R2b", "10.R2e"], note: "末尾「␠×25 .」(波 1 是正済)" },
  { id: "2026r08-q041", snap: "afbfcd0^", type: "0c", field: "choice.ウ", expect: ["0c.*"], layer: "jp", must: "他理", note: "「その他理的」→ その倫理的 (正解肢、U11 是正済)" },
  { id: "2016h28h-q009", snap: "ce3e31e^", type: "0c", field: "*", expect: ["0c.*", "0b.num_missing", "0b.num_extra", "0b.label_extra"], must: "4", note: "4社←A社 (波 2 是正済)" },
  { id: "2022r04-q018", snap: "33cf9be^", type: "0c", field: "choice.ウ", expect: ["0c.*", "0b.num_missing", "0b.num_extra", "0b.abbr_missing"], note: "肢後半が別文に言い換え (U7 是正済)" },
  { id: "2021r03-q050", snap: "current", type: "2", field: "figure_description", layer: "fig", expect: ["2.nine_six"], note: "figure_description の斜線ゼロ (母数外)" },
  ...FIG_MISMATCH.map((id) => ({ id, snap: "current", type: "T", field: "stem", expect: ["T.num_raw_clean", "T.num_vs_fig", "T.num_vs_tr"], note: "fig_stem_mismatch_S127 (stem 転記表の原典不一致)" })),
];
const SNAP = new Map();
function snapshot(rev, exam) {
  const k = `${rev}|${exam}`;
  if (!SNAP.has(k)) {
    const qs = gitJson(rev, "data/ip/quiz/questions.json").questions;
    const tr = gitJson(rev, `data/ip/quiz/translations/${exam}.json`).questions;
    SNAP.set(k, { qs: new Map(qs.map((x) => [x.id, x])), tr });
  }
  return SNAP.get(k);
}
const RECALL_OUT = RECALL.map((r) => {
  const exam = r.id.replace(/-q\d+$/, "");
  let res;
  if (r.snap === "current") res = PERQ.get(r.id);
  else { const s = snapshot(r.snap, exam); res = scanQuestion(s.qs.get(r.id), s.tr[r.id], FIGDESC.get(r.id)); }
  const got = res.hits.filter((h) => (r.field === "*" || h.field === r.field) && (!r.layer || h.layer === r.layer) && (r.expect.includes(h.rule) || (r.expect.includes("0c.*") && C0.includes(h.rule))) && (!r.sub || r.sub.includes(h.sub)) && (!r.must || h.excerpt.includes(r.must)));
  const near = res.hits.filter((h) => (r.field === "*" || h.field === r.field) && h.type === r.type).map((h) => `${h.layer}:${h.rule}${h.sub ? "/" + h.sub : ""}`);
  const tableOnly = r.type === "T" ? res.hits.some((h) => h.rule === "T.table") : null;
  return { id: r.id, snapshot: r.snap, type: r.type, has_table: tableOnly, field: r.field, layer: r.layer ?? null, expect: (r.expect === C0 ? "0c.*" : r.expect.join("|")) + (r.sub ? ` sub=${r.sub.join("|")}` : "") + (r.must ? ` 抜粋に「${r.must}」` : ""), note: r.note, hit: got.length > 0, matched: [...new Set(got.map((h) => `${h.layer}:${h.rule}${h.sub ? "/" + h.sub : ""}`))], same_type_hits: [...new Set(near)], excerpt: got[0]?.excerpt ?? null };
});

// ── 集計 ─────────────────────────────────────────────────────────────────────
const TYPES = [["0a", "s975 / clean 推測補完 (raw↔clean)"], ["0b", "訳層の数字・英字の不対応"], ["0c", "jp 異常字 + その訳"], ["0q", "ASCII \""], ["1", "見出し混入"], ["7", "読点脱落 / 行跨ぎ読点 / 語中空白"], ["10", "末尾残渣 / ノンブル / .,"], ["2", "斜線ゼロ候補"], ["T", "stem 内 markdown 表"]];
const SECTOR_N = { pop: 0, excluded: 0, "13exam": 0 };
for (const q of QUESTIONS) SECTOR_N[sectorOf(q.id, q.exam_id)]++;
function tally(rows, keyFn) {
  const m = new Map();
  for (const h of rows) {
    const k = keyFn(h);
    if (!m.has(k)) m.set(k, { key: k, hits: 0, fields: new Set(), qs: new Set(), bySector: { pop: new Set(), excluded: new Set(), "13exam": new Set() } });
    const e = m.get(k); e.hits++; e.fields.add(`${h.id}|${h.layer}|${h.field}`); e.qs.add(h.id); e.bySector[h.sector].add(h.id);
  }
  return [...m.values()].sort((a, b) => cmpStr(a.key, b.key)).map((e) => ({ key: e.key, hits: e.hits, fields: e.fields.size, questions: e.qs.size, pop: e.bySector.pop.size, excluded: e.bySector.excluded.size, "13exam": e.bySector["13exam"].size }));
}
const SUMMARY = Object.fromEntries(TYPES.map(([t]) => {
  const rows = ALL.filter((h) => h.type === t);
  return [t, { total: tally(rows, () => "all")[0] ?? null, by_rule_layer: tally(rows, (h) => `${h.rule} @ ${h.layer}`), by_rule_sub: tally(rows, (h) => `${h.rule}${h.sub ? " / " + h.sub : ""}`) }];
}));

const out = {
  schema: "backlog_scan_A1/1",
  script: "scripts/quiz-backlog-scan-A1.mjs",
  decision: "D-150 §4 段 1 (方式 A、0 token)",
  icu: process.versions.icu, unicode: process.versions.unicode,
  inputs_sha256_16: Object.fromEntries(Object.entries(INPUT_HASH).sort(([a], [b]) => cmpStr(a, b))),
  scope: { questions: QUESTIONS.length, sectors: SECTOR_N, figure_description_questions: FIGDESC.size, exams: EXAMS.length },
  a0_stats: A0, digit_fields: DIGIT_FIELDS,
  rules: RULE_DEFS,
  summary: SUMMARY,
  recall: RECALL_OUT,
  tables: TABLES.map((t) => ({ ...t, in_fig_stem_mismatch: FIG_MISMATCH.includes(t.id) })),
  candidates: Object.fromEntries(TYPES.map(([t]) => [t, ALL.filter((h) => h.type === t).map(({ type, ...h }) => h)])),
};
writeFileSync(P(OUT_JSON), JSON.stringify(out, null, 1) + "\n");

// ── md ──────────────────────────────────────────────────────────────────────
const md = [];
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
md.push("# A1 — ⑨ backlog 決定的走査 (D-150 §4 段 1、0 token) — S127", "");
md.push(`- 脚本: \`${out.script}\` (読み取り専用、冪等)。候補 JSON: \`${OUT_JSON}\``);
md.push(`- 母数: ${QUESTIONS.length} 題 = pop (⑤-2 母数内) ${SECTOR_N.pop} / excluded (母数 excluded) ${SECTOR_N.excluded} / 13exam ${SECTOR_N["13exam"]}。figure_description は question_bank.json (gitignored) の ${FIGDESC.size} 題`);
md.push(`- ICU ${out.icu} / Unicode ${out.unicode} (0c.isolated_kanji は Intl.Segmenter の辞書に依存)。**再実行で byte 一致するのは、同じ入力 sha と同じ ICU 版の環境に限る** — とくに question_bank.json は gitignored で、無い環境では fig 層・2 の cross・T.num_vs_fig が変わる`);
md.push(`- 入力 sha256 (先頭 16): questions.json \`${INPUT_HASH["data/ip/quiz/questions.json"]}\`、question_bank.json \`${INPUT_HASH[BANK_REL] ?? "(無)"}\``);
md.push("- 走査層: jp = 表示層 (stem は stem_jp_clean があればそれ、無ければ questions.json の stem_jp。選択肢は choices_jp = raw がそのまま表示、quizModel.ts:120 と同じ規則) / jp_raw = clean を持つ題の raw stem_jp (学習者不可視) / zh・en = translations sidecar / fig = figure_description (型 2 と T の sub-flag だけ)。**射程外**: explanations 本文 (0c の語頻度表にだけ使用)、by_year・question_bank の stem / choices、`.phase1`。");
md.push("- 区分: `full52_population_S118.json` の excluded id → excluded、population に無い exam → 13exam、それ以外 → pop。");
md.push("- **件数は源照合 (A2) に回す候補であり、欠陥数ではない。** 1 題に複数ルールが当たる。表の数は「題数 (distinct question)」、hits は出現数。", "");
md.push(...NOTES_TOP());
md.push("## 1. 型 × ルール × 区分の件数", "");
md.push("区分列は**題数**。fields = (題, 層, field) の distinct 数。", "");
for (const [t, name] of TYPES) {
  const s = SUMMARY[t];
  md.push(`### 型 ${t} — ${name}`, "");
  if (!s.total) { md.push("候補 0。", ""); continue; }
  md.push(`計: hits ${s.total.hits} / fields ${s.total.fields} / 題 ${s.total.questions} (pop ${s.total.pop} / excluded ${s.total.excluded} / 13exam ${s.total["13exam"]})`, "");
  md.push("| ルール @ 層 | hits | fields | 題 | pop | excluded | 13exam |", "|---|---:|---:|---:|---:|---:|---:|");
  for (const r of s.by_rule_layer) md.push(`| ${esc(r.key)} | ${r.hits} | ${r.fields} | ${r.questions} | ${r.pop} | ${r.excluded} | ${r["13exam"]} |`);
  if (s.by_rule_sub.some((r) => r.key.includes(" / "))) {
    md.push("", "| ルール / sub | hits | fields | 題 | pop | excluded | 13exam |", "|---|---:|---:|---:|---:|---:|---:|");
    for (const r of s.by_rule_sub) md.push(`| ${esc(r.key)} | ${r.hits} | ${r.fields} | ${r.questions} | ${r.pop} | ${r.excluded} | ${r["13exam"]} |`);
  }
  md.push("", "代表例 (ルールごとに先頭 3 件、id 順):", "");
  const rules = [...new Set(ALL.filter((h) => h.type === t).map((h) => h.rule))].sort();
  for (const r of rules) {
    const ex = ALL.filter((h) => h.type === t && h.rule === r && (t !== "0c" || h.layer === "jp" || r === "0c.tr_of_anomaly")).filter((h, i, a) => a.findIndex((x) => x.id === h.id) === i).slice(0, 3);
    for (const h of ex) md.push(`- \`${h.id}\` ${h.layer} ${h.field} [${r}${h.sub ? " / " + h.sub : ""}] (${h.sector}) ${esc(clip(h.excerpt, 140))}`);
  }
  md.push("");
  if (t === "0a") md.push(`0a 不計上の内訳 (clean 保有 ${A0.questions_with_clean} 題、hunk 計 ${A0.hunks}): 削除のみ ${A0.del} / 記号のみ ${A0.symbol} / 同形字 1 字置換 ${A0.glyph} / 1 字挿入 ${A0.ins1} / LCS 上限超 ${A0.too_long} 題`, "");
  if (t === "2") {
    md.push("数字を含む field 数と候補 field 数 (層 × 区分):", "", "| 層 | 区分 | 数字を含む field | 9/6 候補 field | 比 | sub に ends96 | sub に cross |", "|---|---|---:|---:|---:|---:|---:|");
    for (const l of ["jp", "jp_raw", "fig"]) for (const sec of SECTORS) {
      const c = ALL.filter((h) => h.type === "2" && h.layer === l && h.sector === sec);
      const f = new Set(c.map((h) => `${h.id}|${h.field}`)).size, d = DIGIT_FIELDS[sec][l];
      md.push(`| ${l} | ${sec} | ${d} | ${f} | ${d ? (f / d * 100).toFixed(1) + "%" : "—"} | ${new Set(c.filter((h) => h.sub.includes("ends96")).map((h) => h.id + h.field)).size} | ${new Set(c.filter((h) => h.sub.includes("cross")).map((h) => h.id + h.field)).size} |`);
    }
    md.push("");
  }
  if (t === "T") {
    const nFig = TABLES.filter((x) => x.has_figure).length;
    md.push(`表を持つ題 ${TABLES.length} (うち has_figure ${nFig} / 図なし ${TABLES.length - nFig})。sub-flag: num_raw_clean ${TABLES.filter((x) => x.sub.includes("num_raw_clean")).length} / num_vs_fig ${TABLES.filter((x) => x.sub.includes("num_vs_fig")).length} / num_vs_tr ${TABLES.filter((x) => x.sub.includes("num_vs_tr")).length}`, "");
  }
}
md.push("## 2. ルールの定義", "");
md.push("| 型 | ルール | 層 | 定義 | 除外 |", "|---|---|---|---|---|");
for (const r of RULE_DEFS) md.push(`| ${r.type} | ${esc(r.id)} | ${esc(r.layers)} | ${esc(r.definition)} | ${esc(r.exclusions)} |`);
md.push("");
md.push("## 3. recall 検査 (既知実例)", "");
md.push("snapshot が `<commit>^` の行は是正 commit の親の questions.json / translations を `git show` で読み、同じ走査関数に通した。", "");
md.push("| id | snapshot | 型 | field | 期待ルール | 結果 | 当たったルール / 同型の他命中 | 備考 |", "|---|---|---|---|---|---|---|---|");
for (const r of RECALL_OUT) md.push(`| \`${r.id}\` | ${r.snapshot} | ${r.type} | ${esc(r.field)}${r.layer ? ` @${r.layer}` : ""} | ${esc(r.expect)} | ${r.hit ? "**HIT**" : "MISS"} | ${esc((r.hit ? r.matched : r.same_type_hits).join(", ") || "—")} | ${esc(r.note)} |`);
const hitN = RECALL_OUT.filter((r) => r.hit).length;
md.push("", ...RECALL_LINES(), "");
md.push(...NOTES_RECALL());
md.push(...NOTES_FP());
md.push(...NOTES_A2());
writeFileSync(P(OUT_MD), md.join("\n") + "\n");
console.log(`A1 scan: ${ALL.length} hits / ${new Set(ALL.map((h) => h.id)).size} questions; recall 非T ${RECALL_OUT.filter((r) => r.type !== "T" && r.hit).length}/${RECALL_OUT.filter((r) => r.type !== "T").length}, T.num_* ${RECALL_OUT.filter((r) => r.type === "T" && r.hit).length}/${RECALL_OUT.filter((r) => r.type === "T").length}`);
for (const [t] of TYPES) { const s = SUMMARY[t].total; if (s) console.log(`  ${t.padEnd(3)} hits ${String(s.hits).padStart(6)}  題 ${String(s.questions).padStart(5)}  (pop ${s.pop} / excl ${s.excluded} / 13ex ${s["13exam"]})`); }
console.log(`  → ${OUT_JSON}\n  → ${OUT_MD}`);

// ── 所見 (手書き。件数は走査結果から差し込む) ─────────────────────────────────
// C(pred) = 候補の部分集合の件数 { h: hits, f: (題,層,field) 数, q: 題数, pop / excl / x13: 区分別題数 }
function C(pred) {
  const rows = ALL.filter(pred);
  const qs = (sec) => new Set(rows.filter((h) => !sec || h.sector === sec).map((h) => h.id)).size;
  return { h: rows.length, f: new Set(rows.map((h) => `${h.id}|${h.layer}|${h.field}`)).size, q: qs(), pop: qs("pop"), excl: qs("excluded"), x13: qs("13exam") };
}
function fq(c) { return `${c.f} field / ${c.q} 題 (pop ${c.pop} / excluded ${c.excl} / 13exam ${c.x13})`; }
function is(t, rule, extra = () => true) { return (h) => h.type === t && (!rule || h.rule === rule) && extra(h); }
function A0_PRI(h) { return h.type === "0a" && /^(word|char|num|ins)\/prose\//.test(h.sub ?? ""); }
function C0_JP(h) { return h.type === "0c" && h.layer === "jp" && h.rule !== "0c.rare_kanji"; }
function T7_PRI(h) { return h.type === "7" && h.rule === "7.space" && ["prose", "kanji", "kata", "particle"].includes(h.sub); }
function DISP(h) { return ["jp", "zh", "en"].includes(h.layer); }

// recall は T (表) と非 T を分けて報告する。T.table (stem に表がある) は 289 題全部に当たる構造ルールなので recall の分子に入れない
function RECALL_LINES() {
  const nt = RECALL_OUT.filter((r) => r.type !== "T"), t = RECALL_OUT.filter((r) => r.type === "T");
  return [
    `- 非 T 型の recall: **${nt.filter((r) => r.hit).length} / ${nt.length}**`,
    `- T 型 (fig_stem_mismatch 17 題) を数値不一致 sub-flag (T.num_raw_clean / num_vs_fig / num_vs_tr のいずれか) で判定した recall: **${t.filter((r) => r.hit).length} / ${t.length}** (うち T.num_raw_clean だけで ${t.filter((r) => r.matched.some((m) => m.includes("T.num_raw_clean"))).length} / ${t.length}。num_vs_fig は §4 のとおり FP が大半なので、確度の高い値は後者)。`,
    `- 参考: fig_stem_mismatch 17 題のうち stem に表がある (T.table) のは ${t.filter((r) => r.has_table).length} / ${t.length} だが、T.table は表を持つ ${TABLES.length} 題すべてに当たる構造ルールなので recall には数えない`,
    "- **注意: 既知実例の多くはルール設計時に参照したので、この recall は楽観側の値である** (未知の同型に対する recall ではない)",
  ];
}
function NOTES_TOP() {
  return [
    "## 0. 要約",
    "",
    `- 候補のある題 ${new Set(ALL.map((h) => h.id)).size} / ${QUESTIONS.length}。型別の題数は §1 の各「計」行。`,
    ...RECALL_LINES().map((l) => l.replace(/^- /, "- recall — ")),
    "- 漏れの理由は §3 の後。**方式 A では原理的に見えない型** (流暢な実在語への置換・言い換え) が実例で確認された: `2026r08-q066` 煩雑→複雑、`2026r08-q041 ウ` その他理的 (本命未検出)、`2016h28h-q009` 4社←A社、`2022r04-q018 ウ` 言い換え。",
    `- A2 (源照合) の推奨対象は §5 (§5 の表は field 数、ここの括弧内の区分別は題数)。規模の目安: 0a 優先 ${fq(C(A0_PRI))}、0b ${fq(C(is("0b")))}、0c (jp 異常、rare_kanji 除く) ${fq(C(C0_JP))}、7 (散文類) ${fq(C(T7_PRI))}、2 cross ${fq(C(is("2", null, (h) => h.sub.includes("cross"))))}。`,
    "- 本走査は**候補の抽出だけ**を行う。どの候補も源画像とは照合していない。FP 所見 (§4) は sub-tag の比率と、候補抜粋の目視 (源を見ない) による印象であり、源照合の結果ではない。",
    "",
  ];
}

function NOTES_RECALL() {
  return [
    "### recall の漏れと理由",
    "",
    "- `2026r08-q032 ウ`「加エ」(正解肢): ICU は「加|エメーカー」と区切り、エ が後続の片仮名語に吸収されるので 0c.isolated_kanji に当たらない。S118 R1c (片仮名→漢字) は直後が漢字であることを要するが、ここは直後が片仮名「メ」で当たらない。同じ field は稀字「鍋」で 0c.rare_kanji に当たり zh / en が候補に入るが、これは**偶然**であり (抜粋に「加エ」を含まない)、recall には数えない。",
    "- `2026r08-q066` 煩雑→複雑: raw 自体が流暢な実在語の誤りで、zh「复杂」/ en \"complex\" も jp と整合する。字種・数字・略語のいずれも崩れていないので方式 A では原理的に見えない (D-150 §4「A 単独」の却下理由どおり)。段 3 (方式 D) でも jp が源検証済でなければ見えない型。",
    "- `2011h23tokubetsu-q069` / `q072`: stem に markdown 表が無い (表は図の中だけ。不一致の主体は崩れた本文)。T.table は stem の表しか見ないので対象外。両題とも 0a (raw↔clean) には候補がある (JSON の candidates.0a)。",
    "- `2019h31h-q053`: 〔前提〕の箇条書きで表ではない。同題は 2.nine_six (raw「59本」cross) と 7.space で拾われている。",
    "- `2026r08-q041 ウ`「その他理的」(正解肢): 「他|理」は ICU では「その他|理|的」と区切られ 1 漢字語が隣接しないので 0c.isolated_kanji に当たらない。同じ肢の「取締役|会|等」の「会等」に isolated_kanji が当たり zh / en も候補に入るが、これは**偶然**で本命は未検出 (recall には数えない)。「その他」と「理的」がどちらも実在の綴りに見える型で、方式 A では見えない。",
    "- `2016h28h-q009` 4社←A社: 「4社」は字種・数字とも正常で、jp 内の他の数字と矛盾しない (zh / en も jp に従って 4 と訳す) ので 0b でも見えない。方式 A では見えない型 (段 2 の数字源照合の射程)。",
    "- `2022r04-q018 ウ` 肢後半の言い換え: 流暢な別文で、異常字・数字差が無い。方式 A では見えない型 (U7 では machdiff が源 transcript との比較で拾った)。",
    "- 補足 `2012h24h-q005`: fig_stem_mismatch の critic は「stem_jp の売上高 4,800」と書いたが、表示層 (stem_jp_clean) は既に 4,000 で、4,800 は raw 層 (学習者不可視) にだけある (T.num_raw_clean「raw のみ {4800} / clean のみ {4000}」)。critic は raw を読んだと考えられる。表示層の是正は不要の可能性が高い (源照合で確定させる)。",
    "",
  ];
}

function NOTES_FP() {
  const a0 = C(is("0a")), a0s = C(is("0a", null, (h) => /\/struct\//.test(h.sub))), a0g = C(is("0a", null, (h) => /raw_garbled/.test(h.sub)));
  const t7 = C(is("7", "7.space")), t7x = C(is("7", "7.space", (h) => ["table", "figure"].includes(h.sub)));
  const q0 = (l) => C(is("0q", "0q.prose", (h) => h.layer === l));
  return [
    "## 4. FP の所見 (源照合なし、sub-tag 比率 + 抜粋の目視)",
    "",
    `- **0a** (${fq(a0)}): 表・図の域 (struct) が ${a0s.f} field、raw 側に崩れのある hunk を含む field が ${a0g.f}。clean 層は D-138 で源画像から再構成されているので、raw↔clean の差の**大半は clean 側の正しい修復**と見込まれる (目視例: \`2009h21a-q009\` 資任→責任、\`2019r01a-q056\` 閥げた→挙げた、\`2022r04-q007\` ます→まず)。推測補完の疑いが濃いのは raw が流暢なまま clean が別語になった hunk (sub に \`raw_fluent\`) で、例は \`2010h22a-q086\` 要求→依頼、\`2015h27h-q087\` 近づく→並ぶ、\`2016h28h-q001\` 途中→過程、\`2011h23a-q024\` 表セル 値引き→広告。どちらが源どおりかは源を見ないと決まらない。0a.num は数字を含む hunk を全部拾うので表域の数値再構成が混ざる (struct 比が高い)。`,
    `- **0b** (${fq(C(is("0b")))}): 母数が小さく精度は他型より高い印象。\`2014h26a-q045\` ア / イ の zh / en が「ISO 9091」「ISO 149661」(jp は 9001 / 14001) — 訳層の数字誤りの強い候補。その次に \`2019r01a-q047\` (16 hits / 1 題): 4 肢の zh / en が「功能1」/「Function 1」だけで jp 肢 \`[表] 機能1：開発規模(KS) 10／…\` の数字が無い。**候補であり欠陥の向きは未確定** — 三語の stem 表には数字があり、jp 選択肢側の \`[表]\` 一行化が特殊形式である可能性もある。残りは「半年→six months」型の訳し方の差や長い stem の数字で、FP が多いと見込む。値 1 は機械照合できないので除外した (取りこぼしうる)。`,
    `- **0c** (${fq(C(is("0c", null, (h) => h.layer === "jp")))} が jp 異常、その zh / en が tr_of_anomaly): isolated_kanji は OCR 起因に見えるもの (\`2009h21a-q018\` 対了表 / 凡務、\`2014h26a-q063\` 伝科、\`2014h26h-q085\` 一且) と正当な語 (次表 / 会兼 / 共創 / 人名) が混在し、目視の印象は半々。rare_kanji は大半が正当な稀字 (津波・摩擦・函館) で弱い信号 → §5 の規模からは除いた。R3 は引用符の開閉不整合 (“上半期\" 型、0q と重なる) が主。`,
    `- **0q**: ASCII \`"\` の prose 命中 field は jp ${q0("jp").f} / jp_raw ${q0("jp_raw").f} / zh ${q0("zh").f}。リテラル判定は 2024r06-q062 (jp_raw) だけ。en は英文組版の通常記号で ${C(is("0q", "0q.en")).f} field (⑨ #11 の方針事項)。jp・zh の prose 命中は字種そのものが表記規約違反なので FP は少ないが、源の字形 (“” か「」か) は源を見ないと決まらない。`,
    `- **1**: 表示層 (jp / zh / en) の見出し混入は ${fq(C(is("1", null, DISP)))}、残りは jp_raw (学習者不可視)。正規表現が厳密なので FP はほぼ無いと見込む (1.mid は〔テクノロジ〕等の節見出しの後の「問N」)。**\`2021r03-q001\` は ⑤-2 母数内 (U6 完了済) なのに jp 表示 stem の先頭に「問1」が残っており、⑤-2 の取りこぼし** (U6 は同型の q100 だけを是正)。表示層の他は \`2019h31h-q001\` zh / en (U3b は jp のみ是正)、\`2015h27a-q089\` (excluded)、\`2011h23a-q089\` (13exam、stem 途中の「問 89」)。`,
    `- **7**: 7.space ${t7.f} field のうち U4 の除外類 (表型・図の言語化) が ${t7x.f}。残りの prose / kanji / kata / particle には読点脱落と行折返しの語中空白 (「電子 メール」「最も適 切」) と箇条書きの区切り (\`2019h31h-q053\`〔前提〕) が混ざり、機械では分けられない (U4 も目視で分類した)。7.comma_nospace は ${C(is("7", "7.comma_nospace")).h} hits (選択肢だけなら 68)。U9 NIT-4 の「310 件」は数え方が記録されておらず突合できない (選択肢の「, の後に空白なし」を数字区切りも含めて数えると 390)。7.newline は 0。`,
    `- **10**: ${fq(C(is("10")))}、全て 13exam。末尾残渣 (\`2009h21a-q018\` 4 肢、\`2014h26h-q071\`「ぜい」) は目視でほぼ実欠陥。ノンブル型は現行データに 0 (U11 で是正済)。`,
    "- **2**: 9 / 6 を含む数字は §1 の表のとおり数字を含む field の 15〜45%。ends96 は「最下位桁が 9 / 6」というだけなので弱い。cross (他層に 0 化形がある) は強いが、ほぼ jp_raw / fig 層 (表示層は 0) — 表示層の訳は誤った jp から作られているので層間比較では見えない。表示層の斜線ゼロは D-150 段 2 (数字を含む field の源照合) で拾うしかない。",
    `- **T**: 表を持つ題 ${TABLES.length}。T.num_vs_fig は figure_description が要約文で数字を一部しか持たないため FP が大半。T.num_raw_clean (${C(is("T", "T.num_raw_clean")).q} 題) は raw と clean の表の数値が違う題で、どちらかが源と違う (fig_stem_mismatch の 17 題中 ${TABLES.filter((t) => FIG_MISMATCH.includes(t.id) && t.sub.includes("num_raw_clean")).length} 題がこれに当たる)。`,
    "",
  ];
}

function NOTES_A2() {
  const pick2 = (sec) => DIGIT_FIELDS[sec].jp;
  const T17 = new Set(FIG_MISMATCH), Tnum = new Set(ALL.filter(is("T", "T.num_raw_clean")).map((h) => h.id));
  const Tall = new Set([...T17, ...Tnum]);
  const by = (pred, sec) => C((h) => pred(h) && h.sector === sec).f;
  const row = (name, pred, how) => `| ${name} | ${by(pred, "pop")} | ${by(pred, "excluded")} | ${by(pred, "13exam")} | ${how} |`;
  return [
    "## 5. A2 (源照合) の推奨対象と規模",
    "",
    "数は field 数 (題 × 層 × field)。excluded / 13exam は B track (D-150 第 3 条) が jp を全量再抄写するので、jp 層の候補は**B の fixer に名指しで渡す**扱いにし、A2 では pop と訳層を先に回すことを推奨する。",
    "",
    "| 対象 | pop | excluded | 13exam | 照合のしかた |",
    "|---|---:|---:|---:|---|",
    row("0a 優先 (word / char / num / ins かつ prose)", A0_PRI, "pop: ⑤-2 で jp は源照合済 → 該当 hunk の zh / en を段 3 に回す。excluded / 13exam: B fixer に渡す"),
    row("0b 訳層の数字・略語", is("0b"), "jp を源で確認 → zh / en を是正。`2014h26a-q045` を最優先、次に `2019r01a-q047` (欠陥の向き未確定)"),
    row("0c jp 異常 (rare_kanji 除く)", C0_JP, "pop の命中は ⑤-2 の後も残る異常 → 源で確認。zh / en は jp 確定後に照合"),
    row("0q ASCII \" (jp / zh の prose)", is("0q", "0q.prose", (h) => h.layer === "jp" || h.layer === "zh"), "源で引用符の字形を確認 → 置換"),
    row("1 見出し (表示層)", is("1", null, DISP), "源照合不要 (機械削除)。pop の `2021r03-q001` jp は ⑤-2 (U6) の取りこぼし"),
    row("7 散文類 (prose / kanji / kata / particle)", T7_PRI, "源で読点の有無を確認"),
    row("7.comma_nospace", is("7", "7.comma_nospace"), "源照合不要 (house rule の空白、方針確認のみ)"),
    row("10 末尾残渣", is("10"), "源照合は軽い確認のみ (残渣の削除)"),
    row("2 cross", is("2", null, (h) => h.sub.includes("cross")), "源で数字を確認"),
    `| 2 段 2 (表示 jp の数字を含む field 全数) | ${pick2("pop")} | ${pick2("excluded")} | ${pick2("13exam")} | D-150 段 2 = pop の数字含有 field を源照合 (斜線ゼロ ends96 はこの中に含まれる) |`,
    `| T (fig_stem_mismatch 17 ∪ T.num_raw_clean) | ${[...Tall].filter((id) => sectorOf(id, id.replace(/-q\d+$/, "")) === "pop").length} 題 | ${[...Tall].filter((id) => sectorOf(id, id.replace(/-q\d+$/, "")) === "excluded").length} 題 | ${[...Tall].filter((id) => sectorOf(id, id.replace(/-q\d+$/, "")) === "13exam").length} 題 | 表セルの数値を源で照合 (題単位) |`,
    "",
    "- **推奨の順序**: (1) 0b + 1 + 10 (小さく確度が高い) → (2) pop の 0c / 7 / 0q / 2 cross / T → (3) 段 2 (pop の数字含有 field) → (4) 0a 優先の pop 分を段 3 (訳層照合) の pilot に合流。excluded / 13exam の jp 候補は B track の各 unit 起動時に fixer へ渡す。",
    "- 規模は field の重複を含む (同じ field が複数の型に当たる)。源照合の題数は型をまたいで dedupe すると上表の和より小さい。",
    "",
  ];
}
