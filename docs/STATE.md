# 项目当前状态 / Project Live State

> **本文件 = "当前累计状态"的真相源**。Session 日志是历史档案（append-only）；本文件是当下事实快照。两者关系由 **D-028** 锁定。
>
> **更新规则**: 每场 session 结束前 Claude 必须 sync 到本文件（per **D-027** 第 5 条）。

| 字段 | 值 |
|---|---|
| 最后更新 | **2026-09-06 Session 117 — 横断 backlog 第一步 (④⑥⑧③) 完了**。启動詞「backlog 第一步」。**④** 既存 18 exam の sidecar 再 merge (11 変化・user-facing テキスト変化 0・key_guard final publish 18 問 + round1 併記、独立 reviewer が merge 複製で 29/29 byte 同一を確認)。**⑥** `scripts/quiz-keys-crosscheck.mjs` 新設 (A1〜A5 committed 層 = vitest 常時 / B1〜B4 raw 層 = ローカル gate) — **初回実行で by_year の stale key 3 件を捕捉** (2011h23a-q100 / 2014h26h-q100 / 2015h27h-q100、承認済み値へ同期)。reviewer 変異試験で B4 の穴 2 件 → 双方向化。**⑧ D-143 lock**: explfix は generate_result の final だけを全文書き換え、round1 不可触、suspect=union 不変。**③ D-142 lock**: ホスティング → 主机租用（hosting） / ハウジング → 机房托管（housing/colocation）、禁止語 主机托管・服务器托管。96 フィールド / 11 ID (出荷層 37 + merge 入力層 59)、Rule D 65 件全件 PASS、evidence `quiz_zhterm_hosting_D142_S117.md`。**① の母数を再実測: 462/27 ではなく 241 問 / 16 exam** (S110〜S116 の 13 exam 分が既に双 pass 済)。pilot 方案 (C 案: 2019r01a + 2024r06 で A/B 併走) を S117 log §5 に記載、**ユーザー gate 待ち**。tsc 0err / eslint 0err / **vitest 464** / build exit 0 / crosscheck full GREEN。questions.json 2900・correct_answer 変更 0。**commit のみ、push 未実施 (ユーザー gate)**。 **【S117 続き・2026-09-07】ユーザー gate で push (a67db88) + ① pilot 実行**: 2019r01a + 2024r06 で A (s7x 双 pass 33 問) / B-note (5 問) / B-sample (無作為 40 問) を 10 workflow で併走。**A の DISCREPANT 率 32% / 25%、正解肢上 1 (q040 ウ 滞進的→漸進的、A 射程内)、B∖A の正解肢上 0 → 事前規則どおり残 14 exam は A + note 起点掃引で行く**。B-sample の基礎率 7.5% (誤答肢の軽微欠陥) は ⑨ に登録。24 差分を 129 フィールド (JP 3 層 + zh/en 11 + 解説 2 件全文書き換え + final note 7 問 [D-143 初適用]) で是正、Rule D PASS-with-notes → 波及漏れ 4 件も是正。同族 OCR クラス「ーつ」を corpus 横断で 60 箇所是正。**教訓: translations sidecar は phase1 再 merge 禁止 (入力層 stale、再 merge で 96 フィールド退行→戻した)**。新設 `quiz-fidelity-prep-any.mjs`。crosscheck full GREEN / vitest 464。 **【S117 batch 1・2026-09-07】2022r04 / 2020r02o / 2016h28h を A + note で処理**: A 側 DISCREPANT 20% / 18% / 29%、2016h28h の note 起点 13 問は 13/13 実欠陥 (正解肢上 3 = S108 の choice-OCR backlog が出荷されていたもの)。43 差分 → 191 フィールド是正 (解説 2 件全文書き換え、note 13 問 D-143)、Rule D PASS-with-notes → B1 (note 誤分割) + N1〜N3 是正。「適切なか」型を横断 1 件。crosscheck GREEN / vitest 464。**残 11 exam (2015h27a 14 / 2016h28a 13 / 2017h29a 8 / 2017h29h 10 / 2018h30a 13 / 2018h30h 21 / 2019h31h 12 / 2021r03 12 / 2023r05 9 / 2025r07 17 / 2026r08 11 = 140 問)**。 **【S117 batch 2】2018h30h / 2025r07 / 2015h27a 完了**: **answer_affecting 級 2 問を初捕捉 (2018h30h-q039 SLA 閾値 20→30 分 + 選択肢時刻 / q064 srv01→srv91 + 正解肢 ipa.9o.jp)、いずれも note 起点側**。2015h27a-q086 は図テキスト化表の列字母ずれ (新クラス)。37 差分 → 223 フィールド + Rule D 追随 11。残 8 exam (2016h28a 13 / 2017h29a 8 / 2017h29h 10 / 2018h30a 13 / 2019h31h 12 / 2021r03 12 / 2023r05 9 / 2026r08 11 = 88 問)。 **【S117 batch 3+4・2026-09-07】① 完了 (16/16 exam)**: batch 3 (2016h28a / 2018h30a / 2019h31h / 2021r03、A 50 + note 7) → DISCREPANT 12 問・正解肢上 4・answer_aff 0、147 フィールド是正 (2018h30a-q002 リピート→リベート zh/en/解説追随、2021r03-q095 商品C 復元、同形字 力→カ 初出、横断 2020r02o-q035)。batch 4 (2017h29a / 2017h29h / 2023r05 / 2026r08、A 38 + note 6) → DISCREPANT 7 問・正解肢上 2・answer_aff 0、97 フィールド (2017h29a は差分 0)。**初回 attempt は session limit (resets 12pm JST) で審閲 agent + 10 workflow 全滅 → 同入力で再放 (§19)**。Rule D 両 batch PASS-with-followups: batch3 MAJOR = 2021r03-q095 final `stem_corruption_suspected` 未更新 + note 矛盾文 (D-143 §3 違反) → BOOL/NOTE_PRUNE を雛形に追加して是正; batch4 MINOR 4 + NIT 3 全処置 (§18b/§20)。**① 総括 (§21)**: 16 exam 双 pass 完了、answer_affecting は 2018h30h の 2 件のみ。漏検 2 例 (agent が源を正しく書き起こしながら差分未計上: 2017h29h-q027「などは」/ 2026r08-q085「整数値」) → ⑨ 最優先「源書き起こし構造化 + 主 context 機械 diff」。流程欠陥: 共有 scratchpad の汎用ファイル名衝突で別問画像を読む事象 9 件 (全て agent 自己検知) → workflow prompt に一意ディレクトリ強制を要登録。N5 追加 6 題 (raw stem_jp のみ、表示無影響)。crosscheck GREEN / vitest 464 / tsc 0。 |
| 当前阶段 | **Phase 5 Stage 6 / サブ段階「Quiz 接過去問」。【現況 S116】Phase 2 (D-137) = ✅ 全 29/29 完了。2900 問すべてに三語解説が載った。Rule C の `RETROSPECTIVE_phase2.md` も同 session で執筆済。**<br>**【現況 S117】横断 backlog 第一步 = ✅ ④⑥⑧③ 完了** (D-142 / D-143 lock、crosscheck gate 常設、by_year 同期)。**残 backlog** (優先度順): ~~① s7x 未核験 241 問 / 16 exam~~ → **✅ S117 で 16/16 exam 完了** (pilot + batch 1〜4、answer_affecting 2 件是正、S117 log §21) ② 図/シナリオ再抽出 track (選択肢が図そのもので、テキスト化した時点で出題構造が壊れる型。5 exam 分蓄積) ~~③ hosting/housing zh (S117 D-142 完了)~~ ~~④ 18 exam 再 merge (S117 完了)~~ ⑤ semantic choice-OCR cleanup track (16 exam 対象、S108 以降 実施記録なし) ~~⑥ 交叉核対 CI 化 (S117 完了、`quiz-keys-crosscheck.mjs` + vitest)~~ ⑦ `source.page_image` のスキーマ問題 / 中問先頭問のページずれ候補 19 件 ~~⑧ explfix note 方針 (S117 D-143 lock)~~ ⑨ cosmetic 横断 (分野見出し 42 問 / ASCII 引用符 139 問 / zh 本土 polish / 図クロップの端切れ / **S117 追加**: 保真核験 workflow の源書き起こし構造化 + 主 context 機械 diff [漏検 2 例]、切り出し画像の一意ディレクトリ強制、同形字 力↔カ・一↔ー 決定的走査、末尾ノイズ「ーー/-/MN/./ぜい/こう」走査 [clean/choices 層のみ]、B-sample 基礎率 7.5% の誤答肢軽微欠陥、引用符開閉対の欠落を「体裁差」に含めない判定基準文言、**源 PNG と public WebP の鮮度検査** [S111 の q091 差し替えが WebP 未再生成で 4 週間 stale])。~~N5 raw stem_jp 残穴 6 題~~ → **✅ S117 §22c で 3 層とも clean に同期**。**資産 backlog**: 2018h30a page-12 源画像が 1432×1340 に切り詰め (再生成対象)。**D-143 §6 retrofit**: suspects 名簿で「round1 由来・final 是正済」を見分ける表示 (2023r05-q056 が q056* で残る)。~~⑥ 続き~~ → **✅ S117 §22a: crosscheck B5 (stem/choices 3 層一致 + by_year 行欠落検出) 常設、by_year の旧 OCR 残存 284 問 / 451 フィールドを同期** (`quiz-byyear-text-sync-S117.mjs`)。**⑨ の核験 workflow 対策も ✅ §22b** (`source_transcript` + 一意ディレクトリ + `quiz-fidelity-machdiff.mjs`、既知盲点 = 空白の有無)。**新規発見 (S117 §22 末)**: **題幹の markdown 表 190 問 / 選択肢の [表] 83 問が App では生の縦線テキストで表示されている** (QuizSet.tsx は stem/choices に Markdown を通していない; 3 つの theme shell は図も描かない) → ② の設計に合流、ユーザー判断待ち (S117 log §23 の 4 問)。**D-141 前文投入問**は保真核験で毎回 DISCREPANT に見える → 識別 flag。<br>**Phase 5 Stage 6 (Web App 数据統合) 進行中。サブ段階「Quiz 接過去問」。【現況 S101】OCR-garble 一括清理 (D-140 scale 方針) = ✅ 完了** (58 choices drift-proof 是正・FP 15 除外・ブラインド独立再導出 58/58 一致・q096 ISO/OSI 主context 誤りを独立検証が捕捉→訂正・correct_answer 不変・検証GREEN・detector 再scan=FPのみ)。次=Phase 2 scale (28回 续批) + push (ユーザーゲート)。<br>**【S100】**Phase 2 (D-137) re-pilot 2025r07 = ✅ 完了** (解説100/100・Rule A 独立 24/24 accurate 0med/high・bad key 0・cosmetic 腐敗10問15フィールド是正・検証GREEN)。次=ユーザー gate で 29回 scale (+cosmetic OCR scale 検出方法)。<br>**Phase 1.6 (D-139) = ✅ 完了**。D-139-A 確定 bad key 3 件是正済 (`2015h27h-q100` エ→ア / `2009h21a-q091` ウ→イ / `2011h23a-q100` イ→ウ、S98)。**D-139-B 全量 key 盲推審計 = ✅ 図題 467/467 完了** (S99、路由词「Phase 1.6 全量」): bad-key 候補 5 → 写審分離 3 層裁決 (deriver≠critic×3≠主 context 高倍率) → **確定 bad key 2 件是正済 (ユーザー承認)**: `2009h21a-q012` ア→ウ / `2010h22a-q091` ア→エ (questions.json correct_answer 2 件のみ、stem/choices/quiz_index/translations 不変)。deriver 偽陽性 3 件 (q090[=事前疑い1]/q091-2012/q096) は key 正で是正回避。**choices-fidelity track も同 session 完了** (ユーザー「phase2 前に全部做完」): choices 腐敗 28 件を写審分離 (proposer→critic verify→主 context) で **jp 74 letter + zh/en 43 letter 三語是正** (drift-proof、key invariant)。underivable 3 → q087 解答可、**q094/q100-2015h27a は incomplete-source (Phase 2 / 源再OCR backlog)**。**検証 GREEN** (tsc/eslint0err/**vitest463**/build/nft IPA0/構造三語非空)。**Phase 1.6 完全完了 (key+choices 三語クリーン)。次 = Phase 2 (D-137、解析預生成) を figure-fidelity hardening + 全問 key-guard 込みで再 pilot → scale** (ユーザー次 session 予定。ユーザー次 session 予定)。<br>**Phase 2 前 backlog 收尾 (ユーザー「这几个都做了吧」、S99)**: ① **incomplete-source 2 件 = ✅ 修正済** (中問文脈注入、写審分離 author→critic、q094=形式1定義[中問B page-38]/q100=HDD容量8G・40G[中問D page-45]、両者答イ、**critic が author の注記逆転捏造+源に無い1G=1000M追加を捕捉→主 context が原典実読で訂正**、検証GREEN)。② explanations/ = 陳腐草稿 (Phase 2 再生成につき不提交)。③ **figure-display = ✅ 修正完了** (全467 vision sweep `wf_8c5e6dfc-cf2`で 27 crop 候補 → 写審分離 critic 検証+bbox `wf_06800a73-d2f` [偽陽性2除去] → drift-proof 再裁剪/copy/remove `quiz-figfix-apply` → 再検証 `wf_0af86bd2-4b9`+round2 `wf_354f2f56-8ef` で **figure 25 差し替え (q090 cross-page page-38・q099 ← q097 共有 図1 含む) + has_figure=false 3 (q061/q095/q097-2013h25a)**。主 context 実読確認、検証 GREEN [tsc/eslint0err/vitest463/build/nft IPA0]、with_fig 467→464、webp 25 modified+3 deleted)。証拠 `figcrop_audit_S99.md`)。** <br>**(履歴)** Phase 0 = 完了+commit 済 (`0167626`)。Phase 1 (翻訳 backfill) = **完了 (翻訳済 29/29 回、S87 pilot + S88〜S96)**。各バッチ Rule A 独立抽検 (S92 40/40・S93 38/39・S94 39/43・S95 35/37・**S96 50/52** [q092 figure 注記/q077 en gloss/**q002 REGRESSION→REVERT+corpus fix**、全 figure-faithful・独立 critic ACCEPT])・Rule D 写審分離・全検証 GREEN。**Phase 2 前ゲート (図題答案KEY 体検、Session 97) = 完了**: 母集団 247 (choices_resourced_s7x OR figure_repaired)、分層 N=40 vision 審計 (写審分離+毒入校正)、**strict 坏键率 0/40** (BAD_KEY 0、Wilson 95% 上限≤~22)、器具校正 OK (毒 q013 命中=感度・q002/q052 clean=特異度、q052 は審計偽陽性を主context 5×実読で CLEAN 裁決)、非キー選択肢汚染は別件 (~5%、q096/q078/q077)。→ **keys clean → Phase 2 GO**。**Phase 2 (解析預生成) = 着手 (Session 97、ユーザー路由「a」)**: D-019 問答→**D-137 lock** (標準 schema 正解理由+各誤答+要点 / JP先生成→翻訳 / key-guard 内蔵 suspect-flag+照常生成+バッチ末汇总 / pilot-first)。パイプライン scripts×5 + データ層/UI/i18n/test 実装済 (quizExplanation.test 8/8、tsc/eslint clean)。**pilot 2025r07 (100問) 生成 WF `wf_89b6ad0d-52e` バックグラウンド実行中** → 完了後 merge/ruleA/検証/triage → pilot 報告 + ユーザー gate (全 29 回 scale)。 D-136(pilot-first / 翻訳サイドカー `data/ip/quiz/translations/` + reader merge / figure 問 vision 三語クリーン / 教科書 term 束縛) + D-小6 (figure crop+フルページ併読) + D-小7 (repair 語義ガード) + D-小8 (統合バッチ combiner `scripts/quiz-phase1-batch.mjs`、いずれも組込済)。**要ユーザー判断 backlog (上流データ品質、翻訳成果物に影響なし、累積)**: **S94** ~~q052/q092/q096 choices_jp~~ → **同 session で corpus 是正済 (RESOLVED_IN_CORPUS、独立 Rule D 再検証 PASS)**、残 `2012h24h-q018` glossary 職能別組織。(S93 の `2014h26a-q093`/`2014h26h-q088` choices_jp は同 session で corpus 是正済=RESOLVED) `2016h28h-q001`/`q012`/`q096` choices_jp・stem 再OCR + `2015h27a-q088` 図3 基準値 (Stage 2) / `2016h28a-q025` glossary 職能別組織 (textbook) / `2017h29h-q069` choices_jp 再OCR / `2019h31h-q061` figure crop ズレ (図管線 scope)。<br>**(S86 Phase 0)** **Phase 5 Stage 6 (Web App 数据統合) 進行中。サブ段階「Quiz 接過去問」Phase 0 = 実装+Rule D 完了 (Session 86、D-019)、commit 確認ゲート待ち。** — D-134(配信=クリーン派生 `data/ip/quiz/` を un-gitignore、raw bank/pages/figures は gitignored 維持、IPA 条款で公開 OK・出典/改変明記義務)+ D-135(v1=JP-first 2 モード真題面[syllabus 主題別+試験年度別]、翻訳/解析は預生成 backfill Phase 1/2)。**Phase 0 完了**: 首页 500(死語料 `_fixtures/v1.0.3` S63 削除)治癒、quiz 接過去問 v1 上線(2900 問・63 主題・29 回・467 figure、JP-first・出典・reveal)。検証全 GREEN(vitest 446/build/nft IPA=0)+Rule D APPROVE。残段階: 1(翻訳 2900×{zh,en})/2(解析 2900× 三語預生成)/3(教科書統合)。glossary/tutor/chat は死語料依存のまま 500、各自後続サブ段階で移行(band-aid せず)。<br>**(S85 完了)** v1 教科書リーダー(244 unit 上線、目録+per-locale+SVG inline+pager+教科書 NavTab、全検証 GREEN+Rule D APPROVE+nft IPA leak 修正、D-133)。Stage 4 完了(244/244 三語)・Stage 5 は S63 先行済。OQ-03 closed。 |
| 锁定决策 | **144** (D-001 ~ D-144)。**D-144** = ② 図/シナリオ track の 4 段方針 (表示層先行 → choice_figures で選択肢即図 → 中問共有資料は軽量組先行・共有図は挂図優先 → 3 shell 統一、S117、`docs/decisions/D-144-figure-scenario-track.md`)。**D-143** = explfix は generate_result の final だけを書き換え round1 不可触 (S117)。**D-142** = ホスティング=主机租用 / ハウジング=机房托管 (S117)。**D-141** = 中問共有前文はグループの全設問に埋め込んで自完結にする (ユーザー gate、S114。アプリに中問グループ表示機構が無く設問は必ず単独表示されるため。起草≠核験の 2 段 workflow + 決定的 apply、`docs/decisions/D-141-chumon-shared-preamble.md`)。**D-140** = Quiz Phase 2 stem-corruption handling (key-guard suspect → 主context 源実読裁決 → stem腐敗は drift-proof 内联修・真坏键は升级 / cosmetic 腐敗も全部内联修 [ユーザー gate ×2、S100] / 硬化=STEM-CORRUPTION GUARD+round-1 key_guard 永続化[repair masking 不可]+stem_corruption_suspected flag+generate_result 永続化手順)。**D-139** = Quiz Phase 1.6 (答案键+選択肢 完整性審計 & bad key 是正): A=確定 bad key 3 件是正済 (`2015h27h-q100` エ→ア / `2009h21a-q091` ウ→イ / `2011h23a-q100` イ→ウ、drift-proof raw bank→rebuild、questions.json correct_answer 3 件のみ変更) / B=全量 key+choices 盲推審計 (図題467 full sweep、写審分離) / C=完了後 Phase 2 (D-137) 全問 key-guard 込み再 pilot。**D-138** = Quiz Phase 1.5 (stem 源再構成) = Phase 2 scale 前の必須前段 (図題467 全数 figure 再構成 / 非fig marked 71 backup 照合 / 出力=翻訳サイドカー更新・reader 不変 / 三語整合 / pilot-first・writer≠figure↔stem checker)。**D-137** = Quiz Phase 2 (解析預生成、標準 schema / JP先生成→翻訳 / key-guard suspect-flag / pilot-first)。 |
| Open Questions | OQ-01 + OQ-02 (Phase 1 carryover, low priority)。**OQ-03 = CLOSED** (Session 85, reviewer 提起→同 session で b-cheap 解消: ToC の unit タイトル + major/medium グループ見出しを per-locale 化[訳語は既存・決定的結合]、小分類 name は corpus/IPA とも訳語ゼロのため全 locale JP 固定=ユーザー合意の意図的設計。任意 backlog: 63 小分類名翻訳=要 LLM+Rule A) |
| 次セッション | **② = D-144 の 4 段を順に実装** (**段 1 = ✅ S117 完了**: `quizRichText.ts` + `QuizRichText.tsx`、データ不変、全量不変式 + N=21 目視抽検、Rule D FAIL→是正→PASS、log §25/§25a。**段 2 = ✅ S117 完了**: `choice_figures` で ②-a 3 題を選択肢単位の図に、選択肢テキストは三語で中立化 [データ変更あり: 3 問 × 4 肢]、crosscheck A6、Rule D PASS-with-followups 全処置、副次: 2010h22a-q091 の WebP が S111 以来 stale だったのを再生成で是正、log §26)。**段 4 前の宿題**: vitest に jsdom + `.tsx` include (component 未テスト)、表の a11y (行見出し th scope=row / stem 表の caption)、選択肢図の alt が中立ラベルで読み上げ利用者に無情報 (D-144 の取捨、代替手段を検討)、裁図内字母と字母チップの二重表示。段 2 = `choice_figures` + ②-a 3 題挂図、段 3 = ②-b 軽量組 → 重量組 (exam 単位)、段 4 = 3 shell 統一。進捗は S117 log §25 以降と本欄で追う。残 backlog: ⑤ semantic choice-OCR cleanup、⑦ page_image スキーマ、2018h30a page-12 再生成、D-143 §6 retrofit、⑨ 残り。 |

---

## Phase 5: 基于 IPA 官方源的 AI 教科書

### 方向 (D-108)

放弃教科書提取路线（Stage 8-11），转向 IPA 官方源 + AI 生成三语教科書。

| 数据源 | 版本 | 用途 |
|--------|------|------|
| シラバス | Ver.6.5 (2026-01-08) | 知識树骨架 |
| 過去問題 | FY2009~FY2026 (29回, 2900 題) | 题库 + 考点参考 |
| 試験要綱 | Ver.5.5 | 考试元信息 |
| IT用語集 | Ver.5.1 | 官方术語規範 |

### Stage 进度

| Stage | 内容 | Status |
|-------|------|--------|
| 1 | シラバス構造化提取 (Claude vision) | ✅ **Session 65 完成** |
| 2 | 過去問全量提取 (~2900 題) | ✅ **Session 66-67 完成** — 2,860題 (98.6%) |
| 2.5 | OCR 品質修復 + 全量 AI 審査 | ✅ **Session 68-69 完了** — P0-P3修復 + 29套全量AI審査 (935修正, 60題補録, 452図表更新) → 2,900題 29/29×100q |
| 2 補完 | ページマッピング + 図表裁剪 + 検証 + **FAIL修復** | ✅ **Session 70-71 完了** — 502図裁剪 → FAIL 96件を再推定で修復 (93修復+3降格) |
| 2.6 | **データ実測審核** (新視点+外部源で正確度を CI 付き実測) | ✅ **Session 72-73 完了** — 図表(単問16+共有図16群groups.json)+has_figure整合110+Phase C CI(critical 17/100, 母集団≈12%, answer_keys 100%) |
| 2.7 | **全量 stem/choices 源照合・修復** (Phase C 発見の garble≈12%除去) | ✅ **Session 74 完了** — 全2900スキャン→603候補→521修復(double-blind+3way, Rule A 95%)。再CI 残存≈5% |
| 2.7b | **hi-dpi/多ページ二次修復** (残存71フラグ) | ✅ **Session 75 完了 (D-125)** — 300dpi分帯+N/N+1+double-blind→71→10残存(0.34%)。confirmed 20/figure_inherent 15/cleared 28。Rule A監査 N=31(answer映射核験) |
| 3 | 知識マッピング (過去問 → シラバス节点) | ✅ **Session 76 完了 (G3, D-126)** — 2,900題 double-pass(95.9%一致)+tie-break+Rule A N=20(妥当率100%)。gap 0/63、enriched question_bank、invariant不変 |
| 3.5 | **後置クリーン** (low-conf 重判 + 語彙核心語補完) | ✅ **Session 77 完了 (D-127)** — 補词4 / 重判59(↑42低減: low59→17) / terms清洗17 / Rule A N=20(改判6是認, 補词4正[審計duplicate誤判をbackup証伪]) |
| 4 | AI 教科書生成 (三语详细讲解 + 图解) | ✅ **Session 84 完了** — 全量 **244/244 三語完成** (mgmt 23 + strategy 98 + tech 123)。S84 strategy 95: merge 95/95 → RuleA翻訳 N=18 (100% faithful, 0 med/high) → 三語ゲート (センシング l10n+summary同期 / EC 源文是正+重訳、**Rule D 漏判を独立critic補修**)。S83 tech 119 / S82 mgmt 18 / S81 schema OK / S80 ToC ゲート承認 |
| 5 | コードベース整理 | ✅ **Session 63 完成 (提前执行)** |
| 6 | Web App 数据統合 | 🔄 **S85: 教科書リーダー v1 完了** + **S86: Quiz Phase 0 完了** + **S87: Quiz Phase 1 (翻訳) pilot** + **S88〜S95: スケール バッチ ×8** (`2026r08`〜`2011h23tokubetsu` の最新 24 回、D-小6 フルページ併読 + D-小7 repair 語義ガード + D-小8 combiner 組込) (D-136、翻訳済 **29/29 回 = Phase 1 完了**・各 100/100 三語・Rule A S90 38/38・S91 37/37・S92 40/40・S93 38/39・S94 39/43 [q052 REGRESSION REVERT]・S95 35/37・**S96 50/52** [q092 figure 注記/q077 en gloss/**q002 REGRESSION→REVERT+corpus fix**、独立 critic ACCEPT]・Rule D 写審分離・nft IPA0、**残 0**。backlog: S94 q052/q092/q096 choices_jp は corpus 是正済 (RESOLVED) + q018 glossary / (S93 q093/q088 choices_jp は corpus 是正済=RESOLVED) S92 q001/q012/q096/q088 再OCR + q025 glossary / S91以前 q069 choices_jp 再OCR + `2019h31h-q061` figure crop ズレ=要ユーザー判断) — 教科書 244 unit 上線。Quiz: D-134(クリーン派生 `data/ip/quiz/` un-gitignore、IPA 条款で公開 OK・出典/改変明記)+D-135(JP-first 2 モード真題面、翻訳/解析は預生成 backfill)。**Phase 0 = 止血+地基 done**: 首页 500 治癒、quiz v1(2900 問/63 主題/29 回/467 figure WebP、出典・reveal)、vitest 446/build/nft IPA=0、Rule D APPROVE。残 Phase 1(翻訳)/2(解析)/3(教科書統合)。glossary/tutor/chat は死語料依存で 500(各自後続サブ段階)。D-133/D-134: 自作 `textbook/`+派生 `quiz/` のみ in-repo |

Plan: `docs/phase5/PLAN.md`

---

## 基础设施现状 (保留)

| 组件 | 状态 | 说明 |
|------|------|------|
| Next.js 15 app | ✅ 运行中 | `apps/web/` |
| AI Tutor | ✅ Phase 4 完成 | `/api/tutor` + DeepSeek V4 pro / Anthropic Sonnet 4.6 |
| Quiz 系统 | ✅ | Phase 2 QuizExplain + self-report |
| Glossary 系统 | ✅ | Phase 2 悬浮卡 |
| Chat 系统 | ✅ | Phase 2 `/api/chat` |
| i18n 三语 | ✅ | ja / zh / en via next-intl |
| Middleware firewall | ✅ | Basic Auth (D-097) |

---

## Session 63 重构变更摘要

### 新决策

| ID | 内容 |
|----|------|
| **D-110** | Phase 5 提取脚本统一使用 TypeScript，移除 Python 工具链（**D-132 精緻化**: LLM は Claude Code 経路、外部 Anthropic SDK/API は不使用; TS/JS は機械スクリプトのみ）|
| **D-111** | 保留 apps/web/ monorepo 结构，删除 packages/ |
| **D-112** | 历史文档激进归档 — Phase 1-3 session logs + Phase 1 ADRs → `docs/archive/` |
| **D-113** | Stage 5 清理提前到 Session 63 执行（不等 Stage 4） |

### 删除清单

- `packages/extractor/` — Phase 1 OCR pipeline (全部)
- `pyproject.toml` + `uv.lock` — Python 工具链配置
- `scripts/` 旧 Python 脚本 (stage9/10 等)
- `apps/web/src/app/[locale]/book/` — Book 路由 (含 chapter/[nn])
- `apps/web/src/components/Chapter*.tsx` / `Book*.tsx` / `SelectionToolbar.tsx` / `ParagraphTranslate.tsx`
- `apps/web/src/components/shells/*/GamifiedBook.tsx` / `RetroBook.tsx` / `TerminalBook.tsx`
- `apps/web/src/lib/book/` — chapterScope + progressStore 迁移到 `lib/data/`，translatePrompt 删除
- `apps/web/e2e/book.spec.ts`
- `apps/web/_fixtures/` — Phase 1 test fixtures

### 文档归档

- Session logs 1-52 + Phase 1 stage worksheets → `docs/archive/sessions/`
- Phase 1 ADRs (D-005 ~ D-081) → `docs/archive/decisions/`
- Phase 2/3/4 PLANs → `docs/archive/plans/`
- Release notes → `docs/archive/release-notes-legacy/`
- Validation → `docs/archive/validation/`

### 配置更新

- `.gitignore` — 精简，移除 Python 段落
- `CLAUDE.md` / `AGENTS.md` — 反映新结构
- `package.json` — 更新描述
- Nav 组件 — 移除 Book tab (3 themes)
- 首页重定向 — `/book` → `/quiz`

---

## 历史沿革 (Legacy Summary)

| Phase | 时间 | 内容 | Tag |
|-------|------|------|-----|
| Phase 1 | Sessions 1-26 | OCR + LLM content extraction pipeline | `phase1-ship-2026-05-19` |
| Phase 2 | Sessions 27-47 | Next.js web app (chat/quiz/glossary/AI) | `phase2-α-ship-2026-05-21` |
| Phase 3 | Sessions 48-52 | Book reader + progress tracking | `phase3-α-ship-2026-05-22` |
| Phase 4 | Sessions 53-58 | AI tutor (Module A-C done, D pending) | `phase4-α-ship-2026-05-23` |
| Stage 8-10 | Sessions 59-61 | 全书蓝图 + 内容重建 + 图片裁切 | **abandoned per D-108** |
| **Phase 5** | Session 62~ | **IPA 官方源 AI 教科書** | **current** |

### 决策历史

- D-001 ~ D-053: Phase 1 设计 + 实施 (archived)
- D-054 ~ D-093: Phase 2 设计 + 实施
- D-094 ~ D-101: Phase 3
- D-102 ~ D-107: Phase 4 + Stage 8-10
- D-108 ~ D-109: Phase 5 方向転換 + 数据目录
- **D-110 ~ D-113: Session 63 全量重构**
- **D-114 ~ D-118: Session 64 教科書設計（導航 + ユニット架构 + 記憶フック + 排列規則 + JSON Schema）**
- **D-119: Session 71 Stage 2.6 データ実測審核 + Stage 3 ゲート（分層審核 / 外部源許可 / 確実即修・曖昧帰档）**
- **D-120: Session 72 連問共有図「グループ共有図モデル」新設（group_id + groups メタ、sibling は複製せず参照）**
- **D-121: Session 72 duplicate_extraction 系統バグ確認（4件収束）+ 修復方針（PDF再抽出+answer_keys正答復元）+ choice_swap/choice_ocr 新類**
- **D-122: Session 73 Stage 2.7「全量 stem/choices 源照合・修復」新設（Phase C で stem garble≈12%・q085型内容不一致発見、answer_keys は100%健全）。Stage 3 ゲートに追加。**
- **D-123: Session 74 Stage 2.7 を多段パイプライン化（改良scan→scan先行ゲート→欠陥のみ独立検証→検証済のみ適用→再CI）。パイロットで単一パス検出＋即転写適用が不可信（ハルシネーション/プレースホルダ/group見逃し）と実証、却下。scan は印刷文を先に逐語転写。**
- **D-124: Session 74 Stage 2.7 検出を「Opus ブラインド転写→機械的diff」に確定。3パイロットで真因=モデルと実証（default explore は dense日本語OCR不可でエコー/ハルシネーション、Opus は既存173dpi画像で正確）。stored非開示でエコー不能、NFKC+バイグラム類似度で候補抽出（high recall、精度は検証段で担保）。**
- **D-125: Session 75 Stage 2.7b hi-dpi/多ページ二次パス方式を確定。300dpi分帯クロップ（整页高dpiは無効）+ ページN/N+1レンダ + double-blind(explore/code-reviewer) + bank規約正規化(問NN/〔分類〕/図ブロック剥離) + figure_inherent明示分類 + Rule A逐字監査(答案字母映射核験)。残71→10(0.34%)、全answer保存。教訓: NFKC+strip類似度は句読点/記号に盲目→独立逐字監査が機械の盲点を埋める。**
- **D-126: Session 75 Stage 3 知識マッピング設計を確定（ユーザー問答）。二層粒度(小分類primary + 用語tags) / 基数 primary+secondary[](1主+0〜2関連) / 検証=双盲(異subagent_type)+coverage分析。syllabus_refs を `[]`→{primary_topic, secondary_topics[], terms[], confidence, mapping_status} に。invariants 不変。実装は G3。ADR: `D-126-stage-3-knowledge-mapping-design.md`。**
- **D-128〜132: Session 78 Stage 4 (AI 教科書生成) 実行設計を確定。D-128 二段式生成(Phase A 規劃→ToCゲート→Phase B 内容)+pilot-first(3跨類節点)。D-129 全工程 Opus、三語=日語権威源→二次翻訳。D-130 per-topic LLM 規劃 pass(概念依存+頻度)→廉価 ToC ゲート。D-131 即時チェック=term題池/チャレンジ=節点抽样・頻度=題数分位・難度は捏造せず(年度+term跨度)・図解二軌(Mermaid新図 + Stage2原裁剪図を `figure_index.json` 索引附加し溯源)。規模更正(330〜530→~180〜240 unit)。 D-132 実行チャネル: 全 LLM 工作は Claude Code(subagents/Workflow/ultracode, `model=opus`)で実行、外部 Anthropic API/Message Batches API 不使用(ユーザー Max plan・定額; D-128-C Batches 案撤回, D-129 effort は Claude Code 構成, D-110 SDK 条項を精緻化)。ADR: `D-128〜132-*.md`。**
- **D-134〜135: Session 86 Quiz 接過去問サブ段階 設計(D-019)。D-134 配信: raw `question_bank.json`/`pages`(762M)/`figures`(109M) は gitignored 維持、クリーン派生 `data/ip/quiz/`(projection 済 field + 出典 + 最適化 figure 467 + 後段の翻訳/解析)を un-gitignore。IPA 公式 FAQ で過去問は教育利用許諾・使用料不要(出典明記+改変明記が条件、著作権非放棄)→ 公開 repo OK、D-133 著作権顧慮を解消。raw を晒さないのは内部 cruft(`*_corrupted_backup`/`s027_*`)+破損 OCR backup+容量回避。D-135 架構: v1=JP-first 真題練習面(JP stem/choices+正解+出典、2 モード=syllabus 主題別[教科書 unit 埋込]+試験年度別、figure 問含む、自前 `lib/quiz/quizReader.ts`=S85 reader 踏襲)。翻訳(2900×{zh,en})+解析(2900× 三語)は預生成・バッチ・各バッチ Rule A・増量 backfill(Stage-4/D-119 パターン、Workflow+opus、D-132 で外部 API 不使用)、runtime AI ではない。却下: raw as-is un-gitignore/全 gitignored+deploy 注入/私有 blob/live AI explain/全翻訳後一括上線。ADR: `D-134-quiz-data-distribution.md`/`D-135-quiz-substage-architecture.md`。Phase 0(止血+地基)実施は GO 待ち。**<br>- **D-133: Session 85 Stage 6 起動。自作教科書データ `data/ip/textbook/`(25M)のみ gitignore 解除して in-repo 化、IPA 由来(`exams/` 1.2G・`sources/` 168M・`syllabus/`)は著作権+容量で gitignored 維持。ユーザー前提「都是自己写的」は textbook のみに該当(実測で食い違いを surface)、AskUserQuestion で「只 textbook/」確認。unit の IPA 由来参照(inline_quiz/challenge=question_bank ID、source_figures=exam PNG)は v1 で繰延・loader は null 降級。D-050/D-109 の Release-only モデルを IPA 由来に限定する精緻化。却下: 全 un-gitignore(著作権暴露+20倍肥大) / `TEXTBOOK_DATA_ROOT` 直読(生産で不成立) / quiz-id manifest 先行(YAGNI)。ADR: `D-133-textbook-data-in-repo.md`。**
- **D-127: Session 77 Stage 3.5「Stage 3 後置クリーン」を新設（ユーザー選択、G4 前置の任意品質クリーン）。3.5a low-conf 59題を Opus+figure で跨段高精度重判（昇格可なら confidence↑、依然 low は入档、subagent_type 既存4段と相異=Rule D）。3.5b 語彙ギャップ19語を甄别し核心考点語4のみ knowledge_tree へ補完（サービスデスク/セキュリティパッチ/アジャイル/組込みシステム、仮想サーバ等は不補、term 1413→1417 文字列級挿入）。term計数 1413 は総出現数で正(当初「1391修正」案は Set去重の誤判定で撤回)。invariants 不変、バックアップ `.pre-s035`、Rule A/B/D 適用。ADR: `D-127-stage-3.5-post-mapping-cleanup.md`。**

---

## Session 64 新决策

| ID | 内容 |
|----|------|
| **D-114** | 学習路径組織方式 — 双軌導航：シラバス官方树为主导航 + テクノロジ→マネジメント→ストラテジ 推荐路径 |
| **D-115** | 学習ユニット内容架构 — 5~8 用語/~15 min 为原子单位，四段结构（概要→用語講解→まとめ→チャレンジ），深度嵌入即時チェック + AI Tutor |
| **D-116** | 記憶フック「○○といえば××」为每个用語的标准配置 |
| **D-117** | ユニット内用語排列 — 概念依赖优先 + 出題頻度辅助排序 |
| **D-118** | Stage 4 输出 JSON Schema — unit_index.json + units/{id}.json，Quiz 引用不内嵌，三语 `_jp/_zh/_en` 平铺 |

---

## Session 65 Stage 1 完成

### 产出物

| 文件 | 大小 | 内容 |
|------|------|------|
| `data/ip/syllabus/knowledge_tree.json` | 67 KB | 完整シラバス树: 3 categories / 9 大分類 / 23 中分類 / 63 topics / **1,413 用語** |
| `data/ip/syllabus/exam_meta.json` | 1.2 KB | IT Passport 考试元信息 (120分/100問/IRT/合格基準) |
| `data/ip/syllabus/official_glossary.json` | 1.6 KB | 考试用語規約 (記号/言語/表計算仕様) |

### Rule A 审核

N=10 独立抽检 (code-reviewer agent)，**10/10 PASS**。证据: `evidence/phase5/stage_01_audit.md`

---

## Session 66 Stage 2 過去問全量提取

### 产出物

| 文件 | 大小 | 内容 |
|------|------|------|
| `data/ip/exams/question_bank.json` | 2.3 MB | 29回統合: **2,677 題** (stem + choices + answer) |
| `data/ip/exams/answer_keys.json` | 57 KB | 29回 × 100 = **2,900 解答** (100% 正確) |
| `data/ip/exams/by_year/*.json` | 29 files | 年度別 JSON |
| `scripts/ocr-extract-questions.mjs` | — | Tesseract OCR 提取スクリプト |

### 提取統計 (final)

- 29 回試験: FY2009～FY2026 (58 PDF ダウンロード)
- **2,860 / 2,900 題抽出 (98.6%)**
- 解答正確率: 99.9% (2,858/2,860)
- **選択肢完全率: 100% (空選択肢ゼロ)**
- question_bank.json: 2.7 MB

### 提取方法

1. Tesseract OCR (v4, 4回のパーサ改善) → 題幹+解答の基盤データ
2. Claude vision (7並列 agent) → 564 空選択肢を PDF 視覚読取りで補完

証拠: `evidence/phase5/stage_02_audit.md`

---

## Session 68 Stage 2 OCR 品質修復

### 修復統計

| 修復類型 | 数量 |
|---------|------|
| P3 改行+ノイズ | 2,023 |
| P2 文字置換 (TIT→IT, 0SS→OSS, サーパ→サーバ 等) | 763 |
| P1 選択肢溢出切断 | 27 |
| P0 偽Q100/幽霊Q109 削除 | 20 |
| P0 Q1題幹 Claude vision 再抽出 | 13 |
| **合計** | **2,846** |

修復後: 2,840 題、切断題幹 0、幽霊題号 0、空答案 0、P2 残留 0

### 全量 AI 審査方案 (Session 69 で実行)

- 29 套 PDF → 画像変換 + ページマッピング
- 每套 5 分片 (10 ページ/片)、6 並行 agent
- 逐題: 画像 vs JSON 対照 → PASS / FIX
- 図表題: figure_description 追記
- 独立 reviewer 校験 (Rule D)

### 残存課題

- 数字 0↔9 誤認識: ~30+ (計算題に集中)
- 題幹-選択肢不整合: ~14 (2015h27h, 2022r04)
- 欠落問題: ~42 (図表題が主)
- 試験説明残留: 3

### 成果物

| ファイル | 内容 |
|---------|------|
| `scripts/fix-ocr-quality.mjs` | P2+P3+P1 一括修正 |
| `scripts/fix-p0-cleanup.mjs` | 偽Q100/幽霊Q109 除去 |
| `scripts/fix-p0-q1-patch.mjs` | Q1 vision パッチ |
| `evidence/phase5/stage_02_fix_report.md` | 修復証拠 |

---

## Session 69 Stage 2.5 全量 AI 審査完了

### 審査統計

| 指標 | 数値 |
|------|------|
| PDF 画像変換 | 29 PDF → 1,450 ページ PNG |
| 審査対象 | 3,038 題次 (29 agent 並行) |
| PASS | 1,784 (58.7%) |
| FIX 適用 | 935 件 |
| 欠落題補録 | 60 題 |
| 図表更新 | 452 件 |

### 修復後データ品質

| 指標 | 修復前 | 修復後 |
|------|--------|--------|
| 総題数 | 2,840 | **2,900** |
| 100題/套 | 0/29 | **29/29** |
| 空題幹 | 13 | **0** |
| 欠損選択肢 | 若干 | **0** |
| has_figure | ~220 | **358** |
| figure_description | ~0 | **266** |

### Rule D 独立審査

N=15 抽検 (code-reviewer agent, executor とは別): **12/15 PASS → CONDITIONAL PASS**
- 3 件の修正指摘を手動適用済
- 証拠: `evidence/phase5/stage_02_ai_review_audit.md`

### 成果物

| ファイル | 内容 |
|---------|------|
| `data/ip/exams/pages/` | 1,450 PNG |
| `data/ip/exams/reviews/*.json` | 29 審査レポート |
| `data/ip/exams/by_year/*.json` | 29 修正済 JSON (各 100 題) |
| `data/ip/exams/question_bank.json` | 統合 2,900 題 |
| `scripts/apply-ai-review.mjs` | AI 審査修正適用スクリプト |

---

## Session 70 Stage 2 補完

### 実施内容

1. **データ品質修正**: 空答案 28 題を `answer_keys.json` から回填 + 2025r07-q026 手動修正
2. **全量ページマッピング**: 二重チャネル（Tesseract OCR + Claude Vision 29 agent）→ 95.8% 一致率、Vision 採用
3. **図表裁剪**: 502 枚を bbox 座標で裁剪 → `data/ip/exams/figures/`
4. **JSON 回写**: 2,900 題に `source` (ページ溯源) + 493 題に `figure_path` / `figure_bbox_pct` / `figure_type`
5. **全量検証**: 502 枚全数を 13 バッチ agent で目視検証 → 400 PASS / 102 FAIL (20.3%)

### 成果物

| ファイル | 内容 |
|---------|------|
| `data/ip/exams/mappings/*_pages.json` | OCR マッピング (29 套) |
| `data/ip/exams/mappings/*_vision.json` | Vision マッピング (29 套) |
| `data/ip/exams/mappings/final/*.json` | merge 済最終マッピング (29 套) |
| `data/ip/exams/figures/*.png` | 裁剪済図表 (502 枚) |
| `data/ip/exams/figures/_all_fails.json` | 検証 FAIL 一覧 (102 件) |
| `scripts/build-page-mapping.py` | Tesseract OCR マッピング |
| `scripts/compare-and-merge-mappings.mjs` | 二重チャネル比対 |
| `scripts/crop-and-update.mjs` | 裁剪 + JSON 回写 |

---

## Session 71 Stage 2 補完完了（図表 FAIL 修復）

### 実施内容

1. **FAIL 計数調和 (Item 1)**: `_all_fails.json` の `total_fail:102` は誤り。`fails` 配列 97 件のうち 1 件重複 → **真の唯一 FAIL = 96 件**。証拠: `evidence/phase5/stage_02_fail_reconciliation.md` + canonical 清单 `figures/_fails_canonical.json`。
2. **Session 70 成果のコミット (Item 2)**: commit `7f85ca9`（STATE + session-70 ログ + 4 スクリプト）。
3. **図表 96 件修復 (Item 3)**: 主ループ編成 + workflow 並列ビジョンの多ラウンド方式。**93 修復 + 3 降格、未解決 0**。
   - ラウンド 1-3: ESTIMATE(general-purpose) → 確定的裁剪 → VERIFY(explore, Rule D) → loop-until-dry。86 件が自動収束。
   - 手動 7 件: 跨ページ誤マッピング 2 (q097→p42, q061→p24)、位置誤認 2 (q069, q008)、表頭截断 3 (q011, q026, q072)。
   - 降格 3 件: q063 / q090 / q029（真の図表なし、独立確認済）。
   - Rule A/D 最終監査 (code-reviewer, N=15): 14 PASS + 1 → q026 の **stem 汚染バグ**を発見し訂正（図表は正しかった）。
   - 証拠: `evidence/phase5/stage_02_figure_repair.md` + `audit_results_figure_repair.json`。

### データ最終状態

総 2,900 題 / 空答案 0 / figure_repaired 96 / has_figure(path付) 修復済。旧図 96 + 降格 3 を `figures/_rejected/` に温存 (Rule B)。

---

## Next (Session 72) — Stage 2.6 データ実測審核を実行

**Stage 3 の前に Stage 2.6 を完了させる**（D-119 ゲート）。ユーザー指示: 「遺留項ゼロまで実測してから Stage 3」。

実行仕様: **`docs/phase5/STAGE_2.6_AUDIT_PLAN.md`**（決定根拠 `docs/decisions/D-119-stage-2.6-data-audit.md`）。

要点:
1. **全量センサス**（L3 跨题汚染 / L4 図文引用 / L6 答案分布）を全 2,900 題に → フラグ triage。
2. **抽样深核**（L1 再解答逆検査 / L2 跨字段整合 / L5 数字 / L-ext 外部源交叉）を N≈100 層化 + 既知シードで → loop-until-no-new-class。
3. 欠陥は D-119 方針（確実→即時修+backup / 曖昧→帰档）。
4. ゲート 4 条件充足 → **Stage 3 開始**。

**既知シード**: has_figure 孤児 16 (`data/ip/exams/.tmp/repair/orphan_has_figure_no_path.json`) / 題幹-選択肢不整合 ~14 (@2015h27h,2022r04) / 0↔9 数字誤識 ~30 / q026 型 stem 汚染。
