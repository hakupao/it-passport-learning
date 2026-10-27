// Stage 7 Phase 3 (D-196 §0-11, D-195 §2 操作部品) — `network` (widget): an arrow diagram whose
// activity durations the reader can change; the critical path (spot, thick) and the total
// duration are recomputed on every change (lib/textbook/criticalPath). Drawn with React SVG
// elements from the data (no injected markup). Dummy activities are dashed and not editable.
// An entry that is not an integer 0〜99 (figureSpec NETWORK_DAYS_MAX) shows an error under the
// input and the figure keeps the last valid numbers.

"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { criticalPath, criticalPaths, type CpResult } from "@/lib/textbook/criticalPath";
import { figErrors, NETWORK_DAYS_MAX } from "@/lib/textbook/figureSpec";
import type { FigSpec, NetworkAct } from "@/lib/textbook/types";

import styles from "./figures.module.css";

interface Props {
  fig: Extract<FigSpec, { kind: "network" }>;
  /** same props as the other kinds; the labels come from the Figure messages, the data has none */
  locale: string;
}

const DAYS_RE = /^\d{1,2}$/; // 0〜NETWORK_DAYS_MAX (99), as figureSpec
export const NODE_R = 16;
const R = NODE_R;
const DX = 150; // column spacing
const DY = 72; // row spacing
const PAD = 28;
const LANE = DY * 0.6; // height of one lane above the top row for activities that skip a column

interface Pt {
  x: number;
  y: number;
}

/**
 * Where everything goes. Columns: the longest chain of real activities from the start — a
 * dummy does not move its end node a column right (the sample's dummy 2→3 stands vertical
 * between 2 and 3). An activity spanning one column is a straight line, labelled at its middle,
 * which lies between two columns, clear of every node. One that skips columns is a curve whose
 * middle runs in its own lane above the top row, so it never crosses or hides a node.
 */
export function networkGeometry(
  nodes: string[],
  acts: NetworkAct[],
): { pos: Record<string, Pt>; edges: { d: string; label: Pt }[]; width: number; height: number } {
  const layer: Record<string, number> = Object.fromEntries(nodes.map((n) => [n, 0]));
  // relax until stable; the network is acyclic (validated; criticalPath ran first), so ≤ |nodes| passes
  for (let pass = 0, changed = true; changed && pass <= nodes.length; pass++) {
    changed = false;
    for (const a of acts) {
      const want = layer[a.from]! + (a.dummy ? 0 : 1);
      if (layer[a.to]! < want) {
        layer[a.to] = want;
        changed = true;
      }
    }
  }
  const long = acts.map((a) => Math.abs(layer[a.to]! - layer[a.from]!) > 1);
  const lanes = long.filter(Boolean).length;
  const top = PAD + R + lanes * LANE;

  const cols = new Map<number, string[]>();
  for (const n of nodes) cols.set(layer[n]!, [...(cols.get(layer[n]!) ?? []), n]);
  const rows = Math.max(...[...cols.values()].map((c) => c.length));
  const pos: Record<string, Pt> = {};
  for (const [l, col] of cols) {
    col.forEach((n, i) => {
      pos[n] = { x: PAD + R + l * DX, y: top + (i + (rows - col.length) / 2) * DY };
    });
  }

  const unit = (a: Pt, b: Pt): Pt => {
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  };
  let lane = 0;
  const edges = acts.map((a, i) => {
    const p = pos[a.from]!;
    const q = pos[a.to]!;
    if (!long[i]) {
      const u = unit(p, q);
      const s = { x: p.x + u.x * R, y: p.y + u.y * R };
      const e = { x: q.x - u.x * (R + 2), y: q.y - u.y * (R + 2) };
      return { d: `M ${s.x} ${s.y} L ${e.x} ${e.y}`, label: { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 - 7 } };
    }
    // quadratic curve whose midpoint sits in this activity's lane: mid = (p + 2c + q) / 4
    lane += 1;
    const midY = top - lane * LANE;
    const c = { x: (p.x + q.x) / 2, y: 2 * midY - (p.y + q.y) / 2 };
    const u1 = unit(p, c);
    const u2 = unit(c, q);
    const s = { x: p.x + u1.x * R, y: p.y + u1.y * R };
    const e = { x: q.x - u2.x * (R + 2), y: q.y - u2.y * (R + 2) };
    return { d: `M ${s.x} ${s.y} Q ${c.x} ${c.y} ${e.x} ${e.y}`, label: { x: c.x, y: midY - 7 } };
  });

  const width = PAD * 2 + R * 2 + Math.max(...Object.values(layer)) * DX;
  const height = top + (rows - 1) * DY + R + PAD;
  return { pos, edges, width, height };
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  /** shown under the input while the value is not an integer 0〜99 */
  error: string;
  onChange: (v: string) => void;
}

/** One duration input; an invalid value gets a visible message tied to it by aria-describedby. */
export function DaysField({ id, label, value, error, onChange }: FieldProps): React.ReactElement {
  const bad = !DAYS_RE.test(value);
  return (
    <div className={styles.netField}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={NETWORK_DAYS_MAX}
        step={1}
        value={value}
        aria-invalid={bad ? true : undefined}
        aria-describedby={bad ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={styles.netInput}
      />
      {bad ? (
        <p id={`${id}-err`} className={styles.netError}>
          {error}
        </p>
      ) : null}
    </div>
  );
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
  const { pos, edges, width, height } = networkGeometry(nodes, acts);

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
            const c = crit.has(i);
            const e = edges[i]!;
            return (
              <g key={i}>
                <path
                  d={e.d}
                  fill="none"
                  data-critical={c ? "true" : undefined}
                  className={`${c ? styles.edgeCrit : styles.edge}${a.dummy ? ` ${styles.edgeDummy}` : ""}`}
                  markerEnd={`url(#${uid}-${c ? "c" : "a"})`}
                />
                {a.dummy ? null : (
                  <text x={e.label.x} y={e.label.y} textAnchor="middle" className={c ? styles.edgeLabelCrit : styles.edgeLabel}>
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
            <DaysField
              key={i}
              id={`${uid}-d${i}`}
              label={t("actDays", { name: name(a) })}
              value={text[i] ?? ""}
              error={t("invalid")}
              onChange={(v) => edit(i, v)}
            />
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
