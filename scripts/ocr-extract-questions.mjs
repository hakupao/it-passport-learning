import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const SOURCES = "data/ip/sources/exams";
const OUT_DIR = "data/ip/exams/by_year";
const TMP_DIR = "data/ip/.tmp";
const ANSWER_KEYS = JSON.parse(fs.readFileSync("data/ip/exams/answer_keys.json", "utf-8"));

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

function ocrPages(pdfPath, workDir) {
  execFileSync("rm", ["-rf", workDir]);
  execFileSync("mkdir", ["-p", workDir]);
  execFileSync("pdftoppm", ["-png", "-r", "300", pdfPath, path.join(workDir, "p")], { stdio: "pipe" });

  const pngs = fs.readdirSync(workDir).filter(f => f.endsWith(".png")).sort();
  let fullText = "";

  for (const png of pngs) {
    const base = png.replace(".png", "");
    try {
      execFileSync("tesseract", [png, base, "-l", "jpn", "--psm", "6"], {
        cwd: workDir,
        stdio: "pipe",
      });
      const txt = fs.readFileSync(path.join(workDir, base + ".txt"), "utf-8");
      fullText += txt + "\n";
    } catch {
      // skip pages that fail OCR (cover, appendix)
    }
  }

  execFileSync("rm", ["-rf", workDir]);
  return fullText;
}

function parseQuestions(text) {
  // Remove section headers containing question ranges (e.g., "問1から問35までは，ストラテジ系の問題です。")
  text = text.replace(/[問間]\s*\d+\s*から\s*[問間]\s*\d+\s*まで[はのを][，,、].+?(?:。|\n)/g, "");
  // Remove page number noise: "ー 3 ー", "= 4 人", "に 6 ーー", "トー 5 ーー" etc.
  text = text.replace(/^[=ーー\-トにへ\s]*\d+\s*[ーー\-人一寺]*\s*$/gm, "");
  // Fix OCR doubled choice labels: エエ→エ, アア→ア, etc.
  text = text.replace(/([アイウエ])\1+/g, "$1");

  const questions = [];
  // Match 問 and common OCR misreads: 間, 開, 関
  const qPattern = /[問間開関]\s*(\d{1,3})\s/g;
  const matches = [...text.matchAll(qPattern)];

  // Filter: only keep matches where the number is 1-100 and it looks like a question start
  const validMatches = matches.filter((m, idx) => {
    const num = parseInt(m[1]);
    if (num < 1 || num > 109) return false;
    // Skip if followed by "から" (section header fragment)
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 5);
    if (after.startsWith("から") || after.startsWith("まで")) return false;
    return true;
  });

  // Fix OCR digit errors: 0→6 and 0→9 (e.g., 問10→問16, 問30→問39)
  // Detect by finding duplicate numbers and missing round numbers
  const numCounts = {};
  validMatches.forEach(m => {
    const n = parseInt(m[1]);
    numCounts[n] = (numCounts[n] || 0) + 1;
  });
  const foundNums = new Set(Object.keys(numCounts).map(Number));
  const remapTable = {};
  for (let base = 10; base <= 100; base += 10) {
    if (foundNums.has(base)) continue;
    // For 100: check 106, 109 (OCR misreads 100 as 106/109)
    const candidates = base === 100 ? [106, 109] : [base + 6, base + 9].filter(n => n !== base);
    for (const misread of candidates) {
      if ((numCounts[misread] || 0) >= (misread > 100 ? 1 : 2)) {
        remapTable[misread] = base;
        break;
      }
    }
  }

  // Apply remaps: for duplicate numbers, remap the FIRST occurrence to the missing round number
  const remapApplied = new Set();
  const fixedMatches = validMatches.map(m => {
    const num = parseInt(m[1]);
    if (remapTable[num] && !remapApplied.has(num)) {
      remapApplied.add(num);
      return { ...m, _fixedNum: remapTable[num] };
    }
    return m;
  });

  // Deduplicate by question number, keeping the first occurrence
  const seen = new Set();
  const dedupedMatches = fixedMatches.filter(m => {
    const num = m._fixedNum || parseInt(m[1]);
    if (seen.has(num)) return false;
    seen.add(num);
    return true;
  });

  for (let i = 0; i < dedupedMatches.length; i++) {
    const m = dedupedMatches[i];
    const qNum = m._fixedNum || parseInt(m[1]);

    const start = m.index + m[0].length;
    const end = i + 1 < dedupedMatches.length ? dedupedMatches[i + 1].index : text.length;
    let segment = text.slice(start, end).trim();

    // Extract choices - try multiple patterns
    const choices = {};
    const choiceLabels = ["ア", "イ", "ウ", "エ"];

    // Pattern 1: Multi-line choices (each on its own line)
    const choicePattern = /(?:^|\n)\s*([アイウエ])\s+(.+?)(?=\n\s*[アイウエ]\s|\n\s*$|$)/gs;
    const choiceMatches = [...segment.matchAll(choicePattern)];

    if (choiceMatches.length >= 4) {
      for (const cm of choiceMatches) {
        const label = cm[1];
        if (choiceLabels.includes(label) && !choices[label]) {
          choices[label] = cm[2].replace(/\n\s*/g, "").trim();
        }
      }
    }

    // Pattern 2: Inline "ア xxx  イ yyy  ウ zzz  エ www"
    if (Object.keys(choices).length < 4) {
      const inlinePattern = /ア\s+(.+?)\s{2,}イ\s+(.+?)\s{2,}ウ\s+(.+?)\s{2,}エ\s+(.+?)(?:\n|$)/;
      const inlineMatch = segment.match(inlinePattern);
      if (inlineMatch) {
        if (!choices["ア"]) choices["ア"] = inlineMatch[1].trim();
        if (!choices["イ"]) choices["イ"] = inlineMatch[2].trim();
        if (!choices["ウ"]) choices["ウ"] = inlineMatch[3].trim();
        if (!choices["エ"]) choices["エ"] = inlineMatch[4].trim();
      }
    }

    // Pattern 3: Two-column "ア xxx  イ yyy\nウ zzz  エ www"
    if (Object.keys(choices).length < 4) {
      const twoColPattern = /ア\s+(.+?)\s{2,}イ\s+(.+?)(?:\n|$)[\s\S]*?ウ\s+(.+?)\s{2,}エ\s+(.+?)(?:\n|$)/;
      const twoColMatch = segment.match(twoColPattern);
      if (twoColMatch) {
        if (!choices["ア"]) choices["ア"] = twoColMatch[1].trim();
        if (!choices["イ"]) choices["イ"] = twoColMatch[2].trim();
        if (!choices["ウ"]) choices["ウ"] = twoColMatch[3].trim();
        if (!choices["エ"]) choices["エ"] = twoColMatch[4].trim();
      }
    }

    // Pattern 4: "ア xxx\nイ yyy\nウ zzz\nエ www" (single space after label)
    if (Object.keys(choices).length < 4) {
      for (const label of choiceLabels) {
        if (!choices[label]) {
          const singleMatch = segment.match(new RegExp(`(?:^|\\n)\\s*${label}\\s+(.+?)(?=\\n|$)`, "m"));
          if (singleMatch) choices[label] = singleMatch[1].trim();
        }
      }
    }

    // Extract stem (everything before the first choice occurrence)
    let stem = segment;
    const firstChoiceIdx = segment.search(/(?:^|\n)\s*ア\s/m);
    if (firstChoiceIdx > 0) {
      stem = segment.slice(0, firstChoiceIdx).trim();
    }
    // Also try finding stem by looking for the inline choice pattern
    if (firstChoiceIdx <= 0) {
      const inlineStemIdx = segment.search(/ア\s+.+?\s{2,}イ\s+/);
      if (inlineStemIdx > 0) {
        stem = segment.slice(0, inlineStemIdx).trim();
      }
    }
    // Clean up stem
    stem = stem.replace(/\n\s+/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

    // Detect figures/tables
    const hasFigure = /表|図|グラフ|フローチャート|ネットワーク図/.test(stem) &&
      (stem.includes("───") || stem.includes("│") || stem.includes("┌") ||
       /\d+\s+\d+/.test(stem) || /[|｜]/.test(stem));

    questions.push({
      question_number: qNum,
      stem_jp: stem,
      choices_jp: Object.keys(choices).length === 4 ? choices : { "ア": "", "イ": "", "ウ": "", "エ": "" },
      has_figure: hasFigure || /次の表|下の表|図に示す/.test(stem),
      figure_description: null,
    });
  }

  return questions.sort((a, b) => a.question_number - b.question_number);
}

function processExam(exam) {
  const outPath = path.join(OUT_DIR, `${exam.id}.json`);
  if (fs.existsSync(outPath)) {
    const existing = JSON.parse(fs.readFileSync(outPath, "utf-8"));
    if (existing.question_count >= 98) {
      console.log(`skip ${exam.id}: already done (${existing.question_count}q)`);
      return existing.question_count;
    }
  }

  const pdfPath = path.join(SOURCES, `${exam.id}_ip_qs.pdf`);
  const workDir = path.join(TMP_DIR, exam.id);

  process.stdout.write(`${exam.id} (${exam.label}): OCR...`);
  const text = ocrPages(pdfPath, workDir);
  const rawQuestions = parseQuestions(text);
  process.stdout.write(` parsed ${rawQuestions.length}q...`);

  const answers = ANSWER_KEYS[exam.id]?.answers || {};
  const questions = rawQuestions.map(q => ({
    id: `${exam.id}-q${String(q.question_number).padStart(3, "0")}`,
    question_number: q.question_number,
    stem_jp: q.stem_jp,
    choices_jp: q.choices_jp,
    correct_answer: answers[String(q.question_number)] || null,
    has_figure: q.has_figure,
    figure_description: q.figure_description,
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
  const status = questions.length >= 95 ? "[ok]" : "[warn]";
  console.log(` ${status} ${questions.length}/100 -> ${outPath}`);
  return questions.length;
}

// Main
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

console.log(`Processing ${EXAMS.length} exams with tesseract OCR...\n`);
let total = 0, ok = 0;

for (const exam of EXAMS) {
  try {
    const count = processExam(exam);
    total += count;
    if (count >= 90) ok++;
  } catch (e) {
    console.error(`[fail] ${exam.id}: ${e.message}`);
  }
}

console.log(`\nDone: ${ok}/${EXAMS.length} exams (>=95q), total ${total} questions`);
execFileSync("rm", ["-rf", TMP_DIR]);
