// Stage 6 / Quiz — D-144 段 1 (S117): 題幹・選択肢の構造化テキストを描画する。
//
// `parseStemBlocks` / `parseChoice` (純関数、全量テスト済) の出力をそのまま DOM に写す薄い層。
// text ブロックは従来どおり white-space: pre-wrap (擬似言語のインデント・改行を保持)。
// table は <table> に、`[表] a: X, b: Y` は <dl> 風の 2 列に。データは一切変換しない。

import { parseChoiceWithHint, parseStemBlocks } from "@/lib/quiz/quizRichText";

import styles from "./quiz.module.css";

function DataTable({
  header,
  rows,
  caption,
}: {
  header: string[];
  rows: string[][];
  caption?: string | null;
}): React.ReactElement {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.dataTable}>
        {caption ? <caption className={styles.tableCaption}>{caption}</caption> : null}
        {header.length > 0 ? (
          <thead>
            <tr>
              {header.map((h, i) => (
                <th key={i} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        {rows.length > 0 ? (
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : null}
      </table>
    </div>
  );
}

/** Stem: prose paragraphs (pre-wrap) interleaved with real tables. */
export function StemBlocks({ stem }: { stem: string }): React.ReactElement {
  const blocks = parseStemBlocks(stem);
  return (
    <div className={styles.qStemBlocks}>
      {blocks.map((b, i) =>
        b.kind === "text" ? (
          <p key={i} className={styles.qStem}>
            {b.text}
          </p>
        ) : b.kind === "code" ? (
          <pre key={i} className={styles.qCode}>
            {b.text}
          </pre>
        ) : (
          <DataTable key={i} header={b.header} rows={b.rows} />
        ),
      )}
    </div>
  );
}

/** One choice's body: plain text, a key→value strip (組合せ問), or a small table. */
export function ChoiceBody({ text, jpText }: { text: string; jpText?: string }): React.ReactElement {
  const c = parseChoiceWithHint(text, jpText);
  if (c.kind === "text") return <span>{c.text}</span>; // 従来どおり (pre-wrap は付けない: OCR 由来の連続空白を可視化しないため、Rule D MINOR-3)
  if (c.kind === "pairs") {
    return (
      <span className={styles.pairs}>
        {c.cells.map((cell, i) => (
          <span key={i} className={styles.pair}>
            {cell.key ? <span className={styles.pairKey}>{cell.key}</span> : null}
            <span className={styles.pairValue}>{cell.value}</span>
          </span>
        ))}
      </span>
    );
  }
  if (c.kind === "tables") {
    return (
      <span className={styles.tablesRow}>
        {c.tables.map((t, i) => (
          <DataTable key={i} header={t.header} rows={[]} caption={t.caption} />
        ))}
      </span>
    );
  }
  return <DataTable header={c.header} rows={c.rows} caption={c.caption} />;
}
