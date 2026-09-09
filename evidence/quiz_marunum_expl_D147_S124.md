# Evidence — D-147 §6 解説層 丸数字区切り正規化 (Session 124, 2026-09-09)

> Writer = 主 context (脚本作成 + 適用)。Reviewer = 別 agent (`oh-my-claudecode:code-reviewer`, opus) が §R に追記する (Rule D)。

## 1. 対象と根拠
- D-147 §6 (S124 ユーザー gate: 「23 問の解説を決定的正規化」)。ADR `docs/decisions/D-147-marunum-separator.md` §6。
- 脚本 `scripts/quiz-marunum-expl-D147.mjs` — IDS (23 問) / 正規表現 `([①-⑳])([ \t　]*[,，、]?[ \t　]*)(?=[①-⑳])` / SEP {jp ", ", zh "、", en ", "} は `quiz-marunum-sep-D147.mjs` と同一。
- 層: `.phase2/expl_jp_<id>.json` (correct_jp / distractors_jp[].why_wrong_jp / points_jp[]) / `.phase2/expl_tr_<id>.json` (correct / distractors[] / points[] の zh・en) / `.phase2/generate_result_<exam>.json` results[].key_guard.note_jp (final のみ、**key_guard_round1 不可触** D-143 §1) → `quiz-phase2-merge.mjs <exam>` で sidecar `data/ip/quiz/explanations/<exam>.json` 再生成。

## 2. 事前検証
- 影響 15 exam で適用前に `quiz-phase2-merge.mjs` を再実行 → `git status` 変化 0 (merge 冪等、`.phase2` は sidecar の真相源として stale でない)。
- 事前走査 (`scripts/quiz-marunum-expl-scan-S124.mjs`、58,696 text field [適用前]): 23 問中 非 D-147 形 124 field / 20 問 (うち round1 2 field) → 対象 122。23 問以外 75 field / 34 問 = 散文引用 (範囲外)。

## 3. 適用結果 — attempt 1 (FAIL → 巻き戻し) → attempt 2
- **attempt 1** (122 field / 20 問、note_jp 含む): reviewer FAIL (MAJOR 2 / MINOR 2 / NIT 5、§R.1〜R.8)。散文の節境界 4 field 誤置換 + note_jp の zh 引用 1 field。`.phase2` を HEAD sidecar から 122 field 復元 → 再 merge で git diff 0 を確認。Rule B `failures/quiz_marunum_expl_S124_attempt_1.md`。
- **attempt 2** (脚本改修: run 単位の MIXED/DUP 判定 → field 丸ごと SKIP、note_jp 対象外、全 field 書込後に merge、merge stderr 透過): dry-run = apply = **18 / 23 問、106 field**。SKIP 4 field (2010h22a-q097 points[1].jp「②③、⑧」MIXED / points[1].zh 同 / dist.イ.zh「④，④」DUP / 2018h30a-q081 dist.ウ.zh「②④，②」MIXED+DUP) = attempt 1 の誤置換 4 件と完全一致、HEAD のまま。
- 冪等: 再 dry-run 0 / 0。事後走査 (`quiz-marunum-expl-scan-S124.mjs`): 23 問の残余 18 field / 13 問 = final note_jp 12 + round1 2 + SKIP 4 (すべて対象外)。
- sidecar diff: 15 file、**−106 / +106 行、round1 新規 publish 0**。questions / exams / translations 変更 0、correct_answer 差分行 0。

## 4. ゲート (attempt 2 適用後、再実行)
| コマンド | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran / all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| `pnpm -C apps/web exec vitest run` | ✅ 33 passed / 1 skipped、501 passed / 2 skipped |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ 0 err |

## R. Rule D (reviewer 追記欄)

> Reviewer = 独立 agent (writer = 主 context)。Session 124, 2026-09-09。
> evidence の数値は鵜呑みにせず、HEAD 版 sidecar を `git show` で取り出して worktree 版と自前で構造比較した。
> 検証脚本は scratchpad (`audit1/audit2/audit4/classify/defects.mjs`)。データ・脚本は一切変更していない。

### R.0 判定: **FAIL** (MAJOR 2 / MINOR 2 / NIT 5)

122 置換のうち **117 は正しい**。ゲート 5 本は全て再現 GREEN、correct_answer・key_guard スカラは全 2900 問不変。
ただし **5 field で「丸数字間の区切り」ではないものを置換している** (うち 4 field は学習者に表示される本文)。
是正範囲は小さい (5 field) ので作り直しではなく修正 pass で足りるが、この状態では commit 不可と判断する。

### R.1 構造検証 (委託 ①③) — 再現値

HEAD 版を `git show HEAD:data/ip/quiz/explanations/<exam>.json` で取り出し、worktree 版と全 key を再帰比較
(型・key 追加削除・**key 順序**・配列長・header field も含む):

| 分類 | 実測 | 判定 |
|---|---|---|
| (a) 区切りのみの文字列変化 | **122 field / 20 問** | 委託値と一致 |
| (b) `key_guard.round1` の新規追加 | **10 問** | 委託値と一致 |
| (c) それ以外の変化 (語の変化 / 順序 / 削除 / header) | **0** | ✅ |

- 122 件すべて「区切りを取り除いた文字列」が HEAD と **byte 同一** (`s.replace(RE, (_,c)=>c)` で照合) = 語の増減は無い。
- **round1 不可触は成立**: 全 29 exam / 2900 問で `figure_derivable` / `derived_answer` / `matches_key` / `suspect` /
  `stem_corruption_suspected` の差分 **0**。既存 round1 ブロックの改変 **0**、削除 **0**。
- 新規 publish 10 問の round1 は `.phase2/generate_result_<exam>.json` の `key_guard_round1` と
  **全 field 一致・`note_jp` は byte 同一** (10/10)。round1 側には旧形の区切りが 36 箇所そのまま残っており、触っていないことの裏づけ。

### R.2 冪等・残余 (委託 ④)

```
node scripts/quiz-marunum-expl-D147.mjs          → 変更のあった問: 0 / 23、書換 field 数: 0   ✅ 冪等
node scripts/quiz-marunum-expl-scan-S124.mjs     → hits in 23 問: 12 fields / 12 問
                                                    全件 key_guard.round1.note_jp、round1 外は 0  ✅
```

23 問の round1 以外に非適合の区切りは **0** (jp「, 」/ zh「、」/ en「, 」に完全準拠)。zh に「①，②」の残りは無い。

### R.3 ゲート再実行 (委託 ⑥) — evidence §4 を全数再現

| コマンド | reviewer 実測 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran / all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE 0 件 / (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| `pnpm -C apps/web exec vitest run` | ✅ 33 passed / 1 skipped、501 passed / 2 skipped |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ exit 0 |

**注**: どのゲートもこの欠陥を捕まえられない。crosscheck B4 は「round1 は final と差分がある時に限り publish」しか見ず、
差分が cosmetic かどうかを問わない。区切り字種の妥当性を検査する gate は存在しない。**GREEN は無罪の証拠ではない。**

### R.4 MAJOR

置換 229 箇所を 1 件ずつ前後 34 字の文脈付きで目視し、「2 つ目の丸数字の直後に説明文が続く」45 箇所を精査した。

#### MAJOR-1 — 節/レコード境界のコンマを列挙の区切りとして置換 (4 field、うち 4 field が学習者表示)

正規表現は「丸数字 + 区切り記号 1 個 + 丸数字」しか見ないため、**別々の節・別々のレコードに属する 2 つの丸数字が
たまたま隣接したとき**、その間のコンマ (文の読点 / レコード区切り) を列挙の区切りと誤認して置換する。実測 4 件:

| # | field | HEAD | NOW | なぜ誤りか |
|---|---|---|---|---|
| 1 | `2010h22a-q097 points[1].jp` | `④ の先行②③、⑧ の先行⑤⑥⑦` | `④ の先行②, ③, ⑧ の先行⑤, ⑥, ⑦` | 「、」は ④ のレコードと ⑧ のレコードの境界。置換後は **④ の先行が ②,③,⑧ の 3 つ**に読める。**要点欄 = 学習者表示** |
| 2 | `2010h22a-q097 points[1].zh` | `④的前置②③、⑧的前置⑤⑥⑦` | `④的前置②、③、⑧的前置⑤、⑥、⑦` | 同上。②③ → ②、③ にしたことで ③ と ⑧ の間の既存「、」と同化し、6 項の 1 列挙に見える。**学習者表示** |
| 3 | `2010h22a-q097 distractors.イ.zh` | `…前置作业都是④，④不结束，⑤和⑥都无法开始。` | `…都是④、④不结束，…` | 「，」は**節の区切り**。中文の頓号「、」は並列する語句専用で、節を繋ぐ用法は無い。**非文法**。**学習者表示** |
| 4 | `2018h30a-q081 distractors.ウ.zh` | `该项列出了②④，②iOS 和④Windows Phone 虽然…` | `该项列出了②、④、②iOS 和④Windows Phone 虽然…` | 「，」は文の区切り。置換後は「②、④、②iOS 和④Windows Phone」= **② と ④ を 2 度数える 4 項の列挙**に読め、文の切れ目が消える。**学習者表示** |

再現:

```
git show HEAD:data/ip/quiz/explanations/2010h22a.json | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(d.questions["2010h22a-q097"].points[1].jp)'
node -e 'console.log(JSON.parse(require("fs").readFileSync("data/ip/quiz/explanations/2010h22a.json","utf8")).questions["2010h22a-q097"].points[1].jp)'
```

**根本原因**: 脚本 header と evidence §1 は「IDS / RE は `quiz-marunum-sep-D147.mjs` と同一」を安全性の根拠にしているが、
**入力領域が違う**。S123 の適用先 choices は文字列全体が裸の列挙なので節境界が存在せず、この失敗形は原理的に起こらない。
S124 は同じ正規表現を**散文**に当てており、そこでは節境界が普通に現れる。
「正規表現が同一だから安全」は成り立たない — 安全性は正規表現ではなく**入力の形**が担保していた。
脚本 header の「構造的に安全」リスト (「①と③」「① and ③」「①→②」「①〜③」) は*語*の混入しか挙げておらず、
本件の**句読点による境界**を想定していない。D-147 §6 の「何をしないか」にこの限界を明記すべき。

#### MAJOR-2 — note_jp 内の zh 引用に jp の区切りを適用 (1 field、内部メタ)

`2019h31h-q062 key_guard.note_jp` (final):

```
HEAD : …丸数字区切りの脱落を D-147 に従い jp「①, ③」/ zh「①、③」に是正（…）
NOW  : …丸数字区切りの脱落を D-147 に従い jp「①, ③」/ zh「①, ③」に是正（…）
```

この note は **S123 が D-147 §3 に従って jp と zh を別字種にしたことを記録した唯一の文**。
脚本は field 名 `note_jp` から言語を jp と決め打ちするため、文中に引用された **zh の例**「①、③」まで jp 字種で書き換えた。
結果、note は「zh も『①, ③』に是正した」と述べており、**D-147 §3 にも実データ (zh choices =「①、③」) にも反する**。
jp と zh が違うことを言うための一文が、jp と zh を同じ形で書いてしまい自己矛盾している。

D-143 が防ごうとした失敗そのもの (「note 本文が、それが付いている記録と矛盾する」) を、cosmetic 正規化で再導入した形。
学習者には出ない (`apps/web/src` で `key_guard.round1` の参照 0、`key_guard.suspect` のみ `quizModel.ts:304` で写像) が、
監査記録としては誤り。

### R.5 MINOR

- **MINOR-1 — `2010h22a-q097 key_guard.note_jp` の表転記が曖昧化 (内部メタ、6 箇所)**。
  原典表の**レコード区切り**「、」6 個が ", " になり、`④インストール 3/先行②, ③, ⑤設定作業 2/先行④, ⑥移行データの投入…` と、
  レコード区切りと先行作業の区切りが同じ文字列になった (④ の先行が ②,③,⑤ に読める)。
  さらに先頭の `①停止 0.5/先行なし、②バックアップ` だけは直前が丸数字でないため「、」のまま残り、**同一文内で不統一**。
  MAJOR-1 と同じ原因だが、こちらは round1 に原文が保存されており学習者にも出ないので MINOR。

- **MINOR-2 — 新規 publish された round1 10 問は全て「情報量ゼロ」で、round1 の意味論が劣化した**。
  10 問すべて `figure_derivable` / `derived_answer` / `matches_key` / `stem_corruption_suspected` が final と同一で、
  `note_jp` の差は**区切り字種だけ** (round1 note を D-147 正規化すると final note と byte 一致することを確認)。
  `quiz-phase2-merge.mjs` の `round1Differs` は「裁決が何かを動かしたときだけ round1 を出す」ための近似で、
  コメントも `round-1 is only worth publishing when adjudication actually moved something` と書いている。
  final にだけ cosmetic 正規化を当てるとこの近似が壊れ、**`key_guard.round1` の存在が「裁決で何かが動いた」を意味しなくなる**。
  D-143 §6 が Rule B として記録した 2017h29a-q009/q016/q040 の失敗 (round1 を潰して「最初から合っていた問」と区別不能にした) の**裏返し**で、
  今度は何も動いていない 10 問が「動いた問」に見える。出荷 artifact に +70 行の無情報ブロックが増える。
  crosscheck B4 は差分の有無しか見ないので検出できない。
  対処案: (a) D-147 §6 に「cosmetic 正規化で round1 が publish される 10 問」を明記して受容する、
  (b) `round1Differs` の note 比較を区切り正規化後に行う (merge の意味論変更なので別 D が必要)。**writer とユーザーの判断事項**。

### R.6 NIT

- **NIT-1** 脚本の `--apply` は「`.phase2` 全書込み → 15 exam の merge を順次実行」の順で、merge が途中で失敗すると
  `.phase2` は全て新、sidecar は一部だけ新という**部分適用**状態が残る (JSON 破損は起きない。`writeFileSync` は
  シリアライズ済み文字列の一括書き込みで、`quiz-phase2-merge` も検証エラー時は書く前に `process.exit(1)`)。
  merge を再実行すれば復旧できるが、失敗時に「どこまで進んだか」を出さないので手当てが要る。
- **NIT-2** merge を `execFileSync(..., { stdio: "pipe" })` で呼んでいるため、`quiz-phase2-merge` の
  `✗ validation errors:` 本文が握り潰され、失敗時に終了コードしか見えない。`stdio: "inherit"` か catch 時の stderr 出力が欲しい。
- **NIT-3** evidence §2 の「58,696 text field」は**適用前**の値。適用後に同じ走査を回すと **58,716** (round1 10 ブロック ×
  `note_jp` + `derived_answer` の 2 string = +20)。誤りではないが、どちらの状態を測ったか本文に無い。
- **NIT-4** evidence §3 の「23 問の残余 = round1 12 field のみ」は正しいが、**残余 = 36 箇所 / 12 field** で、
  field 数と箇所数が混在している (§2 の「124 field」も同様に箇所数ではない)。単位を明示した方がよい。
- **NIT-5** 脚本 header の「何をしないか」に列挙された安全例 (`①と②` / `① and ②` / `①→②` / `①〜③`) は
  reviewer 側でも corpus 実測で不変を確認済 (15 exam・round1 除外で `① and ②` 61→61 / `①→②` 73→73 / `①と②` 48→48 /
  `①〜③` 31→31 / `(1) and (2)` 29→29 / 丸数字総数 3071→3071)。ここは主張どおり。ただし MAJOR-1 の形が抜けている (R.4 参照)。

### R.7 抽読 (委託 ⑦) — 指定 5 問 + α を本文で確認

| 問 | jp | zh | en | choices と一致 |
|---|---|---|---|---|
| `2019h31h-q062` | ✅ 自然 | ✅ 自然 | ✅ (「(1) and (3)」形、D-147 §3 適合) | ✅ 本文は一致。**ただし note_jp が MAJOR-2** |
| `2010h22a-q097` | ❌ points[1] が曖昧 (MAJOR-1) | ❌ points[1] + distractors.イ が非文法 (MAJOR-1) | ✅ | 選択肢引用 `(②, ③) と (⑤, ⑥, ⑦)` は一致 |
| `2022r04-q052` | ✅ | ✅ | ✅ | ✅ jp`①, ②, ③, ④` / zh`①、②、③、④` / en`①, ②, ③, ④` が choices と完全一致 |
| `2018h30a-q057` | ✅ | ✅ | ✅ | ✅ 4 肢すべて引用形が choices と一致 |
| `2016h28h-q099` | ✅ | ✅ (zh が ", " → 「、」に是正され choices と一致) | ✅ | ✅ |
| `2018h30a-q081` (追加) | ✅ | ❌ distractors.ウ (MAJOR-1) | ✅ | — |

`2019h31h-q062` の本文は 3 言語とも自然で、S123 で choices を統一した狙い (同一問内の旧新併存の解消) は達成できている。
en は「(1) and (3)」形が保たれ、D-147 §3 の適合扱いどおり。

### R.8 是正提案 (writer 作業、reviewer は変更していない)

1. `.phase2` 側で 5 field を手当て (round1 は触らない) → 該当 exam を `quiz-phase2-merge` で再生成:
   - `expl_jp_2010h22a-q097.json` points_jp[1]: `②, ③, ⑧ の先行` → `②③、⑧ の先行` (HEAD 形に戻す)
   - `expl_tr_2010h22a-q097.json` points[1].zh: `②、③、⑧的前置` → `②③、⑧的前置`
   - `expl_tr_2010h22a-q097.json` distractors[イ].zh: `都是④、④不结束` → `都是④，④不结束`
   - `expl_tr_2018h30a-q081.json` distractors[ウ].zh: `列出了②、④、②iOS` → `列出了②、④，②iOS`
   - `generate_result_2019h31h.json` results[q062].key_guard.note_jp: `zh「①, ③」` → `zh「①、③」`
   - (任意) `generate_result_2010h22a.json` results[q097].key_guard.note_jp のレコード区切り 6 個を「、」に戻す = MINOR-1
2. 脚本に**節境界ガード**を入れる。案: 2 つ目の丸数字の直後が説明文 (丸数字・区切り・閉じ括弧・句点・空白以外) で、
   かつ置換対象が空でない区切りである箇所は**置換せず警告して一覧に出す**。今回の 4 件はこれで全て捕まる
   (reviewer の `classify.mjs` と同じ判定)。ただし空白が続く形 (`②③、⑧ の先行`) は取りこぼすので、
   「散文 field は自動置換しない / 人間確認に回す」方針の方が安全。
3. `note_jp` 中の `zh「…」` / `en「…」` 引用を jp 字種で書き換えないよう、言語決め打ちを止めるか note_jp を対象外にする。
4. MINOR-2 (cosmetic round1) の扱いを D-147 §6 に明記するか、`round1Differs` を見直すかをユーザー判断で決める。
5. 再適用後は **R.1 の構造比較と R.2 の残余走査を再実行**し、加えて 4 件の本文を目視で再確認すること。

---

## R.9 復験 (attempt 2) — 判定: **PASS-with-notes** (MAJOR 0 / MINOR 2 / NIT 4)

Reviewer は attempt 1 と同一の独立検証脚本を再実行 (HEAD = `bc16345` 不変なので比較基盤は同じ)。
データ・脚本は今回も一切変更していない (`git status` 21 entry / `data` diff 106+ 106− のまま)。

### R.9.1 R.1 構造比較の再実行 — ✅

| 分類 | attempt 1 | attempt 2 | 判定 |
|---|---|---|---|
| (a) 区切りのみの文字列変化 | 122 field / 20 問 | **106 field / 18 問** | 委託値と一致 |
| (b) `key_guard.round1` 新規追加 | 10 問 | **0** | ✅ MINOR-2 解消 |
| (c) それ以外の変化 (語 / 順序 / 削除 / key 順 / header) | 0 | **0** | ✅ |

- 106 件すべて「区切りを除いた文字列」が HEAD と byte 同一 = 語の増減 0。
- 全 29 exam 2900 問で `figure_derivable` / `derived_answer` / `matches_key` / `suspect` /
  `stem_corruption_suspected` 差分 **0**。round1 ブロックは 318 問に存在し **改変 0 / 追加 0 / 削除 0**。
- **`key_guard.note_jp` (final) は全 2900 問で HEAD と byte 同一** → MAJOR-2 (q062 の zh 引用) / MINOR-1 (q097 表転記) 解消。
- 変化した path に `key_guard.*` は 1 件も無い (jp 46 / zh 46 / en 14 = correct・distractors・points のみ)。

### R.9.2 SKIP 4 field — ✅ HEAD と byte 同一

`Buffer.equals` で照合、4/4 とも `true`。SKIP 一覧は reviewer の attempt 1 MAJOR-1 と**完全一致**:

```
SKIP 2010h22a-q097 points[1].jp  run=「②③、⑧[MIXED]」
SKIP 2010h22a-q097 points[1].zh  run=「②③、⑧[MIXED]」
SKIP 2010h22a-q097 dist.イ.zh    run=「④，④[DUP]」
SKIP 2018h30a-q081 dist.ウ.zh    run=「②④，②[MIXED][DUP]」
```

### R.9.3 R.2 残余走査の再実行 — ✅ 「OTHER」0

`node scripts/quiz-marunum-expl-D147.mjs` → 0 / 23、0 field (冪等)。
23 問の残余を bucket 別に再集計 (unit = field):

| bucket | field |
|---|---|
| `key_guard.note_jp` (final、§6 で対象外) | 12 |
| `key_guard.round1` (D-143 不可触) | 2 |
| SKIP field (節境界ガード) | 4 |
| **上記以外 (あれば欠陥)** | **0** |
| 計 | 18 |

委託値と一致。対象内の非適合区切りは 0、zh に「①，②」の残りは無い。

### R.9.4 ガードの単体検証 — ✅ (export された `normalize()` を直接呼んで確認)

MIXED / DUP / MIXED+DUP の 3 形は skip、通常の列挙 (jp bare / zh 全角コンマ / en bare / 既適合) は期待どおり正規化、
非区切り文脈 (`① and ②` / `①と②` / `①→②` / `①〜③` / `（②、③）和（④、⑤）`) は run を構成せず不変。
corpus 実測でも 15 exam で `① and ②` 61→61 / `①→②` 89→89 / `①と②` 50→50 / `①〜③` 32→32 /
`(1) and (2)` 29→29 / **丸数字総数 3217→3217** (attempt 1 と違い round1 除外の細工が不要になった)。

### R.9.5 ゲート再実行 — 5 本すべて GREEN (§4 を全数再現)

crosscheck (2900/29、A1–A7・B1–B7) / pagefix `--assert-clean` (A)(B) / chumon `--check` 一致 /
vitest 501 passed・2 skipped / tsc exit 0。

### R.9.6 MINOR (blocker ではない、記録として残す)

- **MINOR-3 — SKIP により 2 問で「同一問内の新旧併存」が残る。§6 の当初目的がその 2 問では未達。**
  `2010h22a-q097`: `correct.jp` は正規化されて `(②, ③) と (⑤, ⑥, ⑦)`、一方 SKIP の `points[1].jp` は `②③、⑧` のまま。
  zh も `dist.ア` が「（②、③）」、SKIP の `dist.イ` が「（④，⑤，⑥）」で字種が割れる。
  `2018h30a-q081`: `dist.イ.zh`「①、②、③」に対し SKIP の `dist.ウ.zh`「②④」。
  **判断としては正しい** (非文法な文を出すより字種の不統一の方が軽い) が、§6 の契機「同一問内で旧新併存」は
  この 2 問では解消していない。閉じるには「文を書き換えて節境界を丸数字の隣接から外し、その上で正規化する」
  LLM pass が要る (Rule A 対象)。**明示的に受容するか次 unit に送るかをユーザー判断で決めるべき**。
- **MINOR-4 — ガードは「区切りが一様な run」の節境界を検出できない (残余ギャップ)。**
  `mixed` は区切り字種の不一致、`dup` は丸数字の重複でしか判定しないため、
  `④ の先行②、③、⑧ の先行⑤⑥` のように**節境界も含めて全部同じ区切り**になっている run は通過し、
  `②, ③, ⑧` に正規化される (`normalize()` で再現確認済)。
  今回の corpus では**実害 0** — 書換えられた run のうち区切りが一様な句読点だったもの 47 件を全数目視し、
  すべて選択肢引用または明示的な列挙で、節境界は 1 件も無かった。
  ただし脚本を 34 問 (範囲外) や他 unit に流用する際はこのギャップが再燃する。ADR §6 の「教訓」に併記すると安全。

### R.9.7 NIT

- **NIT-6** `normalize()` は、同一文字列内に SKIP 対象 run と正常 run が混在すると
  **正常 run だけ正規化した text を返す** (実測: `normalize("「①②」と ④ の先行②③、⑧", "jp")` →
  `"「①, ②」と ④ の先行②③、⑧"` + `skipped` 1 件)。field 単位の不触は呼び出し側の
  `if (r.skipped.length) return;` だけが担保している (今回のデータは正しい = SKIP 4 field は byte 同一)。
  export された公開 API としては危険なので、`skipped` が非空なら `text` に原文を返すか、戻り値名を変える方が安全。
- **NIT-7** ADR §6 の「決定」箇条書きが依然として適用先に **`generate_result final note`** を挙げており、
  直後の「note_jp は対象外」箇条書きと矛盾する。決定行から削るべき。
- **NIT-8** ADR §6 の「契機」が `S124 §0 実測: 20 問 / 122 field` (= attempt 1 の値) と
  `key_guard final note が旧形のまま` (= 現在は意図的に対象外) のままで、確定値 **18 問 / 106 field** と食い違う。
- **NIT-9** ADR §6 の「IDS / RE は choices 脚本と同一」は attempt 2 では不正確 (RE は `RUN` + `SEG` の 2 本立てになり
  節境界ガードが加わった)。同一なのは IDS 23 問と SEP の 3 字種のみ。

### R.9.8 結論

attempt 1 の MAJOR 2 件 (節境界誤置換 4 field / note_jp の zh 引用 1 field) と MINOR 2 件 (表転記曖昧化 /
cosmetic round1 10 問) は **すべて解消**し、reviewer 側の独立再現でも回帰は検出されなかった。
残る MINOR 3・4 は「今回の出荷物の欠陥」ではなく**残課題の記録**で、commit を止める理由にはならない。
NIT 6〜9 は ADR / 脚本の記述整合で、データには影響しない。
→ **PASS-with-notes**。MINOR-3 (2 問の併存を受容するか次 unit に送るか) だけはユーザーに明示して判断を仰ぐこと。
