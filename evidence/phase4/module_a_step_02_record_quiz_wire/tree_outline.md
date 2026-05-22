# Phase 4 Module A Step A.2 — Wire recordQuizAnswer into QuizExplain

> Whole-module-1-sitting context: A.1 + A.2 + A.3 all landed Session 54.
> Build-time gates fired once at module close — see
> `evidence/phase4/module_a_step_03_load_tutor_context/{build_log.txt,test_results.txt}`.

## Files changed (A.2)

```
MOD (6):
  apps/web/src/lib/book/progressStore.ts                   (+ persistQuizOutcome helper at file end; +29 lines)
  apps/web/src/lib/book/__tests__/progressStore.test.ts    (+ persistQuizOutcome import + 4 cases; +43 lines)
  apps/web/src/components/QuizExplain.tsx                  (+ loadProgress/persistQuizOutcome import; + selfReport state; + 2 effects + handler; + footer self-report UI block; +90 lines)
  apps/web/messages/ja.json                                (+ 3 keys: selfReportPrompt + selfReportCorrect + selfReportWrong)
  apps/web/messages/zh.json                                (+ same 3 keys, zh translations)
  apps/web/messages/en.json                                (+ same 3 keys, en translations)
```

## Public surface added (A.2)

| Symbol | Kind | Purpose |
|---|---|---|
| `persistQuizOutcome(storage, qid, correct, key?)` | fn | Composite wrapper: load → recordQuizAnswer → save → returns new BookProgress |

## QuizExplain.tsx surface changes

- **State added**: `selfReport: "unset" \| "correct" \| "wrong"` (1 useState slot)
- **Effects added**: 1 new useEffect rehydrating `selfReport` from progressStore on summary change
- **Callbacks added**: `handleSelfReport(correct: boolean)` (1 useCallback)
- **UI added**: footer self-report block (3 i18n keys; 2 buttons with aria-pressed; emerald/amber states)
- **Lifecycle preserved**: no changes to existing SSE stream effects, focus trap, ESC handling, scroll lock — D-085 §2.4 frozen contract honored

## i18n keys added (3 per locale × 3 locales = 9 keys)

| Key | ja | zh | en |
|---|---|---|---|
| `QuizExplain.selfReportPrompt` | 解説を読む前、正解できましたか？ | 看解释前，你答对了吗？ | Before reading the explanation, how did you do? |
| `QuizExplain.selfReportCorrect` | 正解だった | 我答对了 | I got it right |
| `QuizExplain.selfReportWrong` | 間違えた | 我答错了 | I got it wrong |

## Dependency direction

```
QuizExplain ───imports──► book/progressStore (Phase 3) loadProgress + persistQuizOutcome
            └──imports──► quiz/quizSseTransport (Phase 2, untouched)
            └──imports──► a11y/useFocusTrap (Phase 2, untouched)
```

## What stays untouched

- D-085 §2.4 frozen QuizExplain modal lifecycle contract (open / explain / close cycle preserved; self-report is a leaf addition inside the scrollable body, NOT in the modal-frame footer with close/retry)
- `streamQuizExplain` callbacks: onDelta / onUsage / onError / onComplete (unchanged)
- Focus trap engagement on `summary !== null` (unchanged)
- ESC dismissal + scroll lock (unchanged)
- `requestSeqRef` race-protection invariant (unchanged)
- `/api/quiz/explain` route handler (unchanged)
- `QuizList.tsx` (unchanged — self-report is QuizExplain-internal)
