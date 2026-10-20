# S129 L2a — source page pointer 1 頁ずれの全 29 exam 走査 (⑨ #5)

- lane: L2a (再走)、READ-ONLY (D-152)。data/・既存 evidence・failures/ の変更 0、git 操作 0。
- 起点: `evidence/quiz_full52_summary.md` §7.1 #5、U6 `evidence/quiz_full52_u6_S125.md` §4n (bigram 法)。
- 新規ファイル: 本書、`evidence/S129_L2a_pageoffset_candidates.json`、`scripts/quiz-pageoffset-scan-S129.mjs`。
- 入力: `question_bank.json` の snapshot (2026-10-20 19:10 JST、sha256 `ca077060…a97c`)。B11/B13 fixer が並走中のため固定した。
  snapshot 時点で `2010h22a-q062/q063` は 24 に是正済、`2009h21a-q093` は 36 のまま (未是正)。走査後の 19:3x に bank を再読し、q093 も 37 に是正済であることを確認した。

## 1. 方法

1. **OCR キャッシュ** (新規の vision 読みはしない): 全 29 exam × 全頁 = 1450 頁を `sips` で 2 倍 → `tesseract 5.5.2 -l jpn --psm 4`。
   既存の頁テキストは無かった。precrop report (`_precrop_report.json`) は 11 exam 分しかなく、見出し OCR (帯先頭のみ) で全文がない。
   キャッシュは scratch (`/private/tmp/claude-501/s129-l2a/ocr/`) に置き、data/ には書いていない。空出力 6 頁 (旧 exam の表紙/注意頁 page-02、2010h22h page-03) には記録問がない。
2. **採点** (`scripts/quiz-pageoffset-scan-S129.mjs`): 両辺を NFKC にし、空白と約物を除去する。
   stem_jp 先頭 60 字の bigram 集合と、選択肢連結の先頭 80 字の bigram 集合を、**別々に** exam 全頁の bigram と照合する (containment)。
   - **MISMATCH**: stem の最良頁 ≠ 記録頁、差 ≥ 0.3、最良 ≥ 0.5
   - **LOW_CONF**: 記録頁の stem 一致 < 0.5、または差の小さい不一致
   - **CHOICES_NEXT** (情報のみ): stem は記録頁に合うが、選択肢は次頁 (B10 q095 型。ずれではない)
   - 影響区分: fidelity manifest が agent に渡すのは source=記録頁 / prev=記録頁−1。stem がこの窓の外にあれば `STEM_OUTSIDE_WINDOW` (agent に設問が見えない。B11/B13 型)。
     前頁にあれば `STEM_PREV`、題幹が前頁で選択肢が記録頁なら `SPLIT_STEM_PREV`。
3. **補助信号**: `mappings/<exam>_vision.json` (Claude vision 対応表) と `_pages.json` (見出し検出 + 補間) を bank と照合した (`map_disagree`)。
   OCR 本文中の「問NN」見出しの有無は裏付けにだけ使う (slashed zero の化けがあるため、それ単独では判定しない)。
4. `figure_page_*` (D-145、50 件) は対象外。bigram では図の位置を検証できない。整合性 (≠ page_number、PNG が実在する) は crosscheck B7 が既に検査している。図の位置は L2d の担当。

## 2. 結果 (live、snapshot 対象)

| exam | MISMATCH | LOW_CONF | CHOICES_NEXT | map 不一致 |
|---|---|---|---|---|
| 2009h21a | 1 (q093) | 0 | 6 | 8 |
| 2012h24a | 1 (q088) | 0 | 3 | 5 |
| 2015h27a | 2 (q087, q088) | 0 | 4 | 6 |
| 2016h28h | 1 (q049) | 0 | 4 | 5 |
| 2018h30h | 0 | 1 (q007) | 4 | 4 |
| 2024r06 | 1 (q058) | 0 | 5 | 5 |
| 他 23 exam | 0 | 0 | 0〜7 | 1〜8 |
| **計 2900 問** | **6** | **1** | 100 | 130 |

全行は candidates JSON の `live.summary.per_exam` にある。

### 2.1 判定 (候補はすべて頁 PNG または OCR 本文で確認した)

| id | 記録 | 実際 | 区分 | 判定 |
|---|---|---|---|---|
| `2015h27a-q087` | 37 | **38** | STEM_OUTSIDE_WINDOW | **確定ずれ (新規)**。page-38 中段に〔テクノロジ〕問87 の題幹とア 49 / イ 126 / ウ 162 / エ 164 がすべてある (目視)。page-37 は問86。**agent には設問が見えない** (B11 q062 型の重さ)。図 (図1) は page-36 で、figure_page_number=36 は維持する。 |
| `2016h28h-q049` | 23 | **22** | STEM_PREV | **確定ずれ (新規)**。page-22 下段に問49 と ア〜エがすべてある (目視)。page-23 の先頭は問50。prev 窓の内側なので agent には見えていた。 |
| `2024r06-q058` | 26 | **25** | STEM_PREV | **確定ずれ (新規)**。page-25 下段に問58 (マクロ) と ア〜エがある (目視)。page-26 の先頭は問59。prev 窓の内側。 |
| `2009h21a-q093` | 36 | 37 | STEM_OUTSIDE_WINDOW | 既知 (B13 prep §0)。bank は是正済。 |
| `2015h27a-q088` | 39 | 38 / 39 | SPLIT_STEM_PREV | **規約判断**。題幹は page-38 下半、図3 とア〜エは page-39 (目視)。記録 39 でも窓内に両方がある。 |
| `2012h24a-q088` | 37 | 36 / 37 | SPLIT_STEM_PREV | **規約判断**。題幹とワークシート説明は page-36、ア〜エ (IF 式 4 本) は page-37 (OCR)。窓内に両方がある。 |
| `2018h30h-q007` | 4 | 4 | LOW_CONF | **偽陽性**。page-04 に問7 がある (目視)。stem の OCR 一致が低い (0.22)。 |

- 新規の確定ずれは **3 件** (q087 / q049 / q058)。うち agent に設問が見えないものは 1 件 (`2015h27a-q087`)。
- 3 件はいずれも vision 対応表が bank と同じ誤りを持つ。見出し対応表 (`_pages.json`) は正しい頁を指す (h38 / h22 / h25)。

## 3. 再現率 (既知陽性 12 件)

是正済の問は、`--override` で是正前の頁を注入して再走させた (bank は書き換えない)。

| 既知陽性 | 注入値 | 結果 |
|---|---|---|
| 2010h22a q089 / q090 / q091 / q092 (S115) | 35 / 36 / 36 / 36 | 4/4 MISMATCH (OUTSIDE_WINDOW) |
| 2021r03 q051 / q053 (U6) | 23 / 24 | 2/2 MISMATCH |
| 2014h26h-q089 / 2015h27h-q089 (S118 で題幹頁を移動) | 38 / 38 | 2/2 MISMATCH |
| 2010h22a q062 / q063 (S129 B11) | 23 / 23 | 2/2 MISMATCH |
| 2009h21a-q093 (S129 B13、snapshot では未是正) | live | MISMATCH |
| 2009h21h-q097 (S115、中問C 前文頁) | 42 | **LOW_CONF** (stem 0.83 → 1.00。前文が題幹語を多く含む) |

- **MISMATCH で 11/12、LOW_CONF まで含めると 12/12**。
- 注入した走査の MISMATCH は 16 件 = 注入した 10 件 (q097 は LOW_CONF) + live の 6 件。注入しても live の 6 件は変わらない (注入が他の問に波及しない)。

## 4. 精度

- 全頁を目視または OCR で検証済の exam: 2009h21h (B12、誤り 0) は候補 0 = 偽陽性 0。2009h21a (B13、誤り q093 のみ) は候補 1 = 真陽性 1。
- 全体: MISMATCH 6 のうち、確定ずれは 4 (既知 1 + 新規 3)。残る 2 は題幹と選択肢が頁をまたぐ規約問題で、誤検出ではない。LOW_CONF 1 は偽陽性。
- 弱点:
  - CHOICES_NEXT は記号的な選択肢 (①〜④、d/e/f) では検出できない。B10 の `2010h22h-q095` (選択肢が page-45) は拾えなかった。
  - map 不一致 130 のうち 114 は `_pages.json` の雑音 (表紙の見出し誤検出、補間など) で、単独のトリガーには使えない。
  - vision 不一致 15 のうち 11 は是正済の問 (vision が誤り、bank が正しい)。

## 5. 推奨

1. **D-152 lock 保持者が MOVE_QUESTION を 3 件適用する** (`quiz-pagefix-apply.mjs`、判定 JSON の形式は U6 の `pagefix_S125_u6_decisions.json` と同じ):
   `2015h27a-q087` 37→38 (figure_page 36 は維持)、`2016h28h-q049` 23→22、`2024r06-q058` 26→25。
   - 3 exam が B / A track のどの段階にあるかは本 lane で確認していない。fidelity 実行の前に直せば、manifest の再生成だけで済む。
   - q087 は記録どおりの窓 (page-37 / page-36) では設問が見えない。**既存の fidelity 結果があれば再確認が必要**。
2. **規約の決定 (lead)**: 題幹と選択肢が頁をまたぐ問で、`page_number` を題幹頁と選択肢頁のどちらにするか。
   現状は混在している (B10 q095 = 題幹頁、2012h24a-q088 / 2015h27a-q088 = 選択肢頁)。
   manifest 窓 (prev+source) は、どちらの規約でも「題幹頁 = 記録 or 記録−1」なら成立する。そこで規約は「**page_number = 題幹頁、選択肢が次頁なら manifest に next を足す**」を推奨する。
3. **恒久ゲート案** (未実装、提案のみ):
   - 誤りの入口: `scripts/map-questions-to-pages.mjs` の Claude vision 対応表 (3 頁ずつのバッチ)。
     「1 問ページ / 頁またぎ」の直後で 1 頁繰り上がる。見出し検出 (`_pages.json`) は 3 件とも正しかったが、bank 構築では採用されていない。
   - ゲート: `quiz-keys-crosscheck.mjs` に新規則 **B8「題幹頁の本文照合」**を足す。
     OCR キャッシュ (exam×頁 txt、生成スクリプトごと再現可能にする) に対して本 script と同じ stem containment を計算し、`MISMATCH` (差 ≥ 0.3) を fail、`LOW_CONF` を warn とする。
     MISMATCH は `quiz-pagefix-apply.mjs` の MOVE_QUESTION 判定 JSON (目視の根拠付き) でしか解消できない。新しい修正経路は作らない。
   - 誤報の抑止: 規約で認めた頁またぎ (題幹頁 = 記録頁) は `SPLIT` として許容する。中問の前文頁と競合する場合 (2009h21h-q097 型) は warn にとどめる。
   - 実行時間: OCR は 1450 頁を 8 並列で約 6 分、照合は数秒。OCR キャッシュの置き場 (data/ 下の gitignore 領域か) は lead の判断。
