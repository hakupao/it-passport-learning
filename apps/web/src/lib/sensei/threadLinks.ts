// D-181 Task A5 — where a saved AI 先生 thread links back to on /sensei.
// A question thread's anchorId is `<question_id>:<choice|reveal>` (QuizSet); a
// question_id is `<exam_id>-q<NNN>` (data/ip/quiz/questions.json: lowercase
// letters and digits, e.g. 2009h21a, 2011h23tokubetsu, 2021r03). Anything else
// parses as null and the row is shown without a link.

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
