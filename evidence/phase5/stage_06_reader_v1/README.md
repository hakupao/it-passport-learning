# Stage 6 v1 — 教科書リーダー 検証証拠 (Session 85, 2026-06-08)

> Scope: D-019 Q1 = 教科書リーダー(244 unit 上線)のみ。Quiz/Glossary/Tutor は後続サブ段階。
> Decision: **D-133**(自作 `data/ip/textbook/` のみ in-repo、IPA 由来は gitignored 維持)。
> 粒度: 精簡 v1(per-locale 単語表示、テーマ shell は既存 chrome を継承、quiz/source 図は繰延)。

## 1. D-133 gitignore cascade(検証済)

`git check-ignore` で確認:
- TRACKED ✓: `data/ip/textbook/{unit_index.json, units/*.json, figures/}`
- IGNORED ✓: `data/ip/{exams,sources,syllabus}`、`textbook/{.omc,.planning,*.pilot.json}`
- would-add 655 件(244 unit + 409 SVG + unit_index.json + figure_index.json)、作業中間物の漏れ 0。

## 2. データ層 TDD(`reader.ts` + `reader.test.ts`)

`npx vitest run reader.test.ts` → **16/16 PASS**。純関数を網羅:
- `toDataLang`: app locale `ja`→corpus suffix `jp` のブリッジ(+ unknown→jp フォールバック)
- `buildNav(index, locale)`: D-114 path 順、unit_order 保持、ghost unit_id 防御的除外、未知カテゴリ末尾追加、**per-locale ラベル解決**(unit title + major/medium)、**小分類 name は全 locale JP 固定(OQ-03)**、blank→jp フォールバック
- `neighbors`: unit_order ベース prev/next + topic 名
- `pick`/`pickList`/`pickTerm`: per-locale 抽出、欠落は空文字列、term headword の jp 特例

## 3. 静的検査

- `tsc --noEmit`: **clean**(0 error)
- `eslint`(textbook+nav): **0 error**(1 warning は未変更の既存 `RetroGlossary.tsx`)
- `vitest run`(全体): **434 passed / 2 skipped**(新 reader 16 + 既存 validate 9 含む)

## 4. 本番ビルド(`next build --turbopack`)

- exit **0**、build traces 収集済(tracing 設定有効)。
- ルート生成: `/[locale]/textbook` = `●` SSG(3 locale 静的生成 = **ビルド時に実データ読込成功**)、`/[locale]/textbook/[unitId]` = `ƒ` Dynamic。
- **nft トレース検証**(`.nft.json` 実検査、両ルート): `units=244 / svgs=409 / unit_index=1`、**`EXAMS=0 SOURCES=0 SYLLABUS=0`**(IPA 著作物の bundle 混入なし)。当初 exams 2469+sources 61 件が leak していたのを writer 独自検証で捕捉・修正(`rule_d_review.md` 参照)。

## 5. 実データ統合スモーク(auth 不要・ローダ直叩き)

- index: **63 topics / 244 units / 1417 terms**(stats 一致)、3 カテゴリ全在。
- technology/management/strategy 横断 3 サンプル unit: 三語フィールド全**非空**。
- disk: 244 unit ファイル + 409 SVG。

## 6. ランタイム描画(`next start` :3100、middleware は i18n のみ・local auth 無)

HTTP status: `/ja/textbook` `/zh/textbook` `/en/textbook` `/ja/textbook/<unit>` = **全 200**。
- TOC: カテゴリ見出し localized(ja=テクノロジ系/マネジメント系/ストラテジ系、en=Technology/Management/Strategy)、topic 名、244 unit リンク、badge、用語数。
- Unit(ja): sectionTitle 概要/用語/まとめ、fieldLabel たとえ/記憶フック ×5、**SVG 2 枚 inline**、deferNote 表示、pager prev/next 動作。
- Unit(en): **per-locale 切替動作**(Overview/Terms/Summary + 英語 gloss "Functional requirements" 等)。

### Screenshots
- `toc_ja.png` — TOC ja(nav に「教科書」タブ先頭アクティブ、gamified shell 内クリーン読書面)
- `toc_zh.png` — TOC zh(unit タイトル + グループ見出し中国語化、小分類 JP 固定=OQ-03)
- `unit_ja.png` — unit 全体(4 段構造 + SVG 2 枚 inline)
- `unit_en.png` — en 版(per-locale)

## 6.5 ToC i18n enrichment(b-cheap、Session 85 後半)

OQ-03 対応で **ToC を per-locale 化**(LLM 不使用の決定的データ結合):
- `scripts/enrich-toc-i18n.mjs`: 各 unit に `title_zh/title_en`(unit JSON から)+ 各 topic に `major_zh/en`・`medium_zh/en`(knowledge_tree から topic_id 階層結合)を **追加のみ**で enrich。
- **invariant 検証**: old vs new クリーン diff = **追加キーのみ・順序/既存値完全保存**(`major_zh/en`/`medium_zh/en` topic + `title_zh/en` unit)、fallback **0**(63/63 topic + 244/244 unit が結合解決、安全網は不発火)。
- `reader.ts`: `buildNav(index, locale)` がローカライズ済 nav を返す(`localized()` で jp フォールバック)。
- runtime: zh ToC = unit「二进制数与基数」/ major「基础理论」翻訳、**小分類「離散数学」は JP 固定**(OQ-03)。en 同様。ja 回帰なし。screenshot `toc_zh.png`。
- reader test **16/16**(locale 解決 + OQ-03 JP固定 + blank fallback 追加)。

## 7. 既知の非ブロック事項

- `/`(→ /quiz リダイレクト)は **500**。原因 = `_fixtures/v1.0.3/index.v2.json` 欠落(S63 で削除済)。**Stage 6 と無関係の既存事項**で、後続「Quiz 接過去問」サブ段階の対象。教科書ルートは独立で全 200。
- **小分類 topic 名(name_jp)は全 locale で JP 表示**(OQ-03、意図的)。corpus にも IPA シラバスにも訳語が無い公式分類名。unit タイトル・グループ見出し・unit 内容は per-locale 化済。63 名の翻訳は要 LLM+Rule A で後続候補。
- inline_quiz/challenge/source_figures は D-133 で繰延(loader は null 降級)。

## 8. Rule D 独立レビュー(writer=general/main ≠ reviewer=oh-my-claudecode:code-reviewer)

→ `rule_d_review.md` 参照。
