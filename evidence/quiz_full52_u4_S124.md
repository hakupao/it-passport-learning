# ⑤-2 全量保真掃引 U4 — 2019r01a の集計と是正 (S124)

⑤-2 全量核験の **U4** (`docs/phase5/PLAN_52_units.md` §2、D-146 第 6 unit)。母数は
`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の 2019r01a
(総 100 問 − excluded 48 [s7x_A 23 / pilot_B_sample 20 / note_scan_B 3 / 両方 2]) = **52 問**。
**Sonnet 5 単 pass** (U1 で PASS、U3a / U3b で本番適用済) を継続適用した 3 回目の本番 unit。

> **母数の訂正**: PLAN §0 / STATE の「59 問」は note_scan 除外 5 + 重複 2 を数え落とした算術誤り (100 − 41)。
> 正しくは **52 問** (S124 log §3)。申告予算は 59 問基準なので実行は申告内。

---

## 1. 入力と実行

- run: `wf_80761953-9cb` (label `u4`、pass `sn`、model = **Sonnet 5**、agent_type general-purpose)
- マニフェスト: `data/ip/quiz/.phase2/u4_fidelity_input_2019r01a.json` (`--precrop` 版、crop **51/52**、`prev_page_png` 52/52)
  - `page-16` のみ `detected 1 / expected 2` で安全側 skip → **`q036` は crop 無し = 源ページ直読**
  - precrop calib: `head=150` (votes 150=35p / 140=19p / 190=1p)。S123 のページ投票が正常動作
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u4_2019r01a_sn.json`
- **覆盖 52/52 / UNREADABLE 0 / agents_error 0**
- 是正器: `scripts/quiz-fidfix-S124-u4.mjs` (assert-once / 冪等 / 既定 = 適用、`--dry-run` で読取専用)

### Sonnet 単 pass の実測 (U1 / U3a / U3b との対照)

| 項目 | U1 (2015h27a 68 問) | U3a (2018h30h 70 問) | U3b (2019h31h 87 問) | **U4 (2019r01a 52 問)** |
|---|---|---|---|---|
| token | 4,030,000 | 4,249,378 | 5,167,455 | **3,120,259** |
| token / 問 | 59,265 | 60,705 | 59,396 | **60,005** |
| 時間 | 15 分 | 26.2 分 | 16.2 分 | **8.8 分** |
| tool 呼び出し | — | 601 (8.6 回/問) | 698 (8.0 回/問) | **430 (8.3 回/問)** |
| part 壊れ | 2/68 → journal 復元 | 2/70 → journal 復元 | 1/87 → journal 復元 | **0/52** |
| UNREADABLE | 0 | 0 | 0 | **0** |

> token/問 は 4 unit を通じて 59.3k〜60.7k に収束 (幅 2.4%)。**本 unit は part 壊れ 0 で `--journal` 復元が初めて不要**
> だったが、`merge-parts --journal` 運用自体は継続する (journal 52 / part 52 の一致確認に使える)。

---

## 2. 率

| exam | n | agent DISCREPANT | 率 | +machdiff | 計上 (率) | **是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|---|
| 2019r01a | 52 | **4** | 7.7% | **+0** | 4 (**7.7%**) | **4 (7.7%)** | **1** | **0** |

- agent DISCREPANT 4 は**全件採用**。非採用 0 / machdiff 由来の追加 0 → **計上 4 = 是正 4**。
- **severity 内訳** (4 論理差分): cosmetic **3** / semantic **1** / answer_affecting **0**。
  agent の `bySeverity` {cosmetic 3, semantic 1} と**そのまま一致**する (増減なし)。
- **正解肢上 1** = `q016` choice.イ (読点脱落、cosmetic)。`correct_answer=イ` は不変。
- `correct_answer` 変更 **0 / 2900**、`data/ip/exams/answer_keys.json` **バイト不変** (md5 `6802bb0b…` 前後同一)。
- 単 pass のため severity の pass 間不一致は構造的に発生しない。裁定は fixer の原寸実読による (§4)。

### 既往波との比較

| | 標本 | 計上 | 率 | 正解肢上 | answer_affecting | 抄写 model |
|---|---|---|---|---|---|---|
| ⑤-3 (層化抽検 4 exam × 20) | 80 | 14 | 17.5% | 5 | 1 | Opus 双 pass |
| 波 1 (2015h27a + 2016h28a) | 152 | 13 | 8.6% | 3 | 1 | Opus 双 pass |
| 波 2 (2016h28h + 2017h29a) | 158 | 15 | 9.5% | 3 | 0 | Opus 双 pass |
| 波 3 (2017h29h + 2018h30a) | 152 | 12 | 7.9% | 0 | 1 | Opus 双 pass |
| U3a (2018h30h) | 70 | 8 | 11.4% | 2 | 1 | Sonnet 単 pass |
| U3b (2019h31h) | 87 | 9 | 10.3% | 1 | 0 | Sonnet 単 pass |
| **U4 (2019r01a)** | **52** | **4** | **7.7%** | **1** | **0** | **Sonnet 単 pass** |
| **累計 (波 1–3 + U3a + U3b + U4)** | **671** | **61** | **9.1%** | **10** | **3** | — |

U4 の 7.7% は既往で最低水準 (波 3 の 7.9% と同等)。U3a 11.4% / U3b 10.3% から下がったのは
**2019r01a に引用符・括弧の字種置換が 1 件も無かった**ことが主因で、U3b の cosmetic 14 のうち 11 を占めた
「引用符・亀甲括弧の置換」型が本 exam では 0 件だった。残る差分は**区切り記号の脱落 3 + 誤字 1** に純化している。
dataset の品質が良化したというより、**exam ごとに支配的な腐敗型が違う**と読むべき (§11)。

---

## 3. 機械 diff (machdiff) — **AGENT_MISSED 0 / 実残差 0 / 偽陽性 0**

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u4_fidelity_input_2019r01a.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u4_2019r01a_sn.json
machdiff: fields same=260 | AGENT_MISSED=0 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 52/52
```

- **U1〜U3b を通じて初の「残差ゼロ」unit**。PLAN §2 の停止条件「machdiff 残差 > 3 (既知型偽陽性除外)」に非該当。
- 既知型偽陽性 (表型選択肢の一行化 / 表の体裁差) も **0 件** — 2019r01a の対象 52 問に表型選択肢が含まれなかったため。
- **machdiff 由来の新規是正は 0 件**。U3b では `q001` を machdiff だけが拾ったが、本 unit では agent と machdiff の
  判定が完全一致した。
- **machdiff の位置づけ (S124 Rule D MINOR-3 で訂正)**: 当初「読点脱落 3 件は machdiff では原理的に検出できない」と
  書いたが誤り。`normStr` は空白を**削除**する (読点に統一するのではない) ので、脱落した読点は正規化後も欠落として残り、
  reviewer の実測 (patch を外した素の比較) で `q016`@14 / `q036`@11 / `q041`@7 とも norm(修正前) ≠ norm(源)。
  つまり agent が計上しなければ 3 件とも `AGENT_MISSED` として立った。**本 unit で machdiff の独自貢献が 0 なのは
  能力の限界ではなく、agent (Sonnet、S119 規定「区切り記号の脱落も計上」) が先に全件拾ったから。**
  残る `q097` の `減`→`滅` は字が違うので machdiff でも拾えるはずだが、agent が先に計上したため
  `AGENT_MISSED` にはならず `same` 側に入っている (machdiff は agent 計上分を patch してから比較する実装)。

---

## 4. 裁定 (fixer が源を原寸〜30 倍で独立実読)

実読した源: `data/ip/quiz/.phase2/precrop/2019r01a/` の **q016 / q041 / q097**、および
**crop を持たない `q036` は源ページ `data/ip/exams/pages/2019r01a/page-16.png` を直読**。
対照用に `q074` (page-32) / `q086` (page-37) / `q043` / `q085` も実読した。
agent の `source_text` は候補として扱い、**すべて自分の目で読んでから** from/to を決めた。**採用 4 / 非採用 0**。

### 4a. `q016` choice.イ — 読点の脱落 (**正解肢**)

- page-08 の crop を原寸 → **8 倍**で実読: 「ベンダ企業から情報収集を行い**，**システムの技術的な課題や実現性を把握する。」
  読点グリフ (ベースラインに座る尾付きの点) が明瞭。dataset は読点が**空白 1 個**に落ちて `行い システム` になっていた。
- 同一肢の他の位置に読点は無く、同題の他 3 肢 (`ア 入手し, 契約金額` / `ウ なくし, 取引を` / `エ 求め, 発注先`) は
  すべて `, ` を保持している → **本肢だけが脱落**という局所性が確認できる。
- jp 字種は house rule の ASCII `", "` (D-147 §1)。
- **イ は正解肢**だが変更は区切り記号のみで、`correct_answer=イ` は不変。RFI の定義に基づく導出も不変。
- zh 「向供应商企业收集信息**，**掌握系统的技术课题与可行性。」/ en は接続詞形で既に忠実 → **追随不要**。

### 4b. `q036` choice.ウ — 読点の脱落 (**crop 無し → 源ページ直読**)

- `page-16` は precrop が `detected 1 / expected 2` で安全側 skip されたため、**源ページ PNG (1432×2026) を直読**した。
  原寸で全面を確認し、当該箇所を **8 倍**に拡大: 「情報システム企画段階**で，**ユーザニーズを調査し，システム化要件として文書化する。」
- dataset は 1 個目の読点が空白に落ちて `段階で ユーザニーズ` になっていた。**2 個目の読点 (`調査し, システム化要件`) は健在**
  なので、同一肢内で処置が割れないよう 1 個目を是正した。
- 誤答肢 (正解はエ) のため答えには影響しない。zh 「在信息系统规划阶段调查用户需求**，**…」/ en は既に忠実 → 追随不要。

### 4c. `q041` choice.ア — 読点の脱落 (4 個中 2 個目)

- page-18 の crop を原寸 → **8 倍**で実読: 「企画**，**要件定義**，**システム開発**，**保守の順番で**，**開発を行う。」
  **4 個の読点すべてが同一グリフ**であることを確認。dataset は `企画, 要件定義 システム開発, 保守の順番で, 開発を行う。` で
  **2 個目だけが空白**に落ちていた。
- 同一肢内で 3 個は `, ` を保持しているので、脱落した 1 個を同じ ASCII `", "` に揃える (D-147 §1)。
- 誤答肢 (正解はウ) のため答えには影響しない。zh 「按照规划、需求定义、系统开发、维护的顺序…」/
  en "planning, requirements definition, system development, and maintenance" は**区切りが全数健在** → 追随不要。

### 4d. `q097` choice.エ — `減失` → 源 `滅失` (**semantic**)

源のグリフは **25×25px** しかなく、`減` (氵+咸、内側に**閉じた 口**) と `滅` (氵+烕、内側は **火**) の判別は
原寸では不能。**agent の主張を鵜呑みにせず 3 段で独立に確定**した。

**(1) 30 倍 lanczos 拡大の直接実読** (page-42 crop、対象字の tight bbox = `x 834..858 / y 516..540`)

対象字は、横棒の下が**左右に開いた 火** の形で、**閉じた矩形 (口) が無い**。
同 exam の実在する `減` (`2019r01a-q074` page-32 「増減」、tight bbox `x 654..678 / y 292..316`) は
同じ位置に**閉じた 口** が明瞭に見える。

**(2) 同一字の corpus 内基準線との対照** (64×64 二値化 / tight bbox 正規化 / 閾値 grey<170)

| 対 | bitmap 不一致率 | 意味 |
|---|---|---|
| `減`(q074 p32) vs `減`(q086 p37「低減」) | **11.1%** (454/4096) | **同一字・同 font・同サイズの基準線** |
| 対象字(q097) vs `減`(q074) | **20.6%** (845/4096) | 基準線の 1.9 倍 |
| 対象字(q097) vs `減`(q086) | **22.2%** (911/4096) | 基準線の 2.0 倍 |
| 対象字(q097) vs 無関係字 (`増` p32 / `の` p42) | **45.0%** / **52.4%** | 別字の水準 |

対象字と `減` の距離は同一字基準線より明確に大きい (fixer 実測 1.9〜2.0 倍。**S124 Rule D MINOR-4: reviewer の
同手順再実装では基準線 10.1% / 対象 14.8%・17.6% = 1.5〜1.7 倍で「ちょうど 2 倍」は再現せず**。tight bbox の 1px 差に
敏感な指標であり、この (2) は**補強**に留める)。`氵` と `戈` を共有するため無関係字 (45〜52%) よりは近いが、
**同一字ではない**。**決め手は (1) の 30 倍直読 (「火」の下に閉じた口が無い、という位相差) と (3) の下流裏取り**。

**(3) 言語・下流工程の裏取り**

- 「滅失」は標準語 (データ・物が完全に失われること)。**「減失」は語彙として存在しない**。
- 本問の**解説は既に「データの滅失を防ぐ」と書かれていた** (`expl_jp_2019r01a-q097.json` の distractors エ)。
  `expl_tr_` の zh 「防止数据丢失」/ en "prevent data loss" も源の語義。
  → **別系統の工程が独立に「滅失」を保持**していた (S123 §4g の `.phase1` 裏取りと同型)。
  本是正は**解説と選択肢本文の既存の食い違いを解消する**方向であって、新たな不整合を作らない。
- corpus 横断: 是正後の `減失` は **0 件**、`滅失` は `2012h24a-q098` と本問の **2 件**。字種が corpus の規範に揃った。

**採用しなかった補強** (Rule D 向けに明記): font 描画 (Hiragino Kaku Gothic ProN) の `減` / `滅` との照合も試みたが、
**書体差が字種差を上回り** (源グリフ 3 種 × 参照 2 種の全ペアが 28〜36% で分離しない) 判別に使えないため、
根拠から**除外した**。判別の根拠は上記 (1)(2)(3) のみ。

- 誤答肢 (正解はウ) のため答えには影響しない。**zh / en は追随不要** (上記のとおり既に源の語義)。

### 4e. CLEAN 標本の無作為抽検 (見落としの有無)

machdiff 残差 0 = 「agent の見落としが機械的には出なかった」でしかないため、**CLEAN 判定 48 問から 2 問を実読**した。

| id | 実読結果 |
|---|---|
| `q043` (**p19**、4 肢とも長文で choices 内に読点 5 個) | 題幹・4 肢とも源と逐字一致。**読点は 5 個すべて健在**。差は `AI␣を`→`AI`の英数字周囲空白と読点字種のみ (許容揺れ) |
| `q085` (p37、2 段組の短肢) | 題幹・4 肢 (`IMAP` / `SMTP` / `情報セキュリティポリシ` / `ディジタル署名`) とも逐字一致。2 段組の読み順も正 |

→ **見落とし 0**。特に `q043` は読点密度が高い長文肢で、本 unit の主要腐敗型 (読点脱落) に対する**陰性対照**になる。

---

## 5. SOURCE_TYPOS

本 unit では**該当なし** (源が誤っていて dataset が正しい型は 0 件)。
波 3 §5 の `2018h30a-q043` が唯一の既存登記であり、横断台帳化は §11 backlog のまま。

---

## 6. 採用した差分 (4 題 / 4 論理差分)

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q016 (p08) | choice.イ | `行い␣システム` → 源 `行い，システム` (読点脱落)。**イ は正解肢** | cosmetic | agent |
| q036 (p16) | choice.ウ | `段階で␣ユーザニーズ` → 源 `段階で，ユーザニーズ` (読点脱落)。**crop 無し = 源ページ直読** | cosmetic | agent |
| q041 (p18) | choice.ア | `要件定義␣システム開発` → 源 `要件定義，システム開発` (4 個中 2 個目の読点脱落) | cosmetic | agent |
| q097 (p42) | choice.エ | `データの減失` → 源 `データの滅失` | **semantic** | agent |

- **すべて `choices_jp` 上の差分で、stem の是正は 0 件。**
- jp 字種は house rule の ASCII `", "` (D-147 §1)。

### zh / en の追随

**4 件とも追随不要**。機械確認した内訳:

| id | zh | en | 判定 |
|---|---|---|---|
| q016 イ | 「向供应商企业收集信息**，**掌握…」 | 接続詞形 ("to grasp …") | 区切り健在 → 不変 |
| q036 ウ | 「在信息系统规划阶段调查用户需求**，**…」 | 分詞構文 ("Surveying … and documenting …") | 区切り健在 → 不変 |
| q041 ア | 「规划**、**需求定义**、**系统开发**、**维护」 | "planning**,** requirements definition**,** system development**, and** maintenance" | 4 項目の区切りが全数健在 → 不変 |
| q097 エ | 「防止**数据丢失**的备份」 | "backups to prevent **data loss**" | 既に `滅失` の語義 → 不変 |

→ `data/ip/quiz/translations/` の**追跡下 29 exam すべてが HEAD と byte 同一** (§8 で機械確認)。

### 指示から外した点

**なし。** 主 context の採用候補 4 件をすべて源実読で確認し、追加採用・非採用への変更は行っていない。
q097 について指示された「zh / en / 解説に『減失』由来の誤訳が無いか確認し、あれば追随」は**確認済・追随不要**
(上表 + §4d(3))。

---

## 7. 層と局所性

| 層 | 置換操作数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/2019r01a.json` の `choices_jp`) | **12** | 4 差分 × 3 層 |
| sidecar (`translations/2019r01a.json`) | **0** | zh/en 追随なし。**`choices_jp_clean` は存在しない** (下記) |
| `.phase1/tr_<id>.json` | **0** | 同上 |
| 解説 `.phase2/expl_{jp,tr}_*.json` | **0** | §4d(3) のとおり既に源の語義で書換不要 |
| key_guard final note (`.phase2/generate_result_2019r01a.json`) | **2** | D-143: **final のみ**、round1 不可触 |
| **fidfix 合計** | **14** | `quiz-fidfix-S124-u4.mjs` の `applied` と一致。**skip 0 / 無言 guard skip 0** |

### 選択肢に clean 層は無い = **腐敗は学習者に見えていた**

- 2019r01a の sidecar / `.phase1` のキーは `stem_jp_clean` / `stem` / `choices` のみで、
  **`choices_jp_clean` は存在しない** (`choices` は zh・en だけを保持)。
- 表示側の実装も `apps/web/src/lib/quiz/quizModel.ts:243` が `q.choices_jp[letter]` を直接読む
  (`stem_jp_clean` のような上書き経路が**選択肢には無い**)。
- → **本 unit の 4 件はいずれも出荷層の腐敗**で、学習者に見えていた。U3b の `q007` / `q096` (clean 層のみの是正で
  `questions.json` に現れない) とは対照的。
- 参考: `scripts/quiz-marunum-sep-D147.mjs:95` は `t.choices_jp_clean` への防御的分岐を持つが、
  実測でどの exam にも存在しない。

### 適用ループの由来 (Rule D 向け)

`quiz-fidfix-S124-u4.mjs` の適用ループ本体・`sub()` は **S122 / S123 で Rule D PASS 済のものを逐字そのまま流用**した。
本 unit は FIX に stem エントリと zh / en エントリが無いため、**stem 分岐と zh / en 分岐は実行されていない**
(未実行であって未検証ではない — S123 で同一コードが 65 操作を通している)。層規則の同一性を保つため削っていない。

### key_guard final note

- 対象 **2 件** = `q016` (**正解肢命中**) / `q097` (**語義是正**)。
  方針は波 2 / 波 3 / U3a / U3b と同一: **語義是正 / 正解肢命中 / D-144 段 2 化 に限り追記**。
  `q036` / `q041` は誤答肢の記号のみの是正なので**追記しない** (本 evidence に一覧化)。
  - 正解肢命中による追記の precedent = 波 2 `2016h28h-q089`「4 肢すべてに脱落していた読点と文末句点を復元（正解肢エ を含む）」。
- **2 件とも純粋な後置**で、追記前 prefix が `key_guard_round1.note_jp` と**逐字一致することを機械照合済**
  (`final.startsWith(round1)` → 両方 `true`)。`key_guard_round1` への MARK 混入 **0 件**。
- **NOTE_SUB は本 unit では該当なし**。既存 final note のいずれも「腐敗が**ある**」と現在形で主張していない
  (`q016` の note は raw stem の「官公店」に言及するが、本 unit はそれを触らないので矛盾しない)。
- `--dry-run` 再実行 (2 回): **applied 0 / skipped 14** (完全冪等)。

### tracked データの差分

| ファイル | 差分 | 内訳 |
|---|---|---|
| `data/ip/quiz/questions.json` | 4 行 (+4/−4) | `q016.イ` / `q036.ウ` / `q041.ア` / `q097.エ` の 4 choice のみ |
| `data/ip/quiz/explanations/2019r01a.json` | +16 / −2 | final `note_jp` 2 件の書換 + **`round1` ブロック 2 件の新規 publish** (各 7 行) |
| `data/ip/quiz/translations/*.json` (29 exam) | **0** | 追随なし・再 merge なし |

`round1` の新規 publish は **D-143 の設計どおり** (final note を書換えると round1 が併記される)。
S124 §2 の D-147 §6 適用時に 10 問で同じ挙動が観測されており、既知・想定内。
`derived_answer` / `matches_key` / `figure_derivable` / `stem_corruption_suspected` は **全問不変** (機械照合)。

---

## 8. 事後核験 (Rule A 相当の自証)

**(a) 是正後 manifest を再構成して machdiff を再実行**

```
node scripts/quiz-fidelity-prep-any.mjs 2019r01a u4post "3,4,6,...,100" --precrop   # 52/52、crop 51/52 (事前と同一)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u4post_fidelity_input_2019r01a.json <同じ結果 JSON>
machdiff: fields same=260 | AGENT_MISSED=0 | VERDICT_CONFLICT=0 | coverage 52/52
```

- **事前と完全に同一** (`same 260 / MISSED 0 / CONFLICT 0`)。**新規残差 0**。
- **precrop 回帰**: 再 prep 前後で `precrop/2019r01a/` の crop PNG 集合 md5 が
  **`93ad1401…` で同一** (byte 不変)。生成した `u4post` manifest は削除済。

#### 事前の `same` は 4 件が「空虚な一致」だった — 是正でそれが**真の一致**に変わった

S123 §8a が指摘した machdiff の構造的弱点 (**agent の `current_text` が field 全文だと、
patch 後の比較が自明に一致してしまう**) は、**本 unit の 4 件すべてに該当していた**。
機械確認 (`normStr` は machdiff の実装から逐字複製):

| id.field | patch 適用可 (事前) | patch 適用可 (事後) | `norm(事前 displayed) == norm(transcript)` | `norm(事後 displayed) == norm(transcript)` |
|---|---|---|---|---|
| `q016.イ` | **true** | false | **false** | **true** ✅ |
| `q036.ウ` | **true** | false | **false** | **true** ✅ |
| `q041.ア` | **true** | false | **false** | **true** ✅ |
| `q097.エ` | **true** | false | **false** | **true** ✅ |

読み方:

1. **事前**は `current_text` が field 全文なので patch が当たり、field 全体が `source_text` に置換されて
   比較が自明に成立していた。patch を外すと 4 件とも `norm` 比較は **不一致** = 事前の `same` のうち
   **4 件は空虚な一致**だった。
2. **事後**は `current_text` が displayed に含まれなくなり patch は当たらない (S123 `q034` と同じ条件)。
   **にもかかわらず `norm` 比較が一致する** = 是正後のテキストが源 transcript と**素で一致**している。
3. → 是正は 4 件の空虚な一致を**真の一致に変換**した。`same 260` という同じ数字だが、**中身の質が上がっている**。
4. S123 の `q034` が是正後に残差として浮上したのは、その field の下地の差 (markdown 表ヘッダ行) が
   `normStr` で潰せない型だったから。本 unit の 4 件は**下地の差が「是正した当のもの」だけ**だったので、
   patch が外れても残差が出ない。**同じ機構の下で結果が分かれる理由が説明できている。**

> したがって「事前 = 事後 = `same 260`」を**無変化と読んではいけない**。machdiff の残差計数は
> 本来この差を区別できず、S123 §11 が提案した「agent 計上済 field は事後比較で除外する」改修が入れば
> 事前の 4 件は `same` から外れて可視化される。**⑨ backlog の当該項目は本 unit で再確認された** (§11)。

**(b) 採用 4 件の `source_text` と是正後表示テキストの直接照合**
(許容表記揺れ = NFKC / 読点字種 `、，,` / 空白 のみ潰す):

| 判定 | 件数 | 内訳 |
|---|---|---|
| EXACT (逐字一致) | 0 | — |
| TOLERANT (許容表記揺れのみ差) | **4** | `q016` / `q036` / `q041` / `q097` |
| RESIDUAL | **0** | — |

4 件とも残差は **jp 読点の字種のみ** (源 `，` / dataset は house rule の ASCII `", "`) と英数字周囲の空白。
D-147 §1 が定める jp 規則どおりなので**データ正**。→ **実残差 0**。

**(c) 波及ゼロの機械証明** (HEAD 比較)

| 検査 | 結果 |
|---|---|
| `questions.json` 2900 問の jp テキスト変更 field | **4** = `q016.イ` / `q036.ウ` / `q041.ア` / `q097.エ` のみ |
| `correct_answer` 変更 | **0 / 2900** |
| `question_bank` vs `by_year` vs `questions` 全量照合 (`stem_jp` + `choices_jp` + `correct_answer`) | **2900 問 / 不一致 0** |
| `translations/` 追跡下 29 exam | **変更 0 ファイル** (再 merge 事故なし) |
| `explanations/2019r01a.json` の `key_guard` 以外 | **変更 0** (`correct` / `points` / `distractors` / `derived_answer` / `matches_key` 全問不変) |
| `answer_keys.json` | **md5 `6802bb0bc13004da78ad3c4e5117d997` 前後同一 (byte 不変)** |

→ **他 exam / 他 lane の踏み潰し 0**。

---

## 9. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE **0 件 / 0 exam** / (A) 共有図メンバー全員がページ整合 / (B) 判定 JSON の SPLIT_FIGURE 50 件が両層で判定どおり |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ **0 error** (exit 0) |
| `pnpm -C apps/web exec vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** |
| `node --check scripts/quiz-fidfix-S124-u4.mjs` | ✅ |
| `--dry-run` × 2 (適用後) | ✅ **applied 0 / skipped 14** (完全冪等) |
| `correct_answer` 差分 | ✅ **0 / 2900**。`git diff -U0 data \| grep -c correct_answer` = **1** だが、実 field 行は **0** — 唯一の行は `q016` の key_guard note 本文中の「correct_answer=イ は不変」という**記述**であり、答えの変更ではない |
| `answer_keys.json` | ✅ **byte 不変** (md5 前後同一) |
| 事後 machdiff (manifest 再生成 → 実行) | ✅ `same=260 / AGENT_MISSED=0 / VERDICT_CONFLICT=0 / coverage 52/52` = **事前と同一、新規残差 0** |
| D-143 (final のみ / round1 不可触) | ✅ MARK 付き final note **2 件**、**2 件とも純粋後置** (`final.startsWith(round1)` を機械照合)、round1 への MARK 混入 **0**、`explanations` 内 MARK 出現も **2** |

適用前の前提検証: `node scripts/quiz-phase2-merge.mjs 2019r01a` を**先に実行して `git diff` 0** を確認
(merge 冪等 = `.phase2` は stale でない)。

再生成: `build-quiz-corpus.mjs` (2900 問 / 63 topic / 29 exam / **with_fig 511**) →
`quiz-phase2-merge.mjs 2019r01a` (explained 100 / missing 0 / **STEM-CORRUPTION 0** /
SUSPECT 2 = `q019` / `q064` — **適用前と同一**で本 unit の変更対象外)。

---

## 10. 見送り (クラス登記のみ、本 unit では是正しない)

| クラス | 該当 | 理由 |
|---|---|---|
| **ASCII 読点の後の空白の有無** | `q041` choice.エ 「リスクの識別**,**コントロール」(他は `, `) | 区切りは**存在する**ので脱落ではない。空白の有無は ⑤-4 R8 lane の射程 / 許容表記揺れ。ただし**同一肢内で `, ` と `,` が併存**しており §11 に登記 |
| **N5 (clean 保有題の raw 残存腐敗)** | `q016` raw `stem_jp` 「**官公店**」(源「官公庁」) + 「最 も」の語中空白。**S124 Rule D NIT-3 追加**: `q056` raw stem「次の作業**ad** のうち」「全て**閥**げた」/ `q061` raw stem「適切**か**もの」「挙げ**け**た」(clean は正、字が変わる型) | clean 層 (`stem_jp_clean`) は「官公庁」で正、stem の出荷層は clean → 学習者不可視。**字が変わる型**なので §11 の N5 別ランク台帳の対象 |
| N5 (軽微) | `q097` raw `stem_jp` 「記述のう ち」の語中空白 | clean 層は正。数値・語義は変わらない |
| 読点の字種 | 採用 4 件の `, ` vs 源 `，`、`q016` clean stem の `、` | house rule (D-147 §1) どおり。従来どおり許容表記揺れ |
| 語間空白・全半角 | `q043` 「AI を」→ dataset 「AI」、英数字周囲の空白 | ⑤-4 R8 lane の射程 / 許容表記揺れ |
| 表型選択肢・図の言語化 | **本 unit の 52 問には該当なし** | machdiff 偽陽性 0 の理由 |

---

## 11. backlog (⑨ / 次 unit へ)

### ⑨ (S118 §223(5) / §168 の再確認 + 走査の決定的化): **読点脱落型の corpus 横断走査 — 未監査領域に同型が 8 field 実在する**

> S124 Rule D MINOR-1: 「新規」ではない。S118 log:223 方針 (5) が「⑤-4 の 16 exam 外の命中 (13 exam) は掃引外 → 別途実読 lane に登録」を既に決め、同 log:168 / `evidence/quiz_choice_defect_scan_S118.md:122` が `2020r02o-q045` / `2022r04-q022` / `2024r06-q005` を R8b 読点候補として名指し登記済。本節の新規貢献は (a) 走査の決定的な正規表現化 (b) `2023r05-q032` 双子問の発見。

本 unit の主要腐敗型 (「日本語文字 + ASCII 空白 1 個 + 日本語文字」= 日本語は語間空白を使わないので読点脱落の強い信号)
を **`questions.json` の `choices_jp` 全 2900 問に決定的走査**した (0 token)。

- 是正後の **2019r01a は残 0** ✅
- corpus 全体: **23 field / 13 問**。機械分類で表型 9 (`[表]` / `=` を含む一行化、既知の偽陽性) を除くと
  **散文型 14 field**。うち図の言語化 (D-141、`2011h23tokubetsu-q099` ×3) と
  助詞前の空白型 (「データ␣を」「ハードディスク␣に」= 別クラス、4 件) を除いた
  **真の読点脱落候補は 8 field / 6 問** (S124 Rule D NIT-2: `2013h25a-q043.イ` = 同一肢 2 箇所を追加。reviewer 走査では
  さらに「OCR 行末ごみ」型 4 field (`2009h21a-q018.イ/エ` / `2022r04-q014.エ` / `2026r08-q041.ア`) が別分類として立つ):

| id.肢 | 本文 (抜粋) | 監査状況 (機械確認済) |
|---|---|---|
| `2010h22h-q023.ウ` | 「検査を行い**␣**サンプル中の」 | **full52 母集団の外**。S114 の的絞り pass (5〜7 問) にも**未収録** |
| `2013h25a-q043.ウ` | 「業務要件の定義**␣**ソフトウェア要件定義」(同一肢に `, ` も併存) | **full52 母集団の外**。S110 `s7x` pass (6 問) にも**未収録** |
| `2013h25a-q043.エ` | 「システム要件定義**␣**ソフトウェア要件定義」(同上) | 同上 |
| `2013h25a-q043.イ` | 「業務要件の定義**␣**ソフトウェア要件定義**␣**システム要件定義」(同一肢 2 箇所) | 同上 (NIT-2 追加) |
| `2020r02o-q045.エ` | 「技術的, 物理的**␣**人的, 組織的」(同一肢に `, ` が 3 個) | 母集団内・excluded ではない → 将来 unit で被覆 |
| `2022r04-q022.ウ` | 「価値が調達**␣**開発,製造,販売」 | 同上 |
| `2023r05-q032.ア` | 「情報収集を行い**␣**システムの技術的な課題や実現性を把握する」 | 同上 |
| `2024r06-q005.ウ` | 「国や学術機関**␣**他の企業など」 | **excluded (`pilot_B_sample_double_pass`) → 将来 unit では被覆されない。R8b lane 側 (S124 Rule D MINOR-2 で訂正)** |

- **既往 pass の偽陰性ではない**。上記 7 field は**いずれも過去に一度も監査されていない**ことを機械確認した
  (`full52_population_S118.json` の `exams` / `excluded` と、S110 `s7x_fidelity_S110_2013h25a.json` (6 問) /
  S114 `caveat_*` (5 問) `kg_*` (7 問) の監査 id 集合を突合)。
  **当初「既往 sweep 済 exam の取りこぼし」と書いたが、これは fixer の誤りで、自己検証で撤回した。**
- **本当の所見 2 つ**:
  1. **`2023r05-q032.ア` は本 unit で是正した `2019r01a-q016.イ` とほぼ同一文**
     「(ベンダー)企業から情報収集を行い␣システムの技術的な課題や実現性を把握する」。
     焼き直し問で**同じ位置に同じ脱落**がある = 腐敗は源 PDF の版ではなく**抽出工程side に起因**する可能性が高い。
     母集団内の 3 件 (`2020r02o-q045` / `2022r04-q022` / `2023r05-q032`) は将来 unit (U5+) で自然に被覆される。
     `2024r06-q005` は excluded、`2010h22h-q023` / `2013h25a-q043` は母集団外 → この 3 件は S118 の R8b 実読 lane が要る
     (reviewer は全 fidelity 結果 JSON の verdict 付き 875 id と突合し、5 id とも未監査であることを確認)。
  2. **⑤-2 の母集団は 16 exam しか覆っていない** (`2015h27a`〜`2026r08`)。corpus の 29 exam のうち
     **13 exam (`2009h21a` / `2009h21h` / `2010h22a` / `2010h22h` / `2011h23a` / `2011h23tokubetsu` /
     `2012h24a` / `2012h24h` / `2013h25a` / `2013h25h` / `2014h26a` / `2014h26h` / `2015h27h`) は
     全量 sweep の対象外**で、S109〜S116 の的絞り pass しか当たっていない。
     上記 3 field (`2010h22h-q023` / `2013h25a-q043` ×2) はこの空白域に落ちている。
- → **推奨**: (a) 13 exam の空白域について、**決定的走査で拾える型 (読点脱落・丸数字区切り・空白) だけでも
  横断的に当てる軽量 lane** を検討する。LLM pass 不要で走査は 0 token、是正は源ページ直読で足りる
  (本 unit §4a〜4c と同じ手順)。(b) 走査そのものは決定的なので、**各 unit の収尾で回して残 0 を確認する
  常設ゲート**にできる (本 unit では 2019r01a 残 0 を確認済)。
  **本 unit では他 exam を触らない指示のため未着手。**

### ⑨ 新規: 同一肢内で ASCII 読点の空白有無が割れる

`2019r01a-q041` choice.エ 「リスクの識別**,**コントロール」は、同じ肢の他 **4** 箇所が `", "` なのに
1 箇所だけ `","` (空白なし。機械計数: `", "` 4 / 空白なし `","` 1)。区切りは存在するので本 unit では非採用としたが、
**D-147 が jp を `", "` に統一した以上、散文中の ASCII 読点も同じ規範に寄せるか**を決めておきたい。
D-147 §4 は「題幹は触らない / 丸数字の区切りのみ」と射程を限っているので、拡張には別 D が要る。

### ⑨ 新規: `減`/`滅` 型 — 字形が近い漢字の OCR 誤りは machdiff でも agent でも取りこぼしうる

本件は agent が拾ったが、**25×25px では原寸判別が不能**で、fixer 側に
「同一 exam 内の実在字との bitmap 対照 (同一字基準線 ≈ 11%、別字 ≈ 20%+)」という反証手順が必要だった。
- → **推奨**: §4d(2) の手順 (tight bbox 正規化 → 64×64 二値 → 同一字基準線との距離比較) を
  字形判定の標準手順として fidelity の運用メモに追記する。S123 §4j の画素計測 (句読点の染み判定) と対になる。
- あわせて **font 描画との照合は使えない** (書体差 28〜36% が字種差を覆う) ことも明記したい。

### ⑨ (継続、S123 §11 から繰越)

- **解説の肢引用と choices の乖離**: S124 §2 の D-147 §6 で 18 問 / 106 field を正規化済。
  残余は SKIP 4 field (`2010h22a-q097` / `2018h30a-q081` の節境界) + round1 2 + final note 12 で、
  ユーザー判断待ち (S124 §5 MINOR-3)。**本 unit では新規の乖離は発生していない** (解説書換 0 件)。
- **N5 の「数値・論理が変わる型」の別ランク台帳化**: S123 §11 (`2019h31h-q053` 「59本」← 源「50本」)、
  U3a (`2018h30h-q085` 「9個以上」← 源「0個以上」) に続き、本 unit で `2019r01a-q016` 「官公店」← 源「官公庁」が加わった。
  **3 unit 連続で提起**されている。字が変わる型は数値型より軽いが、raw からの再 merge が起きると表示に出る点は同じ。
- **SOURCE_TYPOS の常設化** (波 3 §11 から繰越、本 unit では該当 0): `evidence/` 横断台帳は未着手。
- **machdiff の位置づけ + `q034` 型の改修は優先度を上げるべき**: 本 unit は agent と machdiff の判定が一致し
  (残差 0 / 新規是正 0)、machdiff は 1 件も独自貢献しなかった。
  さらに §8a のとおり **`q034` 型の「空虚な一致」条件は本 unit の採用 4 件すべてに該当**しており、
  `same 260` という数字は**事前も事後も同じだが中身の質が違う**。
  残差計数がこの差を区別できない以上、S123 §11 が提案した
  **「agent 計上済 field は事後比較で patch を外して評価する」改修**を入れると、
  事前の空虚な一致が可視化され「是正が本当に効いたか」を残差の増減で読めるようになる。
  **2 unit 連続で同じ弱点が出ているので優先度を上げたい。両者の併用自体は維持。**
- **precrop `page-16` の `detected 1 / expected 2`**: 本 unit では `q036` を源ページ直読で処理して実害なし。
  S123 §7 の `page-37` (detected 3 / expected 4) と同じ未調査項目で、**2 unit 連続で発生**。
  見出し検出の取りこぼし条件を一度調べておきたい。

---

## 12. Rule B (失敗記録)

**本 unit の抄写 run・是正器に失敗 attempt は無し。**
run は 1 回で完走 (52/52 / UNREADABLE 0 / agents_error 0)、**part 壊れ 0/52** で journal 復元も不要だった。
是正器も初回適用で assert-once 違反 0、適用前の `--dry-run` で全 14 操作の from/to を確認済。
`failures/` への新規追加は**なし**。

> 参考 (本 unit 外): S124 の前段 `D-147 §6` 適用では Rule D 第 1 往復が FAIL し、
> `failures/quiz_marunum_expl_S124_attempt_1.md` に記録済 (S124 log §4)。本 unit とは別 lane。

---

## 13. Rule D

Writer = `u4-fixer` (opus)。**Reviewer は別 `subagent_type` (opus) で本 evidence の後に別途実施すること**
(本ファイルは writer の自己申告であり、Rule D の審査は未了)。

審査時の重点:

1. **§4d の `q097` `減`→`滅` 判定**が最優先。25×25px の字形判定を bitmap 距離で行っているので、
   **同一字基準線 (11.1%) の再現**と、対象字が基準線の 2 倍離れているという結論の独立検証を求める。
   font 描画を根拠から除外した判断の当否も。
2. **§4a〜4c の読点 3 件**の源実読による独立再確認。特に **`q036` は crop が無く源ページ直読**なので、
   reviewer も自前で切り出して確認すること。
3. **§7 の「選択肢に clean 層は無い = 出荷層の腐敗」**という主張 — sidecar / `.phase1` の実キーと
   `quizModel.ts:243` の読み出し経路の両方から再確認。
4. **§8a の「事前の `same` は 4 件が空虚な一致だった」** — 4 件とも `current_text` が field 全文であること、
   patch を外すと事前は `norm` 不一致・事後は `norm` 一致になることの再現。
   S123 `q034` と同じ条件下で残差が浮上しない理由の説明が妥当か。
   (**注**: fixer は当初「`current_text` は部分文字列なので `q034` 型に該当しない」と誤記し、
   自己検証で誤りを発見して差し替えた。結論はより強い方向に変わっている)
5. **§11 の corpus 横断走査** — 走査の正規表現、表型 9 / 助詞前空白 4 / 図言語化 3 の分類、
   および 7 field が**いずれも未監査**であること (母集団 `exams` / `excluded` と S110 / S114 の監査 id 集合との突合) の再現。
   (**注**: fixer は当初これを「既往 sweep 済 exam の取りこぼし」と誤記し、自己検証で撤回している。
   既往波の品質主張に関わるので、撤回後の結論「偽陰性ではなく未監査」を独立に確認してほしい)
   あわせて「⑤-2 母集団は 16 exam / corpus は 29 exam で 13 exam が空白域」という指摘の当否。
6. §7 の key_guard 追記 2 件 (`q016` = 正解肢命中 / `q097` = 語義是正) の方針適合と、
   `q036` / `q041` に追記しない判断の当否。
7. 適用ループの stem 分岐・zh/en 分岐が**未実行**であることの確認 (S123 からの逐字流用であることも)。

---

## 14. Rule D 独立審閲 (S124、reviewer `pr-review-toolkit:code-reviewer` opus、fixer `oh-my-claudecode:executor` opus と別 type)

**判定: PASS-with-notes** — MAJOR 0 / 誤是正 0 / 漏れ 0 / `correct_answer` 変更 0 / **データ・脚本の修正を要する指摘 0**。
MINOR 4 / NIT 5 はすべて evidence の記述精度・⑨ backlog の事実関係に関するもので、**是正 4 件そのものは全件支持**する。

### 14a. 前提検証 — crop の無損失性

源ページからの独立実読が crop 実読と等価であることを先に確認した。sharp で greyscale raw に落とし、
crop PNG が `source_page_png` の**画素完全な部分矩形**であることを全数走査で照合:

| id | page | crop | 部分矩形の位置 |
|---|---|---|---|
| q016 | 1432×2026 | 1432×502 | **完全一致** x=0 y=181 |
| q041 | 1432×2026 | 1432×1024 | **完全一致** x=0 y=904 |
| q097 | 1432×2026 | 1432×725 | **完全一致** x=0 y=178 |
| q074 / q086 / q043 / q085 / q056 / q062 | 同上 | — | **全件 完全一致** (x=0 の全幅切り出し、リサンプリング無し) |
| q036 | — | **無し** | precrop skip → 源ページ直読 (fixer と同条件) |

→ 以降の実読はすべて**源ページ PNG から自前で切り出し**、lanczos3 で 1.5〜30 倍に拡大して行った (fixer の crop は使用せず)。

### 14b. 採用 4 件の独立実読 — **4/4 一致**

| id (page) | fixer の from → to | reviewer の独立実読 | 判定 |
|---|---|---|---|
| q016 イ (p08) | `行い␣システム` → `行い，システム` | 1.6 倍で全肢を通読、**10 倍**で当該箇所: 「集を行い**，**　システ」。読点グリフ (ベースラインに座る尾付きの点) が明瞭。他 3 肢 (`入手し，` / `なくし，` / `求め，`) も読点健在で、**本肢のみ脱落**という局所性を再現 | **一致** |
| q036 ウ (p16) | `段階で␣ユーザニーズ` → `段階で，ユーザニーズ` | crop 無しのため **源ページ page-16 を直読**。行投影で本文帯を出し (問36 = y322〜745 / 問37 = y876〜1191、page-16 に 2 問 = precrop の `detected 1 / expected 2` と整合)、1.7 倍で実読: 「情報システム企画段階**で，**ユーザニーズを調査し**，**システム化要件として文書化する。」1 個目が実在、2 個目も健在 | **一致** |
| q041 ア (p18) | `要件定義␣システム開発` → `要件定義，システム開発` | 「企画**，**要件定義**，**システム開発**，**保守の順番で**，**開発を行う。」**4 読点すべて同一グリフ**を確認。2 個目だけが空白に落ちていたという主張を再現 | **一致** |
| q097 エ (p42) | `データの減失` → `データの滅失` | 下記 14c | **一致** |

**副次確認**: q041 choice.エ 源は「リスクの識別**，**コントロール」で**区切りは実在**する (dataset は `,` で空白のみ欠落) → §10 の「脱落ではなく空白の有無」という分類は正しい。
q016 stem 源は「官公**庁**」で、raw `stem_jp` の「官公店」は §10 の N5 分類どおり。

### 14c. `q097` `減`→`滅` の独立確定 — **支持**。ただし bitmap 距離は evidence の数値と一致しない (MINOR-4)

**(1) 30 倍直読 (決定的)**。列投影で字セルを切り出し (tight bbox `x 834..859` / `y 694..718` = evidence の `834..858` / crop 座標 `516..540` と整合)、
30 倍 lanczos で対象字と同 exam の実在 `減` (`q074` p32「増減」、tight `x 654..678` / `y 472..496`) を**並べて実読**:

- 対象字 = 横棒の下が**左右に開いた 火**。**閉じた矩形 (口) が無い**。右上に 戈 の点。→ **滅**
- `q074` の `減` = 同じ位置に**白い内部をもつ閉じた 口** が明瞭。

**字形の差は連続量ではなく「閉じた口の有無」という位相の差**であり、原寸では不能でも 30 倍では一義に読める。**fixer の結論を支持**。

**(2) bitmap 距離 — 再現したが数値が違う** (MINOR-4)。evidence と同手順 (tight bbox 正規化 → 64×64 → grey<170 二値) を自前実装:

| 対 | reviewer 実測 | evidence 記載 |
|---|---|---|
| `減`(q074 p32) vs `減`(q086 p37「低減」) = **同一字基準線** | **10.1%** (413/4096) | 11.1% |
| 対象字 vs `減`(q074) | **14.8%** (608/4096) | 20.6% |
| 対象字 vs `減`(q086) | **17.6%** (721/4096) | 22.2% |
| 対象字 vs `増`(q074 p32) | **46.9%** | 45.0% |
| 対象字 vs `の`(q097 p42) | **53.6%** | 52.4% |

無関係字の水準 (45〜54%) は再現するが、**対象字と `減` の比は基準線の 1.5〜1.7 倍**で、evidence の「**ちょうど 2 倍**」は再現しない。
tight bbox の 1px 差と最近傍サンプリングに敏感な指標であり、**単独では字種を決められない**。位相補強として、
背景の**囲まれた穴**の連結成分を数えると 対象字 4 個 (最大 16px) / `減`(q074) 1 個 (13px) / `減`(q086) 2 個 (16,3px) で、
`減` は口の内部が単一の大穴、対象字は 火 の周りに小穴が分散 = 位相が違う。→ **結論は (1) と (3) で立つ。(2) は補強に留めるべき**。

**(3) 言語・下流の裏取り — 完全に再現、fixer より強い**。`git show HEAD:data/ip/quiz/explanations/2019r01a.json` を検査:
**是正前の HEAD 時点で既に `滅失` 1 件 / `減失` 0 件**。`.phase2/expl_jp_2019r01a-q097.json` の distractors エ も
「データの**滅失**を防ぐ」、`expl_tr_` は zh「防止数据丢失」/ en "prevent data loss"。**別系統の工程が独立に源の語義を保持**していた。
是正後の corpus 実測: `減失` **0 件** / `滅失` **2 件** (`2012h24a-q098` + 本問)。**font 描画を根拠から除外した判断にも同意** (書体差が字種差を覆う)。

### 14d. 漏れ — CLEAN 標本 3 問を追加実読、**見落とし 0**

fixer が読んだ `q043` / `q085` は使わず、CLEAN 48 問を**読点密度で降順に並べ**、上位から 3 問を源実読した (本 unit の支配的腐敗型 = 読点脱落に対する陰性対照):

| id (page) | 読点数 | 実読結果 |
|---|---|---|
| `q062` (p27、14 個) | 14 | 題幹 (PUSH/POP の 2 行 + 後段) ・4 肢 (`a, b, c` / `b, a, c` / `c, a, b` / `c, b, a`) とも源と逐字一致。**読点 14 個すべて健在** |
| `q086` (p37、14 個) | 14 | 題幹・4 肢とも逐字一致。ウ の「低いので，」は源で**行末の折返し**であり、dataset の空白無し `,` は §10 の空白クラス |
| `q056` (p24、8 個) | 8 | 題幹 (`次の作業 a〜d のうち，…`)・箇条 a〜d・4 肢とも逐字一致 |

→ **漏れ 0**。あわせて machdiff を**自前で再実行**: `same=260 / AGENT_MISSED=0 / VERDICT_CONFLICT=0 / coverage 52/52` (事前)。
結果 JSON から計数を独立再計算: `n 52 / CLEAN 48 / DISCREPANT 4 / bySeverity {cosmetic 3, semantic 1} / onCorrectChoice 1` = **§2 と完全一致**。
累計も再計算: 152+158+152+70+87+52 = **671**、13+15+12+8+9+4 = **61**、61/671 = **9.1%**、正解肢上 **10**、aa **3** — すべて §2 と一致。

### 14e. §8a「事前の `same` は 4 件が空虚な一致」— **全段再現、結論支持**

machdiff の `normStr` を逐字複製して検証 (patch を外した素の比較):

| id.field | `current_text` == field 全文 | manifest displayed == HEAD raw | norm(**修正前**) == norm(源) | norm(**修正後**) == norm(源) |
|---|---|---|---|---|
| q016.イ | **true** | true | **false** (差分 @14) | **true** |
| q036.ウ | **true** | true | **false** (差分 @11) | **true** |
| q041.ア | **true** | true | **false** (差分 @7) | **true** |
| q097.エ | **true** | true | **false** (差分 @20) | **true** |

→ 4 件とも `current_text` が field 全文なので事前の patch は自明に当たっていた (**空虚な一致**)、
是正後は patch が当たらないのに素で一致する (**真の一致**)。**fixer の自己訂正後の結論は正しい**。
`same 260` を「無変化」と読んではならないという指摘にも同意。

**事後 machdiff を自前で再現**: manifest を `u4rev` label で再生成 →
`same=260 / AGENT_MISSED=0 / VERDICT_CONFLICT=0 / coverage 52/52` = **事前と同一、新規残差 0**。
precrop 較正も再現 (`head=150`、votes **150=35p / 140=19p / 190=1p**、crop **51/52**、`page-16` のみ `detected 1 / expected 2` で skip)、
precrop PNG 集合 md5 は再生成前後で **`93ad14019576ac611f8e1e4eea3f66a3`** で同一 (evidence §8a の `93ad1401…` と一致)。`u4rev` manifest は削除済。

### 14f. 層の網羅・波及ゼロ

| 検査 | 結果 |
|---|---|
| raw 3 層 (`questions` / `question_bank` / `by_year`) の当該 `choices_jp` | **4 件とも 3 層同値** ✅ |
| 3 層の全量照合 (`stem_jp` + `choices_jp` + `correct_answer`、キー順不問) | **questions 対 bank 不一致 0 / 2900**、**questions 対 by_year 不一致 0 / 100** ✅ (※ キー順を見る素朴な比較では 9 問が「不一致」に見えるが、`アイウエ` 対 `アウイエ` の**キー並び差のみ**で HEAD 時点から存在。本 unit と無関係) |
| `questions.json` HEAD 比の変更問 | **4 問** = `q016` / `q036` / `q041` / `q097` のみ ✅ |
| `correct_answer` 変更 | **0 / 2900** ✅。`git diff -U0 data \| grep -c correct_answer` = **1** だが、当該行は note 本文中の「correct_answer=イ は不変」という**記述**で field 行は 0 — §9 の説明どおり |
| `answer_keys.json` | md5 **`6802bb0bc13004da78ad3c4e5117d997`** = evidence 記載と一致、byte 不変 ✅ |
| translations sidecar | **追跡下 29 exam すべて HEAD と byte 同一** (`git diff --name-only HEAD -- data/` = `questions.json` と `explanations/2019r01a.json` の 2 本のみ) ✅ 再 merge 事故なし |
| `.phase1 tr_*.json` | 4 件とも `choices` は zh/en のみ → jp 書込 0。脚本が無条件に書き戻すが **round-trip が byte 同一**であることを確認 (sidecar も同様) ✅ |
| **`choices_jp_clean` の不在** | 2019r01a sidecar **100 問中 0 問**が保持。`choices` の下は zh / en のみ。`apps/web/src/lib/quiz/quizModel.ts` の `orderedChoices()` は `q.choices_jp[letter]` を直読し、選択肢に clean 上書き経路は無い → **§7 の「腐敗は学習者に見えていた」は正** ✅ |
| explanations | 変更は **`q016` / `q097` の 2 件のみ**、両者とも **key_guard 以外は完全不変** (`correct` / `points` / `distractors` / `derived_answer` / `matches_key`) ✅ |
| **D-143** | final note は**純粋後置** (`final.startsWith(round1.note_jp)` = **true** ×2)、`round1.note_jp` == **HEAD の final note と逐字一致**、round1 への MARK 混入 **0**、ファイル内 MARK 出現 **2** ✅。HEAD には round1 が無く、本 unit で新規 publish されたのは D-143 の設計どおり |
| NOTE_SUB 不要の判断 | `q036` / `q041` の既存 final note を実読。**肢の区切りに関する現在形の主張は無い** (それぞれ定義照合と白紙導出のみ) → 陳腐化なし ✅ |
| 追記 2 件 / 非追記 2 件の方針 | `q016` = 正解肢命中 (波 2 `2016h28h-q089` precedent) / `q097` = 語義是正 → 追記。`q036` / `q041` = 誤答肢の記号のみ → 非追記。**波 2 / 波 3 / U3a / U3b と同一規則で一貫、同意** ✅ |
| 旧文字列の残存 | `data/` 全走査で、出荷経路 (`questions` / `question_bank` / `by_year` / sidecar / `.phase1`) に旧文字列 **0**。残るのは LLM 入力 (`.phase1/input_*` / `.phase2/input_*`)、fidparts の源 transcript、`question_bank.json.pre-*` 歴史バックアップ、および新 note が引用する 1 箇所のみ。**`quiz-phase2-merge.mjs` は `generate_result` から `key_guard` しか読まず、`build-quiz-corpus.mjs` は bank + unit_index しか読まない** → **再導入経路なし** ✅ |

### 14g. ゲート再実行 (すべて reviewer が自分で実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE **0 件 / 0 exam** / (A)(B) とも GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ **0 error** (exit 0) |
| `pnpm -C apps/web exec vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** |
| `node --check scripts/quiz-fidfix-S124-u4.mjs` | ✅ |
| `--dry-run` × 2 | ✅ **applied 0 / skipped 14** (完全冪等)。14 = 4 差分 × raw 3 層 + final note 2 = §7 の内訳と一致 |
| **再生成の冪等性** | ✅ `build-quiz-corpus.mjs` (2900 / 29 exam / with_fig **511**) → `quiz-phase2-merge.mjs 2019r01a` (explained 100 / missing 0 / **STEM-CORRUPTION 0** / SUSPECT 2 = `q019`,`q064`) を**自分で再実行**し、`questions.json` / `explanations/2019r01a.json` / `question_bank.json` / `by_year/2019r01a.json` の **md5 4 本とも前後で不変**、`git status` も不変 |
| 事後 machdiff (manifest 自前再生成) | ✅ `same=260 / AGENT_MISSED=0 / VERDICT_CONFLICT=0 / coverage 52/52` |

### 14h. 脚本コードレビュー — 指摘なし

- **`sub()` は S123 版と逐字同一** (`diff` で確認)。適用ループ本体 (`// ── 適用 ──` 〜 `console.log(log…)`) も **S123 と逐字同一** → §7 の「Rule D PASS 済のものを流用」は正。
- 肯定確認 `if (to && !next.includes(to)) throw` は健在。assert-once (`n > 1` で abort) も健在。
- 冪等の成立経路は「`to.includes(from)` ガード」ではなく **`n === 0` 経路**である (本 unit の from/to はいずれも `to ⊅ from`)。dry-run の `skipped 14` はこの経路が全件で立っている証拠で、動作は正しい。
- **stem 分岐 / zh・en 分岐は FIX に該当エントリが無いため未実行**。`FIX` は 4 件とも `jp` の非 stem field のみ = §7 の記述どおり。削らずに残した判断にも同意 (層規則の同一性が保てる)。
- 書込順 (`.phase1` を id ループ内、raw/sidecar をループ後、`generate_result` を最後) は本 unit で問題なし。

### 14i. 指摘 (**MAJOR 0 = データ・脚本の修正は不要。すべて記述精度と backlog の事実関係**)

| # | 内容 | 推奨処置 |
|---|---|---|
| **MINOR-1** | **§11 の「⑨ 新規 (優先度高)」は新規ではない。** `docs/discussion/2026-09-07-session-118.md:223` の方針 (5) が既に「⑤-4 の 16 exam 外の命中 (2009〜2015h27h の **13 exam**) は掃引外 → **別途実読 lane に登録**」と決めており、同 log:168 と `evidence/quiz_choice_defect_scan_S118.md:122` は「R8b (40 件) は**読点候補として実読に回す**」として `2020r02o-q045`「物理的 人的」/ `2022r04-q022`「調達 開発」/ `2024r06-q005`「学術機関 他の企業」の**同じ 3 id を名指しで登記済**。fixer の真の新規貢献は (a) 決定的走査の正規表現化と (b) `2023r05-q032` 双子問の発見の 2 点 | 「⑨ 新規」→「S118 §223(5) / §168 の再確認 + 走査の決定的化」に格下げし、既存登記への参照を張る |
| **MINOR-2** | **`2024r06-q005` は excluded。** `full52_population_S118.json` の 2024r06 excluded に `{"id":"2024r06-q005","reason":"pilot_B_sample_double_pass"}` が実在する。§11 の表の「母集団内・**excluded ではない** → 将来 unit で被覆」は**両方とも誤り**で、将来の ⑤-2 unit では**被覆されない**。同じ §11 の「4 件は将来 unit で自然に被覆されるので**追加 lane は不要**」という結論も、この 1 件については成立しない (R8b lane が要る)。※ 残る 5 id (`2010h22h-q023` / `2013h25a-q043` / `2020r02o-q045` / `2022r04-q022` / `2023r05-q032`) は、`evidence/phase5/stage_06_quiz_fidelity/` の**全 fidelity 結果 JSON から `verdict` 付き id 集合 875 件**を作って突合した結果、**いずれも未監査**であることを確認済 (fixer の撤回後の結論を支持)。`2010h22h-q023` は `trsweep_S114_2010h22h.json` に現れるが、これは翻訳掃引で fidelity 監査ではない | §11 の表を訂正し、`2024r06-q005` を R8b lane 側に振り替える |
| **MINOR-3** | **§3 の「読点脱落は machdiff では原理的に検出できない」は誤り。** `normStr` は空白を「読点に統一」するのではなく**削除**するため、脱落した読点は正規化後も**欠落として残る**。実測 (patch を外した素の比較): `q016` @14 / `q036` @11 / `q041` @7 で **norm(修正前) ≠ norm(源)**。つまり agent が計上しなければ 3 件とも `AGENT_MISSED` として立ったはずで、machdiff の独自貢献 0 は**能力の限界ではなく agent が先に全件拾ったから**。§11 の「machdiff の位置づけ」の議論もこの前提の上に立っている | §3 と §11 の当該記述を訂正 (結論「本 unit で machdiff の独自貢献 0」自体は不変) |
| **MINOR-4** | **§4d(2) の bitmap 距離が再現しない。** 同手順 (tight bbox → 64×64 → grey<170) の自前実装で 同一字基準線 **10.1%** / 対象 vs `減`(q074) **14.8%** / vs `減`(q086) **17.6%** / 無関係 46.9%・53.6%。無関係字の水準は再現するが、**比は基準線の 1.5〜1.7 倍**で「ちょうど 2 倍」にはならない。tight bbox の 1px 差に敏感な指標であり、**単独では字種を決められない** | §4d の (2) を「補強」と位置づけ直し、決め手は (1) の 30 倍直読 (閉じた口の有無という位相差) と (3) の下流裏取りである旨を明記。§11 の「標準手順として運用メモに追記」も、閾値ではなく**位相 (囲まれた穴) を併記**する形に |
| NIT-1 | §6 / §7 の「translations 追跡下 **14 exam**」は実測 **29 exam** (`git ls-files data/ip/quiz/translations \| wc -l` = 29、HEAD も 29)。変更 0 という結論は**強くなる方向** | 数値訂正 |
| NIT-2 | §11 の真の読点脱落候補は 7 field ではなく **8 field**。`2013h25a-q043.**イ**` (「業務要件の定義␣ソフトウェア要件定義␣システム要件定義」= **同一肢に 2 箇所**) が漏れている。問数 6 は一致。なお当方の走査は 27 field / 16 問 / 29 箇所で、fixer の 4 分類 (表型 9 / 図 3 / 助詞前 4 / 真候補 7) に入らない **「OCR 行末ごみ」型が 4 field** 出る (`2009h21a-q018.イ`「を␣・行う。」/ `.エ`「ここる␣ーー」/ `2022r04-q014.エ`「成立する。ー␣以m」/ `2026r08-q041.ア`「もつ・␣たせない」) | 候補表に `q043.イ` を追加。分類に「OCR 行末ごみ」を 1 行足すと母数 27 が説明しきれる |
| NIT-3 | §10 の N5 一覧が本 unit 分を取りこぼし。`q056` raw stem 「次の作業**ad** のうち」「全て**閥**げた」(源・clean はいずれも `a〜d` / `挙げた`)、`q061` raw stem 「適切**か**もの」「挙げ**け**た」も**字が変わる型**で、§11 の「N5 別ランク台帳」の対象。表示層 (`stem_jp_clean`) は 2 問とも正で学習者不可視 | §10 の N5 行に 2 件追記 (是正は不要) |
| NIT-4 | §7 の「解説は肢を逐字引用していない (機械確認済)」は `q016` では実質不正確。`correct.jp` に 「ベンダ企業から情報収集を行い**、**システムの技術的な課題や実現性を把握する」 とほぼ逐字の引用があり、区切りが `、` で choices の ASCII `, ` と**字種が割れる**。是正で語の一致は改善したが、S123 §11 の ⑨「解説の肢引用と choices の乖離」の**新実例**にあたる | §7 の文言を「byte 逐字ではないが引用あり・区切り字種が割れる」に訂正し、⑨ に実例として登記 |
  **S124 Rule D NIT-4 訂正**: `q016` の `correct.jp` は「ベンダ企業から情報収集を行い、システムの…」とほぼ逐字の引用を持ち、区切りが「、」で choices の ASCII「, 」と字種が割れる (byte 逐字ではないが引用あり)。S123 §11 ⑨「解説の肢引用と choices の乖離」の新実例として登記。
| NIT-5 | §1 の「`--dry-run` 既定なし」と脚本ヘッダ / §12 の「`--apply` 前の dry-run」で用語が揺れている。実装に `--apply` は無く、既定が適用・`--dry-run` が読取専用 | 文言統一 |

### 14j. 再現コマンド

```
# machdiff (事前 / 事後とも同値)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u4_fidelity_input_2019r01a.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u4_2019r01a_sn.json
#   → same=260 | AGENT_MISSED=0 | VERDICT_CONFLICT=0 | coverage 52/52

# 事後 manifest 再生成 → machdiff (label は使い捨て、実行後に削除)
node scripts/quiz-fidelity-prep-any.mjs 2019r01a u4rev "<52 qnums>" --precrop
#   → head=150 (votes 150=35p/140=19p/190=1p) / crop 51/52 / page-16 のみ skip
#   → precrop 集合 md5 93ad14019576ac611f8e1e4eea3f66a3 (再生成前後で同一)

# ゲート
node scripts/quiz-keys-crosscheck.mjs
node scripts/quiz-pagefix-derive-groups.mjs --assert-clean
node scripts/quiz-chumon-groups-build.mjs --check
pnpm -C apps/web exec tsc --noEmit
pnpm -C apps/web exec vitest run
node scripts/quiz-fidfix-S124-u4.mjs --dry-run      # applied 0, skipped 14

# 再生成の冪等性 (md5 4 本が前後不変)
node scripts/build-quiz-corpus.mjs && node scripts/quiz-phase2-merge.mjs 2019r01a

# 読点脱落型の corpus 横断走査 (reviewer 版の正規表現)
#   /([぀-ゟ゠-ヿ一-鿿々〆ー])( )([぀-ゟ゠-ヿ一-鿿々〆ー])/g を choices_jp 全 2900 問に適用
#   → 27 field / 16 問 / 29 箇所、2019r01a 残 0
```
