// Stage 7 Phase 3 (D-196 §0-11) — `tree`: nested levels under one root. static = every level;
// steps = levels 1..depth open, the newest level highlighted. Closed levels keep their place and
// are hidden from assistive tech.

import { useTranslations } from "next-intl";

import { figErrors } from "@/lib/textbook/figureSpec";
import type { FigSpec, TreeNode } from "@/lib/textbook/types";

import styles from "./figures.module.css";
import { pick3 } from "./pick";
import { StepStage } from "./StepStage";

interface Props {
  fig: Extract<FigSpec, { kind: "tree" }>;
  locale: string;
}

function TreeLevel({ nodes, level, depth, focus, locale }: { nodes: TreeNode[]; level: number; depth: number; focus: boolean; locale: string }) {
  const off = level > depth;
  return (
    <ul className={level === 1 ? styles.tree : styles.treeKids}>
      {nodes.map((n) => (
        <li key={n.id}>
          <span
            data-off={off ? "true" : undefined}
            aria-hidden={off ? true : undefined}
            className={`${styles.treeNode}${focus && level === depth ? ` ${styles.focus}` : ""}${off ? ` ${styles.off}` : ""}`}
          >
            {pick3(n.label, locale)}
          </span>
          {n.children ? <TreeLevel nodes={n.children} level={level + 1} depth={depth} focus={focus} locale={locale} /> : null}
        </li>
      ))}
    </ul>
  );
}

export function TreeFig({ fig, locale }: Props): React.ReactElement | null {
  const t = useTranslations("Figure");
  if (figErrors(fig).length > 0) return null;
  const root = [fig.data.root];
  return (
    <figure data-part="fig" data-fig="tree" className={styles.fig}>
      {fig.mode === "steps" && fig.steps ? (
        <StepStage
          label={t("steps")}
          frames={fig.steps.map((s, i) => (
            <TreeLevel key={i} nodes={root} level={1} depth={s.state.depth} focus locale={locale} />
          ))}
          captions={fig.steps.map((s) => pick3({ jp: s.caption_jp, zh: s.caption_zh, en: s.caption_en }, locale))}
        />
      ) : (
        <TreeLevel nodes={root} level={1} depth={Number.MAX_SAFE_INTEGER} focus={false} locale={locale} />
      )}
    </figure>
  );
}
