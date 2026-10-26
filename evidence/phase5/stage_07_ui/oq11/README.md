# OQ-11 (図拡大 dialog が左上に貼り付く) — S133

- 原因: Tailwind 4.3.0 preflight (`node_modules/.pnpm/tailwindcss@4.3.0/.../preflight.css` 10–16 行) が `*, ::backdrop …` に `margin: 0` を設定し、UA の `dialog:modal { margin: auto }` を上書き。全 src で `showModal` は練習の図 1 箇所のみ。
- 修正: `.zoom { margin: auto }`。
- `dialog_probe.mjs`: 図付き非中問 6 題 × viewport 1440×1000 / 390×844 / 768×1024 で図を開き、dialog の左右・上下余白差 ≤ 1px を判定。
  - 修正後 (本地 :3123): **18/18 CENTRED** (例 1440 2010h22h-q079: 左右 257 / 上下 139)。
  - 負対照 = 修正前の本番: **18/18 OFF**。
- vitest 985 / tsc 0 / build 0 / e2e 本地 81/81。
