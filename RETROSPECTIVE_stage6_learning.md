# RETROSPECTIVE — Stage 6 学習機能再設計（D-179〜D-182）

> Session 131（2026-10-21 〜 2026-10-22）。Tier 3。Rule C。
> 目的: 電子書籍コーパス（S63 で削除済）に依存して 500 になっていた glossary / tutor / chat を、topic・term 軸で作り直す。静的三語辞典 → quiz・教科書との連結 → 学習記録 + owner 同期 → BYOK の「AI 先生」。
> 計画: `docs/phase5/PLAN_stage6_learning.md`（Phase 1〜4、D-180）と `docs/phase5/PLAN_stage6_ai_sensei.md`（Phase A〜C、D-181 + §0 改訂）。ledger: `evidence/phase5/stage_06_learning/phase1-3_sdd_ledger.md`、`evidence/phase5/stage_06_ai_sensei/phaseABC_sdd_ledger.md`。

---

## 結果サマリ

| 指標 | 値 |
|---|---|
| 本番に出したもの | 静的三語辞典 1395 条目 / quiz・教科書 → 辞典リンク / 学習記録（localStorage + owner は Upstash 同期）/ AI 先生（quiz「なぜ」・弱点の主動復習・用語・unit・自由質問）|
| 撤去 | 死語料層とサーバー AI 経路 5 本、chat / tutor の旧 UI（−13,232 行、旧コードは 8619f87）|
| AI の形 | BYOK・ブラウザ直結（Anthropic `claude-sonnet-5-5`）。サーバーは LLM key を持たず受け取らない。本番のみの静的 CSP（`connect-src 'self' https://api.anthropic.com`）|
| 実行方式 | subagent-driven。implementer = `oh-my-claudecode:executor`（opus）、task review = `feature-dev:code-reviewer`（opus）、Phase 末 Rule D = `pr-review-toolkit:code-reviewer`（opus）|
| Phase 数 | 学習計画 Phase 1〜3 + spike（Phase 4）、AI 先生 Phase A〜C。各 Phase を 1 unit として前後でユーザーに報告（D-176）|
| Rule D の結果 | 6 Phase すべて「With fixes」→ 修正後 PASS。Phase 3 と Phase A は修正波自身が退行を生み、追加の小修正を 1 回ずつ入れた（ledger に逸脱として記録）|
| 本番 e2e | Phase 1: 9/9 → 2: 10/10 → 3: 16/16 → A: 48/48 → B: 53/53 → C: 60/60（いずれも `--retries=0`）|
| 実 key 確認 | D-182（テスト専用 key を repo 外ファイルに置き、script が読む）で Phase A・B・C を本番で実際に質問して確認。key は会話・repo・ログに一度も出ていない |
| 1 回の質問の費用 | Sonnet 5.5 実測: 題の「なぜ」1 turn ≈ $0.005〜0.009、復習の初回 ≈ $0.02〜0.04（最大 topic）|

---

## 1. 保留下来的做法（次もそのまま使う）

### 1.1 spike を先に、使い捨てで、本物の key で
BYOK ブラウザ直結は preflight の CORS しか確かめていなかった。Phase 4 の最初に一時ページ（commit しない）で実 POST・streaming・prompt cache を両 provider で測り、その結果で計画（D-181）を書いた。Sonnet 5.5 の実測（Task A1）は計画の費用見積りを半分以下に直し、「首字 2〜4 秒なので UI に考え中表示が必須」という要件を先に出した。計画を書く前に 1 時間かけて測る方が、作った後に前提が崩れるより安い。

### 1.2 実 key 検証はファイル経由（D-182）
ユーザーが「key を渡すからテストして」と提案したとき、会話に貼らせず、repo 外のファイル（`pbpaste` で作成、chmod 600）を script が読んでブラウザに入れ、出力前に key 文字列を置換する形にした。以後の本番確認（Phase A・B・C）はユーザーの手を借りずに回せ、key は会話・compaction 要約・repo のどこにも出ていない。

### 1.3 e2e は fake で、ただし「漏れたら落ちる」guard 付き
Anthropic への要求は Playwright の route で SSE を返す fake にし、さらに未応答の `api.anthropic.com` 要求を記録して afterEach で落とす guard を全 test に掛けた（Phase A の Rule D 指摘で beforeEach に移した）。本番 e2e を何度回しても費用ゼロ、かつ fake を付け忘れた test が黙って通ることがない。

### 1.4 Phase 末 Rule D は実 build・実測で確かめさせる
Phase A の terminal nav 溢れ（scrollWidth 610 > 390）、Phase C の「日常英単語が 8 件上限を埋める」は、reviewer が worktree で build して実測・probe したから見つかった。Phase C では reviewer が IPA ディレクトリに sentinel を置いて nft gate が本当に効くか確かめた。diff を読むだけの review では出ない種類の欠陥だった。

### 1.5 裁定は ledger に「理由と、間違っていたときの費用」付きで残す
執行中の判断（首轮は effort low、失敗・拒答ターンは保存しない、anchorId の形、remark-gfm + zod 直接依存 ほか）を毎回 `Ruling: 何を — なぜ — 外れたら何を失うか` で書き、Phase 末に計画の「§0 改訂」節へ転記した。Phase A の Rule D が「裁定が未追跡の ledger にしかない」と指摘してから、転記を Phase 末の必須手順にした。

---

## 2. 必须补上的缺口（次で直す）

### 2.1 修正波が退行を生む — 「修正波 1 回」の前提が 2 度崩れた
Phase 3（表形式選択肢の結果色が消えた）と Phase A（nav 溢れの CSS 修正で、現在のタブが画面外に出た）で、Phase 末の修正波そのものが新しい Important を生んだ。どちらも scoped re-review が捕まえたので出荷はしていない。対策: UI の修正波には「直した箇所の周辺の見た目」を実測する e2e（今回の 390px × 3 theme × 3 locale のような）を同じ波で必ず足させる。

### 2.2 計画の数値見積りが 2 回外れた
- spike の参照文を 6k token と見積もって実測 15.7k。
- 復習錨点を 7k と見積もって最大 topic で 20k（cap 10 のとき）。
どちらも実装者の実測で気づき、5 問 cap に直した。対策: 錨点・prompt を含む計画では、見積りではなく「最大ケースを実データで測る」手順を計画の task に入れる。

### 2.3 「どの題を勧めるか」の質を spec が語っていなかった
Phase B の推薦候補は file 順（= 2009〜2010 年の古い題）で、AI は題の中身も知らなかった。spec は「実過去問だけを勧める」とは書いたが「どれを」を書いていなかった。Rule D が「学習者が期待するのは自分の誤りに関係する新しい題」として Important にした。対策: 推薦・並べ替えを含む機能は、計画の Review Focus に「並び順の根拠」を 1 行入れる。

### 2.4 自由質問の照合には既知の穴が残っている
英文で他の用語と同時に出ると、stoplist にある関係 DB・グラフ系の語（Selection / Join / Table / Index / Node 等）が根拠に入らない。後続で stoplist から外す候補として ledger と session log に残した。照合規則を変えると既存 free thread の再開時の錨点が変わる（cache miss のみ）ので、まとめて 1 回で変える。

### 2.5 owner の 2 端末同期（Phase 3）が未確認のまま
owner cookie はユーザーのブラウザにしかないため、実 Redis での 2 端末同期はユーザーの確認待ちのまま Stage を閉じる。STATE の次セッション行に残す。

---

## 3. 关键决策复盘

| 決定 | 結果 | 振り返り |
|---|---|---|
| D-179: 章・頁の旧設計を捨て topic・term 軸で作り直す | 正しかった | 旧 3 画面を新データに差し替える案は、どの画面も意味が合わなかった。辞典 → 連結 → 記録 → AI の順も、各段が次の段の入力になって無駄がなかった |
| D-179 §4: BYOK はブラウザ直結（方式 A）| 正しかった | サーバー費用と中継悪用の余地がゼロ。代わりに CSP・zod の eval probe（本番 CSP 違反を Phase A で検出 → `z.config({ jitless: true })`）・key 漏れ経路の封鎖を自前で持つ必要があった。`script-src 'unsafe-inline'` は辞典一覧の静的化を守るための残留リスクとして明記した |
| D-180: 1 Phase = 1 unit、subagent-driven | 正しかった | 各 Phase の前後報告でユーザーは 2 語（「继续」）で進められた。task review が Phase A で「流れ中の回答が別 thread に保存される」を、Phase B で 2 件の Important を捕まえた |
| D-181: Anthropic のみ、Sonnet 5.5、DeepSeek は v1 で接続しない | 妥当 | DeepSeek の有効 key streaming は未検証。接続するなら新しい D で決める |
| 首轮は常に effort low（執行中の裁定）| 妥当 | 「なぜ」入口は文言自体が escalation 語を含むため、そのままだと毎回 high になっていた |
| 錨点を決定的テキストにし、cache breakpoint を固定 | 正しかった | 実測で 2 turn 目の首字が半分、追問の入力費用が 1/10。Phase C の自由質問でも再開時の system 文字列が逐字一致することを e2e で固定した |
| 修正波を Phase 3・A で 1 回追加（skill からの逸脱）| やむを得なかった | 退行を出荷しないために必要だった。2.1 の対策で、次は最初の波で防ぐ |
