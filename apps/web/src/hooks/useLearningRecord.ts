// D-180 §0-6/§0-7 — learning-record state for one page.
//
// `LearningRecordProvider` is mounted per page (quiz set today; Task 12 adds
// the landing / textbook TOC), never in the locale layout: the owner flag comes
// from cookies, and reading cookies in the layout would make every page dynamic.
// Small client islands read the record through `useLearningRecord()`.
//
// Lifecycle:
//   1. First render uses emptyRecord() on server and client (no hydration
//      mismatch); after mount the localStorage record is merged in.
//   2. Owner only: GET /api/learning once and merge the server copy in.
//   3. Every change after (1) is saved to localStorage.
//   4. Owner only: 2000 ms after the last change, PUT the merged record when it
//      differs from what the server last returned, then merge the response back.
//      The response itself equals `lastSynced`, so merging it schedules no new
//      PUT unless something changed meanwhile (no ping-pong); answers the
//      server has not seen yet (e.g. a PUT lost to navigation) go up on the next
//      page load, right after the GET.
// Network failure → console.warn only (syncClient); local keeps working.

"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { loadLocal, saveLocal } from "@/lib/learning/localStore";
import {
  emptyRecord,
  markUnitRead,
  mergeRecords,
  recordAnswer,
  type LearningRecord,
} from "@/lib/learning/record";
import { pullRemote, pushRemote, type FetchLike } from "@/lib/learning/syncClient";
import type { StorageLike } from "@/lib/storage";

export const PUT_DEBOUNCE_MS = 2000;

export interface LearningRecordValue {
  record: LearningRecord;
  answer(qid: string, choice: string, correct: boolean): void;
  readUnit(unitId: string): void;
}

const LearningRecordContext = createContext<LearningRecordValue | null>(null);

/** window.localStorage, or null where it is unavailable (SSR, blocked storage). */
function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

const browserFetch: FetchLike = (input, init) => fetch(input, init);

/** Key-sorted JSON (mergeRecords output is canonical), for "did anything change" checks. */
const canonical = (r: LearningRecord): string => JSON.stringify(mergeRecords(r, emptyRecord()));

export function LearningRecordProvider({
  isOwner,
  children,
}: {
  isOwner: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  const [record, setRecord] = useState<LearningRecord>(emptyRecord);
  const [loaded, setLoaded] = useState(false);
  /** Canonical JSON of the record the server last returned; null = not synced yet. */
  const lastSynced = useRef<string | null>(null);

  // (1) + (2): local load, then the owner's server copy.
  useEffect(() => {
    const storage = browserStorage();
    const local = storage ? loadLocal(storage) : emptyRecord();
    setRecord((prev) => mergeRecords(prev, local));
    setLoaded(true);
    if (!isOwner) return;
    const ac = new AbortController();
    void pullRemote(browserFetch, ac.signal).then((remote) => {
      if (!remote) return;
      lastSynced.current = canonical(remote);
      setRecord((prev) => mergeRecords(prev, remote));
    });
    return () => ac.abort();
  }, [isOwner]);

  // (3) save every change once the local record has been read.
  useEffect(() => {
    if (!loaded) return;
    const storage = browserStorage();
    if (storage) saveLocal(storage, record);
  }, [loaded, record]);

  // (4) owner: debounced PUT of the merged record.
  useEffect(() => {
    if (!loaded || !isOwner) return;
    const body = canonical(record);
    if (body === lastSynced.current) return;
    const timer = setTimeout(() => {
      void pushRemote(browserFetch, record).then((merged) => {
        if (!merged) return;
        lastSynced.current = canonical(merged);
        setRecord((prev) => mergeRecords(prev, merged));
      });
    }, PUT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [loaded, isOwner, record]);

  const answer = useCallback((qid: string, choice: string, correct: boolean) => {
    setRecord((prev) => recordAnswer(prev, qid, choice, correct, Date.now()));
  }, []);
  const readUnit = useCallback((unitId: string) => {
    setRecord((prev) => markUnitRead(prev, unitId, Date.now()));
  }, []);

  const value = useMemo(() => ({ record, answer, readUnit }), [record, answer, readUnit]);
  return createElement(LearningRecordContext.Provider, { value }, children);
}

/** The page's learning record. Throws outside a LearningRecordProvider. */
export function useLearningRecord(): LearningRecordValue {
  const value = useContext(LearningRecordContext);
  if (!value) {
    throw new Error("useLearningRecord must be used inside <LearningRecordProvider>");
  }
  return value;
}
