# b75 local (gates + e2e) — attempt 1 (失敗、工程起因)

- 日付: 2026-11-09 (S152)
- 入力: `local-e2e.sh technology-19-50-u01,technology-19-50-u02 b75 technology-19-50 u01,u02` (HEAD `1021cb9b` + 作業木 b75・b77・b78 merge 済)。
- 産物: gates = tsc 0 / eslint 0 / vitest 1263/1264 (practiceReader: `unit_minutes.json` 不一致) / **build 1** / unit_minutes `--check` 不一致 / e2e **148 failed** / 2 skipped (:3150 起動せず)。
- 技術判定: 単元の欠陥ではない。build 走行中に主 context が b78 の補丁 p15 登録 → merge 再 `--write` と `textbook-unit-minutes-build.mjs` 再生成を行い、build が読む units/・`unit_minutes.json` が途中で変わった。S150 の「build 中は units/ を書かない」の不遵守。
- 業務判定: 投入には影響なし (2 回目で全通過 → `b75.md` Gates)。
- 次 attempt の入力: 作業木を変えずに同じ命令を再走 → tsc/eslint 0・vitest 1264/1264・build 0・e2e 148 passed / 2 skipped。
- 再発防止: `docs/templates/batch-tools/README.md` 注意 (S152)、`RETROSPECTIVE_stage7_ui.md` 一括書き直し節 §缺口。
- 1 回目のログ (要旨は上記、全文は session 終了で消える scratchpad): 
```
tsc 0
eslint 0
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
      Tests  1 failed | 1263 passed (1264)
build 1
ipa        0 nft       25
✓ docs/phase5/batch_order.md current (78 batches)
✗ data/ip/textbook/unit_minutes.json が生成結果と不一致 (内容差) — 再生成してください
unit_minutes: 244 単元 — 合計 7830 分 (min 14 / max 58)
ℹ tests 110
ℹ pass 108
ℹ fail 1
pid 
Node.js v26.13.0
e2e exit=1
  148 failed
  2 skipped
```
