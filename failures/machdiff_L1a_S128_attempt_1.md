# failures — S128 L1a machdiff 改修 attempt 1 (Rule D FAIL)

- **入力**: ⑨ #6 (空虚な一致 / replay / FP 許容 / 表除外散文比較) + #25 (截断引用)。branch `worktree-agent-ae98d3bc97c50e9f0`、commit `425321e` / `5cdc0a2`。
- **産物**: `scripts/quiz-fidelity-machdiff.mjs` 改修 + vitest 32 件 + fixtures 19 題、`evidence/S128_L1a_machdiff.md`。
- **技術判定 (writer)**: vitest 32/32、回帰 78 組 MISSED 144→92、GAINED 0、実残差 12 維持。
- **業務判定 (Rule D、`pr-review-toolkit:code-reviewer` opus)**: **FAIL**。
  - MAJOR-1: kvParse の 1 行分割が重複キーを上書き → `2017h29a-q092` の先頭 2 組の R/W が非比較。transcript 所有者 W:○→W:ー の 1 字置換を旧版は検出 (exit 1)、新版は見逃し (exit 0)。
  - MAJOR-2: REPORTED_TRUNCATED_QUOTE は source_text が transcript の部分文字列であれば受理し、差分を説明しているか検証しない (A4b / A4 で任意の残差が exit 0)。
  - MINOR: replay-first で A5 型 (agent が表示を写した) の行が消える / TRANSCRIPT_PREFIX が末尾追記を素通し。NIT: FP 正規表現が同一行の散文を消す。
- **教訓**: 「回帰で GAINED 0」は既存データに存在する型しか保証しない。安全網の緩和は adversarial ケース (1 字置換を各新規則の内側に置く) で検証すること。
- **次 attempt の入力**: 上記 MAJOR 2 + MINOR 2 + NIT 1 の是正、reviewer の adversarial 脚本 (`/private/tmp/claude-501/s128-l1a-rev/adv.mjs` ほか) で A2 以外全件 MISSED/exit 1 を確認。
