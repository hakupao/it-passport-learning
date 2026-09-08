# PLAN — ⑤-2 全量保真掃引の分批実行計画 (D-146 準拠)

> 作成: Session 118 (2026-09-08)。真相源は `docs/STATE.md`、本 PLAN は ⑤-2 残作業の**単位 (unit) 定義・予算・手順・停止条件**を固定する。
> 1 セッション = 1 unit。unit 開始前に主 context が「agent 数 / 予想 token / 予想時間 / 停止条件」を申告し、ユーザー承認で放つ。叠加禁止 (直列)。

## 0. 現在地 (2026-09-08、S121 U2 完了)

| 区分 | exam | 状態 |
|---|---|---|
| **U1 Sonnet A/B** | 2015h27a | **完了 (S120)**: Sonnet 単 pass 召回 12/12 差分・8/8 問、偽陽性 0、machdiff 残差 1 (q066 既知仕様)、4.03M token / 15 分、画像 Read 2.3 回/問、part 壊れ 2/68 (journal から復元) → **以後の抄写は Sonnet 5 既定** (`evidence/quiz_sonnet_ab_S120.md`)。⑨: merge-parts `--journal` 復元 / prompt に evidence 参照禁止 |
| **U0 脚本改修** | — | **完了 (S119、Rule D PASS 3 往復)**: return 縮約 (agents が part file を Write → `quiz-fidelity-merge-parts.mjs` で束ねる、workflow に fs 無しのため) / `--precrop` (chumon ∪ merged_preamble 164 題は除外、2015h27a 90/100) / machdiff VERDICT_CONFLICT / prompt 4 条追記。**U1 初回 run で part 書き出し成功率と crop 優先読みを実証すること** |
| **U2 波 1〜3 Rule D** | 2015h27a / 2016h28a / 2016h28h / 2017h29a / 2017h29h / 2018h30a | **完了 (S121)**: reviewer 3 体 (別 type、opus) 直列、462 問 / 是正 41 題 (波 2 は 16 に訂正) を**全題原寸独立実読**、MAJOR 0 / 誤是正 0 / correct_answer 変更 0。指摘 = evidence 計数 MINOR 11 + ⑨ 級 NIT 15、データ修正 0。⑨ 脚本改修 2 件 (merge-parts `--journal` / prompt 0b 隔離) も同 unit で実装 + 審査済。`evidence/quiz_full52_ruleD_U2_S121.md` |
| 波 4 (途中停止) | 2018h30h (gp 14/70, cr 12/70) / 2019h31h (gp 14/87, cr 13/87) | run id は S118 log §42、resume 可 |
| 未着手 | 2019r01a 59 / 2020r02o 73 / 2021r03 64 / 2022r04 78 / 2023r05 79 / 2024r06 58 / 2025r07 76 / 2026r08 66 (母数 = `full52_population_S118.json`) | — |

## 1. 実測に基づく予算の目安 (S118)

| 項目 | 実測 | 備考 |
|---|---|---|
| 核験 agent (Opus、gp) 1 問 | ≈ 5.5 万 token | 大半は画像 Read (5〜10 回/問) |
| 1 exam 1 pass (70〜90 問、Opus) | 370 万〜530 万 token | 6〜17 分 |
| fixer (Opus、1 波 2 exam) | 数百万 | 三層是正 + zh/en + 解説書換 |
| reviewer (Opus、1 波) | 数百万 | 源実読 8〜9 題含む |
| 5h 制限到達 | 1 波 (4 run ≈ 300 agent) で到達 | 3 回/日 |

**予算の運用**: unit の申告値は上表から算出。ユーザーが「少ない」と判断すれば次 unit を 2〜3 exam に、「多い」なら半 exam に調整。

## 2. Unit 一覧 (順序固定、各 unit 完了 = commit + push + STATE 更新 + 新セッション)

### U0 — 脚本改修 (agent 1 体、executor opus、≈ 100〜200 万 token、30 分)
1. `scripts/quiz-s7x-fidelity.workflow.mjs`: return を `{exam_id, n, cleanCount, discrepantCount, bySeverity, onCorrectChoiceCount, discrepancies[]}` に限定、`audits[]` 全文は `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_<exam>_<pass>.json` へ workflow 内で直接書く (主 context に流さない)。`model` を args で切替可能に (`model: args.model ?? 'opus'`)。
2. 題目領域の前裁断: `quiz-fidelity-prep-any.mjs` に `--precrop` を追加。`source.question_bbox_pct` がある題はそれで、無い題は同ページ内の 問N 見出し行を検出して次の見出しまでを帯で切り出し (sharp)、manifest に `question_crop_png` を持たせる。agent prompt は「まず `question_crop_png` を Read、判読不能時のみ源ページ」に変更 → 画像 Read を 1〜2 回/問へ。
3. machdiff に「verdict CLEAN かつ discrepancies 非空」警告 (S118 §44 の q079 型) を追加。prompt に「`source_text` に注記を書かない」「区切り記号脱落・引用符字種置換・源に無い記号の挿入も計上」を追記。
4. 検証: 既存 run 結果 (波 1) で return 縮約が壊れないこと、precrop を 2015h27a 5 題で目視。Rule D: reviewer 1 体 (opus、別 type)。
- 停止条件: 改修が波 1〜3 の再現性 (machdiff 残差) を変えたら差し戻し。

### U1 — Sonnet 5 A/B (agent 68 体 Sonnet + 裁決 Opus ≤ 15 体、≈ Sonnet 400 万 + Opus 100 万、20 分)
- 対象 2015h27a 68 問 (Opus 双 pass 済、確認済欠陥 **8 問 / 12 差分** = 基準。S120 訂正: 旧記載「13 題」は波 1 全体 2015h27a 8 + 2016h28a 5 の数)。Sonnet 単 pass (U0 の precrop 版) → machdiff → Opus が DISCREPANT 題だけ severity 裁決。
- 判定指標: **問召回 ≥ 7/8 かつ差分召回 ≥ 11/12 かつ agent 偽陽性 ≤ 2 (Opus 双 pass = q009)** → 以後の抄写は Sonnet。**S120 結果: 12/12・8/8・FP 0 → PASS、Sonnet 既定**。未達なら Opus 継続 (precrop で画像 Read は削減済)。
- 産物: `evidence/quiz_sonnet_ab_S119.md` (召回 / FP / token 実測 / 見逃した欠陥の型)。
- 停止条件: Sonnet の UNREADABLE > 5% なら中止して報告。

### U2 — 波 1〜3 の Rule D 審閲 (reviewer 3 体 opus 直列、≈ 各 300 万、45 分) → push
- **S121 完了**: 3 波とも PASS-with-notes → 処置済。実消費 ≈ reviewer 3 体 + fixer 0 (MAJOR 0 のため未起動)、約 40 分。
- 各波 1 reviewer (fixer と別 type: `pr-review-toolkit:code-reviewer` / `oh-my-claudecode:code-reviewer` / `feature-dev:code-reviewer`、いずれも `model: opus`)。指摘 → fixer (同 wave の script を延長) → 復験。
- 完了で **push** (ユーザー gate)。

### U3 — 波 4 resume (2 unit に分割可: U3a 2018h30h 70 問 / U3b 2019h31h 87 問)
- **抄写 = Sonnet 5 単 pass** (U1 PASS)。既存 Opus 完了分 (14+12 / 14+13) は別モデル・別 prompt のため resume 再利用不可 → Sonnet で全量新規 run (U1 実測 ≈ 6 万 token/問 → 70 問 ≈ 420 万、87 問 ≈ 520 万)。
- 手順: 核験 → machdiff → fixer (opus) → reviewer (opus、別 type) → gate → commit + push。

### U4〜U11 — 残 8 exam (1 exam / unit、順序 2019r01a → 2020r02o → 2021r03 → 2022r04 → 2023r05 → 2024r06 → 2025r07 → 2026r08)
- 各 unit の申告テンプレ: 「<exam> <n> 問、抄写 <model> <n> 体 (≈ X 万)、fixer opus 1 (≈ Y 万)、reviewer opus 1 (≈ Z 万)、合計 ≈ W 万、予想 T 分。停止条件: limit 到達 / UNREADABLE > 5% / machdiff 残差 > 3」。
- ユーザーの調整で 2〜3 exam/unit へ拡張可 (その場合も run は直列)。

### U12 — 収尾
- ⑤-2 総括 evidence (`evidence/quiz_full52_summary.md`: 16 exam の率・正解肢命中・answer_affecting・machdiff 補捉率・モデル別コスト)、⑨ 残の整理、RETROSPECTIVE への追記 (Rule C)。

## 3. 各 unit 共通手順 (チェックリスト)
1. STATE.md「次セッション」と本 PLAN §0 を読む → 対象 unit を確認。
2. **起動前申告** (agent 数 / 予想 token / 時間 / 停止条件) → ユーザー承認。
3. 実行は直列: run → **`merge_cmd` (return に同梱、0 token) で part を束ねる** → machdiff → fixer → reviewer → 復験。prep は `--precrop` 付きで生成 (crop 無し題は従来どおり源ページ読み)。
4. ゲート: `quiz-keys-crosscheck` full / `derive-groups --assert-clean` / `chumon-groups-build --check` / vitest / tsc (build は unit 末尾のみ)。
5. 記録: session log (append) / evidence / failures (Rule B、limit 停止も含む) / §0 の表を更新 / STATE.md 同期。
6. commit + **push** (ユーザー gate) → セッション終了。

## 4. 停止・再開の規則
- limit 到達: run id・完了/母数・再開方法を log に記録し、その unit は次セッションで resume。
- 主 context が 70% を超えたら新規起動をやめて収尾 (commit) に入る。
- 起動後にユーザーが「停止」と言えば TaskStop、状態を §0 と log に記録。
