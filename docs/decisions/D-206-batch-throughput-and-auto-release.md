# D-206 — 一括書き直しの並行数・日上限・自動投入 (D-201 §0-6 / §0-7 / 確認点 3・4 を部分 supersede)

- 日付: 2026-11-04 (Session 142)
- 状態: **LOCKED** (ユーザー選択)
- 適用: b12 以降の全批
- 関連: D-201 (一括書き直し計画 `docs/phase5/PLAN_stage7_phase3_batch.md`)、D-161 (判断委任・停止規則)

## 背景

S142 時点で 78 批中 11 批 (241 単元中 46 単元) が投入済み。ユーザーから「能力があれば agent を多めに同時に走らせて残りを進めたい」との要望。D-201 は同時 run ≤2、1 日 ≤2 批かつ ≤6 単元、毎批ユーザー確認後に push と定めていた。

Claude が示した制約: (1) 本当の律速は額度で、残り ≈190 単元 × 0.4〜1.4M token。並行を上げると 5h / 週額度の消費が速まり、主 context から 5h 使用率は読めない。(2) 主 context の文脈 (merge・補丁・Rule B は主 context で処理)。(3) 共有ファイル (`unit_minutes.json`・v1terms fixture・`batch_order.md`) があるため、批ごとに別 session で並行するのは衝突する。

## 決定 (ユーザーが AskUserQuestion で選択)

1. **同時 workflow run ≤4** (旧 ≤2)。Rule A verifier・再審 agent はこの数に含めない。
2. **1 日 ≤4 批** (旧 ≤2 批かつ ≤6 単元。単元数の上限は撤廃)。
3. **自動投入**: 批の全単元が次をすべて満たしたら、ユーザー確認なしで push (`stage7-ui:main` fast-forward) してよい。
   - Rule A PASS (HIGH 0・MEDIUM 0、補丁後) + 補丁再審 PASS
   - Gates 五項 (tsc / eslint / vitest / build / scripts テスト + batch-order・unit_minutes `--check`) + IPA 閘
   - local e2e 全通過、截図の機械検査 0 件
   push 後に本番 e2e (smoke + 本批)。失敗したら以降の自動投入を止めて Rule B を記録し、ユーザーに報告する。ユーザーへの報告は 1 日 1 回のまとめ (投入した批・commit・attempt 数・未修 LOW)。問題が見つかれば `git revert` で戻す (D-201 §0-11)。
4. **変えないもの**: 停止規則 (D-201 §0-3: 同一単元 2 attempt 未過 / Rule A HIGH が補丁 + 再審後も残る → ユーザーに聞く) と、§0-6 の用量検査の趣旨 (読めない間は「未実施」と記録)。
5. **§0-7 の読み替え**: 前の批の push 前でも次の批は `ready-to-merge` まで走らせてよい。merge `--write` は批の順に行い、前の批の push 後に次の批を merge する (共有ファイルの衝突を避ける)。

## 却下した案

- 同時 run 6 (ユーザー不採用): 額度の消費が速く、主 context は批ごとに session を替える必要がある。
- 批ごとに別の Claude session で並行: 共有ファイル 3 つで衝突する。D-152 (書き込み所有で分ける) の条件を満たさない。
- 毎批確認の維持 / 数批まとめて確認 (ユーザー不採用)。

## リスクと対策

- 人の目視なしで投入するため、Rule A の見落としがそのまま本番に出る → Rule A の手順・観点は変えず、毎日のまとめで未修 LOW を一覧にする。
- 額度切れで run が途中で落ちる → `crashed` 等は D-201 §0-2 どおり新 run_tag で再実行 (attempt に数えない)。
