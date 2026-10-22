import path from "node:path";

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Phase 2 Step 12 — next-intl plugin wires src/i18n/request.ts into Next so
// the App Router can resolve the message catalog per [locale] segment on the
// server. The plugin path argument MUST match the request-config location.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Stage 6 (D-133) — the self-authored textbook corpus lives at repo-root
// data/ip/textbook (outside apps/web). The tracing root is the monorepo root.
// The per-route include lists below were written to pull the corpus into the
// production (serverless) bundle; see the note above `nextConfig` — under
// `next build --turbopack` they are not applied. Keys are route paths; include
// globs would resolve from the project root (apps/web).
//
// Globs are narrowed to exactly what the reader reads (the unit index + unit
// JSONs + generated SVGs), recording the intended scope: no gitignored
// *.pilot.json residue, no unused figure_index.json (Rule D LOW, Session 85).
const TEXTBOOK_TRACE = [
  "../../data/ip/textbook/unit_index.json",
  "../../data/ip/textbook/units/**/*.json",
  "../../data/ip/textbook/figures/**/*.svg",
];
// Intended belt-and-suspenders exclude for the gitignored, IPA-copyrighted
// sibling trees (exams 1.2 GB / sources / syllabus). Not applied under
// turbopack (see the note above `nextConfig`); the effective guard is the nft
// IPA leak gate run against the build output.
const IPA_TRACE_EXCLUDE = [
  "../../data/ip/exams/**/*",
  "../../data/ip/sources/**/*",
  "../../data/ip/syllabus/**/*",
];
// Quiz 接過去問 (D-134): the derived clean quiz corpus lives at repo-root
// data/ip/quiz. The runtime reads the two base JSONs + the per-exam translation
// sidecars under translations/ (Phase 1, D-136-B) + explanation sidecars under
// explanations/ (Phase 2, D-137; figures are static WebP under
// apps/web/public/quiz-figures). The sidecar dirs were globbed explicitly so all
// 29 exam sidecars would deploy without relying on nft's dynamic readdir
// tracing — but under turbopack this list is not applied (see the note above
// `nextConfig`); turbopack's own tracing decides what ships. The quiz route
// also builds the glossary dictionary (term chips, D-179), so it reads the
// textbook corpus too. The raw gitignored question_bank/pages/figures are
// guarded by the nft IPA leak gate.
const QUIZ_TRACE = [
  "../../data/ip/quiz/quiz_index.json",
  "../../data/ip/quiz/questions.json",
  "../../data/ip/quiz/translations/*.json",
  "../../data/ip/quiz/explanations/*.json",
];
// Glossary (D-179 §9): the dictionary is built from every textbook unit plus the
// base questions.json (QuizQuestion.terms links); no quiz sidecars are read.
// Kept as documentation of the intended scope; not applied under turbopack.
const GLOSSARY_TRACE = [...TEXTBOOK_TRACE, "../../data/ip/quiz/questions.json"];

// S131 (D-179 §9 改訂): `next build --turbopack` (Next 15.5.18) does NOT apply
// outputFileTracingIncludes / outputFileTracingExcludes — the turbopack build
// returns no buildTraceContext, so these per-route entries are inert. What ships
// is whatever turbopack's own tracing of the fs reads picks up. IPA protection
// therefore rests on the Phase gate: `find .next -name '*.nft.json' -exec grep
// -lE 'data/ip/(exams|sources|syllabus)/' {} + | wc -l` must print 0. Do not
// add new trace entries here; the existing ones are left untouched.

// D-181 §0-8 — static CSP, production only (dev needs the HMR websocket and
// va.vercel-scripts.com). A static header keeps every page's rendering mode
// (the glossary list stays prerendered); a nonce would need a per-request
// header and make every page dynamic. Residual risk, accepted: script-src
// keeps 'unsafe-inline' for Next's inline flight scripts (self.__next_f.push);
// the key is guarded by connect-src (only self + api.anthropic.com).
// style-src 'unsafe-inline' is for next/font and component style={{}}.
// Vercel Analytics / Speed Insights are same-origin in production.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://api.anthropic.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY }],
      },
    ];
  },
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
    "/[locale]/glossary": IPA_TRACE_EXCLUDE,
    "/[locale]/glossary/[termId]": IPA_TRACE_EXCLUDE,
  },
};

export default withNextIntl(nextConfig);
