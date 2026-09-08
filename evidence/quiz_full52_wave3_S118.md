# ⑤-2 全量保真核験 波 3 — 2017h29h / 2018h30a の集計と是正 (S118)

⑤-2 全量核験 8 波の**第 3 波**。母数は `evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json`
(除外 392 / 母数 1208) から 2017h29h **85 問** + 2018h30a **67 問** = **152 問**、各問を gp / cr の 2 系統で
独立核験 = agent **304**。

---

## 1. 入力と実行

- run: S118 log §38 の 4 workflow (2017h29h gp/cr、2018h30a gp/cr)
- マニフェスト: `data/ip/quiz/.phase2/full52_fidelity_input_<exam>.json` (⑤-4 R8 空白削除後のスナップショット)
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_<exam>_<gp|cr>.json` (4 本)
- **UNREADABLE 0 / error 0 / 覆盖 85/85 × 2、67/67 × 2**
- 是正器: `scripts/quiz-fidfix-S118-wave3.mjs` (assert-once / 冪等 / `--dry-run`)

---

## 2. 率 (exam 別・プール)

「DISCREPANT 問」は **gp ∪ cr の去重問数**。`2018h30a-q043` は**源の誤植**であって dataset 側の欠陥ではないため、
「計上」はするが「是正」からは外す (§4 の裁定)。

| exam | n | gp | cr | 去重 (agent) | 率 | +machdiff | 計上 (率) | **是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|---|---|---|
| 2017h29h | 85 | 3 | 3 | **3** | 3.5% | **+3** | 6 (**7.1%**) | 6 (7.1%) | 0 | **1** |
| 2018h30a | 67 | 4 | 4 | **4** | 6.0% | **+2** | 6 (**9.0%**) | 5 (7.5%) | 0 | 0 |
| **プール** | **152** | 7 | 7 | **7** | 4.6% | **+5** | **12 (7.9%)** | **11 (7.2%)** | **0** | **1** |

- **双 pass 一致**: agent 由来 7 問は **7/7 で両 pass が同一 id・同一 field を報告**。片側のみは 0 件。
- **severity 不一致 2 件** — §3 で裁定:
  - `2017h29h-q077` (gp=**semantic** / cr=cosmetic)
  - `2018h30a-q037` (gp=cosmetic / cr=**semantic**)
- **severity 内訳** (裁定後、12 問): answer_affecting **1** / semantic **5** / cosmetic **5** / SOURCE_TYPO **1** (是正対象外)。
- **正解肢上 0**、`answer_keys.json` 不変、`correct_answer` 変更 **0** (questions.json 2900 問で自動照合)。

### 波 1 / 波 2 / ⑤-3 との比較

| | 標本 | 計上 | 率 | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|
| ⑤-3 (層化抽検 4 exam × 20) | 80 | 14 | 17.5% | 5 | 1 |
| 波 1 (2015h27a + 2016h28a) | 152 | 13 | 8.6% | 3 | 1 |
| 波 2 (2016h28h + 2017h29a) | 158 | 15 | 9.5% | 3 | 0 |
| **波 3 (2017h29h + 2018h30a)** | **152** | **12** | **7.9%** | **0** | **1** |
| 累計 (波 1–3) | 462 | 40 | 8.7% | 6 | 2 |

波 3 は 3 波で最も低い率かつ**正解肢上 0** だが、**answer_affecting が 1 件出た** (`2017h29h-q070`)。
「率が低い波でも answer_affecting は出る」= 率だけでは残余リスクを測れないという ⑤-2 全量方針の裏付け。

---

## 3. 機械 diff (machdiff) — 生 13 / 去重 7 field 5 問 / **偽陽性 0**

`scripts/quiz-fidelity-machdiff.mjs` を 4 本の結果 JSON に当てた (coverage 85/85 ×2、67/67 ×2、transcript 欠落 0)。

| exam | pass | AGENT_MISSED |
|---|---|---|
| 2017h29h | gp | q043 stem / q071 stem / q090 stem |
| 2017h29h | cr | q043 stem / q071 stem / q090 stem (gp と同一) |
| 2018h30a | gp | q081 choice.イ / ウ / エ |
| 2018h30a | cr | q079 stem + q081 choice.イ / ウ / エ |

去重 = **7 field / 5 問**、原寸実読の結果 **5 問すべてが実欠陥、偽陽性 0** (波 1 は 4 中 2 が FP、波 2 は新型 FP 1)。
双 pass が齊漏した理由と裁定:

| id | 齊漏の理由 | 裁定 |
|---|---|---|
| `2017h29h-q043` stem | 両 agent とも transcript には**正しく読点なしで**書きながら「句読点の表記揺れ」として非計上 | 波 1 §39 の追加基準「**源に無い記号の挿入**は置換とは別扱いで計上」に該当 → 是正 |
| `2017h29h-q071` stem | 節見出しの `[…]` ↔ `〔…〕` を体裁差として非計上 (N6-b) | 源 page-30 を原寸実読 → `〔` `〕` を字形確定 → 是正 (§41 の「走査で字形が確定できるものだけ」線引きを満たす) |
| `2017h29h-q090` stem | 同上 (`[操作]`)。さらに引用符 `「」` ↔ `“”` / `‘’` も非計上 | 源 page-36 実読で確定 → 是正 (波 2 の `2016h28h-q094` と同一規則) |
| `2018h30a-q079` stem | gp は **audit 内 `discrepancies[]` に書いた上で verdict=CLEAN** (「句読点のみ」)、cr は無言。どちらも top-level には出ない | q043 と同族 (源に無い読点の挿入) → 是正 |
| `2018h30a-q081` choice.イ/ウ/エ | 丸数字の区切り「，」が**全脱落**。両 pass とも transcript には「①，②，③」と書きながら非計上 | §26 backlog の **N6-a に名指しで登録済**の同族 → 源 page-33 実読で確定 → 是正 |

> machdiff が無ければ本波の**是正 11 問のうち 5 問 (45%) を取り逃していた**。波 1 (1/13)・波 2 (5/15) と合わせ、
> machdiff 常設の価値がさらに裏付けられた。

---

## 4. 裁定 (主 context が源ページ 9 枚を原解像度で独立実読)

実読したページ: 2017h29h page-06 / 19 / 29 / 30 / 32 / 36、2018h30a page-15 / 18 / 32 / 33 / 39。

### 4a. severity 不一致 2 件 — **「非語になる文字置換は semantic」**で統一

| id | gp | cr | 裁定 | 根拠 |
|---|---|---|---|---|
| `2017h29h-q077` choice.ア | semantic | cosmetic | **semantic** | 「入**カ**条件」(U+30AB カタカナ) は日本語の語として成立しない。cr 自身も detail に「語として成立しない」と書きながら「見た目が同一」を理由に cosmetic に倒しており、基準と矛盾 |
| `2018h30a-q037` choice.ウ | cosmetic | semantic | **semantic** | 「追加**じ**た」は活用として成立しない非語。gp 自身も detail に「日本語として成立しない活用」と書いている |

この一本化は既存判例と整合する: 波 1 の `2016h28a-q018`「の」挿入は**日本語として完全に成立する**ので cosmetic、
⑤-3 の `2018h30a-q066`「されでいる」は**非語**なので semantic。基準 = 「語として成立するか」であって
「見た目が近いか」ではない。

### 4b. `2018h30a-q043` — **SOURCE_TYPOS** (データ不変)

- 源 page-18 第 1 文は「プロジェクトコスト**マネンジメント**」— 「ネ」と「ジ」の間に「ン」が 1 字余分 (原寸 6 倍で
  ト・マ・ネ・ン・ジ・メ・ン・ト を確認。同行冒頭の「プロジェクトマネジメント」には無く、レンダリングノイズではない)。
  同文の他の 4 箇所 (スコープ / タイム / 統合 ×2) はすべて「マネジメント」で、この 1 箇所だけが IPA の誤植。
- dataset の層別実態 (実測):
  - **raw `stem_jp` は源の誤植を保存している** (「プロジェクトコスト**マネンジ**メント」。同 field には
    N5 系の別腐敗「タイムマネジメント**,。**」「プロジェク**タト**統合」も併存)。
  - **表示層 `stem_jp_clean` / `.phase1` は「マネジメント」と正しい綴り**。学習者が読むのはこちら。
  - zh/en も「项目成本管理 / project cost management」相当で綴り問題なし。
- **主 context 裁定: 源の明白な誤植は再現しない。** 逐字再現は保真の目的 (学習者が源と同じものを読む) を害する
  ため、**表示層の正しい綴りをそのまま維持**する。双 pass とも cosmetic として計上したが
  **データは 1 バイトも変更しない** (raw 側も「源に忠実」なので触らない)。
- 再掃引での再発火を防ぐため §5 の `SOURCE_TYPOS` に登記。

### 4c. `2017h29h-q070` — **answer_affecting** (両 pass 一致)

- 源 page-29 を 4 倍拡大で実読: 「機械語は，プログラムを **10 進数**の数字列で表現する。」
- dataset は「**16** 進数」。源の「10 進数」は機械語 (2 進数) と明白に食い違う**誰が見ても不適切な誤答肢**だが、
  「16 進数」に化けると機械語をダンプ/アセンブラリストで 16 進表記する実務が実在するため受験者には
  「適切」に見え、**正解肢ア と競合する**。よって answer_affecting。
- **誤答肢ウ の解説が腐敗テキストを論拠にしていた**: 旧解説は「16 進数は人間が読みやすくするための便宜表記に
  すぎない」と論じており、源の「10 進数」に対する反駁になっていない。→ **jp/zh/en の 3 語で書き換え**:
  「機械語の本体は 2 進数のビット列であって **10 進数の数字列ではない**」を主論拠に据え、16 進数の便宜表記は
  受験者が混同しやすい点なので**補足として残す**。要点 `points[1]` も同じ理由で 3 語書き換え。
- `correct_answer` は ア のまま不変。

### 4d. 引用符・括弧の是正方針 (`2017h29h-q090`)

源 page-36 は表名を **“商品”** (U+201C/U+201D)、値を **‘有’ ‘％うどん％’ ‘うどん％’** (U+2018/U+2019) で囲む。
dataset はすべて `「」` に置換されていた。波 2 の `2016h28h-q094` と同一規則で**源の字形へ戻す**。
`％` の全半角は許容表記揺れなので ASCII `%` のまま。zh/en 側の引用符は「各言語の慣行に従う」保留 (§41 ⑨-c)。

### 4e. 丸数字区切りの字種 (`2018h30a-q081`)

源は `①，②，③` (U+FF0C)。同 exam の兄弟問 `2018h30a-q057` / `q041` が jp/zh で U+FF0C、en で ASCII `", "` を
使っているので**それに合わせた** (jp/zh = `①，②，③`、en = `①, ②, ③`)。波 1 Rule D LOW-2 の
「U+FF0C と ASCII 読点の新規混在を作らない」を満たす。

---

## 5. SOURCE_TYPOS — 源の誤植として登記、**意図的に再現しない** (再掃引で再発火させない)

| id | 源 (page) | 源の表記 | dataset raw (維持) | dataset 表示層 (維持) | 判定 |
|---|---|---|---|---|---|
| `2018h30a-q043` stem | page-18 | プロジェクトコスト**マネンジメント** | マネ**ン**ジメント (源どおり) | マネジメント (正しい綴り) | known source typo, deliberately not reproduced |

> 以降の波・再掃引でこの id が DISCREPANT として上がった場合は、本節を根拠に**即クローズ**してよい。
> 逆に「源にあるから直す」方向の是正は入れてはならない。

---

## 6. 採用した差分 (11 問 / 20 論理差分 / **89 field**)

### 2017h29h

| id | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q014 (p06) | choice.ア | 「システムの状態の**居移**」→ 源「状態の**遷移**」 | semantic | 双 pass |
| q043 (p19) | stem | 源に無い読点の挿入「スコープに**は，**プロジェクトの」→「スコープにはプロジェクトの」 | cosmetic | machdiff |
| q070 (p29) | choice.ウ | 「プログラムを**16**進数の数字列」→ 源「**10** 進数」 | **answer_affecting** | 双 pass |
| q071 (p30) | stem | `[Aさんの電子メールの宛先設定]` → 源 `〔…〕` | cosmetic | machdiff |
| q077 (p32) | choice.ア | 「様々な**入カ**条件」(U+30AB) → 源「**入力**条件」(U+529B) | semantic (裁定) | 双 pass |
| q090 (p36) | stem | `[操作]` → `〔操作〕`、`「商品」`→`“商品”`、`「%」`→`“%”`、`「有」`→`‘有’`、`「%うどん%」`→`‘%うどん%’`、`「うどん%」`→`‘うどん%’` | cosmetic | machdiff + 実読 |

### 2018h30a

| id | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q037 (p15) | choice.ウ | 「機能を**追加じた**。」→ 源「**追加した**。」 | semantic (裁定) | 双 pass |
| q043 (p18) | stem | — **データ不変** (SOURCE_TYPOS) | cosmetic | 双 pass |
| q079 (p32) | stem | 源に無い読点の挿入「ここで**，**データの左方」→「ここでデータの左方」 | cosmetic | machdiff (gp は audit 内に記録) |
| q081 (p33) | choice.イ/ウ/エ | 丸数字区切りの全脱落「①②③」→ 源「①，②，③」 ほか | cosmetic | machdiff (N6-a 既登録) |
| q083 (p33) | choice.エ | 「ディジタル放送受信機に**同杜**」→ 源「**同梱**」(梱 にルビ「こん」) | semantic | 双 pass |
| q100 (p39) | choice.ア | 「各表の**先頭**から数えた」→ 源「各表の**先頭行**から数えた」 | semantic | 双 pass |

### zh / en の追随 (語義が変わった分のみ)

| id | zh | en |
|---|---|---|
| q070 ウ | 十六进制 → **十进制** | hexadecimal → **decimal** |
| q070 解説ウ + 要点[1] | 全文書換 (2 進数 vs 10 進数を主論拠に) | 同左 |
| q081 イ/ウ/エ | `①②③` → `①，②，③` (兄弟問 q057 準拠) | `①②③` → `①, ②, ③` |
| q100 ア | 从各表**开头**数起 → 从各表**首行**数起 | from the **top** of each table → from the **first row** of each table |

**追随不要と確認したもの** (既に源に忠実だった): q014 ア zh「迁移」/ en "transitions"、q077 ア zh「输入条件」/
en "input conditions"、q037 ウ zh「追加了功能」/ en "functionality was added"、q083 エ zh「一同附带」/ en "bundled"。

---

## 7. 層と局所性

| 層 | field 数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/<exam>.json` の `stem_jp` / `choices_jp`) | **48** | 3 層に同一置換 |
| sidecar (`translations/<exam>.json`: `stem_jp_clean` / `stem.{zh,en}` / `choices.<L>.{zh,en}`) | **17** | **再 merge 禁止** (S117 §10a 失敗②) — sidecar と `.phase1` の両方に当てる |
| `.phase1/tr_<id>.json` | **12** | 同上 |
| 解説 `.phase2/expl_{jp,tr}_2017h29h-q070.json` | **6** | 誤答肢ウ ×3 語 + 要点[1] ×3 語 |
| key_guard final note (`.phase2/generate_result_<exam>.json`) | **6** | D-143: **final のみ**、round1 不可触 |
| **合計** | **89** | |

- **skip 3** = `2017h29h-q043` の raw `stem_jp` ×3 層。raw は**源どおり読点が無い**ので assert-once が n===0 で
  自動 skip した (腐敗は clean 層のみ)。波 1 の `2015h27a-q027` と同じ挙動。
- **key_guard final note の追記対象 6 件** = 語義是正 / answer_affecting のみ (q014 / q070 / q077 / q037 / q083 / q100)。
  括弧・引用符・読点・区切りだけの表記是正 (q043 / q071 / q090 / q079 / q081) は**追記しない** — 波 2 および
  strat53 (q041 / q057 の丸数字区切りに note を付けなかった) と同一方針。
- **D-143 検証**: final note 6 件すべて「元の note の**純粋な後置**」であること、追記前の prefix が
  `key_guard_round1.note_jp` と**逐字一致**すること、round1 側に MARK が 0 件であることを機械照合済み。
- `--dry-run` 再実行: **applied 0 / skipped 92** (完全冪等)。

### questions.json の差分 (build-quiz-corpus 再生成後)

| lane | 変更 id |
|---|---|
| **本 lane (波 3)** | `2017h29h-q014, q070, q071, q077, q090` / `2018h30a-q037, q079, q081, q083, q100` (**10 問**) |
| 波 1 (別 agent) | `2015h27a-q042, q044, q059, q062, q081, q093, q097` / `2016h28a-q018, q028, q050, q098` |
| 波 2 (別 agent) | `2016h28h-q009, q040, q051, q067, q089` / `2017h29a-q001, q012, q020, q022, q047, q078, q079, q096, q098` |

- `2017h29h-q043` は clean 層のみの是正なので questions.json には現れない (正)。`2018h30a-q043` は不変 (正)。
- `correct_answer` 変更 **0 / 2900**。
- **他 lane の踏み潰し 0**: 是正前後で 6 exam × 100 問について `question_bank` vs `by_year` の
  `stem_jp` + `choices_jp` を全量照合 → **不一致 0**。

---

## 8. 事後核験 (Rule A 相当の自証)

是正後の表示層テキストを、**両 pass の `source_transcript` と machdiff 正規化で再照合**した
(11 問 × 2 pass × stem+4 肢):

- **残差 1 件のみ** = `2018h30a-q043` stem (SOURCE_TYPOS、意図的な非再現)。
- それ以外の 11 問はすべて **gp / cr 双方の transcript と正規化一致**。

---

## 9. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran / **all invariants hold (A1–A7, B1–B7)** |
| `cd apps/web && pnpm vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** |
| `cd apps/web && npx tsc --noEmit` | ✅ **0** |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ **50/50** (A: 共有図メンバー全員がページ整合 / B: SPLIT_FIGURE 50 件が両層で判定どおり) |
| `node --check scripts/quiz-fidfix-S118-wave3.mjs` | ✅ |
| `node scripts/quiz-fidfix-S118-wave3.mjs --dry-run` (2 回目) | ✅ applied 0 / skipped 92 |

再生成: `build-quiz-corpus.mjs` (2900 問 / 63 topic / 29 exam / with_fig 511) →
`quiz-phase2-merge.mjs 2017h29h` (explained 100 / missing 0) → `quiz-phase2-merge.mjs 2018h30a` (explained 100 / missing 0)。
merge 出力 `explanations/2017h29h.json` に新解説 (jp「10進数の数字列で表現されるわけではない」/ zh「并不是用十进制的数字串来表示」/
en "not a string of decimal digits") が反映され、旧論拠 (「機械語そのものが16進数で表現されるわけではありません」) は**消失**を確認。

---

## 10. 見送り (クラス登記のみ、本波では是正しない)

| クラス | 該当 | 理由 |
|---|---|---|
| 改行・空白の正規化 | `2017h29h-q071` 〔宛先設定〕の To/Cc/Bcc 3 行が 1 行に連結 / `2018h30a-q081` ① 〜 ④ の 4 行が 1 行に連結 | 波 2 の `2017h29a-q079` と同一クラス。machdiff の既知盲点、双 pass とも CLEAN |
| 語間空白 | `2017h29h-q090` choice.ア「a,b, c」/ ウ「c, a,b」の読点後空白の欠落 | ⑤-4 R8 lane の射程。machdiff の既知盲点 (Rule D MINOR-1) |
| zh/en 引用符 | `2017h29h-q090` の zh/en stem に残る `「」` | ⑨-c (波 2 `q094` と同じ「zh/en は各言語の慣行に従う」保留) |
| 全半角 | `2017h29h-q090` の `％` (源) vs `%` (dataset) | 許容表記揺れ |
| N5 (clean 保有題の raw 残存腐敗) | `2017h29h-q043` raw「事象 aeてc」/ `2018h30a-q081` raw「①~ー④」「0pen」「0S」 | N5 系列 (§28 LOW-1)。学習者不可視 |

---

## 11. backlog (⑨ / 次波へ)

- **N6-a 進捗**: §26 の丸数字区切り backlog 4 問のうち `2018h30a-q081` を**本波で解消**。
  残 3 問 = `2015h27h-q070` / `2018h30h-q085` / `2019h31h-q062` (要源照合、いずれも本波の射程外)。
- **N6-b 進捗**: 節見出し `[…]` → `〔…〕` を本波で 2 問 (`2017h29h-q071` / `q090`) 解消。
  波 2 で 4 問、波 1 で 2 問 (`【】` 型) が解消済。横断走査は未完。
- **判定基準の明文化 (再掲・強化)**: 波 1 §39 の「源に無い記号の挿入は計上」が本波で **2 件 (q043 / q079)** 効いた。
  だが**両 pass とも依然として非計上**だったので、prompt 側にも明記が必要 (現状は machdiff 頼み)。
- **⑨ 追加 (本波で新規)**:
  - agent の判定基準に「**丸数字・記号の区切り文字の脱落**は表記揺れではなく計上」を明記
    (`2018h30a-q081` は transcript に正しく書きながら 4 agent 全員が非計上)。
  - agent の判定基準に「**引用符の字種置換** (`「」` ↔ `“”` / `‘’`) は計上」を明記
    (`2017h29h-q090` は 4 agent 全員が非計上。波 2 `2016h28h-q094` では計上されており、基準がぶれている)。
  - `2018h30a-q079` gp のように **audit 内 `discrepancies[]` に書きながら verdict=CLEAN** にすると
    top-level `discrepancies` に出ず主 context から見えない。machdiff もこの場合パッチを当てて差を消してしまう
    (本件は cr 側で捕捉できたのが幸運)。→ **「CLEAN なのに discrepancies が非空」の audit を machdiff 側で
    警告として吐く**改修を推奨。
- **SOURCE_TYPOS の常設化**: 本波で初めて「源が誤っていて dataset が正しい」型が出た。
  `evidence/` 横断の SOURCE_TYPOS 台帳 (id / page / 源表記 / 維持する表記) を 1 本にまとめ、
  各波の evidence から参照する形にすることを推奨 (現状は本ファイル §5 に閉じている)。
- **`2017h29h-q090` 表の欠落**: raw `stem_jp` の markdown 表に区切り行 `| --- |` と「商品」キャプション行が無い
  (clean 層にはある)。N5 系列だが表構造なので別扱いが要るかもしれない。

---

## 12. Rule B (失敗記録)

本波で失敗した attempt は無し (workflow 4 本とも 1 回で完走、UNREADABLE 0 / error 0、
是正器も初回適用で assert-once 違反 0)。`failures/` への新規追加なし。

---

## 13. Rule D

Writer = `wave3-fixer` (executor opus)。**Reviewer は別 `subagent_type` の別 agent が後段で担当** (未実施)。
本ファイルは writer 側の自己申告であり、審閲は含まない。
