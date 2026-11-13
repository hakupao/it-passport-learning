# C22 — `tb-data` 中の説明された日本語 (S156)

Run: `node --no-warnings scripts/tbjp-apply.ts --round c22 [--apply] --out evidence/phase5/hosting/c22_apply.json`
(plan → apply; the B3 route of S155 tb-jp-unmarked: one loc-part patch, merge dry-run only, in-place write of the target field).

## Triage of the 6 `tb-data` entries (minor D, session-156 log)

| unit | path | text | decision | reason |
|---|---|---|---|---|
| technology-14-37-u03 | `terms[2].detail_en` | 整数型 ×3 | **mark** | exam pseudo-language type name, explained as such in the sentence; u04 en already writes `integer type ([[jp:整数型]])` |
| technology-14-37-u03 | `terms[2].detail_zh` | 整数型 ×2 | not marked (not in the allowlist) | zh localises the declaration (函数名・名称) and the other type names (逻辑型・字符串型); 整数型 is also a Chinese-form word |
| technology-13-35-u02 | `terms[3].fig.data.nodes[0].label.{en,zh}` | あ | keep `tb-data` | sample data; figure labels do not go through `parseInline` (`apps/web/src/components/textbook/figures/`), a mark would print raw `[[jp:` |
| technology-14-37-u04 | `overview_rows[4].extra_{en,zh}[0]` | 'あ' | keep `tb-data` | sample value of 文字型 (not exam wording; the cell is parseInline-rendered, so a mark would render — kept unmarked by the sample-data rule only, corrected per Rule D LOW-1) |
| technology-21-56-u01 | `terms[2].points[1].text_en` | 山 | keep `tb-data` | LIKE example data, not exam wording |

## Change

- `data/ip/textbook/units/technology-14-37-u03.json` `terms[2].detail_en`:
  `○整数型: functionName(整数型: name), where 整数型 is` → `○[[jp:整数型]]: functionName([[jp:整数型]]: name), where [[jp:整数型]] is`
- B3 patch p09 (`evidence/phase5/stage_07_ui/phase3/batch/patches/technology-14-37-u03.json`), window `整数型: functionName(整数型: name), where 整数型`, no retire.
- merge dry-run before / after: exit 0 / 0; new diff = `terms[2].detail_en` only; merged-vs-units after the write = baseline.
- `scripts/l5-build-allowlist.ts`: claim removed, `tb-data` category text updated → `lang-allow.json` 499 → 498 (`new claims 0, dropped 1`).

## Gates

| # | check | result |
|---|---|---|
| 1 | `lang-leak-scan.ts --gate` (no `--accept-new`) | exit 0 |
| 2 | `textbook-v2-validate.mjs --unit technology-14-37-u03` vs HEAD copy (`--file`) | both exit 0, 0 issues, identical output |
| 3 | `node --test scripts/lang-leak-scan.test.ts` | 22/22 |
| 4 | `pnpm -C apps/web exec tsc --noEmit` / `lint` / `test` | exit 0 / exit 0 / 132 files, 1474 tests pass |
| 5 | `pnpm -C apps/web build:cf` (gate:content + build + scan:out) | exit 0, 14281 pages, scan-out `pass: true`; `out/en/textbook/technology-14-37-u03.html` has the 3 marks as `<span lang="ja" data-inline="jp">整数型</span>` (`○…: functionName(…: name), where … is`); ja/zh pages 0 such spans (zh intentionally unmarked); raw `[[jp:` in out/ HTML = 0 |
