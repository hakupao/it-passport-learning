// Phase 2 Step 10 — server-side /quiz route that hydrates <QuizList /> with
// QuizSummary[] derived from the corpus index + per-page entity load.
//
// Session 42 4Q-locked design:
//   Q1=a Modal triggered from quiz list, URL `?qid=` reactive backing.
//   Q3=a `?qid=` is the single source of truth; activeSummary is derived at
//        client mount via useSearchParams (no server-side qid handling here).
//   Module C 1/4 entry second data point per D-094 §2.4.
//
// Pages with questions are sparse (68 of 554 in v1.0.3); Promise.all over them
// keeps the cold-render reasonably fast for α-now. If this becomes a hot spot,
// the per-page reads can be memoized in the FsDataSource cache layer (deferred
// optimization per D-080 v1.1 §8 amend pattern).

import { QuizList } from "@/components/QuizList";
import { getDataSource, warmUp } from "@/lib/data";
import { buildQuizSummary, type QuizSummary } from "@/lib/quiz/quizScope";

export const metadata = {
  title: "問題集 — IT パスポート 三語学習",
  description: "AI 解説つき練習問題リスト（α 自用）",
};

// Force dynamic rendering: this route reads the corpus on every request via
// FsDataSource and depends on the deploy filesystem. Pre-rendering would lock
// the page snapshot into the build artifact, which is fine for α-now but blocks
// any future corpus rebuild without a redeploy. Cheap enough either way at α.
export const dynamic = "force-dynamic";

async function loadQuizSummaries(): Promise<QuizSummary[]> {
  await warmUp();
  const ds = getDataSource();
  const idx = await ds.loadIndex();

  // Build a `(page, entityIndex, questionId)` list once from the index, ordered.
  const refs = Object.entries(idx.entity_by_id)
    .filter(([, ref]) => ref.type === "question")
    .map(([questionId, ref]) => ({
      questionId,
      page: ref.page,
      entityIndex: ref.entity_index,
    }))
    .sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      return a.entityIndex - b.entityIndex;
    });

  // Group by page so we load each Page JSON at most once.
  const uniquePages = Array.from(new Set(refs.map((r) => r.page)));
  const pageEntries = await Promise.all(
    uniquePages.map(async (p) => [p, await ds.loadPage(p)] as const),
  );
  const pageById = new Map(pageEntries);

  const summaries: QuizSummary[] = [];
  for (const ref of refs) {
    const page = pageById.get(ref.page);
    if (!page) continue;
    const summary = buildQuizSummary(ref.questionId, page, ref.entityIndex);
    if (summary) summaries.push(summary);
  }
  return summaries;
}

export default async function QuizPage(): Promise<React.ReactElement> {
  const summaries = await loadQuizSummaries();
  return <QuizList summaries={summaries} />;
}
