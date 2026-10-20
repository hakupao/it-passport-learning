# C track C2 — 図の再裁断 (S127、D-150 §2)

前段: `fig_C0_S127.md` (縁辺走査 530 → 候補 267、manifest、対照) / C1 sweep `fig_sweep_S127.json` (run `wf_a1380a30-8ad`、Sonnet、267/267、15,089,292 token、matches=false 111)。
ユーザー決定: 111 題全修、3 batch (b1 39 / b2 35 / b3 39、共有図 group 2015h27h-q097/099/100 を b2 に) で batch ごとに commit + push。

管線 (batch ごと): figfix critic (`quiz-figfix.workflow.mjs`、opus、`oh-my-claudecode:critic`) → `quiz-figfix-apply.mjs --results figfix_results_S127_bN.json` (退避 `data/ip/quiz/.keyaudit/figfix_backup_S127/`) → `build-quiz-figures.mjs` → `build-quiz-corpus.mjs` → 再検証 (`quiz-figreverify.workflow.mjs`、opus、**`oh-my-claudecode:verifier` = critic と別 type、Rule D**) → 主 context 実読抽検 → gate → commit + push。

## b1 (2009h21a〜2012h24a、7 exam、39 題)

| 段 | run | token | 結果 |
|---|---|---|---|
| critic | `wf_4ba8a6e4-e58` | 2,496,621 | recrop 38 / remove_figure 1 (`2012h24a-q011`、medium) / 偽陽性 0 |
| apply | — | — | **recrop 39** (主 context 判断で q011 を remove → recrop: 選択肢表のみの図だが破壊的変更を避け critic 提示 bbox で残す) / webp 39 変更 / with_fig 511 不変 |
| 再検証 | `wf_61e05501-a53` | 2,295,375 | **39/39 correct、still-bad 0** (round 2 不要) |

- 盲検陰性対照 `2011h23tokubetsu-q078` は sweep partial (medium) → critic も欠け確認 → 再裁断 → 再検証 correct。**S126 の目視「支障なし」判定は誤りだった** (選択肢表の左外枠・下罫線欠け)。
- 主 context 実読抽検 3 枚: `2010h22a-q089` (sweep wrong_question_figure → 表2 出力結果表を全体表示、題幹の参照と一致) / `2009h21h-q027` (表のみ、選択肢の分数式断片除去) / `2011h23tokubetsu-q078` (選択肢表 4 行・外枠閉) — いずれも正。
- 裁断方針の変化: critic は設問文・純テキスト選択肢を図から外し、図・表本体 (+ 図中に描かれた選択肢表) だけを残す範囲を取った (S99 以前の crop は設問文を含むものがあった)。stem_jp / choices_jp で文字表示されるため情報欠落は無い (再検証で確認)。

### gate (b1 適用後)
| gate | 結果 |
|---|---|
| `quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 / all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ (A)(B) GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| tsc | ✅ 0 |
| vitest | ✅ 562 passed / 2 skipped |
| build | ✅ 0 |

## 範囲外の発見: stem_jp 転記表の原典不一致 (C track では扱わない → B track fixer に名指し + ⑨)
critic / verifier が図の照合中に付記。一覧 = `fig_stem_mismatch_S127.json` (b1 + b2 critic、13 題)。正解に関わりうる例:
- `2010h22a-q018` 評価表の数値・文言が原典と相違 (原典どおりなら 85 = ウ、key ウ と一致 → 表示 stem のみ誤り)
- `2012h24h-q005` 売上高 stem 4,800 vs 原典 4,000 (4,800 ではどの選択肢とも合わない)
- `2012h24h-q091` No.2 申込日 8月7日 vs 原典 9月2日 / `2012h24h-q092` カレンダの曜日ずれ・休日欠落
- `2009h21h-q096` グラフ値の列ずれ / `2010h22a-q097` 作業計画表 (中問 C 共有)
いずれも 13 exam 群 (⑤-2 母数外) → D-150 B track の再抄写で被覆、fixer に名指しする。

## b2 (2012h24h〜2017h29a、9 exam、35 題)

| 段 | run | token | 結果 |
|---|---|---|---|
| critic | `wf_4d4e17b1-c9d` | 2,264,771 | recrop 32 / remove_figure 1 (`2012h24h-q068`、medium) / none 2 (`2015h27h-q099` / `q100`) |
| apply | — | — | **recrop 33** (q068 は b1 q011 と同じ判断で remove → recrop) / skip 2 / webp 33 変更 / with_fig 511 不変 |
| 再検証 | `wf_75854b41-b8d` | 1,942,538 | **33/33 correct、still-bad 0** |

- **共有図 group (2015h27h-q097/099/100)**: critic は題ごとに必要範囲が異なると判定 (q097 = 図1 レコード形式 + 1/0 の定義段落が必要、q099/q100 = 現 crop の表1 で解答に足りる)。webp は題ごとの別ファイルなので題ごとの判定に従い q097 のみ再裁断。D-145 group ゲート (assert-clean) GREEN。
- 主 context 実読: **S126 で発見された既知欠損 2 題が解消** — `2016h28h-q033` (ネットワーク図 + 所要時間表、C 行・Y 列まで完全) / `2017h29a-q015` (選択肢表 ア〜エ 4 行 + 右外枠)。
- stem 転記表の原典不一致 (再検証 verifier も同見立て): 追加 `2013h25h-q096` (B2 3,000 vs 3,200、B14、E2 式、4月行脱落)。`fig_stem_mismatch_S127.json` 参照。
- gate (b2 適用後): crosscheck all invariants / assert-clean GREEN / chumon 一致 / tsc 0 / vitest 562 passed / build 0。

## b3 (2017h29h〜2026r08、11 exam、39 題)

| 段 | run | token | 結果 |
|---|---|---|---|
| critic | `wf_cdb28490-db1` | 2,524,722 | recrop 39 / remove 0 / 偽陽性 0 |
| apply | — | — | recrop 39 / webp 39 変更 |
| 再検証 | `wf_97202deb-ac5` | 2,290,301 | 38/39 correct、**still-bad 1 = `2022r04-q050`** (critic bbox x=44% が表の左端 34.8% を外し左列「工程/設計/製造」欠落) |
| round 2 | apply (`--backup-dir figfix_backup_S127_r2/`、q050 は round 1 で退避済のため別退避先) → 再検証 `wf_8f50a187-650` | 58,235 | **1/1 correct** (主 context 実読も正: 単位注記 + 2 列表 + 左罫線) |

- gate (b3 + round 2 適用後): crosscheck all invariants / assert-clean GREEN / chumon 一致 / tsc 0 / vitest 562 passed / build 0。
- stem 転記不一致リスト 17 題に拡大 (b3 critic + verifier 付記: `2018h30a-q005` 作業B 機械X 7分 vs 10分 / `2018h30h-q100` 通信制御 vs 通信制限 / `2019h31h-q053` 59本 vs 50本 / `2019h31h-q078` / `2019h31h-q098` B2 88 vs 80・C2 合格欠落 / `2023r05-q075` ほか)。**`2019h31h` / `2023r05` は ⑤-2 母数内** → stem 内 markdown 表の転記は ⑤-2 machdiff の表ブロック比較が弱い盲点 (⑨(6)) の実例か A track で確認。

## C track 総括 (S127)

| 項目 | 値 |
|---|---|
| 縁辺走査 | 配信 webp 530 → 候補 267 (S126 完全再現) |
| sweep (Sonnet) | 267 / 陽性 111 (partial 104 / extra_neighbor 6 / wrong_question 1)、盲検対照: 既知欠損 2/2 検出、陰性 4 のうち 1 (q078) は実欠損だった |
| 修復 | **再裁断 111 題** (b1 39 / b2 33 / b3 39)、remove_figure 提案 2 は recrop に変更 (破壊的変更回避)、偽陽性 2 (共有図 group の q099/q100、題ごと判定) |
| 再検証 (別 type verifier) | round 1: 110/111 correct → round 2: 1/1 correct = **111/111** |
| token | C1 sweep 15.09M + critic 7.29M + 再検証 6.59M ≈ **28.97M** (+ C0/C2 準備 executor・reviewer)。**申告 1,000〜1,200 万を大幅超過** (sweep の Sonnet 実測 ≈ 56k/項目 が見積 30k の約 2 倍、陽性数 111 が想定より多かった) |
| commit | b1 `f299488` / b2 `9a02cd8` / b3 (本 commit) |

### 残る空白 (⑨ 登記)
1. **縁辺走査の盲点**: 縁が白いまま行・列ごと欠ける裁断は検出不能。候補外 263 枚 (選択肢図 24 を含む) は今回 sweep 対象外。陰性対照 q078 が実欠損だった (S126 目視 6 枚中 1 枚の誤判定) ことから、候補外にも欠損が残る可能性は否定できない。
2. **stem 転記表の原典不一致 17 題** (`fig_stem_mismatch_S127.json`): 13 exam 群は B track fixer に名指し、⑤-2 母数内 (2019h31h / 2023r05 等) は A track で表ブロック比較の盲点として扱う。正解に関わりうる例: `2012h24h-q005` (4,800 vs 4,000) / `q091` / `q092` / `2018h30a-q005` / `2019h31h-q098`。
3. 選択肢図 (key≠question_id) は figfix-apply 非対応 (C0 N3)。
