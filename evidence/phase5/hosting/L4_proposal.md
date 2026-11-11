# L4-b / L4-c 提案 (Track L、PLAN_hosting_migration §3 L4、D-221)

- 日付 2026-11-11 (S154)。書き手 = oh-my-claudecode:executor (opus)。**提案のみ**: データ・単元・sidecar・messages・app・補丁は一切変えていない。`--write` 系の工具 (merge / patch --register / quiz の --apply) は実行していない。
- 生成物:
  - `L4b_wordlist.md` (語表、採否の理由) / `L4b_hits.json` (827 件、`node scripts/l4-jpword-scan.ts --write`)
  - `L4c_hooks.json` (198 hook、`node scripts/l4-hooks.ts --write`)
  - スクリプト: `scripts/l4-lib.ts` (L2 と同じ欄の収集)、`scripts/l4-jpword-scan.ts`、`scripts/l4-hooks.ts`。いずれも読み取りのみで、書くのは上記 evidence だけ。
- Rule D: 本文書は writer の提案。判定と置換案は別 subagent_type の reviewer が抽検する前提 (下の「審査に回すもの」)。

## 1. 件数

### L4-b (zh 欄の漢字だけの日本語、827 当たり)

| 対象 | LEAK | OK | UNSURE |
|---|---|---|---|
| textbook-units | 6 | 95 | 34 |
| quiz-translations | 75 | 30 | 25 |
| quiz-explanations | 200 | 219 | 116 |
| ui-messages (zh.json) | 9 | 12 | 6 |
| **計** | **290** | **356** | **181** |

- zh.json の `分野` = **0** (L4-a の修正後であることを確認)。
- OK 356 の内訳: 語の網 201 (括弧の日本語原語・法律用語の 要件・動詞の 担当 等)、glyph 網のうち hook の日本語分解 74 (→ L4-c)、その他 glyph 75 (D-189 ラベル・題目データ「%葉_」・地名・引用の原語)、`needs_jp_marker` 5 (本文が日本語を説明しているが `[[jp:]]` が無い: strategy-03-10-u07 pairs 2、technology-14-37-u03 / 20-53-u03 detail 3)。
- LEAK の家族 (主なもの):

| 家族 | 件数 | 置換 |
|---|---|---|
| quiz 解説「正解」 | 113 (109 題・25 試験回) | 正解 → 正确答案 (解説 sidecar の zh で 正确答案 は 2,084 欄に既出) |
| 2014h26a q097〜q100 事務・財務担当者 (中問 4 題) | 48 (stem 38・解説 10) | 担当者 → 负责人 |
| 2010h22a-q087 表名「社員」「部署」 | 47 (stem・選択肢・解説) | 社员 → 员工、部署 → 部门 (en は既に Employee / Department) |
| 立案 | 19 | → 制定 (企划、立案 は → 规划) |
| zh.json 正答率 | 9 | → 正确率 |
| 担当者・担当人员 (その他) | 12 | → 负责人 / 工作人员 |
| 案件 (営業・審議の意味) | 7 | → 商机 / 项目 / 事项 |
| 2013h25a 作成者姓名 / 報告_ | 8 | → 编写者姓名 / 报告_ (同じ題の他欄に揃える) |
| 结合测试 (地の文) | 7 | → 集成测试 |
| 要件 (系统要件) | 5 | → 需求 |
| 检讨 4・提携 2・实装 3・责任者 3・利用者 2・不正竞争防止法 1 | 15 | → 研究 / 合作 / 集成・实际安装的 / 负责人 / 使用者 / 反不正当竞争法 |

### L4-c (D-221: hook の日本語に `[[jp:]]`)

| | zh | en |
|---|---|---|
| 印を付ける hook | **124** (label 184 個) | **74** (label 127 個) |
| 付けられない hook (`**…**` の中) | 1 | 1 |
| 合計 (L3 との照合) | 125 (L3 下限 ≥ 約 97) | 75 (L3 = 75 と一致) |

- 現状 `[[jp:]]` を含む hook = 155 (L3 と同じ)。今回の 198 hook のうち既存の印を含む hook にも、印の無い日本語が残っていれば追加した (例: technology-23-63-u06「日语[[jp:復号]]的“復”」の 復)。
- 検査 (198 hook 全件、`L4c_hooks.json` の `checks`):
  - `stripInline(after) = stripInline(before)` (印を足しただけ): 198/198
  - `inlineErrors(after) = []`: 198/198
  - `compatText(after) = compatText(before)` (glossary の memory_hook は不変): 198/198
  - 単元ごとに、提案の hook と派生した互換欄 (memory_hook_* / summary.memory_hooks_*) を入れた単元で `validateUnit` (validateV2 + svg + copy) を回し、**新しい issue 0** (80 単元)。
  - 1 hook 内の編集窓 (補丁 1 件 = label 1 個、計 311) は互いに重ならない。merge の replay と同じ関数 (`applyPatches` → `assemble` → `applyUnitPatches`) に既存補丁 + 提案補丁を順に流し、hook・memory_hook・summary.memory_hooks が提案の終状態と一致 (80 単元、`replay_with_proposed_patches = ok`)。
  - jp-origin (D-202) は one / 考点 だけを見るので hook の変更は影響しない (validateV2.ts 356–445 を確認)。
  - B6 zh-term WARN (非阻止) が **+2**: technology-13-34-u04 `尺度`、technology-16-44-u01 `応答時間`。`zhNorm` が `[[jp:…]]` を中身ごと消すので、hook の中の語が印の中だけになると「zh に訳語が無い」と出る。阻止ではないので受容を提案。
- 自動で落とした候補を読んだ (`dropped_zh_candidates`、59 件): 引用符の中の共通字形の語で、ja hook にあるが「日语 / 日文 / 写作 / 读作」の手がかりが無いもの 54 + 引用符の外の en の反響 5。読んだ結果 13 件は日本語の名称・語の分解なので印を付ける側に入れた (`MANUAL`: 特区・独禁法・金商法・景品・表示・自家・自治体・勘定系・匿名・加工・合意・二刀流・施錠の 管理)。残り 46 件は中国語の訳語 (英語の訳「能力」「故障」、中国語の説明「有因才有果」) か、名称を中国語に訳した部分 (“合格的”“发票等”“保存”“方式”) で、印は付けない (`final`)。
- 機械で拾えない残り: zh hook のうち en 側に CJK があるのに zh に提案が無いもの 6 件 (`residual_zh`)。読むと 6 件とも zh は中国語の字形で書き直している (“组”“汇总”“标本”“液压”“破/损”“针”) ので**日本語は無い** = 印は不要。引用符も仮名も日本字形も en の反響も無い「共通字形だけの分解」は機械では見つからない。該当の有無は本走査では言えない (下限)。

## 2. 直す経路 (家族ごと)

| 家族 | 経路 | 具体 |
|---|---|---|
| 単元の本文 (L4-b の textbook 6 件 + UNSURE 採用分、L4-c の 197 hook) | **B3 loc-part 補丁** (`scripts/textbook-v2-patch.mjs --register --part <最終 loc part>`、一括なら `docs/templates/batch-tools/apply_patches.mjs`)。field = `terms[i](見出し語).hook_zh` 等。その後 merge dry-run → `merged.json` の terms.* / summary.* 差分を units/ に in-place 適用 (S154 C17 と同じ) | `L4c_hooks.json` の `hooks[].edits[]` が補丁 1 件ずつの before/after (欄内で一意な最小窓)。`b3.loc_part` / `base_sha256` / `patched_loc_equals_units` (全件 true) を記録 |
| ↳ 同じ欄に active 補丁があり、窓が重なるもの 13 hook | **retire + 合成版を再登録** (C17 の型) | management-09-26-u01 p02、strategy-01-02-u05 p14、01-02-u09 p04、03-09-u02 p07、05-16-u04 p10、07-22-u01 p04・p05、technology-14-37-u02 p08、16-44-u01 p02・p03、23-61-u01 p03・p04、23-61-u04 p07 |
| ↳ frozen_baseline の単元 1 hook (management-10-27-u03 terms[5] 転嫁) | **査読つき直接編集** (merge --write は拒否される) | `L4c_hooks.json` の route に明記 |
| ↳ unit_summary_zh (technology-15-41-u02「实装内存模块」、UNSURE) | unit-level 補丁 (`--manifest`、field `unit.unit_summary_zh`) | |
| ↳ `term_zh` (strategy-05-14-u05 terms[3]「个人番号（My Number）」、UNSURE) | B3 では直せない (manifest.v1_terms 由来)。v1terms fixture と manifest の見直しが要る | 个人番号 を変えると決めた場合のみ |
| quiz 解説 (L4-b 200 LEAK) | efix 型の決定的スクリプト (`scripts/quiz-fidfix-S131-efix5.mjs` と同形: `EXPL = [id, where, "zh", from, to, n]`、`subN` で出現数を厳密に検査) で **`.phase2/expl_tr_<id>.json`** を書換え → `quiz-phase2-merge.mjs <exam>` で sidecar を再生成。D-152 lock を取ってから。D-143: final の `key_guard.note_jp` に note を後置 (下の判断 4) | 211 欄すべてで `before` が `.phase2` の層に 1 回だけあることを確認済 (sidecar = `.phase2` の値)。全 217 欄で、同じ欄の複数の置換を順に当てても各 `before` がその時点で 1 回だけ (`subN` の無言 skip が起きない) |
| quiz 訳 (L4-b 75 LEAK) | 同じスクリプトの `TRFIX` (sidecar `data/ip/quiz/translations/<exam>.json` を直接、再 merge 禁止) + `.phase1/tr_<id>.json` に同じ置換 | **注意**: `.phase1 tr_` は sidecar とずれている (76 欄中 `before` が 1 回あるのは 9、0 回 50、構造違い 17。例: tr_ は “部署” 表、sidecar は「部署」表、2014h26a は sidecar 側の題文が長い)。efix5 の `subN` は 0 回なら skip するので、tr_ は「あれば直す」になる (判断 5) |
| ↳ 題目単位の改名 2 家族 | 上の 2 経路で同時に | 提案をすべて当てた後、2010h22a-q087 と 2014h26a q097〜q100 の zh 欄 (訳・解説) に 社员 / 部署 / 担当 は 0。表示されない層にも同じ語がある: `.phase2/expl_tr_2014h26a-q097.json` (解説の源、直す)、`.phase1.5/stem_2014h26a-q097.json` (題文の zh 写し、sidecar とずれて「经理担当者」)、`.phase2/input_*` / `t1_tr_*` / `ruleA_samples_*` (過去の workflow 入力、直さない) |
| UI 文言 zh.json (正答率 9、过去问 6 は UNSURE) | L4-a と同じ: `apps/web/messages/zh.json` を直接編集 + `messagesZhJpWords.test.ts` に 正答 (と決めれば 过去问) を追加 (赤 → 緑) | 今回は app に触れていない (並行 agent が apps/web/src を編集中) |

## 3. 代表例 (before → after)

| # | 欄 | before | after | 経路 |
|---|---|---|---|---|
| 1 | quiz 解説 2025r07-q074.correct.zh | 正解为ア。数字取证… | 正确答案为ア。… | .phase2 expl_tr → merge |
| 2 | quiz 訳 2010h22a-q087.stem.zh | 将「部署」表、「都道府县」表及「社员」表进行连接 | 将「部门」表、「都道府县」表及「员工」表进行连接 (表中の 社员编号 / 部署代码 も同様) | sidecar + tr_ |
| 3 | quiz 訳 2011h23a-q037.stem.zh | 当对一组模块进行结合测试需要 4 小时时 | 当对一组模块进行集成测试需要 4 小时时 | sidecar + tr_ |
| 4 | quiz 解説 2010h22h-q008.correct.zh | 拜访记录、案件预期等销售活动信息 | 拜访记录、商机预期等销售活动信息 | .phase2 → merge |
| 5 | 単元 strategy-02-06-u01 terms[5].detail_zh | 以及事业的企划、立案、调查业务 | 以及事业的企划、规划、调查业务 | B3 |
| 6 | zh.json Today.weakLead | 正答率低 × 出题多 的领域优先 | 正确率低 × 出题多 的领域优先 | 直接 + テスト |
| 7 | hook zh strategy-01-02-u09 terms[3] | 日语「アンケート」（问卷）来自法语 enquête（调查）。 | 日语「[[jp:アンケート]]」（问卷）来自法语 enquête（调查）。 | B3 |
| 8 | hook en strategy-05-14-u03 terms[4] | The 種 in [[jp:業種]] means kind or type, as in 種類. | The [[jp:種]] in [[jp:業種]] means kind or type, as in [[jp:種類]]. | B3 |
| 9 | hook zh strategy-02-04-u01 terms[5] (L3 A06 の zh 兄弟) | “標”取自“標識”，意为标记。 | “[[jp:標]]”取自“[[jp:標識]]”，意为标记。 | B3 |
| 10 | hook zh technology-23-63-u06 terms[1] (既存の印に追加) | 日语[[jp:復号]]的“復”就是“复原”… | 日语[[jp:復号]]的“[[jp:復]]”就是“复原”… | B3 |

## 4. 人 / 方針の判断が要るもの

1. **个人番号 / 番号法 (49、UNSURE)**: 単元 strategy-02-05・05-14 と quiz で一貫して使われ、`term_zh` にも入っている。用語として残すか、中国語の一般訳 个人编号 / 我的编号法 (単元は既に「我的编号法」も併用) に統一するか。変えるなら zh_terms・v1terms fixture まで及ぶ。
2. **过去问 (zh.json 6、UNSURE)**: サイト名「過去問ノート」(D-189) と同じ語。製品用語として残すか、真题 / 历年真题 にするか。
3. **日本語寄りだが通じる直訳の UNSURE 群**: 试作 38 (→ 原型)、多重化 22 (→ 冗余)、指摘 23 (→ 审计发现 / 指出的问题、題目の見出し〔A收到的指摘〕と一括)、误答 8 (→ 错误答案)、利害关系者 7 (zh_terms の訳語か確認)、要件 (选定要件) 7、事业者 2、满足度 2、案件 (事件管理) 4、株式会社 I (題目の伝票の宛先) 8、稟议 (混成字形) 2。直すか、L5 の許可リストに入れるか。
4. **D-143 の note**: 正解 → 正确答案 の機械的な置換だけで 109 題 (25 試験回) に及ぶ (解説の LEAK 全体では 139 題)。efix5 は題ごとに final の `key_guard.note_jp` に note を後置した。語の置換だけの題にも 1 題 1 note を付けるか、一括の note (「zh の語彙統一、correct_answer 不変」) で足りるとするか。
5. **`.phase1 tr_` のずれ**: 訳 sidecar の修正を tr_ にも当てる規約だが、tr_ は sidecar と既にずれている (50 欄で `before` が見つからない)。sidecar だけを直して tr_ は「見つかれば直す」でよいか。
6. **題目単位の一括改名**: 2010h22a-q087 (社員・部署 → 员工・部门) と 2014h26a q097〜q100 (事務・財務担当者 → 负责人) は stem の表・選択肢・解説・要点で同時に変えないと題が壊れる。図そのもの (画像) は日本語のまま。
7. **L4-c で印を付けられない / 付けると字形が変わるもの**:
   - technology-13-34-u03 terms[4] zh・en「**帰無**」: 太字の中で入れ子になるため付けられない。`**…**` を外して `[[jp:帰無]]` にする (stripInline は同じ、強調が消える) か、そのまま残すか。
   - strategy-02-06-u01 terms[3] zh「读作“サブロク协定”」: 中に簡体字 协 がある。そのまま印を付けると 协 に lang="ja" が付く。`[[jp:サブロク協定]]` に直す (文字の変更) か、`[[jp:サブロク]]协定` にするか。提案ファイルはそのまま包んだ形 (`labels_with_simplified_glyph` に記録)。
   - 一部だけ印が付く文 (reviewer に読んでほしい): management-08-25-u05「“类”…“[[jp:推]]”」(類 を 类 にしている)、strategy-01-01-u01 terms[6]「“人力资本”的“[[jp:本]]”」(本 は中国語の語の字)、strategy-02-07-u04「“[[jp:公益]]”“通报者”“保护”」、strategy-05-14-u04「“数字”加“[[jp:政府]]”」、technology-13-34-u04「“[[jp:昇]]”…“降”」、technology-14-37-u04「type 意为“[[jp:型]]”」(1 つ目は英語の訳)。
8. **本文の印の抜け (L4-b の needs_jp_marker 5)**: strategy-03-10-u07 pairs[0].rows[3] (日语中的别称の行、上澄み吸収価格戦略 / 市場浸透価格戦略)、technology-14-37-u03 detail「日语的“手続”」、technology-20-53-u03 detail「“拡張”」「“複合”」。D-202 の約定で `[[jp:]]` を付けるなら L4-c の補丁と一緒に出せる。

## 5. 審査に回すもの (Rule A / Rule D)

- 置換と印付けは書き換え率が小さい (語単位) ので Rule A の 50% 閾値には当たらないが、件数が多いので reviewer (別 subagent_type) に抽検を依頼したい: L4-b LEAK 30 (家族ごとに最低 1) + UNSURE 20、L4-c zh 20 + en 10 (上の 7 の文は全件)。
- `L4b_hits.json` の判定は `scripts/l4-jpword-scan.ts` の `JUDGE` 表の規則による (出現ごと)。規則が拾い損ねた型は reviewer の抽検で見る。
