# Stage 4 Phase B — 日語正文 監査 (Rule A/D) + 吞吐外挿

> 日付: 2026-06-02 / Session 79 / Phase 5 Stage 4 Phase B (日語先行)
> 対象: pilot 12 unit (3 跨類節点) の日語正文 + 確定的 fixtures (選題/図索引) + Mermaid レンダ
> 決策: D-115(四段) / D-116(記憶フック) / D-118(三語平铺・quiz ID参照) / D-129(全Opus・日語権威源) / D-131(選題/頻度/図解二軌) / D-132(Claude Code) / Rule A/B/D

## 1. 産出サマリ

| 項目 | 値 |
|------|-----|
| unit | 12 (strategy 3 / management 5 / technology 4) |
| 用語 | 68 (全 4段フィールド: 定義/解説/例え/記憶フック) |
| 即時チェック (inline) | 88 題参照 (fallback 13、全て unit term に接触) |
| チャレンジ | 60 題参照 (年度跨度 mostly 5) |
| 生成図 (Mermaid→SVG) | **19/19 レンダ成功** (失敗0) |
| 原裁剪図 (source_figures) | 6 unique (figure_index.pilot.json) |

## 2. Rule D (生成時, writer ≠ reviewer)

- writer = general-purpose(opus) / reviewer = code-reviewer(opus) — 別 subagent_type (Rule D)。非PASS は repair。
- 結果: **12/12 PASS** (11 = 1ラウンド、technology-16-43-u02 = 2ラウンド[CONCERNS→修復→PASS])。
- Workflow `wf_ac7a2e63-92c` (再): 26 subagent / 1,644,547 tokens / 581,663 ms (~9.7分)。

## 3. Rule A 意味抽检 (N=15, critic/opus — 独立 第三 subagent_type)

Workflow `wf_ef989791-7ae`: 15 subagent / 661,550 tokens / 121,233 ms (~2分)。

| 指標 | 値 |
|------|-----|
| 事実正確 (accurate) | **15/15 (100%)** |
| severity | none 9 / low 5 / **medium 1** / high 0 |

### medium 1件 → **修正済** (Rule A の実効)
- **サブスクリプション (strategy-02-04-u03)** の inline_quiz が無関係題 `2009h21h-q009`(不正競争防止法) を指していた。根因 = **B1 選題の term 碰撞**: サブスクの唯一直配題 `2024r06-q021`(terms=[サブスク,アクティベーション,ボリュームライセンス]) を、先行する アクティベーション が2題目として奪取 → サブスクが starvation → 無関係 fallback。
- **修正**: `stage4-phaseB-fixtures.mjs` の inline 選題を **稀少度優先分配** (候補数昇順で1題確保) + 2題目は後続 pass + fallback は unit 他 term に接触する題を優先、に変更。
- **検証**: サブスク→`2024r06-q021` ✅ / アクティベーション→`2017h29a-q089` ✅ / 全 unit で 非fallback 誤映 **0**、fallback が unit term に無接触 **0/13** ✅。日語正文(プローズ)は不変・100%正確のまま。

### low 5件 (全て accurate=true、表現/完備性のみ、非ブロック)
- 特許法: 定義に「高度の」+ 要件に「産業上利用可能性」を足すと完備 (誤りではない)。
- RAID: パリティを「誤り訂正符号(ECC)」と言い換えるのは過剰、「故障復元用の冗長情報」が適切。略語 Array は単数が主流。
- 仮想化: 記憶フック/例えが「分割(1→多)」寄り、定義の「統合(多→1)」も一言添えると双方向が揃う。
- サブスクリプション: 「常に最新版」は定義要件でなく特徴の例示と明示推奨。
- サービスマネジメントシステム: SMS(管理する仕組み) と サービスマネジメント(管理される活動) の区別を表現上より明確に。

→ いずれも翻訳前に日語で軽微調整可。ユーザー日語ゲートで採否判断。

## 4. 図解レンダ検証 (D-131-E track1)

- mmdc (@mermaid-js/mermaid-cli v11.15 + puppeteer Chromium) を workspace 根に導入 (pnpm allowBuilds: puppeteer)。
- 19 図全成功。`\n` ラベルは mermaid が `<br/>` に変換 → 日本語多行ラベル正常 (検証済)。失敗0 のため Rule B 归档なし。

## 5. 吞吐/耗時 外挿 (D-128-B、コストは定額 D-132)

| 工程 (pilot) | 規模 | tokens | wall |
|------|------|--------|------|
| Phase A 規劃 | 3 topic | 510k | ~9.3分 |
| Phase B 日語 | 12 unit | 1.64M | ~9.7分 |
| Rule A 抽检 | 15 sample | 662k | ~2分 |

**全量線形外挿** (63 topic / 推定 ~210〜250 unit、~5.7語/unit):
- 規劃 (残60 topic): ~170k tok/topic → ~10.7M tok、wall ~3h。
- 日語生成 (~250 unit): ~137k tok/unit → ~34M tok、wall ~3〜3.5h。
- 翻訳 zh+en (~250 unit×2): 日語比 ~1.5〜2× → ~50〜65M tok、wall ~5〜7h。
- Rule A/D: 随伴。
- **計: ~12〜18h の workflow 時間** (Max plan レート制限内、按 token 課金なし=定額)。→ 複数 session に分割が現実的。

## 6. 成果物

- `data/ip/textbook/units/*.json` (12, 日語フィールド + quiz ID参照 + figure + source_figures、lang_status zh/en=pending)
- `data/ip/textbook/figures/*.svg` (19 生成図)
- `data/ip/textbook/figure_index.pilot.json` (原図溯源)
- `data/ip/textbook/.planning/{content,quiz_fixtures,...}` (中間)
- `evidence/phase5/stage_04_content_jp/{sample_jp.md, audit.md}`
- scripts: `stage4-phaseB-{fixtures,assemble-units}.mjs` / `stage4-render-figures.mjs` / `stage4-phaseB-content-jp.workflow.mjs` / `stage4-phaseB-ruleA-audit.workflow.mjs`

## 7. 日語ゲート結果 + 翻訳 pass (zh/en)

- **日語ゲート**: ユーザー承認 (2026-06-02)。low5 表現润色を翻訳前に適用 (`stage4-phaseB-apply-lowfixes.mjs`, 9置換/5files、特許=高度/産業上利用可能性・RAID=冗長情報/単数Array・仮想化=双方向・サブスク=特徴明示・SMS=管理する仕組み)。再装配/再レンダ 19/19。
- **翻訳 pass** (`stage4-phaseB-translate.workflow.mjs`, wf_7bf47316): 日語固定源→zh/en 二次翻訳 (D-129-C)。translator=general-purpose(opus) → reviewer=code-reviewer(opus, Rule D)+repair。**11 PASS + 1 CONCERNS** (management-11-29-u04: zh 稼动率 自然さ low、修正済)。28 agent / 1.45M tok / ~8.7分。
- **三語マージ** (`stage4-phaseB-merge-translations.mjs`): 12/12 unit に `_jp/_zh/_en` 平铺 (term_jp 整合検証)。schema → `stage4-unit-v1-trilingual`、lang_status 三語 generated。
- **翻訳 Rule A** (`stage4-phaseB-ruleA-translation.workflow.mjs`, wf_0de28bdc, critic/opus N=8): **忠実 8/8 (100%)**、severity none3/low5/medium0/high0、flagged 0。
  - low5 = 中国本土自然さ (稼动→运行 / 校验位→校验信息 / 解约→取消订阅 / 定义要件→定义要素 / 著作权 直訳調)。意味は全て正確。明確な4件を pilot に適用済 (zh のみ、jp 不変)。
  - **全量への学び**: translator prompt に「日式借词を避け中国本土標準 IT 用語を使う」指針 + 例を追加すべき (系統的傾向)。

## 8. Phase B pilot 完了状態

12 unit 三語 (68語×3) / inline 88 / challenge 60 / 生成図 19(SVG) / 原図溯源6。Rule D: 日語12/12・翻訳11+1。Rule A: 日語15/15正確・翻訳8/8忠実。全 low は適用 or 文档化。

## 9. 次

ユーザー **三語ゲート**: 最終確認 → Phase B pilot 完了判定。承認後 **全量 (63 topic)**: Phase A 規劃(残60)→ToCゲート→日語生成→ゲート→翻訳、を session 分割で。translator prompt に本土用語指針を反映。
