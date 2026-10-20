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
