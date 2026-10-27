// Stage 7 Phase 3 (D-196 §0-11) — the closed figure registry, as data rules.
//
// FIGURE_KINDS lists every kind a unit's `fig` may use and the modes each allows;
// figErrors checks one `fig` against its kind's parameter shape. This is the main
// line of defence (validateV2); the Task 7 components only return null on bad
// data as a backstop. A new kind is a new code task (component + tests + an entry
// here), never something the generator can introduce.
//
// Pure .ts, no JSX, no imports from components/: validateV2 (and through it the
// Node pipeline scripts, via native type stripping) imports this file.

import type { FigSpec, Text3, TreeNode } from "./types.ts";

export const FIGURE_KINDS = {
  svg: ["static"],
  table: ["static"],
  compare: ["static"],
  flow: ["static", "steps"],
  tree: ["static", "steps"],
  network: ["widget"],
} as const satisfies Record<FigSpec["kind"], readonly FigSpec["mode"][]>;

export type FigureKind = keyof typeof FIGURE_KINDS;

/** Steps per `mode: "steps"` figure (§0-11). */
export const STEPS_MIN = 3;
export const STEPS_MAX = 4;

// v1 figures live at data/ip/textbook/figures/<name>.svg (no traversal, no nesting).
const SVG_PATH_RE = /^figures\/[A-Za-z0-9][A-Za-z0-9._-]*\.svg$/;
const ID_RE = /^[A-Za-z0-9_-]{1,32}$/;

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
// Figure labels and step captions are plain text: no inline markup (§0-12 markers
// are for prose), so a marker character pair here is an error, not literal text.
const MARKUP_RE = /\*\*|\[\[|\]\]/;
const nonEmpty = (v: unknown): v is string => typeof v === "string" && v.trim() !== "" && !MARKUP_RE.test(v);
/** jp / zh / en, each non-empty plain text. */
const isText3 = (v: unknown): v is Text3 => isRec(v) && nonEmpty(v.jp) && nonEmpty(v.zh) && nonEmpty(v.en);
const isInt = (v: unknown, min: number, max = Number.MAX_SAFE_INTEGER): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

/** Depth of a tree (1 = root only); collects ids and label problems on the way. */
function walkTree(n: unknown, at: string, ids: string[], errs: string[]): number {
  if (!isRec(n) || typeof n.id !== "string" || !ID_RE.test(n.id)) {
    errs.push(`${at}: node needs an id matching ${ID_RE}`);
    return 0;
  }
  ids.push(n.id);
  if (!isText3(n.label)) errs.push(`${at}(${n.id}).label: needs jp / zh / en plain text`);
  if (n.children === undefined) return 1;
  if (!Array.isArray(n.children) || n.children.length === 0) {
    errs.push(`${at}(${n.id}).children: non-empty array or absent`);
    return 1;
  }
  return 1 + Math.max(...(n.children as TreeNode[]).map((c, i) => walkTree(c, `${at}.children[${i}]`, ids, errs)));
}

/**
 * Arrow diagram: activities join known nodes, no two activities share from → to (parallel
 * work goes through a dummy), one start node and one end node, acyclic, (weakly) connected.
 */
function networkErrors(d: Rec): string[] {
  const errs: string[] = [];
  const nodes = d.nodes;
  if (!Array.isArray(nodes) || nodes.length < 2 || !nodes.every((n) => typeof n === "string" && ID_RE.test(n))) {
    return ["data.nodes: ≥ 2 node ids"];
  }
  if (new Set(nodes).size !== nodes.length) return ["data.nodes: duplicate id"];
  if (!Array.isArray(d.acts) || d.acts.length === 0) return ["data.acts: non-empty array"];
  const known = new Set<string>(nodes);
  const out = new Map<string, string[]>(nodes.map((n) => [n, []]));
  const und = new Map<string, string[]>(nodes.map((n) => [n, []]));
  const indeg = new Map<string, number>(nodes.map((n) => [n, 0]));
  const pairs = new Set<string>();
  d.acts.forEach((a: unknown, i) => {
    const at = `data.acts[${i}]`;
    if (!isRec(a) || typeof a.from !== "string" || typeof a.to !== "string" || !known.has(a.from) || !known.has(a.to)) {
      errs.push(`${at}: from / to must be listed nodes`);
      return;
    }
    if (a.from === a.to) errs.push(`${at}: self loop`);
    if (!isInt(a.days, 0, 999)) errs.push(`${at}.days: integer 0〜999`);
    if (a.dummy !== undefined && typeof a.dummy !== "boolean") errs.push(`${at}.dummy: boolean`);
    if (a.dummy === true && a.days !== 0) errs.push(`${at}: a dummy activity takes 0 days`);
    if (a.name !== undefined && !nonEmpty(a.name)) errs.push(`${at}.name: non-empty when present`);
    const key = `${a.from}\u0000${a.to}`;
    if (pairs.has(key)) errs.push(`${at}: a second activity ${a.from} → ${a.to} (use a dummy)`);
    pairs.add(key);
    indeg.set(a.to, indeg.get(a.to)! + 1);
    out.get(a.from)!.push(a.to);
    und.get(a.from)!.push(a.to);
    und.get(a.to)!.push(a.from);
  });
  if (errs.length > 0) return errs;

  const sources = nodes.filter((n) => indeg.get(n) === 0);
  const sinks = nodes.filter((n) => out.get(n)!.length === 0);
  if (sources.length !== 1) errs.push(`data: exactly one start node (no incoming activity), got ${sources.join(", ") || "none"}`);
  if (sinks.length !== 1) errs.push(`data: exactly one end node (no outgoing activity), got ${sinks.join(", ") || "none"}`);

  // cycle: DFS colouring
  const state = new Map<string, 1 | 2>();
  const cyclic = (n: string): boolean => {
    state.set(n, 1);
    for (const m of out.get(n)!) {
      const s = state.get(m);
      if (s === 1 || (s === undefined && cyclic(m))) return true;
    }
    state.set(n, 2);
    return false;
  };
  if (nodes.some((n) => !state.has(n) && cyclic(n))) errs.push("data.acts: the network has a cycle");

  // connectivity over the undirected graph
  const seen = new Set<string>([nodes[0]]);
  const stack = [nodes[0] as string];
  while (stack.length > 0) {
    for (const m of und.get(stack.pop()!)!) {
      if (!seen.has(m)) {
        seen.add(m);
        stack.push(m);
      }
    }
  }
  if (seen.size !== nodes.length) errs.push(`data: not connected (${nodes.filter((n) => !seen.has(n)).join(", ")} unreachable)`);
  return errs;
}

/** Problems with one `fig` (empty = valid). Messages are field-relative ("data.rows[0]…"). */
export function figErrors(fig: unknown): string[] {
  if (!isRec(fig)) return ["fig: object or null"];
  const kind = fig.kind;
  if (typeof kind !== "string" || !Object.prototype.hasOwnProperty.call(FIGURE_KINDS, kind)) {
    return [`kind ${JSON.stringify(kind)} is not in FIGURE_KINDS`];
  }
  const modes: readonly string[] = FIGURE_KINDS[kind as FigureKind];
  if (typeof fig.mode !== "string" || !modes.includes(fig.mode)) {
    return [`mode ${JSON.stringify(fig.mode)} not allowed for ${kind} (${modes.join(" / ")})`];
  }
  if (fig.mode !== "steps" && fig.steps !== undefined) return [`steps only with mode "steps"`];
  const d = fig.data;
  if (!isRec(d)) return ["data: object"];

  const errs: string[] = [];
  let flowLen = 0;
  let treeDepth = 0;
  switch (kind as FigureKind) {
    case "svg":
      if (typeof d.path !== "string" || !SVG_PATH_RE.test(d.path)) errs.push(`data.path: must match ${SVG_PATH_RE}`);
      break;
    case "table": {
      const cols = d.cols;
      if (!Array.isArray(cols) || cols.length < 2 || !cols.every(isText3)) {
        errs.push("data.cols: ≥ 2 headers with jp / zh / en plain text");
        break;
      }
      if (!Array.isArray(d.rows) || d.rows.length === 0) errs.push("data.rows: non-empty array");
      else
        d.rows.forEach((r: unknown, i) => {
          if (!isRec(r) || !Array.isArray(r.cells) || r.cells.length !== cols.length || !r.cells.every(isText3)) {
            errs.push(`data.rows[${i}].cells: ${cols.length} cells with jp / zh / en plain text`);
          } else if (r.key !== undefined && typeof r.key !== "boolean") errs.push(`data.rows[${i}].key: boolean`);
        });
      break;
    }
    case "compare":
      if (!isText3(d.a) || !isText3(d.b)) errs.push("data.a / data.b: jp / zh / en plain text");
      if (!Array.isArray(d.rows) || d.rows.length < 2) errs.push("data.rows: ≥ 2 rows");
      else
        d.rows.forEach((r: unknown, i) => {
          if (!isRec(r) || !isText3(r.label) || !isText3(r.a) || !isText3(r.b)) errs.push(`data.rows[${i}]: label / a / b with jp / zh / en plain text`);
          else if (r.key !== undefined && typeof r.key !== "boolean") errs.push(`data.rows[${i}].key: boolean`);
        });
      break;
    case "flow": {
      const ns = d.nodes;
      if (!Array.isArray(ns) || ns.length < 2) {
        errs.push("data.nodes: ≥ 2 nodes");
        break;
      }
      ns.forEach((n: unknown, i) => {
        if (!isRec(n) || typeof n.id !== "string" || !ID_RE.test(n.id) || !isText3(n.label)) errs.push(`data.nodes[${i}]: id + label (jp / zh / en plain text)`);
      });
      if (new Set(ns.map((n: Rec) => n?.id)).size !== ns.length) errs.push("data.nodes: duplicate id");
      flowLen = ns.length;
      break;
    }
    case "tree": {
      const ids: string[] = [];
      treeDepth = walkTree(d.root, "data.root", ids, errs);
      if (new Set(ids).size !== ids.length) errs.push("data.root: duplicate node id");
      if (treeDepth < 2) errs.push("data.root: a tree needs children");
      break;
    }
    case "network":
      errs.push(...networkErrors(d));
      break;
  }
  if (errs.length > 0 || fig.mode !== "steps") return errs;

  const steps = fig.steps;
  if (!Array.isArray(steps) || steps.length < STEPS_MIN || steps.length > STEPS_MAX) {
    return [`steps: ${STEPS_MIN}〜${STEPS_MAX} steps`];
  }
  steps.forEach((s: unknown, i) => {
    const at = `steps[${i}]`;
    if (!isRec(s)) {
      errs.push(`${at}: object`);
      return;
    }
    for (const l of ["jp", "zh", "en"]) if (!nonEmpty(s[`caption_${l}`])) errs.push(`${at}.caption_${l}: missing/empty or has markup`);
    const st = s.state;
    if (kind === "flow" && !(isRec(st) && isInt(st.show, 1, flowLen))) errs.push(`${at}.state.show: integer 1〜${flowLen}`);
    if (kind === "tree" && !(isRec(st) && isInt(st.depth, 1, treeDepth))) errs.push(`${at}.state.depth: integer 1〜${treeDepth}`);
  });
  return errs;
}
