# L4 第 2 回施工 (Track L、D-221 / D-222 改訂、Rule D `L4_round2_review.md` = APPROVE-WITH-CHANGES)

- 日付 2026-11-11 (S154)。書き手 = oh-my-claudecode:executor (opus)。branch `hosting-cf`、**未 commit** (基準 = `e5aa09fd`)。
- 範囲 = `L4_round2_proposal.md` 全件 + review / 主 session の変更 (session-154 log 末尾):
  - 印を付けない: 匿名・加工 (strategy-02-05-u01 terms[4].hook_zh)、管理 (technology-23-63-u05 terms[1].hook_zh)、追加の「相」(strategy-01-02-u04) は取り下げ。特区・景品・表示・量子 は印。
  - 置換の変更: B0285 →「原型 = 先做出可试用的版本，在早期获得用户的评价」(同題 B0284「先做出可试用的版本让用户评价」と同じ言い方、確認済)、B0438 →「在审计中被指出问题这一检查结果之后」、B0182 →「作为所指出的内容，」・B0404 →「这一イ所指出的内容是恰当的」、strategy-05-14-u05 terms[3].hook_zh →「「[[jp:個人番号]]」（即个人编号）」(one_zh は提案どおり)。
  - その他は提案どおり (writer の逸脱は採択済)。
- 計画ファイル: `node --no-warnings scripts/l4-round2-proposal.ts --final --write` → `L4_round2_final.json` (審査済の `L4_round2.json` は上書きしていない)。印 62 / 外す 17 / 欄 224。
- D-152: quiz データに書くのは本 lane のみ (並行 agent は apps/web の H1-4)。apps/web で触ったのは fixture `apps/web/src/lib/textbook/__fixtures__/v2-units.v1terms.json` の 2 値だけ。`apps/web/messages/zh.json`・fidelity baseline は触っていない。
- 写し (施工前): scratchpad `l4r2/backup/`。

## 要主 session 確認 (未施工)

1. **2010h22a-q006「（ringi 决裁）」系** (括弧内の 3 処、ローマ字 + 簡体字の日本語):
   - 訳 選択肢ア:「将从申请文件的起草到审批（rin-gi 决裁）的一系列流程在网络上进行。」→「将从申请文件的起草到会签审批的一系列流程在网络上进行。」
   - 解説 correct:「申请单起草 → 上级确认 → 会签审批（ringi 决裁）→ 归档」→「申请单起草 → 上级确认 → 会签审批 → 归档」、同欄の選択肢引用「到审批（rin-gi 决裁）的一系列流程」→「到会签审批的一系列流程」(選択肢アと同文に)。
   - 解説 要点 1:「申请、审核、审批（决裁）等」→「申请、审核、审批与最终核准等」(第 2 回の 2019h31h-q002「最终核准」と揃える)。
   - 代案: 括弧を純日本語「（稟議・決裁）」にする (第 2 回の「审批文件（稟議書）」と同じ扱い)。
2. **2009h21a q097〜q100 共通題文「请求书（发票）」×2 (各題)**: 中国語「请求书」は請願書・申請書の意味。題文冒頭が既に「开具图 2 的发票（请款单）」なので、
   - 「**图2 请求书（发票）的格式**」→「**图2 请款单（发票）的格式**」
   - 「- 标题：请求书（发票）」→「- 标题：请款单（发票）」
   - (4 題の stem に同文、各 2 処、計 8。sidecar のみ)

## 1. 変えた欄

| 家族 | 出現 | 欄 |
|---|---|---|
| H-1 | 8 | 7 |
| H-2 | 8 | 7 |
| 指摘 | 23 | 20 |
| 试作 | 38 | 34 |
| UNSURE | 21 | 18 |
| M-4 传票 24・决裁 3・不正当竞争防止法 4 | 31 | 19 |
| M-1 LOW 申请者 / 审批者 | 12 行 | 9 |
| 个人编号 | — | 63 |
| L4-c zh 印 (75 再判定の印 58 + 追加 3 = 降・合・化 + サブロク 1) | 62 label | hook 47 |

- quiz: **141 欄** (解説 114 = `.phase2/expl_tr` 経由、訳 27 = sidecar のみ)、23 試験回を再 merge。
- 単元: **43 単元 83 欄** = B3 loc-part 77 (補丁 77、うち retire + 合成 6: strategy-01-02-u05 p15・strategy-02-05-u03 p05・strategy-05-16-u04 p14・strategy-07-22-u01 p04・technology-23-61-u01 p03・technology-23-61-u04 p10)、unit-level `unit.unit_summary_zh` 3 (technology-15-41-u02・strategy-02-05-u03・strategy-05-14-u05)、title_zh 1 (strategy-02-05-u03、units + `unit_index.json`)、term_zh 2 (strategy-02-05-u03「我的编号法」→「个人编号法」、strategy-05-14-u05「个人番号（My Number）」→「个人编号（My Number）」= manifest.v1_terms + fixture + units)。frozen 単元は対象なし。
  - compat 欄 (merge が導出): explanation_zh 6・definition_zh 2・overview.intro_zh 2・summary.key_points_zh 2・summary.memory_hooks_zh 2・memory_hook_zh 1。
- 个人编号 の付随ファイル: `data/ip/textbook/zh_terms.json` (マイナンバー →「个人编号（My Number）」、マイナンバー法 →「个人编号法」)、`data/ip/textbook/.planning/v2/{strategy-02-05-u03,strategy-05-14-u05}/manifest.json` の v1_terms (gitignored)、`data/ip/textbook/unit_index.json`、fixture。`manifest.v1` は触っていない。
- 補丁 CLI 86 件すべて ✓ (register 80・retire 6)。

## 2. 工具と経過

1. `node --no-warnings scripts/l4-round2-proposal.ts --final --write`
2. `node --no-warnings scripts/l4-r2-apply.ts --out <scratch>/plan.json` (計画: 全 unit の補丁を記憶上で replay → 対象欄 = 終状態・他欄不変、quiz の before = 現値)
3. `node --no-warnings scripts/l4-r2-apply.ts --apply --out evidence/phase5/hosting/L4_apply_round2.json`
   - **attempt 1 中断** (Rule B `failures/phase5/hosting/step_L4-r2_attempt_1.md`): strategy-02-05-u03 で関門が「summary.memory_hooks_zh[0] が対象外」と停止 (hookLines は各行に term_zh を前置するので term_zh 変更で変わる = 正しい compat)。写しから全て戻し (git の data / patches 差分 0、`.phase2` は写しと一致) → 許可表に term_zh → summary.memory_hooks_zh を追加。
   - **attempt 2 完了**。
4. 23 試験回 `node scripts/quiz-phase2-merge.mjs <exam>` (全 exit 0)。

## 3. 検証

| 検査 | 結果 |
|---|---|
| quiz 全欄比較 (写し vs 現 sidecar 全欄) | 変化 141 = 計画 141 (余計 0・欠け 0、jp / en / 非 zh の変化 0)。141 欄すべて、写しの値に出現ごとの置換 (`L4_round2_final.json` occurrence_edits) を順に当てた値と一致。key_guard 変化 0 |
| `quiz-keys-crosscheck.mjs` | ✓ all invariants hold (A1–A7, B1–B7) |
| units 全欄比較 (写し vs 現 units) | 変化 = 計画 83 欄 + 上記 compat 15 のみ、終値 83/83 一致 |
| merged-vs-units | 43 単元とも登録前の差分 (C11 / C18 の既知分) + title_zh (strategy-02-05-u03、C18 と同じ扱い) と一致。merge exit 0/0 が 35、1/1 が 8 (前後同じ) |
| validate 全 244 単元 | exit 0 が 243 (technology-23-63-u05 は既存)。第 1 回後との差 = warn 1 件のみ: technology-13-34-u04 `zh-term terms[3](尺度).hook_zh` (D-222.9 で受容済)。strategy-02-05-u03 の title invariant は unit_index も直したので出ない |
| `textbook-v2-zh-terms.mjs --check-units` (zh_terms 変更後の規定手順) | warn 2 件のみ = 尺度・応答時間 (どちらも D-222.9) |
| unit_minutes `--check` | 一致 |
| `node --test scripts/*.test.mjs` | 108 pass / 1 fail (既存 quiz-fidelity-machdiff) |
| `lang-leak-scan` hits | 3,927 → **3,926** (textbook R-zh-kana 101 → 100 = サブロク) |
| `l4-jpword-scan` LEAK (tb / 訳 / 解説 / ui) | 0 / 4 / 10 / 9 → **0 / 0 / 1 / 9** (解説 1 = B0490 共同利用者 残す、ui 9 = 正答率 待ち)。UNSURE 181 → 50 (多重化・误答・利害关系者・株式・会社・过去问 = 残す語)。当たり計 489 → 345 |
| `l4-hooks` (全規則) 残り | zh 5 label / 4 hook = 匿名・加工・管理・公益・政府 (すべて「外す」判定)、en 0。太字内 帰無 2 (D-222.6) |
| `pnpm vitest run` (apps/web、読み取り) | **1 failed / 1353 passed (120 files)**。失敗は fidelity のみ、v2 corpus (fixture) を含む他は全 pass |

### fidelity の差分 (baseline 未更新、H1-4 後に取り直す方針)

```
[fidelity] rendered 8700 (q×locale), fields compared 243600, diffs 313, per-field {"expl-correct":134,"point-0":15,"expl-2":26,"stem-tr":22,"choice-tr-0":5,"choice-tr-1":4,"choice-tr-2":5,"choice-tr-3":8,"expl-0":23,"expl-1":22,"expl-3":17,"point-1":32}
```

- 期待集合 = 第 1 回 179 欄 ∪ 第 2 回 141 欄 (重なり 16) = **313 欄**、全て zh。`L4_apply_round2.json` の `fidelity.expected_fields` に一覧。
- 種類ごとの件数が 12 種すべて期待集合と一致 (expl-correct 134・stem-tr 22・choice-tr 5/4/5/8・expl-0〜3 23/22/26/17・point-0/1 15/32)。テストが表示する先頭 20 件はすべて locale = zh かつ期待集合内。ja / en はデータで 0 変化。
- 個々の (題・欄) の完全一致は、テストが 20 件しか出さないため件数での照合。baseline 取り直し時 (H1-4 後) に第 1 回と同じ行単位の機械照合を行う。

## 追加施工 (主 session が「要主 session 確認」の 2 件を採択)

- 工具: `node --no-warnings scripts/l4-r2b-quiz-apply.ts` (dry-run、12 置換すべて before が欄内 1 回) → `… --apply --out evidence/phase5/hosting/L4_apply_round2b.json` → `node scripts/quiz-phase2-merge.mjs 2010h22a`。基準 = HEAD (施工前 `git diff HEAD -- data` 空)。
- 置換 12 / 欄 7:
  - 2010h22a-q006 訳 選択肢ア「到审批（rin-gi 决裁）的一系列流程」→「到会签审批的一系列流程」
  - 同 解説 correct「会签审批（ringi 决裁）→ 归档」→「会签审批 → 归档」、「到审批（rin-gi 决裁）的一系列流程」→「到会签审批的一系列流程」
  - 同 解説 要点 1「审批（决裁）等」→「审批与最终核准等」
  - 2009h21a-q097〜q100 訳 stem (各 2):「**图2 请求书（发票）的格式**」→「**图2 请款单（发票）的格式**」、「- 标题：请求书（发票）」→「- 标题：请款单（发票）」
- 全欄比較 (HEAD vs 現在、3 ファイル全欄): 変化 = 上記 7 欄のみ (zh)、各欄 = HEAD 値に置換を順に当てた値。key_guard / jp / en 変化 0。
- `quiz-keys-crosscheck.mjs`: ✓ all invariants hold (A1–A7, B1–B7)。
- 残留: 3 ファイルの「决裁」「请求书（发票）」= 0。
- 走査: `lang-leak-scan` hits 3,926 → 3,926 (漢字だけの語は文字種走査に出ない)、`l4-jpword-scan` 当たり 345 (LEAK 0 / 0 / 1 / 9、UNSURE 50) で変化なし (どちらの語も語表外)。
- vitest (apps/web、読み取り): 1 failed / 1353 passed、失敗は fidelity のみ: `diffs 319, per-field {"expl-correct":135,"point-0":16,"expl-2":26,"stem-tr":25,"choice-tr-0":6,"choice-tr-1":4,"choice-tr-2":5,"choice-tr-3":8,"expl-0":23,"expl-1":22,"expl-3":17,"point-1":32}`。
- **fidelity の期待集合 (更新)** = 第 1 回 179 ∪ 第 2 回 141 ∪ 追加 7 = **319 欄** (追加 7 のうち 2009h21a-q100 stem は既に集合内、新規 6)。一覧は `L4_apply_round2b.json` の `fidelity.expected_fields`。種類ごとの件数 12 種すべて一致。baseline は未更新 (H1-4 後)。
