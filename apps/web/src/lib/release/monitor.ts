// D-224 monitoring (S154 H6, evidence/phase5/hosting/H4_cpu_measurement.md): the owner's sync record size
// and the Worker's CPU, read monthly by scripts/cf-monitor.ts. Pure parts only (tested); the script does I/O.

/** Above this the full PUT nears Free's 10 ms CPU (H3 local bench: ~250–300 KB) → ask the user (D-224). */
export const RECORD_LIMIT_BYTES = 200_000;
/** Free plan CPU limit per request. */
export const CPU_LIMIT_MS = 10;

/** One row of GraphQL `workersInvocationsAdaptive` grouped by `date` (cpuTime fields are µs). */
export interface InvocationRow {
  dimensions: { date: string };
  sum: { requests: number; errors: number; subrequests: number };
  quantiles: { cpuTimeP50: number; cpuTimeP99: number };
  max: { cpuTime: number };
}

export interface DaySummary {
  date: string;
  requests: number;
  errors: number;
  subrequests: number;
  p50Ms: number;
  p99Ms: number;
  maxMs: number;
}

const ms = (us: number) => Math.round(us / 100) / 10;

export function summarizeDays(rows: readonly InvocationRow[]): DaySummary[] {
  return rows
    .map((r) => ({
      date: r.dimensions.date,
      requests: r.sum.requests,
      errors: r.sum.errors,
      subrequests: r.sum.subrequests,
      p50Ms: ms(r.quantiles.cpuTimeP50),
      p99Ms: ms(r.quantiles.cpuTimeP99),
      maxMs: ms(r.max.cpuTime),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface Verdict {
  /** true → stop and ask the user (D-224 options: A Workers Paid / B split the sync). */
  askUser: boolean;
  reasons: string[];
  notes: string[];
}

/**
 * askUser when the record exceeds RECORD_LIMIT_BYTES, any invocation errored (1102 = CPU exceeded), or a
 * day's p50 reached the CPU limit. A max above 10 ms alone is a note: H4 saw it on cold isolates only.
 */
export function verdict(recordBytes: number, days: readonly DaySummary[]): Verdict {
  const reasons: string[] = [];
  const notes: string[] = [];
  if (recordBytes > RECORD_LIMIT_BYTES) reasons.push(`record ${recordBytes} B > ${RECORD_LIMIT_BYTES} B`);
  const errors = days.reduce((n, d) => n + d.errors, 0);
  if (errors > 0) reasons.push(`${errors} errored invocations`);
  for (const d of days) {
    if (d.p50Ms >= CPU_LIMIT_MS) reasons.push(`${d.date} p50 ${d.p50Ms} ms ≥ ${CPU_LIMIT_MS} ms`);
    else if (d.maxMs > CPU_LIMIT_MS) notes.push(`${d.date} max ${d.maxMs} ms > ${CPU_LIMIT_MS} ms (cold start? errors decide)`);
  }
  return { askUser: reasons.length > 0, reasons, notes };
}

/** Minimal .env parser: KEY=VALUE lines, # comments, optional surrounding quotes. */
export function parseDotEnv(text: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const raw of text.split(/\r?\n/)) {
    const m = raw.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2]!.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]!] = v;
  }
  return env;
}
