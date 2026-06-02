# Stage 4 step3 — schema 落地体検 evidence

> Session 81 / 2026-06-02 / Phase 5 Stage 4 (実施阶段)
> 目的: pilot 12 unit を web app 最小阅读視図に接続し、JSON デシリアライズ / 三語 / 図 / quiz ID 参照 を UI + バリデータで核験。schema 問題を 12 unit で発見 (≫ 250)。

## 検証対象データ

- `data/ip/textbook/units/*.json` (12, schema `stage4-unit-v1-trilingual`)
- `data/ip/textbook/unit_index.pilot.json` (3 topic / 12 unit / 68 term)
- `data/ip/textbook/figures/*.svg` (生成 Mermaid→SVG, 19)
- `data/ip/exams/figures/*.png` (原裁剪図 溯源, source_figures 参照先)
- `data/ip/exams/question_bank.json` (2900, inline_quiz/challenge 解決先)

## 実装 (harness, commit 対象)

| file | 役割 |
|------|------|
| `apps/web/src/lib/textbook/types.ts` | schema 忠実 TS 型 (UnitIndex / TextbookUnit ほか) |
| `apps/web/src/lib/textbook/loader.ts` | gitignore data から server 直読 (TEXTBOOK_DATA_ROOT, 既定 `../../data/ip`)。SVG inline / PNG base64 / qb id Set |
| `apps/web/src/lib/textbook/validate.ts` | `validateContent` (純粋) + `validateUnit` (disk)。三語完整性 / summary 非空・要素非空 / 図解決 / quiz 解決 |
| `apps/web/src/components/textbook/Trilingual.tsx` | 三語同屏 field/list レンダ |
| `apps/web/src/components/textbook/UnitDetail.tsx` | 4段構造 (概要/用語/まとめ/チャレンジ) + 図 inline + quiz chip |
| `apps/web/src/components/textbook/SchemaReport.tsx` | index + 集計 schema レポート表 |
| `apps/web/src/components/textbook/textbook.module.css` | 朴素スタイル |
| `apps/web/src/app/[locale]/textbook/page.tsx` | index route (force-dynamic) |
| `apps/web/src/app/[locale]/textbook/[unitId]/page.tsx` | unit detail route |
| `apps/web/src/lib/textbook/__tests__/validate.test.ts` | バリデータ no-false-OK 証明テスト |

## 検証結果

### 1. ビルド/型/lint
- `pnpm build` (next build --turbopack) **exit 0**。`/[locale]/textbook` (●) + `/[locale]/textbook/[unitId]` (ƒ) ルート table に出現。
- `tsc --noEmit` clean (textbook 関連エラー0)。
- `eslint` clean (textbook 全 file)。

### 2. ランタイム (dev server, curl)
全ページ HTTP 200。schema レポート banner = **✓ SCHEMA OK**:

```
errors 0 · warnings 0 · lang-complete 12/12 · generated figs 19/19 · source figs 8/8 · quiz refs (全) resolved · dead 0
```

| 核験項目 | 結果 |
|---------|------|
| JSON → 厳格 TS 型 デシリアライズ | 12/12 成功 (型不一致0) |
| 三語フィールド完整性 (jp/zh/en) | 12/12 lang-complete、欠落/空 0。例 strategy-02-04-u01 = JA37/ZH37/EN37 均衡 |
| 生成 Mermaid SVG inline レンダ | 19/19 解決 (`<svg` content sniff 通過) |
| 原裁剪 PNG base64 inline | 8/8 解決 (technology-16-43-u01 = 3 source 図 表示確認) |
| quiz ID 参照解決 (inline_quiz + challenge) | 全参照 question_bank.json に解決、dead 0 |
| unit 級 issue panel | 12/12 「✓ no issues」 |

### 3. 視覚核験 (screenshots/)
- `stage4_step3_index.png` — SCHEMA OK banner + 12行全緑 table + 3 topic card。
- `stage4_step3_unit_strategy.png` — 三語ブロック (JA/ZH/EN ラベル) + Mermaid SVG 2枚 + 3列まとめ + 緑 quiz chip。
- `stage4_step3_unit_technology.png` — 三語 + 生成図 + **source_figures の原 PNG 表示** + 「no issues」。

> 注: 初回 screenshot は `pnpm build` を dev server 稼働中に同時実行し `.next` が衝突 → 500 で汚染。fresh dev server で再取得し console error 0 (Vercel analytics debug log のみ) を確認した上で採用。

### 4. バリデータ信頼性 (Rule D 指摘対応)

独立 code-reviewer (Rule D, 別 subagent_type) が **false-OK 2件 (HIGH)** を検出:
1. summary 配列が三語とも空 (`[]`) でも長さ一致のため無検出 → SCHEMA OK 詐称。
2. summary 配列要素が空文字 (`["",""]`) でも無検出。

修正 (validate.ts):
- summary: 長さ一致に加え **全言語空** + **要素空/非文字列** を error 化。
- `est_minutes` (有限>0) / `freq_badge` (非空) を error 検査。
- `lang_status != generated` を warn→**error**。
- source PNG 未解決を warn→**error** (dangling ref、dead quiz id と整合)。
- terms 空配列を error。quiz refs を Set 去重。
- `langComplete` を純粋 `contentComplete` フラグ由来に (doc と挙動一致)。

証明テスト `validate.test.ts` (純粋 validateContent、inline fixture、**disk 非依存=CI安全**): **9/9 PASS**。
- vector #1 (全言語空配列) → error ✓
- vector #2 (空要素) → error ✓
- 長さ不一致 / term_zh 欠落 / explanation_en 空白 / terms 空 / est_minutes 不正 / lang_status pending → 各 error ✓
- clean unit → 0 error + contentComplete true ✓

修正後の実 pilot 再検証: なお **SCHEMA OK** (false-FAIL 無し)。

**Rule D 再 review (同 reviewer, 別 subagent_type) → APPROVE**: reviewer が独立に vitest 9/9 + tsc clean + 実 12 unit へ validateContent 再実行 (0 error/12-12) + 著者テスト外の 6 敵対パターン (partial-empty / blank-en-only / null要素 / summary欠落 / 非文字列要素) を自前検証 — 全捕捉。HIGH #1/#2 RESOLVED、残存 false-OK 経路なし、実 pilot に false-FAIL なし。判定「ship it for the 250+ corpus run」。

## Rule 適用

- **Rule A**: step3 は内容改写ではなくレンダ/構造核験のため重量級意味抽検は非該当 (内容の Rule A は Session 79 で実施済)。本 step の「意味」核験 = バリデータ + 9テスト + 視覚確認。
- **Rule B**: 失敗 (screenshot 汚染) は本 report §3 注に記録。技術的失敗で再取得により解消、別 attempt ファイル不要レベル。
- **Rule D**: writer = main agent (harness 実装) ≠ reviewer = code-reviewer subagent (opus, 別 subagent_type)。指摘→修正→再 review の写審分離ループ。
- **invariants 不変**: question_bank / knowledge_tree / answer_keys / textbook units 未改 (harness は読取専用、新規コードのみ)。

## Post-commit 安全审查 (path-traversal hardening)

commit a2851b9 後の自動 security review が `loadUnit(unitId)` に **path traversal (HIGH)** を検出 (`[unitId]` = user-controlled URL param、deployed app で本番露出)。却下せず修正:
- `loadUnit`: 厳格 allowlist `UNIT_ID_RE=/^[a-z0-9][a-z0-9-]{0,63}$/` (`.`/`/`/NUL 排除)。
- `loadGeneratedSvg`/`loadSourcePngDataUri`: `confineToRoot()` で resolve 後 root 内包確認 (脱出→null)。
- 検証: `loader.test.ts` 11 PASS (CI安全)、正規ページ SCHEMA OK 維持、traversal=404。

## 発見した schema 上の所見 (Phase B/Stage 6 への申し送り)

1. **全 Mermaid SVG が同一 id `my-svg`**: 1ページに複数 inline すると `<style>#my-svg{...}` が衝突しうる (全図同一テーマのため視覚影響は無いが、Stage 6 で本番表示する際は render script で id 一意化が望ましい)。
2. source_figures は `data/ip/exams/` 基準、生成 figure は `data/ip/textbook/` 基準で **基準ディレクトリが異なる** (loader で別解決済、Stage 6 データ層でも踏襲要)。
3. unit JSON は schema 通り 100% 健全 — Phase B 全量で同 pipeline を信頼してよい。
