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

## §2. 2015h27a (平成27年度 秋期) — ⏸ pause 中 (ユーザー「継続」待ち)

prep 済: 100問 / 17図 [7,8,9,26,48,54,55,64,66,71,72,75,85,86,88,89,100] / tr 100/100 / id 連続 ✓。
ユーザー指示「2016h28h 完成后先暂停」で 2016h28h 完走後に一時停止。「継続」指示で generate → … → commit を実行。
