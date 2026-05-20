// Phase 2 Step 11 — server-side /glossary route that hydrates <GlossaryList />
// with GlossarySummary[] derived from the corpus glossary (908 entries).
//
// Session 43 4Q-locked design:
//   Q1=a /glossary browse page = list all 908 terms (modal-like popover on click).
//   Q3=a `?term=` (single source of truth, decoded by client useSearchParams).
//   Module C 3/4 third data point per D-094 §2.4.
//
// Glossary is eager-loaded in the boot loader (D-089 §2.1 + Session 34 Q3=b),
// so loadGlossary() is an in-memory read — no per-request disk traffic. The
// list is sorted once via Intl.Collator('ja') and handed to the client.

import { GlossaryList } from "@/components/GlossaryList";
import { getDataSource, warmUp } from "@/lib/data";
import {
  listGlossarySummaries,
  type GlossarySummary,
} from "@/lib/glossary/glossaryScope";

export const metadata = {
  title: "用語集 — IT パスポート 三語学習",
  description: "AI 解説つき用語集（α 自用 / 908 用語）",
};

// Force dynamic rendering: same reasoning as /quiz — the corpus comes from
// the deploy filesystem via FsDataSource, so pre-rendering would lock the
// snapshot. Cheap at α; the cached glossary singleton already amortises this.
export const dynamic = "force-dynamic";

async function loadGlossarySummaries(): Promise<GlossarySummary[]> {
  await warmUp();
  const ds = getDataSource();
  const glossary = await ds.loadGlossary();
  return listGlossarySummaries(glossary);
}

export default async function GlossaryPage(): Promise<React.ReactElement> {
  const summaries = await loadGlossarySummaries();
  return <GlossaryList summaries={summaries} />;
}
