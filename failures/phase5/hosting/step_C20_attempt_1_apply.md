# C20 attempt 1 — 適用 script が最終照合で停止 (S162)

- 入力: `evidence/phase5/hosting/c20/patches.json` (99 補丁 / 66 欄、うち stem zh 4 欄 = translations 層)。
- 産物: `scripts/c20-quiz-apply.ts --apply` が `.phase2` 書込み・translations sidecar 書込み・merge の後、最終照合で `TypeError: Cannot set properties of undefined (setting 'zh')`。
- 技術判定: 最終照合 (rebuilt sidecar = before + planned) の loop が exam で絞るだけで layer を絞らず、translations 層の stem 欄を explanations の question に当てた。
- 業務判定: データの意味は壊れていないが、途中まで書込み済み (`.phase2` は gitignore で git から戻せない)。
- 回復: plan 出力 (各欄の before/after) から `.phase2` 62 欄・`.phase1` tr_ 4 欄を before に戻し、sidecar は `git checkout`。全 18 exam で merge が committed sidecar を byte 再現することを確認 (git status 0)。失敗時点の sidecar は scratchpad `c20_failed_state/` に退避。
- 次 attempt の入力: 同じ patches.json、loop に `x.layer === "explanations"` を追加した script。
