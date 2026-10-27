// Stage 7 Phase 3 (D-196 §0-11) — critical path of an arrow diagram (the `network` figure's
// widget recomputes it on every duration change). Pure, no imports: Node scripts may import it
// with native type stripping like validateV2.ts.
//
// es = earliest event time (forward pass), lf = latest event time (backward pass; every end
// node gets the total). An activity is critical when its total float lf[to] − es[from] − days
// is 0; dummies (days 0) take part like any activity. validateV2 / figureSpec already reject
// cycles, disconnection, parallel activities and several start / end nodes; this function
// still throws RangeError on a cycle, disconnection, an unknown node or bad days, so a bad
// widget state can never yield a wrong answer.

export interface CpAct {
  from: string;
  to: string;
  days: number;
  dummy?: boolean;
}

export interface CpResult {
  total: number;
  /** indices into `acts` of the critical activities, ascending */
  critical: number[];
  es: Record<string, number>;
  lf: Record<string, number>;
}

export function criticalPath(nodes: string[], acts: CpAct[]): CpResult {
  if (nodes.length === 0) throw new RangeError("network has no nodes");
  const known = new Set(nodes);
  const out = new Map<string, number[]>(nodes.map((n) => [n, []]));
  const indeg = new Map<string, number>(nodes.map((n) => [n, 0]));
  const und = new Map<string, string[]>(nodes.map((n) => [n, []]));
  acts.forEach((a, i) => {
    if (!known.has(a.from) || !known.has(a.to)) throw new RangeError(`activity ${i}: unknown node`);
    if (!Number.isInteger(a.days) || a.days < 0) throw new RangeError(`activity ${i}: days must be an integer ≥ 0`);
    out.get(a.from)!.push(i);
    indeg.set(a.to, indeg.get(a.to)! + 1);
    und.get(a.from)!.push(a.to);
    und.get(a.to)!.push(a.from);
  });

  // connected (ignoring direction)
  const seen = new Set<string>(nodes.slice(0, 1));
  const stack = nodes.slice(0, 1);
  while (stack.length > 0) {
    for (const m of und.get(stack.pop()!)!) {
      if (!seen.has(m)) {
        seen.add(m);
        stack.push(m);
      }
    }
  }
  if (seen.size !== nodes.length) throw new RangeError("network is not connected");

  // topological order (Kahn); leftovers = a cycle
  const order: string[] = [];
  const left = new Map(indeg);
  const queue = nodes.filter((n) => left.get(n) === 0);
  while (queue.length > 0) {
    const n = queue.shift()!;
    order.push(n);
    for (const i of out.get(n)!) {
      const to = acts[i]!.to;
      left.set(to, left.get(to)! - 1);
      if (left.get(to) === 0) queue.push(to);
    }
  }
  if (order.length !== nodes.length) throw new RangeError("network has a cycle");

  const es: Record<string, number> = {};
  for (const n of order) es[n] ??= 0;
  for (const n of order) {
    for (const i of out.get(n)!) {
      const a = acts[i]!;
      es[a.to] = Math.max(es[a.to] ?? 0, es[n]! + a.days);
    }
  }
  const total = Math.max(...nodes.map((n) => es[n]!));

  const lf: Record<string, number> = {};
  for (const n of [...order].reverse()) {
    const outs = out.get(n)!;
    lf[n] = outs.length === 0 ? total : Math.min(...outs.map((i) => lf[acts[i]!.to]! - acts[i]!.days));
  }

  const critical = acts.flatMap((a, i) => (lf[a.to]! - es[a.from]! - a.days === 0 ? [i] : []));
  return { total, critical, es, lf };
}

/**
 * Every critical path, start node → end node, as activity indices (dummies included),
 * following activities in index order. For the widget's 「クリティカルパス：A → C」 line.
 */
export function criticalPaths(nodes: string[], acts: CpAct[], r: CpResult): number[][] {
  const crit = new Set(r.critical);
  const hasIn = new Set(acts.map((a) => a.to));
  const paths: number[][] = [];
  const walk = (n: string, path: number[]) => {
    const next = acts.flatMap((a, i) => (a.from === n && crit.has(i) ? [i] : []));
    if (next.length === 0) {
      if (path.length > 0 && r.es[n] === r.total) paths.push(path);
      return;
    }
    for (const i of next) walk(acts[i]!.to, [...path, i]);
  };
  for (const n of nodes.filter((x) => !hasIn.has(x))) walk(n, []);
  return paths;
}
