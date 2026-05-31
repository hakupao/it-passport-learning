# D-124 — Stage 2.7 検出方式を「Opus ブラインド転写 → 機械的 diff」に確定

**状態**: Locked
**日付**: 2026-05-29 (Session 74)
**文脈**: D-123 多段パイプラインの「検出」段を 3 回のパイロットで実証較正した直後

---

## 背景（3 パイロットの実証）

| # | 方式 | モデル | 結果 |
|---|------|--------|------|
| 1 | collate（stored 開示, 検出+転写） | default `explore` | **エコー**: `printed_stem`に stored 丸写し→偽陰性。`true_*`ハルシネーション+プレースホルダ捏造。 |
| 2 | blind（stored 非開示, 転写のみ） | default `explore` | **ハルシネーション**: q001 clean を別物に捏造、q004「SNS」を「DX」に捏造。約半数が架空。 |
| 3 | blind（stored 非開示） | **`model:'opus'`** | **正確**: q10/q11/q14/q85 を実印刷どおり逐語転写。clean は stored と一致、欠陥は相違として表面化。 |

**真因 = MODEL**。ページ画像 1432×2026(≈173dpi) を Claude vision は ~1.15MP にダウンサンプルするが、**Opus は既存解像度でも dense 日本語を正確 OCR**できる（主ループ Opus が同画像で q10/q11/q85 を正読していた事実と一致）。default `explore`（小モデル）はできない。再レンダリング不要（複雑な表のみ hi-dpi クロップ補助）。

## 決定

Stage 2.7 の **検出段を「Opus ブラインド転写 → 機械的 diff」に確定**する:

1. **Opus ブラインド転写**（`stage027-blind.workflow.mjs`, `agentType:'explore' + model:'opus'`, Rule D read-only）: 1ページ=1 agent。agent には **stored を一切渡さない**（`blind_in/*.json` は img+問番号のみ）→ エコー原理的に不能。印刷文を逐語転写。
2. **機械的 diff**（`stage027-blind-diff.mjs`): NFKC 正規化 + 空白/句読点除去 + 文字バイグラム Jaccard 類似度。stem<0.72 か choice<0.70 を **候補**化。exam は id から導出（journal は wrapper 前の生 structured output を記録するため）。
3. **候補のみ独立検証**（D-123 のとおり、Rule D 別 lane）→ 検証済適用。
4. content_mismatch（別問題化）も OCR garble も低類似度で確実表面化。**high recall, 精度は検証段で担保**（blind 側の軽微 OCR ノイズによる偽陽性は検証で除去）。

## 既知の性質
- 2015h27h は**病的 exam**: stem/choices が別問題に化けた content_mismatch が多発（候補42%）。answer_keys は問題番号基準で正しいので、stem/choices を実印刷に戻せば整合回復（answer 不変）。母集団率は全量 scan で実測（scan 先行ゲート, D-123）。
- blind の偽陽性源: 短い選択肢（"BI"/"OJT"/"225"）でのバイグラム不安定、blind 自身の軽微誤読（例 ssl→ssi）。→ 検証段で除去。
- minor garble（顧家→顧客, 0S→OS）も候補化され検出可能。

## 却下した代替案
- stored 開示の collate（D-123 で却下済、本決定で再確認: エコー）。
- 小モデル agent（コスト安だが OCR 不能）。
- 全ページ 300dpi 再レンダ（フルページはダウンサンプルで効果なし。per-question クロップのみ有効 → 表系の低信頼ケースに限定流用）。

## 影響
- 検出コストは Opus（~34K tok/page × 1208 ≈ 41M tok）。ユーザー受容済（scan 先行ゲート選択）。
- Rule D: blind=`explore`(opus) / 検証=別 subagent_type(`code-reviewer` 等, opus) / 適用=`executor`。
- 失敗 archive: `failures/stage_027_pilot_singlepass.md` + `failures/stage_027_blind_smallmodel.md`（Rule B）。
