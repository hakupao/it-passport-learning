# Quiz Phase 2 — Session 108 adjudication (2016h28h + 2015h27a)

> Session 108 (2026-07-17) / D-137 / D-140 scale batch 7. Effort: ultracode.
> Batch = **2016h28h + 2015h27a** (最新順, serial, 2 exam/session 上限). Commit gate = commit + push 自動.
> Mid-batch: ユーザー「2016h28h 完成后先暂停」= 2016h28h を commit まで完走 → 一時停止 → 「継続」で 2015h27a。
> Rules: A (independent N-sample audit), B (failure archive), D (writer ≠ in-pipeline reviewer ≠ Rule A critic ≠ 主 context).
> Agent 三互異: writer=`general-purpose` / in-pipeline reviewer=`feature-dev:code-reviewer` / Rule A critic=`pr-review-toolkit:code-reviewer`.

---

## §1. 2016h28h (平成28年度 春期) — ✅ 完了

**generate** `wf_a4c6bcc9-552`: 初回 run が**翻訳ステージで限額中断** (JP 100/100 完成、tr 23/100 で quota 直撃、task output 0 bytes = 最終 return 未到達)。**ユーザー「重新开始因限額被中断的任务」→ 旧タスク TaskStop → `resumeFromRunId` で resume** (task `wchcyoa8m`): cached JP 100 + 済 tr 23 を replay + 残り翻訳を再走 → **100/100 · jp PASS 100 · tr PASS 99 / CONCERNS 1 · suspect 0** (S106 2017h29h と同型の limit→resume 復旧、resume run error 0)。resume 408 agent / 8.02M tok。

**決定的 persist** (resume final output): empty-note 0 / missing jp_verdict 0 → verify-result 100/100 → merge:
**SUSPECT 0 · STEM-CORRUPTION 5 → q005, q009, q016, q018, q061** (いずれも非 answer-affecting、全て
stem_corruption_suspected=true で flag)。

### 裁決 (主 context source read, 源ページ page-03/05/08/09/28)

5 件とも generator が flag (stem_corruption_suspected=true) → S106 と同じく標準の裁決・是正対象 (note-only の
未 flag garble [例 q007 「洞穴→洞察」] は「semantic choice-OCR cleanup」backlog track へ)。全 key 不変。

| id | key | 種別 | raw (corrupt) | source (実読) | fix |
|---|---|---|---|---|---|
| **q016** | エ | stem | ISO **9991** | **page-08**: ISO **9001** (QMS 規格) | 9991→9001 (raw stem [clean=null] + zh/en) |
| **q018** | ウ | stem(clean) | 「**組立**される製品」(生産 脱落) | **page-09**: 「**組立生産**される製品」 | clean のみ (raw 非表示・table値は clean 源一致) |
| **q009** | ア | choice | ア「**69**日」/ウ「**6**日間」/エ「**66**日後」 | **page-05**: 全4肢「**60**日」(下請法60日ルール、イ既60) | ア/ウ/エ→60 (raw choices、**正解肢ア含む**) |
| **q005** | ウ | choice | エ 末尾「**= 吐**」junk | **page-03**: 「…システムである。」 | strip (raw choice エ) |
| **q061** | ア | choice | ウ「**人入力**」(余分な人) | **page-28**: 「**入力**した」 | 人除去 (raw choice ウ) |

- **q009 は正解肢ア (60日以内・検査終了問わず支払義務) の表示数字が 69→60 に是正** = 学習者が正しい 60 日を見る (zh/en は既に 60)。
- **q016 stem OCR は zh/en に伝播** (「ISO 9991」) → trfix で zh/en も是正。JP は clean=null ゆえ raw stem 修正で表示クリーン。
- **q018 は stem_jp_clean が表示権威**、表値は源一致で不動、語句脱落「生産」のみ clean 是正。raw stem_jp の別 OCR (組立production 等) は非表示ゆえ不動。

### 体系 caveat スキャン (S106 手順)
- 全100問 user-facing スキャン。**q005 distractor エ の {jp,zh,en}** が「なお選択肢末尾の「= 吐」は OCR 由来…」
  という stale caveat を保持 → choice の「= 吐」strip 後は冗長 → **explfix-S108 で strip** (anchor→末尾 slice+trim)。
  q009/q016/q018/q061 の本文は clean 値使用・caveat なし (q009/q018 の「误/错误」は正常な why-wrong 説明)。

### 是正層 (drift-proof)
- **stemfix-S108** (raw bank): STEM 1 (q016) + CHOICE 5 (q005 strip / q009 ×3 / q061) = **6** → build-quiz-corpus。
- **trfix-S108** (tr サイドカー): q016 zh/en + q018 stem_jp_clean = **3** フィールド。
- **explfix-S108**: q005 distractor エ の caveat strip (3) + generate_result の q005/q009/q016/q018/q061 key_guard 解決 (5)。

**merge (post-fix)**: **SUSPECT 0 · STEM-CORRUPTION 0**。verify-result 100/100 (flagged 0)。

### invariants (git 確証)
- **questions.json diff = 4 問 (q005/q009/q016/q061 の stem_jp/choices_jp)**、**correct_answer 0 変更 (全 2900)**、
  quiz_index 不変。q018 は clean-only ゆえ raw 不変。
- **translations/2016h28h.json = 3 フィールド** (q016 zh/en + q018 clean)。
- explanations/2016h28h.json = 新規 sidecar (traced 14→15)。**user-facing caveat 残存 0 / 腐敗トークン残存 0**。

### Rule A (independent critic) `wf_48a1ecad-917`
- N=28: 全17図 + 是正5問 (q005/q009/q016/q018/q061 forceNums) + tr-CONCERNS (q050) + plain top-up。
- 結果: **accurate 28/28 · severity {none 19, low 9} · bad key 0 · keyGuardMismatch なし**。
  - **是正5問を critic が独立確認・全 severity none**: q005→ウ / q009→ア / q016→エ / q018→ウ / q061→ア (fixed stem から独立導出し key 一致)。
  - **low 9 = 全て非 answer-affecting → backlog**: ① zh polish 6 (q017 价格战略→定价策略 / q020 营业外收益→收入 / q022 使用者→用户 /
    q035 平板终端→平板电脑 / q048 出入室管理→门禁管理 / q050 工程→阶段[tr-CONCERNS=benign 確認]) ② 非UI note_jp artifact 3
    (q001/q012/q091: generator note が存在しない OCR 是正を主張する boilerplate 混入、note_jp 非露出ゆえユーザー無影響)。
  - 証拠 `ruleA_result_S108_2016h28h.json`。

### 検証 GREEN
- tsc 0err / eslint 0err (既存 warning 1 = tTerm) / **vitest 463 passed | 2 skipped** / build exit 0 /
  **nft IPA-source leak 0** (19 .nft.json、quiz route trace = questions/quiz_index/translations/explanations のみ)。
- explanations sidecar = **15** (14 + 2016h28h)。

### Rule B — limit→resume 事象 (既知・復旧可能、有損なし)
- 初回 generate `wf_a4c6bcc9-552` が翻訳中に quota で中断 (JP 完成・tr 23/100・output 0 bytes)。**新規失敗モードでは
  なく S106 2017h29h と同型**。TaskStop → `resumeFromRunId` で cached 復元 + 残走 → 100/100 完走・有損 0。
  決定的 persist は resume の最終 task output (`wchcyoa8m.output`) の `.result` を使用 (cached+live merged)。

---

## §2. 2015h27a (平成27年度 秋期) — ✅ 完了 (ユーザー「継続」で再開)

**generate** `wf_cae60bcf-52a`: **2 種の transient インフラ事象で 2 回 resume**して完走 (Rule B、いずれもコンテンツ不良でない):
1. **初回 run が翻訳ステージで session limit 直撃** (3am Asia/Tokyo、JP 98/100 完成、tr 6/100・99 agent 失敗)。
2. **1 回目 resume で safety-classifier「Stage 2 classifier error」24 件** (JP review をブロック、"usually transient")
   → jpVerdict null 23。全 expl_jp/expl_tr は on-disk 生成済 (100/100)。
3. **2 回目 resume で transient 完全クリア** → **100/100・jp PASS 99 / CONCERNS 1・tr PASS 88 / CONCERNS 12・error 0**。
ユーザー指示「重新开始因限額被中断的任务」×2 で resume 実行。決定的 persist は最終 task output (`wl87o1ycz`) の `.result`。

**決定的 persist**: empty-note 0 / missing jp_verdict 0 → verify-result 100/100 → merge (pre-fix):
**SUSPECT 6 (q087/q091/q094/q095/q097/q098)・STEM-CORRUPTION 2 (q092, q099)**。

### 裁決 — OCR 是正 1 + 図/シナリオ linkage-gap クラスタ 7 (backlog)

**⚠ この exam の特徴 = 連問 (case-study) セクション q87–q100 で共有図/前置ブロックの linkage-gap がクラスタ発生**。
generate 入力 (単問抽出) に図1・共有プリアンブルが未添付 (`has_figure=false`, `figure_png=null`, `group_id` フィールド
不在)。これは **Phase 1/1.5 の figure/scenario 抽出ギャップ** (S98/S99 で 2015h27a-q094/q100 を incomplete-source と
既記録) であり、**Phase 2 が導入した欠陥ではない**。OCR テキスト是正では直せず、**図/シナリオ再抽出 (data-linkage) の
専用 backlog**。generate は D-137-C に従い stored key 前提で解説を執筆 (解説は表値等を内包し自己完結・key は正)。

| id | key | 種別 | 裁決 |
|---|---|---|---|
| **q092** | ウ | **OCR (answer-affecting)** | **page-41 実読「単価を50円値引き」確定** (raw 56 は 0→6 腐敗、56だと89杯=選択肢外・50だと87=ウ)。**是正** (raw stem + clean/zh/en + 解説末尾 caveat strip + key_guard resolve) |
| q087 | イ | figure-gap (図1 集計表) | 包除原理 和=A+B−両方、stem に交わり38+選択肢の数値で導出可=イ。**benign・図は backlog** |
| q091 | ウ | figure-gap (図1 売上表) | derived=unsure (源データ欠落)、選択肢内部整合で key ウ 妥当。**backlog** |
| q094 | エ | figure-gap (図1 アロー図) | 兄弟問 q95/q96 の key と整合させ最長経路16日=エ 確定 (matches_key=true)。**backlog** |
| q095 | イ | figure-gap (図1 アロー図) | derived=unsure、工程日数欠落。stored key イ(=2日) 前提執筆。**backlog** |
| q097 | ウ | scenario-gap (〔調べた結果〕) | AND 検索、ウのみ「X社PC+回収+料金」3語具備=ウ。**benign・シナリオは backlog** |
| q098 | ウ | scenario-gap (料金表+機器一覧) | derived=unsure、料金表欠落。PCリサイクルマーク論理で key ウ(7,560) 前提執筆。**backlog** |
| q099 | ア | scenario-gap (Aさん前置文) | **page-46 実読で stem は源と逐語一致** (OCR 腐敗なし)。答え ア は選択肢から導出可 (全領域上書き=データ抹消)。前置文 linkage-gap のみ。**OCR 非該当・backlog** |

### 是正層 (drift-proof) — q092 のみ
- **stemfix-S108** (raw bank): q092 「56円」→「50円」= 1 (build-quiz-corpus)。
- **trfix-S108** (tr サイドカー): q092 clean/zh/en = 3 フィールド。
- **explfix-S108**: q092 correct.{jp,zh,en} の stale OCR caveat strip (3) + generate_result key_guard resolve (1)。

**merge (post-fix)**: **SUSPECT 6 (q087/q091/q094/q095/q097/q098)・STEM-CORRUPTION 1 (q099)** — 残る 7 は全て
figure/scenario linkage-gap (backlog、OCR 非該当)。verify-result 100/100。

### invariants (git 確証)
- **questions.json diff = q092 stem_jp のみ**、**correct_answer 0 変更 (全 2900)**、quiz_index 不変。
- **translations/2015h27a.json = q092 clean/zh/en = 3 フィールド**。
- explanations/2015h27a.json = 新規 sidecar (traced 15→16)。

### Rule A (independent critic) `wf_7fc297e8-a27`
- N=32: 全17図 + suspect 6 + stem-corrupt q099 + 是正 q092 + tr-CONCERNS + plain top-up。
- 結果: **accurate 32/32 · severity {none 21, low 9, medium 2} · bad key 0 · keyGuardMismatch なし**。
  - **q092 (是正) = severity none・independent ウ=key** ✓ (fixed stem から独立導出)。
  - **medium 2 (q094/q095) = 図-linkage gap の透明性記録** (解説本文の欠陥でない): critic 曰く「key は公式 IPA 解答
    (q094=エ16/q095=イ2) と一致・key_guard が figure_derivable=false/suspect=true で**適切に捕捉済み**・解説品質は良好」。
    ただし**図1が未表示ゆえ解説が見えない図を参照** ("図1では複数の経路…" 等) し、答えの正しさは**図なしでは独立検証不可**。
    = §2 で登録した figure-linkage gap クラスタと同根 (OCR 非該当・図再抽出 backlog、Phase 2 範囲外)。
  - **low 9 = 全て非 answer-affecting backlog**: zh polish 5 (q024 整备/q051 人为→人员/q099 数据本体/q100 一体型/q086 集计)、
    figure-gap 透明性 note 3 (q091/q097/q098)、解説の薄さ/曖昧 (q086 絶対参照表現/q087 誤答ウ説明)。
  - 証拠 `ruleA_result_S108_2015h27a.json`。**判断: explanations は key 確定・正確ゆえ ship、図-linkage gap 7 問は
    figure 再抽出 track (What's Next、ユーザー判断) に登録** (S99 の incomplete-source ship + backlog 先例に整合)。

### 検証 GREEN
- tsc 0err / eslint 0err (既存 warning 1 = tTerm) / **vitest 463 passed | 2 skipped** / build exit 0 /
  **nft IPA-source leak 0** (19 .nft.json、quiz route trace = questions/quiz_index/translations/explanations のみ)。
- explanations sidecar = **16** (15 + 2015h27a)。

### Rule B — 2 種 transient 事象 (既知・復旧可能、有損なし)
1. **session limit** (3am JST) 初回 run 翻訳中断 → resume で cached JP 復元。
2. **safety-classifier Stage 2 error** (transient、JP review 24 件ブロック) → 2 回目 resume で完全クリア。
両事象ともコンテンツ (解説本文・翻訳) は正常生成、verdict/review のみ影響。新規失敗モードなし。

### backlog 提起 (ユーザー判断) — 2015h27a 連問 figure/scenario linkage-gap
- **7 問** (q087/q091/q094/q095/q097/q098/q099) が図1 or 共有前置ブロック未添付。**S98/S99 の incomplete-source
  (q094/q100) と同根の data-linkage 抽出ギャップ**。答え・解説は正 (key 確定・自己完結) だが**問題表示に図/前置文が
  欠落**。Phase 2 の範囲外 (OCR テキスト是正では直せない) → **図/シナリオ再抽出 track** に登録。
