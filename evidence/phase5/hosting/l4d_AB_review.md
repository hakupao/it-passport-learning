# L4-d round A + B — Rule D 独立 review (D-230)

> Reviewer: oh-my-claudecode:critic (writer とは別 agent)。対象 = 作業ツリー vs HEAD `947513c1` の round A (UI) + B (textbook)。
> 作業ツリーには round C (quiz、`scripts/l4d-quiz-apply.ts`・`data/ip/quiz/**`・`l4d_quiz_apply.json`) も途中で入っているが、本 review の対象外。
> 実行した確認はすべて読み取り / dry-run (merge dry-run は gitignored の `.planning/v2/<unit>/merged.json` だけを書く)。

## 判定: データと仕組みは PASS。commit は MEDIUM-1 (試験の修正) が条件。MEDIUM-2 は推奨で、commit の条件にはしない (HIGH 0 / MEDIUM 2 / LOW 6)
置換そのものは機械的に正しく、意味の抽検は 20/20 PASS。MEDIUM-1 は試験の正規表現 1 行の修正で、データは変わらない。
判定が対象とする状態: 2026-11-15 23:13 の作業ツリーのうち A+B のファイル (tracked 65 + l4d_AB.md + l4d_textbook_apply.json)。handback 直前に diff を取り直した (82 欄、zh 以外の変更 0 / ・→、/， 以外の変更 0 / `[[jp:]]` の変更 0、試験の不変量 0 件)。

## 1. 意味 (Rule A、N = 20)
- 母集団: textbook の変更欄 82 (= HEAD との欄単位 diff: content 62 + 派生の追従 11 + title_zh 4×2 + unit_summary_zh 1) + zh.json 9 文 = 91。
- 母集団は `l4d_textbook_apply.json` ではなく、reviewer 自身が取った HEAD との diff。報告の `fields` 62 件 (unit, path, before, after) を diff と突き合わせると、62/62 一致。
- 抽出: id (`<unit> <path>` / `zh.json <key>`) を辞書順に並べ、mulberry32(seed = 230) の Fisher–Yates で shuffle、先頭 20。

| # | 欄 | after | 判定 |
|---|---|---|---|
| 1 | management-12-31-u01 pairs[0].rows[1].b_zh | 经营者、业务负责人 | PASS |
| 2 | strategy-04-13-u03 terms[2].fig.data.rows[0].cells[0].zh | 姓名、年龄 | PASS (見出し。同じ表の cell「森健太，38 岁」とも整合) |
| 3 | strategy-05-16-u01 terms[0].fig.data.cols[2].zh | 买方、使用方 | PASS |
| 4 | strategy-03-09-u05 terms[6].memory_hook_zh | 把 E、S、G 换成地球（环境）、人（社会）、公司内部（公司治理）… | PASS (2 つの列挙は別成分、入れ子ではない) |
| 5 | zh.json Practice.scope_topic | 大类、领域 | PASS |
| 6 | strategy-03-09-u05 summary.memory_hooks_zh[6] | ESG 投资：把 E、S、G 换成… | PASS (#4 の派生) |
| 7 | zh.json Mock.cell | …{已答}…{，已标记} | PASS (付加なので ，が正しい) |
| 8 | strategy-03-09-u05 terms[6].hook_zh | 把 E、S、G 换成… | PASS |
| 9 | unit_index topics[1].units[1].title_zh | 原因分析、管理、系统的结构化图表 | PASS (「系统的」= 系統図 の訳の硬さは施工前から) |
| 10 | strategy-05-16-u04 …root.children[0].label.zh | 支付、转账（例：智能手机支付） | PASS |
| 11 | management-11-30-u01 terms[2].fig.data.nodes[2].label.zh | 自备发电装置启动、输出稳定 | PASS (顺序の 、 も clreq の用法内) |
| 12 | strategy-05-16-u04 pairs[1].rows[1].a_zh | 支付、汇款、投资 | PASS |
| 13 | strategy-03-09-u04 terms[2].fig.data.nodes[3].label.zh | 取得经营权、参股 | PASS |
| 14 | zh.json Practice.backBrowse | ← 大类、年度一览 | PASS |
| 15 | strategy-03-09-u04 terms[3].fig.data.nodes[2].label.zh | 批发、物流 | PASS |
| 16 | strategy-03-10-u02 overview_cols_zh[0] | 视角、轴 | PASS |
| 17 | technology-13-34-u06 overview_rows[2].extra_zh[0] | 关联、关系 | PASS |
| 18 | zh.json Glossary.searchPlaceholder | 搜索术语（日本語、中文、English） | PASS |
| 19 | strategy-03-09-u01 terms[4].memory_hook_zh | V、R、I、O 是关卡的顺序。… | PASS |
| 20 | management-08-25-u01 terms[1].fig.data.rows[1].cells[0].zh | 可靠性、可用性 | PASS |

結果 20/20 PASS。抽検の外も 91 件すべて読んだ。指摘は MEDIUM-2 と LOW-1/LOW-2 のみ。

## 2. 網羅性 / 範囲の逸脱
- HEAD との欄単位 diff (30 unit ファイル + unit_index): 変わった欄 82。**zh 以外の欄の変更 0**、**・ → 、/， 以外の字の変更 0**、**`[[jp:…]]` の中身の変更 0**。， はちょうど 1 欄 (strategy-04-13-u03 の例外) だけ。
- 行頭の箇条記号 (D-230 §2 → •) にあたる ・ は textbook の変更欄に 0 (改行 / `<br>` / 全角空白の直後や欄頭の ・ なし)。なので ・ → 、 一律でも §2 に反しない。
- 施工後に zh 欄 (units + unit_index) で `[[jp:]]` の外に残る ・: ガント図 (management-10-27-u02 terms[3]「ガントチャート」、fig.kind = table) 26。値をすべて読み、内訳は単独の「・」の cell 25 と凡例「工作（□计划 ■实际 ・无工作 ◆里程碑）」1 で、並列の ・ は隠れていない。派生欄の括弧内の日本語原名 7 欄 (strategy-01-01-u04 terms[1].definition_zh、strategy-02-07-u04 terms[0].explanation_zh、strategy-03-10-u01 terms[1].definition_zh、strategy-06-21-u01 terms[7].definition_zh、strategy-07-24-u01 terms[3].definition_zh と summary.key_points_zh[3]、technology-23-62-u07 terms[3].definition_zh)。どれも compatText が `[[jp:]]` から作る（日本語原名）なので残すのが正しい。それ以外は 0。
- zh を含むのに `_zh` / `.zh` で終わらないキーは 0 (走査の取りこぼしはない)。mermaid / figure_description / source_figures の ・ は日本語欄 (範囲外)。

## 3. 仕組み
- merge dry-run (`--journal` に全ての journal.*.jsonl): strategy-06-19-u01 / strategy-04-13-u03 / management-12-31-u01 / strategy-03-09-u01 は exit 0、merged == units (差 0)。technology-21-56-u01 は exit 1、差は `title_zh` だけ (merged 「…插入・更新…」/ units 「…插入、更新…」、invariant `title_zh ≠ index`)。p07/p08 は適用され unit_summary_zh は一致。題名だけ直した 3 単元 (strategy-01-02-u02、strategy-03-12-u02、technology-14-37-u02) も、invariant の title_zh だけで exit 1 (C18 と同じ既知の状態)。
- patch ファイル 27 個はすべて追記だけ (削除行 0)。retire 0、合成 0。
- `tbjp-apply.ts --round l4d` を plan で再実行すると 0 単元 / 0 欄 → 冪等。
- コード:
  - `[[jp:` の深さ追跡: units にある inline mark は `[[jp:` の 1 種類だけ (10,435 個)、中に `]` を含むものもないので正しい。`]]` は depth > 0 のときだけ下げる。
  - `DERIVED`: merge の派生式 (definition / explanation / memory_hook / overview.intro / summary.key_points / summary.memory_hooks) と一致。トップレベルの `key_points_*` は元データなので含めないのが正しい。`inline_quiz` (= quiz の写し) は含まれないが、quiz 側に ・ があった場合は「merged differs outside the targets」で throw する (安全側に落ちる)。
  - `dotOnly`: LOW-4 を参照。
  - `L4D_EXACT`: 適用後は `!o.includes("・")` で先に return するので、再実行しても throw しない。

## 4. 試験
- `npx vitest run src/__tests__/messagesZhJpWords.test.ts src/lib/textbook` → 14 files / 179 tests PASS。全体 `npx vitest run` → 132 files / 1477 tests PASS (round C の途中状態を含む作業ツリーでの結果)。
- `lang-leak-scan.ts --gate` → PASS (498 項目、punct-only 431。writer の 437 との差は作業ツリーに入っている round C の分)。
- cleanup-pins の新しい不変量を HEAD のデータで再現 (同じ strip / walk / ガント除外を scratch script で実行): **69 欄で失敗** → 退行は確かに捕まえる。ただし MEDIUM-1 を参照。

## 5. 許可リスト
- `l5-build-allowlist.ts` dry-run: claimed 633 → 498 項目、unclaimed 0、new 0、dropped 0。`Mock.randomLead` の text 正規表現 `^・?(…)系?$` は ・ なしの新しい値も受け付ける。`locale-name` の value は新しい zh の文だけに一致し、en の ・ はそのまま。PASS。

## 指摘

### MEDIUM-1 — cleanup-pins の括弧の除外が広すぎ、HEAD の 13 欄 (括弧の中に ・ がある欄すべて) を見逃す
`cleanup-pins.test.ts` の strip にある `[（(][^（()）]*[゠-ヿ぀-ゟ][^（()）]*[）)]`。片仮名の範囲 `゠-ヿ` (U+30A0–30FF) が **・ (U+30FB) 自身を含む**ので、・ を含む括弧はどれも「日本語原名」とみなされて取り除かれる。HEAD で再現すると 82 欄中 69 欄だけが失敗し、次の 13 欄は通ってしまう: unit_index の TQC・TQM 題名と 插入・更新 題名、strategy-03-12-u02 / technology-21-56-u01 の title_zh、technology-21-56-u01 の unit_summary_zh、management-12-31-u01「规划（信息化战略・计划）」、strategy-01-02-u01「调查方法（询问・多人）」×3 と「（数量・比例）」、technology-13-35-u02「处理对象（信息・字符）」、technology-13-35-u03「量词（∀・∃）」×2。今の値は正しい。題名は validate の invariant で `--write` が止まり、summary は p07/p08 で補丁済みなので、今すぐ戻る経路は確認していない。問題は、括弧の中に新しく ・ が入っても (再生成、新しい補丁、直接編集) この試験では捕まらないこと。コメントに書かれた「・ の退行を赤にする」という狙いを、括弧の中については果たしていない。
- 修正案 (scratch で確認済み): 括弧を取り除くのを DERIVED の欄だけにし、kana の条件は外す (compatText が（原名）を作るのは派生欄だけ)。下の snippet をそのまま scratch で実行すると、HEAD では 81 欄が失敗 (見逃しは派生の explanation_zh 1 欄だけで、その元の detail_zh は捕まる)、作業ツリーでは 0。呼び出し側も `strip(o, p)` に変える:
  ```ts
  const DERIVED = /(^|\.)(terms\[\d+\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))_zh(\[\d+\])?$/;
  const strip = (s: string, p: string) => { const t = s.replace(/\[\[jp:[^\]]*\]\]/g, ""); return DERIVED.test(p) ? t.replace(/[（(][^（()）]*[）)]/g, "") : t; };
  ```
  (`[゠-ヺー-ヿ]` のように kana の範囲から U+30FB だけ外す案も試したが、strategy-01-01-u04「（財務・資産・人事・情報管理）」と strategy-03-10-u01「（販売・製品・仕入計画）」が漢字だけの日本語名なので失敗する。)

### MEDIUM-2 — technology-21-56-u01 の題名「数据操作的基础（插入、更新与抽取的关系运算）」は、誤った読みのほうが自然
中国語の「A、B与C的X」はふつう 3 項が並ぶ形 ([插入、更新与抽取]的关系运算) と読まれ、「插入・更新も関係演算」と取れてしまう。この単元が区別させたいのはまさにその点 (overview_rows: 挿入・更新 = 書き込み、選択 = 関係演算)。en は “Insert/Update and the Relational Operations for Retrieval”、unit_summary_zh は「（行的插入、更新），以及负责数据抽取的关系运算」で曖昧さがない。・ のときも曖昧だったが、・ は見た目で「插入・更新」を 1 組にまとめていた。D-230 §1 の「入れ子は個別判断」に当たる。
- 修正案: title_zh を「数据操作的基础（插入与更新，以及用于抽取的关系运算）」などにし、units と unit_index.json の両方を直接直す (題名は直接編集の型なので費用は小さい)。

### LOW
1. Practice.lastLabel「上次：{scope}、{count}、{order}」: 単元が見つからないときの fallback では {scope} が scope_topic「大类、领域」になり、「上次：大类、领域、10 题、随机」と区切りが入れ子になる (`PracticeSetup.tsx:132-137`、ふだんは通らない経路)。気になるなら fallback を「领域」1 語にする。
2. strategy-01-02-u01「调查方法（询问、多人）/（询问、少数人）/（观察、现场）」: 並列語というより属性 2 つ (方法 × 規模)。、 でも読めるので許容。直すなら「（询问，多人）」。
3. `zh_terms.json` の値と、そこから作られる派生欄の中国語では U+00B7 が並列に使われている (「财务·资产·人事·信息管理」「销售·产品·采购计划」)。D-230 の根拠 (间隔号 = 外国人名 / 日付) からすれば同じ種類の問題だが、D-230 が扱うのは U+30FB だけなので範囲外。OQ か後続の項目として登録を推奨。
4. `dotOnly` は `[...a]` (code point) と `b[i]` (UTF-16) を混ぜて添字にしている。サロゲートペアの後ろでは添字がずれるが、結果は誤検出の throw (安全側) にしかならない。また ， はどの欄でも許されるが、実際に作られるのは L4D_EXACT の 1 欄だけ。厳密にするなら例外の欄だけ ， を許す。
5. 試験のガント除外 `u.terms[3].fig = null` は添字決め打ち。term の順番が変わると、別の term の図を黙って除外する。`terms.find(t => t.term === …)` か `fig.kind === "gantt"` で選ぶほうが固い。
6. 記録の数字: l4d_AB.md の「26 単元」は patch を登録した単元の数。変わった unit ファイルは 30 (題名だけ直した 3 単元 + technology-21-56-u01)。「派生欄の括弧内 6」は欄で数えると 7 (2. の一覧)。commit 前に l4d_AB.md を直すと監査で追いやすい。あわせて round C の途中ファイルを A+B の commit に混ぜないこと。
