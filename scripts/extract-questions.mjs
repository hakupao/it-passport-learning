import Anthropic from "@anthropic-ai/sdk";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const envFile = fs.readFileSync("apps/web/.env.local", "utf-8");
const apiKey = envFile.match(/ANTHROPIC_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) throw new Error("ANTHROPIC_API_KEY not found");

const client = new Anthropic({ apiKey });

const EXAMS = [
  { id: "2009h21h", label: "平成21年度春期", fy: 2009 },
  { id: "2009h21a", label: "平成21年度秋期", fy: 2009 },
  { id: "2010h22h", label: "平成22年度春期", fy: 2010 },
  { id: "2010h22a", label: "平成22年度秋期", fy: 2010 },
  { id: "2011h23tokubetsu", label: "平成23年度特別", fy: 2011 },
  { id: "2011h23a", label: "平成23年度秋期", fy: 2011 },
  { id: "2012h24h", label: "平成24年度春期", fy: 2012 },
  { id: "2012h24a", label: "平成24年度秋期", fy: 2012 },
  { id: "2013h25h", label: "平成25年度春期", fy: 2013 },
  { id: "2013h25a", label: "平成25年度秋期", fy: 2013 },
  { id: "2014h26h", label: "平成26年度春期", fy: 2014 },
  { id: "2014h26a", label: "平成26年度秋期", fy: 2014 },
  { id: "2015h27h", label: "平成27年度春期", fy: 2015 },
  { id: "2015h27a", label: "平成27年度秋期", fy: 2015 },
  { id: "2016h28h", label: "平成28年度春期", fy: 2016 },
  { id: "2016h28a", label: "平成28年度秋期", fy: 2016 },
  { id: "2017h29h", label: "平成29年度春期", fy: 2017 },
  { id: "2017h29a", label: "平成29年度秋期", fy: 2017 },
  { id: "2018h30h", label: "平成30年度春期", fy: 2018 },
  { id: "2018h30a", label: "平成30年度秋期", fy: 2018 },
  { id: "2019h31h", label: "平成31年度春期", fy: 2019 },
  { id: "2019r01a", label: "令和元年度秋期", fy: 2019 },
  { id: "2020r02o", label: "令和2年度", fy: 2020 },
  { id: "2021r03", label: "令和3年度", fy: 2021 },
  { id: "2022r04", label: "令和4年度", fy: 2022 },
  { id: "2023r05", label: "令和5年度", fy: 2023 },
  { id: "2024r06", label: "令和6年度", fy: 2024 },
  { id: "2025r07", label: "令和7年度", fy: 2025 },
  { id: "2026r08", label: "令和8年度", fy: 2026 },
];

const SOURCES = "data/ip/sources/exams";
const OUT_DIR = "data/ip/exams/by_year";
const ANSWER_KEYS = JSON.parse(fs.readFileSync("data/ip/exams/answer_keys.json", "utf-8"));
const BATCH_SIZE = 12;
const MODEL = "claude-sonnet-4-6-20250514";

const PROMPT = `Extract ALL IT Passport exam questions visible in these pages.

Return a JSON array. Each element:
{
  "question_number": <integer>,
  "stem_jp": "<full question text in Japanese, include sub-items a/b/c/d if any, use \\n for line breaks>",
  "choices_jp": {"ア": "...", "イ": "...", "ウ": "...", "エ": "..."},
  "has_figure": <true if question has diagram/table/chart/image>,
  "figure_description": "<brief Japanese description of figure, or null>"
}

Rules:
- Transcribe the EXACT Japanese text from the PDF. Do not translate or paraphrase.
- For stem_jp: include all condition text, sub-items, tables described in words.
- For figures/tables embedded in the question: set has_figure=true, describe the figure briefly.
- For 中問 (composite questions with shared scenario): prefix each sub-question's stem with the shared scenario.
- Output ONLY the JSON array. No markdown fences, no explanation, no extra text.
- If a page has no questions (cover page, appendix), return empty array [].`;

async function extractBatch(pageImages) {
  const content = [
    ...pageImages.map((img) => ({
      type: "image",
      source: { type: "base64", media_type: "image/png", data: img },
    })),
    { type: "text", text: PROMPT },
  ];

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    messages: [{ role: "user", content }],
  });

  const text = resp.content[0].type === "text" ? resp.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\[[\s\S]*\]/);
    if (m) return JSON.parse(m[0]);
    console.error("  JSON parse failed, raw:", text.slice(0, 200));
    return [];
  }
}

async function extractExam(exam) {
  const outPath = path.join(OUT_DIR, `${exam.id}.json`);
  if (fs.existsSync(outPath)) {
    const existing = JSON.parse(fs.readFileSync(outPath, "utf-8"));
    if (existing.question_count === 100) {
      console.log(`skip ${exam.id} (${exam.label}): already done`);
      return existing.question_count;
    }
  }

  const pdfPath = path.join(SOURCES, `${exam.id}_ip_qs.pdf`);
  const tmpDir = `/tmp/ip_extract_${exam.id}`;

  execFileSync("rm", ["-rf", tmpDir]);
  execFileSync("mkdir", ["-p", tmpDir]);

  console.log(`[pdf] ${exam.id} (${exam.label}): converting PDF to PNG...`);
  execFileSync("pdftoppm", ["-png", "-r", "150", pdfPath, `${tmpDir}/p`], {
    stdio: "pipe",
  });

  const pages = fs
    .readdirSync(tmpDir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  const questionPages = pages.slice(1);
  const allQuestions = [];

  for (let i = 0; i < questionPages.length; i += BATCH_SIZE) {
    const batch = questionPages.slice(i, i + BATCH_SIZE);
    const images = batch.map((p) =>
      fs.readFileSync(path.join(tmpDir, p)).toString("base64")
    );

    const pageRange = `p${i + 2}-${i + 1 + batch.length}`;
    process.stdout.write(`  batch ${pageRange} (${batch.length} pages)...`);

    try {
      const questions = await extractBatch(images);
      allQuestions.push(...questions);
      console.log(` ${questions.length} questions`);
    } catch (e) {
      console.log(` ERROR: ${e.message}`);
    }
  }

  const answers = ANSWER_KEYS[exam.id]?.answers || {};
  const questions = allQuestions
    .sort((a, b) => a.question_number - b.question_number)
    .map((q) => ({
      id: `${exam.id}-q${String(q.question_number).padStart(3, "0")}`,
      question_number: q.question_number,
      stem_jp: q.stem_jp,
      choices_jp: q.choices_jp,
      correct_answer: answers[String(q.question_number)] || null,
      has_figure: q.has_figure || false,
      figure_description: q.figure_description || null,
      syllabus_refs: [],
    }));

  const output = {
    exam_id: exam.id,
    year_label: exam.label,
    fiscal_year: exam.fy,
    question_count: questions.length,
    questions,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  execFileSync("rm", ["-rf", tmpDir]);

  const status = questions.length === 100 ? "[ok]" : "[warn]";
  console.log(`${status} ${exam.id}: ${questions.length}/100 -> ${outPath}`);
  return questions.length;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Extracting ${EXAMS.length} exams -> ${OUT_DIR}/\n`);

  let total = 0;
  let ok = 0;

  for (const exam of EXAMS) {
    try {
      const count = await extractExam(exam);
      total += count;
      if (count === 100) ok++;
    } catch (e) {
      console.error(`[fail] ${exam.id}: ${e.message}`);
    }
  }

  console.log(`\nDone: ${ok}/${EXAMS.length} exams with 100 questions`);
  console.log(`Total: ${total} questions extracted`);
}

main().catch(console.error);
