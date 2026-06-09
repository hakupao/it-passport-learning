# D-135 — Quiz v1 = JP-first 真題練習面、三語翻訳 + 預存解析は backfill 預生成管線

> Session 86 (2026-06-09) / Phase 5 Stage 6 / Status: **LOCKED**
> 関連: D-134 (配信)、D-114 (双軌導航)、D-118 (Schema)、D-119/D-128〜132 (Stage-4 生成パターン)、D-132 (LLM チャネル)

## 文脈

旧 quiz は S63 で消えた `_fixtures/v1.0.3` 語料に依存 → 500。Quiz 接過去問 = 旧 quiz を IPA `question_bank` (2900 題、29 回、63 主題マップ済、JP のみ) へ移行。ユーザー回答 (Session 86):
- Q1: band-aid せず直接再建 (止血=真修)
- Q3: 全部预生成三语翻译
- Q4: syllabus 主題別 + 試験年度別 (両方)、主題別は教科書 unit に埋込
- Q5: JP 先上线、翻訳増量回填
- Q6: 解析は預生成 (預存)
- Q7: figure 問含む

## 決定

### v1 (Phase 0) = JP-first 真題練習面
- 表示: JP `stem_jp`/`choices_jp` + `correct_answer` + **出典** (D-134 compliance)。
- **2 モード**: ① syllabus 主題別 (63 topic、`syllabus_refs.primary_topic`、教科書 unit へ埋込可能) ② 試験年度別 (29 回、「一套真題」)。
- figure 問含む (最適化済 figure を描画)。
- データ層 = 自前 `lib/quiz/quizReader.ts` (S85 `reader.ts` 踏襲、死 FsDataSource 非依存)、派生 `data/ip/quiz/` を読む。

### 翻訳・解析 = 預生成 backfill 管線 (Phase 1/2)
- **翻訳** (2900×{zh,en} stem+choices): 独立管線、**バッチ**、各バッチ **Rule A N-sample 独立抽検**、派生 corpus へ追記。UI は zh/en 利用可能時表示・JP fallback (= JP 先上线/増量回填、Q5)。
- **解析** (2900× 三語): **預生成 (build-time)・預存**、バッチ、Rule A。UI で解析表示。
- 両管線とも **Workflow orchestration** + `model=opus` (D-132: LLM は Claude Code 経路、外部 API 不使用)。Stage-4 (D-128〜132) の生成パターンを踏襲。
- **runtime AI 解析ではない** (預存優先、ユーザー Q6)。

## 理由

- JP-first = 過去問原文は日本語が authoritative (Stage-4 と同じ「日本語権威源」思想)。早期に使える quiz を出し、大翻訳に阻まれない (Q5)。
- 預存翻訳/解析 = 学習コンテンツの一貫性 (real-time API の訳ブレを避ける、ユーザー既定方針)。
- 2 モードは同一 corpus の異なる index = 低コストで両立。

## 却下した代替案

| 案 | 却下理由 |
|----|---------|
| live AI explain (旧 `/api/quiz/explain` 流用) | Q6 で却下 (預存選択)。訳/解説のブレ |
| 全翻訳完了後に一括三語上線 | Q5 で却下。quiz 上線が数 session 後ろ倒し |
| answer-only v1 (解析なし) | Q6 で却下 (預生成選択) |
| 旧 FsDataSource を IPA データで復活 | 死語料 schema (entity_by_id/page) と過去問 schema は別物。自前 reader が clean |

## 影響

- `scripts/build-quiz-corpus.mjs` (projection、D-134) → `data/ip/quiz/`。
- `apps/web/src/lib/quiz/quizReader.ts` (新)、`/[locale]/quiz` ページ再建、2 モード UI コンポーネント。
- i18n catalog (Quiz namespace)、Nav は既存 quiz タブ流用。
- 翻訳/解析管線スクリプト (Phase 1/2、Workflow)。
- Phase 3: 教科書 `UnitReader` に関連過去問セクション (D-133 繰延の inline_quiz/challenge 兑现)。

## 段階

| Phase | 内容 | 完了条件 |
|-------|------|---------|
| 0 | projection + un-gitignore + quizReader + quiz ページ再建 (JP, 2 モード, figure) | 首页治癒・全ページ 200・TDD・Rule D APPROVE |
| 1 | 翻訳 backfill (2900×{zh,en}) | 全題三語・各バッチ Rule A・UI 三語切替 |
| 2 | 解析 預生成 backfill (2900× 三語) | 全題解析・Rule A・UI 解析表示 |
| 3 | 教科書 unit へ過去問埋込 | unit に関連過去問・溯源 |

## 既知状態

- glossary/tutor/chat は死語料依存のまま 500。各自の後続サブ段階で移行 (band-aid せず=ユーザー Q1)。Quiz 再建で `/`→/quiz は治癒。
