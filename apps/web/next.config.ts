import path from "node:path";

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Phase 2 Step 12 — next-intl plugin wires src/i18n/request.ts into Next so
// the App Router can resolve the message catalog per [locale] segment on the
// server. The plugin path argument MUST match the request-config location.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Stage 6 (D-133) — the self-authored textbook corpus lives at repo-root
// data/ip/textbook (outside apps/web). Set the tracing root to the monorepo
// root and explicitly include the corpus so the textbook routes' server-side
// fs reads resolve in the production (serverless) bundle, not just in dev.
// Keys are route paths; include globs resolve from the project root (apps/web).
//
// Globs are narrowed to exactly what the reader reads (the unit index + unit
// JSONs + generated SVGs) so build traces don't drag in gitignored *.pilot.json
// residue or the unused figure_index.json (Rule D LOW, Session 85).
const TEXTBOOK_TRACE = [
  "../../data/ip/textbook/unit_index.json",
  "../../data/ip/textbook/units/**/*.json",
  "../../data/ip/textbook/figures/**/*.svg",
];
// Belt-and-suspenders: explicitly keep the gitignored, IPA-copyrighted sibling
// trees (exams 1.2 GB / sources / syllabus) out of the textbook route trace, in
// case nft ever resolves a broader base dir than data/ip/textbook.
const IPA_TRACE_EXCLUDE = [
  "../../data/ip/exams/**/*",
  "../../data/ip/sources/**/*",
  "../../data/ip/syllabus/**/*",
];
// Quiz 接過去問 (D-134): the derived clean quiz corpus lives at repo-root
// data/ip/quiz. The runtime reads the two base JSONs + the per-exam translation
// sidecars under translations/ (Phase 1, D-136-B) + explanation sidecars under
// explanations/ (Phase 2, D-137; figures are static WebP under
// apps/web/public/quiz-figures, traced automatically). Glob the sidecar dirs
// explicitly so all 29 exam sidecars deploy reliably (don't rely on nft's dynamic
// readdir tracing). The raw gitignored question_bank/pages/figures stay excluded.
const QUIZ_TRACE = [
  "../../data/ip/quiz/quiz_index.json",
  "../../data/ip/quiz/questions.json",
  "../../data/ip/quiz/translations/*.json",
  "../../data/ip/quiz/explanations/*.json",
];
// Glossary (D-179 §9): the dictionary is built from every textbook unit plus the
// base questions.json (QuizQuestion.terms links, via quizReader.loadBaseQuestions).
// Importing quizReader makes nft also trace the rest of data/ip/quiz that its
// dynamic path.join reads resolve to (quiz_index.json, chumon_groups.json, the
// translations/ + explanations/ sidecars); the glossary never loads them, so the
// exclude list below drops them. Next applies excludes after includes, so they
// name the four quiz paths exactly and questions.json stays traced.
// NOTE: next build --turbopack (Next 15.5.x, our build script) skips the per-route
// outputFileTracingIncludes/Excludes pass entirely (turbopack-build returns no
// buildTraceContext, so collect-build-traces applies nothing; verified: an extra
// "./README.md" include produced 0 trace hits). Every route entry in this file
// therefore only takes effect under a webpack build; with turbopack the traces are
// whatever turbopack resolves itself, and the nft IPA leak gate is the real guard.
const GLOSSARY_TRACE = [...TEXTBOOK_TRACE, "../../data/ip/quiz/questions.json"];
const GLOSSARY_TRACE_EXCLUDE = [
  ...IPA_TRACE_EXCLUDE,
  "../../data/ip/quiz/quiz_index.json",
  "../../data/ip/quiz/chumon_groups.json",
  "../../data/ip/quiz/translations/**/*",
  "../../data/ip/quiz/explanations/**/*",
];
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), "..", ".."),
  outputFileTracingIncludes: {
    "/[locale]/textbook": TEXTBOOK_TRACE,
    "/[locale]/textbook/[unitId]": TEXTBOOK_TRACE,
    "/[locale]/quiz": QUIZ_TRACE,
    "/[locale]/glossary": GLOSSARY_TRACE,
    "/[locale]/glossary/[termId]": GLOSSARY_TRACE,
  },
  outputFileTracingExcludes: {
    "/[locale]/textbook": IPA_TRACE_EXCLUDE,
    "/[locale]/textbook/[unitId]": IPA_TRACE_EXCLUDE,
    "/[locale]/quiz": IPA_TRACE_EXCLUDE,
    "/[locale]/glossary": GLOSSARY_TRACE_EXCLUDE,
    "/[locale]/glossary/[termId]": GLOSSARY_TRACE_EXCLUDE,
  },
};

export default withNextIntl(nextConfig);
