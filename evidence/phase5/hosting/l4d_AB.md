# L4-d round A (UI) + B (textbook) — zh「・」(U+30FB) → 顿号「、」(D-230)

> 規則と根拠: `docs/discussion/2026-11-15-session-157.md` § L4-d (D-230)。W3C clreq §5.1 (2026-11-15 に curl で原文確認):
> 「顿号U+3001 IDEOGRAPHIC COMMA [、]使用于并列连用、表示次序的字词之间」「U+30FB KATAKANA MIDDLE DOT [・]来自日文JIS编码，并非中文编码，不建议使用」。
> 施工記録: `l4d_textbook_apply.json` (B の全欄 before/after・補丁登録・merge 前後の差)。

## 棚卸し (施工前、`lang-leak-scan.ts` report の punct-only 574 + 走査外の 1)
| 層 | zh | en |
|---|---|---|
| quiz 解説 | 233 | 10 |
| quiz 訳 | 127 | 8 |
| textbook content | 120 | 26 (ガント図) |
| textbook derived | 31 | — |
| UI | 10 (+1: `Mock.randomLead`、片仮名に挟まれ R-zh-kana 側で数えられていた) | — |
| unit_index | 8 | — |

## A — UI (`apps/web/messages/zh.json`、9 文)
| key | 前 | 後 |
|---|---|---|
| Glossary.searchPlaceholder | （日本語・中文・English） | （日本語、中文、English） |
| Practice.scope_topic / browseTopics | 大类・领域 | 大类、领域 |
| Practice.lastLabel | {scope}・{count}・{order} | {scope}、{count}、{order} |
| Practice.browseLink / browseTitle / backBrowse | 大类・年度 | 大类、年度 |
| Mock.cell | {・已标记} | {，已标记} (en の ", marked" に合わせる、並列ではなく付加) |
| Mock.randomLead | 35 题・マネジメント系 20 题・テクノロジ系 | 35 题、マネジメント系 20 题、テクノロジ系 |
- 試験 (`messagesZhJpWords.test.ts`、先に赤 2 → 緑): zh.json の ・ = 0、`{，已标记}` あり、`大类、领域` あり。
- 許可リスト: `locale-name` 類の値を新しい文に (`l5-build-allowlist.ts`)、`Mock.randomLead` の 2 項目は文字列が「・マネジメント」→「マネジメント」に変わっただけ (同じ D-189 判断) → `--write --accept-new`、498 項目のまま。

## B — textbook
- `scripts/tbjp-apply.ts --round l4d`: zh の content 欄 (派生欄・title・unit_summary を除く) で `[[jp:…]]` の外の ・ を 、 に。除外 = management-10-27-u02 terms[3] のガント図 (凡例「・无工作」と cell 25 個、zh / en とも記号として維持)。例外 1 = strategy-04-13-u03 の人物表「森健太・38 岁」→「森健太，38 岁」(姓名と年齢は並列語ではない)。
- 不変量 (script が全欄で強制): before と after は同じ長さで、違う字は ・ → 、/ ， だけ。派生欄 (memory_hook / summary / explanation) は merge が再派生し、その差も同じ置換だけのときに限り units/ へ書く。
- 結果: 26 単元・62 欄・62 補丁 (retire / 合成 0)、派生の追従 11 欄、全単元で merge-vs-units の差が施工前と同じ。merge の exit は 25 単元 0→0、1 単元 1→1 (施工前から)。
- 題名 (直接編集、C18 の型): strategy-01-02-u02・strategy-03-12-u02・technology-14-37-u02・technology-21-56-u01 の `title_zh` を units と `unit_index.json` の両方で。merge は manifest.v1 から旧題名を組むので dry-run で invariant 不一致 (exit 1) になる — C18 と同じ既知の状態、`cleanup-pins.test.ts` の新しい不変量で `merge --write` による巻き戻しを赤にする。
- unit_summary_zh (technology-21-56-u01): unit-level B3 補丁 p07・p08 (`--manifest`)、merge dry-run の値を in-place (書込み後の merge-vs-units 差 = title_zh だけ)。
- 試験: `cleanup-pins.test.ts`「L4-d: no zh field … uses ・ outside Japanese names / the Gantt symbol」(先に赤 → 緑)。
- 維持したもの (施工後の punct-only 残り、textbook): ガント図 52 (zh/en)、派生欄の括弧内の日本語原名 6 (財務・資産・人事・情報管理 等、`[[jp:]]` から compatText が作る（…）)。`[[jp:]]` 内の日本語名 (クーリング・オフ、サイバー・フィジカル・セキュリティ… 等) は走査の punct-only に入らない。

## gates
- `lang-leak-scan.ts --gate` PASS、`lang-leak-scan.test.ts` 22/22、vitest textbook 175・全体は commit 前に再実行。
- 施工後の punct-only: 574 → 437 (残りは quiz 層 = round C、textbook の維持分)。

## Rule D (critic opus、`l4d_AB_review.md`) と対応
- 判定: データ・機構 PASS、HIGH 0 / MEDIUM 2 / LOW 6。Rule A 標本 N = 20 (mulberry32 seed 230) 20/20 PASS、母集団 91 欄 (units 82 + zh.json 9) も全て読了。
- MEDIUM-1 (pin 試験の括弧の免除が広い: 片仮名範囲 U+30A0–30FF が ・ 自身を含み、・ の入った括弧が全部外れる) → **修正**: 括弧の免除は派生欄だけ、仮名条件なし (reviewer 案)。変異確認: strategy-03-12-u02 の題名を「（TQC・TQM」に戻すと赤、戻すと緑。
- MEDIUM-2 (technology-21-56-u01 題名「（插入、更新与抽取的关系运算）」が「插入・更新も関係演算」と読める) → **修正**: 「数据操作的基础（插入与更新，以及用于抽取的关系运算）」(units + unit_index)。ja「データ操作の基本(挿入・更新と抽出の関係演算)」の区別 (挿入・更新 / 抽出の関係演算) どおり。
- LOW-5 (試験のガント図の除外が terms[3] 固定) → 凡例「・无工作」で図を見つけるよう修正。
- LOW-6 (数の訂正): 変化した units ファイル = 30 (補丁を登録したのが 26、題名だけ 3 + technology-21-56-u01 は両方)、派生括弧の維持 = 7 欄。punct-only 431 は round C の 6 を除いた数で、writer の 437 は C 着手前の計数。
- LOW-3 (zh_terms と派生欄の U+00B7「·」による並列: 财务·资产… — 同じ種類の問題だが D-230 の範囲外) → **OQ-25** に登録。
- LOW-1 (Practice.lastLabel の fallback が「大类、领域、10 题…」と入れ子に、通常は通らない経路)・LOW-2 (「询问、多人」は属性 2 つで許容)・LOW-4 (dotOnly の code point / UTF-16 混在は誤 throw 側で安全) → 変更なし。
