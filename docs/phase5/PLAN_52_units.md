# PLAN — ⑤-2 全量保真掃引の分批実行計画 (D-146 準拠)

> 作成: Session 118 (2026-09-08)。真相源は `docs/STATE.md`、本 PLAN は ⑤-2 残作業の**単位 (unit) 定義・予算・手順・停止条件**を固定する。
> 1 セッション = 1 unit。unit 開始前に主 context が「agent 数 / 予想 token / 予想時間 / 停止条件」を申告し、ユーザー承認で放つ。叠加禁止 (直列)。

## 0. 現在地 (2026-09-25、S125 U8 完了)

| 区分 | exam | 状態 |
|---|---|---|
| **U1 Sonnet A/B** | 2015h27a | **完了 (S120)**: Sonnet 単 pass 召回 12/12 差分・8/8 問、偽陽性 0、machdiff 残差 1 (q066 既知仕様)、4.03M token / 15 分、画像 Read 2.3 回/問、part 壊れ 2/68 (journal から復元) → **以後の抄写は Sonnet 5 既定** (`evidence/quiz_sonnet_ab_S120.md`)。⑨: merge-parts `--journal` 復元 / prompt に evidence 参照禁止 |
| **U0 脚本改修** | — | **完了 (S119、Rule D PASS 3 往復)**: return 縮約 (agents が part file を Write → `quiz-fidelity-merge-parts.mjs` で束ねる、workflow に fs 無しのため) / `--precrop` (chumon ∪ merged_preamble 164 題は除外、2015h27a 90/100) / machdiff VERDICT_CONFLICT / prompt 4 条追記。**U1 初回 run で part 書き出し成功率と crop 優先読みを実証すること** |
| **U2 波 1〜3 Rule D** | 2015h27a / 2016h28a / 2016h28h / 2017h29a / 2017h29h / 2018h30a | **完了 (S121)**: reviewer 3 体 (別 type、opus) 直列、462 問 / 是正 41 題 (波 2 は 16 に訂正) を**全題原寸独立実読**、MAJOR 0 / 誤是正 0 / correct_answer 変更 0。指摘 = evidence 計数 MINOR 11 + ⑨ 級 NIT 15、データ修正 0。⑨ 脚本改修 2 件 (merge-parts `--journal` / prompt 0b 隔離) も同 unit で実装 + 審査済。`evidence/quiz_full52_ruleD_U2_S121.md` |
| **U3a Sonnet 単 pass** | 2018h30h | **完了 (S122、Rule D PASS-with-notes)**: run `wf_fb2409c7-386` 70/70、4.25M token / 26 分、UNREADABLE 0、DISCREPANT 8 / 差分 13 / 正解肢上 2、machdiff 実残差 0 (偽陽性 5)。是正 8 題 88 field (q005 = D-144 段 2 choice_figures 化、正解肢「DFD」が答えを書いていた型)、correct_answer 0。MAJOR 0 / MINOR 2 / NIT 3 全処置。`evidence/quiz_full52_u3a_S122.md` |
| **U3b Sonnet 単 pass** | 2019h31h | **完了 (S123、Rule D PASS-with-notes)**: run `wf_f840c3f7-511` 87/87、5.17M token / 16 分、UNREADABLE 0、DISCREPANT 10 / 差分 18 / 正解肢上 1、machdiff 実残差 1 (q001「問1 」混入) + 偽陽性 17。是正 9 題 / 17 差分 / 65 field (q015 少量→大量 semantic、q062「①〜③」復元 + D-147 初適用)、**D-147 lock + 23 問 294 field 正規化**、correct_answer 0。MAJOR 0 / MINOR 3 / NIT 3 全処置。⑨ precrop 較正をページ投票に修正 (2019h31h 0→83/87、回帰 md5 同一)。`evidence/quiz_full52_u3b_S123.md` |
| **U4 Sonnet 単 pass** | 2019r01a | **完了 (S124、Rule D PASS-with-notes)**: 母数 **52 問** (旧記載 59 は算術誤り、population 真相)。run `wf_80761953-9cb` 52/52、3.12M token / 8.8 分、UNREADABLE 0、DISCREPANT 4 / 差分 4 / 正解肢上 1、**machdiff 実残差 0 / 偽陽性 0**。是正 4 題 14 field (q016/q036/q041 読点脱落、q097 減失→滅失 semantic)、correct_answer 0。MAJOR 0 / MINOR 4 / NIT 5 全処置。U4 前に **D-147 §6** (解説層 23 問 → 18 問 / 106 field、attempt 1 FAIL → 節境界ガードで attempt 2 PASS-with-notes、Rule B 記録)。`evidence/quiz_full52_u4_S124.md` / `evidence/quiz_marunum_expl_D147_S124.md` |
| **U5 Sonnet 単 pass** | 2020r02o | **完了 (S125、Rule D PASS-with-notes)**: 母数 **60 問** (旧記載 73 は誤り、population 真相)。run `wf_4c528418-96c` 60/60、3.88M token / 9.3 分、UNREADABLE 0、DISCREPANT 15 / 差分 24 / 正解肢上 4、machdiff MISSED 7 = 偽陽性 7 (q001 表型 4 / q011 DFD 図文章化 3)、実残差 0。是正 15 題 24 差分 127 field (q004 過去19年→10年 ×2・q075 斜線入りゼロ誤読 = semantic 数字、q026 防災品→防炎品、q100 ア 相手方→相手 [正解肢] / イ 読み見→盗み見 ほか)、correct_answer 0。MAJOR 0 / MINOR 0 / NIT 3 全処置。evidence `quiz_full52_u5_S125.md` |
| **U6 Sonnet 単 pass** | 2021r03 | **完了 (S125、Rule D PASS-with-notes)**: 88 問、run `wf_180a2db0-a1b` 88/88、5.57M token / 11.9 分、UNREADABLE 1 (q053 = page 記録ずれ、page-25 実読で CLEAN)、DISCREPANT 11 / 差分 14 + machdiff 実残差 2 (q070 読点 / q100「問100」) = 採用 16 / 13 題、正解肢上 2、correct_answer 0。**page 記録ずれ 2 件 (q051 23→24 / q053 24→25) を D-145 pagefix-apply (MOVE_QUESTION) で是正**。MAJOR 0 / MINOR 0 / NIT 4 全処置。evidence `quiz_full52_u6_S125.md` |
| **U7 Sonnet 単 pass** | 2022r04 | **完了 (S125、Rule D PASS-with-notes)**: 75 問、run `wf_9220b31c-fa2` 75/75、4.94M token / 13.4 分、UNREADABLE 0、precrop 46/75 (頁パリティ)。採用 36 差分 / 19 題 (agent 32 + machdiff 実残差 4)、正解肢上 9、**aa 3 = q032 選択肢が図 → D-144 段 2 choice_figures 化** (U3a q005 同型)、q066 斜線ゼロ 109/199/190→100 (解説論拠書換)、q073 TIPv*→IPv*、correct_answer 0。MAJOR 0 / MINOR 0 / NIT 4 全処置。evidence `quiz_full52_u7_S125.md` |
| **U8 Sonnet 単 pass** | 2023r05 | **完了 (S125、Rule D PASS-with-notes)**: 91 問、run `wf_b22ad070-03c` 91/91、5.93M token / 13.7 分、UNREADABLE 0、採用 20 差分 / 16 題、正解肢上 4、machdiff 実残差 0 (偽陽性 3)。**q011 clean「変革」→ 源「刷新」(raw 脱字を clean が推測補完)**、q025 19万円→10万円 (斜線ゼロ 4 exam 連続)、correct_answer 0。MAJOR 0 / MINOR 0 / NIT 5 全処置。evidence `quiz_full52_u8_S125.md` |
| 次 (U9) | 2024r06 **72 問** (precrop 68/72、S125 内で続行) | Sonnet 単 pass (≈ 470 万) |
| 未着手 | 2025r07 80 / 2026r08 71 (**S125 で population 実数に訂正** — 旧記載 64/78/79/58/76/66 はいずれも誤り、2021r03 旧 64 → 88) | — |

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
