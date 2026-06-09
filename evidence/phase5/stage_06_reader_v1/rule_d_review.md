# Stage 6 v1 — Rule D 独立レビュー記録 (Session 85)

- **Writer**: main (general) — 実装
- **Reviewer**: `oh-my-claudecode:code-reviewer` (opus, 別 subagent_type・別 session) — 写審分離成立
- **判定**: **VERDICT: APPROVE**(0 BLOCKER / 0 HIGH / 1 MEDIUM / 4 LOW)

レビュアーは claim を鵜呑みにせず独立再検証: `tsc --noEmit` exit0 / `eslint` 0 error / reader test 13/13 / **両ルートの `.nft.json` を実検査 → 657 corpus ファイル(unit_index.json + units/*.json + figures/*.svg)が serverless bundle に trace される事を実証** / 全 409 SVG の XSS スキャン(`<script>`/`javascript:`/`on*=` = **0 件**、`<foreignObject>` は良性 Mermaid label のみ) / 全 corpus 構造スキャン(NaN minutes 0 / 空 intro 0 / 欠落 SVG 0 / path escape 0)。

## Findings

| Sev | 内容 | 対応 |
|-----|------|------|
| MEDIUM | ToC タイトルが全 locale で JP 表示(index が name_jp/title_jp のみ保持)。カテゴリ見出しは翻訳されるため混在。**意図的 v1 lean**(file header に明記済) | **OQ-03 登録**(意識的 ship 判断に。後続で index に title_zh/en 付与) |
| LOW | `loader.ts` の `loadAllUnits`/`loadUnitIndex` が dead(pilot 対象・gitignored)。diff 外(loader.ts 未変更) | 据置(loader.test.ts 保護のため非削除、後続クリーン候補) |
| LOW | `**/*` glob が `.pilot.json` 残骸も bundle に trace(数 KB、無害) | **修正適用**: glob を消費資産(unit_index.json/units/figures)に絞り込み |
| LOW | SVG 信頼は corpus 不変条件依存(コードで非強制)。現状全 409 検証済だが将来 pipeline 変更で `<script>` 混入時に dangerouslySetInnerHTML 経由で実行され得る | backlog(生成 pipeline に `<script`/`on\w+=` 拒否 assert、or loadGeneratedSvg で runtime strip) |
| LOW | `generateMetadata` と body で `loadUnit` 二重読み(force-dynamic で毎req) | **修正適用**: reader の `loadUnit` を React `cache()` で包み req 内 dedupe |

## Positive(レビュアー指摘)
- pure/impure 分離が clean(buildNav/neighbors/pick*/toDataLang は I/O-free・13/13 test、disk loader は底部隔離)。
- buildNav の ghost unit_id 防御的除外(test 済)= broken-link artifact 防止。
- path-traversal 多層防御(route param 厳格 allowlist + figure path の confineToRoot、escape=null)。
- noUncheckedIndexedAccess 遵守、i18n 3 catalog lockstep + ICU 引数一致。
- RetroMenuBar のみ key cast を追加した判断が正確(他 2 shell は `as const` で narrowing 済のため cast 不要)= blanket cast せず差を理解。

## レビュー後の writer 対応(本 session、build 再検証つき)
1. next.config glob を消費資産に絞り込み(LOW: pilot/figure_index 残骸)。
2. reader.ts: `loadUnit` を `cache()` 化(LOW: generateMetadata 二重読み解消)。
3. reader.ts: **loader.ts 非依存の自己完結**化 + `textbookRoot()` を `data/ip/textbook` へ直接解決。
4. next.config: `outputFileTracingExcludes` で IPA 系(exams/sources/syllabus)明示除外。
5. MEDIUM を **OQ-03** として STATE/session log に登録。
6. LOW(SVG content invariant / loader.ts dead export)は backlog 記録。

## ⚠ レビュー後の独自検証で捕捉した重大事項(reviewer の nft カウントが見逃し)

レビュアーは「657 corpus files traced」と報告したが、これは **textbook ファイルのみ**を数えていた。writer が修正後に **独自に nft の `data/ip` 全軸を集計**したところ:

> `[unitId]` ルートの `.nft.json` に **`/data/ip/exams/` 2469 件 + `/data/ip/sources/` 61 件**(計 1.2GB の IPA 著作物)が trace されていた。

**真因**: `reader.ts` の `dataRoot()` が textbook の親 `data/ip` を base に返し、nft が動的パス構築を見て `data/ip/**` 全体を含めていた(loader.ts 由来ではない — 自己完結化後も残存して確定)。

**影響**: 本番(Vercel)は exams が gitignored で不在のため顕在化しないが、ローカルビルド出力に 1.2GB + IPA 著作物が混入する設計上の汚れ。

**修正**: ① `textbookRoot()` を `data/ip/textbook` 直接解決(中間 `data/ip` 除去)② `outputFileTracingExcludes` で IPA 系を明示除外。

**修正後の最終 nft(両ルート、`next build` exit0)**:
```
units=244  svgs=409  unit_index=1  | EXAMS=0  SOURCES=0  SYLLABUS=0
```
pilot=2(`unit_index.pilot.json`/`figure_index.pilot.json`)は nft の dir-scan 由来で local trace に残るが、**gitignored→Vercel 不在→本番 bundle に入らない**、極小ファイルで無害(exclude glob は code-traced ファイルに効かず、誤解防止のため pilot exclude 行は削除)。

→ 教訓(規則 A の精神): **単一 reviewer の PASS ≠ 全軸検証済**。reviewer は textbook 軸のみ集計しており、writer の独自全軸 nft 再検査が 1.2GB の著作物 leak を捕捉した。

## 最終フル検証(全修正後)
- `tsc --noEmit` exit0 / `eslint .` 0 error(1 既存 warning 無関係)/ `vitest run` **431 passed / 2 skipped** / `next build` exit0(両 textbook ルート生成)。
- runtime smoke(textbookRoot 変更後): `/ja/textbook` `/en/textbook/<unit>` = 200、SVG inline 2。
