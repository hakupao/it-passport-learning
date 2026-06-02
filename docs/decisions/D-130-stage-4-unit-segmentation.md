# D-130 — Stage 4 ユニット分割と排列 (Phase A 規劃)

> Status: **Locked** (Session 78, 2026-06-02)
> 関連: D-115 (ユニット架构 5〜8語/~15分), D-117 (排列規則), D-128-A (二段式), D-126 (mapping), Rule D
> 前提: 63 小分類, 用語/topic = 3〜91 (avg 22.4, 空節点 0)。

## 文脈

一つの小分類が 3〜91 用語を持ち、D-115 は 5〜8語/unit、D-117 は「概念依存優先 + 出題頻度補助」の排列を要求。境界と順序の決め方を確定する必要がある。

## 決定

### 130-A Per-topic LLM 規劃 pass

各 topic に 1 call。入力 = {topic メタ, terms[], 各 term の歴史題頻 (question_bank 集計), 前置概念ヒント} → 出力 (構造化) = ユニット分割 (5〜8語/unit) + ユニット順 + ユニット内 term 順 (概念依存優先 + 出題頻度補助)。

### 130-B ToC を先に確定・審査

63 topic 分の規劃を統合 → 全書 ToC → ユーザー審査 (D-128-A の廉価ゲート) → 確定後 Phase B 内容生成。

**採用理由**: 概念依存排列は意味理解を要し機械分割不可。規劃を分離すれば正文前に骨格を激安審査でき、関連 term の分断も防ぐ。
**却下**: 機械順次分割 (概念排列なし、関連 term 分断) / 内容生成内即興分割 (ToC 単独審査不可、手戻り高)。

## 影響

- 産出: `unit_index.json` の骨格 (unit id, 所属 topic, terms[], 順序, prerequisites)。Unit ID = `{category}-{major}{minor}-u{nn}` (D-118)。
- invariants 不変。証拠 `evidence/phase5/stage_04_toc_*`。Rule D: 別 subagent_type が規劃妥当性を核験。
