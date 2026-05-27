import fs from "fs";
import path from "path";

const BY_YEAR = "data/ip/exams/by_year";
const OUT_FILE = "data/ip/exams/question_bank.json";

const files = fs.readdirSync(BY_YEAR)
  .filter(f => f.endsWith(".json"))
  .sort();

console.log(`Merging ${files.length} exam files from ${BY_YEAR}/\n`);

const allQuestions = [];
let totalOk = 0;

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(BY_YEAR, f), "utf-8"));
  const count = data.question_count;
  const status = count >= 95 ? "ok" : "WARN";
  console.log(`  ${data.exam_id} (${data.year_label}): ${count} questions [${status}]`);

  for (const q of data.questions) {
    allQuestions.push({
      ...q,
      year: data.year_label,
      fiscal_year: data.fiscal_year,
    });
  }

  if (count >= 95) totalOk++;
}

const bank = {
  version: "1.0",
  extracted_at: new Date().toISOString(),
  exam_count: files.length,
  question_count: allQuestions.length,
  questions: allQuestions,
};

fs.writeFileSync(OUT_FILE, JSON.stringify(bank, null, 2));

const sizeKB = Math.round(fs.statSync(OUT_FILE).size / 1024);
console.log(`\nDone: ${allQuestions.length} questions from ${files.length} exams -> ${OUT_FILE} (${sizeKB} KB)`);
console.log(`Exams with >=95 questions: ${totalOk}/${files.length}`);
