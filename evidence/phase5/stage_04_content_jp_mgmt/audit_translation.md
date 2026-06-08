# Rule A 翻訳忠実度抽检 — 第一批 management zh/en (18 unit)

> workflow: `stage4-phaseB-ruleA-translation.workflow.mjs` (wf_c7c00252-505)
> 監査者: critic/opus (translator=general-purpose・reviewer=code-reviewer と別 subagent_type、Rule D 三役分離)
> N=12 (全7 topic 覆盖 + 5修正term全含[品質特性/共同レビュー/妥当性確認/レトロ/グリーンIT] + 本土化敏感[スクラム/ITIL/監査])
> 日付: 2026-06-04

## 結果サマリ

| 指標 | 値 |
|------|----|
| N | 12 |
| **faithful (忠実)** | **12/12 (100%)** |
| severity none | 5 |
| severity low | 7 |
| severity medium | **0** |
| severity high | **0** |
| flagged (medium/high) | **0 (空)** |
| 誤訳・意味逆転・欠落 | **0** |

**結論**: 全12サンプルで `faithful=true`、medium・high・誤訳 0。7 low はすべて「意味は正確だが zh の本土自然さ改善余地」レベル (en は概ね none)。**修正 term 5件すべて翻訳に正しく反映** (品質特性 zh=兼容性含8特性+JIS X 25010 / グリーンIT zh=両面フック / システム監査 zh=改进建议 を確定的に確認済)。

## low 7件 (zh 本土自然さ、意味影響なし)

| unit/term | 指摘 | 区分 |
|-----------|------|------|
| u02 共同レビュー | analogy_zh「发表」→「演示/汇报」がより本土自然 | 単一フィールド・安全 |
| u05 ファンクションポイント法 | explanation_zh「实绩」→「历史数据」がより本土自然 | 単一フィールド・安全 |
| 09-26-u04 スクラム | analogy_zh が原文に無い「争球」(rugby scrum 訳語) を補足。誤りでなく正確な補助だが jp/en はミラーで語を残すのみ | ミラー一貫性 (任意) |
| u04 妥当性確認テスト | term_zh「有效性确认测试」も可だが本土標準は「确认测试」。**doc 内で一貫**しており誤りでない | 用語ポリシー (横断) |
| 10-27-u02 プロジェクトスコープマネジメント | zh「成果物」は和製語、本土標準は「交付物/可交付成果」。**ただし zh 9 unit で一貫使用 (交付物 0件) =意図的統一**。単独変更不可 | 用語ポリシー (横断) |
| 09-26-u01 構造化手法 | term_en 単数 'Structured method' / summary 複数 'methods' の体裁差 | 体裁 (任意) |
| (ITIL/ITガバナンス) | low自然さ (意味正確) | 任意 |

## 判定と対応方針

- **忠実度 = 100% (medium/high/誤訳 0)** → 三語ゲートに進める品質。
- **安全な単一フィールド本土化 2件** (共同レビュー 发表→演示 / FP法 实绩→历史数据) は第一批で適用候補。
- **用語ポリシー 2件は横断判断**: 「成果物 vs 交付物」「有效性确认测试 vs 确认测试」は **zh 全 unit に一貫する訳語ポリシー**であり、単独 unit でパッチすると全量との不整合を生む。→ **全量 translator 指針 (prompt) で一括決定すべき** (pilot の「全量への学び」パターン)。reviewer も「単独変更不可、全 zh 一括で」と明記。
- **教訓 (前段の sync 漏れと同型回避)**: 用語変更は複数フィールド (term/explanation/analogy/memory_hook) + 複数 unit に波及するため、単独パッチは sync 漏れリスク。横断ポリシーは全量 prompt で固める。

> 本 audit は critic 独立判定。修正適用は別 pass (writer 役)、reviewer 再核 (Rule D)。

---

## 横断用語ポリシー 決着 (2026-06-04, Session 83)

ユーザー決定 = **本土標準形に換える + 既存30 unit 回改** (成果物→交付物 / 有效性确认→确认)。
- translator prompt 更新 (全量 technology/strategy)。
- 既存30 unit 回改 (`stage4-phaseB-l10n-retrofit.mjs`): 47置換/8 unit、和製形残留0、确认/验证 区別保持 spot-check 済。management 該当: 08-25-u02(7)/u04(15)/09-26-u01(4)/u04(2)/10-27-u01(1)/u02(6)/12-31-u02(7)。
- 詳細は session-83 §B翻訳前。
