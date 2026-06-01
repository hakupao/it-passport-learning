# 失敗アーカイブ (Rule B) — Stage 3 tie-break chunk 7 StructuredOutput 未呼出

> Session 76 / 2026-05-31〜06-01 / Stage 3 知識マッピング G3-4（tie-break 3rd pass）

## 入力
- tie-break workflow `wf_16e1c2b3-d70`（`stage03-tiebreak.workflow.mjs`）。
- 118 contested 題を chunk=12 で 10 chunk に分割、`analyst` agent（Opus）が各 chunk を裁決。
- 失敗 chunk: parallel[7]（items index 84–95 相当）。

## 産物
- 9/10 chunk 成功（106 decisions journal 化）。
- chunk 7 のみ失敗。workflow 結果: `{"decided":106,"requested":118}`、`failures: parallel[7] failed: agent({schema}): subagent completed without calling StructuredOutput (after 2 in-conversation nudges)`。
- 欠落 12 題: 2019h31h-q023 / q053, 2019r01a-q075 / q099, 2020r02o-q032 / q043 / q044 / q093, 2021r03-q008 / q024 / q050 / q089。

## 技術判定
- agent が 2 度の催促後も StructuredOutput ツールを呼ばず終了。ユーザー報告の API 限額（quota）と時間的に一致 → レート制限でレスポンスが途中終了し、最終的に structured 出力に至らなかった可能性が高い。
- 単発・1 chunk のみの失敗（他 9 chunk は同一 prompt/schema で成功）→ prompt/schema の構造的欠陥ではなく、実行時の一過性事象と判定。

## 業務判定
- マッピング品質への影響なし（成功 106 件は健全、欠落 12 件は未処理として明確に検出可能）。
- 欠落 12 件は journal harvest で done 集合との差分から厳密特定（chunk index 仮定に依存しない方式）。

## 次 attempt 入力 → 結果
- 欠落 12 題のみを `_tiebreak_redo.json`（index 0–11 = 欠落 12 題）に切出し、redo run `wf_2a9018db-12a` で再実行 → **12/12 成功**。
- reconcile3 は両 run dir（元 + redo）を harvest し agreed 2,782 + reconciled 118 = 2,900 を構成。

## 教訓
- workflow の chunk 失敗は「全件再実行」せず、journal から done 集合を引いて欠落 id を厳密に特定し、欠落分だけ専用入力ファイル（index 整合）で再投入するのが最小コスト＋整合的。
- tiebreak/audit workflow は prompt に index 範囲と id リストの両方を持たせているため、再実行時は専用入力ファイル（欠落分が index 0..k）を使い、args.items と整合させること（元ファイルの絶対 index で再投入すると range と id がずれる）。
