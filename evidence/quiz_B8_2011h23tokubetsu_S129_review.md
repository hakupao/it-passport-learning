# B8 (2011h23tokubetsu) Rule D 独立審査 — S129

- Reviewer: `b8-reviewer` (`pr-review-toolkit:code-reviewer`, opus)。Writer = `b8-fixer` (executor)。subagent_type も context も別。
- 対象: 未 commit の `data/ip/quiz/{questions.json, translations/2011h23tokubetsu.json, explanations/2011h23tokubetsu.json}`、記録 `evidence/quiz_B8_2011h23tokubetsu_S129.md`、是正器 `scripts/quiz-fidfix-S129-b8.mjs`。
- read-only で審査した (データ・スクリプト・git は変更していない)。HEAD 版を scratchpad に退避し、自作スクリプトで leaf 単位の差分を取った。源は `data/ip/exams/pages/2011h23tokubetsu/page-NN.png` を原寸で実読 (writer の precrop は使っていない)。

## 判定: **PASS-with-notes** (MAJOR 0 / MINOR 0 / NIT 3)

## 1. git diff の説明可能性

| 検査 | 結果 |
|---|---|
| `questions.json` の変化 leaf | **14** (14 題: q001 q020エ q022 q025エ q027イ q029エ q032ア q033ア q035 q052 q054 q060 q094 q098エ)。2011h23tokubetsu 以外の変化 **0** |
| `translations/2011h23tokubetsu.json` の変化 leaf | **23** (stem_jp_clean 14: q004 q022 q024 q041 q044 q049 q054 q059 q062 q073 q087 q094 q096 q100 / zh・en 9: q004×2 q022zh q096×2 q098エ×2 q100×2) |
| `explanations/2011h23tokubetsu.json` | final `note_jp` 18 件 (記録 §6 の 18 題と一致) は**すべて純粋後置** (`startsWith` 検証)。`round1` publish 14 題 (undefined → object) は `.phase2/generate_result_2011h23tokubetsu.json` の `key_guard_round1` と **14/14 完全一致** (D-143、B6/B7 と同型 → NIT-3)。他は q025エ / q027イ の注記削除 (jp/zh/en 6)、q098 correct・エ・points[1] の 1,200dpi (9)、q100 correct の src (3) のみ |
| 25 論理差分 + PHASE 2 追加 2 件との対応 | 全 hunk が 25 件 (+ q094 注記2 後半「、」×2、q098 解説 1,200dpi) かその訳層・解説追随に対応。説明できない変化 0 |
| `correct_answer` | `git diff -U0 data \| grep -c '"correct_answer"'` = **0** (0/2900) |
| 中問前文 | 変化は q094 / q096 / q100 とも設問文以降。前文 (〔マネジメント〕〔テクノロジ〕の見出しを含む) は不変、`chumon-groups-build --check` 一致 |
| A3/A5 先行変更 | q090 / q093 は変化なし。q094 は「、」→「，」のみ、q100 の src は D-166 による意図的変更で、他の A3 成果 (表・(1)〜(5) 構造) は不変 → 退行なし |

## 2. 源 PNG との照合

- **q020 エ** (p09, 正解肢): 源「…であることを知っていながら，自社で使用した。」✓。key エ 不変
- **q025 エ** (p10) 源「バリューチェーン分析」✓ / **q027 イ** (p11) 源「IT ガバナンス」✓。解説の OCR 注記削除後も文は自立 (→ NIT-2)
- **q087** (p30): 源 太字「機能にないもの」✓ (raw 由来の「当たらない」再構成の是正は正しい)
- **q096** (p38): 源「1 日券，2 日券」「〔処理内容〕の (2)」、配列値の前に見出し〔配列の値〕✓。zh〔数组的值〕/ en [Array values] も妥当
- **q100** (p42): 散文 (1)〜(5) は源 “…” ✓、`src="ファイル名"` と `<img src=" a ￥s01.jpeg " … >` は源 ASCII `"` ✓ (D-166)。zh の〔技术类〕削除は jp/en・他 member に無い見出しの除去で妥当。￥ / . の字幅は S129 裁定どおり据え置き
- **q004** (p04): 「契約締結」は両枠にまたがる 1 箱 → ベンダ列の複写セル除去 ✓、括弧書き残置は主 context 裁定どおり。zh/en 同形 ✓
- **q001** (p03) 源「著作権侵害」✓ / **q022** (p09) 源「2,400 万円」✓ (表示 clean は「万円/月」で ／ の欠落なし) / **q098 エ** (p40) 源「1,200 dpi」✓
- **q029 エ** (p11) 末尾「「」は源に無い ✓ / **q032 ア** (p12)「販売し，落札者」✓ / **q033 ア** (p13)「場合，」✓ / **q035** (p13)「報告された。IT」✓ / **q044** (p16)「是正や，新しい」✓ / **q052・q054** (p19) ✓
- **q094** (p37): 設問文・注記1・注記2 の読点は源「，」✓ (→ NIT-1)

## 3. 独立した見落とし抽検

writer の標本・名指し・実読リストのどれにも入っていない 8 題を、表示 jp (clean||raw + 選択肢) と源で逐字照合: **q002 q003 (p03)、q006 q007 (p05、precrop なし)、q021 (p09)、q085 q086 (p30)、q093 (p36、precrop なし)**。追加で q008 q009 (p05、precrop なし) も照合。
→ **見落とし 0 / 10**。読点の字種 (「, 」) と空白の正規化は exam 全体の型 (⑨) として除外 (q003 / q006 の閉じ “” 直後の空白もこの型)。q093 の流れ図の言語化は図と一致。

## 4. ゲート (reviewer が再実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran、all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped tests |
| fidfix dry-run 冪等性 | ✅ applied 0 / skipped 220、files to write 0。`git status data` は 3 ファイルのまま |
| 残存語走査 (jp 表示 / zh / 解説 note 以外) | ✅ パリュー・ガパナンス・1200dpi・src=「・知りながら・当たらない・〔技术类〕 = 0。jp の「、」は q015 / q099 (図の言語化文、記録 §4e で不変と裁定) のみ |

## 5. Notes

- **NIT-1** `q094` の raw `stem_jp` (questions.json、非出荷) は表1 の条件行が源と入れ替わっている: raw「Jが0以上20以下 | Y | Y | Y | Y | N | N | N | N」「Kが… | Y | Y | N | N | Y | Y | N | N」に対し、源 p37 は J = Y Y N N Y Y N N、K = Y Y Y Y N N N N。出荷層 clean は源どおりで、学習者には見えない (N5 型、本 unit の変更ではない既存の状態)。本 unit は q094 raw に 5 操作を当てているので、記録 §10 の N5 行に登記しておくこと。
- **NIT-2** 解説の注記削除で半角空白が残る: `q025` distractors.エ.jp「バリューチェーン分析 は、」、`q027` distractors.イ.jp「IT ガバナンス を確立」。表示上の小さな体裁の問題で、意味への影響はない。
- **NIT-3** 記録 §12(h) は explanations の round1 publish 14 題 (generate_result と完全一致、D-143) に触れていない (B7 NIT-2 と同型)。データには影響しない。

MAJOR / MINOR は無い。NIT-1 を §10 に登記すれば (データ修正は不要) commit してよい。
