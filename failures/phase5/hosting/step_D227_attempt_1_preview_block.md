# D-227 Preview Builds — attempt 1: 最初の preview build が deploy で失敗 (2026-11-12)

- 入力: branch `robots-open-backlink` commit `dbaa0368` (robots.txt 変更)、Workers Builds の Preview Builds ON 直後、preview command `npx wrangler preview`。
- 産物: build `a6c6f4aa-1523-434c-b08c-774f57a90b59` — Initializing / Cloning / Installing / Building (build:cf 一式、scan-out の規則 (c) skip 表示どおり) は成功、Deploying 5 s で失敗。
- 技術判定: FAIL — `✘ [ERROR] Your Wrangler configuration is missing a 'previews' block to run this command` (wrangler 4.160.0、`wrangler preview` は open beta)。preview の Build variables は None (本番の 2 変数は継承されない)。
- 業務判定: 本番への影響なし (preview は本番を変えない)。ただし check run が本番と同名・同 URL 形式 (`/production/builds/`) で付き、fast-forward merge なら `prod-e2e.sh` の `[0]` が本番と取り違え得た。
- 次 attempt の入力: `wrangler.jsonc` に `"previews": {}`、`prod-e2e.sh` で preview 除外 + 最新、merge は `--no-ff`。→ attempt 2 (`db8b5bad`、build `ab41aa88`) 成功。
- 学び: docs (DEPLOY §2-2) は「preview は秘密を継承しない」まで確認していたが、新モデルの必須設定 (`previews` block) は実地まで分からなかった。設定を ON にした直後に 1 回試すまでを 1 step とする。
