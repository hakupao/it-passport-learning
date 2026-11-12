# H5 Rule D 審査 (verifier opus、writer = executor opus、2026-11-12)

**判定 PASS (HIGH 0 / MEDIUM 0 / LOW 6)、APPROVE。**

- 独立の基線: `git archive 1956a486` (main) を scratchpad で server build (:3170) と `out/` (:3171) を、writer の道具を使わない独自 script (`H5_review_tools/rv.mjs`) で 30 頁比較 (`<main>` innerText・title・description・robots・全 `a[href]` と文字・img src/alt・SVG・header/nav・button)。22 頁一致、残りは L4 の文言と `[[jp:]]` の span 分割のみ (`res.json`)。
- 独立の対照: main の src (branch と 113 ファイル差 = 循環比較でない) + HEAD の `data/ip`・`apps/web/messages` → 15 URL すべて一致 (`res2.json`)。
- JSON の内部整合 (615 + 120 = 735、zh 76 / en 44)、`tsc` 0、`vitest` 1,496 passed、skip は既存の条件 skip 2 件のみ。Playwright は writer の記録 (再実行なし)。

| LOW | 内容 | 処置 |
|---|---|---|
| 1 | writer の比較は text node と head のみ (href・img・aria を見ない) | 審査側の 30 頁で属性を補完済。道具を再利用するときに追加 |
| 2 | canonical / hreflang を値を見ずに expected | 審査側が 5 頁の値を確認。H6 の smoke に canonical の値の検査を入れる |
| 3 | `explained()` の部分文字列判定が弱い | 対照 120/120 一致で補完 |
| 4 | H5_fidelity.md の「en の hook 修正」は誤り | **訂正済** |
| 5 | 基線 2 の木の状態が残っていない | 審査側の独立再現で補完、本書と `H5_review_tools/` に記録 |
| 6 | owner 表示は diff の対象外 | H7 切替後の所有者確認 (再有効化時) で owner UI を見る |
