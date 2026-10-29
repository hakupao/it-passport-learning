<div align="center">

# IT Passport Learning

### A trilingual past-exam practice app for the IT Passport (ITパスポート) certification exam

*29 IPA past exams (FY2009–FY2026), a syllabus-aligned textbook and a glossary — in **JP / ZH / EN**.*

[![Live](https://img.shields.io/badge/live-itlearn.bojiangz.com-0070f3?style=for-the-badge&logo=vercel&logoColor=white)](https://itlearn.bojiangz.com)
[![Stage 7](https://img.shields.io/badge/Stage%207-textbook%20v2%20rewrite%20in%20progress-orange?style=for-the-badge)](docs/STATE.md)
[![Tests](https://img.shields.io/badge/tests-1264%20passing-0A9EDC?style=for-the-badge&logo=vitest&logoColor=white)](#tech-stack)
[![Decisions](https://img.shields.io/badge/locked%20decisions-203-6f42c1?style=for-the-badge)](docs/decisions/)

[![Next.js](https://img.shields.io/badge/Next.js-15.5-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-only-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-pending-lightgrey)](#license)

:gb: **English** &nbsp;&middot;&nbsp; [:cn: 中文版 README](README.zh-CN.md)

</div>

---

## What is this?

**[itlearn.bojiangz.com](https://itlearn.bojiangz.com)** — *ITパスポート 過去問ノート*, a study app for the Japanese IT Passport exam built around the real past questions.

Non-native learners of Japanese technical exams get blocked by **kana/kanji recognition**, not by concepts. `アクセシビリティ → accessibility → 可访问性`, seen once, sticks. So every question keeps its original Japanese text with a Chinese and English translation you can show or hide, and every explanation is available in all three languages.

### What's in it

| Page | What it does |
|---|---|
| **Today** | Daily plan: mistakes to redo, reviews that are due and new questions (picked by the exam's field ratio). New users start with a 20-question baseline. Also shows progress over the 2,900 past questions, an exam-date countdown, weak topics (low accuracy × often tested), accuracy by field against the pass rule (600/1000 overall, ≥300/1000 in each field) and 3 glossary terms for today. |
| **Practice** | One question per screen: browse by exam or by topic, practise with your own settings, or redo your mistakes. Japanese question text with a ZH/EN translation toggle, enlargeable figures, and a trilingual explanation after you answer. |
| **Mock exam** | 100 questions in 120 minutes, as in the real exam: a random draw in the official field ratio (strategy 35 / management 20 / technology 45) or one whole past exam. Scored 0–1000; results only at the end. |
| **Textbook** | Syllabus-aligned trilingual study units — 63 topics, 244 units — with key points, figures and check questions taken from the past exams. |
| **Glossary** | 1,395 textbook terms, searchable in Japanese, Chinese and English, each linked to its textbook unit and related past questions. |
| **Record** | Totals, reviews due over the next 7 days, questions per day (5 weeks) and accuracy by topic. |
| **Settings** | Exam date, daily review limit, daily new questions, default translation visibility, interface language. |

The interface language switches between 日 / 中 / EN. Your learning record is kept in the browser on your device; no account is needed.

### Planned: AI tutor

An AI tutor (*AI 先生*) — ask about a question, a term or a textbook unit, and get a review of your weak topics — is **planned and not yet open to visitors**.

---

## Quick start

Visit **[itlearn.bojiangz.com](https://itlearn.bojiangz.com)** — no install needed.

---

## Architecture

```
itlearn.bojiangz.com
        │
        ▼
┌──────────────────────────────────────────┐
│  Next.js 15 (App Router, Turbopack)      │
│  React 19 · Tailwind CSS v4 · next-intl  │
├──────────────────────────────────────────┤
│  Pages /[locale]/…                       │
│    today (home) · practice · mock        │
│    textbook · glossary · record          │
│    settings · quiz (old-link redirect)   │
├──────────────────────────────────────────┤
│  API routes                              │
│    /api/quiz/questions                   │
│    /api/quiz/feedback  (owner only)      │
│    /api/learning       (owner sync)      │
│    /api/sensei/terms (AI tutor, planned) │
├──────────────────────────────────────────┤
│  Data: committed JSON corpus             │
│    data/ip/quiz      2,900 questions     │
│    data/ip/textbook  244 units           │
│  Learning record: browser storage        │
│    (+ Upstash Redis sync for the owner)  │
├──────────────────────────────────────────┤
│  Vercel · Analytics · Speed Insights     │
└──────────────────────────────────────────┘
        ▲
        │ built offline by
  scripts/  (Node / TypeScript pipeline)
  IPA past exams + syllabus → Claude extraction,
  checks and translation → trilingual corpus
```

---

## Content

| Item | Source | What the app has |
|---|---|---|
| Past questions | IPA 過去問題, FY2009–FY2026 (29 exams) | 2,900 questions, 511 with figures; Japanese original + ZH/EN translation; trilingual explanations; each question mapped to one of 63 syllabus topics |
| Textbook | IPA シラバス Ver.6.5 as the skeleton, AI-generated | 244 units in 63 topics (strategy 98 / management 23 / technology 123), 1,417 term entries |
| Glossary | Built from the textbook terms | 1,395 entries |

The past-exam text was extracted from the IPA PDFs with Claude vision, then repaired and checked against the source in several full passes, with independent sample audits recorded under `evidence/`.

---

## Status

| Stage | Status | What it covers |
|---|---|---|
| **Phase 1–4 (first app)** | :white_check_mark: Retired | First version built on a purchased textbook (Book / Quiz / Glossary / Chat / Tutor, three theme shells). Replaced by the IPA-based rebuild below. |
| **Stages 1–3.5 — IPA source data** | :white_check_mark: Done | Syllabus structure; all 2,900 past questions extracted, repaired and mapped to syllabus topics. |
| **Stage 4 — Textbook v1** | :white_check_mark: Done | 244 trilingual units generated. |
| **Stage 6 — App data integration** | :white_check_mark: Shipped | Textbook reader, past-question practice with translations and explanations, glossary. |
| **Stage 7 — UI redesign** | :white_check_mark: Shipped | One design for every page (Today / Practice / Textbook / Glossary / Record / Settings), mock exam, learning record, new textbook reader. |
| **Stage 7 — Textbook v2 batch rewrite** | :hourglass: In progress | Units are being rewritten to the v2 format in batches: 13 of 244 so far. |
| **AI tutor** | :calendar: Planned | Not yet open to visitors. |

The live state is in [`docs/STATE.md`](docs/STATE.md).

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, Radix UI, Lucide icons |
| i18n | next-intl (Japanese / Chinese / English) |
| Storage | Browser storage for the learning record; Upstash Redis for owner sync and question feedback |
| Testing | Vitest (1,264 tests), Playwright (e2e) |
| Deploy | Vercel, Vercel Analytics, Speed Insights |
| Content pipeline | Node / TypeScript scripts; Claude (Anthropic) for extraction, review and translation |

---

## Repository layout

```
.
├── apps/web/                    Next.js 15 web application (the only pnpm workspace member)
│   ├── src/app/[locale]/        Page routes (practice, mock, textbook, glossary, record, settings, …)
│   ├── src/app/api/             API routes (quiz, learning, sensei)
│   ├── src/components/          UI components
│   ├── src/lib/                 Data loaders, learning record, review scheduling, mock exam
│   ├── public/quiz-figures/     Past-exam figures (WebP)
│   ├── e2e/                     Playwright tests
│   └── messages/                i18n strings (ja/zh/en)
├── data/ip/quiz/                Committed question corpus (questions, translations, explanations)
├── data/ip/textbook/            Committed textbook units, figures, unit index
├── scripts/                     Extraction / repair / generation pipeline scripts
├── docs/
│   ├── STATE.md                 Live project state (truth source)
│   ├── decisions/               ADRs for major decisions
│   └── discussion/              Session logs
├── evidence/                    Audit evidence (Rule A)
└── failures/                    Failed attempt archive (Rule B)
```

The raw IPA PDFs and intermediate data (`data/ip/exams`, `data/ip/sources`, `data/ip/syllabus`, `.source/`) are gitignored.

---

## Development

Requires Node ≥ 20.9 and pnpm 11.

```bash
# Clone
git clone https://github.com/hakupao/it-passport-learning
cd it-passport-learning

# Install (from the workspace root)
pnpm install

# Web app
cd apps/web
pnpm dev              # http://localhost:3000
pnpm build

# Checks
pnpm test             # Vitest
pnpm lint
pnpm test:e2e         # Playwright e2e

# Quiz answer-key cross-check (repo root)
cd ../..
pnpm check:quiz:ci    # committed data only
```

The app reads the committed corpus under `data/ip/`, so it runs locally without any environment variables. Without Redis and an owner key, the learning record simply stays in the browser.

### Environment variables

All optional.

| Variable | Description |
|---|---|
| `OWNER_KEY` | Site-owner secret. Opening any page once with `?owner_key=<OWNER_KEY>` sets the owner cookie, which enables record sync and question feedback. Unset = nobody is owner. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis for the owner's record sync and question feedback (`KV_REST_API_URL` / `KV_REST_API_TOKEN` are also accepted). |
| `QUIZ_DATA_ROOT` / `TEXTBOOK_DATA_ROOT` | Override the data directory (default `../../data/ip`, relative to `apps/web`). |

---

<details>
<summary><strong>Project statistics</strong></summary>

| Metric | Value |
|---|---|
| Past questions | 2,900 (29 exams, FY2009–FY2026) |
| Textbook | 63 topics, 244 units (13 on v2) |
| Glossary | 1,395 entries |
| Locked decisions | 203 (D-001 … D-203) |
| Session logs | 73 in `docs/discussion/` |
| Unit tests | 1,264 (Vitest, 110 files) |

</details>

---

## License

- **Code, pipeline, ADRs** — License pending (consult the repo owner before redistribution).
- **Past-exam questions** — Based on the past exam questions published by IPA; copyright belongs to IPA. The text has been OCR-extracted, cleaned, classified by syllabus topic and translated, so it differs from the original.
- **Textbook and explanations** — AI-generated for this project.

---

## Contributing

This is a personal R&D project. Issues and PRs welcome. Read [`docs/STATE.md`](docs/STATE.md) and the most recent session log before opening anything substantive.

<p align="right"><a href="#it-passport-learning">↑ back to top</a></p>
