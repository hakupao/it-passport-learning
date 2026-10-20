# S128 L1b — precrop 改修 (⑨ #4) / choicefig guard + EXPL・LITSUB rj() (⑨ #23)

- 担当: lane L1b (S128, D-152)。worktree branch `worktree-agent-ac32244cdd06698a5`、push なし
- 出典: `evidence/quiz_full52_summary.md` §7.1 行 4 / 行 23、U6 §4h・§11 (d)、U7 §11 ⑨ 2 件、U9 §11
- data / 既存 evidence / failures の変更: **0**。回帰と dry-run の出力はすべて repo 外 `/private/tmp/claude-501/s128-l1b/` (scratch root に main tree の
  `data/ip/exams`・`translations`・`chumon_groups.json`・`apps/web` を symlink で読み取り専用に張り、`.phase2/` だけ実ディレクトリ)
- `scripts/quiz-fidelity-machdiff.mjs` は不変 (L1a の担当)

## 1. 変更ファイル

| file | 内容 |
|---|---|
| `scripts/lib/precrop-heading.mjs` (新規) | sharp / tesseract に依存しない純粋ロジック: `pageParity` / `bucketModes` / `pickHeadMode` (S123 のページ投票を移設、挙動同一) / `chooseParityCalib` / `parseHeadingQnum` / `sameQnum` / `checkQnums` |
| `scripts/lib/precrop-heading.test.mjs` (新規) | `node --test scripts/lib/` 11 件 (U6 page-24・2009h21a page-39・2018h30h 偶数頁・OCR 誤読の実測値を固定) |
| `scripts/quiz-fidelity-prep-any.mjs` | `--precrop` の (1) 頁パリティ別較正 (2) 見出し題番号の OCR 照合 (3) `_precrop_report.json` の出力。CLI・manifest の sample 形・既存の skip 理由は不変 |
| `scripts/quiz-choicefig-D144s2.mjs` | 切り出し済みの題は再裁断せず、`figure_path` も触らない guard |

`quiz-fidelity-prep-multi.mjs` は prep-any を子プロセスで呼ぶだけなので変更不要 (引数・出力形が不変)。

## 2. precrop の改修内容

### 2.1 頁パリティ別の較正 (U7)
- pass 1 の「行の最左インク x」の pool とページ投票を **全体 / 奇数頁 / 偶数頁** の 3 系統に集め、パリティごとに `pickHeadMode`。
- 片側の頁が 5 未満、または **全体の head bucket がその側でも勝者の 80% 以上の得票** なら全体較正を使う (`chooseParityCalib`)。
  後者は実測で必要になった: 2018h30h は見出し x≈148 が bucket 境界にあり、偶数頁で 150=17p / 140=16p のほぼ同票。素朴なパリティ較正は偶数頁だけ
  head=150 にずらし、page-38 が detected 5 / expected 3 に悪化した (q085〜q087 の crop 3 件を失った。§4 の new18 列)。
- ログは従来の `precrop calib:` 行 (全体) に `calib odd:` / `calib even:` の 2 行を追加。

### 2.2 `LEFT_TOL_HI` 18→28 は**不採用** (検証の結果)
全 29 exam で 4 通りを回した (§4)。28 は crop 純増 (old 2542 → old28 2566) だが、
- 旧版で通っていた頁に page_mismatch を**新たに起こす** (2012h24h 3 / 2014h26a 1 / 2015h27a 3 / 2017h29a 2 / 2018h30h 3 / 2019r01a 2 / 2022r04 2 / 2024r06 2 / 2025r07 5 = 計 23 crop 喪失)。
  許容窓が body 側に伸び、字下げ行・表罫線を見出しとして拾う。
- **2025r07-q071 で個数一致のまま誤帯** (帯の高さ 756 → 488px。偽見出しを 1 本拾い、本物を 1 本落とした) — U6 と同型の危険を新たに作る。
- パリティ別較正のほうが 2022r04 を完全に救う (64 → 96)。28 の利得の大半は B track の旧 exam (2010h22h +7、2011h23tokubetsu +5) で、そこは
  頁ごとの位置ずれが原因 (§6 OI-1) なので許容幅で吸収するのは筋が悪い。→ **18 のまま**。

### 2.3 見出し題番号の OCR 照合 (U6)
- 個数一致のページだけ、各見出し帯の左端 (最左インク − 6px 〜 body モード + 40px) を `tesseract - - -l jpn --psm 7` (stdin) で読む。
  等倍 → 2 倍 → 2 倍 2 値化 の順に試し、期待番号と一致した時点で止める (tesseract は鮮明な「問34」でも空文字を返すことがある: 2013h25a page-12)。
- 題番号は「先頭 3 字以内に始まる数字群」(`parseHeadingQnum`)。「問」字は 間 / 同 / 向 / 闘 / 則 / 癌 に化けるので字は問わない。
  先頭に数字が無い読み (`〔ストラ…`、空文字) は null。
- 照合 (`checkQnums`): 完全一致、または **書体由来の数字誤読** (実測 0↔9 ×5・0↔6・3↔8、例 `問19` = 問10、`問199` = 問100) なら一致。
  それ以外の番号 = **誤帯の疑い** (番号差の大小は問わない。bank の page_image が 2 頁以上ずれても個数は一致しうる)、
  null = **見出しであること自体が未確認** → どちらもそのページの全問を `qnum_mismatch` で skip (安全側)。
  桁落ち (`問1` = 問11) も安全側 skip になるが、3 段 cascade 後の全 29 exam では 0 件。
  (途中版は番号差 > 5 を noise として素通ししていた。Rule D 前の自己点検で「2 頁以上のずれ」を取り逃がすと分かり不一致に変更。final 版の全 29 exam では
  noise が 0 件だったので §4 の表は不変。2009h21a / 2022r04 / 2015h27h / 2010h22a を変更後に再実行し、crop PNG・skip 数とも同一を確認)
- tesseract が無い、または `jpn` モデルが無い環境 (`tesseract --list-langs` で確認): 警告 1 回で従来どおり個数照合のみ
  (PATH から外して確認済み、出力は旧版と同じ 2/5 crop)。
- 記録: `data/ip/quiz/.phase2/precrop/<exam>/_precrop_report.json` (較正 3 系統、頁ごとの expected / detected (top, left) / OCR 原文 / found / status / bands)。
  manifest の sample には足していない (agent に余計な情報を渡さない。prep-multi / merge-parts / machdiff は manifest しか読まないので互換)。
- 時間: 2015h27h 全 100 問で 8.5 秒 (OCR 込み)。

### 2.4 OCR 照合の精度 (final 版、全 29 exam)
個数一致した 1,102 頁・2,689 見出し: 完全一致 2,518 / 誤読組で一致 168 / 期待外の番号 0 / null 3。`qnum_mismatch` で skip した頁は 2 頁のみ。
※ cascade は期待番号と一致した時点で止まるので、これは**照合の通過率**であって OCR 単体の精度ではない (等倍 1 回だけの精度は 2022r04 で 91/97 完全一致)。

| 頁 | 読み | 判定 |
|---|---|---|
| 2009h21a page-39 (問95・問96) | `〔ストラ` / `〔ストラ` | **真陽性**: 〔ストラテジ系〕 節見出し 2 本を見出しと誤検出し、本物 (x=189 / x=144) を落として個数一致。旧版は chumon 除外で偶然 crop を配っていなかった |
| 2010h22a page-43 (問97) | `""` | **真陽性**: 検出した 1 本は y=188・高さ 44px の非見出し行。本物「問97」(y=1254, x=167) は許容窓外。q097 は chumon / merged_preamble 側で既に除外 |

### 2.5 U6 page-24 の再現
現データは pagefix 済で U6 の状態が無いので、scratch に bank の複製を作り q051 → page-23・q053 → page-24 (U6 当時の page_image) に戻して実行:

| 版 | page-24 (bank 記録 q052 / q053、実際は 問51 / 問52) |
|---|---|
| 旧版 | 個数一致 → **誤帯 2 枚を crop** (q052 の帯に問51、q053 の帯に問52) |
| 新版 | `⚠ precrop skip page-24.png [qnum_mismatch]: heading 問51/52, expected 52/53` → crop なし |

## 3. テスト

```
node --test scripts/lib/        → tests 11 / pass 11 / fail 0
```
`pickHeadMode` の S123 ケース (図枠の行数より見出しのページ数)、`chooseParityCalib` (2022r04 偶数頁はパリティ側、2018h30h はほぼ同票で全体)、
`parseHeadingQnum` の OCR 実測 14 パターン、`sameQnum` / `checkQnums` (U6 の 1 ずれは不一致、`問19`→10 は一致、2 頁ずれ [60,61] vs [52,53] も不一致、`問1`→11 は安全側の不一致、null は不一致)。
prep-any 本体は sharp + 源ページが要るので単体テストではなく §4 の全 exam 回帰で確認した。

## 4. 回帰 (全 29 exam、`all --precrop`、旧版 = HEAD `3c65c3f` の prep-any)

### 4.1 4 通りの比較 (crop 数 / page_mismatch 問数 / qnum_mismatch 問数 / skip 頁)

| 版 | パリティ | HI | 全 29 exam crop | pm 問 | qm 問 | skip 頁 | うち B 13 exam crop |
|---|---|---:|---:|---:|---:|---:|---:|
| old (HEAD) | — | 18 | 2,542 | 266 | — | 124 | 1,039 |
| old28 | — | 28 | 2,566 | 216 | — | 98 | 1,050 |
| new18 (途中版: 全体へ戻す判定なし) | ✓ | 18 | 2,591 | 217 | — | 105 | 1,059 |
| new28 (途中版) | ✓ | 28 | 2,587 | 213 | — | 103 | 1,071 |
| **final** | ✓ (+ 全体へ戻す判定) | 18 | **2,597** | **211** | 3 | 105 | **1,062** |

※ new18 / new28 は OCR 照合が途中版 (null を不一致に数えない) の時点の実行。page_mismatch と crop の比較にだけ使った。

### 4.2 final vs old (exam 別、両版で crop した問は PNG を md5 比較)

| exam | old crop | old pm | final crop | final pm | final qm | 両方 crop | byte 同一 | 帯の差 | 失った | 得た |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|---:|
| 2009h21a | 52 | 46 | 56 | 42 | 2 | 49 | 49 | 0 | 3 (q007〜q009) | 7 |
| 2009h21h | 59 | 38 | 77 | 21 | 0 | 59 | 57 | 2 (q070 508→507px、q071 503→504px) | 0 | 18 |
| 2010h22a | 74 | 23 | 74 | 23 | 1 | 74 | 74 | 0 | 0 | 0 |
| 2011h23tokubetsu | 68 | 32 | 69 | 31 | 0 | 63 | 63 | 0 | 5 (q004/q005/q073〜q075) | 6 |
| 2022r04 | 64 | 36 | **96** | **3** | 0 | 64 | 64 | 0 | 0 | **32** |
| 他 24 exam | 2,225 | 91 | 2,225 | 91 | 0 | 2,225 | 2,225 | 0 | 0 | 0 |
| **計** | **2,542** | 266 | **2,597** | 211 | 3 | 2,534 | 2,532 | 2 | 8 | 63 |

- 指定 3 exam: **2026r08 90 → 90 (pm 9 → 9、90 枚 byte 同一)**、**2022r04 64 → 96 (pm 36 → 3、既存 64 枚 byte 同一)**、**2019h31h 96 → 96 (byte 同一)**。
  2022r04 の残り page_mismatch は page-19 (奇数、左余白 x≈30 の汚れで問40 の見出しが落ちる、U7 §11 の別原因) の 3 問。
- 帯の差 2 件 (2009h21h) は較正 head が 1 bucket 動いたことによる 1px の境界差。内容は同じ帯。
- 失った 8 件は 2009h21a / 2011h23tokubetsu のパリティ較正が、頁ごとにばらばらな見出し位置の一部を窓から外したもの (§6 OI-1)。誤帯ではなく安全側の skip。

## 5. B track 向け dry-run (2009h21a〜2015h27h の 13 exam、final 版)

| exam | crop / 100 | page_mismatch 問 | qnum_mismatch 問 | chumon | merged_preamble |
|---|---:|---:|---:|---:|---:|
| **2015h27h** | **93** (旧 93) | 3 (page-08 の 1 頁) | 0 | 4 | 0 |
| **2009h21h** | **77** (旧 59) | 21 (11 頁、うち page-35〜44 の 8 頁が detected 0) | 0 | 0 | 2 |
| 2009h21a | 56 (旧 52) | 42 | 2 | 0 | 0 |
| 2010h22a | 74 (旧 74) | 23 | 1 (= q097、旧版では chumon で除外) | 0 | 2 |
| 2010h22h | 81 (旧 81) | 19 | 0 | 0 | 0 |
| 2011h23a | 86 (旧 86) | 12 | 0 | 0 | 2 |
| 2011h23tokubetsu | 69 (旧 68) | 31 | 0 | 0 | 0 |
| 2012h24a | 89 | 4 | 0 | 7 | 0 |
| 2012h24h | 92 | 0 | 0 | 8 | 0 |
| 2013h25a | 92 | 1 | 0 | 5 | 2 |
| 2013h25h | 83 | 4 | 0 | 12 | 1 |
| 2014h26a | 84 | 4 | 0 | 12 | 0 |
| 2014h26h | 86 | 2 | 0 | 12 | 0 |
| **計** | **1,062** (旧 1,039) | 166 | 3 | | |

2010h22a / 2010h22h / 2011h23a と 2012h24a 以降の計 10 exam は旧版と crop 集合が同じで、PNG も byte 同一。skip の大半は 2009h21a / 2009h21h / 2010h22a / 2010h22h / 2011h23tokubetsu の 5 exam に集中。

## 6. 未解決 (open issues)

- **OI-1 旧 exam の頁ごとの見出し位置ずれ** (B track に直接効く): 2009h21a の OCR 確認済み見出し x は頁ごとに 146〜206 とばらばらで、パリティとは無関係
  (例 page-04 = 154、page-06 = 176、page-28 = 146、page-29 = 180、page-35 = 206)。exam 単位でもパリティ単位でも 1 つの head モードでは覆えない。
  案: 頁ごとに見出し候補を広い帯で拾い、OCR で「問 + 期待番号」と確認できた行だけを見出しとする (今回の OCR 照合を検出側にも使う)。今回の範囲外として未実装。
- **OI-2 左余白の汚れ**: 2022r04 page-19 (x≈30)、2009h21a page-06 (x=109)。見出し行の minLeft を行全体で取るため窓から外れる。
  `xlo` より左の少量インクを無視すれば直るが、表罫線の誤検出が増える可能性があり未検証のため触っていない。
- **OI-3 tesseract 依存**: OCR 照合は `tesseract` + jpn traineddata があるときだけ働く (`--list-langs` で両方確認)。無い環境では従来の個数照合に落ちる
  (誤帯の検出力も旧版並み)。`CONFUSABLE` (0↔9 / 0↔6 / 3↔8) は 2022r04 の実測から決めた値。0↔9 を許すため、2 桁目以降が 0/9 だけ違う
  誤帯 (例 期待 50 に対し実際 59) は検出できない。隣接頁ずれ (差 2〜4) とは重ならない。
- **OI-4 `--only 2014h26a-q086` は今も throw**: 名指しは意図的な再裁断の経路として残した。複合 PNG は D-144 段 3 ii で共有図 (図1) に置き換わっているので、
  作り直すなら SPEC 側の入力 (旧複合図 `.pre-D144s3ii.bak` は同一 byte で使えない) から決め直す必要がある。

## 7. ⑨ #23

### 7.1 `quiz-choicefig-D144s2.mjs` の guard
- 4 枚の `figures/<id>-c{A..D}.png` が揃い、bank の `choice_figure_paths` が期待値と一致する題は**再裁断しない** (`--only <id>` で名指ししたときだけ従来どおり裁断)。
- 調べて分かったこと: **guard が無いまま `--only` 無しで実行すると、2014h26a-q086 の `figure_path` を null に戻していた** (dry-run で applied 2)。
  q086 は D-144 段 3 ii (S117) で共有図 (図1 アローダイアグラム) を `figure_path` に戻しており、選択肢図と共存している
  (`evidence/quiz_chumon_D144s3ii_S117.md` 行 36)。throw が先に起きていたので実害は出ていなかった。→ 切り出し済みの題は `figure_path` も触らないようにした。
- 確認 (scratch root、`--dry-run`、data は読むだけ):
  - `--only` 無し: 6 題すべて「切り出し済み」→ **applied 0** (改修前: q086 で throw)
  - `--only` で 2014h26a-q046 / 2012h24a-q002 / 2016h28a-q050 / 2018h30h-q005 / 2022r04-q032: 各 **applied 0** (再裁断の経路は不変)
  - `--only 2014h26a-q086`: 従来どおり throw (OI-4)

### 7.2 EXPL / LITSUB の独立 `rj()` — **コード変更なし (S126 U10 で解消済み)**
- U9 (`quiz-fidfix-S125-u9.mjs`) の指摘は、U10 の雛形 (`quiz-fidfix-S126-u10.mjs` 冒頭 (3)、`EXPLDOC` + `expl(id)` で id ごとに 1 回だけ読み、最後にまとめて書く) で
  解消済み。U11 (`quiz-fidfix-S127-u11.mjs`) も同じ形。共用の適用器 `quiz-fidfix-repair-apply.mjs` も `explDocs` Map で file ごとに 1 回だけ読む。
- U9 の脚本は適用済みの単発脚本で、id の重なりも無かった (U9 §11) ので、手を入れても何も変わらず履歴を書き換えるだけになる → 触っていない。
  summary §7.1 #23 の後半は「解消済み (S126 U10)」として閉じてよい — ただし閉じるかどうかは orchestrator / ユーザーの判断。

## 8. 再現コマンド

```
node --test scripts/lib/
# scratch root (data は main tree への symlink、書き込みは .phase2/ のみ) で:
node scripts/quiz-fidelity-prep-any.mjs <exam> <label> all --precrop
node scripts/quiz-choicefig-D144s2.mjs --dry-run
```
比較用の補助スクリプトと全ログ: `/private/tmp/claude-501/s128-l1b/` (`run.sh`、`diag/compare.cjs`・`ocrstats.cjs`・`totals.cjs`・`mku6.cjs`、`logs-{old,old28,new18,new28,final}/`)。
