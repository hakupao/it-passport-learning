// D-144 段 1 — 題幹/選択肢の構造化テキスト解析。実コーパスのサンプル + 全量機械検査 (規則 A の決定的部分)。
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { isSeparatorRow, parseChoice, parseChoiceWithHint, parseStemBlocks, splitRow, stemBlocksToPlain } from "../quizRichText";

const ROOT = path.resolve(__dirname, "../../../../../..");
const Q = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"), "utf-8")).questions as {
  id: string;
  exam_id: string;
  stem_jp: string;
  choices_jp: Record<string, string>;
}[];
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const TR: Record<string, { questions: Record<string, { stem_jp_clean?: string; stem: { zh: string; en: string }; choices: Record<string, { zh: string; en: string }> }> }> = {};
for (const f of readdirSync(TR_DIR).filter((x) => x.endsWith(".json"))) TR[f.replace(/\.json$/, "")] = JSON.parse(readFileSync(path.join(TR_DIR, f), "utf-8"));
const byId = new Map(Q.map((q) => [q.id, q]));
const cellsOf = (c: ReturnType<typeof parseChoice>): { key: string | null; value: string }[] => (c.kind === "pairs" ? c.cells : []);
const displayedStem = (id: string): string => TR[byId.get(id)!.exam_id]?.questions[id]?.stem_jp_clean || byId.get(id)!.stem_jp;

describe("splitRow", () => {
  it("keeps inner empty cells, drops the outer pipes", () => {
    expect(splitRow("| | A | B |")).toEqual(["", "A", "B"]);
    expect(splitRow("| 2 | 山田太郎 | 50 | 80 | |")).toEqual(["2", "山田太郎", "50", "80", ""]);
  });
});

describe("parseStemBlocks — corpus samples", () => {
  it("2021r03-q095: prose + two tables with separators, empty lines dropped around tables", () => {
    const blocks = parseStemBlocks(displayedStem("2021r03-q095"));
    const kinds = blocks.map((b) => b.kind);
    expect(kinds).toEqual(["text", "table", "text", "table"]);
    const t1 = blocks[1] as Extract<(typeof blocks)[number], { kind: "table" }>;
    expect(t1.header).toEqual(["商品コード", "商品名", "単価（円）"]);
    expect(t1.rows[2]).toEqual(["0003", "商品C", "7,000"]);
    const t2 = blocks[3] as Extract<(typeof blocks)[number], { kind: "table" }>;
    expect(t2.header).toEqual(["売上番号", "商品コード", "個数", "売上日", "配達日"]);
    expect(t2.rows.find((r) => r[0] === "Z00003")).toEqual(["Z00003", "0002", "3", "5/5", "5/18"]);
  });

  it("2016h28a-q082: spreadsheet with an empty corner header cell and trailing empty cells", () => {
    const blocks = parseStemBlocks(displayedStem("2016h28a-q082"));
    const tbl = blocks.find((b) => b.kind === "table") as Extract<(typeof blocks)[number], { kind: "table" }>;
    expect(tbl.header).toEqual(["", "A", "B", "C", "D"]);
    expect(tbl.rows[0]).toEqual(["1", "氏名", "数学", "英語", "評価"]);
    expect(tbl.rows[1]).toEqual(["2", "山田太郎", "50", "80", ""]);
    expect(tbl.rows).toHaveLength(8);
  });

  it("2026r08-q085: pseudo-code with full-width indentation and [ a ] blanks stays a single text block, verbatim", () => {
    const stem = displayedStem("2026r08-q085");
    const blocks = parseStemBlocks(stem);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.kind).toBe("text");
    expect((blocks[0] as { text: string }).text).toBe(stem);
    expect(stem).toContain("　if (num が 2　[　a　])");
  });

  it("2010h22h-q093: header-only tables (no separator row) become a table with header and zero rows", () => {
    const blocks = parseStemBlocks(displayedStem("2010h22h-q093"));
    const tables = blocks.filter((b) => b.kind === "table") as Extract<(typeof blocks)[number], { kind: "table" }>[];
    expect(tables.length).toBeGreaterThanOrEqual(2);
    expect(tables[0]?.header).toEqual(["社員番号", "社員名", "メールアドレス"]);
    expect(tables[0]?.rows).toEqual([]);
  });

  it("2019h31h-q096: ``` fenced ASCII tree becomes a code block without the fence lines", () => {
    const blocks = parseStemBlocks(displayedStem("2019h31h-q096"));
    const code = blocks.filter((b) => b.kind === "code");
    expect(code).toHaveLength(1);
    expect((code[0] as { text: string }).text).toContain("f1.html");
    expect((code[0] as { text: string }).text).not.toContain("```");
    expect(blocks.some((b) => b.kind === "text" && b.text.includes("```"))).toBe(false);
  });

  it("a pipe inside a prose line (not line-leading) is left as text", () => {
    const en = TR["2010h22a"]?.questions["2010h22a-q093"]?.stem.en ?? "";
    const blocks = parseStemBlocks(en);
    const texts = blocks.filter((b) => b.kind === "text").map((b) => (b as { text: string }).text).join("\n");
    expect(texts).toContain("Format 1: Policy | Permission category");
  });
});

describe("parseChoice — corpus samples", () => {
  it("2023r05-q037: `[表] a: X, b: Y` → pairs bound to keys", () => {
    expect(parseChoice("[表] a: 外観, b: 客観的な")).toEqual({ kind: "pairs", cells: [{ key: "a", value: "外観" }, { key: "b", value: "客観的な" }] });
    expect(cellsOf(parseChoice("[表] a: 経営, b: 被監査側の"))).toHaveLength(2);
  });
  it("2015h27a-q075 / 2015h27h-q087: keyed pairs split at key boundaries even when values contain commas or a `／` divider", () => {
    expect(cellsOf(parseChoice("[表] a: 脅威　b: OS，アプリケーションにセキュリティパッチをあてること"))).toEqual([
      { key: "a", value: "脅威" }, { key: "b", value: "OS，アプリケーションにセキュリティパッチをあてること" }]);
    expect(cellsOf(parseChoice("[表] a: 区画番号が1の場合は1を加算し，2の場合は2を加算　/　b: 奇数である"))).toEqual([
      { key: "a", value: "区画番号が1の場合は1を加算し，2の場合は2を加算" }, { key: "b", value: "奇数である" }]);
  });
  it("2019h31h-q096: a line of empty pipe cells (figure frame residue) is NOT a table", () => {
    const blocks = parseStemBlocks("前文\n        |        |\n後文");
    expect(blocks).toEqual([{ kind: "text", text: "前文\n        |        |\n後文" }]);
  });
  it("2009h21h-q061: `[表]` with labelled numbers but no keys → keyless cells", () => {
    const c = parseChoice("[表] MTBF（時間）100，MTTR（時間）150，稼働率（%）40");
    expect(c.kind).toBe("pairs");
    expect((c as { cells: { key: string | null; value: string }[] }).cells.map((x) => x.value)).toEqual(["MTBF（時間）100", "MTTR（時間）150", "稼働率（%）40"]);
  });
  it("2009h21a-q060: `[表] caption:\\n| … |` → table with caption", () => {
    const raw = byId.get("2009h21a-q060")!.choices_jp["ア"] ?? "";
    const c = parseChoice(raw);
    expect(c.kind).toBe("table");
    const t = c as Extract<typeof c, { kind: "table" }>;
    expect(t.caption).toBe("味覚符号表（行ア）");
    expect(t.header).toEqual(["", "甘味", "うま味", "塩味", "酸味", "苦味"]);
    expect(t.rows[0]?.[0]).toBe("ア");
  });
  it("2010h22a-q045 / 2010h22a-q080: keyed choices without the [表] mark are pairs too", () => {
    expect(cellsOf(parseChoice("a:オブジェクト指向 b:データ中心アプローチ c:プロセス中心アプローチ"))).toEqual([
      { key: "a", value: "オブジェクト指向" }, { key: "b", value: "データ中心アプローチ" }, { key: "c", value: "プロセス中心アプローチ" }]);
    expect(cellsOf(parseChoice("a:○ b:○ c:○"))).toHaveLength(3);
    expect(parseChoice("a:以下 b:と等しい").kind).toBe("pairs");
  });
  it("plain choices are untouched, including ones containing commas", () => {
    expect(parseChoice("リスク分析 → リスク評価 → リスク対応")).toEqual({ kind: "text", text: "リスク分析 → リスク評価 → リスク対応" });
    expect(parseChoice("a, b, c")).toEqual({ kind: "text", text: "a, b, c" });
  });
});

describe("whole-corpus invariants (all 3 languages)", () => {
  const stems: { id: string; lang: string; text: string }[] = [];
  const choices: { id: string; lang: string; letter: string; text: string }[] = [];
  for (const q of Q) {
    const tr = TR[q.exam_id]?.questions[q.id];
    stems.push({ id: q.id, lang: "jp", text: tr?.stem_jp_clean || q.stem_jp });
    if (tr?.stem.zh) stems.push({ id: q.id, lang: "zh", text: tr.stem.zh });
    if (tr?.stem.en) stems.push({ id: q.id, lang: "en", text: tr.stem.en });
    for (const [L, jp] of Object.entries(q.choices_jp)) {
      choices.push({ id: q.id, lang: "jp", letter: L, text: jp });
      if (tr?.choices[L]?.zh) choices.push({ id: q.id, lang: "zh", letter: L, text: tr.choices[L].zh });
      if (tr?.choices[L]?.en) choices.push({ id: q.id, lang: "en", letter: L, text: tr.choices[L].en });
    }
  }

  it("every stem round-trips: only whitespace, pipes, fences and true separator rows may disappear (`:` / `-` data rows must survive)", () => {
    const strip = (s: string): string => s.replace(/[\s|`]/g, "");
    const expected = (s: string): string => {
      // 区切り行は「表ブロックの 2 行目」に限って落ちる — 期待値もその規則で作る
      const out: string[] = []; const lines = s.split("\n"); let i = 0;
      while (i < lines.length) {
        if ((lines[i] ?? "").trim().startsWith("|")) { let k = 0; while (i < lines.length && (lines[i] ?? "").trim().startsWith("|")) { if (!(k === 1 && isSeparatorRow(lines[i] ?? ""))) out.push(lines[i] ?? ""); i++; k++; } }
        else out.push(lines[i++] ?? "");
      }
      return strip(out.join("\n"));
    };
    const bad = stems.filter((s) => strip(stemBlocksToPlain(parseStemBlocks(s.text))) !== expected(s.text));
    expect(bad.map((b) => `${b.id}/${b.lang}`)).toEqual([]);
  });

  it("ellipsis rows `| : | : |` and 該当なし rows `| - | - |` are data, not separators", () => {
    expect(isSeparatorRow("|---|---|")).toBe(true);
    expect(isSeparatorRow("| :--- | ---: |")).toBe(true);
    expect(isSeparatorRow("| : | : |")).toBe(false);
    expect(isSeparatorRow("| - | - |")).toBe(true); // 形は区切りだが…
    const t = parseStemBlocks("| x | y |\n|---|---|\n| - | - |\n| 1 | 2 |")[0] as { kind: "table"; header: string[]; rows: string[][] };
    expect(t.rows).toEqual([["-", "-"], ["1", "2"]]); // …2 行目以外では落とさない
    const en = TR["2016h28a"]?.questions["2016h28a-q074"]?.stem.en ?? "";
    const tbl = parseStemBlocks(en).find((b) => b.kind === "table") as { kind: "table"; rows: string[][] };
    expect(tbl.rows.filter((r) => r.every((c) => c === ":")).length).toBe(2);
  });

  it("2014h26a-q001: a table whose first row is intentionally blank is header-less (no data row promoted to <th>)", () => {
    const blocks = parseStemBlocks(displayedStem("2014h26a-q001"));
    const tbl = blocks.find((b) => b.kind === "table") as { kind: "table"; header: string[]; rows: string[][] };
    expect(tbl.header).toEqual([]);
    expect(tbl.rows[0]?.[0]).toBe("売上高");
  });

  it("every table is rectangular after parsing; header is either non-empty or absent (header-less table)", () => {
    const bad: string[] = [];
    for (const s of stems) for (const b of parseStemBlocks(s.text)) {
      if (b.kind !== "table") continue;
      const width = b.header.length || (b.rows[0]?.length ?? 0);
      if (width === 0) bad.push(`${s.id}/${s.lang}: empty table`);
      if (b.header.length > 0 && b.header.every((h) => h === "")) bad.push(`${s.id}/${s.lang}: blank header kept`);
      if (b.padded) bad.push(`${s.id}/${s.lang}: ragged (padded before output)`);
    }
    expect(bad).toEqual([]);
  });

  it("zh/en choices that are bare markdown tables (no [表] mark) and `[table]` marks are structured too", () => {
    const en = TR["2009h21a"]?.questions["2009h21a-q060"]?.choices["ア"]?.en ?? "";
    expect(parseChoice(en).kind).toBe("table");
    expect(parseChoice("[table] a: ?data*　b: ?data").kind).toBe("pairs");
    expect(parseChoice("[Table] a: X, b: Y").kind).toBe("pairs");
    // 表示に `[表]`/`[table]` が漏れない、表行が text に残らない
    const leak = choices.filter((c) => { const p = parseChoice(c.text); return p.kind === "text" && (/\[(表|表格|table)\]/i.test(p.text) || p.text.split("\n").filter((l) => l.trim().startsWith("|")).length >= 1); });
    expect(leak.map((c) => `${c.id}/${c.lang}/${c.letter}`)).toEqual([]);
  });

  it("no line-leading pipe survives inside a text block (all tables were captured)", () => {
    const bad = stems.filter((s) => parseStemBlocks(s.text).some((b) => b.kind === "text" && (/(^|\n)\s*\|[^\n]*[^\s|][^\n]*\|/.test(b.text) || b.text.includes("```"))));
    expect(bad.map((b) => `${b.id}/${b.lang}`)).toEqual([]);
  });

  it("[表] choices all classify as pairs or table, never fall back to text, and pairs are consistent across the 4 choices", () => {
    const bad: string[] = [];
    const shapes = new Map<string, Set<string>>();
    const jpOf = new Map(choices.filter((c) => c.lang === "jp").map((c) => [`${c.id}/${c.letter}`, c.text]));
    for (const c of choices) {
      const p = parseChoiceWithHint(c.text, jpOf.get(`${c.id}/${c.letter}`));
      if (/^\s*\[表\]/.test(c.text) && p.kind === "text" && !/[／/]\s*\S/.test(c.text)) bad.push(`${c.id}/${c.lang}/${c.letter}: [表] fell back to text`);
      { // 同じ (問, 字母) が三語で同じ形になること (Rule D MAJOR-4: 訳文の [table] / 裸表を見逃していた)。字母間は問によって形が違ってよい (2018h30h-q081 ウ/エ は表 2 枚)
        const k = `${c.id}/${c.letter}`;
        const set = shapes.get(k) ?? new Set<string>();
        set.add(p.kind + (p.kind === "pairs" ? `:${p.cells.length}` : p.kind === "tables" ? `:${p.tables.length}` : ""));
        shapes.set(k, set);
      }
    }
    expect(bad).toEqual([]);
    // 許容する不一致: jp が table (インライン `| … |` や結合セル表) で訳文が散文化されている型 (2010h22a-q031 など)。それ以外はゼロ。
    const mixed = [...shapes].filter(([, s]) => s.size > 1);
    const unexplained = mixed.filter(([, s]) => !(s.has("table") && s.has("text") && s.size === 2));
    expect(unexplained.map(([id, s]) => `${id}: ${[...s].join(",")}`)).toEqual([]);
    expect(mixed.length).toBeLessThanOrEqual(48); // 12 問 × 4 肢 まで (jp=table / 訳文=散文 型)
  });

  it("counts: [表] choice questions pinned at 83 (structural mark, stable); JP stems with tables >= 250 (S117 実測 258; 題幹は他 track で書き換わるので下界)", () => {
    const jpStemTables = stems.filter((s) => s.lang === "jp" && parseStemBlocks(s.text).some((b) => b.kind === "table")).length;
    const tblChoiceQs = new Set(choices.filter((c) => c.lang === "jp" && /^\s*\[表\]/.test(c.text)).map((c) => c.id)).size;
    expect(jpStemTables).toBeGreaterThanOrEqual(250);
    expect(tblChoiceQs).toBe(83);
  });

  it("2014h26a-q001 / 2026r08-q044: full-width indentation inside cells is preserved (sub-item hierarchy)", () => {
    const tbl = parseStemBlocks(displayedStem("2014h26a-q001")).find((b) => b.kind === "table") as { kind: "table"; rows: string[][] };
    expect(tbl.rows.some((r) => (r[0] ?? "").startsWith("　"))).toBe(true);
  });

  it("translations without the [表] mark inherit the jp shape when the cell count matches (2009h21h-q061, 2018h30h-q065)", () => {
    const en = parseChoiceWithHint("MTBF (hours) 100, MTTR (hours) 150, Availability (%) 40", "[表] MTBF（時間）100，MTTR（時間）150，稼働率（%）40");
    expect(en.kind).toBe("pairs"); expect(cellsOf(en).map((x) => x.value)).toEqual(["MTBF (hours) 100", "MTTR (hours) 150", "Availability (%) 40"]);
    const en2 = parseChoiceWithHint("a=Join, b=Projection, c=Selection", "[表] a=結合, b=射影, c=選択");
    expect(cellsOf(en2)).toEqual([{ key: "a", value: "Join" }, { key: "b", value: "Projection" }, { key: "c", value: "Selection" }]);
    // セル数が合わなければ text のまま (訳文が散文化)
    expect(parseChoiceWithHint("Business process model: DFD; Data model: E-R Diagram", "[表] | | 業務プロセスモデル | データモデル | | ア | DFD | E-R 図 |").kind).toBe("text");
  });
  it("inline header tables become a row of header-only tables (2017h29h-q069, 2009h21a-q100)", () => {
    const c = parseChoice("[表] 表1: 社員ID | 社員名 | 生年月日    表2: 社員ID | 試験種別 | 試験日 | 合否");
    expect(c.kind).toBe("tables");
    const tt = c as Extract<typeof c, { kind: "tables" }>;
    expect(tt.tables.map((x) => x.caption)).toEqual(["表1", "表2"]);
    expect(tt.tables[1]?.header).toEqual(["社員ID", "試験種別", "試験日", "合否"]);
    const one = parseChoice("[表] 1つの表: | 伝票番号 | 日付 | 取引先コード | 部署名 | 商品コード | 数量 | 単価 |");
    expect(one.kind).toBe("tables");
    expect(parseChoice("One table: | Slip number | Date | Business-partner code |").kind).toBe("tables");
  });
  it("grouped tables like `所有者 R:○ W:○ X:○ ／ …` are left as text (keys would scramble the labels)", () => {
    expect(parseChoice("[表] 所有者 R:○ W:○ X:○ ／ 所有者と同じグループの利用者 R:○ W:○ X:○ ／ その他の利用者 R:ー W:ー X:○").kind).toBe("text");
  });
  it("2025r07-q083: single-letter keys other than a–d (PDCA) are pairs", () => {
    const jp = byId.get("2025r07-q083")!.choices_jp["ア"] ?? "";
    expect(parseChoice(jp).kind).toBe("pairs");
  });
});
