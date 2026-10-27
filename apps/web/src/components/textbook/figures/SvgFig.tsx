// Stage 7 Phase 3 (D-196 §0-11) — `svg`: the v1 self-generated Mermaid SVG, inlined as before
// (moved here from TermBlock; same markup). The only figure that injects markup: the SVG is
// trusted pipeline output read from data/ip/textbook/figures, never generator-written HTML.

import { useTranslations } from "next-intl";

import { figErrors } from "@/lib/textbook/figureSpec";
import { svgNaturalWidth } from "@/lib/textbook/reader";
import type { FigSpec } from "@/lib/textbook/types";

import styles from "../reader.module.css";

/** natural width above which a figure may scroll sideways on a phone (the hint shows, ≤ 640px only) */
const FIG_HINT_MIN = 300;

interface Props {
  fig: Extract<FigSpec, { kind: "svg" }>;
  /** the SVG text of fig.data.path; null when it could not be read */
  svg: string | null;
}

export function SvgFig({ fig, svg }: Props): React.ReactElement | null {
  const t = useTranslations("Textbook");
  if (!svg || figErrors(fig).length > 0) return null;
  const figW = svgNaturalWidth(svg);
  return (
    <>
      {/* On a phone the SVG keeps min(560px, its natural width) and scrolls inside the figure
          box instead of shrinking to unreadable text (--fig-w, reader.module.css). */}
      <figure
        data-part="fig"
        className={styles.figure}
        style={figW !== null ? ({ "--fig-w": `${figW}px` } as React.CSSProperties) : undefined}
        // Trusted, self-generated Mermaid SVG from our own pipeline.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {figW !== null && figW > FIG_HINT_MIN ? (
        <p data-part="fig-hint" className={styles.figHint} aria-hidden="true">
          {t("figScroll")}
        </p>
      ) : null}
    </>
  );
}
