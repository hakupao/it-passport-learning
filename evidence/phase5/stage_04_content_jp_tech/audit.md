# Rule A 意味抽检 — technology 日語正文 (119 unit)

> workflow: `stage4-phaseB-ruleA-audit.workflow.mjs` (wf_4cbd941d-236)
> 監査者: critic/opus (writer=general-purpose・reviewer=code-reviewer と別 subagent_type、Rule D 三役分離)
> N=30 (全 30 非pilot topic を各1 覆盖 [各 topic 最密 unit の最長 explanation term] + 3 CONCERNS 必含)
> 日付: 2026-06-04

## 結果サマリ

| 指標 | 値 |
|------|----|
| N | 30 |
| **accurate (事実正確)** | **29/30 (97%)** |
| severity none | 18 |
| severity low | 11 |
| severity medium | 1 |
| severity high | **0** |
| flagged (medium/high/inaccurate) | **1** (リスク対応) |

**結論**: 1 medium を除き全 accurate。high・FAIL 0。3 CONCERNS のうち 2 (IrDA/JPEG) は accurate=true (IrDA=low 表現、JPEG=none)、1 (リスク対応) が唯一の medium=accurate=false。

## medium 1件 (要修正 — 事実完備性の欠陥、accurate=false)

### `technology-23-62-u02` リスク対応 (低減の欠落)
- **指摘**: リスク対応の選択肢を「回避・保有・移転・共有・分散」の5つとして提示するが、**IPA 頻出の中核選択肢「リスク低減(軽減/損失低減)」が欠落**。記憶フック「回避・保有・移転・共有・分散から対処を選ぶこと」が事実上「選択肢一覧」として読まれ、受験者が「低減はリスク対応の手段ではない」と誤認する誤誘導リスク。`memory_hook_correct=false`。
- **重要制約 (調査済)**: **knowledge_tree (IPA シラバス Ver.6.5) 全体に「リスク低減」term は不在** (「低減/軽減」は management-10-27-u03 の「軽減」1件のみ、無関係文脈)。当 topic (technology-23-62) の6 unit にも低減 term なし。**よって低減を term として追加不可** (invariant: unit terms=ToC 厳密一致 / D-108 官方源権威)。
- **修正方針**: 品質特性 (互換性) と同型 — **prose レベルで低減を標準選択肢として明示** (term 追加せず)。リスク対応の explanation/memory_hook/overview/summary[0] の列挙を「回避・低減・保有・移転・共有・分散」へ統一し、「これら5つが全て」の含意を解消。term セット (6) は不変。

## low 11件 (表現/完備性、翻訳前に採否)

事実誤りなし。うち「境界的=やや事実寄り」3件は修正推奨、残りは任意:

| unit/term | 指摘 | 区分 |
|-----------|------|------|
| 15-40-u01 制御 | explanation「5大機能の中で出題頻度が最も高く」が**根拠なし断定 + 当 unit の freq_badge=低頻 と不整合** | 推奨 (内部矛盾) |
| 15-41-u02 DDR3 SDRAM | 「SDRAMはCPUの動作タイミングに同期」→ 正確には「クロック信号に同期」(クロック領域混同) | 推奨 (精度) |
| 15-42-u02 IrDA | 「テレビのリモコン的な」類比が IrDA=家電リモコン規格と誤読余地 (家電IRは IrDA 非規格) | 推奨 (明確性) |
| 14-37-u01 繰返し | analogy の継続/終了条件の言回しずれ + for型(回数指定)の定義網羅 | 任意 |
| 17-47-u01 ソフトウェアパッケージ | 定義「特定用途向け」と「汎用」が同居で語感矛盾的 | 任意 |
| 17-48-u01 OSS ほか計~6 | 表現/完備性の軽微 (意味正確) | 任意 |

## 判定と対応方針

- **事実正確性 = 97% (high・FAIL 0)** → 日語ゲートに進める品質。
- **medium 1件 (リスク対応 低減)** = accurate=false の実質欠陥 → **修正必須** (prose で低減明示、term 非追加)。
- **low 3件 (制御/DDR3/IrDA)** = 境界的に事実寄り → 修正推奨。残り low ~8 = 任意。
- 修正は writer 役、Rule D 再核 (前批の summary 同期漏れ教訓を踏襲: 修正時は overview/explanation/memory_hook/summary の全同期を確認)。

> 本 audit は critic 独立判定。修正適用は別 pass。

---

## 修正適用 (2026-06-04, 日語ゲート承認後)

ユーザー日語ゲート判定 = **承認 + medium 1 + 境界 low 3 修正**。`scripts/stage4-phaseB-tech-fixes.mjs` (確定的・明示 before/after・Rule B・冪等・memory_hook→summary 自動同期)。

### 適用 (7 置換、failed 0)
- **medium リスク対応**: 低減を prose で明示 (explanation/memory_hook/summary key_points[0]/overview intro の4箇所)。**term は6個不変=「リスク低減」term 非追加** (invariant: knowledge_tree に低減 term 不在のため追加不可)。
- **low**: 制御 (根拠なし「最頻出」断定削除→役割記述) / DDR3 SDRAM (CPU動作→クロック信号同期) / IrDA (リモコン类比削除→近距離データ通信)。

### Rule D 再核験 (code-reviewer/opus ≠ writer) → **PASS**
- リスク対応: **invariant_ok=true** (term 厳密6個・mermaid 6ノード・低減 term 非追加)、medium 誤誘導解消、回避(源を断つ)/低減(影響を下げる)区別正確。
- 制御/DDR3/IrDA: fix_resolves_issue=true、退行0。
- **指摘 (非ブロック CONCERNS級)**: overview.intro_jp は「など」付きで可だが、unit_summary_jp が「(回避・共有・移転・分散・保有)」と低減なし+「など」なしで網羅的に読める → **追加修正**: ToC `unit.summary_jp` に「など」付与 (構造不変、term/order 不変、re-assemble+re-render)。これで全5箇所整合。
- 証拠: 本 audit + session-83 §修正。`failures/stage_04_tech_fixes/` 発動なし (before 一致、failed 0)。

### 教訓 (前批 sync 漏れ型の継続対策)
- リスク対応の低減は overview/explanation/hook/key_points/unit_summary の**5箇所**に分散。fix script で4箇所、Rule D が unit_summary 漏れを捕捉→5箇所目を ToC で同期。**「選択肢列挙」型の用語は全出現箇所の同期が必須** (全量 strategy 批でも踏襲)。
