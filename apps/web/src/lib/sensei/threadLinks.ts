// D-181 Task A5 — where a saved AI 先生 thread links back to on /sensei.
// A question thread's anchorId is `<question_id>:<choice|reveal>` (QuizSet); a
// question_id is `<exam_id>-q<NNN>` (data/ip/quiz/questions.json: lowercase
// letters and digits, e.g. 2009h21a, 2011h23tokubetsu, 2021r03). Anything else
// parses as null and the row is shown without a link.
//
// Phase B: a review thread's anchorId is `<topic_id>:<YYYY-MM-DD>` (the learner's
// local date: one review thread per topic per day); a topic_id is
// `<category>-<NN>-<NN>` (quiz_index.json, e.g. technology-14-36). Its row links
// back to the topic set with the thread's date (`&thread=<YYYY-MM-DD>`, never
// `review=1`): the set page opens that dated thread without sending anything, so a
// past day's review stays reachable.

import { isValidTermId } from "@/lib/glossary/termId";

const QUESTION_ID = /^([0-9a-z]+)-q\d+$/;

export function splitQuestionAnchor(anchorId: string): { questionId: string; examId: string } | null {
  const colon = anchorId.lastIndexOf(":");
  if (colon <= 0 || colon === anchorId.length - 1) return null;
  const questionId = anchorId.slice(0, colon);
  const m = QUESTION_ID.exec(questionId);
  return m ? { questionId, examId: m[1]! } : null;
}

/** `/quiz?mode=exam&id=<exam_id>#<question_id>` (locale-less, for the i18n Link), or null. */
export function questionThreadHref(anchorId: string): string | null {
  const parsed = splitQuestionAnchor(anchorId);
  if (!parsed) return null;
  return `/quiz?mode=exam&id=${encodeURIComponent(parsed.examId)}#${parsed.questionId}`;
}


const TOPIC_ID = /^[a-z]+-\d{2}-\d{2}$/;
const LOCAL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The topic set's query parameter naming a review thread's date. */
export const REVIEW_THREAD_PARAM = "thread";

/** `<topic_id>:<YYYY-MM-DD>` in the local time zone of `now`. */
export function reviewAnchorId(topicId: string, now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${topicId}:${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** `value` when it is a real calendar date `YYYY-MM-DD` (year ≥ 1), else null. */
export function reviewThreadDate(value: string | null | undefined): string | null {
  const m = value ? LOCAL_DATE.exec(value) : null;
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(2000, mo - 1, d));
  date.setUTCFullYear(y);
  return y >= 1 && date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d ? value! : null;
}

/** `/quiz?mode=topic&id=<topic_id>&thread=<YYYY-MM-DD>` (locale-less, for the i18n Link), or null. */
export function reviewThreadHref(anchorId: string): string | null {
  const colon = anchorId.lastIndexOf(":");
  if (colon <= 0) return null;
  const topicId = anchorId.slice(0, colon);
  const date = reviewThreadDate(anchorId.slice(colon + 1));
  if (!TOPIC_ID.test(topicId) || !date) return null;
  return `/quiz?mode=topic&id=${encodeURIComponent(topicId)}&${REVIEW_THREAD_PARAM}=${date}`;
}


// Phase C: a term thread's anchorId is the termId (`t` + 16 hex, termId.ts); a unit
// thread's is the unit id (`<category>-<NN>-<NN>-u<NN>`, data/ip/textbook/units).
// Their rows link back to the glossary term page and the textbook unit page.

const UNIT_ID = /^[a-z]+-\d{2}-\d{2}-u\d{2}$/;

/** `/glossary/<termId>` (locale-less, for the i18n Link), or null. */
export function termThreadHref(anchorId: string): string | null {
  return isValidTermId(anchorId) ? `/glossary/${anchorId}` : null;
}

/** `/textbook/<unitId>` (locale-less, for the i18n Link), or null. */
export function unitThreadHref(anchorId: string): string | null {
  return UNIT_ID.test(anchorId) ? `/textbook/${anchorId}` : null;
}
