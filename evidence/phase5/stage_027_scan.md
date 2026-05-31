# Stage 2.7 — 全量 Opus ブラインドスキャン結果（scan 先行ゲート）

> Session 74。D-122/D-123/D-124。全 2,900 題の stored stem/choices を源ページと vision 照合。
> 方式: Opus ブラインド転写（stored 非開示＝エコー不能）→ NFKC+文字バイグラム機械 diff。Rule D read-only `explore`(opus)。

## カバレッジ

- **全 1,208 ページ / 2,900 題スキャン完了、欠損 0**（blind master 2,900 unique transcriptions）。
- blind 可読性: clear 2,8xx 中 candidates 内 clear 587 / partial 10 / illegible 6（≈97% clear）。

## 候補（stored と機械 diff で乖離）

- **候補 603 / 2,900 = 20.8%（raw）**。閾値: stem bigram-Jaccard < 0.72 か choice < 0.70。
- 内訳（reason）: stem 188 / stem+choices 118 / choices 282 / page不一致(found=false) 15。
- stem_sim 帯（stem 乖離分）: 0–0.2 = 34、0.2–0.4 = 40、0.4–0.6 = 122、0.6–0.72 = 108、≥0.72 = 284（≒stem 健全・choices 乖離）。

## raw 候補率の解釈

- raw 20.8% は **偽陽性を含む上限**（blind 自身の軽微 OCR ノイズ、短い選択肢でのバイグラム不安定、表記ゆれ）。
- 2015h27h パイロット精査では choices 候補の約 50–60% が真欠陥。stem 低帯（<0.4, 計 74 件）は content_mismatch がほぼ確実。
- **真の母集団欠陥率は独立検証（2nd Opus ブラインド）で精製** → Phase C の ≈12% と整合する見込み（12–15% 予想）。
- 確実な検出: 既知 5 ケース（q010/011/014/085/086）全て候補化。content_mismatch（別問題化）が heuristic/sampling では不可視だったことを全量照合が裏付け。

## 実行ログ（安定運用解の確立）

- Opus vision agent は **同時 8 が限界・16 不可**（2 並列でレート制限事故）。
- 安定解 = **単一 workflow + 内部バッチ 6** で自己ペーシング。「harvest → 残り再算出 → 実行」ループで session 使用上限/失敗箇所に自己修復。
- 全スキャン 5 run（検証40 + chunk群）で 2,900 達成。総 Opus トークン ≈ 6,000 万+。

## 成果物

- `data/ip/exams/.tmp/s027/blind/_blind_master.json`（2,900 ブラインド転写）
- `data/ip/exams/.tmp/s027/blind/_candidates.json`（603 候補 + stored/blind 両テキスト + 類似度）
- `scripts/stage027-blind.workflow.mjs`（batched Opus blind）/ `stage027-blind-diff.mjs`（diff）

## 次段（D-123 パイプライン続行）

1. **独立検証**（603 候補に 2nd Opus ブラインド `code-reviewer`、Rule D 別 lane）→ `stage027-reconcile.mjs` で double-blind 一致判定 → 確定欠陥 + 真の率。
2. **確定のみ適用**（backup付、answer_keys/correct_answer/figure/group 不変）。
3. **再サンプル CI** → Stage 3 ゲート。
