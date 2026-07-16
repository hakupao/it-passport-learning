# Quiz Phase 2 — Session 107 adjudication (2017h29a + 2016h28a)

> Session 107 (2026-07-16) / D-137 / D-140 scale batch 6. Effort: ultracode.
> Batch = **2017h29a + 2016h28a** (最新順, serial, 2 exam/session 上限). Commit gate = commit + push 自動.
> Mid-batch pause: ユーザー指示「跑完2017h29a结束后，暂停一下，我说继续再跑2016h28a」= 2017h29a を commit まで完走 → 一時停止 → ユーザー「継続」で 2016h28a (S104 型 pause)。
> Rules: A (independent N-sample audit), B (failure archive), D (writer ≠ in-pipeline reviewer ≠ Rule A critic ≠ 主 context).
> Agent 三互異: writer=`general-purpose` / in-pipeline reviewer=`feature-dev:code-reviewer` / Rule A critic=`pr-review-toolkit:code-reviewer`.
> Persist = deterministic (S105 恒久硬化): `quiz-phase2-persist.mjs <task_output> <exam>` → verify-result → merge.

---

## §1. 2017h29a (平成29年度 春期) — ✅ 完了

**generate** `wf_c275888b-ae2` (task `wup3eaijc`): **100/100 · jp PASS 100 · tr PASS 96 / CONCERNS 4 · suspect 3**.
416 agent / 13.45M tok / ~62 min, error 0, one-shot (no session-limit hit).

**persist (deterministic)**: task output `.result` → `generate_result_2017h29a.json`, **empty-note 0 /
missing jp_verdict 0** (S104 lossy-mode symptoms absent). **verify-result 100/100 PASS**.

**merge (pre-fix)**: explained 100/100, missing 0, **SUSPECT 3 → q009, q017, q040**,
**STEM-CORRUPTION 3 → q009*, q016, q040*** (* = answer-affecting).

### 裁決 (主 context source read, q052 protocol / D-小6 full-page authority)

3 stem-corruption OCR + 1 benign over-flag。源ページ PNG (1432×2026 を 1.6x 拡大 = 2291×3242) を実読し、
generator の是正案 (IPA 記憶ベース) が源と一致するか**独立に確認**。全て一致・全て key 不変。

| id | field | raw (corrupt) | source (実読) | fix | key |
|---|---|---|---|---|---|
| **q009** | stem 数値×5 | 販売価格1,099円 / 10,999個 / 1,099千円 / 12,900個 / 1,860千円 | **page-05 問9**: 1,000円 / 10,000個 / 1,000千円 / 12,000個 / 1,800千円 | 5 数値是正 (answer-affecting) | イ 不変 |
| **q016** | stem 固定費 | 固定費が**156**万円 | **page-08 問16**: 固定費が**150**万円 | 156→150 | イ 不変 |
| **q040** | stem 作業日数 | **26**日掛かる | **page-17 問40**: **20**日掛かる | 26→20 (answer-affecting) | ア 不変 |
| q017 | — | (腐敗なし) | **page-08 問17**: エ「製品の企画・設計・生産などの各工程をできるだけ並行して…」= コンカレントエンジニアリング定義 | **NO-OP** (benign over-flag: figure_derivable=false 概念問, derived=key) | エ 不変 |

#### q009 (answer-affecting, S103 q036 / S106 q077 型)
- generate key-guard `matches_key=true` だが `stem_corruption_suspected=true`: literal 腐敗値で計算すると
  限界利益 ≈ 400.3円・変動費 ≈ 698.7円 で選択肢 (400/600/850/900) のどれにも一致せず。
- **主 context page-05 実読で正値確定**: 限界利益 = (1,800−1,000)千 ÷ (12,000−10,000)個 = 400円/個 →
  変動費 = 1,000 − 400 = **600 = イ** (公式キー不変)。検算: 固定費 = 400×10,000 − 1,000,000 = 3,000,000円、
  12,000個でも 400×12,000 − 3,000,000 = 1,800,000円 で一致。
- generator は解説本文を**正値で執筆済** (correct_jp が 1,000/10,000/1,800 を使用) = 本文 stale 0 → explfix 本文不要。

#### q040 (answer-affecting)
- generate key-guard `derived=unsure` / `matches_key=false` / `stem_corruption_suspected=true` で正しく回付:
  literal 26日 だと総量 = 3×26 = 78, A+C = 5 → 78÷5 = 15.6日 で選択肢 (12/15/18/20) に一致せず。
- **主 context page-17 実読で 20日 確定**: A:B:C = 2:1:3, A+B = 3 → 総量 = 3×20 = 60, A+C = 5 → 60÷5 = **12 = ア**
  (公式キー不変)。

#### q016 (non-answer-affecting, source value ≠ display value)
- generate key-guard `matches_key=true` / `stem_corruption_suspected=true`: 表示 156 だと損益分岐点 ≈ 302.9 →
  最近接イ(300) に寄る (答え不変) が、源値は 150。
- **主 context page-08 実読で 150 確定**: 変動費 = 400−50−150 = 200, 限界利益率 = 0.5, 損益分岐点 = 150÷0.5 =
  **300 = イ** (厳密一致)。

### 体系 caveat スキャン (S106 手順) — flag-gap + stale caveat 捕捉
- **全100問の user-facing 説明を OCR-caveat + 腐敗トークンでスキャン**。
- **flag-gap**: 追加の user-facing choice-OCR は 0 (generate stem_corruption flag すり抜けなし)。
- **stale caveat 2**: **q016** correct.{jp,zh,en} と **q040** correct.{jp,zh,en} が「(注: …156→150/26→20 の OCR
  誤り…)」という括弧注記を保持 (generator が D-137-C で正値計算しつつ表示腐敗を注記)。stem 是正で注記が
  stale 化 → **explfix-S107 で strip** (S106 q077 パターン)。q009 は本文 caveat なし。
- **note-only choice garble (backlog track)**: generate note が明かす user-facing choice OCR (2017h29a: q033 ア
  「1C タグ」(IC) / q079 エ 末尾「ぜい」/ q084 エ「ボネットワーク」/ q034 引用符 等) は S105/S106 と同じ最小
  スコープで**本 session は非対象** → 「semantic choice-OCR cleanup track」に合流 (What's Next、ユーザー判断待ち)。

### 是正層 (drift-proof)
- **stemfix-S107** (raw bank stem_jp): q009 ×5 + q016 ×1 + q040 ×1 = 7 substring assert-once 置換 →
  `build-quiz-corpus` で questions.json 再生成。
- **trfix-S107** (tr サイドカー): q009 stem_jp_clean/zh/en ×5 + q016 zh/en (clean=null) + q040 clean/zh/en =
  **20 フィールド**。stem_jp_clean が q009/q040 の JP 表示権威。
- **explfix-S107**: Layer 1 = q016/q040 correct.{jp,zh,en} の stale caveat strip (6)。Layer 2 = generate_result の
  q009/q016/q040 key_guard + round1 を post-fix reality に解決 (derived/matches_key true/stem_corruption false、
  round-1 盲導出履歴は note に保存) → suspect=false。

**merge (post-fix)**: **SUSPECT 1 → q017** (benign over-flag), **STEM-CORRUPTION 0**。verify-result 100/100。

### invariants (git 確証)
- **questions.json diff = 3 stem_jp フィールド** (q009/q016/q040)、**correct_answer 0 変更 (全 2900 検証)**、
  quiz_index 不変。
- **translations/2017h29a.json = 8 stem フィールド** (q009 clean/zh/en + q016 zh/en + q040 clean/zh/en)。
- explanations/2017h29a.json = 新規 sidecar (untracked)。**user-facing caveat 残存 0 / 腐敗トークン残存 0**。

### Rule A (independent critic, `pr-review-toolkit:code-reviewer`) `wf_c56ddbe1-7d5`
- N=28: 全12図 + suspect q017 + 是正3問 (q009/q016/q040 を forceNums で強制包含) + tr-CONCERNS (q003/q038/q045/q047) + plain top-up。
- 結果: **accurate 28/28 · severity {none 24, low 4} · bad key 0** (全 independent_answer == key)。
  - **是正3問を critic が独立確認**: q009→イ / q016→イ / q040→ア (fixed stem から独立導出し key 一致) = 源実読是正の独立裏付け。
  - keyGuardMismatch = **q017 のみ** (benign over-flag: 図なし概念問で figure_derivable=false→suspect=true の内部不整合、
    critic 曰く「解説本文は完全に正しく忠実で答え(エ)にも影響なし」。危険方向 [false suspect=false] でなく安全側過検出)。
  - **low 4 = 全て非 answer-affecting → backlog**: ① q015 zh「统合」→本土「整合」(polish) ② q017 benign suspect
    over-flag ③ q018 非UI note_jp の事実誤認 (raw stem に脱落ありと誤記、実際は源逐語一致) ④ q047 非UI note_jp の
    幻覚参照 (「stored key ウ」= 実在しない、stored は ア)。③④は `localizeExplanation` が note_jp 非露出ゆえユーザー無影響。
  - 証拠 `ruleA_result_S107_2017h29a.json`。

### 検証 GREEN
- tsc 0err / eslint 0err (既存 warning 1 = tTerm RetroGlossary) / **vitest 463 passed | 2 skipped** / build exit 0 /
  **nft IPA-source leak 0** (19 .nft.json, `data/ip/{exams,sources,syllabus}`・question_bank 0 hits、quiz route
  trace = questions.json + quiz_index.json + translations/* + explanations/*)。
- explanations sidecar = **13** (12 既存 + 2017h29a) → nft explanations/* glob resolve 確認。

---

## §2. 2016h28a (平成28年度 秋期) — ⏸ pause 中 (ユーザー「継続」待ち)

prep 済: 100問 / 17図 [20,21,25,28,40,41,43,50,60,74,75,79,82,92,93,96,99] / tr 100/100 / id 連続 ✓。
ユーザー指示で 2017h29a 完走後に一時停止。「継続」指示で generate → … → commit を実行。
