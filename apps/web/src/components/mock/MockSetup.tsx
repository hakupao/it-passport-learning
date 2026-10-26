// Stage 7 Phase 2 Task 4 (DESIGN §6.7 / D-192 ③ / D-193 §0-2 / §0-4) — /mock: choose the mock.
//
//   - An unfinished mock in this browser (localStorage MOCK_STORAGE_KEY, read after mount — never in
//     the first render): 「続ける（残り N 分）」 → its exam page; one that ran out or ended without
//     being written to the record (owesRecord): 「結果を見る」 first (opening it records it, D-192 ①);
//     「記録せずに破棄」 only behind an in-page confirmation (MockDiscard — the escape when the save
//     cannot be opened any more, fix round 2). A running one offers 「破棄して新しく始める」 at once —
//     re-checked at the click: one that ran out while the page sat open goes to the owed view. Until
//     the save is gone the new-mock choices are not shown (one mock at a time).
//   - ランダム 100 問: drawRandomMock(record, pool, categoryOf, seed = Date.now(), preferUnanswered) in
//     the browser (it reads the record, so the button waits for it to load) → /mock/run?ids=….
//     Fewer than 100 drawn → a status line, no navigation.
//   - 過去の 1 回分: every exam, newest first → /mock/run?exam=….
//   Starting removes whatever mock is stored (a finished one would otherwise come back as the
//   result of the same URL).
//   Every click that removes (start, both discards) re-reads storage first (final fix I-2): when it
//   no longer holds what this view was built for — another tab started a mock, or the save changed
//   from running to owed — the view switches to what is there and nothing is removed.

"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link, useRouter } from "@/i18n/navigation";
import { drawRandomMock, MOCK_N, remainingMs, type MockCategory } from "@/lib/mock/mockModel";
import { mockRunHref, scopeOfMock } from "@/lib/mock/mockScope";
import { MOCK_STORAGE_KEY, owesRecord, parseMock, sameSave, type MockState } from "@/lib/mock/mockStore";
import { poolFromIndex, type TodayIndex } from "@/lib/practice/practiceIndex";

import { MockDiscard } from "./MockDiscard";
import styles from "./mock.module.css";

export interface MockSetupProps {
  /** the setup payload (loadSetupIndex): topics with their area, question ids, chumon groups */
  index: TodayIndex;
  /** every exam, newest first */
  exams: { id: string; label: string; n: number }[];
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

const readNow = (): MockState | null => parseMock(storage()?.getItem(MOCK_STORAGE_KEY) ?? null);

/** The stored mock this page offers (finished + recorded counts as nothing stored). */
const pendingNow = (): MockState | null => {
  const s = readNow();
  return s && !(s.endedAt !== null && s.recorded) ? s : null;
};

export function MockSetup({ index, exams }: MockSetupProps): React.ReactElement {
  const t = useTranslations("Mock");
  const router = useRouter();
  const { record, loaded } = useLearningRecord();
  /** undefined = not read yet */
  const [stored, setStored] = useState<MockState | null | undefined>(undefined);
  const [preferUnanswered, setPreferUnanswered] = useState(true);
  const [failed, setFailed] = useState(false);

  const pool = useMemo(() => poolFromIndex(index), [index]);
  const categoryOf = useMemo(() => {
    const m = new Map<string, MockCategory>();
    for (const tp of index.topics) {
      for (const id of index.topicQuestionIds[tp.id] ?? []) m.set(id, tp.category as MockCategory);
    }
    return m;
  }, [index]);

  useEffect(() => {
    setStored(pendingNow());
  }, []);

  const start = (href: string): void => {
    const s = pendingNow();
    if (s) return setStored(s); // a mock was saved meanwhile (another tab): offer it, never remove it
    try {
      storage()?.removeItem(MOCK_STORAGE_KEY);
    } catch {
      // storage unavailable: the exam page starts in memory
    }
    router.push(href);
  };

  const startRandom = (): void => {
    if (!loaded) return;
    const ids = drawRandomMock(record, pool, categoryOf, Date.now(), preferUnanswered);
    if (ids.length !== MOCK_N) return setFailed(true);
    start(mockRunHref({ kind: "random", ids }));
  };

  /**
   * Remove `seen` (shown as owed or as running) — only if storage still holds it in that state;
   * otherwise (it ran out, another tab replaced or recorded it) the view switches to what is there.
   */
  const discardSeen = (seen: MockState, owed: boolean): void => {
    const s = pendingNow();
    if (!s || !sameSave(s, seen) || owesRecord(s, Date.now()) !== owed) return setStored(s);
    try {
      storage()?.removeItem(MOCK_STORAGE_KEY);
    } catch {
      // nothing stored to discard
    }
    setStored(null);
  };

  const now = Date.now();
  const left = stored && stored.endedAt === null ? remainingMs(stored.startedAt, now) : 0;
  /** finished / past its deadline but not recorded: only 「結果を見る」 (opening it records), no discard */
  const owes = stored ? owesRecord(stored, now) : false;

  return (
    <main className={styles.page} data-mock-setup="">
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.lead}>{t("setupLead")}</p>

      {stored === undefined ? (
        <p className={styles.muted} data-pending="">
          {t("loading")}
        </p>
      ) : stored ? (
        <section className={styles.resume} aria-labelledby="mock-resume-title" data-resume="">
          <h2 id="mock-resume-title" className={styles.confirmTitle}>
            {t("resumeTitle")}
          </h2>
          <div className={styles.actions}>
            <Link href={mockRunHref(scopeOfMock(stored))} className={styles.btnPrimary} data-resume-link="">
              {owes ? t("resumeResult") : t("resume", { min: Math.ceil(left / 60_000) })}
            </Link>
            {owes ? (
              <MockDiscard key={stored.startedAt} onDiscard={() => discardSeen(stored, true)} />
            ) : (
              <button
                type="button"
                className={styles.btn}
                onClick={() => discardSeen(stored, false)}
                data-discard-running=""
              >
                {t("abandon")}
              </button>
            )}
          </div>
        </section>
      ) : (
        <>
          <h2 className={styles.h2}>{t("randomTitle")}</h2>
          <p className={styles.muted}>{t("randomLead")}</p>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={preferUnanswered}
              onChange={() => setPreferUnanswered(!preferUnanswered)}
              data-prefer-unanswered=""
            />
            <span>{t("preferUnanswered")}</span>
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.btnPrimary} disabled={!loaded} onClick={startRandom} data-start-random="">
              {t("startRandom")}
            </button>
          </div>
          <p className={styles.message} role="status">
            {!loaded ? t("waitRecord") : failed ? t("drawFailed") : null}
          </p>

          <h2 className={styles.h2}>{t("examTitle")}</h2>
          <p className={styles.muted}>{t("examLead")}</p>
          <ul className={styles.exams}>
            {exams.map((e) => (
              <li key={e.id} className={styles.examRow} data-exam={e.id}>
                <span className={styles.examLabel} lang="ja">
                  {e.label}
                </span>
                <span className={styles.num}>{t("questionsN", { n: e.n })}</span>
                <button
                  type="button"
                  className={styles.barBtn}
                  onClick={() => start(mockRunHref({ kind: "exam", examId: e.id }))}
                  data-start-exam={e.id}
                >
                  {t("examStart")}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
