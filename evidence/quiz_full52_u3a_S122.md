# ⑤-2 全量保真掃引 U3a — 2018h30h の集計と是正 (S122)

⑤-2 全量核験の **U3a** (`docs/phase5/PLAN_52_units.md` §2 の U3 前半)。母数は
`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の 2018h30h (総 100 問 − 既往双 pass 済 30 問)
= **70 問**。U1 (S120) で PASS した **Sonnet 5 単 pass** 方式を初めて本番 unit に適用した回。

---

## 1. 入力と実行

- run: `wf_fb2409c7-386` (S122 log §「run」)。model = **Sonnet 5**、単 pass (U1 A/B PASS を受けた既定)
- マニフェスト: `data/ip/quiz/.phase2/u3a_fidelity_input_2018h30h.json` (`--precrop` 版、crop 69/70。`q043` のみ crop 無しで源ページ読み)
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u3a_2018h30h_sn.json`
- **覆盖 70/70 / UNREADABLE 0 / agents_error 0**
- 是正器: `scripts/quiz-fidfix-S122-u3a.mjs` (assert-once / 冪等 / `--dry-run`) +
  `scripts/quiz-choicefig-D144s2.mjs --only 2018h30h-q005` (D-144 段 2)

### Sonnet 単 pass の実測 (U1 との対照)

| 項目 | U1 (2015h27a 68 問、Sonnet) | **U3a (2018h30h 70 問、Sonnet)** |
|---|---|---|
| token | 4,030,000 | **4,249,378** |
| 時間 | 15 分 | **26.2 分** (並行度の差。token/問はほぼ同じ) |
| tool 呼び出し | — | **601** (8.6 回/問) |
| part 壊れ | 2/68 → journal 復元 | **2/70** (`q005` / `q036`) → `quiz-fidelity-merge-parts.mjs --journal` で復元 |
| UNREADABLE | 0 | **0** |

> `journal.jsonl` が part の正である (S120 の教訓) ことが本 unit でも再現。壊れた 2 part は再 run 不要で復元できた。

---

## 2. 率

| exam | n | agent DISCREPANT | 率 | +machdiff | 計上 (率) | **是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|---|
| 2018h30h | 70 | **8** | 11.4% | **+0** (残差 5 は偽陽性) | 8 (**11.4%**) | **8 (11.4%)** | **2** | **1** |

- **severity 内訳** (13 差分): cosmetic **7** / semantic **5** / answer_affecting **1**。
- **正解肢上 2** = `q005` choice.イ (answer_affecting) / `q063` choice.ア (cosmetic)。
- `correct_answer` 変更 **0 / 2900**、`data/ip/exams/answer_keys.json` **バイト不変**。
- 単 pass のため severity の pass 間不一致は構造的に発生しない。裁定は主 context の原寸実読による (§4)。

### 既往波との比較

| | 標本 | 計上 | 率 | 正解肢上 | answer_affecting | 抄写 model |
|---|---|---|---|---|---|---|
| ⑤-3 (層化抽検 4 exam × 20) | 80 | 14 | 17.5% | 5 | 1 | Opus 双 pass |
| 波 1 (2015h27a + 2016h28a) | 152 | 13 | 8.6% | 3 | 1 | Opus 双 pass |
| 波 2 (2016h28h + 2017h29a) | 158 | 15 | 9.5% | 3 | 0 | Opus 双 pass |
| 波 3 (2017h29h + 2018h30a) | 152 | 12 | 7.9% | 0 | 1 | Opus 双 pass |
| **U3a (2018h30h)** | **70** | **8** | **11.4%** | **2** | **1** | **Sonnet 単 pass** |
| 累計 (波 1–3 + U3a) | 532 | 48 | 9.0% | 8 | 3 | — |

U3a の率 11.4% は波 1〜3 (7.9〜9.5%) より高いが、内訳を見ると **cosmetic 7 のうち 5 が「源に無い記号の挿入」型**
(`q035` 垢 / `q062` `.` / `q063` `.` / `q096` 読点) と **記号字種** (`q001` 引用符 / `q085` 区切り) であり、
S119 で prompt に追記した「区切り記号脱落・引用符字種置換・源に無い記号の挿入も計上」がそのまま効いた結果。
**波 3 で machdiff 頼みだった型を、agent が自力で計上できるようになった**ことの裏返しであって、
dataset の品質が悪化したわけではない (§3 参照)。

---

## 3. 機械 diff (machdiff) — AGENT_MISSED 5 / **偽陽性 5 (実残差 0)**

`node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u3a_fidelity_input_2018h30h.json evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u3a_2018h30h_sn.json`

```
machdiff: fields same=345 | AGENT_MISSED=5 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 70/70
```

| id | field | 残差の中身 | 判定 |
|---|---|---|---|
| `2018h30h-q005` | choice.ア/イ/ウ/エ (4 件) | transcript 側の **`[図]` 接頭辞** (agent が「肢は図」と明示した記法)。agent は同じ 4 field を discrepancies に計上済 | **偽陽性** — machdiff が接頭辞を本文として扱うため |
| `2018h30h-q043` | stem | 表示層の箇条書き記号 **`- `** (D-141 型の図の言語化。stem_jp_clean は「開始結合点から 3 本の矢線が出て…」を markdown 箇条書きで持つ) | **偽陽性** — 表示整形であって源テキストではない。**データ不変** |

- **実残差 0** → PLAN §2 の停止条件「machdiff 残差 > 3」に**非該当**。
- **machdiff 由来の新規是正は 0 件** (波 1 は 1/13、波 2 は 5/15、波 3 は 5/11 が machdiff 由来だった)。
  Sonnet 単 pass + S119 prompt 改修で、machdiff が拾っていた型を agent 側が自力で計上するようになった。
- **machdiff の構造的盲点 (再掲・本 unit で該当)**: `normStr` は引用符 (`「」` ↔ `“”`) と読点字種と空白を統一するため、
  `q001` の引用符字種置換・`q085` の区切り脱落・`q096` の読点挿入は **machdiff では原理的に検出できない**。
  本 unit でこの 3 題を拾えたのは agent (Sonnet) が S119 規定に従って計上したからであり、
  **machdiff は agent の代替ではなく補完**であることが改めて確認された。

---

## 4. 裁定 (主 context / fixer が源ページ 6 枚 + 複合図 1 枚を原解像度で独立実読)

実読したページ: `data/ip/exams/pages/2018h30h/` の **page-02 / 03 / 14 / 16 / 29 / 33 / 38 / 41**
(page-33 は `q085` の区切り字形を同 exam 兄弟問 `q072` と対照するために追加実読)。
agent の `source_text` は候補として扱い、**すべて原寸拡大 (5〜10 倍) で字形を確定してから** from/to を決めた。

### 4a. `q001` — 引用符の字種 (源 `“ ”` U+201C/U+201D)

- page-02 を 6 倍で実読。**5 箇所すべて**が `“市場浸透”` `“新製品開発”` `“市場開拓”` `“多角化”` `“市場浸透”` の
  欧文二重引用符。dataset は全て `「」` に置換されていた → 波 2 `2016h28h-q094` / 波 3 `2017h29h-q090` と同一規則で
  **源の字形へ戻す**。
- 引用符の**間の読点**は源 `，` / dataset `、` で字種差 = 許容表記揺れ → **不変**。
- zh/en stem の `「」` は **⑨-c 保留** (「zh/en は各言語の慣行に従う」) で不変。ただし en 側は
  `「market penetration」` のように日本語かぎ括弧が英文に残っており、⑨-c の中でも優先度が高い (§8 backlog)。

### 4b. `q005` — **D-144 段 2 ②-a** (answer_affecting、`2016h28a-q050` と同型)

- page-03 を実読: 問5 の 4 肢は **図のみ**。ア=左上 (状態1/状態2 を 事象A〜D で結ぶ状態遷移図)、
  イ=右上 (処理1/処理2 の円と データファイル1 のデータストアを データA→B→C で結ぶ DFD)、
  ウ=左下 (実体1/実体2 を 関係 で 1:N に結ぶ E-R 図)、エ=右下 (判断 から 処理1/処理2 へ分岐するフローチャート)。
- dataset のテキスト肢は図の**名称**そのもの (`状態遷移図` / `DFD` / `E-R図` / `フローチャート`) で、
  **正解肢イ「DFD」が設問文「DFD の記述例として…」と同語** = 図を読まずに語句一致だけで正解が確定してしまう。
  → agent が answer_affecting と判定したのは妥当。
- 処置: `scripts/quiz-choicefig-D144s2.mjs` の SPEC に `"2018h30h-q005": { topCut: 230 }` を追加して
  `--only 2018h30h-q005` で実行。複合図 `data/ip/exams/figures/2018h30h-q005.png` (1261×1094) の行インク帯は
  `9-34` (前問 問4 の ウ/エ 行) / `167-192` (問5 題幹) / `273-295` (ア・イ 字母) / `324-568` (上段 2 図) / `574-578` (上段図領域内の小帯、Rule D NIT-2 で追加) /
  `634-656` (ウ・エ 字母) / `662-922` (下段 2 図) で、**y=922 より下に残渣なし** → `topCut 230` / `bottomCut 0`。
- **切り出し 4 枚を目視確認済** (象限→字母の対応・切れの無さ):

  | 肢 | 産物 | px | 内容 |
  |---|---|---|---|
  | ア | `figures/2018h30h-q005-cA.png` | 492×315 | 状態遷移図 (事象 A〜D 4 本すべて含む) |
  | イ | `figures/2018h30h-q005-cB.png` | 487×333 | DFD (データファイル1 の平行線まで含む) |
  | ウ | `figures/2018h30h-q005-cC.png` | 232×307 | E-R 図 (実体1・関係・実体2 と 1/N) |
  | エ | `figures/2018h30h-q005-cD.png` | 333×314 | フローチャート (判断 → 処理1/処理2 と流出矢印) |

- テキスト肢は中立な `図ア`〜`図エ` / `图ア`〜`图エ` / `Figure ア`〜`Figure エ` に置換 (TXT 定義どおり)。
  旧テキストは `choices_text_retired` に、複合図パスは `composite_figure_path_retired` に退避 (Rule D NIT-9)。
- **解説の書換は 0 件**。`expl_jp_2018h30h-q005.json` / `expl_tr_2018h30h-q005.json` を jp/zh/en 全文精査した結果、
  `correct_jp`・`distractors_jp`・`points_jp` のいずれも**図の内容**を論拠にしており
  (「イ の図は、処理1 と 処理2 という2つの円(処理)が、データA→データB→データC という矢印(データフロー)で…」)、
  旧テキストラベルを論拠にした箇所は無い。`key_guard` の導出も図ベース。よって choice_figures 化後もそのまま成立する。
  → 主 context 指示の「旧ラベルを論拠にしていれば三語書換」は**前提が成立せず、書換不要**と判定。
- `correct_answer` は **イ のまま不変**。

### 4c. `q030` — 語義是正 (semantic)

- page-14 を 5 倍で実読: 「宣伝用の電子メールが**幾度**となく送られてきた。」。dataset は「幾」が脱落して
  「度となく」= 日本語として成立しない非語 → 波 3 §4a の基準「非語になる欠落は semantic」に合致。
- zh「多次反复地」/ en "repeatedly many times" は既に「幾度となく」の語義で忠実 → **追随不要**。

### 4d. `q035` / `q062` / `q063` — 源に無い記号・文字の除去 (junk)

| id | field | 源 (実読) | dataset | 判定 |
|---|---|---|---|---|
| `q035` | choice.エ | page-16: 「他の事象は必要ではない**。**」で終わる | 「…ではない。**垢**」 | 源に無い漢字 1 字の混入 → 除去 |
| `q062` | choice.エ | page-29: 「マルチブート」で終わる。該当位置を 5 倍で確認したが**印刷文字は無く紙面の微小な染み 1 点のみ** | 「マルチブート␣×6**.**」 | OCR が染みを `.` と誤読 → 除去 |
| `q063` | choice.ア (**正解肢**) | page-29: 「利用では使用しない**。**」で終わる。同じく染み 1 点のみ | 「使用しない。␣×49**.**」 | 同上 → 除去。`correct_answer=ア` は不変 |

zh/en には `垢` / 末尾 `.` に相当する混入が無いことを確認済 → **追随不要**。

### 4e. `q085` — 丸数字の区切り。**字種は同 exam 兄弟問 `q072` に合わせる**

- page-38 を 6 倍で実読: 源は `イ ①, ②` / `ウ ②, ③, ④` / `エ ③, ④` で、区切り記号が dataset では**全脱落**していた。
- **字種の決定 (主 context 指示から意図的に外した点)**: 指示は「波 3 q081 と同規則: jp/zh = U+FF0C、en = ", "」だったが、
  波 3 §4e の規則の本体は「**同 exam の兄弟問に合わせる** (Rule D LOW-2: U+FF0C と ASCII 読点の新規混在を作らない)」であり、
  波 3 が U+FF0C を採ったのは当該 exam (2018h30a) の兄弟問 `q041` / `q057` が U+FF0C だったからである。
- 本 exam の兄弟問は **`2018h30h-q072`**。源 page-33 を 10 倍で `q085` と並べて実読した結果 **区切りの字形は同一**で、
  その dataset は `jp "①, ③" / zh "①、③" / en "①, ③"`。
  → `q085` も **jp `①, ②` / zh `①、②` / en `①, ②`** とした。U+FF0C を入れると同一 exam 内に新規混在が生まれ、
  LOW-2 に反するため。**この 1 点のみ指示の字面から外れている** (規則としては指示に従っている)。
- 補強根拠 2 つ: (i) **[Rule D MINOR-1 で訂正]** 2018h30h の jp (stem_jp + choices_jp) の区切り字種は実測で
  U+FF0C 67 / ASCII `", "` 321 / `、` 7 (U+FF0C は 13 問に分布、うち q085 と同構造の列挙区切りは
  `q006` ア「a，c」/ `q008` ア「a，b」/ `q074` イ「a，b」/ `q079` ア「a，b，c」の 4 件)。したがって「全体が ASCII 系」
  「U+FF0C だと新規混在が生まれる」は偽で、混在はどちらを選んでも既存。採用理由は (i) ではなく、**丸数字列挙の直近兄弟問
  `q072` に合わせる** (LOW-2 の本体) こと 1 点に依る。reviewer 実測: q085 と q072 は本 exam で丸数字列挙を持つ唯一の 2 問で
  源の組版は画素単位で同一 (字送り 56px / 区切りインク 4px)、半角送り 14px・全角送り 28px の紙面で ASCII `,`+空白 と U+FF0C は
  どちらも 28px 左寄せインクになり**源からは判別不能** → 字種は house rule でしか決められない。exam 横断の字種方針は ⑨
  (N6-a 残 2 問の前に D-NNN で固定) に送る。
  (ii) zh の `、` (顿号) は中国語で並列項目を区切る正規の記号であり、兄弟問準拠と言語慣行が一致する。

### 4f. `q096` — 源に無い読点の挿入 (clean 層のみ)

- page-41 を 6 倍で実読: 「…データ構造に対して␣“8”，“1”，“6”，“3”の順に…」。**「に対して」の直後に読点は無く空白のみ**。
- dataset の表示層は「に対して**、**“8”」と読点が挿入されていた → 波 1 §39 / 波 3 の「源に無い記号の挿入は計上」に該当。
- 空白は同 exam `q085` の clean 層 (「使って␣“*A*.te??”␣の表現」) と同じ **U+0020** に揃えた (是正後、
  「に対して」直後が U+0020 であることを機械確認済)。
- 引用符間の `，` / `、` の字種差は許容表記揺れ → 不変。
- **raw `stem_jp` は別系統の重腐敗**「“8 7, “17,。す67, “73”」で `from` が 0 回 → assert-once が自動 skip (§7)。
  波 3 の `2017h29h-q043` と同じ挙動。

---

## 5. SOURCE_TYPOS

本 unit では**該当なし** (源が誤っていて dataset が正しい型は 0 件)。
波 3 §5 の `2018h30a-q043` が唯一の既存登記であり、横断台帳化は §8 backlog のまま。

---

## 6. 採用した差分 (8 題 / 13 論理差分)

> 「13 論理差分」の定義 = agent が計上した 13 discrepancy と **1 対 1**。内訳 =
> `q001` stem 1 + `q005` choice.ア/イ/ウ/エ 4 + `q030` 1 + `q035` 1 + `q062` 1 + `q063` 1 + `q085` choice.イ/ウ/エ 3 + `q096` stem 1 = **13**。
> `q001` の引用符は源の 5 箇所を 1 discrepancy にまとめて報告されているが、置換操作としては 5 回 (§7 の field 数はこちらで数える)。

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q001 (p02) | stem | `「市場浸透」`→`“市場浸透”` ほか 5 箇所の引用符字種 | cosmetic | agent |
| q005 (p03) | choices ア〜エ | 源は**図のみ**。テキスト肢が図の名称で正解肢イ「DFD」が設問文と同語 → **D-144 段 2 ②-a 化** (choice_figures + 中立テキスト) | **answer_affecting** (イ) / semantic (ア・ウ・エ) | agent |
| q030 (p14) | choice.ウ | 「電子メールが**度となく**」→ 源「**幾度**となく」 | semantic | agent |
| q035 (p16) | choice.エ | 文末「。**垢**」→ 源「。」 | semantic | agent |
| q062 (p29) | choice.エ | 「マルチブート␣×6**.**」→ 源「マルチブート」 | cosmetic | agent |
| q063 (p29) | choice.ア (**正解肢**) | 「使用しない。␣×49**.**」→ 源「使用しない。」 | cosmetic | agent |
| q085 (p38) | choice.イ/ウ/エ | 区切りの全脱落「①②」→ 源「①, ②」ほか | cosmetic | agent |
| q096 (p41) | stem | 源に無い読点の挿入「に対して**、**“8”」→ 源「に対して␣“8”」 | cosmetic | agent |

### zh / en の追随

| id | zh | en |
|---|---|---|
| q005 ア〜エ | 図名 → `图ア`〜`图エ` (D-144 段 2 の中立テキスト) | 図名 → `Figure ア`〜`Figure エ` |
| q085 イ/ウ/エ | `①②` → `①、②` (兄弟問 q072 準拠) | `①②` → `①, ②` |

**追随不要と確認したもの** (既に源に忠実 / 腐敗が伝播していない):
`q030` ウ zh「多次反复地」 en "repeatedly many times" / `q035` エ zh・en に `垢` 相当なし /
`q062` エ zh「多重引导」 en "Multi-boot" / `q063` ア zh・en に末尾 `.` なし。
`q001` / `q096` の zh・en 引用符は ⑨-c 保留で不変。

---

## 7. 層と局所性

| 層 | field 数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/2018h30h.json` の `stem_jp` / `choices_jp`) | **36** | 3 層に同一置換 (q001 stem 5×3 + q030/q035/q062/q063 各 1×3 + q085 jp 3×3) |
| sidecar (`translations/2018h30h.json`: `stem_jp_clean` / `choices.<L>.{zh,en}`) | **12** | **再 merge 禁止** (S117 §10a 失敗②) — sidecar と `.phase1` の両方に当てる |
| `.phase1/tr_<id>.json` | **7** | q085 zh/en 6 + q096 `stem_jp_clean` 1 |
| 解説 `.phase2/expl_{jp,tr}_*.json` | **0** | §4b のとおり書換不要 |
| key_guard final note (`.phase2/generate_result_2018h30h.json`) | **3** | D-143: **final のみ**、round1 不可触 |
| **fidfix 小計** | **58** | `quiz-fidfix-S122-u3a.mjs` の `applied` と一致 |
| D-144 段 2 (`quiz-choicefig-D144s2.mjs --only 2018h30h-q005`) | **30** | bank 7 + by_year 7 (`choice_figure_paths` / `figure_path`→null / `choices_text_retired` / `composite_figure_path_retired` [figure_path→null と同一 applied で計上] / `choices_jp` ×4) + sidecar 8 + `.phase1` 8 |
| **合計** | **88** | |

- **計上 skip 3** = `q096` の raw `stem_jp` ×3 層。raw は別系統の重腐敗 (`“8 7, “17,。す67, “73”`) で
  `from` が 0 回 → assert-once が自動 skip した。波 3 の `2017h29h-q043` と同じ挙動。
- **無言 guard skip 5** = `q001` の `.phase1/tr_2018h30h-q001.json` に `stem_jp_clean` のキー自体が不在 (`id` / `stem` / `choices` のみ) で `if (t1?.stem_jp_clean)` が偽になるため
  5 subs が試行されない。出荷源は clean 層 + sidecar なので表示は正。
  **`.phase1` からの再 merge は禁止** (S117 §10a) を前提とし、再 merge 前に N5 台帳を是正すること。
  → 潜在 sub 66 = 計上 61 (applied 58 + skipped 3) + 無言 5。
- **key_guard final note の対象 3 件**:
  - `q005` / `q030` = **純粋な後置** (追記前 prefix が `key_guard_round1.note_jp` と逐字一致することを機械照合済)。
  - `q063` = **NOTE_SUB (区間差替)**。既存 note が「選択肢アの末尾に空白＋『.』のOCRノイズが**ある**」と
    **現在形で腐敗の存在を主張**しており、純粋な後置では note が是正後のデータと矛盾する。
    波 1 の `2015h27a-q062` (同じく「末尾に余分な空白と句点が残るが cosmetic」) で採った NOTE_SUB と同型の処置。
    → 主 context 指示は「追記」だったが、対象 3 題は指示どおりで**機構だけ NOTE_SUB に変えた**。
  - junk・記号のみの是正 (`q001` / `q035` / `q062` / `q085` / `q096`) は**追記しない** — 波 2 / 波 3 と同一方針。
- **D-143 検証**: MARK 付き final note 3 件のうち 2 件が純粋後置、1 件が区間差替。
  `key_guard_round1` への MARK 混入 **0 件**。merge 出力 `explanations/2018h30h.json` に 3 件とも反映され、
  `round1` ブロックが anti-masking として併記されていることを確認。
- `--dry-run` 再実行: **applied 0 / skipped 61** (完全冪等)。
  `quiz-choicefig-D144s2.mjs --dry-run --only 2018h30h-q005` も **applied 0** (冪等)。

### questions.json の差分 (build-quiz-corpus 再生成後)

| lane | 変更 id |
|---|---|
| **本 unit (U3a)** | `2018h30h-q001, q005, q030, q035, q062, q063, q085` (**7 問**) |

- `2018h30h-q096` は **clean 層のみ**の是正なので `questions.json` には現れない (正)。
- `correct_answer` 変更 **0 / 2900** (HEAD の `questions.json` と全量照合)。`answer_keys.json` バイト不変。
- **他 lane / 他 exam の踏み潰し 0**: 変更 id はすべて `2018h30h-` 前缀。
  さらに 29 exam **2900 問**について `question_bank` vs `by_year` の `stem_jp` + `choices_jp` を全量照合 → **不一致 0**。
- 図の産物: `figures/2018h30h-q005-c{A,B,C,D}.png` 4 枚 (新規) →
  `apps/web/public/quiz-figures/2018h30h-q005-c{A,B,C,D}.webp` 4 枚。
  複合図 `2018h30h-q005.webp` は `figure_path`→null に伴い削除 (既存 4 題の D-144 段 2 と同じ挙動)。

---

## 8. 事後核験 (Rule A 相当の自証)

**(a) 是正後 manifest を再構成して machdiff を再実行**
(現データから `stem_jp_clean` 優先 / 無ければ raw、choices は raw で manifest を組み直した):

```
machdiff: fields same=345 | AGENT_MISSED=5 | VERDICT_CONFLICT=0 | coverage 70/70
```

残差 5 は §3 と**同一の偽陽性 5** (`q005` ×4 が `図ア`〜`図エ` vs `[図]…`、`q043` が箇条書き記号)。
**新規残差 0** = 7 題のテキスト是正はいずれも transcript と整合。

**(b) 13 discrepancy の `source_text` と是正後表示テキストの直接照合**
(許容表記揺れ = NFKC / 読点字種 `、，,` / 空白 のみ潰し、**引用符字種は潰さない**):

| 判定 | 件数 | 内訳 |
|---|---|---|
| EXACT (逐字一致) | **5** | `q030` ウ / `q062` エ / `q085` イ・ウ・エ |
| TOLERANT (許容表記揺れのみ差) | **3** | `q001` stem (`、` vs 源 `，`) / `q035` エ (「事象 A」の語間空白、⑤-4 R8 射程) / `q063` ア (`、` vs `，`) |
| RESIDUAL | **5** | `q005` ×4 = **意図的** (D-144 段 2 で肢が図になった) / `q096` stem = **agent の `source_text` が差分文だけの truncated 引用**で末尾 1 文「2回目の取出しで…」を含まないため。共通接頭辞では許容表記揺れ後に一致 (機械確認済)、かつ「に対して」直後が **U+0020** であることを確認 |

→ **実残差 0**。

---

## 9. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| ↳ **A6 (D-144 段 2) を `q005` について個別再確認** | ✅ 4 肢すべて `choice_figures` あり / WebP 実在 / `choices_jp="図L"` / zh=`图L` / en=`Figure L` / `figure=null` / `has_figure=true` → **GREEN** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE 0 件 / **(A) 共有図メンバー全員がページ整合 / (B) 判定 JSON の SPLIT_FIGURE 50 件が両層で判定どおり** |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` |
| `cd apps/web && pnpm exec tsc --noEmit` | ✅ **0 error** |
| `cd apps/web && pnpm exec vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** |
| `node --check scripts/quiz-fidfix-S122-u3a.mjs` / `quiz-choicefig-D144s2.mjs` | ✅ |
| `--dry-run` 2 回目 (両スクリプト) | ✅ fidfix applied 0 / skipped 61、choicefig applied 0 |
| `correct_answer` 変更 | ✅ **0 / 2900** (HEAD 比較)。`answer_keys.json` バイト不変 |

再生成: `build-quiz-corpus.mjs` (2900 問 / 63 topic / 29 exam / **with_fig 511**) →
`quiz-phase2-merge.mjs 2018h30h` (explained 100 / missing 0 / SUSPECT 2 = q009・q012 / STEM-CORRUPTION 5、いずれも既知で本 unit の変更対象外) →
`build-quiz-figures.mjs` (optimized **527/527**)。

---

## 10. 見送り (クラス登記のみ、本 unit では是正しない)

| クラス | 該当 | 理由 |
|---|---|---|
| 表示層の整形記号 | `q043` stem の箇条書き `- ` | D-141 型の図の言語化。源テキストではないので**データ不変**。machdiff が AGENT_MISSED として出すが偽陽性 |
| transcript の注記 | `q005` 4 肢の `[図]` 接頭辞 | agent が「肢は図」と明示した記法。同差分は計上済 → 偽陽性 |
| 読点の字種 | `q001` / `q063` / `q096` の `、` vs 源 `，` | 従来どおり許容表記揺れ |
| 語間空白 | `q035` エ「事象 A と事象 D」の空白、`q085` stem の英数字周囲 | ⑤-4 R8 lane の射程。machdiff の既知盲点 |
| 全半角 | `q085` stem の `A.text` 等 | 許容表記揺れ |
| zh/en 引用符 | `q001` / `q096` の zh・en に残る `「」` | ⑨-c (波 2 `q094` 以来の「zh/en は各言語の慣行に従う」保留) |
| N5 (clean 保有題の raw 残存腐敗) | `q085` raw「①て④」「9個以上」/ `q062` raw「独立した 09 と」/ `q096` raw「“8 7, “17,。す67, “73”」/ `q035` raw「願客」「[事象 A]」 | N5 系列 (§28 LOW-1)。学習者不可視。ただし `q085` の **`9個以上` は源「0個以上」で数値が変わる**ため §11 に格上げ登記 |

---

## 11. backlog (⑨ / 次 unit へ)

- **N6-a 進捗**: 丸数字区切り backlog 4 問のうち `2018h30h-q085` を**本 unit で解消**。
  残 2 問 = `2015h27h-q070` / `2019h31h-q062` (`2018h30a-q081` は波 3 で解消済)。
  `2019h31h-q062` は **U3b の射程**なので、その unit で兄弟問の字種を先に確認すること。
- **⑨ 新規: 丸数字区切りの字種が dataset 全体でばらついている。**
  `2018h30a` 系 = jp/zh `U+FF0C`、`2018h30h` 系 = jp `", "` / zh `、` / en `", "`。
  「兄弟問に合わせる」規則は exam 内の一貫性しか保証しないため、exam をまたぐと 3 種類が併存する。
  N6-a の残 2 問を処理する前に **dataset 全体の方針 (源字形優先 / 言語慣行優先) を D-NNN として固定**することを推奨。
- **⑨ 新規 (優先度高): agent の `source_text` は field 全文でなく差分文だけの truncated 引用になることがある。**
  `q096` が実例 (末尾 1 文が落ちた)。事後照合を素朴に全文一致でやると偽の RESIDUAL が出る。
  → prompt に「`source_text` は当該 field の**全文**を書く」を明記するか、事後照合を接頭辞一致に変える。
- **⑨ 新規: `q085` raw `stem_jp` の `9個以上` は源「0個以上」で、数値が変わる N5 腐敗。**
  clean 層は正しいので学習者には見えないが、`.phase1` / raw からの再 merge が起きると
  **問題の条件そのものが誤る**。N5 の中でも「数値・論理が変わる型」を別ランクとして台帳化することを推奨
  (同題 raw の `①て④` (源 `①〜④`) も同族)。
- **⑨ 新規: `q001` の en 訳に日本語かぎ括弧 `「」` がそのまま残っている** (`「market penetration」`)。
  ⑨-c の「zh/en は各言語の慣行に従う」保留の中でも、en は明確に慣行外。⑨-c 着手時の最優先候補。
- **machdiff の位置づけ (再確認)**: 本 unit の machdiff 由来の新規是正は **0 件**。
  一方で machdiff は「agent が計上したのに fixer が取りこぼす」型の検出と、事後核験 (§8a) の再実行に効いた。
  **Sonnet 単 pass + S119 prompt では machdiff は補完役に回った**が、
  引用符・区切り・空白を正規化で潰す構造上、これを廃止すると agent 単独依存になる → **常設を維持**。
- **SOURCE_TYPOS の常設化** (波 3 §11 から繰越、本 unit では該当 0): `evidence/` 横断台帳は未着手。

---

## 12. Rule B (失敗記録)

本 unit で失敗した attempt は**無し**。run は 1 回で完走 (UNREADABLE 0 / agents_error 0)、
part 壊れ 2/70 は `--journal` で復元でき再 run 不要。是正器も初回適用で assert-once 違反 0。
`failures/` への新規追加なし。

---

## 13. Rule D

Writer = `u3a-fixer` (executor opus)。**Reviewer は別 `subagent_type` (opus) で本 evidence の後に別途実施すること**
(本ファイルは writer の自己申告であり、Rule D の審査は未了)。
審査時の重点:

1. 源ページ 8 枚の原寸実読による 13 差分の独立再確認 (特に `q001` の引用符 5 箇所と `q085` の区切り字形)。
2. **§4e の字種決定** — 主 context 指示 (`jp/zh = U+FF0C`) から意図的に外し、
   同 exam 兄弟問 `q072` 準拠 (`jp ", " / zh "、" / en ", "`) にした判断の当否。
3. **§7 の `q063` NOTE_SUB** — 指示は「追記」だったが、既存 note が腐敗の存在を現在形で主張していたため
   波 1 `2015h27a-q062` 型の区間差替にした判断の当否。
4. **§4b の解説書換 0 件** — 指示は「旧ラベルを論拠にしていれば三語書換」。前提不成立と判定した根拠
   (解説が図ベースであること) の再確認。
5. `q005` の choice 図 4 枚の象限→字母対応と切れの無さ。


---

## 13. Rule D 独立審閲 (S122、reviewer `oh-my-claudecode:code-reviewer` opus、fixer `oh-my-claudecode:executor` opus と別 type)

**判定: PASS-with-notes** — MAJOR 0 / 誤是正 0 / 漏れ 0 / correct_answer 変更 0。データ修正を要する指摘 0。

- 独立再計算: n 70 / DISCREPANT 8 / 論理差分 13 / severity cos 7・sem 5・aa 1 / 正解肢上 2 / machdiff same 345・MISSED 5・CONFLICT 0 (byte 一致) / 累計 532 問・48 題・9.0%・正解肢上 8・aa 3 — すべて evidence と一致。§8b 事後照合 (EXACT 5 / TOLERANT 3 / RESIDUAL 5) も独自実装で再現。
- 独立実読: precrop 8 枚が源ページの無損失切り出しであることを画素照合で先に検証したうえで、源ページ 8 枚 (page-02/03/14/16/29/33/38/41) から原寸帯 15 枚 + 2〜3 倍拡大 7 枚 + 選択肢図 4 枚を読み、8 題すべて fixer の from/to と一致。CLEAN 標本 2 題 (q018 / q047) を追加実読 → 漏れなし。q062 / q063 の末尾は印刷文字ではなく微小な染み 1 点。q096 は「に対して」直後に読点なし空白のみ。q001 は 5 箇所すべて U+201C/U+201D。
- 層の網羅: questions / bank / by_year / sidecar / .phase1 を機械照合し FAIL 0。correct_answer 0 / 2900、answer_keys.json 不変、bank vs by_year 2900 問不一致 0、冪等 (fidfix dry-run applied 0 / skipped 61、choicefig dry-run 0)。
- q005 choice_figures: cA 492×315 状態遷移図 (事象 A/B/C/D 全含) / cB 487×333 DFD (データファイル1 の平行線 2 本含) / cC 232×307 E-R 図 / cD 333×314 フローチャート (流入 + 流出 2 本含)。象限→字母の対応正、切れ・前問残渣なし。webp は PNG と寸法一致 (平均絶対差 1.3〜2.1)。A6 個別 GREEN。has_figure 511 / webp 527 / choice_figures 保有 5 問。
- sub() 肯定確認 (`if (to && !next.includes(to)) throw`) 実装済 = S121 NIT-3 解消。D-143: MARK 3 件は final のみ、round1 混入 0。
- ゲート再実行: crosscheck all invariants hold (A1–A7, B1–B7) / assert-clean SPLIT_FIGURE 0 / chumon --check 一致 / tsc 0 / vitest 501 passed・2 skipped / machdiff 同一。
- fixer の指示逸脱 3 点の裁定: **(a) q085 区切り = q072 準拠 → データ容認**、ただし補強根拠 (i) が偽 → MINOR-1 として差し替え (上記 §4e に反映)。**(b) q005 解説書換 0 → 容認** (jp/zh/en 全文が図の構成要素から図種名を導出しており旧ラベル論拠 0)。**(c) q063 NOTE_SUB → 容認** (round1 が現在形で腐敗の存在を主張、純粋後置では自己矛盾。波 1 q062 と同型、round1 バイト不変)。
- 前波との方針統一 (引用符字形 / severity / NOTE 文型と追記対象 / 再 merge 禁止の明記) の 4 軸で逸脱なし。

### 指摘と処置 (主 context、同 session)
| # | 内容 | 処置 |
|---|---|---|
| MINOR-1 | §4e 補強根拠 (i)「2018h30h の jp は全体が ASCII 系」が偽 (実測 U+FF0C 67 / ASCII 321 / 、7、同構造 U+FF0C は q006/q008/q074/q079) | §4e と脚本ヘッダを訂正 |
| MINOR-2 | §7「stem_jp_clean が無い (null)」→ キー自体が不在 (`id`/`stem`/`choices` のみ) | 訂正 |
| NIT-1 | §7 D-144 段 2 行の列挙に `composite_figure_path_retired` 欠落 (計数 7 は正) | 追記 |
| NIT-2 | §4b 行インク帯に `574-578` (上段図領域内の小帯) 欠落、結論不変 | 追記 |
| NIT-3 | questions.json vs question_bank.json の `choices_jp` が 9 問で JSON 文字列不一致 (2009h21a-q025/q042/q051、2009h21h-q057、2011h23a-q099、2015h27a-q058、2017h29h-q059、2024r06-q099、2026r08-q038)。HEAD でも同一、U3a 由来ではない | 主 context 再検証: 9 問とも**キー順序のみの差で内容は全等** (crosscheck B5 はキー単位比較のため GREEN)。⑨ に「bank の choices_jp キー順正規化」として登記、データ不変 |
