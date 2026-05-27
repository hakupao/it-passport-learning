/**
 * fix-p0-cleanup.mjs
 *
 * P0 programmatic fixes (no API needed):
 * 1. Convert ghost Q109 → Q100 (if no Q100 exists)
 * 2. Remove exam-instruction Q100 entries (fake questions)
 * 3. Reconstruct Q100 from P1 bleeding absorbed content (Q99 was truncated)
 */

import fs from "fs";
import path from "path";

const BY_YEAR_DIR = "data/ip/exams/by_year";
const BANK_PATH = "data/ip/exams/question_bank.json";

const changeLog = [];

function log(action, detail) {
  changeLog.push({ action, detail });
  console.log(`  ${action}: ${detail}`);
}

function isExamInstructions(text) {
  return /選択方法\s+全[問間]必須/.test(text) || /注意事項\s+1\.\s*問題に関する質問/.test(text);
}

function processFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const examId = data.exam_id;
  let questions = data.questions;
  let modified = false;

  // 1. Handle ghost Q109 → Q100
  const q109 = questions.find(q => q.question_number === 109);
  const q100exists = questions.some(q => q.question_number === 100);

  if (q109) {
    if (!q100exists && q109.stem_jp.length > 10 && !isExamInstructions(q109.stem_jp)) {
      q109.question_number = 100;
      q109.id = `${examId}-q100`;
      log("ghost→q100", `${examId}: q109 renamed to q100, stem="${q109.stem_jp.slice(0, 60)}..."`);
      modified = true;
    } else {
      questions = questions.filter(q => q.question_number !== 109);
      log("ghost-removed", `${examId}: q109 deleted`);
      modified = true;
    }
  }

  // 2. Remove exam-instruction Q100
  const q100 = questions.find(q => q.question_number === 100);
  if (q100 && isExamInstructions(q100.stem_jp)) {
    questions = questions.filter(q => q.question_number !== 100);
    log("fake-q100-removed", `${examId}: exam-instruction Q100 deleted`);
    modified = true;
  }

  // Update question_count
  data.questions = questions;
  data.question_count = questions.length;

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }
  return modified;
}

function regenerateQuestionBank() {
  const examOrder = [
    "2009h21h", "2009h21a", "2010h22h", "2010h22a",
    "2011h23tokubetsu", "2011h23a", "2012h24h", "2012h24a",
    "2013h25h", "2013h25a", "2014h26h", "2014h26a",
    "2015h27h", "2015h27a", "2016h28h", "2016h28a",
    "2017h29h", "2017h29a", "2018h30h", "2018h30a",
    "2019h31h", "2019r01a", "2020r02o", "2021r03",
    "2022r04", "2023r05", "2024r06", "2025r07", "2026r08",
  ];

  const allQuestions = [];
  for (const eid of examOrder) {
    const fp = path.join(BY_YEAR_DIR, `${eid}.json`);
    if (!fs.existsSync(fp)) continue;
    const d = JSON.parse(fs.readFileSync(fp, "utf-8"));
    allQuestions.push(...d.questions);
  }

  const bank = {
    version: "2.1-p0-cleaned",
    extracted_at: new Date().toISOString(),
    exam_count: examOrder.length,
    question_count: allQuestions.length,
    questions: allQuestions,
  };
  fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2), "utf-8");
  return allQuestions.length;
}

function main() {
  console.log("P0 Cleanup (ghost questions + fake Q100 removal)");

  const files = fs.readdirSync(BY_YEAR_DIR).filter(f => f.endsWith(".json") && !f.startsWith("."));
  for (const f of files) {
    const fp = path.join(BY_YEAR_DIR, f);
    processFile(fp);
  }

  const totalQ = regenerateQuestionBank();

  console.log(`\n=== Summary ===`);
  console.log(`Changes: ${changeLog.length}`);
  console.log(`Total questions after cleanup: ${totalQ}`);
}

main();
