# Stage 4 Phase A — pilot ToC 監査 (Rule A/D)

> 日付: 2026-06-02 / Session 79 / Phase 5 Stage 4 Phase A (規劃 → ToC ゲート)
> 対象: pilot 3 跨類節点の per-topic 規劃 pass + 統合 ToC
> 決策: D-128-A (二段式), D-128-B (pilot-first), D-129 (全 Opus), D-130 (per-topic 規劃), D-131 (頻度/figure), D-132 (Claude Code 経路)

## 1. 実行サマリ

| topic | 名称 | terms | units | Rule D verdict | rounds |
|-------|------|-------|-------|----------------|--------|
| strategy-02-04 | 知的財産権 | 18 | 3 (8/5/5) | **PASS** | 1 (r1=PASS) |
| management-11-29 | サービスマネジメントシステム | 25 | 5 (5/5/5/5/5) | **PASS** | 2 (r1=CONCERNS→r2=PASS) |
| technology-16-43 | システムの構成 | 25 | 4 (6/6/6/7) | **PASS** | 2 (r1=CONCERNS→r2=PASS) |

計 12 unit / 68 用語。

## 2. 手法 (D-130 / Rule D)

- **規劃 pass (writer)**: `general-purpose` (model=opus) ×1/topic。入力 = `.planning/input_{topic}.json` (topic meta + objective + terms[freq_in_topic/freq_global] + node badge)。出力 = unit 分割 (5〜8語) + unit順 + unit内term順 (概念依存優先・頻度補助 D-117) + prerequisites + 各種日本語根拠。
- **核験 (reviewer, Rule D)**: `code-reviewer` (model=opus) ×1/topic — **writer と別 subagent_type** (Rule D 充足)。非 PASS は指摘を注入し再規劃→再核験 (repair ループ, 最大3ラウンド)。
- 実行 = Claude Code Workflow `wf_9dacedbb-06f` (pipeline, ultracode, D-132 外部 API 不使用)。10 subagent / 約556秒 / 510k subagent tokens。

## 3. 独立確定性検算 (Rule A 構造核験, executor 環境外の機械チェック)

`scripts/stage4-merge-toc.mjs` 装配時 + 専用スクリプトで全3 plan を入力に対し機械照合:

| 検査 | strategy | management | technology |
|------|----------|-----------|-----------|
| 入力term数 = plan term数 | 18=18 ✅ | 25=25 ✅ | 25=25 ✅ |
| 欠落 term (missing) | 0 ✅ | 0 ✅ | 0 ✅ |
| 捏造 term (extra, 入力に無い) | 0 ✅ | 0 ✅ | 0 ✅ |
| 重複 term | 0 ✅ | 0 ✅ | 0 ✅ |
| unit サイズ 5〜8 | ✅ | ✅ | ✅ |
| unit_order が全 unit を網羅 | ✅ | ✅ | ✅ |

→ term の過不足・捏造・重複ゼロを **LLM 核験とは独立に機械検算で確認**。term 文字列は入力と完全一致 (改変・翻訳なし)。

## 4. 残存 issue (全 low / 非ブロック)

Rule D が記録した指摘は全て `low` severity・非ブロック。主に**頻度根拠の表記口径**に関するもの:

- strategy u01: unit内 freq 非単調 → ただし親子/法体系グループ関係で「同格 term」ではないため freq_order_aux 規則対象外。概念依存で正当化済。
- strategy u03 / management u04: order_reason で `freq_global` と `freq_in_topic` を取り違えた軽微な metric 記述ズレ (配置自体は妥当)。
- technology u02: 最頻出 RAID(10) が概念依存を優先して unit 内中位 → D-117 (概念依存>頻度) に忠実、違反ではない。正文で重要性を補足する旨は rationale に記載。
- technology u04: 7語 unit で2軸 (仮想化応用+処理タイミング) の結束やや弱いが、下限割れ回避の合理的統合として許容。

→ いずれも Phase B 正文生成時に order_reason の metric 表記を `freq_in_topic` に統一すれば解消。骨格 (境界・順序・prerequisites) には影響なし。

## 5. Rule A スコープ判断

Phase A は**ソース圧縮/改写ではなく de-novo の規劃** (term 一覧 → 単元分割)。圧縮率 >50% を伴わないため、重量級 N-sample 意味抽検 (規則 A) は **Phase B 正文生成** (三語講解の生成、ソース→講解の改写を伴う) に適用する。Phase A の品質保証は ① 確定性構造検算 (§3) + ② 別 subagent_type の Rule D 意味核験 (§2) + ③ ユーザー ToC ゲートの三層で担保。

## 6. 成果物

- `data/ip/textbook/unit_index.pilot.json` — pilot ToC 骨格 (gitignored data/、最終出力は Release)
- `data/ip/textbook/.planning/{input,plan,review}_{topic}.json` — 中間産物
- `evidence/phase5/stage_04_toc_pilot/toc_pilot.md` — 人間可読 ToC (ユーザー審査用)
- workflow: `scripts/stage4-phaseA-planning.workflow.mjs` / 装配: `scripts/stage4-assemble-planning-input.mjs` / 統合: `scripts/stage4-merge-toc.mjs`

## 7. 次

ユーザー ToC ゲート (D-128-A)。承認 → Phase B 内容生成 (単 unit pilot で吞吐/耗時実測 + Rule A 意味抽检) → 全量規劃 (63 topic) へ外挿。
