# L4 第 1 回施工 (Track L、D-221 / D-222、Rule D `L4_review.md` の「批准范围」)

- 日付 2026-11-11 (S154)。書き手 = oh-my-claudecode:executor (opus)。branch `hosting-cf`、**未 commit**。
- 範囲 = reviewer 承認分だけ。除外 (第 2 回へ): H-1 (B0292・B0386〜B0388・B0720・B0781 + 2023r05-q007「系统规划负责人」)、H-2 作成者 7 + q094 エ「编写者姓名」、B0490 (共同利用者)、L4-c zh の非字形 75 label、サブロク协定、指摘・试作・个人番号・其余 UNSURE、zh.json 正答率 9 (H1-3 の commit 後)。
- D-152: 本施工の間 `data/ip/quiz/**` に書く lane は本 lane だけ (並行 agent の書込先は `apps/web/src/**`)。書いた先 = `data/ip/quiz/.phase2/expl_tr_*.json` (136)・`suspects_*.json` (merge が再生成、内容は不変)・`data/ip/quiz/explanations/*.json` (28)・`data/ip/quiz/translations/*.json` (8)、`data/ip/textbook/units/*.json` (68)、`evidence/phase5/stage_07_ui/phase3/batch/patches/*.json` (66)、`.planning/v2/*/merged.json` (dry-run の出力)。`apps/web/**`・`.phase1/tr_`・`generate_result_*` は触っていない。
- 復元用の写し (施工前): scratchpad `l4r1/backup/` (translations・explanations・units・patches・`.phase2` の expl_tr / suspects / generate_result・`.planning`)。

## 1. 変えた欄 (家族ごと)

### quiz (267 置換 → 179 欄。`L4_apply_round1_quiz.json` に置換ごとの before / after)

| 家族 | 置換 | 層 |
|---|---|---|
| 解説「正解」→ 正确答案 | 113 | 解説 |
| 2010h22a-q087 社员 → 员工 21・部署 → 部门 26 | 47 | 訳 + 解説 |
| 2010h22a-q087 取入 → 引入 (M-1 追加) | 2 | 解説 (correct・points[1]) |
| 立案 → 制定 / 规划 / 策划 | 18 | 訳 3 + 解説 15 |
| 2014h26a q097〜q100 担当者 → 负责人 | 48 | 訳 38 + 解説 10 |
| 2014h26a-q100 会计负责人 → 财务负责人 (M-1 追加) | 4 | 訳 1 (題文 (4)) + 解説 3 |
| 2012h24a-q052 B0398 担当人员 → 工作人员 | 1 | 解説 |
| 结合测试 → 集成测试 (B0366 は「集成测试（结合测试）」) | 7 | 訳 1 + 解説 6 |
| 系统要件 → 系统需求 | 5 | 訳 4 + 解説 1 |
| 实装 → 集成 / 实际安装的 | 3 | 訳 1 + 解説 2 |
| 案件 → 商机 / 项目 / 事项 | 7 | 解説 |
| 检讨 → 探讨 (B0469・B0561) / 考虑 (B0560・B0562) (review LOW) | 4 | 解説 |
| 责任者 → 负责人 | 3 | 解説 |
| 提携 → 合作 | 2 | 解説 |
| 利用者 → 使用者 (B0457 のみ) | 1 | 解説 |
| 不正竞争防止法 → 反不正当竞争法 | 1 | 解説 |
| 報告 → 报告 (B0443。同じ欄の「编写者姓名」は第 2 回) | 1 | 解説 |
| **計** | **267** | 解説 195 (→ 161 欄)・訳 72 (→ 18 欄) |

欄の内訳: 解説 correct 116・distractors 33 (ア 7 / イ 10 / ウ 10 / エ 6)・points 12 (0: 4 / 1: 8)、訳 stem 12・choices 6。

### textbook (68 単元・158 欄、`L4_apply_round1_units.json`)

| 家族 | 欄 | label / 置換 |
|---|---|---|
| L4-c hook_zh (kana・日本字形の label のみ) | 79 (B3 78 + frozen 1) | label 108 |
| L4-c hook_en | 74 | label 127 |
| L4-b 担当人员 → 工作人员 (management-12-32-u01: terms[0] detail_zh 2・points[0].text_zh 1、terms[4] detail_zh 1、pairs[0].rows[1].b_zh 1) | 4 | 5 |
| L4-b 立案 → 规划 (strategy-02-06-u01 terms[5].detail_zh) | 1 | 1 |
| compat 欄 explanation_zh (detail_zh の派生) | 3 | — |

- hook の compat 欄 (memory_hook_* / summary.memory_hooks_*) は `compatText` が `[[jp:]]` を外すので**不変** (merge の出力でも差分 0)。
- L4-c の round 1 部分集合は `node scripts/l4-hooks.ts --round1 --write --out evidence/phase5/hosting/L4c_hooks_round1.json` で再生成 (strip / compat / inline / validateUnit / B6 / replay の検査を部分集合で回し直した: check_failures 0・compat_changes 0・新 validate issue 0・replay 全 ok)。`L4c_hooks.json`・`L4b_hits.json` (審査済の証拠) は上書きしていない。
- 字形 label は 109 (quoted 89 + unquoted 20) のうち サブロク协定 を除いた **108**。

## 2. 実行した工具

1. 施工前の基準: `pnpm vitest run` (apps/web、読み取り) / `node --no-warnings scripts/lang-leak-scan.ts --out-dir <scratch>/scan_before` / `node --no-warnings scripts/l4-jpword-scan.ts` / 全 244 単元 `node --no-warnings scripts/textbook-v2-validate.mjs --unit <id>` / `node scripts/textbook-unit-minutes-build.mjs --check` / `node --test scripts/*.test.mjs` / `node scripts/quiz-keys-crosscheck.mjs`。
2. **no-op merge 関門** (review の未比較 distractors_jp / points_jp / key_guard への対処): 手を入れる前の `.phase2` で 28 試験回 `node scripts/quiz-phase2-merge.mjs <exam>` → `git diff data/ip/quiz` **空**、`suspects_*.json` も写しと一致。
3. textbook: `node --no-warnings scripts/l4-r1-units-apply.ts --out <scratch>/units_plan.json` (計画のみ: 全補丁を記憶上で replay し、対象欄 = 終状態・他欄の変化 0 を確認) → `… --apply --out evidence/phase5/hosting/L4_apply_round1_units.json`。中で呼んだもの: 単元ごと `textbook-v2-merge.mjs --unit <id> --journal …` (dry-run、補丁登録の前と後)、`textbook-v2-patch.mjs --register --part <最終 loc part>` 232 回 (うち合成 11)・`--retire` 11 回 (CLI 出力 243 件すべて ✓)。frozen 1 単元は直接編集。`--write` は使っていない。
4. quiz: `node --no-warnings scripts/l4-r1-quiz-apply.ts` (dry-run、267 置換すべて before が欄内 1 回) → `… --apply --out evidence/phase5/hosting/L4_apply_round1_quiz.json` → 28 試験回 `node scripts/quiz-phase2-merge.mjs <exam>` (全 exit 0)。`build-quiz-corpus.mjs` は raw の question_bank から questions.json を作るだけで `.phase2` も sidecar も読まない (jp を変えていない) ので実行していない。

### retire + 合成 (C17 の型) 11 欄

| 単元 | 欄 | retire |
|---|---|---|
| management-09-26-u01 | terms[1](オブジェクト指向).hook_zh | p02 |
| strategy-01-02-u05 | terms[2](散布図).hook_zh | p14 |
| strategy-01-02-u09 | terms[4](全数調査).hook_zh | p04 |
| strategy-03-09-u02 | terms[0](競争優位).hook_zh | p07 |
| strategy-05-16-u04 | terms[2].hook_zh | p10 |
| strategy-07-22-u01 | terms[4].hook_zh | p05 |
| technology-14-37-u02 | terms[1](演算子).hook_en | p08 |
| technology-16-44-u01 | terms[1](応答時間).hook_zh / hook_en | p02 / p03 |
| technology-23-61-u01 | terms[4](紛失).hook_zh | p04 |
| technology-23-61-u04 | terms[2](災害).hook_zh | p07 |

合成補丁 = retire した補丁を外した状態の欄と終状態の最小差分窓 (欄内で一意)。before / after は `L4_apply_round1_units.json` の `fields[].composite`。

### frozen 単元の直接編集 (management-10-27-u03、frozen_baseline.json)

- terms[5](転嫁).hook_zh
  - before: `日语里“転嫁”和成语“责任转嫁”是同一个词，中文叫“转移”，字面就是把负担“转”到别处“移”走。`
  - after: `日语里“[[jp:転嫁]]”和成语“责任转嫁”是同一个词，中文叫“转移”，字面就是把负担“转”到别处“移”走。`
- memory_hook_zh・summary.memory_hooks_zh は `compatText` / `hookLines` で再計算 (値は不変)。単元の差分は hook_zh 1 欄のみ。

## 3. dry-run の差分 (merged.json vs units/)

- 補丁登録の**前**に単元ごとの差分を記録 (baseline): 8 単元に既知の差 = challenge_questions (C11 の直接修正: strategy-01-02-u09・05-14-u02・05-14-u03・technology-13-34-u03・13-34-u04・14-37-u04・23-61-u01) と title_zh (C18: technology-23-63-u10)。
- 登録の**後**の新しい差分 = 対象欄だけ: hook_en 74・hook_zh 78・detail_zh 3・points[].text_zh 1・explanation_zh 3・pairs[].rows[].b_zh 1。許可外の欄 0。
- units/ へ in-place で写した後: 67 単元 (frozen 以外) すべて merged-vs-units の差分 = baseline と同一。
- merge dry-run の exit: 60 単元 0/0、7 単元 1/1 (登録前後で同じ; C11 CONFIRM_SHORT 等の既知事項)。
- `git diff --stat data/ip/textbook/units` = 68 files, 161 insertions / 161 deletions (= 158 対象欄 + explanation_zh 3)。

### quiz の sidecar 差分

- 写しと現在の sidecar の全欄比較: 変わった欄 179 = 期待した欄 179 (余計な欄 0・欠け 0)。各欄の現在値 = 写しの値に置換を順に当てた値 (179/179 一致)。
- 全 2,900 題で `key_guard` 変化 0、jp 変化 0、en 変化 0 (distractors・points を含む)。`generate_result_*`・`suspects_*` は写しと一致。
- `quiz-keys-crosscheck.mjs`: ✓ all invariants hold (A1–A7, B1–B7) (施工前後とも)。
- 残留 (zh 欄のみ): 2010h22a-q087 の 社员 / 部署 / 担当 / 取入 = 0 (员工 21・部门 26・引入 2)。2014h26a q097〜q100 の 担当 / 会计负责人 = 0 (财务负责人 14・事务负责人 47)。解説 zh の「正解」= 0。

## 4. D-143 の総 note (D-222.4) と `.phase1/tr_` (D-222.5)

- **総 note**: 「S154 L4 第 1 回 (D-222): 解説 zh の日本語語彙を中国語に統一した (正解 → 正确答案 113 ほか、置換の一覧 = `evidence/phase5/hosting/L4b_hits.json` の承認 ID + 本書 §1、`L4_apply_round1_quiz.json`)。jp・en・correct_answer・key_guard は不変。」
  - この note は本書に置き、**`key_guard.note_jp` には書いていない**。D-143 の note は題ごとの `generate_result.results[].key_guard.note_jp` (final) にしか置き場が無く、1 件の総 note を入れる欄が無い。1 題に入れると他の 108 題には無く、全題に入れると D-222.4 に反する。crosscheck B4 も key_guard の不変を前提に通っている。→ 置き場の判断は主 context に返す (下の「判断待ち」)。
- **`.phase1/tr_`**: 触っていない。訳の修正 72 置換は sidecar だけ。提案時の計測 (`L4_proposal.md` §2): tr_ は sidecar と既にずれていて、76 欄中 `before` が 1 回あるのは 9、0 回 50、構造違い 17 (2010h22a-q087 は tr_ が “部署” 表、sidecar は「部署」表、2014h26a は sidecar の題文が長い)。表示層 = sidecar。tr_ との不一致は既知事項。

## 5. 検証 (施工前 → 後)

| 検査 | 前 | 後 |
|---|---|---|
| `lang-leak-scan` hits | 4,034 | **3,927** |
| ↳ R-zh-kana textbook-units (content) | 134 | 101 |
| ↳ R-en-cjk textbook-units (content) | 115 | 41 |
| ↳ quiz / ui-messages | 変化なし | (漢字だけの語は文字種走査に出ない) |
| `l4-jpword-scan` LEAK (tb / 訳 / 解説 / ui) | 6 / 75 / 200 / 9 | **0 / 4 / 10 / 9** (残り 14 = H-1 6・作成者 7・B0490 1、ui 9 は待ち) |
| `l4-jpword-scan` 当たり計 | 827 | 489 |
| `l4-hooks --round1` 未施工 label | zh 108 / en 127 | **0 / 0** (帰無 2 は太字内で対象外、D-222.6) |
| `l4-hooks` (全規則) 残り | zh 184 / en 127 | zh 35 / en 0 ※ |
| validate 全 244 単元 | exit 0 が 243 (technology-23-63-u05 は既存の jp-origin で exit 1) | 同じ。差分は warn 1 件のみ: technology-16-44-u01 `zh-term terms[1](応答時間).hook_zh 応答時間 → 应答时间（応答時間） not in the zh text` (D-222.9 で受容済) |
| unit_minutes `--check` | 一致 | 一致 |
| `node --test scripts/*.test.mjs` | 108 pass / 1 fail (quiz-fidelity-machdiff、既存) | 同じ |
| `pnpm vitest run` (apps/web) | 118 files / 1344 pass | **1 failed / 1343 pass** (下記) |

※ 全規則の再走査が zh 35 に減るのは、en hook に印が付いたことで「en の CJK 連と一致する zh の引用」(53 label) が検出されなくなったため (en 側の印は検出の手がかりから外される)。第 2 回の 75 label は再走査ではなく `L4c_hooks.json` と `L4_review_samples.json` の `l4c_zh_full_read_candidates` から取る。

### vitest の失敗 (逐字)

```
[fidelity] rendered 8700 (q×locale), fields compared 243600, diffs 179, per-field {"expl-correct":116,"point-0":4,"expl-0":7,"stem-tr":12,"choice-tr-0":2,"choice-tr-1":1,"choice-tr-2":1,"choice-tr-3":2,"expl-1":10,"expl-2":10,"point-1":8,"expl-3":6}, 6384 ms
     × every data-fid field equals the baseline; choices in ア〜エ order; 解答 letter = key 6388ms
 FAIL  src/components/practice/__tests__/fidelity.test.ts > display fidelity vs frozen baseline (2900 × ja/zh/en) > every data-fid field equals the baseline; choices in ア〜エ order; 解答 letter = key
AssertionError: expected [ …(20) ] to deeply equal []
 Test Files  1 failed | 117 passed (118)
      Tests  1 failed | 1343 passed (1344)
```

- 原因: `evidence/phase5/stage_07_ui/baseline.jsonl` は S132 に凍結した表示の hash (quiz データの最後の commit = S131 efix5 の後)。zh の題文・選択肢・解説の文字を変えれば必ず差が出る設計。
- 差 179 = 本施工で変えた sidecar の欄 179 と**種類ごとに完全一致** (expl-correct 116 = correct 116、expl-0〜3 = distractors ア 7 / イ 10 / ウ 10 / エ 6、point-0 / 1 = points 4 / 8、stem-tr 12、choice-tr 6)。表示された先頭 20 件はすべて locale = zh。ja / en の欄はデータで 0 変化 (§3) なので差は出ない。
- 静的データ (`/data/**` shard と loader の比較) を含む他の 117 files はすべて pass。
- **baseline の取り直しは行っていない** (凍結 evidence の更新は主 context の判断。並行 agent が `apps/web/src` の描画を編集中で、今取ると途中の描画が焼き込まれる)。取り直す場合: `cd apps/web && CAPTURE_BASELINE=1 npx vitest run src/components/practice/__tests__/fidelityBaseline.capture.test.ts` (並行 agent の描画変更が落ち着いてから、描画が baseline と同じ commit で)。

## 6. 判断待ち (主 context へ)

1. fidelity baseline の取り直し (時期と、先に描画側の差 0 を確認する手順)。
2. D-143 総 note の置き場 (本書に置いた / key_guard には書いていない)。
3. 2014h26a-q098/q100 の「申请人 / 审批人」と他の題の「申请者 / 审批者」の不一致 (review M-1 LOW) は第 2 回の提案に入れた。
