// Stage 7 Phase 1 Task 14 — the one shape check for a question id, `<exam_id>-q<NNN>`
// (data/ip/quiz/questions.json: an exam id of 4–16 lowercase letters / digits, e.g. 2009h21a,
// 2011h23tokubetsu, 2021r03, then a 3-digit number; all 2900 ids match). Pure, client-safe.
// Used where an id arrives from outside: a legacy `/quiz#<question_id>` link, a saved AI 先生
// thread's anchor, the /practice/q/<qid> route, a `#<question_id>` link in an AI 先生 reply.
// (The feedback API keeps its own stricter-year check, lib/quiz/feedbackModel QUESTION_ID_RE.)

export const QUESTION_ID = /^[0-9a-z]{4,16}-q\d{3}$/;
