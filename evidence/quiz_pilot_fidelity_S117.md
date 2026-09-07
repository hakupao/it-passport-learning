# ① pilot (2019r01a + 2024r06) 保真核験 — 10 workflow の集計 (S117)

run 一覧は S117 log §9。集計スクリプト: pilot-consolidate.mjs (双 pass の差分を field+先頭12字で同一視)。


| exam side | n | disc問 | 差分 | 双pass一致 | 正解肢上 | answer_aff | semantic | cosmetic | unreadable |
|---|---|---|---|---|---|---|---|---|---|
| 2019r01a B-sample | 20 | 1 | 1 | 1 | 0 | 0 | 1 | 0 | 0 |
| 2019r01a A | 25 | 8 | 15 | 13 | 1 | 0 | 12 | 3 | 0 |
| 2019r01a B-note | 3 | 3 | 3 | 3 | 0 | 0 | 2 | 1 | 0 |
| 2024r06 B-sample | 20 | 2 | 3 | 3 | 0 | 0 | 2 | 1 | 0 |
| 2024r06 A | 8 | 2 | 2 | 2 | 0 | 0 | 2 | 0 | 0 |

## 差分一覧
- 2019r01a-q022 [A] choice.イ semantic (gp+cr): 「オフィスの空調において、会議室やトイレの空き状況がリアルタイムに分かる。」→「オフィスの自席にいながら，会議室やトイレの空き状況がリアルタイムに分かる。」
- 2019r01a-q022 [A] choice.エ semantic (gp+cr): 「自宅の PC から事前に決めた、窓口に行かなくても自動で振替や振込を行う。」→「自宅の PC から事前に入力し，窓口に行かなくても自動で振替や振込を行う。」
- 2019r01a-q025 [B-note] choice.イ semantic (gp+cr): 「ITサービス維続ガイドライン」→「IT サービス継続ガイドライン」
- 2019r01a-q026 [A] stem cosmetic (gp+cr): 「・製品Aを1個生産するために部品Bが2個必要であり，部品Bは製品Aの生産以外には使われない。」→「・ 製品 A を1個生産するためには部品 B が2個必要であり，部品 B は製品 A の生産以外には使われない。」
- 2019r01a-q026 [A] stem semantic (gp+cr): 「・部品Bの発注は，各週の生産終了時に行い，翌週の生産開始までに入荷する。」→「・ 部品 B の発注は，各週の生産終了後に行い，翌週の生産開始までに入荷する。」
- 2019r01a-q026 [A] stem cosmetic (gp+cr): 「・部品Bの安全在庫量は，当該週の部品Bの総所要量の25%とする。」→「・ 部品 B の安全在庫は，当該週の部品 B の総所要量の25％とする。」
- 2019r01a-q026 [A] stem semantic (gp+cr): 「・部品Bの第1週の生産開始時の在庫量を100個とする。」→「・ 部品 B の第1週の生産開始前の在庫量を100個とする。」
- 2019r01a-q033 [B-note] choice.イ semantic (gp+cr): 「人間の形をしたロボットが, 銀行の窓口での接客など非定型な業務を自動で行の」→「人間の形をしたロボットが，銀行の窓口での接客など非定型な業務を自動で行う。」
- 2019r01a-q040 [A] choice.ウ semantic **正解肢** (gp+cr): 「反復的かつ滞進的な手法として定義したものである。」→「反復的かつ漸進的な手法として定義したものである。」
- 2019r01a-q040 [A] choice.イ semantic (gp+cr): 「作業内容の共通の物差しととするために定義したものである。」→「作業内容の共通の物差しとするために定義したものである。」
- 2019r01a-q045 [A] stem semantic (gp+cr): 「この作業を実現するのに適切な工程はどれか。」→「この作業を実施するのに適切な工程はどれか。」
- 2019r01a-q049 [B-sample] choice.イ semantic (gp+cr): 「各工程でプロトタイピングを実施するため，潜在している問題や要求を見つけ出すことができる。」→「各工程でプロトタイピングを実施するので，潜在している問題や要求を見つけ出すことができる。」
- 2019r01a-q050 [A] choice.ウ semantic (gp+cr): 「ISWS」→「ISMS」
- 2019r01a-q058 [A] choice.イ semantic (gp+cr): 「そのソフトウェアが使用する全てのデバイスドライバは再インストールする必要がある。」→「そのソフトウェアが使用する全てのデバイスドライバを再インストールする必要がある。」
- 2019r01a-q058 [A] choice.エ semantic (gp): 「メーカや種類を問わず全てのプリンタが使用できる。」→「メーカや機種を問わず全てのプリンタが使用できる。」
- 2019r01a-q058 [A] choice.エ semantic (cr): 「プリンタのデバイスドライバを一つだけインストールしていれば、メーカや種類を問わず全てのプリンタが使用できる。」→「プリンタのデバイスドライバを一つだけインストールしていれば，メーカや機種を問わず全てのプリンタが使用できる。」
- 2019r01a-q069 [B-note] choice.ア cosmetic (gp+cr): 「一般利用者が, 気になるニュースへのリンクやコメントなどを投稿するサービ」→「一般利用者が，気になるニュースへのリンクやコメントなどを投稿するサービス」
- 2019r01a-q070 [A] stem semantic (gp+cr): 「この手順で暗号化した結果が「EGE」であるとき，元の文字列は何か。」→「この手順で暗号化した結果が"EGE"であるとき，元の文字列はどれか。」
- 2019r01a-q079 [A] stem cosmetic (gp+cr): 「Aさんが，PさんQさん及びRさんの3人に電子メールを送信した。」→「Aさんが，Pさん，Qさん及びRさんの3人に電子メールを送信した。」
- 2024r06-q025 [A] stem semantic (gp+cr): 「史跡にスマートフォンを向けると，昔あった建物の画像や説明情報を現実の風景と重ねるように表示して，」→「史跡などにスマートフォンを向けると，昔あった建物の画像や説明情報を現実の風景と重ねるように表示して，」
- 2024r06-q035 [B-sample] choice.ウ semantic (gp+cr): 「新規性の才査に合格したものだけが実用新案として登録される。」→「新規性の審査に合格したものだけが実用新案として登録される。」
- 2024r06-q061 [B-sample] choice.エ semantic (gp+cr): 「その旨を通知する仕組みのの」→「その旨を通知する仕組みのこと」
- 2024r06-q061 [B-sample] choice.エ cosmetic (gp+cr): 「ブログの機能のーつで」→「ブログの機能の一つで」
- 2024r06-q083 [A] choice.イ semantic (gp+cr): 「91/72」→「5/72」

## verdict 不一致 (gp vs cr)
- 2019r01a-q079 gp=DISCREPANT cr=CLEAN

## 是正後の committed 層フィールド差分 (git HEAD 比、fielddiff.mjs)


## data/ip/quiz/questions.json: 36 fields
  2010h22h-q037.stem_jp
  2011h23tokubetsu-q026.stem_jp
  2011h23tokubetsu-q029.stem_jp
  2011h23tokubetsu-q057.stem_jp
  2011h23tokubetsu-q070.stem_jp
  2012h24a-q026.stem_jp
  2014h26h-q016.stem_jp
  2016h28h-q060.stem_jp
  2016h28h-q075.choices_jp.エ
  2017h29a-q058.stem_jp
  2017h29h-q002.stem_jp
  2018h30h-q048.choices_jp.エ
  2018h30h-q073.stem_jp
  2019r01a-q022.choices_jp.イ
  2019r01a-q022.choices_jp.エ
  2019r01a-q025.choices_jp.イ
  2019r01a-q026.stem_jp
  2019r01a-q033.choices_jp.イ
  2019r01a-q040.choices_jp.イ
  2019r01a-q040.choices_jp.ウ
  2019r01a-q045.stem_jp
  2019r01a-q049.choices_jp.イ
  2019r01a-q050.choices_jp.ウ
  2019r01a-q058.choices_jp.イ
  2019r01a-q058.choices_jp.エ
  2019r01a-q069.choices_jp.ア
  2019r01a-q070.stem_jp
  2020r02o-q030.stem_jp
  2021r03-q035.stem_jp
  2021r03-q045.choices_jp.イ
  2023r05-q014.stem_jp
  2024r06-q025.stem_jp
  2024r06-q035.choices_jp.ウ
  2024r06-q061.choices_jp.エ
  2024r06-q083.choices_jp.イ
  2025r07-q056.stem_jp

## data/ip/quiz/translations/2019r01a.json: 18 fields
  2019r01a-q022.choices.イ.zh
  2019r01a-q022.choices.イ.en
  2019r01a-q022.choices.エ.zh
  2019r01a-q022.choices.エ.en
  2019r01a-q026.stem.zh
  2019r01a-q026.stem.en
  2019r01a-q026.stem_jp_clean
  2019r01a-q045.stem.zh
  2019r01a-q045.stem.en
  2019r01a-q045.stem_jp_clean
  2019r01a-q050.choices.ウ.zh
  2019r01a-q050.choices.ウ.en
  2019r01a-q058.choices.エ.zh
  2019r01a-q058.choices.エ.en
  2019r01a-q070.stem_jp_clean
  2019r01a-q070.stem.zh
  2019r01a-q070.stem.en
  2019r01a-q079.stem_jp_clean

## data/ip/quiz/translations/2024r06.json: 4 fields
  2024r06-q025.stem.zh
  2024r06-q025.stem.en
  2024r06-q083.choices.イ.zh
  2024r06-q083.choices.イ.en

## data/ip/quiz/explanations/2019r01a.json: 48 fields
  2019r01a-q025.key_guard.note_jp
  2019r01a-q025.key_guard.round1.figure_derivable
  2019r01a-q025.key_guard.round1.derived_answer
  2019r01a-q025.key_guard.round1.matches_key
  2019r01a-q025.key_guard.round1.stem_corruption_suspected
  2019r01a-q025.key_guard.round1.note_jp
  2019r01a-q026.key_guard.note_jp
  2019r01a-q026.key_guard.round1.figure_derivable
  2019r01a-q026.key_guard.round1.derived_answer
  2019r01a-q026.key_guard.round1.matches_key
  2019r01a-q026.key_guard.round1.stem_corruption_suspected
  2019r01a-q026.key_guard.round1.note_jp
  2019r01a-q033.key_guard.note_jp
  2019r01a-q033.key_guard.round1.figure_derivable
  2019r01a-q033.key_guard.round1.derived_answer
  2019r01a-q033.key_guard.round1.matches_key
  2019r01a-q033.key_guard.round1.stem_corruption_suspected
  2019r01a-q033.key_guard.round1.note_jp
  2019r01a-q040.key_guard.note_jp
  2019r01a-q040.correct.jp
  2019r01a-q040.correct.zh
  2019r01a-q040.correct.en
  2019r01a-q040.key_guard.round1.figure_derivable
  2019r01a-q040.key_guard.round1.derived_answer
  2019r01a-q040.key_guard.round1.matches_key
  2019r01a-q040.key_guard.round1.stem_corruption_suspected
  2019r01a-q040.key_guard.round1.note_jp
  2019r01a-q050.key_guard.note_jp
  2019r01a-q050.distractors.ウ.jp
  2019r01a-q050.distractors.ウ.zh
  2019r01a-q050.distractors.ウ.en
  2019r01a-q050.key_guard.round1.figure_derivable
  2019r01a-q050.key_guard.round1.derived_answer
  2019r01a-q050.key_guard.round1.matches_key
  2019r01a-q050.key_guard.round1.stem_corruption_suspected
  2019r01a-q050.key_guard.round1.note_jp
  2019r01a-q069.key_guard.note_jp
  2019r01a-q069.key_guard.round1.figure_derivable
  2019r01a-q069.key_guard.round1.derived_answer
  2019r01a-q069.key_guard.round1.matches_key
  2019r01a-q069.key_guard.round1.stem_corruption_suspected
  2019r01a-q069.key_guard.round1.note_jp
  2019r01a-q070.key_guard.note_jp
  2019r01a-q070.key_guard.round1.figure_derivable
  2019r01a-q070.key_guard.round1.derived_answer
  2019r01a-q070.key_guard.round1.matches_key
  2019r01a-q070.key_guard.round1.stem_corruption_suspected
  2019r01a-q070.key_guard.round1.note_jp

## data/ip/quiz/explanations/2024r06.json: 4 fields
  2024r06-q035.distractors.ウ.jp
  2024r06-q083.distractors.イ.jp
  2024r06-q083.distractors.イ.zh
  2024r06-q083.distractors.イ.en

## Rule D

- reviewer-pilot-fix (oh-my-claudecode:code-reviewer): PASS-with-notes。24 差分全件が源と一致 (5 件は源画像を独立実読)、zh/en 22 フィールド忠実、解説 2 件正、round1 バイト一致。P1×3 + P2×1 の波及漏れ → `quiz-fidfix-S117-pilot2.mjs` で是正 (S117 log §10b)。
