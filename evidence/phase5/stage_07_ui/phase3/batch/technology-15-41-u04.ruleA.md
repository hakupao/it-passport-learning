# Rule A 全数抽検 — technology-15-41-u04 (光ディスク記録媒体 — CD・DVD・ブルーレイ)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 照合スクリプトは scratchpad `b43u04ra/copy.cjs`)。
- **Date**: 2026-11-07 (S149 第 43 批 b43)、repo HEAD `bcca0ad3` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b43-u04-a1` merge 結果、sha256 先頭 `794aa12ff8372196`)。
- **対象**: `data/ip/textbook/units/technology-15-41-u04.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (CD / CD-ROM / CD-R / DVD / DVD-ROM / DVD-R / DVD-RAM / ブルーレイディスク) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/technology-15-41-u04/v1-original.json` (用語 8 語・`term_zh`・`term_en` とも v1 と一致)。先行審査: `journal.b43-u04-a1.jsonl` (jp-review r1 REVISE → r2 PASS、loc-review r1 REVISE → r2 PASS)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 9 件 = exam 6 + mix 3、qid 付き 6 件、引用 qid 延べ 7 = 異なり 6 題)**: `questions.json` の選択肢・`correct_answer` と `translations/<exam>.json` の `stem_jp_clean` を再読 (全題 topic `technology-15-41`)。主張が正答と一致し、誤答肢を支持せず、限定条件を外していないことを 1 件ずつ確認 (§2)。
3. **quiz / challenge_questions** (quiz 13 枠 = 異なり 6 題、challenge 5 題 = 全て本文引用題): 本文と矛盾なし。2013h25h-q070 の誤答 (書込みに磁気を使う) は CD-R / DVD-R detail (レーザー光の熱で色素変質) と DVD-RAM detail (レーザー光で相変化) が否定。2023r05-q088 の誤答 DVD-RW は DVD-RAM 表の「RAM / RW = 書き換え型」行と key_points[3] で読み出し専用でないと判別できる。2012h24a-q061 / 2025r07-q075 で誤答側の CD-ROM・DVD-RAM は goals[0] と DVD-RAM points[0]・hook (主記憶の RAM とは仕組みが別) で光ディスクと判別できる。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 118 本 (派生除く) を topic 内全 35 題の題文 (stem_jp_clean) + 選択肢と 12 字連続照合 (記号・空白除去) — **カタカナ 4 字以上と英数を □ に遮蔽: 0 件 / 遮蔽なし: 0 件**。近似照合 (12 字窓の編集距離 ≤2): 1 件 = `terms[3].points[1].text_jp`「〜ても記録が消えない不揮発〜」↔ 2013h25h-q063「〜ても内容が消えない不揮発〜」(ed 2/12 ≈ 0.17)。不揮発性の標準定義の一般表現で、q063 の場面 (DRAM・ROM・SRAM・フラッシュメモリから選ぶ) や選択肢の組は一切使っておらず、本単元の引用題でもない → D-198「標準的な定義の一般表現」で偽陽性 (校正例 HIGH は場面・組合せの流用を伴うもの)。カタカナの多い文 (ブルーレイディスク・レーザー光・ハードディスク・ピット・ソフトウェア) の目視も題文の言い回しとの一致なし。
   - **(iii) 選択肢なぞり (D-208 (1))**: validate に `choice-echo` warn なし。jp-review r1 の MEDIUM (`terms[3].points[0]` が 2013h25h-q070 正答の「読取り専用 → 繰返し書込み」の列挙と構文を同順でなぞる) は、現行文「DVD の装置は 1 種類のディスク専用ではなく、書き込みの性質が異なる複数の種類のディスクを扱える」で例の列挙が消え、正答の要旨の一般表現になった → **解消**、退行なし。`terms[6].points[0]` (DVD-RAM は光ディスクで半導体メモリとは記憶の仕組みが異なる) は 2012h24a-q061・2025r07-q075 の誤答肢 DVD-RAM を打ち消す形だが、両側 (レーザー光で記録層の状態を変える / 電気回路に蓄える) を正の定義で述べる紛らわしい 2 概念の対比 (D-209 免除) で、選択肢の組 (CD-ROM・MD・USB メモリ、a〜e の 5 媒体) も順序も再現しない → (iii) に当たらない。`terms[7].points[0]` (12cm で BD > DVD > CD) は 2016h28a-q056 の選択肢 (BD-R・CD-R・DVD-R・DVD-RAM) の組・順序を使わず、世代 (規格群) 単位の一般事実。`terms[4].points[0]` は分類題 (どれが読み出し専用か) の正答を見出し語の定義として述べるもので免除内、誤答 3 種は並べない。
5. **D-195**: 結論先行 (one = 1 文 × 8、太字あり)、展開 2〜3 文、比喩・フック (§6) は語源 (Compact / ROM / Recordable / Versatile / RAM / blue ray) と別場面の比喩 (点字・製本された本・寄せ書き・ノート・ホワイトボード)、analogy 空 3 語 (DVD-ROM / DVD-R / BD; D-203 (b) 許容)。定義前使用: レーザー光・光ディスク = CD one、ピット = CD detail、記録層 = CD-R one、不揮発性 = CD-ROM detail「電源がなくても記録が保たれる」、相変化記録 = DVD-RAM detail 内で説明、半導体メモリ = u01 前提 (goals[0] で「電気回路で記憶する」と注)。**§9 禁止句 grep** (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → jp 0 件。zh / en 相当語の grep ヒット (参考 [容量参考] / choice [long-standing choice] / Examples) は全て通常の用法で偽陽性。図: CD・CD-R = flow steps 4/4、DVD-RAM (名前の末尾 × 書き込み可否) と BD (世代 × レーザー × 容量) = static table → 全て登録 6 種内。pair 配置: CD-ROM/CD-R は CD-R の後、DVD/BD は BD の後、DVD-R/DVD-RAM は DVD-RAM の後、各組 key 行あり。
6. **D-200**: 考点数 1/1/1/2/1/0/2/1 (≤3 ✓)、各 JP 1 文・字数 32〜68 (≤100 ✓)。**framing 件数** (全考点、`pointFraming` の語群で grep): jp 0 / zh 0 / en 0 (上限 2)。D-197 羅列 = validate 0。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (「だけ」「できない」の照合): CD-ROM「書き込みも消去もできない」と CD-R「消すことも上書きもできない、未記録領域へは追加できる」は pairs[0]・overview と一致; DVD-R「書いた部分は消せない」と pairs[2].rows[0] 一致; key_points[3] の末尾規則は「だけ」を付けず、BD-RE (BD detail) と矛盾しない → 不整合 0。書き方 8 → L2・L3。書き方 9 (限定条件) → §2。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致 (parity 34 locations 0 diff)。`[[jp:]]` 原語 7 種のうち 6 種 (光ディスク / 記録層 / レーザー光 / 不揮発性 / 半導体メモリ / ブルーレイディスク) は jp 本文に実在、`読出し専用` のみ jp 本文は「読み出し専用」表記 → L6。one_zh / one_en の見出し語 `[[jp:]]` (D-202): 見出し語が英字略称で zh・en も同綴りの 7 語 (CD〜DVD-RAM) は併記不要、ブルーレイディスクは one_zh / one_en とも併記あり。loc-review r1 の MEDIUM 2 件 (zh「追记型」→ 現行「一次写入型」で本体から消滅 [残るのは v1 不変の `unit_summary_zh`「可追记」のみ → O1]; CD one_zh「CD（光盘，…）」の同語反復 → 現行「CD（Compact Disc，激光唱片）」) は**解消**、退行なし。r1 LOW の「无限次」「完全不同 / entirely」も消滅。
9. **D-205 / 規格値の一次資料照合** (容量・波長を具体値で述べるため): DVD — Ecma-267 3rd ed. (2001) §7: 120 mm、片面 1 層 nominal capacity 4,7 Gbytes・片面 2 層 8,5 Gbytes、波長 650 nm ± 5 nm (PDF の本文抽出で確認) → one「片面 1 層で約 4.7GB」・detail「2 層で片面約 8.5GB」「赤色」一致。CD — Ecma-130 2nd ed. (1996): 120 mm disk、波長 780 nm ± 10 nm (近赤外) → 「直径 12cm」「赤外線に近い光 (波長が最も長い)」一致。容量 650〜700MB は Ecma-130 に明記がない業界の公称値 (74 分 / 80 分盤) で、「約」付きで述べており正しい。「CD の約 7 倍」は 4.7GB ÷ 650〜700MB ≈ 6.7〜7.2 で妥当。BD — 創設メンバー Panasonic の仕様表 (BDA 白書本文は取得できず): 120 mm、405 nm (青紫色)、片面 1 層 25GB・片面 2 層 50GB → one・detail・表一致 (BDXL の 1 層高容量は jp-review r2 で LOW 記録済み、IT パスポートの範囲外)。これらは改訂文書の「構成要素の数・名称」ではないため D-205 の版表記の要件対象外、値は一次資料と一致。D-210 (改正前文言の題) 該当なし。
10. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | CD | OK — mix 1: CD は規格群の名前で CD-ROM / CD-R など書き込み性質の違う種類を含む — 正しい。flow 4 段 (回転 → レーザー → 反射の強弱 → 0/1) は one・detail と一致。容量・波長は §1-9 で一次資料一致。hook「レコード盤より小さい」— 事実 | OK | OK (hook_zh の warn は偽陽性、§3 L1) | L1, L7 |
| 2 | CD-ROM | OK — mix 1: 製造時に内容が決まる / CD-R は利用者が空ディスクに書く — 正しい。detail の型押し・不揮発は正しい | OK | zh「删除」(消去) は L8 | L8 |
| 3 | CD-R | OK — exam 1 / 1 題: 書き込みはレーザー光の熱で記録層の色素を変質 (2014h26a-q065 正答エ 光; 誤答 音・磁気・電気を支持しない)。detail「未記録領域へは追加できる」= 追記型の正しい説明 | OK (書き込み機構の言い回しが図 caption 2〜3・detail・考点に重なる → L4) | OK | L4 |
| 4 | DVD | OK — exam 2 / 2 題: DVD 装置は書き込みの性質が異なる複数種のディスクを扱える (2013h25h-q070 正答エ; 正答の「など」は「複数の種類」で開いたまま、閉じていない) / DVD は不揮発性 (2012h24a-q058 正答ウ = ②DVD・④・⑤; 考点は DVD のみ述べ、①③ の扱いに触れない)。容量・波長は Ecma-267 一致 | OK (r1 MEDIUM 解消、§1-4) | zh「DVD 设备」(en は drive) → L8 | L5, L8 |
| 5 | DVD-ROM | OK — exam 1 / 1 題: 読み出し専用の DVD (2023r05-q088 正答ウ)。detail の 4.7GB・CD-ROM より大きい — 正しい | OK (考点が one・hook の言い直し → L3) | `[[jp:読出し専用]]` → L6 | L3, L6 |
| 6 | DVD-R | OK — 考点なし (0 件、D-200 下限なし)。detail (色素を熱で変質・消せない・片面 1 層 4.7GB) は正しい。quiz 2023r05-q088 / 2016h28a-q056 と矛盾なし | OK | OK | — |
| 7 | DVD-RAM | OK — exam 1 / 2 題: レーザー光で記録層の状態を変える光ディスクで、半導体メモリとは記憶の仕組みが異なる (2012h24a-q061 正答エ USB メモリ / 2025r07-q075 正答ウ c・d・e; どちらも DVD-RAM を除外する正答と一致、§1-4 で (iii) 非該当) / mix: DVD-RAM は同じ場所を何度でも書き直せる、DVD-R は書いた部分を変えられない — 正しい。detail の相変化 (結晶 / 非結晶) と DVD-RW の言及、HDD 的な小単位アクセス — 正しい。hook は主記憶 RAM との同一視を明示的に否定 (r1 LOW 解消) | OK | OK | L2 |
| 8 | ブルーレイディスク | OK — exam 1 / 1 題: 直径 12cm 同士なら容量は BD > DVD > CD (2016h28a-q056 正答ア BD-R; 限定条件「直径 12cm」保持。DVD-RAM 両面 9.4GB でも BD 1 層 25GB 未満で矛盾なし)。detail の 2 層 50GB・BD-ROM / BD-R / BD-RE (「といった」で開いた列挙) — 正しい | OK | OK | L2 |

**単元レベル**: goals 3・overview_cols 2 (世代 [容量] / 利用者の書き込み)・overview_rows 8 (CD / DVD / BD 行は「種類によって異なる」で規格群と種類を正しく区別)・pairs 3 組 (各 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge 5 題 (全て引用題、§1-3)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (全て記録のみ)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW 記録のみ (偽陽性) | `terms[0](CD).hook_zh` | validate warn `zh-term レコード → 记录 not in the zh text`。jp「それまでのレコード盤より」は音楽用のアナログ円盤 (vinyl record) で、`zh_terms.json` の「レコード → 记录」はデータベースのレコード (行) の意味。en も "vinyl records"。ここで「记录」を入れると誤訳になる → 現行「黑胶唱片」が正しく、**记录 は不要 = warn は偽陽性** (loc-review r1・r2 の判断と一致) | 修正不要 |
| L2 | LOW 記録のみ | `terms[0].detail` / `terms[3].detail` / `terms[4].detail` / `terms[7].fig` / `pairs[1].rows[0..1]` / `terms[7].points[0]` / `key_points[1..2]`; `terms[6].fig` / `terms[6].points[1]` / `pairs[2].rows[0]` / `key_points[3]` | 書き方 8: 容量 CD < DVD < BD と波長の対比、末尾 ROM / R / RAM の書き込み可否の対比が 2 箇所を超えて出る。ただし表 (fig)・総表・key_points は D-195 §3 の構造欄で、世代・末尾の 2 軸がこの単元の学習目標そのもの。jp-review r1・r2 も LOW | 記録のみ (任意: `terms[4].detail_jp` 末尾「、同じ読み出し専用の CD-ROM より大きい」を削る — zh「，比同为只读的 CD-ROM 大」/ en ", more than the equally read-only CD-ROM" を同時に削る) |
| L3 | LOW 記録のみ | `terms[4](DVD-ROM).points[0].text_jp/zh/en` | 考点「名前の ROM が示すとおり読み出し専用の DVD」は one と hook の言い直し (D-203 §9)。事実は 2023r05-q088 と一致 | 記録のみ (分類題の判別点 [誤答 3 種の性質] を書くと (iii) に近づくため改稿しない方が安全) |
| L4 | LOW 記録のみ | `terms[2](CD-R).fig.steps[1..2]` / `detail_jp` / `points[0]` (+ `terms[5].detail`, `pairs[0].rows[1]`, `pairs[2].rows[1]`) | 「レーザー光の熱で色素を変質させて記録」が CD-R 内で 3 回、DVD-R・pairs で計 3 回 (D-203 §9) | 記録のみ |
| L5 | LOW 記録のみ | `terms[3](DVD).hook_jp/zh/en` | 「Digital Versatile Disc の略」と言い切る。当初 Digital Video Disc とも呼ばれ、規格団体は正式な展開形を定めていないとされる。一般的説明として誤りではない (jp-review r2 LOW) | 記録のみ |
| L6 | LOW 記録のみ | `terms[4].points[0].text_zh` / `text_en` の `[[jp:読出し専用]]` | `[[jp:]]` 原語が jp 本文の表記「読み出し専用」と送り仮名で異なる (jp 本文に「読出し専用」は無い)。loc-review r1 が過去問 2023r05-q088 の表記に合わせた意図的な選択で、同一語・validate jp-origin warn なし | 記録のみ (揃えるなら原語を `[[jp:読み出し専用]]` に) |
| L7 | LOW 記録のみ | `terms[0](CD).one_jp/zh/en`、`overview_rows[0].one_line_*` | CD を「直径 12cm の光ディスク」と無条件に述べる (8cm 盤もある)。単元全体が 12cm での比較に限定しており、引用題 2016h28a-q056 も 12cm 前提で実害は小さい (jp-review r2 LOW) | 記録のみ |
| L8 | LOW 記録のみ | `terms[1].one_zh`「既不能写入也不能删除」/ `terms[5].detail_zh`「无法删除」/ `pairs[2].rows[0].a_zh`; `terms[3].points[0].text_zh`「DVD 设备」 | zh の措辞: 媒体の「消去」は「擦除」が自然、「DVD の装置」は「DVD 光驱 / 驱动器」が明確 (en は drive)。意味は通じ、誤答肢寄りの読みにもならない (loc-review r2 LOW、未修) | 記録のみ (任意: 删除 → 擦除、DVD 设备 → DVD 光驱) |

**対比の出現欄 (書き方 8 の列挙)**: ① CD-ROM / CD-R (誰がいつ記録): `terms[0].points[0]`(種類の存在のみ)、`terms[1].points[0]`、`pairs[0]` → 実質 2 箇所、許容。② 容量・波長の世代比較: L2。③ DVD-R / DVD-RAM 書き直し可否: `terms[6].points[1]` (mix)、`pairs[2].rows[0]` + 構造欄 (fig 表・key_points[3]・overview) → L2。

**範囲外の観察**:
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿、B2 審査済み)。zh の「R（可追记）」は loc-review r1 が本体から除いた日式語だが、validate 対象外の v1 不変フィールド。
- O2 `source_figures[0]` = 2011h23tokubetsu-q069 (PC の省電力機能 = 休止・スリープの題) は本単元の内容 (光ディスク) と無関係。v1 から継承の topic 単位の図参照で、本文・quiz には使われていない。

確認済みで問題なし: 限定条件 (考点 6 件の qid 付き全て保持; 2016h28a-q056 の「直径 12cm」、2013h25h-q070 の「など」相当)、§9 禁止句 0、framing 0/0/0、D-197 羅列 0、D-200 (≤3 件・1 文・≤68 字)、D-198 (validate 0 / 独立 12 字 遮蔽あり 0・なし 0 / 近似 1 件は標準定義の偽陽性)、D-208 既知失敗型 (1) 選択肢なぞり — r1 MEDIUM 解消・新規なし、(2) 限定語落ちなし、(3) 別名を別物として教える箇所なし (BD = ブルーレイディスク を同一と明記)、(4) 比喩の範囲矛盾なし (点字 = 凹凸を読む、寄せ書き = 余白に追記可・消せない、ホワイトボード = 書き換え)、(5) zh / en の退行なし、(6) zh / en が誤答肢寄りに読める措辞なし、(7) 改正前文言の題なし、(8) 比喩の鍵語が他見出し語の語幹・役割と衝突する箇所なし (DVD-RAM hook の RAM は明示的に区別)、(9) hook を引用題・challenge に当てても誤答を選ばない (末尾規則 → 2023r05-q088 で ROM を選べる; RAM hook → 半導体メモリ題で DVD-RAM を除外できる)、(10) 法令・規格区分の閉じた列挙なし (BD の種類は「といった」)、図種 (flow steps ×2 / static table ×2 / 図なし ×4 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、規格値 (§1-9) の一次資料一致。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (全て記録のみ; L1 は validate warn の偽陽性判定、L2・L6・L8 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 8 用語・考点 9 件 (qid 付き 6 件)・引用 6 題 + quiz / challenge で、考点の主張は正答と一致し、誤答肢を支持する記述も限定条件の落ちも無い。先行審査の MEDIUM 3 件 (jp r1 1 件・loc r1 2 件) は全て解消・退行なし。容量・波長の具体値は Ecma-267 / Ecma-130 / BD 創設メンバー仕様と一致。validate の zh-term warn (レコード → 记录) は「レコード盤 = 黑胶唱片」の偽陽性で修正不要。B3 補丁の必須項目なし。L1〜L8 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-41-u04
✓ technology-15-41-u04 unit: 0 issues (data/ip/textbook/units/technology-15-41-u04.json), 1 warning(s)
  warn  zh-term  terms[0](CD).hook_zh  レコード → 记录 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-41-u04
✓ technology-15-41-u04 parity: 34 locations, 0 diff
EXIT=0
```
