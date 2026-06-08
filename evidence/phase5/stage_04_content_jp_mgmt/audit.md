# Rule A 意味抽检 — 第一批 management 日語正文 (18 unit)

> workflow: `stage4-phaseB-ruleA-audit.workflow.mjs` (wf_b1418fe2-021)
> 監査者: critic/opus (writer=general-purpose・reviewer=code-reviewer と別 subagent_type、Rule D 三役分離)
> N=18 (各 unit から最も claim 密度の高い term 1つ=最長 explanation を抽出、全 7 topic 覆盖)
> 日付: 2026-06-03

## 結果サマリ

| 指標 | 値 |
|------|----|
| N | 18 |
| **accurate (事実正確)** | **18/18 (100%)** |
| severity none | 11 |
| severity low | 6 |
| severity medium | 1 |
| severity high | **0** |
| 明白な事実誤り (high) | **0** |

**結論**: 全 18 サンプルで `accurate=true`、high・事実誤り 0。1 medium + 6 low はいずれも「事実は正しいが完備性・表現の改善余地」レベル。

## medium 1件 (要修正候補 — 図の完備性)

### `management-08-25-u01` 品質特性 (図の網羅性)
- **指摘**: 解説本文は品質特性を「機能適合性・性能効率性・使用性・信頼性・セキュリティ・保守性・移植性 **など**」と非網羅で正しく記述。しかし **Mermaid 図はこの7つを「など」表記なしの閉じた分類木として提示** → JIS X 25010 の製品品質特性は **8つ (互換性/Compatibility が欠)**。本文は妥当だが図が「7つで全て」と誤認させうる。
- **accurate=true** (本文に事実誤りなし、図の完備性のみ)。
- **suggested_fix**: 図に「互換性」ノードを追加し8特性に揃える (機能適合性・性能効率性・**互換性**・使用性・信頼性・セキュリティ・保守性・移植性)。または図ラベルに「主な品質特性(一部)」注記。本文の列挙にも「互換性」を1語加えると更に正確。

## low 6件 (表現・完備性の任意改善、翻訳前に採否)

| unit | term | 指摘要旨 | 推奨 |
|------|------|---------|------|
| 08-25-u01 | 品質特性 | 「品質特性=非機能要件の体系化」の断定がやや不正確 (機能適合性は機能側にも関わる) | 表現緩和 (任意) |
| 08-25-u02 | 共同レビュー | 「コードレビュー=下位の具体例 / 共同レビュー=上位概念」の階層断定が JIS X 0160 と齟齬。コードレビューは必ずしも共同で行うとは限らない | 並列的説明に緩和 |
| 08-25-u04 | 妥当性確認テスト | 「作るべきものは正しかったか」が「要求自体が正しいか」とも読める表現揺れ (定義・フックは正確) | 「求められた物を作れたか」に統一 (任意) |
| 09-26-u03 | XP | 4価値 (コミュニケーション/シンプルさ/フィードバック/勇気) は初版定義で正しい。第2版で「尊重」追加=5価値の補足余地 (IPA 水準は4で十分) | 任意補足 |
| 09-26-u05 | レトロスペクティブ | 定義「正式名称」が語感やや強い (公式イベント名は正確には「スプリントレトロスペクティブ」。直後に正しく補足済) | 「英語呼称/公式イベント名」に明示 (任意) |
| 11-30-u01 | グリーンIT | 記憶フックが Green of IT / Green by IT の二面性のうち後者寄りに読める (本文は両面正しく記述) | フック両面化 (任意) |
| 12-31-u01 | システム監査 | 記憶フックが「独立評価」のみで「改善の助言」機能を省略 (定義・解説には有り) | フックに助言追加 (任意) |

(low は計6件。08-25-u01 は medium と同 unit で完備性 low も併記。)

## 判定

- **事実正確性 = 100% (high・誤り 0)** → 日語ゲートに進める品質。
- **medium 1件 (品質特性の図)** は実質的な完備性課題のため、**翻訳前に図を8特性へ修正することを推奨** (図の Mermaid に「互換性」追加、本文列挙にも1語追加)。
- **low 6件** はいずれも事実誤りでなく表現/完備性の磨き。pilot 同様、**翻訳前に採否を判断** (採用分は日語確定→翻訳が反映)。

> 修正は writer 役 (general-purpose) が行い、reviewer/critic が再核験する (Rule D 写審分離)。本 audit は critic の独立判定であり、修正適用は別 pass。

---

## 修正適用 (2026-06-04, 日語ゲート承認後)

ユーザー日語ゲート判定 = **承認 + medium&6 low 修正 → 翻訳**。確定的修正スクリプト `scripts/stage4-phaseB-mgmt-fixes.mjs` で content を source-of-truth に適用 (明示 before/after、Rule B 归档、冪等)。

### 第1ラウンド (10 置換)
- medium 1 (品質特性 図8特性化: Mermaid に「互換性」追加 + 本文列挙+JIS X 25010 注 + key_point) + low 6 (共同レビュー階層断定緩和 / 妥当性確認言回し / XP 4→5価値補足 / レトロ正式名称→公式イベント / グリーンIT フック両面化 / システム監査 フック助言追加)。
- 適用 10/10、failed 0。re-assemble 7 unit + re-render (10/10 SVG)。品質特性 SVG に「互換性」含有を確認。

### Rule D 再核験 (code-reviewer/opus, ≠ writer) → **CONCERNS** (2件の同期漏れ検出)
独立 reviewer が、本文 (explanation/figure) は正しく直っているのに **summary.key_points_jp の同期漏れ**を2件検出:
- **u01 key_points_jp[1]**: 「(JIS X 25010 では8特性)」と宣言しつつ「セキュリティ」を落とし7列挙 (introduced_new_problem)。
- **u02 key_points_jp[2]**: explanation は並列化したが key_point に「共同レビュー=上位概念」断定が残存 (fix 未完)。
- 他5 unit (妥当性確認/XP/レトロ/グリーンIT/システム監査) は fix 正・退行0。JIS X 25010 8特性・XP史実・スクラム5イベント・validation/verification 対比の事実確認も全て正確。

### 第2ラウンド (Rule D 指摘の同期漏れ 2件修正)
- u01 key_points[1] にセキュリティ追記 → 8特性整合 (8/8 確認)。u02 key_points[2] を並列表現に。適用 2/2、prior 10 は冪等 skip。re-assemble + re-render u01/u02 (3 SVG)。
- **Rule D 再々核験** (同 reviewer 継続、≠ writer): **PASS** — 2件とも解消、図/explanation/key_points が完全整合 (u01 8特性 3者一致)、退行・新規矛盾ゼロ。7 unit 全て fix_resolves_issue=true / introduced_new_problem=false。

> **教訓 (Rule D 価値の実証)**: 修正は explanation/figure に適用したが、並列の summary.key_points_jp 同期を writer (main) が見落とした。独立 reviewer がこの「本文○・要約×」の同型ミスを2件捕捉。確定的検証 (terms/figs) では拾えない意味整合の漏れ — 写審分離が機能した実例。全量バッチでも summary 同期を fix 適用時の必須チェックに。
