# Rule B — S110 / 2013h25a generate: session-limit 中断 (2 agent)

- **run**: `wf_31a49c29-025` (task `wdvvuag84`), 2026-08-11 JST
- **規模**: 427 agent / 13.27M tok / ~69 分。**425 done / 2 error**
- **error**: `You've hit your session limit · resets 3am (Asia/Tokyo)` ×2

## 落ちた 2 agent

| label | phase | 影響 |
|---|---|---|
| `retr:2013h25a-q088#1` | Translate (リトライ) | round-1 の TR-Review が `points[1].en` の途中切れ (「…the overall schedule does not」で終端、JP の結論部「最後に終わる工程に手を付けなければ全体は縮まらない」が欠落) を high で指摘 → リトライ翻訳が起動した直後に limit 直撃。**disk 上の expl_tr は切れたままの round-1 版** |
| `trrev:2013h25a-q089#2` | TR-Review (round 2) | 検証が完走せず `tr_verdict = null` |

## 有損判定

**テキストの損失なし**。両者とも「既存の成果物を上書きする前」に落ちており、
`expl_tr_2013h25a-q088.json` / `-q089.json` はいずれも disk 上に存在する。
ただし q088 の en は**不完全な文のまま**なので、そのまま出荷してはならない。

## 復旧

limit reset (3am JST) 後に `resumeFromRunId: wf_31a49c29-025` で再走。
cached agent は replay され、落ちた 2 件だけが実走する。

## 教訓

S106/S107/S108/S109 と同じ session-limit パターンで、**5 session 連続**。
今回は 2 exam の generate を並列に走らせたため到達が早まった可能性がある
(2014h26h 13.18M + 2013h25a 13.27M = 26.5M tok を同一 session 内で消費)。
並列化は wall-clock を ~1 時間縮めたが、limit 到達点を前倒しするトレードオフがある。

---

## 追記 — 穴埋めの過程で判明した、より大きな欠陥 2 件

session limit で落ちた 2 agent を埋めに行ったところ、**中断とは無関係な既存の訳文欠陥**が
2 件出てきた。いずれも in-pipeline TR-Review が PASS/見逃しで通していたものである。

### (1) q088 — 訳文全体が JP 源の翻訳になっていなかった (FAIL)

落ちた `retr:q088#1` の代わりに新しい検証者へ**訳文全体**を渡したところ **FAIL**。
「現行 JP の翻訳ではなく、別系統で独立生成された解説と判断される」。欠陥 6 クラス:

1. **日付の系統的ドリフト** — JP は変更計画の外部調達管理の終了を一貫して「**9月初**」と
   書くのに、訳文は該当 **6 箇所すべて**で「8月末 / end of August」。本問はガントチャートを
   月目盛で読む設問なので、解説が図と半月ずれる。
2. correct の対比節が JP と別物 (「受入試験・検収が 10月中旬まで残る」→「並行余地が 0.5か月」)
3. JP に無い「0.5 + 0.5 = 1か月」の加算論を追加
4. 図1 の軸説明・当初計画の開始日・「最も遅く終わるのは流通計画・プロモーション」が脱落
5. 誤答ウ/ア/エ に JP 不在の概念を捏造 (市场营销/瓶颈、software acquisition side など)
6. points[0] に points_jp[1] の内容が混入

→ **zh/en を JP 源から全面再訳** (`wf_84959453-d8b`)。writer=general-purpose、
検証=**pr-review-toolkit:code-reviewer** (前段の feature-dev:code-reviewer とも別 = 三役独立)。
**PASS / 5 checks 全 true (dates_consistent 含む)、時点表現 21 件を逐一突合**。
是正前テキストは `failures/quiz_phase2_S110_2013h25a_q088_tr/` に退避 (削除しない)。

### (2) q093 — points が JP 3 件に対し訳文 2 件 (1 件まるごと欠落)

merge の validation で初めて露見。欠落していたのは points_jp[0]「中問形式では冒頭の共通記述の
命名規則を正確に読み取りそのまま適用することが鍵」という**中問の読み方**の要点。
しかも in-pipeline TR-Review は **completeness=true / PASS** を返していた。

→ points 3 件を 1:1 で再訳 (`wf_71c6cf3e-fa0`)、別 subagent_type が核験して
**PASS / count_matches・one_to_one 含む 5 checks 全 true**。旧訳は
`failures/quiz_phase2_S110_2013h25a_q093_tr/` に退避。

### 恒久対策

**LLM レビュアーに配列要素の数を数えさせない**。`quiz-phase2-verify-result.mjs` に決定的な
構造チェックを追加した (S110):

- `points` の件数が JP と一致するか
- `distractors` の字母集合が JP と一致するか
- 訳文フィールドに空文字が無いか

負例 (是正前の 2013h25a) で FAIL、正例 (2014h26h) で PASS することを確認済み。
両 exam 全 200 問に対する構造 sweep では **q093 の 1 件のみ**が該当だった。

### 所見

穴を埋める作業そのものより、**穴を埋めるために新しい検証者を当てたことの副産物**が大きかった。
session limit という偶発的な中断が無ければ、q088 の訳文は FAIL 品質のまま出荷されていた。
「落ちた分だけを埋める」ではなく「落ちた対象を**一から検証し直す**」を既定にすべき。
