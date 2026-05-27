/**
 * fix-ocr-quality.mjs
 *
 * Stage 2 OCR 成果物批量修复 — P2 (字符替换) + P3 (噪声/换行清理) + P1 (题间溢出截断)
 * P0 (需要 Claude vision 重新提取) 仅做标记，由后续脚本处理。
 *
 * Usage: node scripts/fix-ocr-quality.mjs [--dry-run]
 */

import fs from "fs";
import path from "path";

const BY_YEAR_DIR = "data/ip/exams/by_year";
const BANK_PATH = "data/ip/exams/question_bank.json";
const BACKUP_DIR = "data/ip/exams/by_year/.backup";
const REPORT_PATH = "evidence/phase5/stage_02_fix_report.md";

const DRY_RUN = process.argv.includes("--dry-run");

// ═══════════════════════════════════════════════════════════
// P2: Character substitution patterns (high-confidence)
// ═══════════════════════════════════════════════════════════

const P2_RULES = [
  // --- IT term I/T confusion ---
  { from: /\bTIT\b/g, to: "IT", tag: "P2:I/T" },
  { from: /\bTIoT\b/g, to: "IoT", tag: "P2:I/T" },
  { from: /\bToT\b(?=\s|機器|デバイス|サーバ|の|を|が|は|で|に)/g, to: "IoT", tag: "P2:I/T" },
  { from: /\bTITIL\b/g, to: "ITIL", tag: "P2:I/T" },
  { from: /\bTISMS\b/g, to: "ISMS", tag: "P2:I/T" },
  { from: /\bISMIS\b/g, to: "ISMS", tag: "P2:I/T" },
  { from: /\bTISBN\b/g, to: "ISBN", tag: "P2:I/T" },
  { from: /\bTITF\b/g, to: "ITF", tag: "P2:I/T" },
  { from: /\bTIEEE\b/g, to: "IEEE", tag: "P2:I/T" },
  { from: /\bTIP-VPN\b/g, to: "IP-VPN", tag: "P2:I/T" },
  { from: /\bTIS[O0]\b/g, to: "ISO", tag: "P2:I/T" },
  { from: /\bTI1DS\b/g, to: "IDS", tag: "P2:I/T" },

  // --- O/0/1 confusion in acronyms ---
  { from: /\b0SS\b/g, to: "OSS", tag: "P2:O/0" },
  { from: /\b0JT\b/g, to: "OJT", tag: "P2:O/0" },
  { from: /\bSE0\b/g, to: "SEO", tag: "P2:O/0" },
  { from: /\b1S0\b/g, to: "ISO", tag: "P2:O/0" },
  { from: /\b1SDN\b/g, to: "ISDN", tag: "P2:O/0" },
  { from: /\bWS3C\b/g, to: "W3C", tag: "P2:O/0" },
  { from: /\b0OA\b/g, to: "OOA", tag: "P2:O/0" },
  { from: /\bCO00O\b/g, to: "COO", tag: "P2:O/0" },
  { from: /\b020\b(?=\s|（|の)/g, to: "O2O", tag: "P2:O/0" },

  // --- Katakana バ/パ confusion ---
  { from: /サーパ(?![ス])/g, to: "サーバ", tag: "P2:バ/パ" },
  { from: /パックアップ/g, to: "バックアップ", tag: "P2:バ/パ" },
  { from: /ペンチャ/g, to: "ベンチャ", tag: "P2:バ/パ" },
  { from: /サーピス/g, to: "サービス", tag: "P2:バ/パ" },

  // --- Katakana リ/り confusion ---
  { from: /りスク/g, to: "リスク", tag: "P2:リ/り" },

  // --- Kanji near-miss ---
  { from: /把掘/g, to: "把握", tag: "P2:漢字" },
  { from: /適区/g, to: "適切", tag: "P2:漢字" },
  { from: /秒密/g, to: "秘密", tag: "P2:漢字" },
  { from: /重最/g, to: "重量", tag: "P2:漢字" },
  { from: /下獲/g, to: "瑕疵", tag: "P2:漢字" },

  // --- Common OCR mis-reads in question patterns ---
  { from: /適切かものはどれか/g, to: "適切なものはどれか", tag: "P2:助詞" },
  { from: /適切ながものはどれか/g, to: "適切なものはどれか", tag: "P2:助詞" },
  { from: /適切なかものはどれか/g, to: "適切なものはどれか", tag: "P2:助詞" },
  { from: /適切な\s+ものはどれか/g, to: "適切なものはどれか", tag: "P2:助詞" },
  { from: /全間必須/g, to: "全問必須", tag: "P2:漢字" },

  // --- TC→IC chip ---
  { from: /\bTC\s*チップ/g, to: "ICチップ", tag: "P2:I/T" },
  { from: /\bTC\s*カード/g, to: "ICカード", tag: "P2:I/T" },

  // --- M8A → M&A ---
  { from: /\bM8A\b/g, to: "M&A", tag: "P2:記号" },
  { from: /\b83C分析\b/g, to: "3C分析", tag: "P2:O/0" },
];

// ═══════════════════════════════════════════════════════════
// P3: Noise patterns to remove
// ═══════════════════════════════════════════════════════════

const TRAILING_NOISE_PATTERNS = [
  /\s*[a-z]{1,3}\s+\d{1,3}\s+[a-z=一二ニー]{1,5}\s*$/,
  /\s*ーー?\s*\d{1,3}\s*[一ニ=ー]*\s*$/,
  /\s*[ー一]\s*\d{1,3}\s*[ー一]\s*$/,
  /\s*本\s*=\s*$/,
  /\s*ー\s*[呈超過舞]\s*[一ー]?\s*$/,
];

const LEADING_NOISE_EXAM_HEADER = /^て?問\s*1?99?\n選択方法\s+全[問間]必須\n注意事項[\s\S]*?(?=問\s*[1１][\s　])/;

// ═══════════════════════════════════════════════════════════
// P1: Question bleeding detection
// ═══════════════════════════════════════════════════════════

const BLEEDING_MARKER = /問\s*\d{1,3}\s/;
const APPENDIX_MARKERS = [
  /表計算ソフトの機能[・,.\s．]*用語/,
  /擬似言語の記述形式/,
  /提似言語の記述形式/,
  /\(I?T\s*パスポート試験用\)/,
];
const COMPOSITE_Q_MARKERS = [
  /中問[A-D]から中[問癌]?[A-D]まで/,
  /に関する次の記述を読んで[,、]\s*四つの問いに答えよ/,
];
const MAX_NORMAL_CHOICE_LEN = 250;

// ═══════════════════════════════════════════════════════════
// Fix functions
// ═══════════════════════════════════════════════════════════

const changeLog = [];

function log(questionId, field, tag, before, after) {
  if (before === after) return false;
  changeLog.push({ questionId, field, tag, before: before.slice(0, 120), after: after.slice(0, 120) });
  return true;
}

function applyP2(text, questionId, field) {
  let result = text;
  for (const rule of P2_RULES) {
    const replaced = result.replace(rule.from, rule.to);
    if (replaced !== result) {
      log(questionId, field, rule.tag, result, replaced);
      result = replaced;
    }
  }
  return result;
}

function cleanTrailingNoise(text, questionId, field) {
  let result = text;
  for (const pattern of TRAILING_NOISE_PATTERNS) {
    const replaced = result.replace(pattern, "");
    if (replaced !== result) {
      log(questionId, field, "P3:trailing-noise", result, replaced);
      result = replaced;
    }
  }
  return result;
}

function cleanNewlines(text, questionId, field) {
  if (!text.includes("\n")) return text;

  let result = text;

  // Collapse multiple newlines to single
  result = result.replace(/\n{3,}/g, "\n\n");

  // For mid-sentence newlines: replace \n with space when:
  // - previous char is NOT a sentence-ending punctuation (。！？)
  // - previous char is NOT a colon or period introducing a list
  // - next char is NOT a choice marker (ア/イ/ウ/エ at line start)
  result = result.replace(/([^。！？\n])\n(?![アイウエ（\n])/g, "$1 ");

  // Clean up double spaces created by newline removal
  result = result.replace(/  +/g, " ");

  if (result !== text) {
    log(questionId, field, "P3:newline", text, result);
  }
  return result;
}

function cleanExamHeaderFromStem(text, questionId) {
  if (!text.match(/選択方法|注意事項|全[問間]必須/)) return text;

  const match = text.match(LEADING_NOISE_EXAM_HEADER);
  if (match) {
    const cleaned = text.slice(match[0].length);
    log(questionId, "stem_jp", "P3:exam-header", text, cleaned);
    return cleaned;
  }

  // Simpler pattern: starts with て or - and is very short (truncated Q1)
  if (text.length <= 3 && /^[てー\-\^]$/.test(text.trim())) {
    log(questionId, "stem_jp", "P0:truncated-q1", text, text);
    // Don't modify - flag for P0
  }
  return text;
}

function fixQuestionBleeding(questions, examId) {
  const flagged = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const choices = q.choices_jp;

    for (const [key, val] of Object.entries(choices)) {
      if (val.length > MAX_NORMAL_CHOICE_LEN) {
        let cutIdx = -1;
        let cutTag = "";

        // Try 問NN marker first
        const bleedMatch = val.match(BLEEDING_MARKER);
        if (bleedMatch) {
          const idx = val.indexOf(bleedMatch[0]);
          if (idx > 20) { cutIdx = idx; cutTag = "P1:bleeding-問"; }
        }

        // Try appendix markers (表計算ソフト / 擬似言語) — find earliest match
        if (cutIdx === -1) {
          let bestIdx = Infinity;
          for (const marker of APPENDIX_MARKERS) {
            const m = val.match(marker);
            if (m) {
              const idx = val.indexOf(m[0]);
              if (idx > 2 && idx < bestIdx) { bestIdx = idx; }
            }
          }
          if (bestIdx < Infinity) { cutIdx = bestIdx; cutTag = "P1:bleeding-appendix"; }
        }

        // Try composite question markers (中問A~D / 次の記述を読んで)
        if (cutIdx === -1) {
          for (const marker of COMPOSITE_Q_MARKERS) {
            const compMatch = val.match(marker);
            if (compMatch) {
              // Back up to find the start of the composite intro sentence
              let idx = val.indexOf(compMatch[0]);
              // Look backwards for the actual sentence start (e.g., topic name before 次の記述)
              const lookback = val.slice(Math.max(0, idx - 80), idx);
              const sentStart = lookback.search(/[。．\.](?=[^。．\.]*$)/);
              if (sentStart >= 0) {
                idx = Math.max(0, idx - 80) + sentStart + 1;
              }
              if (idx > 20) { cutIdx = idx; cutTag = "P1:bleeding-中問"; break; }
            }
          }
        }

        if (cutIdx > 0) {
          const truncated = val.slice(0, cutIdx).trim();
          const absorbed = val.slice(cutIdx);
          log(q.id, `choices_jp.${key}`, cutTag, val, truncated);
          if (!DRY_RUN) {
            choices[key] = truncated;
          }
          flagged.push({
            questionId: q.id,
            choiceKey: key,
            absorbedContent: absorbed.slice(0, 200),
          });
        }
      }
    }
  }
  return flagged;
}

function detectExamInstructions(text) {
  return /選択方法\s+全[問間]必須/.test(text) || /注意事項\s+1\.\s*問題に関する質問/.test(text);
}

function flagP0Issues(questions, examId) {
  const issues = [];

  for (const q of questions) {
    // Truncated Q1
    if (q.question_number === 1 && q.stem_jp.trim().length <= 3) {
      issues.push({ id: q.id, type: "P0:truncated-stem", detail: `stem="${q.stem_jp}"` });
    }

    // Exam instructions as stem (Q100, Q45)
    if (detectExamInstructions(q.stem_jp)) {
      issues.push({ id: q.id, type: "P0:exam-instructions-as-stem", detail: "stem contains 選択方法/注意事項" });
    }

    // Ghost question numbers (>100)
    if (q.question_number > 100) {
      issues.push({ id: q.id, type: "P0:ghost-question", detail: `question_number=${q.question_number}` });
    }

    // null correct_answer
    if (!q.correct_answer) {
      issues.push({ id: q.id, type: "P0:null-answer", detail: "correct_answer is null" });
    }
  }

  // Check for missing question numbers
  const nums = new Set(questions.map(q => q.question_number));
  for (let n = 1; n <= 100; n++) {
    if (!nums.has(n)) {
      issues.push({ id: `${examId}-q${String(n).padStart(3, "0")}`, type: "P0:missing-question", detail: `question_number ${n} not found` });
    }
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════
// Main processing
// ═══════════════════════════════════════════════════════════

function processFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const examId = data.exam_id;
  const questions = data.questions;

  for (const q of questions) {
    // P3: Clean exam header from Q1 stems
    q.stem_jp = cleanExamHeaderFromStem(q.stem_jp, q.id);

    // P3: Clean newlines in stem
    q.stem_jp = cleanNewlines(q.stem_jp, q.id, "stem_jp");

    // P3: Clean trailing noise from stem
    q.stem_jp = cleanTrailingNoise(q.stem_jp, q.id, "stem_jp");

    // P2: Character fixes in stem
    q.stem_jp = applyP2(q.stem_jp, q.id, "stem_jp");

    // Process choices
    for (const [key, val] of Object.entries(q.choices_jp)) {
      let fixed = val;
      fixed = cleanNewlines(fixed, q.id, `choices_jp.${key}`);
      fixed = cleanTrailingNoise(fixed, q.id, `choices_jp.${key}`);
      fixed = applyP2(fixed, q.id, `choices_jp.${key}`);
      q.choices_jp[key] = fixed;
    }
  }

  // P1: Question bleeding
  const bleedingIssues = fixQuestionBleeding(questions, examId);

  // P0: Flag critical issues
  const p0Issues = flagP0Issues(questions, examId);

  return { data, bleedingIssues, p0Issues };
}

function regenerateQuestionBank(byYearDir, bankPath) {
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
    const fp = path.join(byYearDir, `${eid}.json`);
    if (!fs.existsSync(fp)) continue;
    const d = JSON.parse(fs.readFileSync(fp, "utf-8"));
    allQuestions.push(...d.questions);
  }

  const bank = {
    version: "2.0-fixed",
    extracted_at: new Date().toISOString(),
    exam_count: examOrder.length,
    question_count: allQuestions.length,
    questions: allQuestions,
  };

  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2), "utf-8");
  return allQuestions.length;
}

function generateReport(allP0, allBleeding) {
  const tagCounts = {};
  for (const c of changeLog) {
    tagCounts[c.tag] = (tagCounts[c.tag] || 0) + 1;
  }

  let md = `# Stage 2 OCR 修复报告\n\n`;
  md += `> 生成时间: ${new Date().toISOString()}\n`;
  md += `> Dry run: ${DRY_RUN}\n\n`;

  md += `## 修复统计\n\n`;
  md += `| 修复类型 | 数量 |\n|---|---|\n`;
  for (const [tag, count] of Object.entries(tagCounts).sort((a, b) => b[1] - a[1])) {
    md += `| ${tag} | ${count} |\n`;
  }
  md += `| **总计** | **${changeLog.length}** |\n\n`;

  md += `## P0 待修复问题 (需 Claude vision)\n\n`;
  md += `| ID | 类型 | 详情 |\n|---|---|---|\n`;
  for (const issue of allP0) {
    md += `| ${issue.id} | ${issue.type} | ${issue.detail} |\n`;
  }
  md += `\n`;

  md += `## P1 题间溢出已截断\n\n`;
  md += `| ID | 选项 | 被吸收内容(前200字) |\n|---|---|---|\n`;
  for (const b of allBleeding) {
    md += `| ${b.questionId} | ${b.choiceKey} | ${b.absorbedContent.replace(/\|/g, "\\|").replace(/\n/g, " ")} |\n`;
  }
  md += `\n`;

  md += `## P2+P3 修改明细 (前100条)\n\n`;
  md += `| ID | 字段 | 类型 | 修改前(截取) | 修改后(截取) |\n|---|---|---|---|---|\n`;
  for (const c of changeLog.slice(0, 100)) {
    const b = c.before.replace(/\|/g, "\\|").replace(/\n/g, "↵");
    const a = c.after.replace(/\|/g, "\\|").replace(/\n/g, "↵");
    md += `| ${c.questionId} | ${c.field} | ${c.tag} | ${b} | ${a} |\n`;
  }
  if (changeLog.length > 100) {
    md += `\n> ... 省略 ${changeLog.length - 100} 条\n`;
  }

  return md;
}

// ═══════════════════════════════════════════════════════════
// Entry point
// ═══════════════════════════════════════════════════════════

function main() {
  console.log(`OCR Quality Fix ${DRY_RUN ? "(DRY RUN)" : "(LIVE)"}`);

  // Backup
  if (!DRY_RUN) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const files = fs.readdirSync(BY_YEAR_DIR).filter(f => f.endsWith(".json"));
    for (const f of files) {
      fs.copyFileSync(path.join(BY_YEAR_DIR, f), path.join(BACKUP_DIR, f));
    }
    // Also backup question_bank
    if (fs.existsSync(BANK_PATH)) {
      fs.copyFileSync(BANK_PATH, BANK_PATH + ".backup");
    }
    console.log(`Backed up ${files.length} files to ${BACKUP_DIR}`);
  }

  const allP0 = [];
  const allBleeding = [];
  const files = fs.readdirSync(BY_YEAR_DIR).filter(f => f.endsWith(".json"));

  for (const f of files) {
    const fp = path.join(BY_YEAR_DIR, f);
    console.log(`Processing ${f}...`);

    const { data, bleedingIssues, p0Issues } = processFile(fp);
    allP0.push(...p0Issues);
    allBleeding.push(...bleedingIssues);

    if (!DRY_RUN) {
      fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
    }
  }

  // Regenerate question_bank.json
  if (!DRY_RUN) {
    const totalQ = regenerateQuestionBank(BY_YEAR_DIR, BANK_PATH);
    console.log(`Regenerated question_bank.json: ${totalQ} questions`);
  }

  // Generate report
  const report = generateReport(allP0, allBleeding);
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, "utf-8");

  console.log(`\n=== Summary ===`);
  console.log(`Total changes: ${changeLog.length}`);
  console.log(`P0 issues flagged: ${allP0.length}`);
  console.log(`P1 bleeding truncated: ${allBleeding.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main();
