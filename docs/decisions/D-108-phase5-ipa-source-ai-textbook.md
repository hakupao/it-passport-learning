# D-108 — Phase 5 方向: 基于 IPA 官方源的 AI 教科書生成

> **Status**: LOCKED · Session 62 · 2026-05-26
>
> **Scope**: Phase-level architectural pivot. Supersedes D-107 (Stage 8-11 web-ready textbook pipeline from book extraction).

---

## §1 Background

Phase 1 built an OCR + LLM pipeline to extract content from a physical IT Passport textbook. Stages 8-10 (under D-107) attempted to reconstruct this extracted content into a web-ready format. User concluded that:

1. Books optimize for physical medium (spatial design, layout, typography) — digital extraction inevitably degrades these qualities
2. The extracted content quality cannot match the original
3. A better path is to go directly to the **authoritative source** that textbook authors themselves reference

## §2 Decision

### §2.1 New direction

Abandon book extraction. Build the learning content from IPA (情報処理推進機構) official materials:

| Source | Role |
|--------|------|
| シラバス Ver.6.5 | Knowledge tree (大分類→中分類→小分類→用語) — structural backbone |
| 過去問題 FY2009-FY2025 | Question bank (~2000 questions) — exam practice + content generation reference |
| 試験要綱 Ver.5.5 | Exam metadata (scoring, composition, passing criteria) |
| IT用語集 Ver.5.1 | Official term normalization — glossary authority |
| 擬似言語サンプル | Programming section reference |

### §2.2 Content generation strategy

Use AI (Claude) to generate a comprehensive trilingual textbook based on the syllabus tree:

- **Japanese primary**: all terms and core explanations in Japanese (exam language)
- **Chinese + English full translation**: complete parallel translations for learning ease
- **Depth**: systematic + detailed, treat every reader as a beginner
- **Diagrams**: include visual aids (Mermaid/SVG) where they aid understanding
- **Pre-computed**: all translations generated offline, not real-time API (per user preference)

### §2.3 Infrastructure reuse

| Keep | Discard |
|------|---------|
| Next.js app framework | `packages/extractor/` (Phase 1 OCR pipeline) |
| AI tutor (DeepSeek/Anthropic) | Book reader components (ChapterReader, BookIndex, etc.) |
| Quiz system | Book routes (`/[locale]/book/`) |
| Glossary system | Book lib (`chapterScope`, `progressStore`, etc.) |
| Chat system | Stage 8-10 data + processing scripts |
| i18n trilingual framework | Stage 11 plan (HTML side-by-side review) |

### §2.4 Cost gate removal

LLM API call approval gate removed from CLAUDE.md. Phase 5 will make extensive AI calls for content generation; per-call approval is impractical.

## §3 Rejected alternatives

| Alternative | Why rejected |
|-------------|-------------|
| Continue Stage 10-11 book extraction | User concluded extracted content cannot match book quality — diminishing returns on a flawed premise |
| Use third-party study platforms as source | Not authoritative; copyright concerns; no structural advantage over going to IPA directly |
| Manual content authoring (no AI) | Impractical for ~1000+ knowledge nodes × 3 languages at beginner detail level |
| Use only past exams (no syllabus) | Exams sample from the syllabus; syllabus is the complete scope definition — exams alone would leave coverage gaps |
| Keep book-extracted content as supplementary reference | User explicitly said "没有价值，完全不需要" |

## §4 Risks

| Risk | Mitigation |
|------|-----------|
| シラバス PDF parsing errors | Claude vision extraction + Rule A N-sample audit |
| AI-generated content inaccuracy | Cross-reference with past exam answers; Rule A audit per batch |
| Syllabus version updates | Track IPA 変更箇所表示版; re-generate affected nodes only |
| Scale (~1000+ nodes × 3 languages × diagrams) | Batch processing with capped batch size (per memory); incremental approach |

## §5 References

- IPA シラバス: `https://www.ipa.go.jp/shiken/syllabus/gaiyou.html`
- IPA 過去問: `https://www3.jitec.ipa.go.jp/JitesCbt/html/openinfo/questions.html`
- D-107 (superseded Stage 8-11 pipeline)
- Session 62 log: `docs/discussion/2026-05-26-session-62.md`
