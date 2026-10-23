// Stage 7 Phase 1 Task 8 — visual samples of the question face + explanation (D-189 §9 manual check).
//
// Always renders the sample set (figure / table stem / 中問 member folded / choice_figures / suspect /
// 3 points / unanswered) and checks each carries its key fields. With CAPTURE_SAMPLES=1 it also writes
// standalone HTML pages to .playwright-mcp/ui/phase1/task8-*.html (gitignored: they hold question
// text) — CSS-module class names are mapped back onto the raw module CSS, tokens from globals.css,
// images from public/ (root-relative to the repo: serve the repo root with any static server, e.g.
// `python3 -m http.server -b 127.0.0.1 8765`, and open /.playwright-mcp/ui/phase1/task8-*.html).

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
}));

import glossaryStyles from "@/components/glossary/glossary.module.css";
import quizStyles from "@/components/quiz/quiz.module.css";
import type { ChoiceLetter } from "@/lib/learning/record";
import { loadChumonGroups } from "@/lib/practice/practiceReader";
import type { ChumonGroup } from "@/lib/practice/practiceIndex";
import { CHOICE_LETTERS, loadAllQuestions, type QuizQuestion } from "@/lib/quiz/quizReader";

import practiceStyles from "../practice.module.css";
import { fidAll, renderAnswerBar, renderFace, renderPane } from "./practiceRender";

const WEB = path.resolve(__dirname, "../../../..");
const ROOT = path.resolve(WEB, "..", "..");
const OUT = path.join(ROOT, ".playwright-mcp/ui/phase1");

let QS: QuizQuestion[] = [];
let GROUPS: ChumonGroup[] = [];
beforeAll(async () => {
  [QS, GROUPS] = await Promise.all([loadAllQuestions(), loadChumonGroups()]);
});

interface Sample {
  name: string;
  q: QuizQuestion;
  locale: string;
  picked: ChoiceLetter | null;
  showTranslation?: boolean;
  fold?: number | null;
  expect: string[];
}

const wrongOf = (q: QuizQuestion): ChoiceLetter => CHOICE_LETTERS.find((L) => L !== q.correct_answer)!;

function samples(): Sample[] {
  const fig = QS.find((q) => q.figure && q.explanation?.points.length === 2)!;
  const table = QS.find((q) => !q.figure && /<table/.test(fidAll(renderFace(q, "ja"), "stem")[0]!.inner))!;
  const g = GROUPS.find((x) => x.preambleChars.jp !== null)!;
  const chumon = QS.find((q) => q.id === g.memberIds[1])!;
  const cf = QS.find((q) => q.choice_figures)!;
  const sus = QS.find((q) => q.explanation?.key_guard.suspect && !q.figure)!;
  const three = QS.find((q) => q.explanation?.points.length === 3)!;
  return [
    { name: "figure", q: fig, locale: "ja", picked: wrongOf(fig), expect: ["figure", "stem", "expl-correct"] },
    { name: "table", q: table, locale: "zh", picked: wrongOf(table), showTranslation: true, expect: ["stem", "stem-tr"] },
    { name: "chumon", q: chumon, locale: "ja", picked: chumon.correct_answer as ChoiceLetter, fold: g.preambleChars.jp, expect: ["stem-preamble", "stem"] },
    { name: "choice-figures", q: cf, locale: "en", picked: cf.correct_answer as ChoiceLetter, showTranslation: true, expect: ["choice-figure-0", "choice-tr-3"] },
    { name: "suspect", q: sus, locale: "ja", picked: wrongOf(sus), expect: ["suspect"] },
    { name: "points3", q: three, locale: "zh", picked: wrongOf(three), expect: ["point-2"] },
    { name: "unanswered", q: QS.find((q) => q.id === "2024r06-q001")!, locale: "zh", picked: null, expect: ["stem", "choice-0"] },
  ];
}

/** Raw module CSS with each local class renamed to the name vitest generated for it. */
function moduleCss(file: string, map: Record<string, string>): string {
  return readFileSync(file, "utf-8").replace(/\.([A-Za-z_][\w-]*)/g, (m, name: string) => (map[name] ? `.${map[name]}` : m));
}

function page(s: Sample, body: string): string {
  const tokens = /:root\s*\{[^}]*\}/.exec(readFileSync(path.join(WEB, "src/app/globals.css"), "utf-8"))![0];
  const built = path.join(WEB, ".next/static/css");
  const links = existsSync(built)
    ? readdirSync(built).filter((f) => f.endsWith(".css")).map((f) => `<link rel="stylesheet" href="/apps/web/.next/static/css/${f}">`)
    : [];
  const css = [
    moduleCss(path.join(WEB, "src/components/quiz/quiz.module.css"), quizStyles as Record<string, string>),
    moduleCss(path.join(WEB, "src/components/glossary/glossary.module.css"), glossaryStyles as Record<string, string>),
    moduleCss(path.join(WEB, "src/components/practice/practice.module.css"), practiceStyles as Record<string, string>),
  ].join("\n");
  return `<!doctype html>
<html lang="${s.locale === "zh" ? "zh-Hans" : s.locale}">
<head><meta charset="utf-8"><title>task8 ${s.name} (${s.q.id} ${s.locale})</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap">
${links.join("\n")}
<style>
${tokens}
body{margin:0;background:var(--paper);color:var(--ink);font-family:'BIZ UDPGothic','Noto Sans SC',sans-serif;font-size:15px;line-height:1.75;border-top:4px solid var(--ink)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.harness-main{max-width:1240px;margin:0 auto;padding:16px 32px 40px;display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start}
.harness-main>*:first-child{flex:1 1 520px}.harness-main>*:last-child{flex:1 1 460px}
.harness-foot{border-top:1px solid var(--rule)}.harness-foot>div{max-width:1240px;margin:0 auto;padding:14px 32px}
${css}
</style></head>
<body>${body}</body></html>
`;
}

describe("visual samples (D-189 §9)", () => {
  it("renders the sample set with its key fields (CAPTURE_SAMPLES=1 writes the pages)", () => {
    const write = process.env.CAPTURE_SAMPLES === "1";
    if (write) mkdirSync(OUT, { recursive: true });
    for (const s of samples()) {
      const face = renderFace(s.q, s.locale, {
        picked: s.picked,
        showTranslation: s.showTranslation ?? false,
        preambleChars: s.fold ?? null,
        foldPreamble: s.fold !== undefined,
        recent: [false, true],
        stars: 2,
      });
      const pane = renderPane(s.q, s.locale, s.picked, {});
      for (const fid of s.expect) expect(fidAll(face + pane, fid).length, `${s.name}: ${fid}`).toBe(1);
      if (!write) continue;
      const bar = s.picked ? renderAnswerBar(s.q, s.locale) : "";
      const body = `<main class="harness-main">${face}${pane}</main><footer class="harness-foot"><div>${bar}</div></footer>`;
      const html = page(s, body).replace(/src="\/quiz-figures\//g, `src="/apps/web/public/quiz-figures/`);
      writeFileSync(path.join(OUT, `task8-${s.name}.html`), html);
      console.log(`[samples] task8-${s.name}.html ← ${s.q.id} ${s.locale}`);
    }
  });
});
