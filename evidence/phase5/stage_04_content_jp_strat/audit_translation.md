# Stage 4 Phase B — 第三批 (strategy) 翻訳 Rule A 忠実度抽检

> 対象: strategy 95 unit (merge 後三語)。最終批。
> 監査者: oh-my-claudecode:critic / opus（writer=general-purpose・reviewer=code-reviewer と別の第3 subagent_type、Rule D 三役分離）。
> workflow: `wf_44a4e0d6-8fc`（`stage4-phaseB-ruleA-translation.workflow.mjs`）。
> 注: 初回 `wf_65e0df77-620` は agent 名 `critic`（裸名）が当 session の registry に不在で全 fail → `oh-my-claudecode:critic` に修正し再実行（Rule D 三役分離は不変、critic は依然独立役）。

## サンプリング (N=18)

日語修正 term 5件を強制必含（修正が忠実に翻訳されたか検証）+ 本土术语 unit（交付物使用: BCP/MOT）+ 23 topic 横断代表 term。一覧: `data/ip/textbook/.planning/_ruleA_tr_strat.json`。

| # | unit | term | 選定理由 |
|---|------|------|---------|
| 1 | strategy-01-03-u04 | 固定資産 | 会計 high-fix + 完備性 fix（投資その他の資産/繰延資産独立） |
| 2 | strategy-01-01-u06 | DE&I | 大節点 01-01 + need-based fix |
| 3 | strategy-01-02-u12 | BI | 大節点 01-02 + 役割表現 fix |
| 4 | strategy-05-14-u09 | ディープフェイク | 大節点 05-14 + 分離 fix |
| 5 | strategy-06-21-u01 | デジタルリテラシー | 多要因 fix |
| 6 | strategy-01-01-u04 | BCP | 本土术语（成果物→交付物） |
| 7 | strategy-02-06-u02 | 雇用契約 | 法務（労働法） |
| 8 | strategy-04-13-u01 | MOT | 本土术语（交付物）+ 技術戦略 |
| 9 | strategy-02-05-u01 | 匿名加工情報 | 法務（個人情報保護法、誤訳リスク高） |
| 10 | strategy-02-07-u01 | コンプライアンス | 法務 |
| 11 | strategy-03-09-u01 | PPM | 経営戦略（BCG 4象限、軸/資金フロー誤り検査） |
| 12 | strategy-03-10-u01 | 顧客満足 | マーケティング |
| 13 | strategy-05-15-u01 | センシング技術 | 産業（技術用語） |
| 14 | strategy-05-16-u01 | EC | 産業（BtoB/BtoC/CtoC） |
| 15 | strategy-05-17-u01 | IoT | 産業（技術中核） |
| 16 | strategy-06-19-u01 | BPMN | システム戦略（記法） |
| 17 | strategy-07-22-u01 | 企画プロセス | システム企画 |
| 18 | strategy-07-24-u01 | RFP | システム企画（本土术语 交付物隣接） |

## 結果

| 指標 | 値 |
|------|-----|
| N | 18 |
| faithful | **18/18 (100%)** |
| severity | none 13 / low 5 / **medium 0 / high 0** |
| flagged (faithful=false or medium/high) | **空** |
| terminology_natural=false | 1 (センシング技術、faithful=true) |
| agent / token / 時間 | 18 / 0.96M / ~3.8分 |

mgmt 第一批 (N=12, 100%)・tech 第二批 (N=20, 100%) と同等。**誤訳・意味逆転・重大欠落/追加 0**。

## 日語修正 term の翻訳忠実度（独立確認 = 写審分離の最終段）

| term | severity | 修正の翻訳反映 |
|------|----------|---------------|
| 固定資産 | none | zh『递延资产并不属于固定资产的下属项目，而是…独立的第三类分类』/ en『deferred assets are not a subdivision…independent third category』+ 投資その他の資産（投资及其他资产）完全保持 |
| DE&I | none | Equity を「平等(equality)」でなく「公平(与之相符的公平机会)」と訳し分け（IPA 頻出トラップ正処理） |
| BI | low | 役割表現 fix（上位概念→側の考え方=职能不同）忠実、low は analogy「献立表→菜单表」自然さのみ |
| ディープフェイク | none | 意図的生成と悪用の分離 忠実 |
| デジタルリテラシー | low | 多要因括弧補足『(設備・回線…所得・地域・年齢の差からも)』完全保持、low は「使いこなす」語感のみ |

## low 5 件（自然さ/ニュアンス、事実誤りなし — 翻訳ゲートで採否）

1. **BI (01-02-u12)**: analogy「献立表」→ zh「菜单表」。比喩は成立、厳密には「食材の使い道の整理表」ニュアンスが薄れる。任意。
2. **デジタルリテラシー (06-21-u01)**: zh「灵活运用」が「使いこなす(習熟)」よりやや柔軟寄り。意味保持。任意。
3. **雇用契約 (02-06-u02)**: zh「使用者」採用（本土労働法は「用人单位/雇主」が一般的）。日本法当事者概念として一貫 + explanation で「使用者（公司）」補足のため誤解なし。任意。
4. **センシング技術 (05-15-u01)** ← 唯一 terminology_natural=false: zh「计测」が日本語漢語直輸入。本土標準は「测量/检测」。意味は通じる(faithful)。**推奨修正**（definition/explanation/memory_hook の「计测」→「测量」、en は measure で正確・不変）。
5. **企画プロセス (07-22-u01)**: zh「进行方式」がやや硬い直訳。「推进方式」がより自然。任意。

## 源文側の観察（翻訳対象外、awareness のみ）

- **EC (05-16-u01)**: analogy_jp「店舗が会社相手か個人相手かで BtoB・BtoC・CtoC と呼び分け」は CtoC(消費者間取引)を「店舗の取引相手」で説明しており概念上やや不正確。**これは日語原文側の問題で、zh/en は原文を忠実再現**（翻訳欠陥ではない、auditor 判定 ACCEPT）。原稿修正で対応すべき低優先事項。

## 構造検査（確定的、merge 後）

`trilingual_structural_check.json`: 95 unit / 557 term / **空字段 0 / 和製形(成果物・有效性确认)残留 0 / 図 161/161 / problems 0**。lang_status 三語 generated、schema=stage4-unit-v1-trilingual。

## 三語ゲート修正適用（ユーザー承認 2026-06-08）

判定 = **承認 + (1) センシング技術 计测→测量 + (2) EC 源文是正・重訳**。

### (1) センシング技術 (05-15-u01) zh 计测→测量（確定的・本土化）
- `stage4-phaseB-strat-tr-fixes.mjs`: term zh 字段 3 箇所 计测→测量。→ re-merge。
- **summary 同期漏れ 捕捉（構造検査）**: term だけ修正し `summary.key_points_zh[2]`・`memory_hooks_zh[2]` の 计测 が残存 → 構造検査が「计测 x2」検出 → translation源 summary も全置換 → re-merge。**= Session 82 の summary 同期教訓が再発、構造検査が網兜**。最終 计测残留 0。

### (2) EC (05-16-u01) 源文是正 + 重訳（ユーザー「現在修日语原文+重译该unit」）
- **源文是正**: analogy_jp の CtoC を当事者ベースに（`stage4-phaseB-strat-tr-fixes.mjs`、content源）: 「店舗が会社相手か個人相手か」→「取引の当事者が会社どうしなら BtoB、会社と個人(消費者)なら BtoC、個人どうしなら CtoC」。
- **重訳**: re-assemble(明示args, jp-only化) + re-render(2/2) + `translate.workflow`(wf_c9a34565-308, translator=general-purpose ≠ reviewer=oh-my-claudecode:code-reviewer, Rule D) → **verdict PASS**。explanation/他5 term は忠実な再訳。
- **⚠ Rule D 漏判 → 補修**: workflow reviewer は PASS としたが、**EC analogy の zh/en だけ旧框架(二元「店舗が会社相手か個人相手か」)に塌缩**し新 jp の三者区分を反映せず（explanation 正確に引きずられた漏判）。主エージェントの spot-read で検出。→ `stage4-phaseB-strat-ec-analogy-fix.mjs` で analogy zh/en を三者区分に確定的是正 → re-merge。
- **独立 critic 再核験**（写審分離）: `ruleA-translation`(wf_5e0a8fb8-c57, oh-my-claudecode:critic/opus) で EC を再監査 → **faithful 1/1 (100%)、severity none、flagged 空**。「当事者別の呼び分けが正確」「CtoC 具体例(二手交易App/网络拍卖)保持」を独立確認。

### 教訓（全量 fix チェックリストへ）
1. **源文是正後の重訳は、是正した当該フィールドの忠実度を明示再確認**（汎用 reviewer は不変・正確なフィールドに anchor し、是正対象の塌缩を見逃しうる）。
2. **l10n/term 修正は summary.key_points / memory_hooks へも同期必須**（Session 82 教訓再発、構造検査が検出）。

### agentType 環境整合（本 session）
- 裸名 `critic`/`code-reviewer` が当 session registry で未解決 → workflow を `oh-my-claudecode:critic` / `oh-my-claudecode:code-reviewer` に修正（`ruleA-translation` / `translate` workflow）。Rule D 三役分離は不変。

## 最終構造検査（全 fix 後）

`trilingual_structural_check.json`: 95 unit / 557 term / jp_pending 0 / **空 0 / 计测・和製形残留 0 / 図 161/161 / problems 0**。
全量 **244/244 三語完成**（management 23 + strategy 98 + technology 123）。

## 証拠

- 集計: 本ファイル + workflow result（`wf_44a4e0d6-8fc` 翻訳 Rule A / `wf_c9a34565-308` EC 重訳 / `wf_5e0a8fb8-c57` EC critic 再核）。
- サンプル: `sample_trilingual.md`（固定資産 fix の三語忠実反映を含む）。
- 構造: `trilingual_structural_check.json`。
- サンプル ID: `data/ip/textbook/.planning/_ruleA_tr_strat.json`。
- 修正スクリプト: `stage4-phaseB-strat-tr-fixes.mjs` / `stage4-phaseB-strat-ec-analogy-fix.mjs`。
