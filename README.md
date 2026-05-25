<div align="center">

# IT Passport Learning

### A trilingual web app for the IT Passport (ITパスポート) certification exam

*Structured Japanese textbook content + AI-powered study tools — in **JP / ZH / EN**.*

[![Live](https://img.shields.io/badge/live-itlearn.bojiangz.com-0070f3?style=for-the-badge&logo=vercel&logoColor=white)](https://itlearn.bojiangz.com)
[![Phase 4](https://img.shields.io/badge/Phase%204-%E2%9C%85%20DONE-brightgreen?style=for-the-badge)](docs/STATE.md)
[![Tests](https://img.shields.io/badge/tests-978%20passing-0A9EDC?style=for-the-badge&logo=vitest&logoColor=white)](#tech-stack)
[![ADRs](https://img.shields.io/badge/locked%20ADRs-107-6f42c1?style=for-the-badge)](docs/decisions/)

[![Next.js](https://img.shields.io/badge/Next.js-15.5-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![AI SDK](https://img.shields.io/badge/AI%20SDK-v6-000?logo=vercel&logoColor=white)](https://ai-sdk.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-pending-lightgrey)](#license)

:gb: **English** &nbsp;&middot;&nbsp; [:cn: 中文版 README](README.zh-CN.md)

</div>

---

## What is this?

**[itlearn.bojiangz.com](https://itlearn.bojiangz.com)** — a trilingual study tool for the Japanese IT Passport exam (令和 6 年度).

Non-native learners of Japanese technical exams get blocked by **kana/kanji recognition**, not by concepts. `アクセシビリティ → accessibility → 可访问性`, seen once, sticks. This project turns one textbook into a complete trilingual learning experience — read the textbook, quiz yourself, look up terms, chat with AI, and get personalized tutoring, all in three languages.

### Five study surfaces

| Surface | What it does |
|---|---|
| **Book** | Full textbook reader — 16 chapters, continuous-page flow, inline translation, chapter-scoped chat & quiz, reading progress tracking |
| **Quiz** | Practice questions grouped by chapter — AI-powered explanations for every answer |
| **Glossary** | 908-term trilingual glossary — grouped by domain & chapter, with `kana_helper` annotations and AI hover explanations |
| **Chat** | Free-form AI conversation about IT Passport topics — context-aware, with conversation history |
| **Tutor** | AI study assistant — reads your progress, quiz results, and chapter status to give personalized guidance with auto-escalation for hard questions |

### Three theme shells

Switch between visual themes at any time:

- **Gamified** — modern gradient UI with progress gamification
- **Retro** — Windows 95 aesthetic with draggable windows
- **Terminal** — hacker/terminal aesthetic with green-on-black

---

## Quick start

Visit **[itlearn.bojiangz.com](https://itlearn.bojiangz.com)** — no install needed.

The app supports three UI languages (Japanese / Chinese / English) via the locale switcher.

---

## Architecture

```
itlearn.bojiangz.com
        │
        ▼
┌─────────────────────────────────────┐
│  Next.js 15 (App Router, Turbopack) │
│  React 19 · Tailwind CSS v4         │
│  next-intl (ja/zh/en)               │
├─────────────────────────────────────┤
│  5 pages: /book /chat /quiz         │
│           /glossary /tutor          │
├─────────────────────────────────────┤
│  5 API routes:                      │
│    /api/chat        (DeepSeek V4)   │
│    /api/quiz/explain (DeepSeek V4)  │
│    /api/glossary/hover (DeepSeek V4)│
│    /api/tutor       (multi-provider)│
│    /api/hello-ai    (health check)  │
├─────────────────────────────────────┤
│  AI SDK v6 (streamText)             │
│  DeepSeek V4 Flash/Pro · Anthropic  │
│  Claude Sonnet/Opus · OpenAI (stub) │
├─────────────────────────────────────┤
│  Vercel (deploy) · Analytics ·      │
│  Speed Insights                     │
└─────────────────────────────────────┘
        │
        ▼
  cert-extractor pipeline (Phase 1)
  Mistral OCR + Claude LLM → trilingual dataset
```

---

## Phase roadmap

| Phase | Status | What shipped |
|---|---|---|
| **Phase 1 — Content factory** | :white_check_mark: Done | `cert-extractor` pipeline — 554 pages, 2224 entities, 6059 trilingual leaves, 908-term glossary. Two GitHub Releases (v1.0.0 + v1.0.2). |
| **Phase 2 — Study tool** | :white_check_mark: Done | Next.js 15 web app — Chat, Quiz, Glossary surfaces. DeepSeek AI integration. Trilingual UI. Vercel deployment. |
| **Phase 3 — Book reader** | :white_check_mark: Done | Full textbook reader — 16-chapter continuous flow, inline translation toolbar, chapter-scoped chat & quiz, reading progress with completion tracking. |
| **Phase 4 — AI tutor** | :white_check_mark: Done | AI study assistant — multi-provider brain (DeepSeek/Anthropic/OpenAI), tutor context awareness, auto-escalation, three themed shells (Gamified/Retro/Terminal). |
| **Stage 8-9 — Content rebuild** | :white_check_mark: Done | Web-ready textbook pipeline — 16 chapter blueprints + 105 lesson JSON files reconstructed from OCR. |
| **Stage 10 — Figure extraction** | :hourglass: Next | Extract and link figures from textbook pages. |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, Radix UI, Lucide icons |
| AI | AI SDK v6, DeepSeek V4 Flash/Pro, Anthropic Claude Sonnet/Opus |
| i18n | next-intl (Japanese / Chinese / English) |
| Testing | Vitest (486 frontend tests), Playwright (e2e), pytest (492 pipeline tests) |
| Deploy | Vercel, Vercel Analytics, Speed Insights |
| Content pipeline | Python 3.11+, uv workspace, Mistral OCR, Claude LLM |
| Rate limiting | Upstash Redis |

---

## Repository layout

```
.
├── apps/web/                    Next.js 15 web application
│   ├── src/app/[locale]/        5 page routes (book/chat/quiz/glossary/tutor)
│   ├── src/app/api/             5 API routes (chat/quiz/glossary/tutor/hello-ai)
│   ├── src/components/          UI components + 3 themed shells
│   ├── src/lib/                 AI providers, data layer, utilities
│   └── messages/                i18n strings (ja/zh/en)
├── packages/extractor/          Phase 1 cert-extractor pipeline
├── docs/                        STATE.md, ADRs, session logs
│   ├── STATE.md                 Live project state (truth source)
│   ├── decisions/               107 locked ADRs (D-001 … D-107)
│   └── discussion/              60 session logs
├── evidence/                    Audit evidence (Rule A)
├── failures/                    Failed attempt archive (Rule B)
├── data/                        [gitignored] Runtime pipeline data
└── .source/                     [gitignored] Source textbook EPUB
```

---

## Development

```bash
# Clone
git clone https://github.com/hakupao/it-passport-learning
cd it-passport-learning

# Web app
cd apps/web
pnpm install
pnpm dev              # http://localhost:3000

# Run tests
pnpm test             # Vitest (486 tests)
pnpm test:e2e         # Playwright e2e

# Content pipeline (Phase 1)
cd ../..
uv sync
uv run pytest packages/extractor/tests/
```

### Environment variables

The web app needs AI provider keys to power the chat/quiz/tutor features:

| Variable | Required | Description |
|---|---|---|
| `LLM_PROVIDER` | Yes | Default AI provider (`deepseek`) |
| `DEEPSEEK_API_KEY` | Yes | DeepSeek API key |
| `LLM_PROVIDER_TUTOR` | No | Tutor-specific provider override (`deepseek` / `anthropic`) |
| `ANTHROPIC_API_KEY` | No | Anthropic API key (for tutor Anthropic toggle) |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token |

---

## Build provenance

<details>
<summary><strong>Phase 1 pipeline metrics</strong></summary>

| Metric | Value |
|---|---|
| Source corpus | IT パスポート 令和 6 年度 — 579 pages |
| Output | 554 pages, 2224 entities, 6059 trilingual leaves, 908-term glossary |
| Cost | Mistral $0.58 billed, Anthropic $0 billed |
| Post-pub corrections | ~736 JSON edits via 100% automated validation |
| Latest release | [`itpassport-r6-v1.0.2`](https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.2) |

</details>

<details>
<summary><strong>Project statistics</strong></summary>

| Metric | Value |
|---|---|
| Locked ADRs | 107 (D-001 … D-107) |
| Session logs | 60 |
| Test suite | 486 frontend (Vitest) + 492 pipeline (pytest) = **978 tests** |
| Git tags | 7 (3 content releases + 4 phase ship tags) |
| Phases completed | 4 |

</details>

---

## License

- **Code, pipeline, ADRs** — License pending (will be a permissive OSS license; consult repo owner before redistribution).
- **Source textbook** — Not redistributed. You must legally acquire the EPUB separately to re-run the pipeline.
- **Generated trilingual content** — Released via GitHub Releases for personal-study use.

---

## Contributing

This is a personal R&D project. Issues and PRs welcome. Read [`docs/STATE.md`](docs/STATE.md) and the most recent session log before opening anything substantive.

<p align="right"><a href="#it-passport-learning">↑ back to top</a></p>
