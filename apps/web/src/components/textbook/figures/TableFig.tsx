// Stage 7 Phase 3 (D-196 §0-11) — `table` (static): header row + rows; the first cell of a row is
// its row header; `key` rows (the point of the table) carry the tint fill.

import { figErrors } from "@/lib/textbook/figureSpec";
import type { FigSpec } from "@/lib/textbook/types";

import styles from "./figures.module.css";
import { pick3 } from "./pick";

interface Props {
  fig: Extract<FigSpec, { kind: "table" }>;
  locale: string;
}

export function TableFig({ fig, locale }: Props): React.ReactElement | null {
  if (figErrors(fig).length > 0) return null;
  const { cols, rows } = fig.data;
  return (
    <figure data-part="fig" data-fig="table" className={styles.fig}>
      <table className={styles.table}>
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} scope="col">
                {pick3(c, locale)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} data-key={r.key ? "true" : undefined} className={r.key ? styles.keyRow : undefined}>
              {r.cells.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {pick3(c, locale)}
                  </th>
                ) : (
                  <td key={j}>{pick3(c, locale)}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
