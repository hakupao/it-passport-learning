# S128 A4 — 未登録中問組の共有前文埋め込み (D-141 / D-144 段 3)

- 入力: `evidence/S128_L2f_chumon.json` の `a4_input` (17 組 = 未登録 15 + 部分登録 2)
- 起草→核験: `scripts/quiz-chumon-preamble.workflow.mjs` (Extract general-purpose opus → Verify pr-review-toolkit:code-reviewer opus、Rule D)
  - batch1 `wf_6bfb70a9-2a3` 8/8 PASS → `evidence/phase5/stage_06_quiz_fidelity/chumon_preamble_S128_a4_batch1.json`
  - batch2 `wf_d2196547-a65` 8/8 PASS → `evidence/phase5/stage_06_quiz_fidelity/chumon_preamble_S128_a4_batch2.json`
- 前処理 + apply 模擬: `scripts/quiz-chumon-a4-prep-S128.mjs` (新規、既定 dry-run / `--write`)
- 適用: `scripts/quiz-chumon-preamble-apply.mjs` (既存、無改変) に `data/ip/quiz/.phase2/a4_apply_main.json` (15 組) → `a4_apply_after_B2.json` (2014h26h-mqA、B2 commit 後)

## 1. 対象と結果

| 区分 | 組 | 題 |
|---|---|---|
| workflow 抽出 → 前置 | 16 組 (2012h24a-mqA/C, 2012h24h-mqA/D, 2013h25a-mqA/C/D, 2013h25h-mqC, 2014h26a-mqC, 2014h26h-mqA, 2015h27a-mqA/B/C, 2015h27h-mqA/C/D) | 64 |
| 決定的複製 (2012h24a-q098 → q100、既存 COPY の cut) | 2012h24a-D | 1 |
| 計 | 17 組 | **65 題** (前文欠落 62 + q089 順序是正 + 2013h25a-q097/q099 節選→完全前文) |

translations 差分は 65 題 × `stem_jp_clean` / `stem.zh` / `stem.en` のみ (他フィールド・他題の変化 0、apply 前 snapshot との機械比較)。clean 新設 (raw を種) 25 題。
key 命名は `<exam>-mq<X>`。L2f の `2013h25a-A` は `2013h25a-mqA` (groups.json では mqB、crosscheck は報告のみ)。

## 2. 特殊メンバーの扱い

| 題 | 処理 | 理由 |
|---|---|---|
| 2012h24a-q100 | q098 の前文 (lightweight COPY 表と同一 cut) を三語前置 | q097〜q099 は S117 COPY 済 (Rule D PASS)。再抽出すると probe 句読点差で二重埋め込みの危険 |
| 2013h25a-q097 | 末尾〔要望事項〕節を三語除去 → 完全前文 (状況・〔書籍の貸出と返却業務〕・表1・〔要望事項〕) を前置 | 旧節選は〔要望事項〕のみ + 原典と 2 箇所相違 (「貸出の」→「貸出しの」、「元の場所」→「元の棚」)。置換で是正 |
| 2013h25a-q099 | 先頭〔要望事項〕節を三語除去 → 完全前文を前置 | 同上 |
| 2015h27a-q089 | 設問文の後ろの前文 + 図1 表を三語除去 → 検証済み前文を先頭に前置 | **順序是正のみ**。表示層 (clean / zh / en) の表は元から原典どおり (55.8% / 78 / 42,900 / 味玉) で、A4 は位置を移しただけ。Extract が指摘した OCR 誤りの表 (55.6%、塩ラーメン等) は非表示の raw `stem_jp` (question_bank / by_year) に残っており、**bank は是正していない** (Rule D N5、raw 層の別 track) |
| 2014h26h-q085〜088 | B2 commit 後の stem (q085:「が」挿入除去・〔データ管理要領〕) に前置 | D-152 lock 順序 |

dry-run (適用直前に再実行): prepend 64 / skip 0 / 句読点除去 probe での二重・欠落 0 / 前置先先頭の分野見出し残 0。

## 3. Verify 指摘の処置

- 2014h26a-mqC・2015h27a-mqA「図1 を前文に含めるか」→ D-141 §2 (図は再現しない、参照文は残す) に従い **含めない**。Extract も除外済み。同種の参考指摘 (2012h24h-mqD / 2013h25a-mqA / 2013h25h-mqC / 2015h27h-mqA/C/D) も同じ。
- 2015h27a-mqB は jp 句読点を「，」→「、」(corpus 慣例) に揃えた。Verify は許容。
- 2013h25a-mqC: md 表の見出し行「項目/内容」補完、en ①②③→(1)(2)(3)。Verify 許容 (体裁差)。
- 2013h25a-mqA: en に括弧の言い換え 2 箇所 (contract for work (subcontract agreement) 等)。Verify 許容 → ⑨ zh/en polish 候補。

## 4. 登記簿・script 更新

- `scripts/quiz-chumon-groups-build.mjs`: EVIDENCE_FILES に S128 a4 batch1/2 を追加、COPY 写しの 2012h24a-q098 targets に q100 追加。
- `scripts/quiz-chumon-lightweight-D144s3.mjs`: COPY 表の 2012h24a-q098 targets に q100 追加 (dry-run: 前置 0 / skip 14 = 冪等)。
- (Rule D MINOR-1 是正) section 型 COPY `2013h25a-q097 → q099` を lightweight 本体と groups-build 写しの両方から退役 (mqD が置換。残すと reset 後の再実行で q097 の設問文を q099 に複製する)。lightweight dry-run 前置 0 / skip 13、groups-build 再生成の差分は notes から「2013h25a-q097-copy … 登録しない」1 行が消えるのみ (組・member・probe 不変)、`--check` 一致、crosscheck A1–A7 / B1–B7 hold。
- `data/ip/quiz/chumon_groups.json` 再生成: **50 組 / 200 問、probe 命中 600/600** (= L2f の源中問組 50 と一致)。`2013h25a-q097-copy` は全メンバーが抽出組 2013h25a-mqD に入るため note 付きで非登録 (既存ロジック)。

## 5. Gates

| コマンド | 結果 |
|---|---|
| `node scripts/build-quiz-corpus.mjs` | ✅ exit 0 (with_fig 511) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 (MINOR-1 是正後に再生成・再確認) |
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran / all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `pnpm --config.verify-deps-before-run=false -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm … -C apps/web test` | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped |
| `pnpm … -C apps/web build` | ✅ exit 0 |
| correct_answer (questions.json / question_bank.json、apply 前 snapshot 比較) | ✅ 2900/2900 不変 |

## 6. 源抽検 (6 題、源 PNG 実読、主 context = writer 側の自己点検。Rule D は別 agent)

| 題 | 源 | 判定 |
|---|---|---|
| 2015h27a-q089 | p40 | ✅ 前文 2 文 + 表 6 行全セル一致 (55.8% / 78 / 42,900 / 味玉 / 828 / 164,760)、前文→設問の順。句読点「、」のみ差 |
| 2013h25a-q097 | p42–43 | ✅ 状況・〔書籍の貸出と返却業務〕(1)(2)・表1 4 行・B さん段落・〔要望事項〕(1)〜(4) 逐字 (「貸出し」「元の棚」)、〔要望事項〕重複なし |
| 2013h25a-q099 | p42–43 | ✅ 同上、自問 施策①〜③ 保持 |
| 2014h26h-q085 | p33 | ✅ 4 段落・〔効果予測する項目〕①②・なお書き 5%・〔データ管理要領〕逐字。B2 是正後の設問文に前置 |
| 2012h24h-q088 | p31 | ✅ 〔選定要件〕(1)〜(4)・総合評価値式・記号説明・表1 一致 |
| 2012h24a-q100 | p45 | ✅ 〔会員登録をするWebページの仕組み〕①〜⑤ 一致 (源の段落改行「…取り扱っている。⏎B さんが…」は 1 段落に結合 = q097〜q099 の既存 COPY と同形、体裁差) |

## 7. 残課題 (A4 範囲外)

- 2014h26h-q085 zh の **設問文** (既存訳) が「运营管理部门按照…处理从销售部门接收到的数据」と誤訳 (原文は「運用管理部門，販売部門から受領したデータ」= 両部門から)。⑨ zh/en polish / B2 追補へ。
- 2012h24a-q088: 自問のワークシート (B8〜H18) が頁にも附図にも無い → 図 lane。
- 2013h25a-q085〜q087: 前文の図1 ガントチャートは q088 のみに挂図 (q087 は L2f で UNANSWERABLE)。前文は図を再現しないため、図共有 (lightweight-figs COPY_FROM 型) を図 lane で要検討 (未実測の推定)。
- 2014h26a (B3 検証中): mqC q093〜096 の前文は本 unit で前置済み。B3 fixer は前文領域に触れない前提。

## 8. Rule D 審閲 (別 agent / 別 subagent_type)

- 判定: **PASS-with-notes**。
- 逐字照合: 11 組を源 PNG と照合。
- 解答可能性: L2f の解答不能 10 題 (2012h24h-q088/q097/q100、2013h25a-q087/q088/q094/q096、2014h26h-q085、2015h27a-q088、2015h27h-q087) が前文埋め込み後に解答可能となった。うち 8 題は表示内容のみから正解を再導出し、`correct_answer` と一致。
- MINOR-1: section 型 COPY `2013h25a-q097 → q099` の退役 → §4 のとおり是正済。
- MINOR-2: 本書 §2 の q089 記述 (表示層の表は元から正しく、A4 は移動のみ / raw bank の OCR 誤り表は未是正 = N5) → 是正済。
- NIT 1〜4: 記録のみ (データ変更なし)。
