// Stage 7 Phase 1 Task 13 (DESIGN §4, D-190 §0-17) — where a legacy /quiz URL lands. Pure, so the
// /quiz client redirect page (which alone sees the `#<question_id>` fragment) and its tests share it.
// Locale-less (for the i18n router). Ids are only shape-checked here (the page is static, no data):
// an unknown but well-shaped topic 404s on the topic page, an unknown exam is dropped by the setup
// prefill, an unknown question 404s on the single-question page.
//
//   #<question_id>                      → /practice/q/<question_id>
//   ?mode=topic&id=X&thread=<date>      → /practice/browse/X?thread=<date>   (wins over review=1)
//   ?mode=topic&id=X&review=1           → /practice/browse/X?review=1        (no review intent is
//                                          written: a bookmark only opens the panel, D-181 Phase B)
//   ?mode=topic&id=X                    → /practice?topic=X&prefill=1        (setup panel, prefilled)
//   ?mode=exam&id=Y                     → /practice?exam=Y&prefill=1
//   anything else                       → /practice/browse

import { QUESTION_ID } from "@/lib/quiz/questionId";
import { REVIEW_THREAD_PARAM, reviewThreadDate, TOPIC_ID } from "@/lib/sensei/threadLinks";

const EXAM_ID = /^[0-9a-z]{4,16}$/;

const BROWSE = "/practice/browse";

export function legacyQuizTarget(search: string, hash: string): string {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  if (QUESTION_ID.test(fragment)) return `/practice/q/${fragment}`;

  const sp = new URLSearchParams(search);
  const mode = sp.get("mode");
  const id = sp.get("id") ?? "";
  if (mode === "topic" && TOPIC_ID.test(id)) {
    const date = reviewThreadDate(sp.get(REVIEW_THREAD_PARAM));
    if (date) return `/practice/browse/${id}?${REVIEW_THREAD_PARAM}=${date}`;
    if (sp.get("review") === "1") return `/practice/browse/${id}?review=1`;
    return `/practice?topic=${id}&prefill=1`;
  }
  if (mode === "exam" && EXAM_ID.test(id)) return `/practice?exam=${id}&prefill=1`;
  return BROWSE;
}
