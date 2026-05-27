/**
 * fill-missing-questions.mjs
 *
 * For each incomplete exam JSON, find missing question numbers,
 * extract only those questions from the PDF, and merge them in.
 *
 * Usage:
 *   node scripts/fill-missing-questions.mjs [exam_id...]
 *   node scripts/fill-missing-questions.mjs          # all incomplete
 *   node scripts/fill-missing-questions.mjs 2009h21h  # specific exam
 */

import Anthropic from "@anthropic-ai/sdk";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const envFile = fs.readFileSync("apps/web/.env.local", "utf-8");
const apiKey = envFile.match(/ANTHROPIC_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) throw new Error("ANTHROPIC_API_KEY not found");

const client = new Anthropic({ apiKey });

const SOURCES = "data/ip/sources/exams";
const OUT_DIR = "data/ip/exams/by_year";
const ANSWER_KEYS = JSON.parse(
  fs.readFileSync("data/ip/exams/answer_keys.json", "utf-8")
);
const MODEL = "claude-sonnet-4-6-20250514";

// Pages per batch when scanning for missing questions
const BATCH_SIZE = 8;

function getMissingNumbers(questions) {
  const existing = new Set(
    questions.map((q) => q.question_number ?? q.number)
  );
  return Array.from({ length: 100 }, (_, i) => i + 1).filter(
    (n) => !existing.has(n)
  );
}

function detectSchema(questions) {
  if (!questions.length) return "new";
  return "stem_jp" in questions[0] ? "new" : "old";
}

async function extractMissingFromBatch(pageImages, missingNums, examId) {
  const targetNums = missingNums.join(", ");
  const prompt = `These are pages from the IT Passport (ITパスポート) exam ${examId}.

I need ONLY the following question numbers extracted: ${targetNums}

For each question found on these pages, return a JSON object:
{
  "question_number": <integer>,
  "stem_jp": "<full question text in Japanese, preserve all text including sub-items a/b/c/d, use \\n for line breaks>",
  "choices_jp": {"ア": "...", "イ": "...", "ウ": "...", "エ": "..."},
  "has_figure": <true if question has diagram/table/chart/image>,
  "figure_description": "<brief Japanese description of figure content, or null>"
}

Rules:
- Only extract questions with numbers in this list: ${targetNums}
- Transcribe EXACT Japanese text. Do not translate or summarize.
- For 中問 (composite questions with shared scenario/intro text): include the shared scenario text at the start of each sub-question's stem_jp.
- If none of the target questions appear on these pages, return [].
- Output ONLY a JSON array. No markdown, no explanation.`;

  const content = [
    ...pageImages.map((img) => ({
      type: "image",
      source: { type: "base64", media_type: "image/png", data: img },
    })),
    { type: "text", text: prompt },
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
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* ignore */
      }
    }
    console.error("  JSON parse failed:", text.slice(0, 300));
    return [];
  }
}

async function fillExam(examId) {
  const outPath = path.join(OUT_DIR, `${examId}.json`);
  if (!fs.existsSync(outPath)) {
    console.error(`[skip] ${examId}: no existing JSON found`);
    return;
  }

  const existing = JSON.parse(fs.readFileSync(outPath, "utf-8"));
  // Support both wrapped {questions:[...]} and bare array
  const questions = Array.isArray(existing)
    ? existing
    : existing.questions ?? [];

  const missing = getMissingNumbers(questions);
  if (missing.length === 0) {
    console.log(`[ok] ${examId}: already 100/100, skip`);
    return;
  }

  console.log(
    `\n[fill] ${examId}: ${questions.length}/100, missing ${missing.length}: ${missing.slice(0, 10).join(",")}${missing.length > 10 ? "..." : ""}`
  );

  const pdfPath = path.join(SOURCES, `${examId}_ip_qs.pdf`);
  if (!fs.existsSync(pdfPath)) {
    console.error(`  [error] PDF not found: ${pdfPath}`);
    return;
  }

  const tmpDir = `/tmp/ip_fill_${examId}`;
  execFileSync("rm", ["-rf", tmpDir]);
  execFileSync("mkdir", ["-p", tmpDir]);

  console.log(`  converting PDF to PNG (150dpi)...`);
  execFileSync("pdftoppm", ["-png", "-r", "150", pdfPath, `${tmpDir}/p`], {
    stdio: "pipe",
  });

  const allPages = fs
    .readdirSync(tmpDir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  // Skip cover page (index 0), use question pages
  const questionPages = allPages.slice(1);
  console.log(`  ${questionPages.length} question pages`);

  const schema = detectSchema(questions);
  const answers = ANSWER_KEYS[examId]?.answers || {};
  const newQuestions = [];
  let remainingMissing = [...missing];

  for (let i = 0; i < questionPages.length && remainingMissing.length > 0; i += BATCH_SIZE) {
    const batch = questionPages.slice(i, i + BATCH_SIZE);
    const images = batch.map((p) =>
      fs.readFileSync(path.join(tmpDir, p)).toString("base64")
    );

    const pageNums = `p${i + 2}-${i + 1 + batch.length}`;
    process.stdout.write(
      `  batch ${pageNums} (${batch.length} pages), seeking ${remainingMissing.length} missing...`
    );

    const found = await extractMissingFromBatch(
      images,
      remainingMissing,
      examId
    );
    const validFound = found.filter(
      (q) => q.question_number && remainingMissing.includes(q.question_number)
    );

    if (validFound.length > 0) {
      console.log(` found ${validFound.length}: ${validFound.map((q) => q.question_number).join(",")}`);
      newQuestions.push(...validFound);
      const foundNums = new Set(validFound.map((q) => q.question_number));
      remainingMissing = remainingMissing.filter((n) => !foundNums.has(n));
    } else {
      console.log(` none found`);
    }
  }

  execFileSync("rm", ["-rf", tmpDir]);

  if (newQuestions.length === 0) {
    console.log(`  [warn] no new questions extracted`);
    return;
  }

  // Merge new questions into existing
  const existingMap = new Map(
    questions.map((q) => [q.question_number ?? q.number, q])
  );

  for (const q of newQuestions) {
    const num = q.question_number;
    if (schema === "new") {
      existingMap.set(num, {
        id: `${examId}-q${String(num).padStart(3, "0")}`,
        question_number: num,
        stem_jp: q.stem_jp,
        choices_jp: q.choices_jp,
        correct_answer: answers[String(num)] || null,
        has_figure: q.has_figure || false,
        figure_description: q.figure_description || null,
        syllabus_refs: [],
      });
    } else {
      // old schema
      existingMap.set(num, {
        id: `${examId}-q${String(num).padStart(3, "0")}`,
        number: num,
        stem: q.stem_jp,
        choices: q.choices_jp,
        answer: answers[String(num)] || null,
        has_figure: q.has_figure || false,
      });
    }
  }

  const merged = Array.from(existingMap.values()).sort((a, b) => {
    const an = a.question_number ?? a.number;
    const bn = b.question_number ?? b.number;
    return an - bn;
  });

  // Reconstruct output preserving original wrapper if present
  let output;
  if (Array.isArray(existing)) {
    output = merged;
  } else {
    output = {
      ...existing,
      question_count: merged.length,
      questions: merged,
    };
  }

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  const stillMissing = getMissingNumbers(merged);
  const status = stillMissing.length === 0 ? "[COMPLETE]" : `[partial, still missing ${stillMissing.length}]`;
  console.log(
    `  ${status} ${examId}: ${merged.length}/100 (+${newQuestions.length} added)`
  );
  if (stillMissing.length > 0) {
    console.log(`  still missing: ${stillMissing.join(",")}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  let targets;
  if (args.length > 0) {
    targets = args;
  } else {
    // Find all incomplete exams
    targets = fs
      .readdirSync(OUT_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .filter((id) => {
        const data = JSON.parse(
          fs.readFileSync(path.join(OUT_DIR, `${id}.json`), "utf-8")
        );
        const qs = Array.isArray(data) ? data : data.questions ?? [];
        return getMissingNumbers(qs).length > 0;
      })
      .sort();
  }

  console.log(
    `Filling missing questions for ${targets.length} exam(s): ${targets.join(", ")}\n`
  );

  for (const examId of targets) {
    try {
      await fillExam(examId);
    } catch (e) {
      console.error(`[fail] ${examId}: ${e.message}`);
    }
  }

  // Final summary
  console.log("\n=== Final Status ===");
  const all = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json")).sort();
  let complete = 0;
  for (const fname of all) {
    const data = JSON.parse(
      fs.readFileSync(path.join(OUT_DIR, fname), "utf-8")
    );
    const qs = Array.isArray(data) ? data : data.questions ?? [];
    const missing = getMissingNumbers(qs);
    const mark = missing.length === 0 ? "✓" : "✗";
    console.log(
      `  ${mark} ${fname.replace(".json", "")}: ${qs.length}/100` +
        (missing.length > 0 ? ` (missing: ${missing.join(",")})` : "")
    );
    if (missing.length === 0) complete++;
  }
  console.log(`\nComplete: ${complete}/${all.length}`);
}

main().catch(console.error);
