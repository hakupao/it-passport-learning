# D-152 — 書き込み所有権で分割した複数 lane の並列実行 (D-146 §3 改訂)

- **Status**: Locked (Session 128, 2026-10-20)。ユーザー:「多线并行…不互相影响的」「你来编排计划和调度，尽量多一些工作同时进行，不用考虑token」。
- **Supersedes (partial)**: D-146 §3 (叠加禁止・1 系統)。D-146 のその他の条 (§1 unit / §2 起動前申告 / §4 摘要のみ受信 / §5 model 明示 / §8 中断記録) は有効。

## 決定
1. 複数 lane の同時実行を許す。各 lane の書き込み先を起動前申告に明記する。
2. `data/ip/quiz/**` に書く lane は同時に **1 本**。
3. 実行時に呼ばれる脚本 (`scripts/quiz-*`、workflow) を改修する lane は `git worktree` で隔離し、データ lane の unit commit 後に主 context が merge する。
4. 読み取り専用 lane は `evidence/` の**新規**ファイルだけを書く (既存 evidence / failures は不可触)。
5. `git commit` / `push` (main) は主 context のみ。
6. 各 subagent の返答は ≤ 40 行、全文はファイル (D-146 §4)。Rule D (writer ≠ reviewer の type) は lane ごとに適用。

## 理由
- D-146 §3 の動機は S118 の 5h 制限超過による他プロジェクト阻害。ユーザーが token 制約を明示的に外した。
- 並列の実害は共有状態 (questions.json の同時書き込み、実行中脚本の改修) に限られ、所有権分割と worktree で防げる。

## 却下した代替案
| 案 | 理由 |
|---|---|
| D-146 §3 維持 | ユーザーの明示要求に反する |
| 無条件並列 | 共有データ・実行中脚本の破損 |
| データ lane も exam 別に複数並列 | `questions.json` が全 exam 共有の単一ファイル |
