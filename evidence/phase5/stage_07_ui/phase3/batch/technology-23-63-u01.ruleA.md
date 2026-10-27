# Rule A 全数抽検 — technology-23-63-u01 (人的セキュリティ対策)

- **Auditor**: `oh-my-claudecode:verifier` (opus)。本文の書き手 (workflow writer / critic) とは別 agent・別 context (Rule D)。単元 JSON ほか内容ファイルは一切変更していない。
- **Date**: 2026-10-28 (S135 第 1 批 b01)、repo HEAD `2cca4bb` + 作業ツリーの未 commit 単元 (`git status` = ` M data/ip/textbook/units/technology-23-63-u01.json`、merge 済みの v2)。
- **対象**: `data/ip/textbook/units/technology-23-63-u01.json` (schema textbook-unit-v2)、用語 **5 / 5 = 全数**。単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions) も読んだ。
- **基準**: D-195 (骨格・図・強調・§9)、D-197 (羅列)、D-198 (写し)、D-199 (high 0 かつ medium 0)、D-200 (考点 ≤3・JP 2 文以内・100 字以内)、PLAN_stage7_phase3_batch §0-5 / §0-8 (図種は登録 6 種、登録外図種の欠如は最大 low)。
- **方針**: 過去問の題文・選択肢は引用しない (qid + 言い換えのみ)。

## 1. 方法

1. **全文読み取り**: 各用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption・cell) / quiz` を三語とも、scratchpad の dump スクリプトで用語ごとに整形して読んだ。互換欄 (`definition_* / explanation_* / memory_hook_*`) は parity スクリプトで新欄との一致を確認。
2. **考点 × 引用題の照合**: exam 考点の引用題 8 件 (2015h27h-q063 / 2015h27a-q084 / 2026r08-q094 / 2018h30h-q092 / 2014h26h-q054 / 2016h28h-q089 / 2017h29a-q070 / 2019r01a-q061) と確認題 2022r04-q100 を `data/ip/quiz/questions.json` で再読 (題文・選択肢・`correct_answer`)。主張が正答と一致し、誤答の主張を支持していないことを確認。計算題はこの単元に無い。
3. **関連題の走査**: 全 2900 題から 標的型メール訓練 / 内部不正防止 / 振る舞い検知 / 啓発 / 人的・物理的セキュリティ対策 を含む題を抽出 (8 件、うち 7 件が本 topic)。本文の一般則に反する題は無い。物理的対策の分類題 3 件 (2014h26a-q080 / 2015h27a-q051 / 2025r07-q088) は同 topic の u05 (施錠管理・入退室管理・遠隔バックアップ 等) が担当。
4. **D-198 写し**: (i)(ii) は `textbook-v2-validate.mjs` の copy guard (B7 で図・表・pairs も走査) = 0。加えて独自スクリプトで本単元の JP 文字列 119 本 (図・表・pairs・overview 含む) を topic 内全 217 題の題文 + 選択肢と 12 字連続照合 (カタカナ 4 字以上・英数遮蔽) → **0 件**。(iii) 読んで確認: 例 (駅の構内放送、避難訓練、覆面調査、防犯カメラ、マンション管理規約、ファイルを次々に書き換える挙動) は引用題に無い場面。振る舞い検知の例は題の正答 (外部への不審通信) と別の例を使っている。
5. **D-195 / D-200**: one = 1 文・太字 (5/5)、detail = 3 文 (5/5)、analogy・hook が定義の言い換えでないこと、定義前使用、§9 禁止句 (grep: しょう / 試験では / 問われ / 重要 / 必ず / 非常に / 理解して / 押さえ、zh・en も相当語)、D-197 (見出し語 3 つ以上の羅列なし)、D-200 (考点数 3/2/2/3/2、全て JP 2 文以内・最長 71 字)。
6. **三語**: zh・en が jp と同じ事実を持つか、図ラベル・キャプション・表セルの三語一致、`[[jp:…]]` 原語が jp 本文に実在するか (スクリプト、未一致 0)、zh 簡体字 (繁体字・仮名の検出は全て `[[jp:]]` 由来の互換欄 / 簡体字と同形字の偽陽性)。
7. **v1 比較**: `.planning/v2/technology-23-63-u01/v1-original.json` と比較。v1 で 標的型メール訓練 の inline_quiz がサーバ室運用の題 (無関係) だった点は v2 で 監視 に移されて解消。v1 の事実で v2 から落ちた試験上必要な内容は無い。
8. **機械ゲート**: validate / parity を実行 (§6 に全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 情報セキュリティ啓発 | OK — exam 3 考点 / 4 題。points[0] 全社員・新人研修から・役割に応じて内容を変える ⇔ 2015h27h-q063 (正答 = 役割に応じ変更、誤答 = 対象限定・新人は後で) と 2015h27a-q084 (新人研修に組込む・部門限定は誤り) 一致。points[1] 教育・周知 = 人的対策 ⇔ 2026r08-q094 (人的対策の 2 選択肢が誤答) 一致。points[2] 教育はパッチと並ぶウイルス対策 ⇔ 2018h30h-q092 (a・c) 一致 | OK | OK | L1 |
| 2 | 情報セキュリティ訓練 | OK — exam 1 + mix 1 / 1 題。points[0] 定期 + 事故後にも実施・違反者の再教育に再発防止 ⇔ 2015h27a-q084 (a・b・d) 一致。points[1] (mix) 講義のみ = 啓発 / 実際に試す = 訓練 は pairs と整合、反する題なし | OK | OK (zh one の「反复」付加 LOW) | L4 |
| 3 | 標的型メール訓練 | OK — mix 2 (引用題なし、本 topic に直接の出題なし)。疑似メールは組織計画の無害なもの / 開かないだけでなく報告も評価、は一般的事実として正しい。図 (steps 4: 送る→記録→集計→追加教育) は detail と一致 | OK | OK (validate の zh-term warn は偽陽性) | L2 |
| 4 | 監視 | OK — exam 3 考点 / 3 題。points[0] ログは取得 + 定期監査 ⇔ 2014h26h-q054 (a・b・d、d = ログ取得・定期監査) 一致。points[1] 監督者不在時は作業させない・入退室記録を残す ⇔ 2016h28h-q089 (正答 エ、記録を取らない ウ は誤答) 一致。points[2] 振る舞い検知 = 動きを見て止める・未知の攻撃にも ⇔ 2017h29a-q070 (ウ) 一致。図 (ログ→点検→発見→対処) は points[0] と一致 | OK | OK | なし |
| 5 | 内部不正防止ガイドライン | OK — exam 2 考点 / 1 題。points[0] 基本方針の策定・周知は経営者、責任は経営者 ⇔ 2019r01a-q061 c、points[1] 権限を一人に集中させない・処分の検討 + 再発防止 ⇔ 同 a (誤り)・b (正しい) → 正答 エ (b・c) と一致。図 (考え方 3 例 × 対策) は IPA ガイドラインの基本原則 (やりにくく / 見つかりやすく / 言い訳させない) に合致、「例」と明示。hook (IPA = IT パスポート試験の実施機関) は事実 | OK | OK | なし |

単元レベル: goals 3 点 (三語一致)、overview_rows 5 行 (各 one_line は本文の one と同義、extra 三語一致)、pairs 1 組 (啓発 / 訓練、key 行 = ねらい、2 つ目の用語の後)、key_points 5 点 (事実誤りなし、`summary.key_points_*` は記法除去版と一致)、確認題 4 件 (L3)。`unit_summary_*` に制作メモなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 4** (うち 建议修 1)

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 | 建议修 |
|---|---|---|---|---|---|
| L1 | LOW | `terms[0].points[1].text_{jp,zh,en}` | 引用題 2026r08-q094 の正答は「災害に備えて別の場所に予備のシステムを置く」型の物理的対策だが、考点は物理的対策の例を「施錠や入退室管理」(建物・設備) だけで示す。誤った事実ではなく、消去法 (人的 2 つ・技術的 1 つ) で正答できるが、災害対策・遠隔地の予備設備を技術的対策と取り違える余地が残る。なお物理的対策そのものは u05 が担当 | jp 末文を「施錠や入退室管理、災害に備えて離れた場所に予備の設備を置くことなど、建物・設備に関わる対策は物理的対策として区別する。」/ zh「上锁、出入室管理，以及为防灾在异地准备备用设备等与建筑和设备有关的措施属于物理措施，二者要区分开。」/ en "Measures tied to buildings and equipment, such as locks, entry control and keeping backup equipment at a distant site in case of disaster, are physical measures and belong in a separate category." (12 字照合: 選択肢の該当句とは語が異なり連続一致なし。JP 100 字以内を維持) | **建议修** |
| L2 | LOW | `terms[2].detail_zh` (validate warn `ファイル → 文件`) | jp「添付ファイル」を zh「附件」と訳しており正しい訳。zh_terms 表の部分一致による偽陽性 | 変更不要 (記録のみ)。必要なら validate 側で「添付ファイル → 附件」を例外登録 | 否 |
| L3 | LOW | `challenge_questions[1]` = 2022r04-q100 | 確認題のうち 1 件 (マルウェア感染が疑われたときの最初の行動 = ネットワークから隔離) は本単元の本文で扱っていない (v1 から引継ぎ。確認題の構成は §0-9 の不変量側)。誤った知識を教えるものではない | 変更不要 (記録のみ)。将来 u01 の確認題を見直すなら、本文が扱う 2016h28h-q089 などへ差し替えを検討 | 否 |
| L4 | LOW | `terms[1].one_zh` (+ 互換 `definition_zh`) / `one_en` | jp「正しい対応を実際に行えるよう練習させる」に対し zh「反复练习」/ en "practice until" が反復のニュアンスを足している。detail に「定期的に繰り返して」があるため事実の追加にはならない | 任意: zh「让员工**练习到能够实际做出正确应对**的活动」 | 否 |

確認済みで問題なし (指摘しないもの): `terms[3].points[1].text_jp` の「重要な部屋」(§9 の誇張語ではなく部屋の性質)、en の "exam" 出現 (hook の事実記述と表見出しの Example のみ)、`[[jp:]]` 原語 (全件 jp に実在)、zh 繁体字 (検出は「限」等の同形字のみ)、三語の図ラベル・キャプション・表セル (全一致)、monitor の語源 (ラテン語 monitor = 忠告・警告する者) と「啓 = ひらく」「訓・練」の字義。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **4** (建议修 1: L1 / 記録のみ 3: L2 L3 L4) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。事実誤り 0、全 exam 考点 (10 件、引用 8 題) が正答と一致、D-195 / D-197 / D-198 / D-200 の違反なし、三語一致。推奨 LOW 修正: L1 (物理的対策の例に災害対策を追加)。

## 6. 機械ゲート出力 (verifier 実行、2026-10-28)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-63-u01
✓ technology-23-63-u01 unit: 0 issues (data/ip/textbook/units/technology-23-63-u01.json), 1 zh-term warning(s)
  warn  zh-term  terms[2](標的型メール訓練).detail_zh  ファイル → 文件 not in the zh text (data/ip/textbook/zh_terms.json)
exit=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-63-u01
✓ technology-23-63-u01 parity: 25 locations, 0 diff
exit=0
```

追加の独自検査 (scratchpad `ra_u01.cjs`、未入库): JP 文字列 119 本 × topic 217 題 12 字照合 hits 0 / D-200 考点 12 件 全て ≤2 文・≤71 字 / `[[jp:]]` 未一致 0 / §9 grep 該当は全て偽陽性。

## §再審 (verifier、L1 補丁後、2026-10-28)

対象は `terms[0].points[1].text_{jp,zh,en}` だけ。B3 補丁 p01 / p02 / p03 (status active、base `afe9c59f2b7a…`、`textbook-v2-patch.mjs --list` で確認) を適用して re-merge した未 commit の単元。

| 観点 | 判定 | 根拠 |
|---|---|---|
| 事実 (2026r08-q094) | **解消** | 物理的対策の例に「災害に備えて離れた場所に予備の設備を置く」が入った。これは題の正答 (イ) の型と一致する。人的対策 (教育・周知) が誤答 2 つに当たる点はそのまま |
| 三語 | OK | zh「为防灾在异地准备备用设备」/ en "keeping backup equipment at a distant site in case of disaster" は jp と同じ意味。追加も欠落もない。太字と `[[jp:人的セキュリティ対策]]` も変わらない |
| D-198 | OK | 考点の JP を topic 内 217 題の題文・選択肢と 12 字連続照合した結果、0 件。選択肢とは語が異なる (「遠隔地」「バックアップシステム」は使っていない) |
| D-200 | OK | JP は 2 文・91 字 (100 字以内)。この用語の考点数は 3 のまま |

- 機械ゲートを再実行した。validate は `0 issues`、zh-term warn 1 件 (L2 と同じ偽陽性)、exit=0。parity は `25 locations, 0 diff`、exit=0。
- **判定**: L1 は**解消**。単元は **PASS** のまま (HIGH 0 / MEDIUM 0 / LOW 3、いずれも記録のみの L2 L3 L4)。

```
✓ technology-23-63-u01 unit: 0 issues (data/ip/textbook/units/technology-23-63-u01.json), 1 zh-term warning(s)
  warn  zh-term  terms[2](標的型メール訓練).detail_zh  ファイル → 文件 not in the zh text (data/ip/textbook/zh_terms.json)
exit=0
✓ technology-23-63-u01 parity: 25 locations, 0 diff
exit=0
```
