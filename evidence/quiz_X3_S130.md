# X track X3 — 2019r01a / 2020r02o 母数外 88 題の集計と是正 (S130、L3 data lane)

D-150 §3 の X track (B 母数外のうち ⑤-2 実施 exam 内の excluded) **X3** = 2019r01a 48 / 2020r02o 40 = **88 題**。準備は `evidence/quiz_X3_prep_S130.md`。**Sonnet 5 単 pass**。手順の雛形 = B13 (`evidence/quiz_B13_2009h21a_S129.md`) / S122 log §1〜§7。

**状態: PHASE 2 (apply・再生成・事後 machdiff・全ゲート) 完了** (記録は §12。PHASE 2 の残存語走査で 2020r02o-q094「①~③」を追加 = §12(b)、§2 は追加後の確定値。§7 / §8 は PHASE 1 の実数)。PHASE 1 時点の記述:書いたのは是正器 `scripts/quiz-fidfix-S130-x3.mjs` と本書だけ。`data/ip/**`・bank・既存 evidence は未変更。dry-run 基準は scratchpad (`/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/38b9b286-d572-4355-b63d-7392c68f7a4f/scratchpad/x3f/x3_fidfix_dry_phase1.txt`)。git 操作なし。

---

## 1. 入力と実行

- run: `wf_dcadc3ca-7da` (label `x3`、pass `sn`、Sonnet 5)、88/88 完走、4,953,994 token
- マニフェスト: `data/ip/quiz/.phase2/x3_fidelity_input_multi.json` (precrop 82/88、next / prev 88/88)
- 結果: `evidence/phase5/stage_06_quiz_fidelity/x3_fidelity_multi_sn.json`
- 判定: **CLEAN 83 / DISCREPANT 5 / UNREADABLE 0**、差分 10 {semantic 2, cosmetic 8}、正解肢上 0 (agent 申告)

## 2. 率 (確定)

| exam | n | agent DISCREPANT (採用あり) | +machdiff | +fixer 走査 / 名指し | **計上 = 是正** | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|
| 2019r01a | 48 | 3 (q070 q082 q099、3 題とも引用符のみ採用) | +1 (`q017` イ 読点脱落) | +2 (`q058` 名指し、`q076` は CLEAN 抽検で発見) | **6** | 0 | 0 |
| 2020r02o | 40 | 2 (q057 q071) | 0 | +6 (`q018` `q021` `q070` `q079` `q083` `q094`) | **8** | 0 | 0 |
| **計** | **88** | **5** | **+1** | **+8** | **14 (15.9%)** | **0** (zh / en のみ `2019r01a-q099 エ`) | **0** |

- **U9 定義の計上**: agent 採用 5 + machdiff 実残差 1 = **6 題 (6.8%)**。
- **論理差分** (題 × field、jp): **15** = semantic **0** / cosmetic **15** / answer_affecting **0**
  - 2019r01a (6): q017 イ (読点脱落) / q058 stem (適 切) / q070 stem (“EGE” “FAX”) / q076 stem (D-162) / q082 stem (“020”) / q099 stem (“?” “*” “データ”)
  - 2020r02o (9): q018 エ (「,」混在) / q021 stem (戦 略) / q057 stem (“社員”) / q070 ア ウ (「,」混在・データ を) / q071 stem (“式” + 、×3、D-170) / q079 stem (①～④) / q083 stem (投 影) / q094 stem (①～③、PHASE 2 追加)
- **D-170 で外した「、」→「，」(⑨)**: 「、」だけで一貫した field = 2019r01a-q005 stem (1) / q022 ア〜エ (3・1・2・1) / q035 stem (2) / q058 ア〜エ (各 1)、2020r02o-q033 stem (9) / q037 stem (6) / q048 イ (1) / q095 stem (3)。源はいずれも「，」(crop で確認、件数も)。PHASE 1 草稿ではこれらを計上していた (計上 20 / 論理差分 28)。
- agent の semantic 2 (q082 図の言語化の括弧) は**不採用** (§4c、§9 判断 1)。
- zh / en のみの是正: 2019r01a-q099 選択肢 ア〜エ (zh 4 / en 4、エ = 正解肢) と en 題幹、q076 zh / en 題幹 (D-162)、2020r02o-q071 en 題幹 (D-156)。
- **`correct_answer` 変更 0**、key 誤りの疑い 0 (§6 NOTE と prep §5.2 の 28 題再導出)。

## 3. machdiff — same 424 / AGENT_MISSED 16 / REPORTED 0 / TRANSCRIPT_PREFIX 0 / QUOTE_ASCII 0 / VERDICT_CONFLICT 0 (exit 0)

全残差を裁定:
- **実残差 → 採用**: `2019r01a-q017 イ`「導入することで既存商品」— 源 crop は「導入することで，既存商品」(行末の「，」)。agent は CLEAN。field の字種「, 」で補う。
- `2019r01a-q065` / `2020r02o-q041` / `2020r02o-q081` ア〜エ (12 件): a / b 組合せ選択肢の表示形式「a: … / b: …」の区切り「/」が a 側に付いて見えるだけ (値は源の表と一致、データで確認)。既知型 FP。
- `2019r01a-q034` stem row 1 / `2020r02o-q033` stem row 1: md 表に補った見出し行 (「項目 | 金額」/ 空見出し) で行がずれただけ。値は源と一致 (q033 は crop で全セル確認)。B5 prep 注記の A4 体裁差。
- `2019r01a-q082` stem @68: 図の言語化の code block (```) の差。図は添付あり (`quiz-figures/2019r01a-q082.webp`)、描画補助。
- TRANSCRIPT_PREFIX 0 → allowlist 追加は不要。説明できない残差 0。

## 4. 裁定 (fixer が源を原寸で独立に実読)

実読した源: crop 2019r01a-q005 q017 q022 q035 q058 q070 q076 q099、頁 2019r01a p20 (q047) p35 (q082)、crop 2020r02o-q018 q021 q033 q037 q048 q057 q079 q083 q092 q095、頁 2020r02o p32 (q070 q071)。CLEAN 抽検 10 題 (§4d)。

### 4a. 題幹

| id (p) | 層 | 源 | dataset | 判定 |
|---|---|---|---|---|
| 2019r01a-q070 (p30) | clean | “EGE” / 表見出し “FAX” ×2 | 「」 | cosmetic (D-155)。zh「」⑨-c、en は既に “”。解説 jp の暗号文字列「EGE」「DEB」「CGG」「GKK」「IKI」も “” (B13 q062 tmb / tjh と同型) |
| 2019r01a-q082 (p35) | clean | “020” | 「020」×3 (題幹 1 + 言語化の括弧 2) | cosmetic。field 内で揃えて 3 箇所。解説 jp「020」×3 も。括弧そのものは不変 (§4c) |
| 2019r01a-q099 (p43) | clean | “?” “*” “データ”×2 | 「」 | cosmetic。en 題幹の「?」「*」(D-156) と “データ”(data) の前後空白も |
| 2020r02o-q057 (p26) | clean | “社員” | 「社員」 | cosmetic |
| 2020r02o-q071 (p32) | clean | 式“条件付個数 (B2:D2,＞15000)”、「，」×3 | 「」/「、」/ `>` | cosmetic。field を引用符で書き換えるので「、」も「，」に (D-170)。`>` は ASCII のまま (§9 判断 2)。en「CountIf(…)」→ “” (D-156)、解説 jp / en の式の引用も |
| 2019r01a-q076 (p33) | raw / clean / zh / en | “B$1＊合計(B$3：B3)／個数(B$3：B3)” | 同 | cosmetic (**D-162** で * /、範囲の「：」は原典どおり)。解説 jp / zh / en の式も (B13 q093 と同型)。agent CLEAN = fixer 走査 |
| 2019r01a-q058 / 2020r02o-q021 / q083 | raw (clean なし) | 適切 / 戦略的 / 投影し | 「適 切」「戦 略」「投 影」 | cosmetic (行分割残骸、prep P1) |
| 2019r01a-q005 q035、2020r02o-q033 q037 q095 | clean (q035 q095 は raw = clean) | 「，」 | 「、」 (1 / 2 / 9 / 6 / 3) | **不変 (D-170、⑨)**: field 内が「、」で一貫し、他に書き換えない。q033 は表セル 2 を含む |
| 2020r02o-q079 (p36) | clean | ①～④ | ①~④ | cosmetic (範囲記号は原典どおり、D-155)。raw は OCR 崩れの別文で skip |

### 4b. 選択肢 (raw = 出荷層)

| id (p) | 源 | dataset | 判定 |
|---|---|---|---|
| 2019r01a-q017 イ (crop) | 導入することで，既存商品 | 読点なし | cosmetic (machdiff 実残差) |
| 2019r01a-q022 ア〜エ / q058 ア〜エ / 2020r02o-q048 イ (crop) | 「，」 | 「、」 | **不変 (D-170、⑨)**: field 内が「、」で一貫 |
| 2020r02o-q070 ア / ウ (p32) | 「，」 | ア「なく,入力」/ ウ「データ を順次作成し,直前」「付け,矛盾」 | cosmetic (語中空白 + field 内で「, 」と「,」が混在 → 「, 」に揃える、D-170 の混在条件) |
| 2020r02o-q018 エ (crop) | 製品，システム | 「製品,システム, サービス」 | cosmetic (field 内混在) |
| 2019r01a-q099 zh / en ア〜エ | ?データ* 等 | zh / en はア / ウだけ訳 (数据 / data) + [表] / [table]、イ / エ は jp のまま | 訳層の表記揺れ。解説 zh / en (?数据* / ?data*) に揃え、接頭辞を外す (他題 q065 等の zh / en と同形)。**エ = 正解肢** (§9 判断 3) |

### 4c. 不採用・不変

- **2019r01a-q082 図の言語化の括弧** (agent semantic 2):「各桁に0～9のいずれかを指定（「020」に続く先頭の□を除く，それ以降の各□）」「1～3及び5～9のいずれかを指定（「020」に続く先頭の□）」。源 p35 の図では、上の注記は 2 番目以降の□を束ねる波括弧、下の注記は先頭の□からの引出線を指す。括弧はこの範囲を言葉にしたもので図と一致する。箇条書きの順序が図の上下 (= 桁の逆順) なので、括弧が無いと各注記がどの□か分からない。桁数・計算は書いておらず D-168 の漏洩に当たらない (本問は組合せ数の計算を問い、図の読解自体は問わない)。図は添付済み。→ **不変** (B13 q044 箱の言語化と同じ描画補助)。引用符のみ “020” に揃える。
- 2019r01a-q002 / q026 の表注記の空白 (「単位 億円」「注記 網掛け」)、q047 選択肢の「／」区切り、2020r02o-q055 の AI 言語化中の「、」・「／」、2019r01a-q093 の無空白「,」と「［ a ］」(field 内で一貫) → ⑨。2020r02o-q034 選択肢の言葉の式の全角 －＋ は §9 判断 5。
- A1 backlog 未処置 high 90 件 / 17 題は、採用分 (P1 の 4 題) 以外は prep §5.4 の FP 判定どおり。

### 4d. CLEAN 無作為抽検

母集団 = CLEAN 83 − 本 unit で読んだ / データで裁定した CLEAN 17 = 66。seed 128 LCG (B8 §4f と同式、`c[s mod 66]`) で 10 問: **2019r01a-q049 / 2020r02o-q013 / 2019r01a-q060 / 2020r02o-q087 / 2019r01a-q047 (p20、crop なし) / 2019r01a-q055 / 2020r02o-q046 / 2019r01a-q001 / 2019r01a-q027 / 2019r01a-q076** → 語義は全問源と一致。語義の見落とし **0 / 10**。ただし q076 は式の ＊ ／ (D-162) を是正対象に加えた (cosmetic、§4a)。

## 5. 中問

なし (prep §2、chumon 登録 0)。

## 6. D-143 NOTE_APPEND (final のみ、4 題、MARK = `fidfix-S130-x3`)

2019r01a-q070 (note が「EGE」と「逐字一致」に言及) / q076 (note が ＊／ の式を引用) / q082 (note が「020」に言及、括弧不変の理由を記録) / q099 (エ 正解肢 zh / en、note が「?」「*」と「choices_jp と図の表は一致」に言及)。再導出: q070 イ (EGE → DEB) / q076 イ (6,000) / q082 ウ (13) / q099 エ。
追記しない: 2019r01a-q017 q058 と 2020r02o の全題 (2020r02o の key_guard note は空。字種・空白のみ)。

## 7. 層と局所性 (PHASE 1 dry-run 実数、HEAD `170e767` + 作業木に T1 lane の未 commit 変更 [2019r01a / 2020r02o に触れない])

```
node scripts/quiz-fidfix-S130-x3.mjs
(dry-run) quiz-fidfix-S130-x3: applied 102, skipped 104   (⚠ 行 0)
files to write (17): .phase1/tr_{2019r01a-q076,q099, 2020r02o-q079}.json, questions.json, question_bank.json,
  by_year/{2019r01a,2020r02o}.json, translations/{2019r01a,2020r02o}.json,
  .phase2/expl_jp_{2019r01a-q070,q082,q076, 2020r02o-q071}.json, expl_tr_{2020r02o-q071, 2019r01a-q076,q099}.json, generate_result_2019r01a.json
```

| 層 | 操作数 |
|---|---|
| raw (questions / question_bank / by_year) | 27 (9 × 3) |
| sidecar stem_jp_clean | 10 |
| sidecar zh / en | 14 |
| .phase1 tr_ | 11 |
| 解説 .phase2 | 36 |
| key_guard final note | 4 |
| **計** | **applied 102 / skipped 104 / files 17 / ⚠ 0** |

- 「、」の全置換は表示層に件数 assert。raw / .phase1 は件数が同じときだけ当て、別文は skip を記録 (2020r02o-q071 の raw 3 層・.phase1 = 「、」×2 の別文)。
- scratch 複製木で `--apply` → 再実行 **applied 0 / skipped 206 / files 0** (冪等)。`questions.json` の変化 7 題 (2019r01a q017 q058 q076、2020r02o q018 q021 q070 q083。他 6 題は sidecar のみ)、**correct_answer 変化 0**。
- 適用後の残存語走査 (scratch、表示 jp 88 題): CJK 間空白 / 式の ＊ / 源が “” の語の「」/ en「」→ 残るのは q002 q026 の表注記空白、q047 q055 の「／」区切り、D-170 で外した「、」一貫 field (§2) だけ (⑨)。
- .phase1 の無言 skip: 2019r01a-q070 q082 q099 の stem_jp_clean / 2020r02o-q057 q071 は `tr_` が別文。sidecar が出荷層の正 (B8 §7 / B13 と同じ扱い)。2019r01a-q099 の `tr_` 選択肢は 4 肢とも jp のまま (接頭辞なし) なので、ア / ウはその形の from も是正器に足し、適用後は sidecar と `tr_` の 4 肢 × zh / en が一致することを scratch で確認した。

**PHASE 2 (lock 取得時)**: 再 dry-run → ✓ 行を基準と diff → `--apply` → `build-quiz-corpus` → `quiz-phase2-merge 2019r01a` / `2020r02o` → 事後 machdiff → 残存語・波及ゼロ・全ゲート。

## 8. ゲート (PHASE 1)

| ゲート | 結果 |
|---|---|
| `node --check scripts/quiz-fidfix-S130-x3.mjs` | ✅ |
| fidfix dry-run | ✅ applied 102 / skipped 104 / files 17 / ⚠ 0 |
| scratch apply → 再実行 | ✅ applied 0 (冪等) |
| `correct_answer` 差分 | ✅ 0 |
| crosscheck / assert-clean / chumon --check / tsc / vitest / build | PHASE 2 |

## 9. lead への判断項目 (fixer 推奨つき)

1. **2019r01a-q082 図の言語化の括弧** (agent semantic): 推奨 = **不変** (§4c)。代案 = 括弧を外す (図は添付あり、ただし箇条書きの順が桁の逆で読み手が迷う)。
2. **2020r02o-q071 の比較演算子** 源 ＞ / 表示 `>`: 推奨 = **ASCII `>` のまま** (D-162 の「式中の演算子は ASCII」を比較演算子にも及ぼす。corpus の式中比較演算子は ASCII 1 / 全角 ≧ 2 で多数派なし、検索・コピー性を優先)。代案 = 原典どおり ＞ (解説 jp / zh / en の `>15000` も要追随)。
3. **2019r01a-q099 zh / en 選択肢の統一の向き**: 推奨 = **数据 / data** (解説 zh / en の全記述と一致、変更 8 項で済む)。代案 = データ のまま: 源の文字列そのもので、`.phase1` の訳もこれ、添付図 `quiz-figures/2019r01a-q099.webp` (表、データ表記) とも一致し、zh / en 題幹も「データ」(数据) と原語で引いている。ただし解説の ?数据* / ?data* 等 20 箇所以上を書き換える要あり。
4. **「、」→「，」9 題** (B8 規則を X3 に適用): 推奨 = 採用 (prep §5.5 の 16 field のうち AI 言語化の q055 を除く全件)。
5. **2020r02o-q034 選択肢の言葉の式** (「営業利益を求める計算式はどれか」、ア〜エ「（売上総利益）－（販売費及び一般管理費）」等、jp / zh は全角 －＋、en は − +): D-162 の「表計算式・擬似言語中の算術演算子」に入るか (括弧書きの言葉の計算式も含むか) の裁定を求める。fixer は本 unit では不変 (源どおり全角)。
6. ⑨ 登記候補: en 解説の「」(corpus 12 / 2900 題、D-156 は解説に未適用 — 本 unit は q071 q099 のみ是正) / q099 jp・zh 解説の「?」等の引用 / 2019r01a-q093 の無空白「,」と「［ a ］」。

## 10. Rule B / Rule D

- Rule B: run 1 回完走。dry-run の assert 失敗 2 回 (q033 の「、」件数を 6 と数え誤り → 源 crop で 9 を確認して修正 / q071 の .phase1 が別文で件数不一致 → raw と同じ「件数一致時のみ」扱いに) は書込み前の是正器内の修正で、データ attempt ではない (`failures/` 追加なし)。
- Rule D: Writer = `x3-fixer` (executor opus)。Reviewer は別 subagent_type (opus) が apply 後に。重点: q082 括弧不変の裁定、q099 zh / en 統一 (エ = 正解肢、sidecar と .phase1 の 4 肢一致)、q076 D-162 と解説追随、q071「、」×3 (D-170)、D-170 で外した 8 題が無変更であること、q017 machdiff 実残差、CLEAN 標本の別抽検。

## 11. 主 context 判断 (D-161、S130) の反映

1. q082 括弧は不変、引用符のみ “020” — 採用 (是正器どおり)。
2. q071 の ＞ は ASCII `>` のまま — 採用 (D-162 範囲注記: 式中で ASCII に同字がある記号は ASCII 側、≧ のように同字が無い記号は源字形 [X2 J-1])。
3. q099 zh / en は 数据 / data で解説に揃える (8 箇所) — 採用。
4. 「、」→「，」は **D-170** で再判定: field 内で字形が混在するか、その field を既に書き換える場合だけ当てる。→ 2020r02o-q071 のみ残し (引用符で書き換える field)、他 8 題 (2019r01a-q005 q022 q035 q058 選択肢、2020r02o-q033 q037 q048 q095) は是正器から外して ⑨ (§2)。これに伴い 2019r01a-q022 / q058 の NOTE を外した (正解肢上 jp 0)。2020r02o-q070 ア ウ・q018 エの「,」→「, 」は field 内混在の条件に当たるので残す。
5. 2020r02o-q034 の言葉の式の全角 －＋ は源どおり不変 — 採用 (是正器に入れていない)。
6. ⑨ 登記: §9 判断 6 + D-170 で外した 8 題。

## 12. PHASE 2 (D-152 lock 付与後、HEAD `4630c9a` = X2 commit 済)

**(a) rebase**: HEAD で再 dry-run → applied 102 / skipped 104 / files 17。基準 `x3_fidfix_dry_phase1.txt` (scratchpad) と `diff` で**全文一致** → apply 前に bank / questions / by_year ×2 / translations ×2 / explanations ×2 / generate_result ×2 / 対象の .phase1・.phase2 expl を scratchpad `x3f/backup/` に退避 → `--apply` (applied 102)。
**(b) 残存語走査で 1 題追加**: 適用後の表示 jp 88 題を走査し (CJK 間空白・式の ＊ ／・源が “” の語の「」・「,」無空白・ASCII `~`)、`2020r02o-q094` clean の「①~③」を検出。源 crop は「①～③」(q079 と同型、D-155 の範囲記号) → 是正器に 1 項追加 (raw は OCR 崩れの別文で skip) → `--apply` (applied 2: sidecar + .phase1)。新規 HEAD からの適用なら applied 104。
**(c) 再生成**: `build-quiz-corpus` (2900 問) → `quiz-phase2-merge 2019r01a` (SUSPECT q019 q064 / STEM 0) / `2020r02o` (SUSPECT q015 q024 q025 / STEM 0)。suspect_count は HEAD と同じ (2 / 3) で既存。
**(d) allowlist**: TRANSCRIPT_PREFIX 0 → 追加なし (machdiff 脚本は未変更)。
**(e) 事後 machdiff** (是正後 manifest `x3post` を precrop なしで再構成し、確認後に削除):
```
machdiff: fields same=425 | AGENT_MISSED=15 | VERDICT_CONFLICT=0 | REPORTED=0 | TRANSCRIPT_PREFIX=0 | QUOTE_ASCII=0   (exit 0)
```
- AGENT_MISSED 16 → **15**: q017 イ (実残差) が消えた。残りは §3 の裁定済み既知型だけ (a / b 区切り 12、表見出し行 2、q082 code block 1)。**新規残差 0**。
**(f) 残存語** (表示 jp 88 題、走査は (b) と同じ): 残るのは q002 / q026 の表注記空白 (⑨) だけ。zh / en の ＊ 0、en 題幹の「」0。q099 の sidecar と .phase1 は 4 肢 × zh / en が一致 (数据 / data)。
**(g) 波及ゼロ** (退避との比較)

| 検査 | 結果 |
|---|---|
| `questions.json` | **7 題** = 2019r01a q017 q058 q076、2020r02o q018 q021 q070 q083 (q070 q082 q099 / q057 q071 q079 q094 は sidecar のみ) |
| `question_bank.json` | 同じ 7 題、他 exam 変化 **0** |
| by_year | 2019r01a 3 題 / 2020r02o 4 題 (questions と同じ) |
| translations | 2019r01a 4 題 (q070 q076 q082 q099) / 2020r02o 4 題 (q057 q071 q079 q094) |
| `correct_answer` | `git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| generate_result | 2019r01a 変化 4 = note の純粋後置 4/4 (MARK `fidfix-S130-x3`)、2020r02o 0 |
| explanations (HEAD 比) | 2019r01a q070 q076 q082 q099: note 純粋後置 4/4、round1 は q070 既存のまま / q076 q082 q099 新設 = HEAD の final note と一致 (D-143)、本文は §4 の解説追随のみ。2020r02o q071: correct の jp / en の式の引用のみ |
| tracked の変化 | `questions.json` / `translations/{2019r01a,2020r02o}.json` / `explanations/{2019r01a,2020r02o}.json` (+ 新規 是正器・本 evidence) |
| `answer_keys.json` (`data/ip/exams/`) | md5 `6802bb0bc13004da78ad3c4e5117d997`、mtime `1788586696` **前後同一** |

**(h) ゲート** (q094 追加後に全再実行)

| ゲート | 結果 |
|---|---|
| `node --check` 是正器 | ✅ |
| `quiz-keys-crosscheck` | ✅ questions=2900 exams=29、all invariants hold (A1–A7, B1–B7) |
| `quiz-pagefix-derive-groups --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `quiz-chumon-groups-build --check` | ✅ 生成結果と一致 (mqTech2 の「registry 無し」は既存の情報行) |
| machdiff vitest (`--root ../../scripts --globals quiz-fidelity-machdiff`) | ✅ 42/42 (フィルタなしだと node:test 形式の `lib/precrop-heading.test.mjs` が「No test suite」で落ちる。既存・本 unit と無関係) |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| eslint (apps/web) | ✅ 0 errors / 1 warning (`RetroGlossary.tsx:31` 未使用変数、既存) |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped |
| `next build` | ✅ Compiled successfully |
| 是正器再実行 | ✅ applied 0 / skipped 211 |
| 事後 machdiff | ✅ 新規残差 0 |
| e2e | 未実行 (X1 / X2 と同じ、文字列置換のみ) |

**(i) 最終の計上**: **計上 14 / 88 (15.9%) / U9 6 (6.8%) / 論理差分 jp 15 = semantic 0 + cosmetic 15 / 正解肢上 jp 0 (zh / en: 2019r01a-q099 エ) / answer_affecting 0 / correct_answer 変更 0**。NOTE_APPEND 4 (2019r01a q070 q076 q082 q099)。⑨ は §2 (D-170 で外した「、」一貫 8 題) と §9 判断 6。commit は主 context。Rule B: 失敗 attempt なし (`failures/` 追加なし)。Rule D: reviewer は別 subagent_type (opus) で。
