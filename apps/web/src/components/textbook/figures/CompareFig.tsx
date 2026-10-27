// Stage 7 Phase 3 (D-196 §0-11, D-195 §4) — `compare` (static): a / b side by side, one row per
// aspect; the decisive row (`key`) carries the tint fill.

import { figErrors } from "@/lib/textbook/figureSpec";
import type { FigSpec } from "@/lib/textbook/types";

import styles from "./figures.module.css";
import { pick3 } from "./pick";

interface Props {
  fig: Extract<FigSpec, { kind: "compare" }>;
  locale: string;
}

export function CompareFig({ fig, locale }: Props): React.ReactElement | null {
  if (figErrors(fig).length > 0) return null;
  const { a, b, rows } = fig.data;
  return (
    <figure data-part="fig" data-fig="compare" className={styles.fig}>
      <table className={`${styles.table} ${styles.compare}`}>
        <thead>
          <tr>
            <td />
            <th scope="col">{pick3(a, locale)}</th>
            <th scope="col">{pick3(b, locale)}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} data-key={r.key ? "true" : undefined} className={r.key ? styles.keyRow : undefined}>
              <th scope="row">{pick3(r.label, locale)}</th>
              <td>{pick3(r.a, locale)}</td>
              <td>{pick3(r.b, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
