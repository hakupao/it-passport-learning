# B12 (2009h21h) Rule D 独立審査 — S129

- Reviewer: `b12-reviewer` (`pr-review-toolkit:code-reviewer`, opus)。Writer = `b12-fixer` (executor)。subagent_type・context とも別。
- 対象: 未 commit の `data/ip/quiz/{questions.json, translations/2009h21h.json, explanations/2009h21h.json}`、`scripts/quiz-fidelity-machdiff.mjs` (allowlist 1 行)、記録 `evidence/quiz_B12_2009h21h_S129.md`、是正器 `scripts/quiz-fidfix-S129-b12.mjs`。
- read-only (データ・スクリプト・git 不変)。HEAD 版を scratchpad に退避し、leaf 単位の構造 diff を自作スクリプトで取った。源は `data/ip/exams/pages/2009h21h/page-NN.png` を原寸で実読 (writer の precrop・トレースは先に読まない)。

## 判定: **PASS-with-notes** (MAJOR 0 / MINOR 0 / NIT 2)

## 1. Rule A — q085 (独立再トレース、N = 12 段落の全数)

- **源 p32 の自分の書き起こし**: 「ファイルを 4 冊だけ置くことができる机で，A ～ F の 6 冊のファイルを使って仕事をする。…ファイルが A，B，C，D，B，A，E，A，B，F の順で必要になった場合，最後に引き出しにしまうファイルはどれか。」選択肢 ア A / イ B / ウ D / エ E。参照は **10 件**。
- **白紙トレース** (容量 4、LRU。writer の記録を読む前に実施):
  1〜4 A,B,C,D で満杯 → 5 B ヒット → 6 A ヒット → 7 E ミス。最終参照 C3 / D4 / B5 / A6 なので **C を退避** → {A,B,D,E} → 8 A ヒット → 9 B ヒット → 10 F ミス。最終参照 D4 / E7 / A8 / B9 なので **D を退避** → {A,B,E,F}。
  最後にしまうのは **D = ウ** で、`correct_answer` ウと一致。
- **12 段落の照合**: correct (jp/zh/en) の手順 1〜10、各ミス時点の最終参照時刻、退避対象 (C→D)、机上の内容 (A,B,D,E → A,B,E,F) がすべて自分のトレースと一致。ア (A は 6・8 回目に参照)・イ (B は 5・9 回目。7 回目は C・D より新しく、10 回目は最新)・エ (E は 7 回目に C と入替え。最終参照 7 は D の 4 より新しい) も事実どおり。zh / en も jp と同じ手順・同じ数値を述べている。誤りは 0/12。
- points 2 段落は一般論で、旧列への言及は無い (不変で正しい)。
- **stem 表記**: jp「A，B，C，D，B，A，E，A，B，F」(題内の既存「，」と字種一致)、zh「A、B、C、D、B、A、E、A、B、F」、en "A, B, C, D, B, A, E, A, B, F" ✓。raw / bank / by_year の 3 層とも源の列。出荷層に旧列が残るのは final note の追記 (是正前の列として明示) だけ。
- 参考: 旧列 (11 件) でも退避順は A→B→C→D で最後は D になる。記録 §2 の「key 偶然一致」という分類は事実どおり。

## 2. git diff の説明可能性

| 検査 | 結果 |
|---|---|
| `questions.json` | 変化した題は **5 題** (q002 stem / q040 ア / q050 イ / q085 stem / q087 stem + 選択肢)。2009h21h 以外は 0 |
| `translations/2009h21h.json` | q038 clean / q050 イ zh・en / q057 clean・zh・en / q072 clean・zh・en / q085 zh・en / q087 clean・zh / q090 clean / q098 en。全 hunk が記録上の 15 論理差分 (sem 5 / cos 10) と訳層の追随に対応する。説明できない hunk は 0 |
| `explanations/2009h21h.json` | final `note_jp` 6 件 (q038 q040 q050 q085 q087 q090) は**すべて純粋な後置** (`startsWith`、MARK `fidfix-S129-b12`)。`round1` を新設した 5 題は merge の仕様 (final ≠ round1 のときに併記) によるもので、B11 と同じ型。本文の変化は q050 イ、q085 の 12 段落、q087 の式字形だけ |
| `correct_answer` | 0 / 2900 |
| 範囲外 | `quiz-fidelity-machdiff.mjs` の allowlist `2009h21h-q080\|stem` 1 行と session log 1 行だけ |

## 3. 他の差分を源と照合

- q050 イ (p19)「アローダイアグラム」✓。解説イは PERT / 矢線で書き直されており、3 言語とも正しい
- q040 ア (p16)「例外使用をしないように」✓
- q090 (p35) の「追及」「出力できるかをも確認」✓。どちらも設問文側で、前文 (「Mさんの部署では…」) の外にある
- q002 (p03) “個人情報”の ✓ / q038 (p16) “要件定義”, “システム設計”, … ✓ (区切りは field の字種) / q057 (p22) 〔指定方法〕の “” ✓。見出し〔ディレクトリ構造（図）〕の削除は jp/zh/en とも ✓
- q072 (p28) 源のキャプションは「図1」「図2」だけ。括弧の削除は 3 層とも ✓
- q087 (p33) 表 B 列 `B1+A2`…、選択肢 `合計(A$1～A$10)-合計(…)+A10` ✓ (D-162)。アは範囲記号のみ
- q098 en: Ms. → Mr. で、q097 / q099 / q100 と同じ Mr. A / Mr. B に揃った ✓
- 事後 machdiff の記録 (AGENT_MISSED 8 = 既知の不変項目、TRANSCRIPT_PREFIX adjudicated 1) は、PHASE 1 manifest での再実行結果 (q072 は旧 snapshot なので残る) と矛盾しない

## 4. 独立した見落とし抽検

writer の実読リスト・CLEAN 標本に無い **q001 (p03)、q039 (p16)、q048 (p19)、q073 q074 (p28)、q084 q086 (p32)、q088 (p33)** の 8 題について、表示 jp (clean||raw + 選択肢) を源と逐字照合した。**見落とし 0 / 8** (読点・空白の字種の混在は exam 全体の型 ⑨ として除外)。

## 5. ゲート (reviewer が再実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29、all invariants hold (A1–A7, B1–B7) |
| `quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped |
| machdiff vitest | ✅ 42/42 |
| fidfix dry-run の冪等性 | ✅ applied 0 / skipped 237、files to write 0 |

## 6. Notes

- **NIT-1** q087 は選択肢の範囲記号を源の「～」にしたが、題幹の地の文「セル A1 〜 A10」は「〜」のまま (源では同じ字形)。D-162 の範囲は式だけ、という既存の扱いどおりなので変更は不要。全体で字形を正規化するときに一括でよい。
- **NIT-2** gitignore 層の `.phase2/expl_jp_2009h21h-q085.json` の key_guard.note_jp は旧列のトレースのまま残っている (出荷層の note は追記で是正前と明示済み、merge 源は generate_result)。出荷には影響しない。再生成時の参照元にしないこと。

MAJOR / MINOR なし。commit してよい (データ修正不要)。
