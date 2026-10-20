# X track X4 — 母数外 102 題の集計と是正 (S130、L3 data lane)

D-150 §3 の X track (⑤-2 母数 `full52_population_S118.json` の excluded 題の再核験) の **X4** (X track 最後) = 2022r04 25 / 2024r06 28 / 2025r07 20 / 2026r08 29 = **102 題** (中問 member 0)。準備は `evidence/quiz_X4_prep_S130.md`。**Sonnet 5 単 pass**。手順の雛形 = X2 (`evidence/quiz_X2_S130.md`) / B13 / S122 log §1〜§7。

**状態: PHASE 2 (apply・再生成・事後 machdiff・残存語・全ゲート) 完了** (記録は §11、commit は主 context、lock 保持中)。§1〜§10 は PHASE 1 の記録 (§2 / §7 / §8 は J-2 裁定後の数)。PHASE 1 時点の記述: 書いたのは是正器 `scripts/quiz-fidfix-S130-x4.mjs`、基準 `evidence/phase5/stage_06_quiz_fidelity/x4_fidfix_dry_phase1.txt`、本書。`data/**` は未変更 (冪等確認は scratchpad の複製木)。git 操作なし。

---

## 1. 入力と実行

- 結果: `evidence/phase5/stage_06_quiz_fidelity/x4_fidelity_multi_sn.json` — **CLEAN 93 / DISCREPANT 9 / UNREADABLE 0**、差分 14 {cosmetic 14}、正解肢上 1 (agent 申告: 2022r04-q065 ア)
- マニフェスト: `data/ip/quiz/.phase2/x4_fidelity_input_multi.json` (precrop 101/102、next/prev 102/102)

## 2. 率

| 母数 | agent DISCREPANT (採用あり) | +machdiff | +fixer / prep 名指し | **計上 = 是正** | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|
| 102 | 9 (**6 題採用**、2022r04-q090 / q097 / 2024r06-q008 は不変) | **+1** (`2026r08-q057` QUOTE_ASCII) | **+4** (`2022r04-q059` 表見出し、`2022r04-q080` `2024r06-q061` `2025r07-q002` 行分割残骸) | **11 (10.8%)** | **3** (`2022r04-q065 ア` `2026r08-q057 ウ` `2022r04-q059 エ`) | **0** |

- 計上 11 題: 2022r04-q059 q065 q080 q098 / 2024r06-q005 q030 q061 q093 / 2025r07-q002 q066 / 2026r08-q057。
- **U9 定義の計上**: agent 採用 6 + machdiff 実残差 1 = **7 題 (6.9%)**。
- **論理差分** (題 × field、jp): **20** = semantic **0** / cosmetic **20** / answer_affecting **0** (J-2 裁定前は 21)
  - 引用符 11: q065 stem + ア〜エ / q098 stem / q030 stem / q093 stem / q066 stem / q057 ア〜エ (うち q065 / q093 / q066 は同 field の「、」も)
  - 行分割残骸・読点 4: q002 stem / q080 stem / q061 イ / q005 ウ (読点脱落)
  - 表示書式 3: q059 イ〜エ (表見出し行、エ = **正解肢**。cosmetic 計上、§9 J-1)
  - 非出荷層 (計上外): bank / by_year `figure_description` 2024r06-q093「福葉小春」→「稲葉小春」(`data/ip/*` は gitignore 層 = `.gitignore:60`、§9 J-6)
- agent 差分 14 → 採用 11 (q065 ×5、q098、q005 ウ、q030、q093 ×2、q066) / 不変 3 (q090 図言語化、q097 図言語化、q008 表見出し行)。
- **D-170 で外した「、」→「，」** (field 全体が「、」、他に書き換えない。源は「，」→ ⑨ 全庫走査): 2022r04-q042 (×3) / q078 (×6、宣言「i, j, k」・注釈 /* …場合, j… */ はコード片で混在に数えない = J-2 裁定) / q090 (×7、図言語化部を含む) / q096 (×9、宣言「num, i」はコード片で混在に数えない) / 2024r06-q008 (×1) / q044 (×5) / q057 (×1) / q083 (×1) / 2025r07-q034 (×4) / q045 (×5) / q076 (×6) / 2026r08-q007 (×4) / q044 (×12) / q092 ア〜エ (各 ×1)。数字の千位区切り「,」は混在に数えない。
- **`correct_answer` 変更 0** (scratch 複製木の apply で questions.json の correct_answer 差 0)。key 誤りの疑い 0 (prep §5.2 の再導出 + §6)。

## 3. machdiff — same 482 / AGENT_MISSED 25 / REPORTED 3 / TRANSCRIPT_PREFIX 0 / QUOTE_ASCII 4 / VERDICT_CONFLICT 0

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/x4_fidelity_input_multi.json evidence/phase5/stage_06_quiz_fidelity/x4_fidelity_multi_sn.json
```

全残差を源で裁定:
- **実残差 → 採用**: `2026r08-q057 ア〜エ` QUOTE_ASCII — 表示 `"学生"表…` (raw = 出荷層)、源 p27 は “学生”表…。U11 Rule D NIT-2 の既知残差。ウ = **正解肢**。
- `2022r04-q079 stem` (AGENT_MISSED): 流れ図の言語化「繰返し（x ＝ y）」「（分岐）」「「＞」の場合」= 描画補助 → 不変 (prep §5.1 で p36 と照合済み、値・分岐記号は一致)。
- `2022r04-q090 stem` / `2022r04-q097 stem・ア〜エ`: 図言語化 (agent も DISCREPANT 報告) と a/b 組合せの一行化 (`a: …／b: …`) → 不変 (§4b、§9 J-4)。
- `2025r07-q030 / q037 ア〜エ`、`2026r08-q080 / q099 ア〜エ`: a/b 組合せ選択肢の「 / 」区切り vs transcript の「, 」= 表示規約 (X3 の 2019r01a-q065 / 2020r02o-q041 / q081 と同型) → layout FP。
- `2025r07-q071 stem`: transcript の `[a]` (源の枠) vs 表示の素の a。crop を実読、語・値は一致。空欄表記の統一は ⑨ (corpus 多数派は素の a)。
- `2026r08-q050 stem` 表の前提作業 A 行「―」vs transcript「－」: 源は「なし」を示すダッシュで字種の判別は不可。corpus の表セルのダッシュは ―1 / －2 / -2 / —1 / −5 と割れている → ⑨ (字形統一)。
- TRANSCRIPT_PREFIX 0 → **allowlist 追加は不要**。説明できない残差 0。
- **式の U+2212 走査** (指示どおり): 表示 102 題の全 field で − / - / － / ― を transcript と突合 → 差は 2026r08-q050 の表セルの 1 件 (上記) のみ。式中の演算子 (2022r04-q030 ア〜エ「－」、q078 ア〜ウ「−」、q079「－」、2026r08-q003「−15」) は表示 = transcript で、**残差 0**。

## 4. 裁定 (fixer が源を原寸で独立に実読)

実読した源 crop: 2022r04-q059 q065 q078 q080 q090 q097 q098、2024r06-q005 q030 q061 q093、2025r07-q002 q066 q071、2026r08-q009 q057 + CLEAN 抽検 10 題 (§4d)。散文の字種: 4 exam とも源は「，」と “”。

### 4a. 選択肢 (raw 3 層 = 出荷層)

| id (p) | 源 | 表示 | 判定 |
|---|---|---|---|
| 2022r04-q065 ア〜エ (p29) | “従業員番号” / “従業員番号”と“部門コード” / “従業員名” / “部門コード” | ASCII `"…"`、イは `" と "` (語間空白) | cosmetic。イは空白も除去。**ア = 正解肢**。zh は既に “”、en の ASCII " は ⑨-c |
| 2026r08-q057 ア〜エ (p27) | “学生”表の学生番号，“成績”表の学生番号 … | ASCII `"` | cosmetic (machdiff)。**ウ = 正解肢**。zh 既に “”、en ASCII ⑨-c |
| 2022r04-q059 イ〜エ (p27) | 1 枚の表 (見出し 平均値 / 中央値) | アだけ見出し行つき、イ〜エは `[表] \| イ \| 40 \| 20 \|` | 表示書式。現状の描画 (parseChoice) はイ〜エで「イ / 40 / 20」が見出し行になり列名が出ない。corpus 前例 (2019r01a-q060 / 2020r02o-q092 / q094) は 4 肢とも見出しつき → 補う。**エ = 正解肢**。zh / en は既に 4 肢とも見出しつき (§9 J-1) |
| 2024r06-q005 ウ (p3) | 国や学術機関，他の企業 | 「国や学術機関 他の企業」 | cosmetic (読点脱落)。field の字種「, 」で補う (X3 2019r01a-q017 イ と同型)。zh / en は読点あり |
| 2024r06-q061 イ (p27) | ハードディスクに (行跨ぎ) | 「ハードディスク に」 | cosmetic (行分割残骸) |
| 2026r08-q092 ア〜エ | 「，」 | 「、」 | **D-170 で除外** (⑨) |

### 4b. 題幹

| id (p) | 層 | 源 | 表示 | 判定 |
|---|---|---|---|---|
| 2022r04-q065 (p29) | clean | “従業員”表と“部門”表 / “従業員”表、「，」 | 「」×3・「、」×2 | cosmetic |
| 2022r04-q098 (p44) | clean | “従業員”表 | 「従業員」 | cosmetic。zh「」⑨-c、en 既に “” |
| 2024r06-q030 (p13) | raw | “我が社の収益性分析をしなさい” | 「」 | cosmetic。zh 既に “”、en ASCII ⑨-c |
| 2024r06-q093 (p42) | clean | “従業員” / ‘%葉_’ / “_” / “%”、「，」 | すべて「」、「、」×3 | cosmetic。一重 ‘’ は D-155 (題ごとに原典の字形、前例 2017h29h-q090 ‘%う…’)。zh「」⑨-c、en “%葉_” (二重) は ⑨-c |
| 2025r07-q066 (p31) | clean | “ログイン記録”表及び“部署”表、「，」 | 「」×2・「、」×3 | cosmetic。表 12 行は源どおり (raw は 11 行・4月18日 の別文で非出荷) |
| 2022r04-q078 (p35) | clean | 散文・注釈とも「，」 | 散文「、」×6 + 注釈「場合, j」 | **不変** (J-2 裁定: 注釈 /* … */ はコード扱い → 混在なし → D-170 除外 ⑨)。宣言「整数型: i, j, k」もコード片 |
| 2025r07-q002 (p2) | raw | ガイドライン (行跨ぎ) | 「ガ⏎イドライン」 | cosmetic (行分割残骸) |
| 2022r04-q080 (p36) | raw | 情報システムと連動 (行跨ぎ) | 「情報システム と連動」 | cosmetic (行分割残骸) |

- **不変 (描画補助・既知型)**:
  - `2022r04-q090` 木構造の箇条書き (agent cosmetic): 注記「中間ノード」「末端ノード」は題幹自身が定義する語、配置 (根の左 = 葉、右 = 節、節の下に葉 2) は源 p41 と一致。ディレクトリ / ファイルの対応は書いていない → D-163 / D-168 の漏洩に当たらない。
  - `2022r04-q097` IoT 構成の言語化 (agent cosmetic): 矢印の向き・通信機能部・サーバ文言は源 p44 の図から読める事実で、a / b の役割語 (センサ / アクチュエータ) を書いていない (§9 J-4)。言語化内の「水田の水位」の「」も不変 (B8 q015 ウ型)。
  - `2024r06-q008` 表見出し行「項目 / 金額」(agent cosmetic): S123 U3b q034 / X2 2019h31h-q013 と同型。
  - `2026r08-q057` 表の**下線 (主キー)**: X2 J-4 裁定 (jp に（主キー）を足さない、添付図あり、属性集合と題意から key が導ける) をそのまま適用 → 不変。
- **raw 層**: stem_jp_clean を持つ題は clean のみに当てる (raw は OCR 崩れの別文で非出荷)。.phase1 `tr_` は対象題に stem_jp_clean が無い (または別文) ため skip。

### 4c. 名指し / 走査

- prep §5.3 名指しの裁定: q002 / q080 / q061 イ / q005 ウ → 採用。引用符 6 題 (q065 / q057 / q098 / q030 / q093 / q066) → 採用。q059 → 採用 (J-1)。q057 下線 → 不変 (上記)。2026r08-q007 の stem は源どおり “” (「、」×4 は D-170 除外)。
- prep §5.4 P3 (FP) 判定は維持。2024r06-q093 `figure_description`「福葉小春」: web (`apps/web/src`) で `figure_description` を読むのは textbook の型定義のみ (`lib/textbook/types.ts`)、questions.json には載らず、`data/ip/textbook` に 2024r06-q093 の参照なし → 学習者・AI 経路なし。是正器は bank / by_year の非出荷層として 1 語直す (J-6)。
- **fixer 走査** (表示 jp と transcript の字種計数、全 102 題: 「、」「，」「, 」「」“” ASCII " ' ‘’ ~ ～ − － - ― ／ / ＊ 〔〕「。 」): 採用は §2 の +4 + agent 採用分。transcript の「，」/「, 」は agent の正規化で揺れるため、読点は源の crop で判定した。
  - ASCII「, 」/「,」(空白なし) は exam 単位の型 (⑨)。2026r08-q009 ア / ウ「a,b」・2022r04-q033 stem「,」×6 は field 内で混在しない → X2 (⑨) / X3 (混在 field のみ是正) のどちらの規則でも不変。
  - 2026r08-q009 の a / b / c が 1 行に並ぶ (源は 3 行): corpus 全体で同型 31 題 (2024r06-q030 のように源が 1 行のものを含む) → ⑨ (レイアウト)。
  - 単位の「／」(2024r06-q020「5百万円/年」、源「／」): corpus は ASCII 7 / 全角 10 で割れ、算術演算子ではない → ⑨。
  - 範囲の「〜」(U+301C) vs「～」(U+FF5E) (2022r04-q064「a〜d」・q072「①〜③」ほか X4 12 題): 源の字形は判別できず corpus は 〜 218 / ～ 75 → ⑨ (X2 で直したのは ASCII ~ のみ)。

### 4d. CLEAN 無作為抽検

母集団 = CLEAN 93 − 本 unit で源を読んだ / データで裁定した CLEAN 14 (2022r04-q059 q078 q079 q080、2024r06-q061、2025r07-q002 q030 q037 q071、2026r08-q009 q050 q057 q080 q099) = 79 (manifest 順)。seed 130 LCG (B8 §4f と同式、`c[s mod 79]`) で 10 題: **2022r04-q033 / 2022r04-q011 / 2025r07-q026 / 2022r04-q030 / 2024r06-q070 / 2024r06-q020 / 2025r07-q034 / 2025r07-q059 / 2024r06-q035 / 2024r06-q079** → crop を原寸で実読、**語義の見落とし 0 / 10**。字種の観察 (いずれも ⑨ の既知型): q033「,」空白なし、q020 単位「/」、q034「、」×4 (D-170 除外)。q011 / q026 は表のセル全数を照合し一致 (q026 取引③ の備考「6月30日 回収予定」は源で 2 行にまたがるセルを 1 行目に置いたもの、値は同じ)。

## 5. 中問

X4 の 4 exam に中問なし (prep §2)。

## 6. D-143 NOTE_APPEND

**final のみ、4 題**: 2022r04-q065 (ア 正解肢) / 2022r04-q059 (エ 正解肢) / 2026r08-q057 (ウ 正解肢) / 2025r07-q066 (note「stem_jp_clean と完全一致する」に言及)。再導出: q065 ア (条件① → 従業員番号は重複しない → 主キー) / q059 エ (平均 2,700÷9 = 300、中央値 = 5 番目の 40) / q057 ウ (成績表の学生番号・科目コードがそれぞれ学生表・科目表を参照) / q066 イ (失敗 003・001、09:00:00 以前の成功 003・002 → 3 部署)。追記しない: 字種・空白のみで note が空または是正対象に言及しない 7 題 (2025r07-q002 の note は「ガイドライン規格」を引くが表示の改行への言及ではない)。MARK = `fidfix-S130-x4`。q065 / q059 / q057 の既存 note は空 (追記で先頭になる)。

## 7. 層と局所性 (PHASE 1 dry-run 実数)

```
node scripts/quiz-fidfix-S130-x4.mjs
(dry-run) quiz-fidfix-S130-x4: applied 66, skipped 0   (⚠ 0、別文 skip 0)   ← J-2 裁定後 (裁定前 68)
files to write (12): questions.json, question_bank.json, by_year/{2022r04,2024r06,2025r07,2026r08}.json,
  translations/{2022r04,2024r06,2025r07}.json, .phase2/generate_result_{2022r04,2025r07,2026r08}.json
```

- 基準: `evidence/phase5/stage_06_quiz_fidelity/x4_fidfix_dry_phase1.txt` (✓ 66 行、J-2 裁定後に再取得)。取得時点: HEAD `a34c77a` + 作業木 (questions.json は他 lane の変更で M、本 unit の 11 題の対象字句は影響なし)。
- scratch 複製木 (`scratchpad/x4f/tree`) で `--apply` → 再実行 **applied 0 / skipped 66 / files 0** (冪等、J-2 裁定後に新しい複製木で再確認)。`questions.json` の変化 8 題 (2022r04-q059 q065 q080、2024r06-q005 q030 q061、2025r07-q002、2026r08-q057。他 4 題は sidecar のみ)、**correct_answer 変化 0**。
- 描画形: 複製木で `parseChoiceWithHint` を実行 — q059 ア〜エ jp / zh / en とも `table` (jp 見出し「/平均値/中央値」+ 1 行、是正前のイ〜エは見出し = 「イ/40/20」・行 0)。q065 / q057 / q005 / q061 は 3 語とも `text` で是正前と同形。
- 2026r08 の translations / .phase1 は書かない (選択肢 raw のみ)。zh / en の変更 0、解説 (.phase2 expl_*) の変更 0 (解説の「」は解説者の引用で選択肢の字形ではない。q093 の「%葉_」、q057 の「“学生”表…」等を確認)。

**PHASE 2 (lock 取得時)**: 現 HEAD で再 dry-run → ✓ 行を基準と diff (差があれば個別裁定) → `--apply` → `build-quiz-corpus` → `quiz-phase2-merge` × 4 exam (2022r04 2024r06 2025r07 2026r08) → 事後 machdiff (QUOTE_ASCII 0 を確認) → 残存語・波及ゼロ・全ゲート (crosscheck / assert-clean / chumon --check / machdiff vitest / tsc / vitest / next build)。allowlist 追加なし。

## 8. ゲート (PHASE 1)

| ゲート | 結果 |
|---|---|
| `node --check scripts/quiz-fidfix-S130-x4.mjs` | ✅ |
| fidfix dry-run | ✅ applied 66 / skipped 0 / files 12 / ⚠ 0 (J-2 裁定後) |
| scratch apply → 再実行 | ✅ applied 0 (冪等) |
| `correct_answer` 差分 | ✅ 0 |
| 描画形 (三語同形) | ✅ (q059 は是正で 3 語同形になる) |
| crosscheck / assert-clean / chumon --check / tsc / vitest / build | PHASE 2 |

## 9. 主 context 判断を要する項目 (fixer の推奨つき)

- **J-1 2022r04-q059 選択肢イ〜エに表見出し行を補う** (エ = 正解肢): 現状イ〜エは列名なしで描画され、どちらが平均値か中央値かはアの見出しから推すしかない。**推奨: 採用、計上は cosmetic (表示書式)** (値は不変、zh / en は既に 4 肢とも見出しつき、corpus 前例 3 題と同形)。却下案: (i) 不変 (イ〜エの列名欠落が学習者に見える) (ii) semantic 計上 (列名はアに在り情報は失われていない)。
- **J-2 2022r04-q078 の D-170 適用**: 散文「、」×6 と注釈 `/* …場合, j が… */` の「, 」が同 field に混在。**推奨: 採用** (注釈は散文で源は「，」、X2 2021r03-q038 の「a, b」と同じく field を源の「，」で一様にする)。却下案: 注釈をコード片とみなし「混在なし」→ ⑨ (この場合 q078 は計上から外れ 11 題)。宣言 `i, j, k` はどちらの案でも不変。
- **J-3 2024r06-q093 の ‘%葉_’**: 源は一重の曲引用符。**推奨: ‘’ で採用** (D-155 題ごとに原典の字形、前例 2017h29h-q090 ‘%う…’)。X2 2023r05-q075 の ASCII '合格' は同型題 (2019h31h-q098) に揃えた特例で、LIKE 検索式の前例は ‘’。en の “%葉_” (二重) は ⑨-c。
- **J-4 図言語化の漏洩判定 (D-163 / D-168)**: 2022r04-q097 (「（水位データを送信）」「（開閉指示を送信）」「IoTデバイス内には通信機能部があり…」)、2022r04-q090 (「中間ノード」「末端ノード」注記)、2022r04-q079 (流れ図)。**推奨: 3 題とも不変** (源の図の矢印・ボックス文言・題幹の定義から読める事実で、a / b の役割語・ディレクトリ / ファイルの対応・x の値を与えない。添付図あり。X2 J-3 と同型)。
- **J-5 2026r08-q057 下線 (主キー)**: **推奨: 不変** (X2 J-4 裁定の適用。添付図あり)。
- **J-6 2024r06-q093 `figure_description`「福葉小春」**: 学習者・AI 経路なし (§4c)。**推奨: 本是正器で bank / by_year を 1 語直す** (源 p42「稲葉小春」、gitignore 層、計上外)。却下案: 触らない (誤字が bank に残る)。
**主 context 裁定 (D-161)**: J-1 採用 (cosmetic 計上) / J-2 注釈 /* … */ はコード扱い → D-170 の混在判定から除外、q078 は不変 (計上 11) / J-3 ‘%葉_’ 採用 / J-4 3 題とも不変 / J-5 不変 / J-6 figure_description 修正採用 (計上外、gitignore 層)。是正器は q078 を外して基準を再取得した (applied 66)。lock は X2 → X3 → X4 の順で待機。

- **⑨ 送り (本 unit 不変)**: D-170 除外の「、」17 field / 14 題 (§2、q078 を含む)、ASCII「, 」/「,」の exam 型、a / b / c 1 行並び (corpus 31 題)、表セルのダッシュ字形、単位の「／」、〜 / ～、空欄の枠表記 (q071)、zh「」・en ASCII " / “”(二重) の ⑨-c。

## 10. Rule B / Rule D

- Rule B: run 1 回完走。是正器の dry-run は初回から abort 0 → 失敗 attempt なし (`failures/` 追加なし)。
- Rule D: Writer = `x4-fixer` (executor opus)。Reviewer は別 subagent_type (opus) が apply 後に。重点: q065 ア / q057 ウ / q059 エ (正解肢 3 題) の字句と描画形、q093 の一重 ‘’ と「%」「_」の当て分け、D-170 の採否 (q078 は J-2 で除外 / 除外 17 field)、J-4 の不変裁定、CLEAN 標本の別抽検。

## 11. PHASE 2 (D-152 lock 付与後、HEAD `402fb1d` = X3 commit 済)

**(a) rebase**: HEAD で再 dry-run → applied 66 / skipped 0 / files 12。基準 `x4_fidfix_dry_phase1.txt` と `diff` で**全文一致** (先行 lane X2 / X3 / T1 / T2 は X4 の 4 exam の対象字句に触れていない) → `--apply` (applied 66)。
**(b) 再生成**: `build-quiz-corpus` (2900 問、29 exam) → `quiz-phase2-merge` 2022r04 / 2024r06 / 2025r07 / 2026r08。explanations の変化は note のみ: 2022r04 q059 q065・2026r08 q057 は final note 追記 + round1 新設 (round1 = 既存の空 note、X2 / X3 と同じ D-143 挙動)、2025r07 q066 は final note の純粋後置。2024r06 は変化 0 (NOTE なし)。
**(c) allowlist**: TRANSCRIPT_PREFIX 0 → 追加なし (machdiff 脚本は未変更)。
**(d) 事後 machdiff** (是正後 manifest `x4post` を現データの表示層 (stem_jp_clean ‖ stem_jp、choices_jp) から precrop なしで再構成、scratchpad `x4f/x4post_manifest.json`。表示が変わった sample 11):
```
machdiff: fields same=481 | AGENT_MISSED=28 | VERDICT_CONFLICT=0 | REPORTED=1 | TRANSCRIPT_PREFIX=0 | QUOTE_ASCII=0   (exit 0)
```
- QUOTE_ASCII 4 → **0** (q057 ア〜エ 解消)。REPORTED 3 → 1 (採用した q065 / q093 / q066 等が transcript と一致)。
- AGENT_MISSED 25 → 28: 増えた 3 件は `2022r04-q059 イ〜エ` で、transcript (agent が是正前の見出しなし表示を写したもの) と採用した見出し行の差 = J-1 の是正そのもの (源 p27 は 1 枚の表で見出しつき)。残り 25 件は §3 の裁定済み既知型のまま。**新規実残差 0**。
**(e) 残存語** (是正後の表示 jp 102 題、ASCII `~` / U+301C / 「」/ ASCII `"` / CJK 間空白 / カナ語中改行 /「。 」):
- ASCII `~` 0、ASCII `"` 0、カナ語中改行 0、「。 」0。
- 「」: 2022r04-q079「＞」「≦」・q097「水田の水位」= 図言語化内 (J-4 不変)。
- CJK 間空白: 2022r04-q078 / 2025r07-q078 のコード片 (源どおりの語間)、2024r06-q008 / 2026r08-q026「単位 百万円」・2025r07-q026「6月30日 回収予定」(源どおり、prep §5.4 P3)。
- U+301C「〜」12 題 (2022r04-q046 q053 q064 q072 q082 q099、2024r06-q046 q049 q065 q075、2025r07-q062 q071): 源の字形は判別不可、corpus 〜 218 / ～ 75 → ⑨ (§4c)。
**(f) 波及ゼロ**

| 検査 | 結果 |
|---|---|
| `questions.json` (HEAD 比) | **8 題** = 2022r04 q059 q065 q080、2024r06 q005 q030 q061、2025r07 q002、2026r08 q057 |
| translations (HEAD 比) | 2022r04 q065 q098 / 2024r06 q093 / 2025r07 q066 / 2026r08 0 |
| `question_bank.json` / by_year ×4 (gitignore 層) | X4 4 exam の全 entry が PHASE 1 の scratch 適用木と一致 (差 0)。他 exam は触れていない |
| `correct_answer` | `git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| zh / en・解説本文 | 変化 0 (note のみ) |
| tracked の変化 | `questions.json` / `translations/{2022r04,2024r06,2025r07}.json` / `explanations/{2022r04,2025r07,2026r08}.json` (+ 新規 是正器・本 evidence・dry 基準) |
| `answer_keys.json` (`data/ip/exams/`) | md5 `6802bb0bc13004da78ad3c4e5117d997` (X3 記録と同一) |

**(g) ゲート**

| ゲート | 結果 |
|---|---|
| `node --check` 是正器 | ✅ |
| `quiz-keys-crosscheck` | ✅ questions=2900 exams=29、all invariants hold (A1–A7, B1–B7) |
| `quiz-pagefix-derive-groups --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `quiz-chumon-groups-build --check` | ✅ 生成結果と一致 (mqTech1 / mqTech2 の「registry 無し」は既存の情報行) |
| machdiff vitest (`--root ../../scripts --globals quiz-fidelity-machdiff`) | ✅ 42/42 |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| eslint (apps/web) | ✅ 0 errors / 1 warning (既存) |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped |
| `next build` | ✅ Compiled successfully |
| 是正器再実行 | ✅ applied 0 / skipped 66 |
| 事後 machdiff | ✅ 新規実残差 0 |
| e2e | 未実行 (X1〜X3 と同じ、文字列置換のみ) |

**(h) 最終の計上**: **計上 11 / 102 (10.8%) / U9 7 (6.9%) / 論理差分 jp 20 = semantic 0 + cosmetic 20 / 正解肢上 jp 3 (2022r04-q065 ア、2026r08-q057 ウ、2022r04-q059 エ) / answer_affecting 0 / correct_answer 変更 0**。NOTE_APPEND 4 (2022r04 q059 q065、2025r07 q066、2026r08 q057)。非出荷層 1 (2024r06-q093 figure_description、計上外)。⑨ は §9 末尾 (D-170 で外した「、」17 field / 14 題ほか)。Rule B: 失敗 attempt なし (`failures/` 追加なし)。Rule D: reviewer は別 subagent_type (opus) で。
