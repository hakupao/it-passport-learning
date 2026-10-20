# B4 (2013h25h) Rule D 独立審査 — S129

- Reviewer: `b4-reviewer` (`pr-review-toolkit:code-reviewer`, opus)。Writer = `b4-fixer` (executor)。別 subagent_type、別 context。
- 対象: 未 commit の `data/ip/quiz/{questions.json, translations/2013h25h.json, explanations/2013h25h.json}`、記録 `evidence/quiz_B4_2013h25h_S129.md`、是正器 `scripts/quiz-fidfix-S129-b4.mjs`。
- 本審査は read-only (データ・スクリプト・git 不変更)。HEAD 版を scratchpad に退避し、field 単位の差分を自作スクリプトで取った。

## 判定: **PASS-with-notes** (MAJOR 0 / MINOR 0 / NIT 3)

## 1. git diff の説明可能性

| 検査 | 結果 |
|---|---|
| `questions.json` 変化 field | **23** (11 題: q004 q036 q037 q055 q068 q069 q084 q087 q088 q093 q100)。2013h25h 以外の変化 **0** |
| `translations/2013h25h.json` 変化 field | **24** (stem_jp_clean 8 + zh/en 16)。追跡下の他 exam の translations / explanations 変化 **0** |
| `explanations/2013h25h.json` | final `note_jp` 変化 11 件すべて**純粋後置** (prefix 一致で検証) + `round1` publish 10 (B3 commit `3eb46ab` と同型) + q036 distractors.ウ jp/zh/en 書き直し 3。他の変化 0 |
| `correct_answer` | HEAD 比 **0 / 2900** (全題比較) |
| 論理差分 28 との対応 | diff の全 hunk が §6 の 28 論理差分 (+訳層 / 解説追随) のいずれかに 1 対 1 で対応。説明できない変化 0 |

## 2. 源 PNG との照合 (28 論理差分すべて)

源: precrop (q004 q036 q037 q055 q061 q067 q068 q069 q074 q084) + page-37 / 38 / 43 / 44 / 48 / 49 を原寸で実読。

- **q004 ア** (正解肢): 源「オフショア**ア**ウトソーシング」。是正どおり ✓
- **q036 ウ**: 源「y＝x**!**で表される」✓。解説ウの新 why_wrong (x＝3→6 / 4→24 / 5→120、実際 3 / 6 / 10) は算術正、jp/zh/en 同義、正解 ア (増分が単調増加) と整合 ✓
- **q037 ウ**: 源「上限値を300 kg，下限値を500 g」✓ (zh / en 追随も正)
- **q055** stem ×5 / 選択肢ア〜エ: 源はすべて “社員” “部署” ✓。選択肢の表 (主キー / 外部キー列) の一行化の内容も源と一致 ✓
- **q061 / q067**: 源 “売上” “顧客” / “商品” ✓。q061 売上表 6 行 (H002 K02 80 / H006 K02 50) 一致、K02=130 → イ 再導出一致 ✓
- **q068 (D-163)**: 題幹 “FW” ✓。**ア**: 図アは PC3 台→ハブ→ルータ LAN 側、TV→ルータ LAN 側直結。新ア文は図どおりで、削除された「（全機器がFW内側のLAN側）」は源に無い答え漏洩 → 削除妥当 ✓。**ウ**: 図ウは PC 2 台→ルータ LAN 側、ルータ WAN 側→ハブ、ハブに PC・TV・インターネット。新ウ文「PCをルータのLAN側に接続し，ルータのWAN側にハブを接続して，ハブにPCとTVとインターネットを接続する構成」は図に**ある接続だけ**を書き、推測の付加なし ✓ (zh / en も同内容)。解説ウ (PC2 台 / WAN 側ハブ) とも整合
- **q069 / q084 / q088 ア〜エ**: 源に空白なし ✓ (改行由来空白の除去、cosmetic)
- **q074**: 源「図の構成で，」— 「次の」は源に無い ✓
- **q087 ア〜ウ**: 源 “メールの返信” ✓ (ウ = 正解肢)
- **q093**: 源 “B14＋C2－B2” → 表示 “B14+C2-B2” (区切り “” は原典どおり、演算子は D-162 で ASCII) ✓。zh / en も “” ✓
- **q096**: 源の 4 式 “(B2＋C2)／2” “合計(D2～D13)” “D2／D$14” “F$14＊E2” → “” 区切り + ASCII 演算子 ✓。表・設定文 (F3〜F13 まで) 一致。en は A3 D-156 の除外箇所だが、源の区切りに揃える是正で矛盾なし ✓
- **q099**: 源キャプション「図2　C社サイトからのアクセスの追跡」のみ。注記削除 ✓ (D-158)。図2 言語化 12 行を矢印 12 本と照合し全一致 ✓
- **q100 ア** (正解肢): 源「電子証明書を用いて**通信**を暗号化する」✓ / **イ**: 源「OS の**名称**」✓

## 3. severity 再分類

`q074` (語の挿入)、`q099` (源に無い注記の挿入、D-158 型)、`q100 イ` (名称→名前 = 語の置換、B3 q100 と同扱い) の cosmetic → semantic はいずれも B1〜B3 §2 の規則 (語・字・文の出入り / 置換 = semantic) に合致。**同意**。`q083` ÷ 不変 (源は分数線で演算子字形なし)、〜 据え置き (記録のみ) も妥当。

## 4. 独立見落とし抽検 (writer 未読の CLEAN 8 題)

q007 / q015 / q022 / q040 / q050 / q059 / q063 / q078 (いずれも verdict=CLEAN、writer の crop 実読・標本・page 直読と非重複) の表示 jp を源 crop と逐字照合 → **見落とし 0 / 8** (読点 `，`/`, `/`、` の字種、`5%`/`5％` の幅は exam 全体型として除外)。

## 5. ゲート (reviewer が再実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran、all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped tests |
| fidfix dry-run 冪等 | ✅ applied 0 / skipped 182、files to write 0、実行後 `git status data` 不変 |

## 6. Notes

- **NIT-1** `q100` 解説 distractors.イ の本文が「OS の名前」と書く。選択肢引用ではなく解説の言い換えなので腐敗ではないが、是正後の選択肢「名称」と語が割れる (⑨ 候補)。
- **NIT-2** `q050` 表示 stem に源の行末位置での改行 (「行った。\n見積りの」) が残る。B4 の差分外・既存のレイアウト型 (A1 7.space 系)、学習者影響なし。
- **NIT-3** `q068 ウ` 新文の「PCをルータのLAN側に」は図では PC 2 台。日本語として数を明示しないだけで誤りではない。図 lane の choice_figures 化で解消予定 (記録 §11 どおり)。

MAJOR / MINOR なし。commit 可。
