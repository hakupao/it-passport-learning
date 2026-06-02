# D-131 — Stage 4 選題・出題頻度・図解二軌

> Status: **Locked** (Session 78, 2026-06-02)
> 関連: D-115 (即時チェック/チャレンジ/頻度バッジ), D-118 (schema/quiz は内嵌せず ID 参照), D-120 (group 共有図), Stage2 figures, Rule A/B/D
> 前提: 全 63 topic に primary 題あり (7〜217題/topic, avg 46)、**難易度フィールド無し**。Stage2 で原裁剪図 `figure_path` (502枚) + `groups.json` (D-120)。

## 文脈

D-115 は各 term に即時チェック (1〜2題)、各 unit にチャレンジ (3〜5題, 混合難度)、unit に出題頻度バッジを要求。題库には難易度ラベルが無く、ユーザーは「図は重做しつつ、Stage2 で裁剪保存した原図も索引付きで附し、対照・溯源できるように」と追加要求。

## 決定

### 131-A 即時チェック選題 (term 単位 1〜2題)

`syllabus_refs.terms` に当該 term を含み、同 primary_topic の題から選択 (high-confidence 優先)。直配題なき term は節点級にフォールバック。確定的 (LLM 不要)。

### 131-B チャレンジ選題 (unit 単位 3〜5題)

unit 内 term 題池 + 節点池の和集合から抽样、即時チェック既用題を除去。

### 131-C 出題頻度バッジ

歴史題数から導出: 節点級 (7〜217題 → 分位で 頻出/標準/低頻)。term 級頻度も併用可。**データ裏付け、推測せず**。

### 131-D 「混合難度」= 難度を捏造しない

難度ラベル不在につき、チャレンジの「混合」は **年度跨度 + term 覆盖跨度** で定義 (異年度・unit 内異 term を網羅)。難度階梯は**捏造しない** (Rule A 精神: 支持できる事実のみ)。真の難度分級は将来増強 (答題正答率データ要、現状無)。

### 131-E 図解二軌 (ユーザー要求)

- **生成図 (新)**: ~30% 用語に Mermaid 源码を内容生成時に併産 → 確定的後処理で SVG レンダ (mmdc/mermaid-cli, 工具链は実装時確定) → `data/ip/textbook/figures/`。レンダ失敗は「無図」降格 + 入档 (Rule B)。
- **原裁剪図 (既存)**: unit 引用題が `figure_path` (または group 共有図, D-120) を持つ場合、unit に `source_figures[]` (原裁剪図参照 + figure_type/description/group_id) を携帯し、全局 `figure_index.json` で検索・溯源対照を可能に。**再裁剪せず、最低限索引を附す**。

**採用理由**: ユーザーは「重做図 + 原図も索引付きで附し対照追溯」を要求。二軌で教学図 (新 Mermaid) と原典図 (溯源) を両立。

## 影響

- schema 拡張 (D-118): unit に `generated_figures[]` + `source_figures[]`、全局 `figure_index.json`。
- 即時/チャレンジは question_bank ID 参照 (内嵌せず, D-118)。invariants 不変。
- 証拠 `evidence/phase5/stage_04_*`。Rule D 核験。
