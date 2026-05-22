# D-101 — Phase 3 形态 = 教科书阅读体 (B 学习站) as canonical trunk

| 字段 | 值 |
|---|---|
| ID | D-101 |
| Topic | Phase 3 形态锁 |
| Status | **LOCKED 2026-05-22** (Session 49 Turn 4) |
| Supersedes | — |
| Superseded by | — |
| Related | D-083 §2.5 (OQ-05 partial close); D-085 §2.4 (3 surfaces locked); D-088 §2.3 + D-095 §2.3 (stable-prefix); D-097 (Basic Auth firewall); D-099 (i18n stack); D-091 §2.1 (cost projection) |
| Closes OQ | **OQ-05 (partial → fully closed per §2.6)** |
| Decision-on-lock writeback | `docs/discussion/2026-05-22-session-49.md` §4 同 turn (per D-027) |

---

## 1. 背景 / Why

Phase 2 close (Session 48 2026-05-21) shipped 3 surfaces — `/[locale]/chat` (tutor) + `/[locale]/quiz` (题库) + `/[locale]/glossary` (术语). User feedback Session 49 entry 2026-05-22:

> 目前只有提问+题库+专有名词，根本不是一个教科书学习的样子，我希望是一个教科书的样子，可以让我从头到尾学一遍，学习过程中做题+提问。**现在没有主体**。

The 3 Phase 2 surfaces are all lookup/interaction tools — there is no continuous reading flow. The textbook (554 pages / 16 chapters from Phase 1 itpassport-r6 v1.0.3) is not surfaced as a readable artefact. Phase 3 fills this gap.

Per D-083 §2.5 the Phase 3 form was deliberately deferred "等 Phase 2 实施反馈"; that feedback now exists. D-101 closes OQ-05 partial-open re Phase 3 form.

---

## 2. 决定 / Decision

### §2.1 Reading shell at `/[locale]/book` as canonical trunk

`/[locale]/book` becomes the new homepage. `/[locale]` redirects to `/[locale]/book`. NavTabs simplified per OQ-A (round-2 4Q TBD). The 3 Phase 2 surfaces (chat/quiz/glossary) **lose top-level entry points** and become inline-triggered from book context. Existing endpoints + components STAY — zero backend refactor; the change is navigation + composition.

### §2.2 阅读单元 = Chapter (16 章)

Chapter is the reading unit per `apps/web/_fixtures/v1.0.3/index.v2.json chapters[]` (16 chapters, monotonic). URL = `/[locale]/book/chapter/NN` (NN ∈ 01-16, zero-padded). Each chapter renders its constituent pages (~35/chapter mean, 554 / 16) as a continuous scrollable flow.

### §2.3 Content body = ja-only; zh/en = on-demand inline triggers

- **Textbook body**: strictly ja (Phase 1 OCR original; no dependency on stage 7 translation data).
- **Terms inline**: glossary surface scan + `<TermPopover />` (Phase 2 component, **zero refactor**); already trilingual ja/zh/en built-in.
- **Paragraph-level zh/en explanation / translation**: **on-demand inline triggers only**. Small popover/modal opens on user click, closes when dismissed. NO permanent split-pane, NO persistent sidebar, NO pre-rendered translation under each paragraph.
- **Implementation reuse**: triggers send to existing `/api/chat` with a prompt like `"请翻译以下段落到中文：[paragraph]"`. **Zero new API endpoint**.
- **LocaleSwitcher independence**: D-099 `LocaleSwitcher` continues to drive **chrome i18n only** (NavTabs labels, button captions, error messages); content body locale is fixed to ja regardless of chrome locale.

### §2.4 Progress tracking via localStorage (D-085 §2.2 模式扩展)

New `apps/web/src/lib/book/progressStore.ts` (modeled after `historyStore.ts`):

```
{
  schemaVersion: 1,
  chapters: {
    "01": { scrollY: 0..1, completedAt: ISO8601 | null },
    ... "16": { scrollY, completedAt }
  },
  quiz: { "page_NNN_entity_M": { lastAnswered: ISO8601, correct: bool } }
}
```

Visualizations:
- `/[locale]/book` index = TOC + per-chapter completion % + overall (X/16 chapters done)
- Inside chapter reader = scroll position restore on return

"章节完成" criterion deferred to OQ-C (round-2 4Q).

### §2.5 Reuse Phase 2 infrastructure (zero API / middleware / AI-prompt changes)

| Asset | Phase 3 disposition |
|---|---|
| `/api/chat` | Reused (paragraph-translate / chapter-scoped Q&A) |
| `/api/quiz/explain` | Reused (chapter-scoped quiz from book context) |
| `/api/glossary/hover` | Reused (term annotations) |
| `<TermPopover />` | Reused as-is (zero refactor) |
| `<QuizExplain />` | Reused as-is (triggered from book context) |
| `<Chat />` | TBD inline modal wrap vs reuse (OQ-B) |
| D-097 Basic Auth firewall | Untouched |
| D-099 next-intl chrome | Untouched (decoupled from content body per §2.3) |
| D-085 §2.2 historyStore (Chat) | Untouched (new progressStore is separate) |
| AI SYSTEM_INSTRUCTION (D-095 §2.3) | Untouched — preserves 7-day DeepSeek prefix cache TTL |

### §2.6 Closes OQ-05 (partial → fully closed)

D-083 §2.5 partial-close was: "Phase 2 部分由 D-083 §2.5 锁；Phase 3/4 形态 + 顺序继续 open". D-101 fully closes:

- ✅ Phase 3 形态 = 本 ADR §2.1-§2.5 (B 学习站 textbook reading trunk)
- ✅ Phase 3 ↔ Phase 4 顺序 = **先 Phase 3，再 Phase 4** (Phase 4 = AI 学习助手 形态待 Phase 3 实施反馈)
- ⏸ Phase 4 形态 = STILL OPEN (deferred until Phase 3 implementation reveals real needs)
- ⏸ Phase 5 (cert-extractor 通用化) / Phase 6+ (multi-user + monetization) — unchanged per D-083 §3.1 / §3.5

### §2.7 Reversibility

- NavTabs refactor reversible via git revert
- `/[locale]/book` routes additive; existing `/[locale]/{chat,quiz,glossary}` can stay as escape-hatch URLs (TBD per OQ-A)
- progressStore localStorage = client-side only; users can `localStorage.removeItem('book.progress.v1')` to reset
- D-101 itself can be superseded if Phase 3 实施反馈 reveals form needs to change

---

## 3. Rejected Alternatives

| # | Alternative | Why rejected |
|---|---|---|
| 1 | Stay frozen, no Phase 3 | User explicitly opened via "没有主体" feedback |
| 2 | PDF-style viewer (no inline chat/quiz) | Loses core "学习过程中做题+提问" value |
| 3 | Page (1/554) as reading unit | Too granular; "我读到第 042 页" 不是自然心智模型 |
| 4 | Chapter TOC → page list → single page (3-level nav) | UI complexity unjustified |
| 5 | 三语 split-pane (ja/zh/en parallel) | Mobile unusable; desktop info-density too high |
| 6 | LocaleSwitcher 联动正文 (switch locale → switch content body) | Requires stage 7 translation parity (unverified); abandons ja-textbook authenticity |
| 7 | Permanent zh/en translation sidebar | Always-on UI clutter for occasional need |
| 8 | Pre-rendered zh/en under each paragraph | Performance waste; most paragraphs don't need translation |
| 9 | Top 4-tab (book + chat + quiz + glossary parallel) | Doesn't solve "no main body" problem; user chose book-as-only-home in round-1 Q1 |
| 10 | No progress tracking | "我读到哪了" feedback is core to textbook study UX |
| 11 | Adaptive recommendation (错题再来 / 薄弱章节加强) | Slides into Phase 4 (AI 学习助手) territory; Phase 3 scope bloat |

---

## 4. Implications

- **Module structure** (TBD per OQ-D): likely 4-5 modules — A Data layer / B Reading shell / C Inline triggers / D Progress / E Polish/ship
- **Cost envelope**: paragraph-translate triggers add LLM call frequency (per-paragraph instead of per-章). Mitigated by D-088 §2.3 stable-prefix invariant (96%+ cache hit). Phase 3 projected ≤ \$0.05 cumulative 真 (reads are passive; LLM only on user-initiated trigger)
- **β graduation**: Phase 3 stays in α scope (single-user behind D-097 Basic Auth); β-open queue from `RETROSPECTIVE_phase2.md §2.x` unchanged
- **Tier**: Phase 3 = Tier 3 (parallel to Phase 1/2)
- **Phase 2 retro § "保留下来的做法"** all reused in Phase 3: D-019 §3a slow-pace · D-027 same-turn writeback · D-088 §2.3 stable-prefix · D-094 §2.1 in-source LD · D-085 §2.2 localStorage Resume pattern · Rule A/B/C/D · D-097 firewall

---

## 5. Next-step open questions (OQ-A/B/C/D — round-2 4Q)

| OQ | Topic | Open options |
|---|---|---|
| **OQ-A** | NavTabs disposition | (a) delete entirely / (b) simplify to LocaleSwitcher only / (c) footer dock / (d) keep but stripped + repurposed |
| **OQ-B** | Inline chat/quiz trigger UI | (a) persistent buttons per paragraph/章 / (b) FAB (floating action button) / (c) 章末 fixed actions / (d) context menu on selection |
| **OQ-C** | 章节完成 criterion | (a) scroll-to-end / (b) chapter-end quiz completed / (c) user manual mark / (d) no strict criterion |
| **OQ-D** | Phase 3 step plan granularity | (a) 1 large step / (b) 3-5 steps / (c) Phase 2 同样 4 modules × N steps |

OQ-A/B/C/D enter slow-pace round-2 4Q immediately after this lock.

---

## 6. History

- **2026-05-21 Session 48**: Phase 2 ✅ FROZEN + TAGGED (`phase2-α-ship-2026-05-21`) per Q1=a Playwright + Lighthouse + axe-core ratification
- **2026-05-22 Session 49 Turn 1-2**: User feedback "现在没有主体" triggers Phase 3 form crystallization; OQ-05 from "partial close" status moves to closing path
- **2026-05-22 Session 49 Turn 3**: D-019 §3a round-1 4Q (导航 / 粒度 / 语言 / 进度) answered by user
- **2026-05-22 Session 49 Turn 4 (THIS ADR)**: D-101 LOCKED + OQ-05 fully closed + Phase 3 设计阶段 in progress
- **(next) Session 49 Turn 5+**: OQ-A/B/C/D round-2 4Q
