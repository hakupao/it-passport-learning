// Stage 7 Phase 3 (D-196 §0-11) — `flow`: a left-to-right chain of nodes (top-to-bottom on a
// phone). static = every node; steps = the first `show` nodes, the newest highlighted. Hidden
// nodes keep their place (no layout jump between steps) and are hidden from assistive tech.

import { useTranslations } from "next-intl";

import { figErrors } from "@/lib/textbook/figureSpec";
import type { FigSpec, FlowFigData } from "@/lib/textbook/types";

import styles from "./figures.module.css";
import { pick3 } from "./pick";
import { StepStage } from "./StepStage";

interface Props {
  fig: Extract<FigSpec, { kind: "flow" }>;
  locale: string;
}

function FlowView({ data, show, focus, locale }: { data: FlowFigData; show: number; focus: boolean; locale: string }) {
  return (
    <ol className={styles.flow}>
      {data.nodes.map((n, i) => {
        const off = i >= show;
        const on = focus && i === show - 1;
        return (
          <li
            key={n.id}
            data-off={off ? "true" : undefined}
            aria-hidden={off ? true : undefined}
            className={`${styles.flowNode}${on ? ` ${styles.focus}` : ""}${off ? ` ${styles.off}` : ""}`}
          >
            {pick3(n.label, locale)}
          </li>
        );
      })}
    </ol>
  );
}

export function FlowFig({ fig, locale }: Props): React.ReactElement | null {
  const t = useTranslations("Figure");
  if (figErrors(fig).length > 0) return null;
  const n = fig.data.nodes.length;
  return (
    <figure data-part="fig" data-fig="flow" className={styles.fig}>
      {fig.mode === "steps" && fig.steps ? (
        <StepStage
          label={t("steps")}
          frames={fig.steps.map((s, i) => (
            <FlowView key={i} data={fig.data} show={s.state.show} focus locale={locale} />
          ))}
          captions={fig.steps.map((s) => pick3({ jp: s.caption_jp, zh: s.caption_zh, en: s.caption_en }, locale))}
        />
      ) : (
        <FlowView data={fig.data} show={n} focus={false} locale={locale} />
      )}
    </figure>
  );
}
