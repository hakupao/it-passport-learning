# 失敗記録 — D-147 §6 解説層 丸数字区切り正規化 attempt 1 (Session 124, 2026-09-09)

## 入力
- 脚本 `scripts/quiz-marunum-expl-D147.mjs` (attempt 1 版): D-147 choices 脚本と同一の正規表現 `([①-⑳])([ \t　]*[,，、]?[ \t　]*)(?=[①-⑳])` を、23 問の解説 5 層 (correct / distractors / points の jp・zh・en + key_guard final note_jp) にそのまま適用。
- 対象: 20 問 / 122 field。ゲート (crosscheck / assert-clean / chumon / vitest 501 / tsc) はすべて GREEN。

## 産物
- sidecar 15 file、−122 / +192 行 (置換 122 + round1 新規 publish 10 問)。

## 技術判定
- 脚本は決定的・冪等・構造比較で「区切り以外の変化 0」(reviewer R.1 再現)。

## 業務判定 — **FAIL** (reviewer `s124-expl-reviewer`、`oh-my-claudecode:code-reviewer` opus、evidence §R)
- **MAJOR-1** (4 field、学習者表示): 正規表現は「丸数字+区切り+丸数字」しか見ないため、**別の節に属する丸数字が隣接する散文**で文の読点を列挙区切りに置換した。
  2010h22a-q097 points[1].jp/zh「④ の先行②③、⑧ の先行⑤⑥⑦」→「②, ③, ⑧ の先行」(④ の先行が 3 つに読める) / 同 dist.イ.zh「都是④，④不结束」→「④、④」(節を頓号で繋ぐ非文法) / 2018h30a-q081 dist.ウ.zh「列出了②④，②iOS 和④…」→「②、④、②iOS」(文の切れ目が消失)。
  **根本原因: 「RE は S123 と同一だから安全」は不成立。S123 の適用先 choices は裸の列挙で節境界が無く、安全性は RE ではなく入力の形が担保していた。散文に当てるには節境界の判定が要る。**
- **MAJOR-2** (1 field、内部メタ): 2019h31h-q062 final note_jp の「zh「①、③」」引用を jp 字種「①, ③」に書換 (field 名 note_jp から言語を jp と決め打ち)。note が実データと矛盾 (D-143 が防ごうとした型)。
- MINOR-1: 2010h22a-q097 note_jp の表転記 (レコード区切り「、」) が同化。MINOR-2: note_jp の字種変更だけで round1 が 10 問新規 publish され「round1 の存在 = 裁決で何かが動いた」が壊れる。
- NIT: --apply の書込→merge 順 (失敗時に部分 merge) / merge の stderr 握り潰し / evidence の計数単位混在。

## 次 attempt への入力
1. **節境界ガード**: 丸数字の連 (run) 単位で判定し、(a) 区切りが混在 (例「②③、⑧」)、(b) 同じ丸数字が run 内で重複 (例「④，④」「②④，②」) のいずれかなら**置換せず SKIP 一覧に出す** (人間確認へ)。HEAD 全文の機械走査で MIXED/DUP に該当する run = 上記 4 field + q097 note_jp の 5 件ちょうど (誤置換 4 件と完全一致)。
2. **note_jp は対象外**: 内部メタで多言語引用を含み、D-143 の round1 併記を無意味に増やす。MAJOR-2 / MINOR-1 / MINOR-2 を同時に解消。q062 note の「①③」は導出文中の引用として存置 (是正内容は note 末尾に明記済)。
3. 書込は全 exam 完了後に merge、merge の stderr は透過。
4. 巻き戻し: `.phase2` は gitignored のため HEAD sidecar の値から 122 field を復元 (scratchpad `revert_phase2_from_head.mjs`) → 再 merge で git diff 0 を確認済。
