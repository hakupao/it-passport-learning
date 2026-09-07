# 2018h30a page-12.png 破損 → 再生成 (Session 118)

## 問題

`data/ip/exams/pages/2018h30a/page-12.png` が 1432×1340px だった。同じ試験の他ページ
(page-11, page-13 など) は全て 1432×2026px @ 200dpi。

内容比較の結果、破損版は 問28 の題幹冒頭 3 行 ("問28　ソフトウェア開発に関するプロセスを，
企画プロセス，要件定義プロセス，プロ" / "ジェクト計画プロセス，システム開発プロセス，
ソフトウェア実装プロセスに分け" / "る。現行業務における問題を分析し，新しく導入する
システムによって問題を改善") が欠落しており、"する業務や新規の業務を明確にして，" から
始まっていた。ページ下部のフッター "－12－" も欠落。session 117 ログ (L466 付近) で
q028 の題幹冒頭行が画像に写っていないと指摘されていた。

原因はレンダリング時 (もしくは事後の切り抜き) の不具合と推定 (詳細未特定、再現調査は
本セッションのスコープ外)。

## 発見元

Session 118, page12-writer タスク (team-lead 発起)。

## 再生成方法

`data/ip/sources/exams/2018h30a_ip_qs.pdf` の PDF page 12 を `pdftoppm` で再レンダリング。
既存の他ページと同じ設定 (200dpi) を使用 — session 69 ログで「全 29 PDF を pdftoppm で
200 DPI PNG に変換」と記録されている方式に合わせた。PDF の page size (515.52×729.36pt)
は 200dpi で 1432×2026px に一致することを `pdfinfo` で確認済み。

```
pdftoppm -png -r 200 -f 12 -l 12 -singlefile \
  data/ip/sources/exams/2018h30a_ip_qs.pdf \
  <output-basename>
```

再生成後のサイズ: 1432×2026px @ 200dpi (他ページと一致)。内容は 問28 冒頭3行 + フッター
"－12－" を含む完全なページ。PDF page 12 = 問28-30 を収録しており、破損版に写っていた
問28後半/問29/問30 と内容が一致することを目視確認済み (問番号・選択肢とも同一)。

## 対応

- 破損版オリジナルをこのファイル名で保管 (Rule B: failures は削除しない)。
- `data/ip/exams/pages/2018h30a/page-12.png` (gitignored) を再生成版で上書き。
- 依存問題 (`2018h30a-q028` / `q029` / `q030`、`data/ip/exams/by_year/2018h30a.json` と
  `data/ip/exams/question_bank.json` で `source.page_image` = `pages/2018h30a/page-12.png`)
  はいずれも `has_figure: false` で `figure_bbox_pct` を持たない。図の再クロップは不要。

## 追記 (Rule D 審閲 HIGH follow-up 対応): q028 stem_jp 再抽出

Rule D 審閲で `2018h30a-q028` の raw `stem_jp` 自体が旧・破損 page-12.png からの再抽出
(`stem_resourced_s7x: true`) の残骸のままだったことが判明: 53字 (「する業務や新規の業務を
明確にして，…」から始まる断片) のみで、冒頭「ソフトウェア開発に関するプロセスを，企画
プロセス，要件定義プロセス，プロジェクト計画プロセス，システム開発プロセス，ソフトウェア
実装プロセスに分ける。現行業務における問題を分析し，新しく導入するシステムによって問題を
改善」が欠落していた。zh (117字) / en (486字) は元々完全、`translations/2018h30a.json` の
`stem_jp_clean` (163字) も既に完全文を保持しており (学習者表示は `stem_jp_clean` が上書き
するため実害なし)、新 page-12.png の実読でも完全一致を確認。

`scripts/quiz-stemfix-S118-2018h30a-q028.mjs` (assert-once, 冪等) で `stem_jp_clean` を正
として raw 層 (`by_year` / `question_bank`) の `stem_jp` を 53字 → 163字に是正、
`data/ip/quiz/.phase2/generate_result_2018h30a.json` の `key_guard.note_jp` (final のみ)
の旧記述「stem_jp は冒頭が欠落した腐敗版…」を是正済み記述に差し替え (`stemfix-S118` marker)。
`stem_jp_corrupted_backup` は Rule B により不変のまま保持。
`node scripts/build-quiz-corpus.mjs` で `questions.json` を再生成 (q028 の1行のみ差分)、
`node scripts/quiz-phase2-merge.mjs 2018h30a` で `explanations/2018h30a.json` を再生成。
`node scripts/quiz-keys-crosscheck.mjs` (A1–A7, B1–B6 全 GREEN) と
`pnpm vitest run src/lib/quiz/__tests__/quizCorpusInvariants.test.ts` (PASS) で確認済み。
