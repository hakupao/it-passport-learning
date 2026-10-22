# D-179 — glossary / tutor / chat を topic・term 軸で再設計し、AI は BYOK ブラウザ直結にする

- **Status**: Locked (Session 131, 2026-10-21、ユーザー回答 + BYOK 方式「A 浏览器直连」選択)
- **Relates**: D-114 (シラバス树が主導航)、D-116 (記憶フック)、D-132 (web runtime は外部 API を使う)、D-133 (教科書データ in-repo)、D-134 (quiz 派生データの配信)、D-135:64 (glossary/tutor/chat は後続サブ段階で移行)、D-148 (AI 経路の owner 門 — 本 ADR の実装で AI 部分は不要になる)、D-149 (owner 鍵の feedback 流用)。
- **Closes**: OQ-04 / OQ-05 / OQ-06 / OQ-07 (S131 §3)。

## 背景 — 事実 (S131 §3、Explore opus の読み取り + 主 context 実測)

- 旧 3 機能は電子書籍 (554 頁・16 章) を単位にしていた: glossary = 頁内出現 (`first_page`・`occurrences`、定義 field なし)、tutor = 章 ch00〜15 の進度、chat = 全書 ≈5.8 万 token を context に投入。読み元 `FsDataSource` (`_fixtures/v1.0.3`) は S63 で削除済。
- 結果: glossary ページ・tutor ページは 500。chat ページは 200 で `/api/chat` だけ 500。学習進度 (`itp:book:progress:v1`) を書く経路は現在 0。
- 新資産の背骨: シラバス topic 63 → 教科書 unit 244 → term 項目 1417 (重複除き 1395、2 unit 以上に出る語 22) → 過去問 2900。quiz の `terms[]` 999 語はすべて教科書 term にある (主 context 実測)。topic_id 63 は quiz と教科書で同一。term ごとに定義・解説・たとえ・記憶フックの三語が監査済で存在する。
- `unit_index.json` だけで ≈30 万 token。全書を context に入れる旧方式は成り立たない。
- 利用者はユーザー本人、URL は公開 (ユーザー)。本番の `DEEPSEEK_API_KEY` は削除済 (ユーザー)。
- BYOK の技術確認: AI SDK は `createDeepSeek({ apiKey })` / `createAnthropic({ apiKey, headers })` で呼び出しごとに key を渡せる (Context7 `/vercel/ai`)。CORS preflight 実測 (2026-10-21): `api.deepseek.com/chat/completions` は Origin を反映して許可、`api.anthropic.com/v1/messages` は `*` で許可し `anthropic-dangerous-direct-browser-access` を allow-headers に含む。**実 POST と streaming は未検証**。

## 決定

1. **主軸**: 学習機能は topic_id と term を鍵に組む。章・頁の概念は使わない。実行時の骨格は committed の `data/ip/textbook/unit_index.json` (gitignored の `knowledge_tree.json` は実行時に使わない)。
2. **glossary = 静的な三語用語辞典**: 教科書 term (重複除き 1395) から作る。項目は 三語の定義・解説・たとえ・記憶フック・図、学ぶ unit、出題された過去問 (quiz `terms[]` から逆引き) と回数。hover カードも同じ静的データ。**表示時に LLM を呼ばない**。複数 unit に出る語 (22) のために、正規 term id → 複数 unit 参照の id 規則を実装計画で先に決める。IT用語集の抽出は後続の別 track (本 ADR の範囲外)。
3. **chat と tutor を 1 つの「AI 先生」に統合** (ユーザー決定)。入口は 題 (解答後の「なぜ」)・term・unit と自由質問。根拠は監査済み内容を topic_id / terms[] / 題 id で決定的に引いたもの (題の三語解説 + その unit の term)。全書投入はしない。ベクトル DB は使わない。
4. **AI は BYOK・ブラウザ直結** (ユーザー選択 A): 利用者が自分の API key (DeepSeek / Anthropic) を入れ、key はその利用者のブラウザにだけ保存し、ブラウザから provider へ直接送る。サーバーは LLM key を持たず受け取らない。サーバーの AI 経路 (`/api/chat`・`/api/tutor`・`/api/glossary/hover`・`/api/quiz/explain`・`/api/hello-ai`) は撤去する。必須: CSP、key の保存場所と削除方法の画面表示、key をログ・同期・送信先 provider 以外へ出さないこと。
5. **学習記録**: 主信号 = quiz の題ごとの正誤と topic ごとの正答率、副信号 = unit の既読。全訪問者は localStorage。**owner は D-148 の cookie で識別して Upstash に同期** (ユーザー「可以同步」)。API key は同期しない (端末ごとに入力)。
6. **順序** (依存とリスクの順): (1) 死語料層の撤去 + 静的辞典 (glossary の 500 を解消) → (2) quiz・教科書の term から辞典への連結 → (3) 学習記録 + owner 同期 → (4) AI 先生 (BYOK)。(4) の最初の作業は使い捨ての spike で、ブラウザ直結の実 POST と streaming を両 provider で確かめる。
7. **撤去 / 保持**:
   - 撤去: `src/lib/data/` (`FsDataSource`・`assembleScope`・`chapterScope`・`progressStore` の旧 key)、`src/lib/glossary/glossarySseTransport.ts`、`hooks/useGrouping.ts` の章区分、サーバー AI 経路 5 本、未使用の `QuizExplain.tsx`・`lib/quiz/quizScope.ts`・`quizSseTransport.ts`、Basic Auth 401 を期待する `e2e/firewall.spec.ts`、i18n の「908 用語」「554 ページ」。
   - 保持: owner 門 (D-148 の cookie、feedback D-149 と同期に使う)、`lib/ai/provider.ts` のモデル選択とプロンプト組み立て (ブラウザ側へ移す)、streaming の UI 部品、会話履歴の localStorage 保存、escalation 判定。
8. **D-148 との関係**: サーバー AI 経路を撤去した時点で D-148 の「AI 5 経路を 503 にする」部分は対象がなくなる。owner cookie 自体は D-149 と本 ADR の同期で使い続ける。
9. **配信上の注意**: 新しく fs を読む route は `next.config.ts` の `outputFileTracingIncludes` に route ごとの追加が要る。

## 却下した代替案

| 案 | 却下理由 |
|---|---|
| 旧 3 ページを新データに差し替えるだけ | 旧設計は頁・章が単位。新データに頁・章は存在せず、どの画面も意味が合わない |
| hover で LLM が即時に定義を書く (旧方式) | 未監査の生成。監査済み三語定義が既にある。ユーザーは即時生成を信用しない方針 |
| IT用語集 PDF を今抽出して辞典の語源にする | 抽出 pipeline + Rule A が新規に要る。試験範囲はシラバス term で覆える。後続 track に回す |
| chat と tutor を別機能のまま残す | 入口と知識源が重なる。ユーザーが統合を決定 |
| 全書を context に入れる | `unit_index.json` だけで ≈30 万 token。入らない |
| サーバー中継の BYOK (方式 B) | key がサーバーを通る。公開 endpoint が汎用 LLM 中継として使われうるので rate limit が要る。ブラウザ保存の危険は A と同じで、上乗せの利点は既存 route の流用だけ |
| サーバーに owner の key を置く (D-148 継続) | 費用と漏洩の責任がサーバーに残る。本人も BYOK で同じ体験になる |
| 学習記録を全員 Upstash に同期 (匿名の同期コード等) | 利用者は本人。アカウント相当の仕組みは過剰 |

## 未確定・後続

- ブラウザ直結の実 POST / streaming (決定 6 の spike)。両 provider のどちらかで不可なら、その provider の扱いを新しい D で決め直す。
- 正規 term id 規則、辞典の URL 構造、学習記録の schema、Upstash の key 設計 → 実装計画で決める。
- 現在の STATE は設計阶段。実装に入るのは実装計画のユーザー承認後。

## 改訂 (S131、同日) — D-180 で §7 を修正
- 計画 `docs/phase5/PLAN_stage6_learning.md` §0 の細化決定をユーザー承認で **D-180** として lock。
- §7 の「保持」のうち `lib/ai/provider.ts`・`lib/ai/tutorPrompt.ts`・3 shell の Chat / Tutor 視図・`useChatSession`・`useTutorSession` は **Phase 1 で削除** (削除済みの route を呼ぶか死語料の型を import しており、呼び出し元のないまま compile を維持することになる。Phase 4 のブラウザ直結で書き直す。必要なら Task 1 の commit message に記す hash から git 履歴で取り回す)。保持は `lib/tutor/escalation.ts`・`lib/chat/historyStore.ts`・`lib/tutor/tutorHistoryStore.ts` (`StorageLike` は `src/lib/storage.ts` へ移す) のみ。
- **§9 の改訂 (S131 Phase 1 で判明)**: `next build --turbopack` (Next 15.5.18) は `outputFileTracingIncludes/Excludes` を適用しない (turbopack-build が buildTraceContext を返さず collect-build-traces が何もしない。試験的に追加した include は trace に 0 件)。§9 の「route ごとの追加が要る」は turbopack 下では不要。配信内容は turbopack 自身の追跡に任せ、IPA 防護は `.next/*.nft.json` の leak gate (exams / sources / syllabus = 0) で担保する。

## 改訂 (S131、2026-10-22) — D-181 で決定 4 を Anthropic のみに縮小
- Task 13 spike (`evidence/phase5/stage_06_ai_sensei/spike_S131.md`): Anthropic はブラウザ直結で streaming と prompt cache が成立。DeepSeek は CORS と実 POST のみ確認 (有効 key の streaming は未検証、ユーザー判断で skip)。
- ユーザーは Sonnet を選択。AI 先生 v1 は **Anthropic `claude-sonnet-5-5` のみ** に接続し、決定 4 の「DeepSeek / Anthropic」は Anthropic に縮める。DeepSeek を後で接続する場合は新しい D で決める。詳細は `docs/phase5/PLAN_stage6_ai_sensei.md` §0 (= D-181)。
- 決定 4 の「CSP 必須」の具体値は同計画 §0-8 (本番のみ、`connect-src 'self' https://api.anthropic.com`、`script-src 'unsafe-inline'` は辞典一覧の静的化を守るための残留リスクとして受容)。
