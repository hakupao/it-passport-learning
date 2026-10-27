// Stage 7 Phase 3 (D-196 §0-1 / §0-2) — a link from a textbook unit into a practice group
// (`/practice?ids=…&from=unit&unit=<id>`): the unit's 確認問題 and each term's past questions.
//   - The rendered href has no run nonce (server and first client render agree). A plain click
//     makes the run at click time (nextRun: strictly increasing, so two clicks never share one)
//     and navigates there — a new group each time, never the stored summary of the last one. A
//     modified / middle click keeps the browser's own handling of the run-less href.
//   - `order`: once the learning record has loaded, the ids go never-answered → in the mistakes
//     book → the rest (orderConfirm, browser-local day).

"use client";

import { useMemo, useRef } from "react";

import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link, useRouter } from "@/i18n/navigation";
import { confirmHref, nextRun, orderConfirm } from "@/lib/textbook/confirm";

interface Props {
  ids: readonly string[];
  unitId: string;
  order?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function UnitPracticeLink({ ids, unitId, order = false, className, children }: Props): React.ReactElement {
  const { record, loaded } = useLearningRecord();
  const router = useRouter();
  const lastRun = useRef<string | null>(null);
  const list = useMemo(
    () => (order && loaded ? orderConfirm(ids, record, Date.now()) : ids),
    [order, loaded, ids, record],
  );
  return (
    <Link
      href={confirmHref(list, unitId, null)}
      prefetch={false}
      className={className}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const run = nextRun(lastRun.current, Date.now());
        lastRun.current = run;
        router.push(confirmHref(list, unitId, run));
      }}
    >
      {children}
    </Link>
  );
}
