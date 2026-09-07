// Stage 6 / Quiz — D-144 段 1 (S117): 題幹・選択肢の「構造化テキスト」を表示用ブロックに分解する純関数。
//
// 背景: Phase 1.5 以降、図表を含む題幹は markdown 表 (`| a | b |` 行 + 任意の `|---|` 区切り) として、
// 選択肢の表は `[表] ` 接頭で格納されている (S117 実測: 題幹 190 問 / 選択肢 83 問、三語とも同形)。
// `QuizSet.tsx` はこれを `<p>` に生出力していたため、学習者には縦線テキストが見えていた。
//
// 方針: Markdown 汎用パーサは使わない。題幹には擬似言語の全角インデント・`[ a ]` 空欄・丸数字が含まれ、
// Markdown として解釈すると崩れる。ここでは「行頭が `|` の連続行 = 表」だけを構造化し、他は原文のまま
// (white-space: pre-wrap) 返す。決定的で、コーパスの全 2900×3 言語に対して機械検査できる (quizRichText.test.ts)。

export type StemBlock =
  | { kind: "text"; text: string }
  /** ``` で囲まれた等幅ブロック (ASCII 木構造など、9 問)。囲みは落とし中身だけ。 */
  | { kind: "code"; text: string }
  /** header=[] は見出し無しの表 (源表に列名が無い)。padded=true は行のセル数が揃わず空セルで埋めた (現コーパスでは 0)。 */
  | { kind: "table"; header: string[]; rows: string[][]; padded?: boolean };

export type ChoiceContent =
  | { kind: "text"; text: string }
  /** `[表] a: X, b: Y` (組合せ問) — キー→値。キーの無いセルは key=null (例: `MTBF（時間）100`)。 */
  | { kind: "pairs"; cells: { key: string | null; value: string }[] }
  /** `[表] caption:\n| … |` — 表そのもの。caption は無いこともある。 */
  | { kind: "table"; caption: string | null; header: string[]; rows: string[][]; padded?: boolean }
  /** 1 行に複数の見出し表が埋まっている型 `表1: 社員ID | 社員名    表2: 社員ID | 試験日` (2017h29h-q069) → 見出しだけの表の並び */
  | { kind: "tables"; tables: { caption: string | null; header: string[] }[] };

const TABLE_MARK = /^\[(?:表|表格|table)\]\s*/i; // jp `[表]`、zh `[表格]`、en `[table]`
/** markdown の区切り行: 各セルが `---` / `:--` / `--:` / `:-:` (必ず `-` を含む)。`| : | : |` (省略行) や `| - | - |` 以外の空行は区切りではない。 */
export const isSeparatorRow = (line: string): boolean => {
  const cells = splitRow(line);
  return cells.length > 0 && cells.every((c) => c === "" || /^:?-+:?$/.test(c)) && cells.some((c) => c !== "");
};

const isTableLine = (line: string): boolean => line.trim().startsWith("|");

/** ASCII 空白だけを刈る。全角空白 (U+3000) はセル内インデント (「　変動費」= 費用の内訳、2014h26a-q001 / 2026r08-q044) なので保持。 */
const trimAscii = (c: string): string => c.replace(/^[ \t\r]+|[ \t\r]+$/g, "");
/** `| a | b |` → ["a","b"]。先頭・末尾の空セル (縦線の外側) は落とし、内側の空セルは保持する。 */
export function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map(trimAscii);
}

/**
 * 区切り行は **2 行目にある場合だけ** 区切りとして扱う (1 行目 = 見出し)。それ以外の位置の `| - | - |` は
 * データ行 (「該当なし」)。見出し行が全セル空 (`| | |`、列名の無い表: 2014h26a-q001) なら header=[] の見出し無し表。
 */
function buildTable(lines: string[]): { header: string[]; rows: string[][]; padded?: boolean } {
  const rowsIn = lines.filter((l, i) => !(i === 1 && isSeparatorRow(l))).map(splitRow);
  if (rowsIn.length === 0) return { header: [], rows: [] };
  const width = Math.max(...rowsIn.map((r) => r.length));
  const wasPadded = rowsIn.some((r) => r.length !== width);
  const pad = (r: string[]): string[] => (r.length === width ? r : [...r, ...Array(width - r.length).fill("")]);
  const padded = rowsIn.map(pad);
  const first = padded[0] ?? [];
  const out = first.every((c) => c.trim() === "") && padded.length > 1 ? { header: [], rows: padded.slice(1) } : { header: first, rows: padded.slice(1) };
  return wasPadded ? { ...out, padded: true } : out;
}

/**
 * 題幹を text / table ブロックの列に分解する。行頭 `|` の連続行が 1 つの表。
 * 表の前後の空行は捨てる (表自身がブロック区切り)。text ブロックは原文の改行を保持する。
 */
export function parseStemBlocks(stem: string): StemBlock[] {
  const lines = stem.split("\n");
  const blocks: StemBlock[] = [];
  let text: string[] = [];
  const flushText = (): void => {
    // 先頭・末尾の空行だけ落とす (内側の空行は段落として残す)
    while (text.length && (text[0] ?? "").trim() === "") text.shift();
    while (text.length && (text[text.length - 1] ?? "").trim() === "") text.pop();
    if (text.length) blocks.push({ kind: "text", text: text.join("\n") });
    text = [];
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (/^\s*```/.test(line)) {
      flushText();
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i] ?? "")) code.push(lines[i++] ?? "");
      i++; // 閉じ ``` (無ければ末尾まで)
      blocks.push({ kind: "code", text: code.join("\n") });
    } else if (isTableLine(line)) {
      const tbl: string[] = [];
      while (i < lines.length && isTableLine(lines[i] ?? "")) tbl.push(lines[i++] ?? "");
      const built = buildTable(tbl);
      // 全セル空 (例: 図の枠線だけが `|        |` として残ったもの、2019h31h-q096) は表ではなく原文のまま残す
      if (built.header.every((h) => h.trim() === "") && built.rows.every((r) => r.every((c) => c.trim() === ""))) text.push(...tbl); // 図枠残渣 (2019h31h-q096 の `|        |`)
      else { flushText(); blocks.push({ kind: "table", ...built }); }
    } else {
      text.push(line);
      i++;
    }
  }
  flushText();
  return blocks;
}

/** `a: 外観` / `a：外観` / `a=結合` → {key:"a", value:"外観"}; それ以外は key=null。 */
function splitCell(cell: string): { key: string | null; value: string } {
  const m = cell.match(/^([A-Za-zａ-ｚＡ-Ｚ0-9０-９]{1,3})\s*[:：=＝]\s*(.*)$/);
  return m && m[1] !== undefined ? { key: m[1], value: (m[2] ?? "").trim() } : { key: null, value: cell.trim() };
}

/**
 * 選択肢テキストを分類する。`[表]` 接頭が無ければ text (改行を含んでいても text)。
 * `[表]` 接頭あり: 行頭 `|` の行があれば table (最初の非表行を caption)、なければ `，`/`, ` 区切りの pairs。
 */
const KEY_AT_SRC = "(^|[\\s　，、,/／|])([A-Za-zａ-ｚＡ-Ｚ0-9０-９]{1,3})\\s*[:：=＝]";
const countKeys = (s: string): number => (s.match(new RegExp(KEY_AT_SRC, "g")) ?? []).length;
/** `[表]` 無しでも `a:○ b:○ c:○` / `P：(1)，D：(2)` のように **1 文字キー**で始まりキーが 2 つ以上あれば組合せ問 (46+ 問)。
 *  キーを 1 文字に絞るのは "IP: …" "No: …" のような略語で始まる散文肢を誤検出しないため。 */
const isBareKeyed = (s: string): boolean => /^\s*[A-Za-zａ-ｚＡ-Ｚ]\s*[:：=＝]/.test(s) && countKeys(s) >= 2;

/** `[表]` 本文 (または訳文) を pairs に分解する。ラベル付きの複数グループ (`所有者 R:○ W:○ ／ その他 R:ー …`) は
 *  キー分割で崩れるので null (= text のまま) を返す。 */
function parsePairsBody(body: string): { key: string | null; value: string }[] | null {
  const KEY_AT = new RegExp(KEY_AT_SRC, "g");
  const starts: number[] = [];
  for (let m = KEY_AT.exec(body); m; m = KEY_AT.exec(body)) starts.push(m.index + (m[1] ?? "").length);
  let segments: string[];
  if (starts.length >= 2) {
    if (body.slice(0, starts[0]).trim() !== "") return null; // キー前にラベルがある (グループ表)
    segments = starts.map((st, k) => body.slice(st, starts[k + 1] ?? body.length).replace(/[\s　，、,/／|]+$/, ""));
    if (segments.some((seg) => /(^|\s)[／/]\s*\S/.test(seg))) return null; // 空白で囲まれた区切り + 続きの語 (グループ表)。`entry/exit` は値
  } else segments = body.split(/，|、|,\s+/);
  const cells = segments.map((c) => c.trim()).filter((c) => c !== "").map(splitCell);
  return cells.length ? cells : null;
}

export function parseChoice(raw: string): ChoiceContent {
  const text = raw.replace(/｜/g, "|"); // 全角縦線 (2018h30h-q081 jp) を半角に揃える
  const lines0 = text.split("\n");
  const hasTableLines = lines0.filter(isTableLine).length >= 1 && lines0.some((l) => isTableLine(l) && splitRow(l).some((c) => c !== ""));
  const hasInlinePipes = lines0.length === 1 && (text.split("|").length >= 3); // `One table: | A | B |` 型
  // 訳文 (zh/en) は `[表]` 接頭を持たないまま表行だけを持つことがある (10 問 / 80 肢) → 表行があれば接頭に依らず表として扱う
  if (!TABLE_MARK.test(text.trimStart()) && !isBareKeyed(text) && !hasTableLines && !hasInlinePipes) return { kind: "text", text };
  const body = text.trimStart().replace(TABLE_MARK, "");
  // インライン見出し表: `1つの表: | 伝票番号 | 日付 | … |` (2009h21a-q100) / `表1: 社員ID | 社員名    表2: 社員ID | 試験日` (2017h29h-q069)。
  // 行頭 `|` の行が無く、`|` を含む 1 行だけの本文 → 2 個以上の空白 (または全角空白) でグループに割り、各グループを「caption: セル | セル」と読む。
  if (!body.includes("\n") && body.includes("|") && !isTableLine(body)) {
    const groups = body.split(/\s{2,}|　+/).map((g) => g.trim()).filter(Boolean);
    const parsed = groups.map((g) => {
      // 「caption: セル | セル」— caption はコロンの前 (無ければ全体が表)
      const m = g.match(/^([^|]*?)[:：]\s*(.*\|.*)$/);
      const cap = m ? (m[1] ?? "").trim() : "";
      const tablePart = m ? (m[2] ?? "") : g;
      const header = splitRow(tablePart).filter((c) => c !== "");
      return header.length >= 2 ? { caption: cap || null, header } : null;
    });
    if (parsed.length && parsed.every((x) => x !== null)) return { kind: "tables", tables: parsed as { caption: string | null; header: string[] }[] };
  }
  const lines = body.split("\n");
  if (lines.some(isTableLine)) {
    const captionLines = lines.filter((l) => !isTableLine(l) && l.trim() !== "");
    const caption = captionLines.length ? captionLines.join(" ").replace(/[:：]\s*$/, "").trim() : null;
    return { kind: "table", caption: caption || null, ...buildTable(lines.filter(isTableLine)) };
  }
  // キー付き (`a: … b: …`) は **キー境界**で切る。値の中に「，」が入る (2015h27a-q075 `b: OS，アプリケーション…`) ため
  // 区切り文字では切れない。キーが 2 つ未満なら「，」「、」「, 」で切る (2009h21h-q061 `MTBF（時間）100，MTTR…`)。
  const cells = parsePairsBody(body);
  if (!cells) return { kind: "text", text: body }; // `[表]` 接頭は表示に漏らさない (Rule D MAJOR-4)
  return { kind: "pairs", cells };
}

/**
 * 訳文 (zh/en) は `[表]` 接頭を持たないことが多い (jp 332 / zh 6 / en 0)。jp 側の形をヒントにして、
 * 訳文を同じ分割規則で切ったとき **セル数が一致する場合だけ** pairs にする (一致しなければ text のまま)。
 */
export function parseChoiceWithHint(text: string, jpText: string | undefined): ChoiceContent {
  const own = parseChoice(text);
  if (own.kind !== "text" || jpText === undefined || jpText === text) return own;
  const hint = parseChoice(jpText);
  if (hint.kind !== "pairs") return own;
  const cells = parsePairsBody(text.trimStart().replace(TABLE_MARK, ""));
  return cells && cells.length === hint.cells.length ? { kind: "pairs", cells } : own;
}

/** 表示検査用: ブロック列から元テキストの非空白文字列を復元できるか (情報欠落ゼロの機械検査に使う)。 */
export function stemBlocksToPlain(blocks: StemBlock[]): string {
  return blocks
    .map((b) => (b.kind === "table" ? [b.header, ...b.rows].map((r) => r.join(" ")).join("\n") : b.text))
    .join("\n");
}
