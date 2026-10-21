// D-180 §0-6/§0-7 — learning-record state for one page.
//
// `LearningRecordProvider` is mounted per page (quiz set today; Task 12 adds
// the landing / textbook TOC), never in the locale layout: the owner flag comes
// from cookies, and reading cookies in the layout would make every page dynamic.
// Two contexts: the record (changes on every answer) and the actions (stable
// identities). Write-only islands use `useLearningActions()` and do not
// re-render when the record changes; readers use `useLearningRecord()`.
//
// Lifecycle:
//   1. First render uses emptyRecord() on server and client (no hydration
//      mismatch); after mount the localStorage record is merged in.
//   2. Owner only: GET /api/learning once and merge the server copy in.
//   3. Every change after (1) is saved with saveLocal, which merges with what
//      is stored (another tab may have written since); other tabs' writes are
//      merged in through the window "storage" event.
//   4. Owner only, once the GET has settled (success or failure): 2000 ms after
//      the last change, PUT the merged record when it differs from what the
//      server last returned, then merge the response back. The response equals
//      `lastSynced`, so merging it schedules no new PUT unless something changed
//      meanwhile (no ping-pong); answers the server has not seen yet (e.g. a PUT
//      lost to navigation) go up on the next page load, right after the GET.
// Network failure → console.warn only (syncClient); local keeps working.

"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { applyStorageEvent, loadLocal, saveLocal } from "@/lib/learning/localStore";
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

export interface LearningActions {
  answer(qid: string, choice: string, correct: boolean): void;
  readUnit(unitId: string): void;
}

export interface LearningRecordValue extends LearningActions {
  record: LearningRecord;
}

const RecordContext = createContext<LearningRecord | null>(null);
const ActionsContext = createContext<LearningActions | null>(null);

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
  /** Owner: the initial GET has finished (either way); PUTs wait for it. */
  const [remoteSettled, setRemoteSettled] = useState(false);
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
      if (ac.signal.aborted) return;
      if (remote) {
        lastSynced.current = canonical(remote);
        setRecord((prev) => mergeRecords(prev, remote));
      }
      setRemoteSettled(true);
    });
    return () => ac.abort();
  }, [isOwner]);

  // (3a) other tabs' writes.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== browserStorage()) return;
      setRecord((prev) => applyStorageEvent(prev, e));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // (3b) save every change once the local record has been read.
  useEffect(() => {
    if (!loaded) return;
    const storage = browserStorage();
    if (storage) saveLocal(storage, record);
  }, [loaded, record]);

  // (4) owner: debounced PUT of the merged record, after the initial GET.
  useEffect(() => {
    if (!loaded || !isOwner || !remoteSettled) return;
    if (canonical(record) === lastSynced.current) return;
    const timer = setTimeout(() => {
      void pushRemote(browserFetch, record).then((merged) => {
        if (!merged) return;
        lastSynced.current = canonical(merged);
        setRecord((prev) => mergeRecords(prev, merged));
      });
    }, PUT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [loaded, isOwner, remoteSettled, record]);

  const actions = useMemo<LearningActions>(
    () => ({
      answer: (qid, choice, correct) =>
        setRecord((prev) => recordAnswer(prev, qid, choice, correct, Date.now())),
      readUnit: (unitId) => setRecord((prev) => markUnitRead(prev, unitId, Date.now())),
    }),
    [],
  );

  return createElement(
    ActionsContext.Provider,
    { value: actions },
    createElement(RecordContext.Provider, { value: record }, children),
  );
}

const OUTSIDE = "must be used inside <LearningRecordProvider>";

/** Stable answer / readUnit; does not re-render on record changes. Throws outside the provider. */
export function useLearningActions(): LearningActions {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error(`useLearningActions ${OUTSIDE}`);
  return actions;
}

/** The page's learning record plus the actions. Throws outside a LearningRecordProvider. */
export function useLearningRecord(): LearningRecordValue {
  const record = useContext(RecordContext);
  const actions = useContext(ActionsContext);
  if (!record || !actions) throw new Error(`useLearningRecord ${OUTSIDE}`);
  return { record, ...actions };
}
