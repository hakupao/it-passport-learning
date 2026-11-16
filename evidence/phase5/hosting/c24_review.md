# C24 Rule D review（S158）— zh「） 汉」の空白削除

- Reviewer: oh-my-claudecode:code-reviewer（Writer とは別 agent / 別 context、Rule D）
- 対象: HEAD bc0f963b に対する未コミット変更（units 21・patches 21・scripts/tbjp-apply.ts・cleanup-pins.test.ts・c24_edits{,2,3}.json・c24_apply{,2,3}.json）
- 判定: **PASS**（HIGH 0 / MEDIUM 1 / LOW 6。MEDIUM は C24 の範囲外の後続課題で、ブロックしない）

## 1. 描画（inline.ts）

- `tokenize`: `**` は開始位置から次の `**` を探し、`[[jp:` は次の `]]` を探す。閉じ marker 直後の空白を消しても、次の文字は漢字（3 種とも lookahead `[一-鿿]`）なので `***` も marker の隣接も生まれない。`**X（Y）**是` → key「X（Y）」+ text「是」、`]]是` → jp + text「是」。`inlineErrors` の「keyword 端の `*`」判定にもかからない（次 token は「*」で始まらない）。
- `compatText`: `**响应时间** [[jp:レスポンスタイム]]是` → key, text「 」, jp, text「是」→ `sp` が真になり「响应时间（レスポンスタイム）是」。変更前は「…（レスポンスタイム） 是」だった。`**X（Y）**是` は `**` を外して「X（Y）是」になる。
- 本文での JP ラベル: `<span lang="ja" data-inline="jp" class=jpWord>`。`.jpWord` は `color: var(--spot)` だけで、余白も括弧もない（reader.module.css:424）。なので本文は「周转时间 ターンアラウンドタイム是」になり、ラベルと後ろの中国語の間に隙間はない。「]]汉」（空白なし）は corpus の多数派の形と同じ（worktree の zh フィールドで「]]汉」498 / 「]] 汉」30）。keyword+gloss の形で数えると、HEAD でも「** [[jp]]汉」13 >「** [[jp]] 汉」9、「**[[jp]]汉」306 で、変更後は「** [[jp]] 汉」「**[[jp]] 汉」が 0 になった。

## 2. 範囲と正しさ

機械照合（scratchpad の diffcheck.mjs）: HEAD と worktree の 21 units で、すべての葉の値を path ごとに比較した。
- 変わった値は **154 フィールド、すべて zh path**。ja・en・数値・構造の変化は 0。
- どの変化も「before から半角空白を消しただけ」と位置を揃えて確認した（それ以外の差分は 0）。
- 消えた空白 171 箇所の形は「）␣漢」79（edits1 の 4 + derived の follower）、「）**␣漢」82、「**[ ]?[[jp:…]]␣漢」10。その他の形 0、空白の後ろが漢字でない例 0。
- apply 記録の合計: 3 回分で 22 unit 行（unit は 21 種）・targets 89（4+75+10）・derived followers 65。89+65 = 154 で照合結果と一致する。

残っているか（zh フィールド、units 全件 + unit_index）:
- 「） 汉」0、「）** 汉」0、keyword+gloss+空白+漢字 0。
- textbook 配下のほかの JSON（zh_terms.json・figure_index・unit_minutes など）にも「） 漢」は 0。

抽出 20 件（seed=158。変更フィールド 154 件の一覧に mulberry32 で Fisher–Yates をかけ、先頭 20 件）を文脈ごと通読した。読みやすさは全件問題なし。例: 「**e-Learning（在线学习）**减少了…」「基准测试（ベンチマーク）是在…」「**Applet**[[jp:アプレット]]是从…」「**周转时间** [[jp:ターンアラウンドタイム]]是…」「MVV 是把…使命（Mission）、愿景（Vision）、价值观（Value）三个要素…」。意味の変化はない（空白を消しただけ）。

## 3. Merge

- dry-run（全 journal を渡す）: strategy-01-01-u06（journal 4、edits1+edits2、composite retire あり）、technology-16-44-u01（journal 2、edits3）、strategy-01-03-u02（journal 4、edits1）は exit 0、merged == units（diff []）。apply 記録の baseline_diff [] と一致する。
- technology-17-45-u02 / technology-17-48-u01 は exit 1 だが、その diff（challenge_questions[1..3] / title_zh）は apply 記録の baseline_diff と同じで、merge_exit_before も 1。以前からある invariant（D-216 CONFIRM_SHORT・C19b の title 直接修正）によるもので、C24 で起きたものではない。
- technology-16-44-u01 の warn「zh-term terms[1].hook_zh 応答時間」は C24 が触っていないフィールドの warn で、以前からある。
- patches: 9+2 件の既存 patch は削除せず `status: retired` + `retired_reason` にし、composite を登録している（C17 pattern）。削除行は status と reason の書き換えだけ。
- 注: dry-run が gitignore 済みの `.planning/v2/<unit>/merged.json` を上書きする（内容は units と一致）。

tbjp-apply.ts の c24 コード:
- `c24Norm` は 3 つの replace で、どれも空白の後ろを漢字の lookahead で縛っている。演算子の前後（「） + 」）は対象外。
- edit ごとの検査 `c24Norm(from) !== to` で、`to` が「from の 3 形の空白を全部消したもの」と完全に一致することを強制している。
- follower の検査 `c24Only` はフィールド全体で `c24Norm(before) === after` を要求する。derived のほかの場所に余計な変化があれば `bad` に落ちる。厳しく、正しい。

## 4. テストと gate

- `cd apps/web && npx vitest run src/lib/textbook` → 13 files / **178 passed**
- `node --no-warnings scripts/lang-leak-scan.ts --gate` → **PASS**（warn 197 は既存の R-ja-latin-run 13 / R-zh-jpword-ctx 184）
- 新しいテスト「C24」: 正規表現 `(_zh|\.zh)(\[\d+\])?$` は `terms[i].points[j].text_zh` と index の `title_zh` に当たる。HEAD では derived に「） 漢」が 79 箇所あったので、このテストは落ちる（回帰の pin として有効）。

## 指摘

**[MEDIUM / conf HIGH] 太字の漢字 keyword の前後の空白（C24 の範囲外の後続課題）**
- 状況: 「漢字**…漢字** 漢字」が zh フィールドに 485、「漢字 **漢字…」が 788 残っている。「**…**漢字」の 4,346 に対する少数派。
  - 例: management-11-29-u01 goals_zh[0]「能说明 **服务管理系统** 是…」
  - derived では `**` が外れるので「以 手机号码 为」(strategy-06-19-u03 definition_zh)、「等 有限范围 里」(technology-22-58-u01) のように、中国語の中に空白が見える。
- edits2 の根拠（「**X（Y）** 是」の空白は描画すると同じ隙間に見える）は、この形にもそのまま当てはまる。
- 同じ根拠から、edits2 の 75 フィールドのうち 29 箇所は開始側に空白が残って非対称になった（例「汇总在 **配置管理数据库（CMDB）**中」「留住人才的 **人才保留（retention）**。」）。edits2 の 17 unit の中にも「漢字** 漢字」が 114 残っている。
- C24（「）」の直後）の定義としては正しく、ブロックしない。
- Fix: 別の候補（C25 など）または OQ として登録する。範囲は「両側が漢字の太字 keyword の前後の空白」。CJK–Latin の空白（「与 **UML** 的」）は除く。

**[LOW / conf HIGH]** tbjp-apply.ts の round c24 のヘッダ comment（「Edits: c24_edits.json, c24_edits2.json」）に c24_edits3.json が書かれていない。gloss の regex には inline comment がある。Fix: comment に edits3 を追記する。

**[LOW / conf HIGH]** `c24Only` の `c24Norm(a) === c24Norm(b)` は、後ろの `c24Norm(a) === b` から導けるので冗長（害はない）。Fix: 1 つの条件にまとめる。

**[LOW / conf MEDIUM]** 新テストが検査するのは「） 漢」だけ。source 側の「）** 漢」と「**…[[jp:…]] 漢」は、derived への follower があるフィールド（definition/intro/key_points…）でしか間接的に捕まらない。goals_zh / points.text_zh で再発しても検出できない。Fix: 正規表現を `/）(\*\*)? [一-鿿]|\*\* ?\[\[jp:[^\]]+\]\] [一-鿿]/` に広げる。

**[LOW / conf MEDIUM]** 依頼文の「残りの『[[jp:X]] 汉』34 件」に対し、reviewer の数え方（units の zh フィールド、`/\]\] [一-鿿]/`）では 30 件。数え方の違い（en や index を含めたか等）とみられる。Fix: 後続の課題を登録するときに、数えた正規表現と範囲を明記する。

**[LOW / conf HIGH]** keyword と gloss の間に空白がある「** [[jp:X]]漢」が 22 残っている（多数派は「**[[jp:X]]漢」306）。本文では「周转时间 ターンアラウンドタイム是」のように片側だけに隙間が出る。compatText はこの空白を消すので derived には影響しない。Fix: MEDIUM の後続課題にまとめて扱う。

**[LOW / conf HIGH]** 範囲外の同じ種類の空白: 「”␣漢」（strategy-01-01-u06 hook_zh ほか 3 件「…（Objectives）” 来管理」）と「》␣漢」（strategy-05-14-u06「《以人为中心的 AI 社会原则》 以」、太字の版も含めて 2 件）。Fix: MEDIUM の後続課題の候補に含める。

## 良い点

- 3 つの edit list それぞれに、変化の形を強制する検査（`c24Norm(from) === to`）と、derived follower を全文一致で縛る検査がある。範囲が機械的に閉じている。
- 既存の patch を消さず retire + composite にしていて、Rule B と C17 の流儀に合っている。
- 演算子の前の空白と CJK–Latin の空白を、意図して対象から外している。
- baseline_diff が 0 でない 2 unit も、apply 記録の baseline と一致していて、記録が正確。
