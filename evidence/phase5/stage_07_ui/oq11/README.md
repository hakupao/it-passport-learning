# OQ-11 (図拡大 dialog が左上に貼り付く) — S133

- 原因: Tailwind 4.3.0 preflight (`node_modules/.pnpm/tailwindcss@4.3.0/.../preflight.css` 10–16 行) が `*, ::backdrop …` に `margin: 0` を設定し、UA の `dialog:modal { margin: auto }` を上書き。全 src で `showModal` は練習の図 1 箇所のみ。
- 修正: `.zoom { margin: auto }`。
- `dialog_probe.mjs`: 図付き非中問 6 題 × viewport 1440×1000 / 390×844 / 768×1024 で図を開き、dialog の左右・上下余白差 ≤ 1px を判定。
  - 修正後 (本地 :3123): **18/18 CENTRED** (例 1440 2010h22h-q079: 左右 257 / 上下 139)。
  - 負対照 = 修正前の本番: **18/18 OFF**。
- vitest 985 / tsc 0 / build 0 / e2e 本地 81/81。

## Rule D 1 回目 (`feature-dev:code-reviewer` opus) = PASS-with-notes (静的審査のみ、shell 無しで実描画なし)
- 診断・修正は正しいと確認。指摘 Low-1 / Low-2 (既存): 狭い画面で拡大画像が横溢出、横向きスマホで閉じるボタンがスクロール外。
- `dialog_probe_full.mjs` (6 図 × 1440×900 / 1280×600 / 390×844 / 360×800 / 844×390) で実測確認: 修正前 横溢出 12/30 (390・360 全部)、閉じるボタン不可視 5/30 (844×390)。
- 修正: `.zoomImg` の上限を dialog の content box に合わせる (`max-width: calc(96vw - 27px)`、`max-height: calc(94dvh - 73px)` [vh fallback]、dialog も 94dvh)。修正後 30/30: 居中・横溢出 0・縦スクロール 0・閉じるボタン可視・Esc / 背景クリックで閉じる・縦横比保持 (誤差 < 2%)。vitest 986 / tsc 0 / build 0 / e2e 81/81。
