// Stage 7 Phase 3 (D-196 §0-11) — the closed figure registry: one component per FIGURE_KINDS kind.
// renderFig validates the params against figureSpec (the authority, shared with validateV2) and
// renders nothing for bad data, so a broken figure never takes the term's text down with it; each
// component also returns null on bad data when used directly. A new kind = a new code task
// (component + tests + figureSpec entry), never something the generator can add.
// Web code imports lib modules without the `.ts` suffix (one module instance per bundle); the
// suffix is only for the Node-importable chain itself (validateV2 → figureSpec → types, §0-13).

import { createElement, type ReactElement } from "react";

import { figErrors, type FigureKind } from "@/lib/textbook/figureSpec";
import type { FigSpec } from "@/lib/textbook/types";

import { CompareFig } from "./CompareFig";
import { FlowFig } from "./FlowFig";
import { NetworkFig } from "./NetworkFig";
import { SvgFig } from "./SvgFig";
import { TableFig } from "./TableFig";
import { TreeFig } from "./TreeFig";

export const FIG_COMPONENTS = {
  svg: SvgFig,
  table: TableFig,
  compare: CompareFig,
  flow: FlowFig,
  tree: TreeFig,
  network: NetworkFig,
} as const satisfies Record<FigureKind, unknown>;

/** `fig` as an element; null when its params are invalid (or an svg fig has no SVG text). */
export function renderFig(fig: FigSpec, opts: { locale: string; svg: string | null }): ReactElement | null {
  if (figErrors(fig).length > 0) return null;
  const { locale } = opts;
  switch (fig.kind) {
    case "svg":
      return opts.svg ? createElement(SvgFig, { fig, svg: opts.svg }) : null;
    case "table":
      return createElement(TableFig, { fig, locale });
    case "compare":
      return createElement(CompareFig, { fig, locale });
    case "flow":
      return createElement(FlowFig, { fig, locale });
    case "tree":
      return createElement(TreeFig, { fig, locale });
    case "network":
      return createElement(NetworkFig, { fig, locale });
  }
}
