// Stage 7 Phase 3 (D-196 §0-11, D-195 §2 操作部品) — `network` (widget): an arrow diagram whose
// activity durations the reader can change; the critical path (spot, thick) and the total
// duration are recomputed on every change (lib/textbook/criticalPath). Drawn with React SVG
// elements from the data (no injected markup). Dummy activities are dashed and not editable.
// An entry that is not an integer 0〜99 is marked invalid and the figure keeps the last valid
// numbers.

"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { criticalPath, criticalPaths, type CpResult } from "@/lib/textbook/criticalPath";
import { figErrors } from "@/lib/textbook/figureSpec";
import type { FigSpec, NetworkAct } from "@/lib/textbook/types";

import styles from "./figures.module.css";

interface Props {
  fig: Extract<FigSpec, { kind: "network" }>;
  /** same props as the other kinds; the labels come from the Figure messages, the data has none */
  locale: string;
}

const DAYS_RE = /^\d{1,2}$/;
const R = 16; // node radius
const DX = 150; // layer spacing
const DY = 72; // row spacing
const PAD = 28;

/** Node positions: x by the longest chain of activities from the start, y by order within that column. */
function layout(nodes: string[], acts: NetworkAct[]) {
  const layer: Record<string, number> = Object.fromEntries(nodes.map((n) => [n, 0]));
  // relax until stable (criticalPath has already proven the network acyclic, so this terminates)
  for (let changed = true; changed; ) {
    changed = false;
    for (const a of acts) {
      if (layer[a.to]! < layer[a.from]! + 1) {
        layer[a.to] = layer[a.from]! + 1;
        changed = true;
      }
    }
  }
  const cols = new Map<number, string[]>();
  for (const n of nodes) cols.set(layer[n]!, [...(cols.get(layer[n]!) ?? []), n]);
  const rows = Math.max(...[...cols.values()].map((c) => c.length));
  const pos: Record<string, { x: number; y: number }> = {};
  for (const [l, col] of cols) {
    col.forEach((n, i) => {
      pos[n] = { x: PAD + R + l * DX, y: PAD + R + (i + (rows - col.length) / 2) * DY };
    });
  }
  const width = PAD * 2 + R * 2 + Math.max(...Object.values(layer)) * DX;
  const height = PAD * 2 + R * 2 + (rows - 1) * DY;
  return { pos, width, height };
}

export function NetworkFig({ fig }: Props): React.ReactElement | null {
  const t = useTranslations("Figure");
  const uid = useId();
  const ok = figErrors(fig).length === 0;
  const base = ok ? fig.data.acts.map((a) => a.days) : [];
  const [text, setText] = useState(() => base.map(String));
  const [days, setDays] = useState(base);
  if (!ok) return null;

  const { nodes } = fig.data;
  const acts = fig.data.acts.map((a, i) => ({ ...a, days: days[i] ?? a.days }));
  let r: CpResult;
  try {
    r = criticalPath(nodes, acts);
  } catch {
    return null;
  }
  const crit = new Set(r.critical);
  const name = (a: NetworkAct) => a.name ?? `${a.from}→${a.to}`;
  const path = criticalPaths(nodes, acts, r)
    .map((p) => p.filter((i) => !acts[i]!.dummy).map((i) => name(acts[i]!)).join(" → "))
    .join(" / ");
  const { pos, width, height } = layout(nodes, acts);

  const edit = (i: number, v: string) => {
    setText((s) => s.map((x, j) => (j === i ? v : x)));
    if (DAYS_RE.test(v)) setDays((d) => d.map((x, j) => (j === i ? Number(v) : x)));
  };
  const reset = () => {
    setText(base.map(String));
    setDays(base);
  };
  const changed = days.some((d, i) => d !== base[i]) || text.some((x, i) => x !== String(base[i]));

  return (
    <figure data-part="fig" data-fig="network" className={styles.fig}>
      <div className={styles.netScroll}>
        <svg
          className={styles.net}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label={`${t("network")}. ${t("total", { n: r.total })}. ${t("critical", { path })}`}
        >
          <defs>
            <marker id={`${uid}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={styles.arrowHead} />
            </marker>
            <marker id={`${uid}-c`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={styles.arrowHeadCrit} />
            </marker>
          </defs>
          {acts.map((a, i) => {
            const p = pos[a.from]!;
            const q = pos[a.to]!;
            const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
            const ux = (q.x - p.x) / len;
            const uy = (q.y - p.y) / len;
            const c = crit.has(i);
            return (
              <g key={i}>
                <line
                  x1={p.x + ux * R}
                  y1={p.y + uy * R}
                  x2={q.x - ux * (R + 2)}
                  y2={q.y - uy * (R + 2)}
                  data-critical={c ? "true" : undefined}
                  className={`${c ? styles.edgeCrit : styles.edge}${a.dummy ? ` ${styles.edgeDummy}` : ""}`}
                  markerEnd={`url(#${uid}-${c ? "c" : "a"})`}
                />
                {a.dummy ? null : (
                  <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 - 7} textAnchor="middle" className={c ? styles.edgeLabelCrit : styles.edgeLabel}>
                    {`${name(a)} ${t("days", { n: a.days })}`}
                  </text>
                )}
              </g>
            );
          })}
          {nodes.map((n) => (
            <g key={n}>
              <circle cx={pos[n]!.x} cy={pos[n]!.y} r={R} className={styles.node} />
              <text x={pos[n]!.x} y={pos[n]!.y + 5} textAnchor="middle" className={styles.nodeLabel}>
                {n}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className={styles.netHint}>{t("hint")}</p>
      <div className={styles.netForm}>
        {fig.data.acts.map((a, i) =>
          a.dummy ? null : (
            <div key={i} className={styles.netField}>
              <label htmlFor={`${uid}-d${i}`}>{t("actDays", { name: name(a) })}</label>
              <input
                id={`${uid}-d${i}`}
                type="number"
                inputMode="numeric"
                min={0}
                max={99}
                step={1}
                value={text[i] ?? ""}
                aria-invalid={DAYS_RE.test(text[i] ?? "") ? undefined : true}
                title={DAYS_RE.test(text[i] ?? "") ? undefined : t("invalid")}
                onChange={(e) => edit(i, e.target.value)}
                className={styles.netInput}
              />
            </div>
          ),
        )}
      </div>
      <div className={styles.netResult} aria-live="polite">
        <p className={styles.netTotal}>{t("total", { n: r.total })}</p>
        <p>{t("critical", { path })}</p>
      </div>
      <button type="button" className={styles.btn} onClick={reset} disabled={!changed}>
        {t("reset")}
      </button>
    </figure>
  );
}
