#!/usr/bin/env node
// Stage 6 / Quiz — S118 ⑤-4: 学習者可視テキスト (題幹 + 誤答肢を含む全選択肢) に残る
// OCR 欠陥の **決定的 corpus 全量走査**。命中だけを実読 / LLM 核験に回すための絞り込み器。
//
// 位置づけ (既存器との差):
//   - `scripts/quiz-ocr-garble-scan.mjs` (S100) = 6 パターン (trailing_junk / period_comma /
//     zero_in_alpha / ascii_period_in_jp / interior_fw_space / page_marker)。本器はそれを置換せず、
//     S113〜S117 の実欠陥で **取りこぼした型** を足す: 同形字 (力↔カ・一↔ー・エ↔工)、末尾ノイズの語断片
//     (「ぜい」「垢」「MN」)、引用符/括弧の開閉対、助詞重複、選択肢間の異常 (空・重複・語尾の不揃い)、
//     そして **語中の半角空白** (行折返し由来、R8)。
//   - `scripts/quiz-fidelity-machdiff.mjs` (S117 §22b) = 源書き起こしとの機械 diff (核験 workflow 用)。
//     正規化は同義の実装を本器にも持つ (machdiff は top-level 実行 script で import 不可)。machdiff の
//     既知盲点「空白の有無」は本器の R2f (field 前後) と R8 (語中) が担当する。
//
// 校正で **落とした** ルール (S118、evidence/quiz_choice_defect_scan_S118.md に全量):
//   R2d 句読点後の英数断片 (FP 19/19: 「5,000」「トランザクション 1」「[表] … 92」)
//   R4b 仮名中の孤立英字   (FP 20/20: 数学問の変数 a / b / n / x)
//   R5a/R5b 英数字化け 0↔O・1↔I・5↔S・8↔B (FP 54/54: 単位 1G・5kg・1GHz、商品コード S001、セル参照 B2)
//     → 0↔O 類は S100 の zero_in_alpha が既に担当。1/5/8 類は corpus に残存 0。
//   R6a □/■ 置き字        (FP 242/242: ディジタル画像図・ディレクトリ図・穴埋め記号)
//   R7b 1 文字選択肢       (FP 27/27: ①③ の組合せ肢、「和」「青」「黄」等の 1 字解答)
//   捕捉できない型 (原理的): 「轟威」「角罪」「滞進的」「革積」型の**語義・字形置換**。字種も構造も
//   正常なので決定的走査では不可視 — LLM 核験 (⑤-3) 側の射程。
//
// 走査対象 = **表示層のみ**:
//   stem   = translations/<exam>.json の `stem_jp_clean` があればそれ、無ければ questions.json の `stem_jp`
//   choice = questions.json の `choices_jp[ア|イ|ウ|エ]` (clean サイドカーは存在しない = raw がそのまま表示)
//   zh / en は本 pass の射程外 (S118 §15)。
//
// Run:
//   node scripts/quiz-choice-defect-scan.mjs --all
//   node scripts/quiz-choice-defect-scan.mjs --exam 2017h29h
//   node scripts/quiz-choice-defect-scan.mjs --all --json data/ip/quiz/.phase2/choice_defect_S118.json \
//                                                  --md   data/ip/quiz/.phase2/choice_defect_S118.md
//   任意: --rule R1a,R2b (絞り込み) / --limit N (md の例示件数、既定 5)
// 出力先は gitignored なディレクトリを使うこと (`/data/ip/quiz/.phase2/` は .gitignore:70)。
// 本器はデータを一切書き換えない (読み取り専用)。

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const LETTERS = ["ア", "イ", "ウ", "エ"];

// ── 文字クラス ───────────────────────────────────────────────────────────────
const KATA = /[\u30A1-\u30FA\u30FD\u30FE]/;          // ァ-ヺ (ー U+30FC と ・ U+30FB は別扱い)
const CHOON = /[\u30FC]/;                             // ー (長音符)
const HIRA = /[\u3041-\u3096\u309D\u309E]/;
const KANJI = /[\u3400-\u4DBF\u4E00-\u9FFF]/;
const JPCH = /[\u3041-\u3096\u30A1-\u30FA\u30FC\u3400-\u4DBF\u4E00-\u9FFF\u3001\u3002]/;
const isKata = (c) => !!c && (KATA.test(c) || CHOON.test(c));
const isKanji = (c) => !!c && KANJI.test(c);
const isHira = (c) => !!c && HIRA.test(c);

// machdiff (S117 §22b) と同義の正規化。R7c の選択肢重複判定にだけ使う。
export const normStr = (s) => (s ?? "")
  .replace(/[①-⑳]/g, (c) => `(${c.charCodeAt(0) - 0x2460 + 1})`)
  .normalize("NFKC")
  .replace(/[\s\u3000]+/g, "")
  .replace(/[，、,]/g, ",").replace(/[。．]/g, ".")
  .replace(/[“”„"「」『』〝〟']/g, '"')
  .replace(/[〜～~]/g, "~").replace(/[／/]/g, "/").replace(/[－—–ー]/g, "-")
  .replace(/[（(]/g, "(").replace(/[）)]/g, ")").replace(/[：:]/g, ":").replace(/[・･]/g, "・");

const excerptAt = (s, i, len = 1) => {
  const a = Math.max(0, i - 20), b = Math.min(s.length, i + len + 20);
  return (a > 0 ? "…" : "") + s.slice(a, b).replace(/\n/g, "⏎") + (b < s.length ? "…" : "");
};

// 題幹の markdown 表 / 選択肢の [表] は体裁が特殊 (縦線・全角空白・行末の |) なので
// 末尾ノイズ系 (R2) は表を含む field では最終行が表行のとき skip する。
const lastLine = (s) => {
  const lines = String(s).split("\n").filter((l) => l.trim() !== "");
  return lines.length ? lines[lines.length - 1] : "";
};
const isTableRow = (l) => /^\s*\|/.test(l) || /\|\s*$/.test(l);
const spaceHits = (t, re) => {
  const out = []; re.lastIndex = 0; let m;
  while ((m = re.exec(t))) { const i = m.index + 1; out.push({ index: i, len: 1, excerpt: excerptAt(t, m.index, m[0].length), suggestion: "語中の半角空白" }); re.lastIndex = i + 1; }
  return out;
};
const hasTable = (s) => /(^|\n)\s*\|/.test(String(s)) || /^\s*\[表\]/.test(String(s));

// 逐語再現が要る IPA 擬似言語ブロックの開始行。表記ゆれを許容する: `[プログラム]` `〔プログラム〕`
// `［プログラム1］` `【プログラム】` に加え、OCR が閉じ括弧を化けさせた `[プログラム】〕` や、
// 題名がコード先頭と同じ行に連結された形、`〔正六角形描画プログラム〕` のような説明付き題名も拾う
// (開き括弧の後、閉じ括弧を挟まずに 10 字以内で「プログラム」が来る行)。閉じ括弧を除くのは
// `[表] プログラム：保護される／…` のような表チップ 8 件を誤ってブロック開始と見なさないため。
// ブロック開始行から field 末尾までは R8 系 (語中の半角空白) の対象外 — 「i を 1 から arrayInput の
// 要素数 まで 1 ずつ増やす」「stringOutput の末尾 に 「A」 を追加する」の空白は IPA 公式表記の
// 字句区切りであり、削ると過去問の逐語再現が壊れる (S118 ⑤-4: R8c の実 FP 9 件はすべてこの型)。
const PROG_MARK = /^\s*[\[〔［【][^\]］】〕\n]{0,10}プログラム/;
const progOffset = (s) => {
  const lines = String(s).split("\n");
  const i = lines.findIndex((l) => PROG_MARK.test(l));
  return i < 0 ? -1 : lines.slice(0, i).reduce((n, l) => n + l.length + 1, 0);
};

// ── R1 同形字 ────────────────────────────────────────────────────────────────
// 漢字 → 片仮名 (OCR が片仮名を字形の似た漢字に読み違えた型)。S117 batch3 で「力→カ」が初出。
const KANJI2KATA = { "力": "カ", "一": "ー", "二": "ニ", "口": "ロ", "工": "エ", "卜": "ト", "夕": "タ", "八": "ハ", "千": "チ", "才": "オ" };
// 片仮名 → 漢字 (逆方向)。「カ月/カ国/カ所/カ条」は正書法として正しいので除外。
const KATA2KANJI = { "カ": "力", "ニ": "二", "ロ": "口", "エ": "工", "ト": "卜", "タ": "夕", "ハ": "八", "チ": "千", "オ": "才" };
const KATA2KANJI_OK = new Set(["カ月", "カ国", "カ所", "カ条", "カ年"]);


// ── ルール定義 ───────────────────────────────────────────────────────────────
// 各ルール: {id, why, kind:"field"|"question", run}
//   field 版 run(text, ctx) → [{index, len, excerpt, suggestion?}]
//   question 版 run(fields, ctx) → [{field, excerpt, suggestion?}]
export const RULES = [
  {
    id: "R1a", kind: "field",
    why: "片仮名列の中に紛れた漢字 (力→カ / 一→ー 等)。両隣が漢字でなく少なくとも一方が片仮名のときだけ命中",
    run(t) {
      const out = [];
      for (let i = 0; i < t.length; i++) {
        const to = KANJI2KATA[t[i]]; if (!to) continue;
        const p = t[i - 1], n = t[i + 1];
        if (isKanji(p) || isKanji(n)) continue;          // 熟語 (能力 / 一覧 / 入口) は除外
        if (isHira(p) || isHira(n)) continue;            // 「一つ」「力を」等の和語は除外
        if (!isKata(p) && !isKata(n)) continue;          // 片仮名文脈でなければ不問
        out.push({ index: i, len: 1, excerpt: excerptAt(t, i), suggestion: `${t[i]}→${to}` });
      }
      return out;
    },
  },
  {
    id: "R1b", kind: "field",
    why: "長音符 ー が漢数字 一 の位置に来ている (「ーつ」「ー方」型)。前が仮名でなく後ろが仮名/漢字のときだけ",
    run(t) {
      const out = [];
      for (let i = 0; i < t.length; i++) {
        if (!CHOON.test(t[i])) continue;
        const p = t[i - 1], n = t[i + 1];
        if (isKata(p) || isHira(p)) continue;            // 正当な長音 (サーバー / あー)
        if (!(isHira(n) || isKanji(n))) continue;        // 後ろが数字・記号なら範囲 (30ー40) の可能性
        out.push({ index: i, len: 1, excerpt: excerptAt(t, i), suggestion: "ー→一 の可能性" });
      }
      return out;
    },
  },
  {
    id: "R1c", kind: "field",
    why: "漢字の位置に来た片仮名 (ロ座→口座 / ニ重→二重 型)。直後が漢字・直前が片仮名でないときだけ、カ月等は除外",
    run(t) {
      const out = [];
      for (let i = 0; i < t.length; i++) {
        const to = KATA2KANJI[t[i]]; if (!to) continue;
        const p = t[i - 1], n = t[i + 1];
        if (!isKanji(n)) continue;
        if (isKata(p) || CHOON.test(p ?? "")) continue;  // 片仮名語の一部
        if (/[ァ-ヺー][ 　]$/.test(t.slice(Math.max(0, i - 2), i))) continue; // 「テス ト結果」= R8a の行折返し空白 (同形字ではない)
        if (KATA2KANJI_OK.has(t.slice(i, i + 2))) continue;
        out.push({ index: i, len: 1, excerpt: excerptAt(t, i), suggestion: `${t[i]}→${to}` });
      }
      return out;
    },
  },
  {
    id: "R2a", kind: "field", tail: true,
    why: "末尾の長音符/ハイフン残り (「ーー」「-」)。直前が片仮名なら正当な長音として除外",
    run(t) {
      const m = t.match(/([\u30FC\-‐‑–—−ｰ]+)[\s\u3000]*$/); if (!m) return [];
      const i = m.index, p = t[i - 1];
      if (m[1].length === 1 && isKata(p)) return [];     // 「コンピュータ」型の正当な語末長音
      if (m[1].length === 1 && /[:：|｜／\/]/.test(p ?? "")) return []; // 「X:ー」= 不可を表す表記
      return [{ index: i, len: m[1].length, excerpt: excerptAt(t, i, m[1].length), suggestion: "末尾の長音/ハイフン残渣" }];
    },
  },
  {
    id: "R2b", kind: "field", tail: true,
    why: "文末の 。 の後ろに 1〜6 字の断片が残っている (「する。ぜい」「増える。ー. 超過」型)",
    run(t) {
      const m = t.match(/。([^」』）\)】〕。\n]{1,6})[\s\u3000]*$/); if (!m) return [];
      return [{ index: m.index, len: m[0].length, excerpt: excerptAt(t, m.index, m[0].length), suggestion: `末尾断片「${m[1]}」` }];
    },
  },
  {
    id: "R2c", kind: "field", tail: true,
    why: "和文の直後に来る末尾の半角ピリオド (源は 。)",
    run(t) {
      const m = t.match(/([\u3041-\u3096\u30A1-\u30FA\u30FC\u3400-\u9FFF])\.[\s\u3000]*$/); if (!m) return [];
      const i = m.index + 1;
      return [{ index: i, len: 1, excerpt: excerptAt(t, i), suggestion: ". → 。" }];
    },
  },
  {
    id: "R2e", kind: "field", tail: true,
    why: "末尾の記号ノイズ (半角縦線・中黒・句読点の連続)。閉じ括弧と全角縦線 ｜ は正当用法が支配的なので対象外",
    run(t) {
      const m = t.match(/([|・]+|[。、，,](?:[\s\u3000]*[。、，,])+)[\s\u3000]*$/); if (!m) return [];
      return [{ index: m.index, len: m[1].length, excerpt: excerptAt(t, m.index, m[1].length), suggestion: "末尾の記号ノイズ" }];
    },
  },
  {
    id: "R2f", kind: "field",
    why: "field 前後の余分な空白 (machdiff の既知盲点。表示層では字下げとして見える)",
    run(t) {
      const out = [];
      if (/^[\s\u3000]+/.test(t)) out.push({ index: 0, len: 1, excerpt: excerptAt(t, 0), suggestion: "先頭の空白" });
      if (/[\s\u3000]+$/.test(t)) { const i = t.length - 1; out.push({ index: i, len: 1, excerpt: excerptAt(t, i), suggestion: "末尾の空白" }); }
      return out;
    },
  },
  {
    id: "R3", kind: "field",
    why: "括弧・引用符の開閉数が合わない (S117 2017h29h-q034 の “強み”\", \"弱み\" 型)",
    run(t) {
      const PAIRS = [["「", "」"], ["『", "』"], ["（", "）"], ["(", ")"], ["［", "］"], ["〔", "〕"], ["【", "】"], ["〈", "〉"], ["《", "》"], ["“", "”"]];
      const out = [];
      // 「注1)」「注2)」= 脚注記号 (開き括弧を伴わない正当形) は ASCII 括弧の計数から除く
      const base = t.replace(/注\s*\d+\)/g, "");
      const count = (ch) => (ch === "(" || ch === ")" ? base : t).split(ch).length - 1;
      for (const [o, c] of PAIRS) {
        const a = count(o), b = count(c);
        if (a === b) continue;
        const i = t.indexOf(a > b ? o : c);
        out.push({ index: Math.max(0, i), len: 1, excerpt: excerptAt(t, Math.max(0, i)), suggestion: `${o}${c} が ${a}/${b}` });
      }
      const dq = count('"'); if (dq % 2 === 1) { const i = t.indexOf('"'); out.push({ index: i, len: 1, excerpt: excerptAt(t, i), suggestion: `" が奇数 (${dq})` }); }
      return out;
    },
  },
  {
    id: "R4a", kind: "field",
    why: "一つの英数字トークン内で全角と半角が混在 (「１0」「TCP/ＩP」型)",
    run(t) {
      const out = [];
      const re = /[A-Za-z0-9\uFF21-\uFF3A\uFF41-\uFF5A\uFF10-\uFF19]{2,}/g;
      let m;
      while ((m = re.exec(t))) {
        const tok = m[0];
        const half = /[A-Za-z0-9]/.test(tok), full = /[\uFF21-\uFF3A\uFF41-\uFF5A\uFF10-\uFF19]/.test(tok);
        if (half && full) out.push({ index: m.index, len: tok.length, excerpt: excerptAt(t, m.index, tok.length), suggestion: `全半角混在「${tok}」` });
      }
      return out;
    },
  },
  {
    id: "R6b", kind: "field",
    why: "助詞の重複 (のの / をを / にに / がが)。「ものの」等の正当形は除外",
    run(t) {
      const out = []; const re = /(のの|をを|にに|がが)/g; let m;
      while ((m = re.exec(t))) {
        const p = t[m.index - 1];
        if (m[1] === "のの" && (p === "も" || p === "そ")) continue;   // ものの / そのの
        if (t.slice(m.index, m.index + 3) === "ののぞ") continue;      // 「〜の + のぞき見」
        out.push({ index: m.index, len: 2, excerpt: excerptAt(t, m.index, 2), suggestion: `助詞重複「${m[1]}」` });
      }
      return out;
    },
  },
  {
    id: "R6c", kind: "field",
    why: "「ーつ」残渣 (S117 で corpus 横断 60 箇所是正済。0 件であることが回帰確認)",
    run(t) {
      const out = []; const re = /ーつ/g; let m;
      while ((m = re.exec(t))) out.push({ index: m.index, len: 2, excerpt: excerptAt(t, m.index, 2), suggestion: "ーつ→一つ" });
      return out;
    },
  },
  {
    id: "R6d", kind: "field",
    why: "和文句読点の連続 (，， / 。。 / 、、)。半角「..」は相対パス表記で正当なので対象外",
    run(t) {
      const out = []; const re = /(，，|。。|、、)/g; let m;
      while ((m = re.exec(t))) out.push({ index: m.index, len: 2, excerpt: excerptAt(t, m.index, 2), suggestion: `重複句読点「${m[1]}」` });
      return out;
    },
  },
  {
    id: "R7a", kind: "question",
    why: "選択肢が空 / 空白のみ",
    run(fields) {
      return LETTERS.filter((L) => !String(fields[`choice.${L}`] ?? "").trim())
        .map((L) => ({ field: `choice.${L}`, excerpt: "(空)", suggestion: "選択肢が空" }));
    },
  },
  {
    id: "R7c", kind: "question",
    why: "同じ設問内で 2 つの選択肢が正規化後に同一 (OCR による取り違え / 複製)",
    run(fields) {
      const out = []; const seen = new Map();
      for (const L of LETTERS) {
        const v = normStr(fields[`choice.${L}`] ?? ""); if (!v) continue;
        if (seen.has(v)) out.push({ field: `choice.${L}`, excerpt: String(fields[`choice.${L}`]).slice(0, 60), suggestion: `${seen.get(v)} と同一` });
        else seen.set(v, L);
      }
      return out;
    },
  },
  {
    id: "R7d", kind: "question",
    why: "1 つの選択肢だけが助詞 (の/を/に/が/は/で/と) で終わる = 途中で切れている疑い",
    run(fields) {
      const tails = LETTERS.map((L) => {
        const v = String(fields[`choice.${L}`] ?? "").replace(/[\s\u3000]+$/, "");
        // 「〜もの」「〜こと」等は助詞ではなく名詞語尾 → 除外
        return { L, v, particle: /[のをにがはでと]$/.test(v) && !/(もの|こと|ひと|もと|ごと|あと|そと|ほと|まと)$/.test(v) };
      });
      const bad = tails.filter((t) => t.particle);
      if (bad.length !== 1) return [];
      return [{ field: `choice.${bad[0].L}`, excerpt: `…${bad[0].v.slice(-24)}`, suggestion: "語尾が助詞 (他 3 肢は非助詞)" }];
    },
  },
  {
    id: "R8a", kind: "field", noTable: true, noProgram: true,
    why: "片仮名語の途中に入った半角空白 (「テス ト」「シリアルイ ンタフェース」= 行折返し由来)。machdiff の既知盲点",
    run(t) { return spaceHits(t, /[ァ-ヺー][ ]+[ァ-ヺー]/g); },
  },
  {
    id: "R8b", kind: "field", noTable: true, noProgram: true,
    why: "漢語の途中に入った半角空白 (「電子商 取引」「検索条 件」)。全角空白は版面上の正当な区切りなので対象外",
    run(t) { return spaceHits(t, /[㐀-鿿][ ]+[㐀-鿿]/g); },
  },
  {
    id: "R8c", kind: "field", noTable: true, noProgram: true,
    why: "仮名文の途中に入った半角空白 (「適切なもの はどれか」「作業とし て」)。件数が最大の類型",
    run(t) { return spaceHits(t, /(?:[ぁ-ゖ][ ]+[ぁ-ゖ㐀-鿿]|[㐀-鿿][ ]+[ぁ-ゖ])/g); },
  },
];

// ── 走査 ─────────────────────────────────────────────────────────────────────
export function buildFields(q, clean) {
  const fields = { stem: (typeof clean === "string" && clean) || q.stem_jp || "" };
  for (const L of LETTERS) fields[`choice.${L}`] = q.choices_jp?.[L] ?? "";
  return fields;
}

/** 1 設問分の全 field を全ルールに掛ける。 */
export function scanQuestion(id, fields, { rules = RULES } = {}) {
  const hits = [];
  for (const rule of rules) {
    if (rule.kind === "question") {
      for (const h of rule.run(fields)) hits.push({ id, field: h.field, rule: rule.id, excerpt: h.excerpt, suggestion: h.suggestion });
      continue;
    }
    for (const [field, text] of Object.entries(fields)) {
      const t = String(text ?? ""); if (!t) continue;
      if (rule.tail && hasTable(t) && isTableRow(lastLine(t))) continue; // 表の最終行は末尾規則の対象外
      if (rule.noTable && hasTable(t)) continue;                          // 表は列揃えの空白があるので対象外
      let rhits = rule.run(t, { field });
      if (rule.noProgram) {                                                // 擬似言語ブロック以降は逐語再現域
        const off = progOffset(t);
        if (off >= 0) rhits = rhits.filter((h) => h.index < off);
      }
      for (const h of rhits) hits.push({ id, field, rule: rule.id, excerpt: h.excerpt, suggestion: h.suggestion });
    }
  }
  return hits;
}

function loadCorpus(examFilter) {
  const all = JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions;
  const qs = all.filter((q) => !examFilter || q.exam_id === examFilter);
  const trCache = new Map();
  return qs.map((q) => {
    if (!trCache.has(q.exam_id)) {
      const f = path.join(TR_DIR, `${q.exam_id}.json`);
      trCache.set(q.exam_id, existsSync(f) ? JSON.parse(readFileSync(f, "utf-8")).questions ?? {} : {});
    }
    const t = trCache.get(q.exam_id)[q.id];
    return { q, fields: buildFields(q, t?.stem_jp_clean) };
  });
}

function toMarkdown(report, limit) {
  const L = [];
  L.push(`# quiz choice-defect scan — S118 ⑤-4`, "");
  L.push(`- generated_at: ${report.generated_at}`);
  L.push(`- scope: ${report.scope} / 設問 ${report.scanned_questions} 問 / field ${report.scanned_fields}`);
  L.push(`- 命中 ${report.total_hits} 件 / 相異なる設問 ${report.distinct_questions} 問 / 相異なる field ${report.distinct_fields}`, "");
  L.push(`## ルール別`, "", `| rule | hits | 設問 | 説明 |`, `|---|---:|---:|---|`);
  for (const r of report.rules) L.push(`| ${r.id} | ${r.hits} | ${r.questions} | ${r.why} |`);
  L.push("", `## 試験回別`, "", `| exam | hits | 設問 |`, `|---|---:|---:|`);
  for (const e of report.exams) L.push(`| ${e.exam_id} | ${e.hits} | ${e.questions} |`);
  L.push("", `## 例 (ルールごと先頭 ${limit} 件)`, "");
  for (const r of report.rules) {
    if (!r.hits) continue;
    L.push(`### ${r.id} — ${r.why}`, "");
    for (const h of report.hits.filter((h) => h.rule === r.id).slice(0, limit)) {
      L.push(`- \`${h.id}\` **${h.field}** — ${h.suggestion ?? ""}  \`${h.excerpt.replace(/`/g, "\\`")}\``);
    }
    L.push("");
  }
  return L.join("\n") + "\n";
}

function main(argv) {
  const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  const exam = arg("--exam");
  const all = argv.includes("--all");
  if (!exam && !all) { console.error("usage: quiz-choice-defect-scan.mjs (--all | --exam <exam_id>) [--json out] [--md out] [--rule R1a,R2b] [--limit 5]"); process.exit(2); }
  const only = arg("--rule")?.split(",").map((s) => s.trim()).filter(Boolean);
  const limit = Number(arg("--limit") ?? 5);
  const rules = only ? RULES.filter((r) => only.includes(r.id)) : RULES;
  if (only && rules.length !== only.length) { console.error(`unknown rule id in ${only.join(",")}`); process.exit(2); }

  const corpus = loadCorpus(exam);
  if (!corpus.length) { console.error(`no questions for exam ${exam}`); process.exit(2); }

  const hits = [];
  for (const { q, fields } of corpus) hits.push(...scanQuestion(q.id, fields, { rules }).map((h) => ({ ...h, exam_id: q.exam_id })));

  const cnt = (arr, k) => arr.reduce((m, h) => ((m[h[k]] = (m[h[k]] ?? 0) + 1), m), {});
  const qOf = (pred) => new Set(hits.filter(pred).map((h) => h.id)).size;
  const report = {
    generated_at: new Date().toISOString(),
    scope: exam ?? "all",
    scanned_questions: corpus.length,
    scanned_fields: corpus.length * (1 + LETTERS.length),
    total_hits: hits.length,
    distinct_questions: new Set(hits.map((h) => h.id)).size,
    distinct_fields: new Set(hits.map((h) => `${h.id}|${h.field}`)).size,
    rules: rules.map((r) => ({ id: r.id, why: r.why, hits: hits.filter((h) => h.rule === r.id).length, questions: qOf((h) => h.rule === r.id) })),
    exams: Object.entries(cnt(hits, "exam_id")).sort().map(([exam_id, n]) => ({ exam_id, hits: n, questions: qOf((h) => h.exam_id === exam_id) })),
    hits,
  };

  const jsonOut = arg("--json"), mdOut = arg("--md");
  for (const [p, body] of [[jsonOut, JSON.stringify(report, null, 2) + "\n"], [mdOut, toMarkdown(report, limit)]]) {
    if (!p) continue;
    const abs = path.isAbsolute(p) ? p : path.join(ROOT, p);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, body);
    console.log(`  → ${path.relative(ROOT, abs)}`);
  }
  console.log(`choice-defect scan [${report.scope}]: ${report.total_hits} hits / ${report.distinct_questions} questions / ${corpus.length} scanned`);
  for (const r of report.rules) if (r.hits) console.log(`  ${r.id.padEnd(4)} ${String(r.hits).padStart(5)}  (${r.questions} 問)  ${r.why.slice(0, 48)}`);
  if (!jsonOut && !mdOut) for (const h of hits.slice(0, 25)) console.log(`    ${h.id} ${h.field} [${h.rule}] ${h.suggestion ?? ""} ${h.excerpt}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
