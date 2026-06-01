# Stage 3.5 — Stage 3 後置クリーン 実施証拠 (D-127, Session 77)

> G4 前置の任意品質クリーン（ユーザー選択）。3.5b 語彙核心語補完 + 3.5a low-conf 跨段高精度重判。
> invariants（correct_answer/answer_keys/stem/choices/figure/group/source）不変。Rule A/B/D 適用。

## 3.5b 語彙ギャップ核心語補完

19 unknown 語を甄别（節点 term 突合）→ **核心考点語4のみ** knowledge_tree.json へ補完（ユーザー確認: 確補3 + 組込みシステム、仮想サーバ等は不補）。

| 用語 | 追加先 topic | 節点名 |
|------|------|--------|
| サービスデスク | management-11-29 | サービスマネジメントシステム |
| セキュリティパッチ | technology-23-63 | 情報セキュリティ対策・情報セキュリティ実装技術 |
| アジャイル | management-09-26 | 開発プロセス・手法 |
| 組込みシステム | strategy-05-17 | IoTシステム・組込みシステム |

- 手法: 文字列級精確挿入（`scripts/stage035-add-terms.mjs`）。knowledge_tree は自定義折行フォーマット（1行複数語）のため JSON.stringify 全書換は巨大 diff を生む → round-trip 検証で検知し中止 → 文字列挿入に切替。
- backup: `knowledge_tree.json.pre-s035`。diff = 4 節点各 +1 語のみ（8 行差分、フォーマット破壊ゼロ、backup 比較で確認）。
- topics 63 不変。term 総出現数 1,413→**1,417**（unique 1,391→1,395）。
- index 再構築: `_mapping_index.json` terms 1,417、4 新語の混入確認済、sanity OK。

### ⚠ term 計数の账实訂正（Rule B: 誤判定を保持・訂正）
勘查時に「実測1391 vs 記録1413 で差22 の账实不符」と**誤判定**。原因 = 当方が `Set` 去重で数えたため。正: **1,413 = term 総出現数（記録通り正）/ 1,391 = unique / 22 = 同一術語が複数小分類に属す正常な重複実例**。账实不符は存在しない。

## 3.5a low-conf 跨段高精度重判

59 題（confidence=low, 2.0%）を Opus + 題目/figure_description/index で独立再判定。

- workflow: `wf_6fb3a415-d12`、10 batch × `scientist`（Opus、A=general-purpose/B=explore/tiebreak=analyst/RuleA=code-reviewer と相異 → Rule D 充足）。10 agents / 948K tok / 169s。**59/59 完了、欠落 0**。
- 結果（vs current）:
  - **primary: confirmed 53 / changed 6**
  - **confidence: ↑upgraded 42 / =same 17 / ↓downgraded 0**
  - **重判後仍 low: 17 題**（59 → 17、42 題が low から脱出）
- 全局 sanity（backup 比較）: 2,900 題不変 / syllabus_refs 変化 = **59**（精確）/ **他フィールド変化 0**（副作用なし、invariant 全局確認）。
- 全局 confidence: high 2,280→**2,292** / medium 561→**591** / low 59→**17**。
- 全局 mapping_status: agree 2,730 / reconciled 111 / **rejudged 59**。
- apply: `scripts/stage035-apply-rejudge.mjs`（backup `question_bank.json.pre-s035`、非法 topic id 検出、invariant 検証、by_year 24 ファイル同期、2空格フォーマット）。

### primary 改判 6 件（Rule A 必査対象）
| id | old primary | new primary |
|----|------|------|
| 2013h25h-q077 | technology-14-38 | technology-22-60 |
| 2013h25h-q088 | technology-17-46 | strategy-06-19 |
| 2015h27h-q011 | strategy-01-02 | strategy-05-15 |
| 2017h29a-q058 | technology-17-47 | technology-19-51 |
| 2020r02o-q043 | strategy-05-14 | strategy-01-02 |
| 2023r05-q096 | technology-15-40 | technology-13-35 |

### 副次的発見（記録のみ、非ブロック）
- 2011h23tokubetsu-q099: choices_jp に OCR で別問題の選択肢混入の疑い（重判 agent 指摘）。stem/figure は明確で判定に支障なし。Stage 2.7 残留の可能性、G4 前に per-question 確認候補。

## Rule A 独立監査（N=20: 16 重判 + 4 補词）

> workflow: `wf_49b71ac7-9a5`、`code-reviewer`（Rule D）。様本 = changed6 + upgraded_high5 + still_low5 + 補词4。詳細: `evidence/phase5/stage_035_audit.md`。

- **重判 16: correct 6 / acceptable 9 / wrong 1**（妥当率 15/16）。
  - **6 改判すべて独立審計が是認**（old→new の是正妥当）。誤った改判 0。
  - wrong = q065（primary 3:1 争議: 双盲A/B+重判 が strategy-01-03、審計のみ 01-02）→ 多数維持、審計意見は secondary に既存、low、terms 清洗で空。G4 注意清单。
- **補词 4: 審計は duplicate で 4/4 wrong 判定 → backup 対比で誤判と証伪**（4 語は補词前全樹 0 件、真の新規。審計が補词後 index を読み既存重複と誤認）。**補词は全件正しい**。
- **系統的発見: terms 造語（17 重判題）**→ apply が Stage 3 の unknown_terms 過濾を省いた欠陥（`failures/stage_035_apply_terms_gap.md`, Rule B）。
  - 清洗（`scripts/stage035-clean-terms.mjs`）: rejudged 題 terms を樹内語のみに。17 題清洗 / 8 題空 / **清洗後 全2900題 樹外 term 残存 0** / invariant 不変。
  - terms 空題 全44（Stage 3 既存36 + 清洗新8）= Stage 3 来の正常現象。

## 仍 low 17 題（G4 注意清单）
2009h21a-q092 2009h21h-q099 2009h21h-q100 2011h23a-q093 2012h24a-q065 2012h24h-q086 2013h25a-q098 2013h25h-q088 2015h27a-q097 2015h27h-q011 2016h28a-q086 2017h29a-q058 2018h30h-q085 2019h31h-q008 2019h31h-q066 2019r01a-q099 2024r06-q013

（真に複数小分類に跨る曖昧題。G4 ユニット生成時に複数 topic で参照されうる。primary は妥当性確認済。）
