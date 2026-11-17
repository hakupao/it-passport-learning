# C28 / D-235 Rule D 独立レビュー (S163)

- reviewer: oh-my-claudecode:code-reviewer (opus)。writer (main / executor opus / critic opus ×4) とは別の agent・別 context。
- 対象: 未コミット差分 (scripts 2・quizReader/quizModel・テスト 6・sidecar 25・baseline.jsonl・docs 2) + 未追跡 `data/ip/quiz/key_recheck.json`・`evidence/phase5/hosting/c28/`。

## 判定: **APPROVE** (HIGH 0 / MEDIUM 1 / LOW 6、いずれも非ブロック)

## 実行した検証 (結果)

| 検証 | 結果 |
|---|---|
| `cd apps/web && npx vitest run` | 133 files / 1487 tests 全 pass (skip/todo 0) |
| `npx tsc --noEmit` | exit 0、エラーなし |
| `node scripts/quiz-keys-crosscheck.mjs` | `✓ all invariants hold (A1–A7, B1–B7)`、layerB=ran |
| sidecar 25 本: HEAD と JSON 比較 (key_guard.recheck を除去して深い一致) | 25/25 一致、差分は recheck 84 個の追加のみ、cleared=84 |
| baseline.jsonl: HEAD と行ごと比較 | 8701 行中 252 行 (=84×3) 変化、変化した欄は `suspect: true→false` のみ |
| 盲目入力 `input_b{1..4}.json` の欄 | `id / stem_jp / choices_jp / figures` のみ。`correct_answer`・`key_guard`・`explanation`・`distractors`・`matches_key`・「正解」・`answer` の出現 0 |
| 図の網羅 | has_figure 37 題すべて図ファイルあり (欠け 0)、空 stem 0 |
| recheck の分布 | high/true 83・medium/true 1、low 0、info_sufficient=false 0、mismatch 0 |

## 1. 正しさ・一貫性

- cleared 規則 `derived_answer === key ∧ info_sufficient === true ∧ confidence !== "low"` は merge (`scripts/quiz-phase2-merge.mjs:159`) と crosscheck (`scripts/quiz-keys-crosscheck.mjs:99`) で同一。`compare.cjs` の `note` 文言とも一致。
- 表示側 `quizReader.ts:118` は `key_guard.suspect === true && recheck?.cleared !== true`。テスト (`explanationSuspect.test.ts`、`staticData.test.ts` の `expectedExplanation`) も同じ式。
- key_guard を直接読む表示経路は無い: `isSuspect` (`quizModel.ts:285`) は `q.suspect || q.explanation.suspect` だけを見ており、shards (`shards.ts:197,216`)・AI 先生 anchors (`sensei/anchors.ts:103,165`)・ExplanationPane (`ExplanationPane.tsx:181`) はすべて loader が計算した `explanation.suspect` を通る。mock / record に suspect 参照なし。→ 旧フラグが残る経路なし。
- 漏えい: `projectExplanation` (`shards.ts:209-221`) は whitelist (suspect/correct/distractors/points) で key_guard ごと落とす。`FORBIDDEN_KEYS` に `key_guard`・`note_jp`・`derived_answer` があるため、recheck は親でも中身でも走査に掛かる。既存の `out/` (旧 build) の `recheck` 一致は教科書本文の英単語 (「Regression testing rechecks…」) のみ。

## 2. テスト

- 6 本とも suspect 表示経路のテストを合成データ (実題の `explanation.suspect` を true に上書き) で残しており、assert は弱まっていない。`.only` / `.skip` なし。
- `fidelity.test.ts`: generate 時の 84 という anchor を残し、表示 0 (= baseline の suspect 行 0) を新しい anchor にした。妥当。
- `explanationSuspect.test.ts`: recheck を持つ id 集合 = generate 時 suspect の id 集合、の等値を追加しており、規則の取りこぼしを捕まえられる。
- `PracticeSession.ssr.test.ts:563-575`: 否定側の `plain` は今は `base` と同じ実題になる見込みだが、「上書きなしなら表示されない」の確認になっているので、意味はむしろ強い。

## 3. 盲目再導出の健全性 (スポットチェック 5 題、正解キーと図を見て確認)

| id | key | 導出 | 確認 |
|---|---|---|---|
| 2009h21a-q091 | ウ | ウ | 100×0.7=70 → 残 30 → 優先 10 → 残 20 → 20×0.7=14。正しい |
| 2015h27a-q091 (旧 unsure) | ウ | ウ | 表の売上比率・粗利率の比較、ア/イ/エの反証も正しい |
| 2015h27a-q095 (旧 unsure) | イ | イ | 図 (`public/quiz-figures/2015h27a-q095.webp`) を確認: D の最早 = max(1+4, 3, 2+5)=7、工程 2 の最遅開始 3、余裕 2。正しい |
| 2015h27a-q098 (旧 unsure) | ウ | ウ | 一体型 PC 無償、3,240+4,320=7,560。正しい |
| 2016h28a-q068 | イ | イ | ESSID。正しい |

5/5 で推論・結論ともに妥当。

## 4. Docs

- session-163 の「C28 調査 / 決定 / C28 施工」と STATE の D-235 は、実際の施工内容 (入力欄・84/84・medium 1 = 2020r02o-q025・merge/reader/crosscheck の変更・sidecar 差分は recheck のみ・generate 時の suspect 84 は保持・テスト 6 本) と一致している。「表示 suspect = 0」も baseline と test で裏付けられる。

## 指摘

### [MEDIUM] 盲目性は自己申告に頼っており、prompt も記録されていない (confidence: MEDIUM)
- 場所: `evidence/phase5/hosting/c28/` (`suspects.json` が `input_b*.json` と同じディレクトリにある)、`evidence/phase5/hosting/subagent_prompts/` (C28 の prompt なし)
- 問題: `suspects.json` には `key`・final/round1 の `derived_answer`・note が入っており、入力と同じフォルダにある。critic agent は repo を読める状態で動いたため、盲目性の根拠は「入力と図以外を開いていない」という agent の報告だけ。4 本の prompt も残っていない (Tier 3 の subagent_prompts 規約)。スポットチェック 5/5 は正しく、題も標準的な知識問題・計算問題なので、結果を疑う具体的な証拠は無い。ただし監査で追跡できない。
- 修正: (a) 4 本の盲目 prompt (読ませたファイル・禁止事項・出力 schema) を `evidence/phase5/hosting/subagent_prompts/C28_blind_recheck.md` に残す。(b) session log に「盲目性 = 入力から鍵を外したこと + agent の自己申告。repo 読み取りは技術的に遮断していない」と一行で明記する。(c) 余力があれば次回以降は入力を scratch へコピーし、鍵の入ったファイルを同じディレクトリに置かない。

### [LOW] crosscheck が `by` の一致を見ていない (confidence: HIGH)
- 場所: `scripts/quiz-keys-crosscheck.mjs:100`
- 問題: derived_answer・cleared・note_jp は比べているが `by` は比べていない。derived_answer の値域と note の空チェックは merge 側 (`quiz-phase2-merge.mjs:157-158`) にしかない。
- 修正: 条件に `|| sr.by !== rc.by` を足す。必要なら値域チェック `["ア","イ","ウ","エ","unsure"]` も crosscheck に複製する。

### [LOW] `FORBIDDEN_KEYS` に `recheck` がない (多層防御) (confidence: HIGH)
- 場所: `apps/web/src/lib/staticData/forbidden.ts:7-31`
- 問題: 今は `key_guard` (親)・`note_jp`・`derived_answer` で守られているので漏れない。ただ、将来 recheck を別の場所に持ち上げると `cleared`・`by` は走査に掛からない。
- 修正: `"recheck"` (と `"info_sufficient"`) を追加する。`cleared`・`by` は一般語なので誤検出に注意。

### [LOW] `suspect_count` が「表示数」ではなくなった (confidence: HIGH)
- 場所: `scripts/quiz-phase2-merge.mjs:202`、`scripts/quiz-keys-crosscheck.mjs:106`
- 問題: sidecar top-level の `suspect_count` は generate 時の 84 のままで、表示は 0。意図通り (監査証跡) だが、名前だけ読むと誤解しやすい。
- 修正: merge・crosscheck のコメントに「generate-time count (D-235 以後、表示数とは別)」と一行添える。必要なら `suspect_displayed_count` を追加する。

### [LOW] prep の表示 stem 選択が表示側と微妙に違う (confidence: HIGH、影響 0)
- 場所: `evidence/phase5/hosting/c28/scripts/prep.cjs:16` と `apps/web/src/lib/quiz/quizModel.ts:128`
- 問題: prep は `stem_jp_clean ?? stem_jp`、表示は `stem_jp_clean?.trim() ? stem_jp_clean : stem_jp`。空白だけの stem_jp_clean があると入力が空になる。今回の 84 題では空 stem 0 で、影響はない。
- 修正: 再利用する時は表示と同じ trim 判定にする (証跡スクリプトなので今回は修正不要)。

### [LOW] key_recheck.json が無いと merge は黙って recheck なしで動く (confidence: MEDIUM)
- 場所: `scripts/quiz-phase2-merge.mjs:62`、`scripts/quiz-keys-crosscheck.mjs:78`
- 問題: ファイルが消えると、merge は recheck なしの sidecar を作り、crosscheck も両側とも空なので通る。ただし `explanationSuspect.test.ts` / `fidelity.test.ts` の「表示 0」anchor が落ちるため、vitest では検出される。
- 修正: 任意。D-235 以後は必須ファイルとして、無ければ merge を error にする。

### [LOW] `out/` は旧 build のまま。release 前に再 export + 走査が必要 (confidence: HIGH)
- 場所: `apps/web/out/`
- 問題: 本レビューでは unit test 側の漏えい検査 (allowList / shard projection) だけを確認した。新しい sidecar での `out/` 走査は未実施。構造上 key_guard は出ないが、push 前の `check:release` (pre-push hook) で確認される前提。
- 修正: commit/push 時に通常の pre-push `check:release` を通す (追加作業なし、確認だけ)。

## 良い点
- generate 時の union (anti-masking) を消さずに `recheck` を重ねて、表示だけを上書きした設計。監査証跡が残り、元に戻すのも JSON 1 ファイルで済む。
- cleared 規則を crosscheck が key_recheck.json から独立に再計算しており、sidecar の改ざん・merge 忘れを検出できる。未知 id の検査もある。
- sidecar 差分が recheck のみ、baseline 差分が suspect 欄のみであることが機械的に確認できる、きれいな差分。
- テストは anchor の意味を「generate 84 / 表示 0 / id 集合一致」に分解して保ち、表示経路は合成データで引き続き覆っている。
