// D-180 §0-6/§0-7 / D-190 — learning-record (v2) state for one page.
//
// `LearningRecordProvider` is mounted per page (quiz set + landing, textbook
// TOC + unit reader), never in the locale layout: the owner flag comes
// from cookies, and reading cookies in the layout would make every page dynamic.
// Two contexts: the record (changes on every answer) and the actions (stable
// identities). Write-only islands use `useLearningActions()` and do not
// re-render when the record changes; readers use `useLearningRecord()`.
//
// Lifecycle:
//   1. First render uses emptyRecord() on server and client (no hydration
//      mismatch); after mount the localStorage record is merged in
//      (itp:learn:v2 plus, read-only, the itp:learn:v1 an old tab may still
//      write, upgraded with now = Date.now()).
//   2. Owner only: GET /api/learning?v=2 once and merge the server copy in.
//   3. Every change after (1) is saved with saveLocal (v2 key only), which
//      merges with what is stored (another tab may have written since); other
//      tabs' writes (v2 key, or an old tab's v1 key) are merged in through the
//      window "storage" event.
//   4. Owner only, once the GET has settled (success or failure): 2000 ms after
//      the last change, PUT the merged record when it differs from what the
//      server last returned, then merge the response back. The response equals
//      `lastSynced`, so merging it schedules no new PUT unless something changed
//      meanwhile (no ping-pong). Merging a GET / PUT response that adds nothing
//      keeps the same record object (mergeIfChanged), so readers do not re-render.
//      While the server still holds only the old v1 doc, each GET upgrades it
//      with the request time (a later v2Since than the local one); merging keeps
//      the earliest, so that costs one PUT, which moves the doc to v2 — after
//      that the response equals the record (pinned in v2ClientCompat.test.ts).
//   5. Owner only, same gate as (4): when the page is hidden (visibilitychange →
//      hidden, or pagehide) and the record differs from `lastSynced`, the pending
//      debounce is cancelled and the change is sent at once — only the delta since
//      `lastSynced`, with keepalive so it survives unload (falls back to a plain
//      full PUT when the delta is over the keepalive size cap; hideFlushPlan).
//      Answers the server still has not seen (a failed flush) go up on the next
//      change or the next page load, right after the GET.
// `loaded` (as exposed to readers) is false for an owner until the GET has
// settled too, so progress islands never flash local-only counts on a new device.
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

import { applyStorageEvent, loadLocal, saveLocal } from "@/lib/learning/localStore";
import {
  canonicalJson,
  emptyRecord,
  markUnitRead,
  mergeIfChanged,
  mergeRecords,
  recordAttempt,
  setSetting,
  type ChoiceLetter,
  type LearningRecord,
  type SettingKey,
  type SettingValue,
} from "@/lib/learning/record";
import {
  hideFlushPlan,
  onPageHide,
  pullRemote,
  pushRemote,
  type FetchLike,
} from "@/lib/learning/syncClient";
import type { StorageLike } from "@/lib/storage";

export const PUT_DEBOUNCE_MS = 2000;

export interface LearningActions {
  /** Store an attempt at Date.now() (src "practice" unless given). */
  answer(qid: string, choice: ChoiceLetter, correct: boolean, src?: "practice" | "mock"): void;
  /** Record the first read of a unit (an existing value is kept). */
  readUnit(unitId: string): void;
  /** Set a setting, last-writer-wins (numbers clamped; see record.setSetting). */
  setSetting<K extends SettingKey>(key: K, value: SettingValue<K>): void;
}

/**
 * The provider's actions over a state updater and a clock (the provider passes
 * its setRecord and Date.now). Every action is one functional update.
 */
export function makeLearningActions(
  update: (fn: (prev: LearningRecord) => LearningRecord) => void,
  now: () => number,
): LearningActions {
  return {
    answer: (qid, choice, correct, src = "practice") =>
      update((prev) => recordAttempt(prev, qid, choice, correct, now(), src)),
    readUnit: (unitId) => update((prev) => markUnitRead(prev, unitId, now())),
    setSetting: (key, value) => update((prev) => setSetting(prev, key, value, now())),
  };
}

export interface LearningRecordValue extends LearningActions {
  record: LearningRecord;
  /**
   * False until the localStorage record has been merged in and, for the owner,
   * the initial GET /api/learning has settled (always false during SSR).
   */
  loaded: boolean;
}

interface RecordState {
  record: LearningRecord;
  loaded: boolean;
}

const RecordContext = createContext<RecordState | null>(null);
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

/** The `loaded` flag readers see: an owner also waits for the initial GET to settle. */
export function exposedLoaded(localLoaded: boolean, isOwner: boolean, remoteSettled: boolean): boolean {
  return localLoaded && (!isOwner || remoteSettled);
}

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
  /** The record the server last returned (and its canonical JSON); null = not synced yet. */
  const lastSynced = useRef<LearningRecord | null>(null);
  const lastSyncedJson = useRef<string | null>(null);
  /** The committed record, for the page-hide handler. */
  const recordRef = useRef(record);
  /** Pending debounced PUT; the page-hide flush cancels it. */
  const putTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Canonical JSON of the record a page-hide flush is sending (dedupes visibilitychange + pagehide). */
  const hideInFlight = useRef<string | null>(null);

  /** A server response (GET or PUT): remember it as synced and merge it in. */
  const applyRemote = useCallback((remote: LearningRecord) => {
    lastSynced.current = remote;
    lastSyncedJson.current = canonicalJson(remote);
    setRecord((prev) => mergeIfChanged(prev, remote));
  }, []);

  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  // (1) + (2): local load, then the owner's server copy.
  useEffect(() => {
    const storage = browserStorage();
    const local = storage ? loadLocal(storage, Date.now()) : emptyRecord();
    setRecord((prev) => mergeRecords(prev, local));
    setLoaded(true);
    if (!isOwner) return;
    const ac = new AbortController();
    void pullRemote(browserFetch, ac.signal).then((remote) => {
      if (ac.signal.aborted) return;
      if (remote) applyRemote(remote);
      setRemoteSettled(true);
    });
    return () => ac.abort();
  }, [isOwner, applyRemote]);

  // (3a) other tabs' writes.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== browserStorage()) return;
      const now = Date.now();
      setRecord((prev) => applyStorageEvent(prev, e, now));
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
    if (canonicalJson(record) === lastSyncedJson.current) return;
    putTimer.current = setTimeout(() => {
      putTimer.current = null;
      void pushRemote(browserFetch, record).then((merged) => {
        if (merged) applyRemote(merged);
      });
    }, PUT_DEBOUNCE_MS);
    return () => {
      if (putTimer.current !== null) clearTimeout(putTimer.current);
      putTimer.current = null;
    };
  }, [loaded, isOwner, remoteSettled, record, applyRemote]);

  // (5) owner: flush the unsynced delta when the page is hidden.
  useEffect(() => {
    if (!loaded || !isOwner || !remoteSettled) return;
    return onPageHide(window, document, () => {
      const current = recordRef.current;
      const json = canonicalJson(current);
      if (json === lastSyncedJson.current || json === hideInFlight.current) return;
      if (putTimer.current !== null) clearTimeout(putTimer.current);
      putTimer.current = null;
      const plan = hideFlushPlan(current, lastSynced.current);
      hideInFlight.current = json;
      void pushRemote(browserFetch, plan.record, { keepalive: plan.keepalive }).then((merged) => {
        hideInFlight.current = null;
        if (merged) applyRemote(merged);
      });
    });
  }, [loaded, isOwner, remoteSettled, applyRemote]);

  const actions = useMemo<LearningActions>(() => makeLearningActions(setRecord, () => Date.now()), []);

  const readersLoaded = exposedLoaded(loaded, isOwner, remoteSettled);
  const state = useMemo<RecordState>(
    () => ({ record, loaded: readersLoaded }),
    [record, readersLoaded],
  );

  return createElement(
    ActionsContext.Provider,
    { value: actions },
    createElement(RecordContext.Provider, { value: state }, children),
  );
}

const OUTSIDE = "must be used inside <LearningRecordProvider>";

/** Stable answer / readUnit / setSetting; does not re-render on record changes. Throws outside the provider. */
export function useLearningActions(): LearningActions {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error(`useLearningActions ${OUTSIDE}`);
  return actions;
}

/** The page's learning record, its loaded flag and the actions. Throws outside a LearningRecordProvider. */
export function useLearningRecord(): LearningRecordValue {
  const state = useContext(RecordContext);
  const actions = useContext(ActionsContext);
  if (!state || !actions) throw new Error(`useLearningRecord ${OUTSIDE}`);
  return { ...state, ...actions };
}
