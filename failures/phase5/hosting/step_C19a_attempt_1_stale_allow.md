# C19a — attempt 1: `check:release` FAIL (lang-leak gate の stale 許可) (S158)

- **入力**: `tbjp-apply.ts --round c19a --apply` (6 単元 39 欄) の後、試験追加 → vitest 1,480 緑 → `pnpm check:release`。
- **産物**: なし (gate:content で停止、build・e2e 未実行)。
- **技術判定**: FAIL — L5 gate の stale: 許可 `same-formula R-same management-08-25-u01 terms[2].fig.data.cols[0].zh «特性 (JIS X 25010:2013)»` (zh = ja の同一許可) が、zh を「特性（JIS X 25010:2013）」にしたため一致 0 件。
- **業務判定**: 影響なし (変更は意図どおり、許可リストが追従していないだけ)。
- **原因**: apply 後に gate を回さず check:release に進んだ (L4-d では apply 直後に gate を回していた)。
- **次の attempt の入力**: `l5-build-allowlist.ts` dry-run で削除 1 (この項目のみ・新規 0) を確認 → `--write` → gate PASS → check:release + e2e 再実行。
- **教訓**: textbook / quiz の文字を変えたら apply 直後に gate (許可リストは path + 文字列で位置指定)。
