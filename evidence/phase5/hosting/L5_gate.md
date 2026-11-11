# L5 三言語混入の恒久関門 (Track L、PLAN_hosting_migration §3 L5)

- 日付 2026-11-11 (S154)。書き手 = oh-my-claudecode:executor (opus)。branch `hosting-cf`、**未 commit**。
- データ (`data/ip/**`)・`apps/web/**` には触れていない。書いたファイル:
  - `scripts/lib/lang-leak.ts` (規則・検出・関門の純関数)
  - `scripts/lang-leak-scan.ts` (収集 + `--gate` + 従来の報告)
  - `scripts/lang-leak-scan.test.ts` (node:test、18 件)
  - `scripts/l5-build-allowlist.ts` (許可リストの生成器)
  - `scripts/fixtures/lang-allow.json` (許可リスト 521 件)
  - この md
- Rule D の審査は未実施 (別の subagent_type で行うこと)。

## 結論 (先に)

- **現状の corpus では関門は exit 1 になる**。許可リストに入れなかった本当の混入が 3 件 (当たり 4) 残っている。
- それ以外の当たり 658 は、すべて理由付きの位置指定エントリで許可済み。
- 3 件を直せば PASS する。上の 4 当たりだけを足した模擬の許可リストで実測し、`lang-leak gate: PASS` を確認した。
- 直した後の手順は §5。

| # | 欄 | 規則 | 中身 | 直し方の案 |
|---|---|---|---|---|
| 1 | `apps/web/messages/zh.json` `Mock.colKey` | R-zh-jpword + R-same | zh「正解」。ja も「正解」だが en は "Key" で、D-189 (Practice の三言語共通ラベル) の外にある。S86 で zh の 正解 → 答案 を直した前例がある (L3 A30 と同じ型) | 「正确答案」または「答案」 |
| 2 | `data/ip/quiz/explanations/2015h27a.json` `2015h27a-q085.points[1].en` | R-en-cjk | "COUNTIF (条件计数)"。en の欄に簡体字の中国語 (计)。ja は 条件付個数、2014h26a-q093 の en は "(called 条件付個数 in the exam notation)" | "COUNTIF (条件付個数)" (試験の表記) か "COUNTIF" |
| 3 | `data/ip/quiz/translations/2022r04.json` `2022r04-q074.stem.zh` | R-zh-kana | 「尾随（共连れ）」。括弧の日本語原語に簡体字 连 が混ざった混成字形 (L4b の 稟议 と同じ型) | 「尾随（共連れ）」 |

- **1 は判定が割れている (要判断)**。
  - `L4_review.md` (Rule D、critic) の l.23 は「UI の 正解 (Practice.correct / Mock.colKey) は `70978b70` の三言語共通ラベル表にある → OK」としている。
  - しかし git の記録では違う。
    - `70978b70` (D-189) が触ったのは Practice の文言だけ (`git show 70978b70 -- apps/web/messages/*.json` で 正解 は Practice.correct のみ)。
    - `Mock.colKey` は後の `9f3478e7` (D-192 模試) で足された。そのとき ja / zh =「正解」、en = "Key" だった。三言語共通ではない。
  - L4-a の再発防止テスト `apps/web/src/__tests__/messagesZhJpWords.test.ts` は 分野 / 正答率 だけを見ていて、colKey には触れていない。
  - writer は「指示 2 の D-189 は key ごとに列挙」に従い、許可しなかった。D-189 として残すなら、`scripts/l5-build-allowlist.ts` の d189-label の Practice 行に `Mock.colKey` を足して `--write` すればよい (1 行)。
- 混成字形がこれ以外に無いことも確かめた。許可済み・失敗の連 533 件について、両隣に簡体字専用の字 (GB2312 にあり Shift_JIS に無い字) があるかを 1 回走査した。
  - 隣接は 14 件あった。うち 13 件は、単に中国語の文脈に接しているだけだった (商品か虽然…、以葉结尾 等)。
  - 本驹込 は中国語でも 驹込 と書く地名表記として許可した。
  - 字の中に混ざっているのは 共连れ だけだった。

## 1. 規則

| 規則 | 対象 | 関門 | 定義 (`scripts/lib/lang-leak.ts`) |
|---|---|---|---|
| R-zh-kana | zh | FAIL | 仮名の連。`[[jp:…]]` の中と、単独の選択肢記号 ア〜エ は除く |
| R-en-cjk | en | FAIL | 漢字・仮名の連。除外は同上 |
| R-ja-simp | ja | FAIL | 簡体字のみの字 (SIMP_ONLY 表、L2 と同じ) |
| R-empty | 全言語 | FAIL (許可不可) | 兄弟言語があるのに空欄・欠落 |
| R-same | zh / en | FAIL | ja と完全一致。データは 12 字超、**ui-messages は下限なし** (L3 の推奨) |
| **R-zh-jpform** (新) | zh | FAIL | 日本の字形の連。漢字で、GB2312 の外にあり、Shift_JIS の中にあるもの (図 応 検 対 過 問 説 …)。`[[jp:…]]` の中、および quiz の括弧内の原語は除く。〇 と 瞭 は中国語の字なので除く |
| **R-zh-jpword** (新) | zh | FAIL | 日本語の語の表 (下記)。`[[jp:…]]` の中は除く |
| R-zh-jpword-ctx (新) | zh | WARN | 語表のうち、文脈で意味が変わる語幹と、括弧の原語でしか出ない語 |
| R-ja-latin-run | ja | **WARN** (降格) | 2 字以上の英単語が 6 語以上並ぶ (以前は 1 字の語も数えた) |
| punct-only | zh / en | 別に数える (失敗にしない) | 連が ・ / ー だけ |
| (範囲の除外との関係) | | | R-empty と R-same は範囲の除外 (derived 等) でも隠さない。glossary / TodayTerms は derived 欄を表示するため (test あり) |
| messages のキー集合 | ui | FAIL | zh / en の葉キーの集合が ja と完全に一致すること。欠け・余りの両方向を見る (`keySetDiff`) |

- 当たりの単位を、L2 の「1 欄 1 当たり」から「1 連 (語なら 1 出現) 1 当たり」に変えた (advisor の指摘)。
  - 欄単位のままだと、許可済みの欄に新しい混入が入っても見えない。
- quiz の括弧のマスク (jpform のみ): （…）(…)「…」『…』“…” の内側を伏せる。
  - 入れ子は内側から処理する。
  - 中に簡体字専用の漢字 (GB2312 にあり Shift_JIS に無い字) を含む括弧は中国語として伏せない。例:「日语称…」を含む括弧、“稟議系统”。
  - 仮名と漢字の規則 (R-zh-kana / R-en-cjk) では括弧を伏せず、各原語を許可リストに 1 件ずつ入れた (指示どおり「一律の規則」にしない)。

### R-zh-jpword の語表 (`JP_WORDS`)

出典は `L4b_wordlist.md` の採用表 + 传票 / 决裁 (L4 review M-4)。

- **FAIL** (現在の出現は、すべて理由付きの許可エントリ):
  - L4 で LEAK と判定した語 (既に修正済): 正解 立案 分野 正答 系统要件 担当者/担当人员 作成者 部署 社员 检讨 提携 实装 结合测试 单体测试 试作 二重化 指摘 利用者 责任者 不正(竞争防止法) 番号 传票 决裁 记忆装置
    - `部署` は ja の兄弟にも 部署 がある欄だけに限る (中国語の 部署 = デプロイ と区別)。
    - `番号` は 个人番号・番号法・単独の番号 をまとめて拾う (D-222.1 改訂で 个人编号 / 个人编号法 に統一済)。
  - 残すと決めた語 (出現ごとに許可): 过去问 多重化 误答 事业者 满足度 利害关系者
  - L4b の見張り語 48 (S154 時点で 0 件): 见积 纳期 … 稼动
- **WARN**:
  - 要件 (系统要件 以外)、担当 (担当者 以外)、案件: 法律の 构成要件 / 動詞の 担当 / 法律上の 案件 として、中国語の用法が大半を占める。
  - 景品 株式 会社 役员 下请 独占禁止 内制 生体认证 受注 引当 受入 工数: S154 の出現はすべて括弧の原語 (L4b で OK と判定)。
- **入れなかった語: 试制品**。
  - 试制 は中国語として普通の語 (試作して製造する)。D-222 改訂も「试制品（原型）」を残すと決めている。
  - 語表に入れると、原型法の文脈の約 45 出現 (混入ではない) が全部エントリになるため、入れなかった。D-222 の「L5 に記録」はこの md で果たす。

### 規則そのものが通すもの (許可リストのエントリではない)

`--gate` の出力 `rule allowances` の現在値は次のとおり。規則ごとの合計で、規則の間で重複がある。

| 何を | 大きさ | 根拠 |
|---|---|---|
| `[[jp:…]]` の中 (zh 仮名 / en 漢字・仮名 / zh 日本字形) | 51,129 字 / 7,856 欄 | inline.ts の JP 注記 = `lang="ja"` で描画 (D-202 / D-221) |
| 単独の選択肢記号 ア〜エ (「选项ウ」「Choice ウ」「ア・ウ」) | 9,062 個 | L2 の規則。既知の過剰な許容は LIKE "%イ%ン_" の イ (この題は question-data で別に許可) |
| quiz の括弧内の日本字形 (R-zh-jpform のみ) | 44 字 | 指示 1。簡体字専用の字を含む括弧は伏せない |
| R-zh-jpform の対象外の字 | 〇 (U+3007)、瞭 | 中国語の字 (〇 = 零・伏せ字、瞭望 = 通用规范汉字表) |

## 2. 範囲の除外 (scope_exclusions、fixture に理由付き)

| id | 何を | 当たり | 理由 |
|---|---|---|---|
| derived | textbook の v1 互換欄 (terms[].definition / explanation / memory_hook、overview.intro、summary.*) | 6,010 | merge が content 欄から派生する。validateV2 の `compat` が派生値との一致を検査し、compatText は `[[jp:X]]` を（X）に展開する |
| key-guard-note | quiz-explanations の `key_guard.*` (note_jp) | 106 (R-ja-simp 101 + latin 5) | 内部の監査メモで、検査した zh を引用する。web は `key_guard.suspect` しか読まず、H1-4 (`073cd900`) で client から除去済み |

- derived は素通しにしていない。`--gate` は **derived guard** を実行する。
  - 内容: derived の連の各字が、同じ単元・同じ言語の content 欄の連、または `[[jp:]]` の中に現れること。
  - 現在の結果: 違反 0。
  - 効果: 派生欄だけに日本語が入った場合も落ちる (test あり)。

## 3. 許可リスト (`scripts/fixtures/lang-allow.json`)

- 生成器: `node --no-warnings scripts/l5-build-allowlist.ts [--write]`。
  - 実行するたびに、今の fixture との差を `+` / `-` の行で表示する。再生成で新しい当たりが黙って取り込まれないよう、`+` の行は必ず読むこと。
  - 生成器の行には qid 単位・単元単位の広いものがある。fixture 自体は位置と文字列で厳密だが、再生成は厳密ではない。
  - 生成器の `CLASSES` は、L2 / L3 / L4 / D-189 / D-222 の判定を 1 行ずつ写したもの。各行に理由がある。
  - どの行にも当たらない当たりはエントリにしない (= 関門で落ちる)。今回はこれで 3 件が残った。
- エントリのキーは `rule + file + path + 一致した文字列` で、`count` (その欄での出現数) を持つ。関門は次の場合に失敗する。
  - 同じ文字列が別の欄に出た。
  - 同じ欄に別の文字列が出た。
  - 同じ欄で出現が count より増えた。
- R-empty は許可できない。
- 当たりの無くなったエントリは stale として表示する。失敗にはしない。

| category | エントリ | 当たり | 中身 |
|---|---|---|---|
| question-label | 130 | 162 | 2009h21a q093〜q096 の 商品あ〜こ |
| question-data | 114 | 205 | 照合対象の文字列、擬似言語の記号 〇、図の中の日本語ファイル名規則「報告_」 |
| bracket-original | 78 | 82 | quiz の括弧・「日语称」・"in Japanese" の日本語原語 + 结合测试/单体测试/二重化/责任者/提携 の括弧書き |
| d189-label | 63 | 63 | Practice の 問 / 解説 / 解答 / ここがポイント / 出典 / 用語 / 正解 / 頻出度 / 共通前文 / cat_* + Today.colStars・Record.sortStars/colStars の 頻出度 + Mock.randomLead の三系名。**分野・正答率・Mock.colKey は入れていない** |
| keep-decision | 46 | 51 | 过去问 6 (D-222.2)、多重化 (D-222 改訂の理由)、误答 (D-222.3)、事业者 (法令名・GS1 の固有名)、满足度 1、利害关系者 (L4 第 2 回で残す)、共同利用者 B0490 |
| tb-jp-unmarked | 24 | 24 | 単元の「日本語を説明する」箇所で `[[jp:]]` の印が無いもの (下記) |
| ui-same-chinese | 12 | 12 | R-same の下限撤去で出た zh の短い語のうち、中国語として正しいもの (今日 辞典 操作 AI 分析 要点 保存 停止 年度 全部 未回答) |
| same-formula | 12 | 12 | 表計算の式 (整数部 / 平均)、商品A…、特性 (JIS …)、if (条件) … |
| jp-explained | 10 | 10 | 日本語そのものの説明 (〜のうち / と、クラウド、〜シティ、以上・以下、「没有唯一正解」) |
| locale-name | 9 | 9 | Locale.ja / Locale.zh / Glossary.searchPlaceholder |
| site-name | 8 | 8 | App.siteName |
| proper-name | 7 | 7 | 本駒込、栃木県、みちびき |
| tb-data | 6 | 11 | 文字コードの例 あ、LIKE の例 山、擬似言語の 整数型 |
| d222-6 | 2 | 2 | technology-13-34-u03 hook の **帰無** (zh / en) |
| **計** | **521** | **658** | |

### 主 session への申し送り: tb-jp-unmarked 24 件 (混入ではない、約定の抜け)

- 先行の判定と、この step で読んで分類したものがある。
  - L3 / L4b が判定していたもの: L3 Task B の付記 = strategy-03-10-u07 の pairs。L4b の glyph 網 = detail_zh の 手続 / 拡張 / 複合 (needs_jp_marker)。
  - 残りはこの step で、兄弟言語・行見出しと並べて writer が読んだ。例: technology-13-34-u02 の行見出しは「和名 / 日语名称 / Native Japanese term」。
- L4-c は hook しか直していないので、本文のこれらが残った。どの D も「残す」とは決めていない。
- 対象 (11 単元):
  - strategy-03-09-u04 detail_en 公開
  - strategy-03-09-u05 detail_zh 共食い
  - strategy-03-10-u07 pairs[0].rows[3] (上澄み吸収価格戦略 / 市場浸透価格戦略、zh / en)
  - technology-13-34-u02 pairs 中央値 / 最頻値
  - technology-13-34-u06 エッジ / 辺
  - technology-14-37-u03 手続 (zh / en)
  - technology-20-53-u03 拡張 / 複合
  - technology-21-55-u01 term_en 表
  - technology-22-60-u06 マイモ
  - technology-23-62-u05 シーサート / ソック
  - technology-23-63-u10 本人拒否率
- `[[jp:]]` を付けるなら B3 補丁で行い、その後 `l5-build-allowlist.ts --write` を実行するとこの 24 件は消える。

## 4. コマンドと現在の結果

```
node --no-warnings scripts/lang-leak-scan.ts --gate
```

- 何も書かない。`--allow <file>` で許可リストを差し替えられる。所要約 1.3 s。

現在 (2026-11-11、作業ツリーの状態) の出力:

```
lang-leak gate (scripts/fixtures/lang-allow.json, 521 entries): groups 89615, hits 7518
  allowed 658 · scope-excluded derived=6010 key-guard-note=106 · punct-only 543 · warn 197 (R-ja-latin-run=13 R-zh-jpword-ctx=184)
  rule allowances (summed over rules): [[jp:]] chars 51129 in 7856 fields · choice labels 9062 · quiz-bracket jpform chars 44
  messages key set zh vs ja: missing 0, extra 0
  messages key set en vs ja: missing 0, extra 0
  FAIL not allow-listed: 4 (R-zh-kana=1 R-en-cjk=1 R-same=1 R-zh-jpword=1)
  R-zh-kana  data/ip/quiz/translations/2022r04.json  questions.2022r04-q074.stem.zh  [zh]  «れ»  …尾随（共连れ）行为…
  R-en-cjk  data/ip/quiz/explanations/2015h27a.json  questions.2015h27a-q085.points[1].en  [en]  «条件计数»  COUNTIF (条件计数) is a function that count…
  R-zh-jpword  apps/web/messages/zh.json  Mock.colKey  [zh]  «正解»  正解
  R-same  apps/web/messages/zh.json  Mock.colKey  [zh]  «正解»  正解
lang-leak gate: FAIL
```

- `node --test scripts/lang-leak-scan.test.ts` → **17 pass / 1 fail**。
  - 失敗したのは「gate CLI が現 corpus で exit 0」の 1 件で、上の 3 件が理由。直せば緑になる。
- 単体テストが確かめていること:
  - 7 つの FAIL 規則が、それぞれ合成の混入で落ちる。
  - WARN と punct-only は落ちない。
  - 許可エントリが、別の path の同じ文字列 / 同じ path の別の文字列 / 増えた出現 / R-empty を通さない。
  - 当たりの無い (stale) エントリを検出する。
  - 範囲の除外が効き、derived guard が働く。
  - キー集合の欠けと余りを検出する。
  - 括弧のマスクと 〇 / 瞭 の扱い、語表の段 (FAIL / WARN) と ja 兄弟の条件。
- 模擬: 上の 4 当たりだけを足した許可リスト (scratchpad) では `lang-leak gate: PASS`。
- 型: `tsc --noEmit --strict` (apps/web の tsc) で、型エラー 0。出たのは `import.meta` の CJS 出力警告だけで、これは root に package.json の type が無いためで、Node の実行には関係しない。

## 5. 3 件を直した後の手順

1. 直す。zh.json は apps/web 側の lane、sidecar は既存の経路 (解説は `.phase2/expl_tr` → `quiz-phase2-merge.mjs`)。
2. `node --no-warnings scripts/l5-build-allowlist.ts --write`。
   - 「条件付個数」や「共連れ」の形で直した場合、生成器の行が新しい原語を拾ってエントリにする (この 2 行は用意済み)。
   - 「COUNTIF」だけにした場合や、Mock.colKey を中国語にした場合は、エントリは要らない。
3. `node --no-warnings scripts/lang-leak-scan.ts --gate` → PASS、`node --test scripts/lang-leak-scan.test.ts` → 18/18。

## 6. H6 での組み込み (export build の前に実行)

- 関門が読む入力はすべて git 管理下にある。だから関門は CI / Cloudflare の build でもそのまま動く。
  - `data/ip/textbook/units` 244/244。
  - `questions.json` と `unit_index.json`。
  - `quiz/translations` 29/29、`quiz/explanations` 29。
  - `apps/web/messages`。
- 必要なのは Node ≥ 23 (型の剥ぎ取りが組み込み) だけで、依存は無い。local は v26。
- 案: deploy の流れで `next build` (output export) の **前** に次を実行し、非 0 なら build に進まない。

  ```
  node --no-warnings scripts/lang-leak-scan.ts --gate
  ```

  - 置き場所の候補は 2 つ。
    - apps/web の `prebuild` (`node --no-warnings ../../scripts/lang-leak-scan.ts --gate`)
    - H6 の deploy script / CI job の先頭
  - apps/web/package.json は並行 lane の書き込み範囲なので、本 step では触れていない。
- **H6 は export build の前に次の 2 つを両方走らせる** (L5 review L-3 / L-5)。
  - `node --no-warnings scripts/lang-leak-scan.ts --gate`
  - apps/web の `pnpm vitest run src/lib/textbook/__tests__/v2-corpus.test.ts`
  - 理由: derived guard は字の集合で見るので、同じ単元にある字だけを組み合わせた新しい日本語は見えない (§7)。その穴は v2-corpus の validateV2 `compat` 等値検査が塞ぐ。
  - 現時点ではどちらも CI / prebuild に入っていない (repo に workflow は無く、prebuild も無い)。「恒久」になるのは H6 の接入後である。
- D-212 (docs のみの変更は build しない) の新ホスト版でも、data / messages / scripts/fixtures に変更があれば関門を走らせる。
- 運用の規則:
  - 意図して日本語を足すとき: 生成器 `CLASSES` に理由付きの 1 行を足し、`--write` で再生成し、fixture の diff を review する。fixture を手で一律に緩めない。
  - 単元の配列の並べ替え等で path が変わると、旧エントリは stale、新しい位置は失敗になる。同じく再生成して review する。

## 7. 限界

- 漢字だけで書かれた日本語のうち語表に無い語、ja 欄の簡体字表に無い中国語は見えない (L3 の限界のまま)。
- WARN の語 (184 出現) は失敗にしない。今回は中身を一覧で確かめた: 括弧の原語、動詞の 担当、法律上の 案件、株式会社 I。新しい誤用が入っても関門は止めない。
- quiz の括弧のマスク (jpform) は過剰に許す。簡体字専用の字を含まない括弧の中の日本の字形は、原語でなくても通る。
- derived guard は字の集合で見ている。派生欄に、同じ単元の content にある字だけを組み合わせた別の日本語が入っても見えない。
- ・ (punct-only 543) の方針は L4-d (任意) のまま未決なので、件数を表示するだけにしている。
- **textbook の SVG 図 (`data/ip/textbook/figures/*.svg`、50 term が `SvgFig.tsx` で zh / en ページにも内联) は走査しない**。
  - ラベルは設計上日本語のみである (Stage 7、`technology-18-49-u02.ruleA.md` L10「ラベルは jp のみ、parity の対象外」)。日本語の文字ノードは 1,317 ある。
  - 関門の対象は言語別の欄だけである。
- 同じく設計上日本語のみのものは、ja-only として R-ja-simp だけを見る: quiz_index の `name_jp` / exams `label_jp`、試験の PNG 図 (原題)。

## 8. writer の判断 (主 session で記録・確認を)

1. 当たりの単位を 1 連 / 1 出現にした。許可は位置 + 文字列 + 出現数。
2. 试制品 は語表に入れない (§1)。
3. 〇 / 瞭 は R-zh-jpform の対象外にした (中国語の字)。
4. 要件 / 担当 / 案件 と、括弧の原語でしか出ない語を WARN 段にした。`l5_notes`「R-zh-jpword は WARN から」と指示 1「LEAK 判定の語」の両方に合わせた。
5. `key_guard.*` を範囲から外した (表示されず、出荷もされない)。
6. Mock.colKey「正解」は D-189 として扱わず、残る混入として報告した。
7. 2022r04-q074「共连れ」は括弧の原語として許さず、残る混入として報告した。
8. `lang-leak-scan.ts` の報告モードは残した。出力は `L5_scan.{json,md}` に改名した。
   - schema は `lang-leak-scan-2` (当たりの単位を変えたため)。
   - committed の `L2_scan.*` (L2 時点の記録) は上書きせず、再生成もしていない。
   - 限界の節は本 md (§7) に移した。

## 修正後 (主 session の決定を適用、2026-11-11、未 commit)

主 session の決定 (残る混入 3 件。データ・`apps/web` への書き込み許可はこの 3 欄に限る):

1. Mock.colKey は D-189 ではない (D-192 で en "Key" として追加された) →「正确答案」。
2. "COUNTIF (conditional count)"。
3. 「共連れ」(sidecar のみ、D-222.5)。
4. tb-jp-unmarked 24 件は許可リストに残す。理由 =「D-221 marking pending (follow-up)」。

### 工具と経路

`scripts/l5-fix-apply.ts` を新しく書いた。

- 同じ層で直す (`scripts/l4-r2b-quiz-apply.ts` と同じ):
  - 解説 = `data/ip/quiz/.phase2/expl_tr_2015h27a-q085.json` → `node scripts/quiz-phase2-merge.mjs 2015h27a`
  - 訳 = sidecar `data/ip/quiz/translations/2022r04.json` のみ
  - zh.json = その 1 行だけを文字列として置き換える
- 安全策:
  - 各 before は欄の中に 1 回だけ出ることを確かめる。
  - zh.json は、置き換え後の JSON を解析した結果が「Mock.colKey だけ変えたもの」と一致することを確かめる。
  - 2022r04.json は直列化が往復で一致することを確かめる。
- 施工の前に:
  - `git diff HEAD -- data apps/web/messages/zh.json` が空であることを確かめた。
  - 2015h27a の no-op merge で差分 0 を確かめた。
  - 4 ファイルの写しを scratchpad `l5/backup/` に取った。

### 全欄比較 (写し vs 現在、葉ごと)

| ファイル | 葉 | 変化 | 欄 |
|---|---|---|---|
| `apps/web/messages/zh.json` | 459 | 1 | `Mock.colKey`「正解」→「正确答案」 |
| `data/ip/quiz/explanations/2015h27a.json` | 2,506 | 1 | `2015h27a-q085.points[1].en`「COUNTIF (条件计数) …」→「COUNTIF (conditional count) …」 |
| `data/ip/quiz/translations/2022r04.json` | 1,073 | 1 | `2022r04-q074.stem.zh`「…尾随（共连れ）…」→「…尾随（共連れ）…」 |
| `data/ip/quiz/.phase2/expl_tr_2015h27a-q085.json` (gitignored) | 16 | 1 | `points[1].en` (同上) |

- `git diff --stat`: 3 ファイル、各 1 行。
- `quiz-keys-crosscheck.mjs`: ✓ all invariants hold (A1–A7, B1–B7)。

### 関門

- `node --no-warnings scripts/l5-build-allowlist.ts --write`:
  - `+` 行は 1 件だけだった: `bracket-original R-zh-kana 2022r04-q074.stem.zh «れ» ×1`。尾随（共連れ）の括弧原語で、正しい。
  - `-` 行は 0 件。
  - 結果: 522 entries / 659 hits、unclaimed 0。
- `node --no-warnings scripts/lang-leak-scan.ts --gate` → **exit 0、`lang-leak gate: PASS`**。出力: allowed 659、derived 6010、key-guard-note 106、punct-only 543、warn 197、キー集合 0 / 0。
- `node --test scripts/lang-leak-scan.test.ts` → **18 / 18 pass**。

### apps/web (読み取りのみ)

- `pnpm vitest run src/__tests__ src/components/mock` → 71 pass / **1 fail**。
  - 失敗したのは `Mock.ssr.test.ts`「MockResult … the 正誤一覧 linking to /practice/q/<id>」。期待は `href="/practice/q/2025r07-q001"`、実際は `href="/ja/practice/q/…"` だった (ja の描画)。
  - これは並行 lane が編集中の `MockResult.tsx` (作業ツリーで変更あり、D-223 の通常 `<a>` 化) の差分によるもので、zh.json の変更とは関係しない。
  - 根拠: 失敗は ja locale のリンク形式の断言である。このテストは文言を messages から読むので、zh の値に固定された期待は無い。`src/components/mock` と `e2e` を grep しても、zh の「正解」を固定した断言は無い。
- `fidelity.test.ts` → diffs **2**: `{qid: 2015h27a-q085, field: point-1, locale: en}` と `{qid: 2022r04-q074, field: stem-tr, locale: zh}`。今回直した 2 欄そのものだけである。**baseline は更新していない** (指示どおり)。

## 審査対応 (L5 review = APPROVE-WITH-CHANGES、`L5_review.md`)

| 指摘 | 対応 |
|---|---|
| **M-1** R-ja-simp が 60 字表だけを見る | `jaSimp` = SIMP_ONLY **または** `isSimplifiedHan` (GB2312 にあり Shift_JIS に無い字)。test を足した: 东 / 车 / 库、および 東京・車・庫 は通ること |
| **M-2** 再生成で新しい混入を吸い込む | 下記 |
| **L-1** d189 の説明 | category の文言を直した。70978b70 の Practice キー + Practice.cat_* (practiceLabels.ts:7、L3 A10、7c993eac) + 頻出度 のキー (7e7f4b27) + Mock.randomLead の三系名、として列挙し、key と完全値で照合する。分野 / 正答率 / Mock.colKey は入れない |
| **L-2** quiz_index / SVG | `quiz_index.json` を収集源 `quiz-index` として追加した (topics の major_* / medium_* = 3 言語、name_jp / label_jp = ja-only)。218 グループ増え、当たりは 0。SVG は §7 に明記した |
| **L-3 / L-5** | §6 に「H6 は `--gate` と v2-corpus.test を両方 build 前に走らせる」と「まだ未接入」を明記した |
| **L-4** stale のエントリ | `--gate` は stale が 1 件でもあれば失敗する。そのとき再生成のコマンド (`l5-build-allowlist.ts --write`、- 行を読む) を表示する。test あり |

### M-1 のデータ修正 (1 件)

- `data/ip/textbook/unit_index.json` の `topics[20].units[0].terms[6].order_reason_jp` を「…全題库では頻出…」→「…全題庫では頻出…」に直した (誤字、簡体字の 库)。
  - 文脈は「(freq_global=8 と全題庫では頻出)」で、問題集全体の意味。
  - 工具は `node --no-warnings scripts/l5-fix-apply.ts --only unit-index --apply`。葉単位の前後比較で、変わったのはこの 1 葉だけだった。`git diff --stat` は 1 行。
- 同じ誤字が gitignored の計画資料にも残っている (`data/ip/textbook/.planning/{phaseA_batch2_reviews,plan_strategy-06-21,review_strategy-06-21}.json`、`.planning/v2/strategy-06-21-u01/manifest.json`)。
  - 表示層ではないので触っていない。
  - unit_index を計画資料から再生成すると誤字が戻る。そのときは関門が R-ja-simp で止める。

### M-2 生成器 (`scripts/l5-build-allowlist.ts`)

- **新しい claim は拒否する**。生成器の出力が今の fixture に無いキー、または count が増えたキーを含むとき、`+ NEW` 行を表示して **exit 1** する (`--write` も行わない)。
  - 書き込むには `--accept-new` が要る。各 `+ NEW` 行を読んだ上で付けること。
  - 消えたエントリ (`-` 行) だけなら、そのまま書ける。
- **class を狭めた**:
  - keep-decision の 46 件と、jpword の括弧原語 13 件は、(file, path, 語) を列挙する (`KEEP_AT` / `BRACKET_WORD_AT`)。jpword 括弧原語は、さらに括弧・引用の中にあることも要る。
  - tb-jp-unmarked 24 件は、(file, path, text) を列挙する (`TB_UNMARKED_AT`)。
  - qid 単位の class には、一致した連そのものの条件を課す。
    - bracket-original / proper-name みちびき / ゃゅょっ: `bracketed` = 括弧・引用の内側、または直前に 日语 / 称为 / 也叫 / Japanese …、または直後に in Japanese か括弧の訳がある。
    - question-label / question-data: `inJa` = その題の日本語 (questions.json stem / choices、stem_jp_clean、解説の jp) に、その文字列がある。
    - jp-explained: 上の 2 つの両方。
  - UI は完全値で照合する: d189 (`Practice.*` は 問 / 頻出度 / 共通前文 ▸ … の値の表)、site-name、locale-name。textbook の same-formula も完全値。
  - 個別の textbook エントリ (正解・帰無・山・整数型) は (file, path, text) を列挙する。
- 結果は同じ 522 entries / 659 hits。new claims 0、dropped 0。
- reviewer の吸収例は、test で次のとおり unclaimed のままになる (関門は失敗を続ける)。
  - 括弧の無い 二重化 (2018h30a-q082 correct.zh)
  - 未審査の位置の 多重化
  - bracket-original の題 (2022r04-q040) に入れた括弧外の「これが正しいです」
  - tb-jp-unmarked の単元 (strategy-03-10-u07) に入れた新しい仮名「のです」
  - `Practice.correct` =「正解です」
  - 完全値「正解」は、引き続き claim される。
- 「fixture に無い claim は added として出る」test も足した。CLI の dry run は `new claims 0, dropped 0`。

### 再実行

- `node --no-warnings scripts/lang-leak-scan.ts --gate` → **PASS**。
  - 522 entries、groups 89,833 (+218 = quiz-index)、hits 7,602、allowed 659。
  - derived 6,010。key-guard-note は 193 (M-1 の判定拡張で note_jp の当たりが増えた。表示されない欄)。
  - punct-only 543、warn 197、stale 0、キー集合 0 / 0。
- `node --test scripts/lang-leak-scan.test.ts` → **22 / 22 pass** (4 件増えた: M-1、M-2 の吸収例、M-2 の新規 claim、L-4 の stale)。
- `node --test scripts/*.test.mjs` → 108 / 109。失敗の 1 件は既存の `quiz-fidelity-machdiff` で、L4 以前から失敗しており今回の変更とは関係しない。
- apps/web `pnpm vitest run src/lib/textbook` (読み取りのみ、unit_index を変えたため) → **13 files / 174 tests 全通過**。
- `tsc --noEmit --strict` (scripts 4 本): 型エラー 0。
