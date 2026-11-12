# 一括書き直し (D-201 / D-206) の主 context 用ツール

S142 で session scratchpad に作り直したもの。scratchpad は session ごとに消えるため repo に置く (Rule A 雛形 `../ruleA_unit_audit.md` と同じ理由)。
使うときは scratchpad に複製し、`<SCRATCH>` を当該 session の scratchpad 絶対パスに置換する:

```sh
S=<this session scratchpad>; cp docs/templates/batch-tools/*.mjs $S/
for f in gates.sh local-e2e.sh prod-e2e.sh; do sed "s#<SCRATCH>#$S#g" docs/templates/batch-tools/$f > $S/$f; chmod +x $S/$f; done
sed "s#<SCRATCH>#$S#g" docs/templates/ruleA_unit_audit.md | sed '1,7d' > $S/ruleA_template.md
```

| ファイル | 用途 |
|---|---|
| `apply_patches.mjs <unit> <final loc part> <list.json>` | Rule A 建議修の B3 補丁を一括登録。list = `[[field, before, after, reason], …]`。全件の before が欄内に 1 回だけあることを先に検査し、1 件でも外れたら何も登録しない。field の term 名は `terms[i](見出し語)` |
| `gates.sh` | D-201 §2-5 の Gates 五項 + IPA 閘 (tsc / eslint [playwright-report 除外] / vitest / `pnpm check:release` (S154 H7 から、build + IPA 閘 = 三言語関門・export build・out/ 走査、log `check-release.log`) / batch-order・unit_minutes `--check` / scripts `node --test`)。scripts の fail 1 = `quiz-fidelity-machdiff.test.mjs` は既存 (vitest 用、批間候補 ⑮) |
| `local-e2e.sh <ids> <tag> <topic> <u-list>` | gates (`check:release` が exit 0 でなければ止まる) → 本番と同じ形の静的配信を起動 (S154 H7、H5_fidelity.md の手順: :3150 = `scripts/local-cf.ts` が `out/` を配信、:3152 = Worker の esbuild bundle を `H5_tools/worker-node.mjs` で Node に載せる、:3161 = `scripts/fake-upstash.ts`) → 截図 → local e2e (試点 3 + 本批、`E2E_OWNER_KEY=local-owner-key` で learning-owner も)。:3000 は使わない。終了時 (中断を含む) に 3 つとも PID で停止 (trap)。`$1` に試点 3 単元 (`management-10-27-u0[123]`、常に自動で足す) を入れると exit 2。`PLAYWRIGHT_BROWSERS_PATH` が設定済で `chromium-*` が無ければ exit 1。tsc / eslint / vitest / check:release のどれかが失敗なら server を起動せず exit 1、終了コード = Playwright。esbuild は wrangler (と vitest) 経由の推移依存で、新しい依存は足していない |
| `shots-tpl.mjs <outDir> <topic> <u-list>` | ja/zh/en × 1440/390/360/320 を開き、未処理記法・非 200・ページ横はみ出し (OQ-18) を機械検査、1440/390 を撮影 |
| `stage-shared.mjs <units comma>` (S150) | 共有ファイル (`unit_minutes.json`・`v2-units.v1terms.json`) を「HEAD + 指定単元の行だけ作業木の値」で index に載せる (作業木は変えない)。複数批を並行 merge しても commit を批ごとに分けるため |
| `prod-e2e.sh <commit> <units> <tag> [vercel\|workers\|prod]` (D-213、S154 H6) | 配置の完了を待ち (最大 20 分) `prod-smoke.mjs` を同じ対象に実行。既定 = `prod` (S154 H7 から)。`vercel` (戻し期間 D-226 の間だけ残す) = commit status が pending でなくなるまで (branch push の "Canceled by Ignored Build Step" も success になるので main の push 専用)。`workers` / `prod` = check run `Workers Builds: itlearn` が success になるまで (無い = build 中か watch paths の skip、20 分で exit 1)。連続 push で中間 commit に status / check run が付かないことがある → 最新 commit に対して当該区間の全単元で回す |
| `prod-smoke.mjs <units comma> [--target vercel\|workers\|prod\|<origin>]` (D-213、S154 H6) | 各単元 × ja/zh/en を HTML GET 1 回: 200 / title 一致 / 生記法・"undefined" なし / 本文あり、Vercel 以外は canonical = `https://itlearn.bojiangz.com/<locale>/textbook/<unit>` (H5 Rule D LOW-2)。対象は `--target` か env `SMOKE_TARGET`、既定 = 今 live の本番 `prod` = `itlearn.bojiangz.com` (S154 H7 から。`workers` = `itlearn.bojiang.workers.dev`、`vercel` = `web-mu-sandy-78.vercel.app` は戻し期間 D-226 の間だけ残す、pause 中は 503)。テスト `apps/web/src/__tests__/prodSmoke.test.ts`。Playwright 全項目は local のみ |

注意 (S142 の事故): `local-e2e.sh` の中で截図スクリプトを sed で生成すると tag 名次第で入出力が同名になり自身を空にする。現行版はテンプレートを直接呼ぶ。

注意 (S152 の事故): `local-e2e.sh` の build 走行中に units/・共有ファイルを書く (merge 再 `--write`・`unit_minutes` 再生成) と build / e2e が全滅する。local 走行中は書き込みを止める。
