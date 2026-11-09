# Rule A 全数抽検 — technology-20-53-u03 (xR・没入技術とメタバース)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b74)、repo HEAD `ca4b2748` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b74-u03-a2` merge 結果、sha256 先頭 `053ddd4007d012b0`)。
- **対象**: `data/ip/textbook/units/technology-20-53-u03.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (VR / 仮想現実 / AR / 拡張現実 / MR / 複合現実 / メタバース) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。topic = technology-20-53 マルチメディア応用 (u01 色と画像表現・u02 3D と映像メディアと同一 topic、u01・u02 は prerequisite)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202 / D-203、D-204 / D-205、D-208 既知失敗型 (1)〜(10)、D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-20-53-u03/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。前段審査: `journal.b74-u03-a1.jsonl` (jp r0 → jp-review r1 REVISE [MEDIUM 2] → jp r1 → jp-review r2 REVISE [MEDIUM 1]) → `journal.b74-u03-a2.jsonl` (a1 r1 を seed に jp r0 → jp-review r1 PASS [LOW 4] → loc r0 → loc-review r1 PASS [LOW 4])。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・裏付けのない限定 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ (スクリプトで全文字列を平坦化して通読)。AR の図は v1 資産の svg static (`figures/technology-20-53-u03-t01.svg`、文字列 = 現実の風景 / デジタル情報 → 重ね合わせ表示 → AR(拡張現実)) で、one と一致。派生フィールドは validate の記法除去一致断言で 0 issues。
2. **考点 × 引用題 (考点 全 4 件 = exam 1 + mix 3、qid 付き 2 件、引用 qid 延べ 3 = 異なり 3 題)**: `data/ip/quiz/questions.json` + `translations/<exam>.json` から各題の題文・選択肢・`correct_answer` を再読 (3 題とも topic `technology-20-53`)。
   - 2016h28h-q100 (正答イ = 実環境を捉えたカメラ映像などにコンピュータの情報を重ね合わせて表示する技術; 誤答 = 仮想記憶・音声認識・AI) → AR exam 考点「現実の環境の映像や景色が見えたまま、コンピュータが作った情報はその上に加わる形で表示」と一致。題の「など」は考点の「映像や景色」で狭められていない (むしろ広い、AR の標準定義の範囲内)。
   - 2024r06-q025 (史跡にスマートフォンを向けて昔の建物の画像・説明を現実の風景に重ねる仕組み → 正答ア AR; 誤答 GUI・VR・メタバース) → 同 AR 考点と一致。題の場面 (史跡・昔の建物) は単元のどこにも使われていない (AR 例 = 道路の矢印の道案内・機械の点検手順)。
   - 2025r07-q019 (題文が事例を「AR 又は VR」に限定; VR の事例 → 正答ア = 顔を覆うゴーグル内の仮想空間で災害映像を見て避難を考える防災訓練; 誤答イ = スマホのカメラ越しに現実の自室へ家具を重ねて試し置き、ウ = 史跡に昔の建物を重ねる、エ = 図鑑に生物の動画を重ねる) → VR mix 考点「VR は視界を仮想空間の映像で満たす、AR は現実を見せたまま重ねる、現実が見えているかどうかで分かれる」で正答ア、誤答イ・ウ・エ が全て AR 側に正しく振り分けられる。**題がイ (立体の仮想家具を現実の部屋に置く) を AR として扱う点**について: AR detail「重ねる情報は文字や矢印のような平面の表示に限らず、立体の映像の場合もある」・key_points[1] で AR の範囲に立体物を含め、a1 M1 の AR 限定は解消。残る弱い手がかりは §3 L2 / L3。
   - 未引用 mix 考点 2 件 (MR / メタバース) は qid 無し: MR 考点は AR との差を「度合い」で述べ、メタバース考点は VR = 技術 / メタバース = 場を両側正の定義で述べる (2024r06-q025 の誤答肢 VR・メタバースの組を再現しない、qid も外れた [a1 r1 LOW 解消])。
3. **quiz / challenge_questions**: quiz 割当 = VR {q019}・仮想現実 {q019}・AR {q100, q025}・拡張現実 {q100, q019}・メタバース {q025}、MR / 複合現実は topic 内出題なし (freq 0) で quiz なし。challenge 3 題 (q100 / q025 / q019) は全て本文で解ける。メタバースの inline q025 は メタバースが誤答肢の題だが、メタバース one「ネット上の仮想空間 (場)」と AR one で正答に到達でき、矛盾なし。topic 外で xR 語が出る 7 題 (2017h29h-q073 / 2018h30h-q062 / 2018h30h-q084 / 2019h31h-q023 / 2020r02o-q004 / -q032 / -q065) は全て xR 語が誤答肢か一般記述 (2020r02o-q004 イ「仮想空間で現実のような体験 = 仮想現実」は VR one と一致) で、本文と矛盾しない。
4. **D-198 写し**: validate の copy guard = 0 件、`warn choice-echo` 0 行。独立照合として単元の JP 文字列 68 本 (派生・summary・overview.intro 除く) を topic 内全 10 題の題文 + 選択肢 50 本と 12 字連続照合 (句読点・記号・空白除去): **カタカナ遮蔽なし 0 件 / 遮蔽あり (カタカナ 4 字以上・英数 → □、実字 6 未満の窓除外) 0 件**。近似照合 (12 字窓の編集距離 1〜2): 1 件 = `pairs[0].rows[2].b_jp`「スマートフォンのカメラ、透過型…」↔ 2025r07-q019 イ「スマートフォンのカメラを通…」— 一般名詞句「スマートフォンのカメラ」の一致のみで偽陽性。Dice (bigram) 上位: `title_jp` ↔ q025 エ 0.46 (見出し語「メタバース」のみ)、`overview_rows[2].one_line_jp` ↔ q100 イ 0.39、`terms[2].one_jp` ↔ q100 イ 0.30 — いずれも較正値 (HIGH 例 Dice 0.52) 未満で、AR の標準定義「現実の映像にコンピュータが作った情報を重ねる」の一般表現 (D-198 対象外)。カタカナの多い文 (AR detail・メタバース detail・VR detail) を目視: スマートフォン / メガネ / ヘッドマウントディスプレイ / アバター / パソコン は一般語で、題の場面 (ゴーグル・家具・史跡・図鑑) の流用なし。VR detail の用途例「危険を伴う作業を安全に練習」は q019 正答ア (災害時の避難の防災訓練) と別場面の一般用途で (iii) の具体例流用に当たらない。
   - **(iii) 選択肢なぞり (D-208 (1))**: VR 考点は q019 (分類題「どれが VR か」) の正答内容を VR / AR の両側正の定義の対比で述べ、選択肢の語句・組・順を再現しない → D-209 の除外に当たる。AR 考点は q100 / q025 の正答のみを一般定義で述べ、誤答肢の打ち消しなし。メタバース考点は q025 の誤答肢 2 つ (VR・メタバース) を扱うが qid 無しで、両側正の定義・組 {AR, GUI, VR, メタバース} の再現なし。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 (detail 2〜3 文)、比喩 (VR = 窓のない投影の部屋、AR = 地図に重ねる透明シート、メタバース = ネット上のもう 1 つの街) は別場面の像、仮想現実 / 拡張現実 / MR / 複合現実 は analogy 空 (D-203 (b) 許容)。hook: VR / AR / MR / メタバース = 英語語源、拡張現実 = 「拡張機能」の字、複合現実 = 「複合機」の字 — 定義の言い換えでない別の手がかり (AR hook 2 文目の言い換えは L4 に記録)。定義前使用: 仮想空間 = VR one、ヘッドマウントディスプレイ = VR detail「目を覆う」で注、アバター = 総表とメタバース one では「分身の姿」と書き、detail で用語として定義 (a1 r1 LOW 解消)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → **0 件** (`freq_badge` は「低頻」)。zh・en 相当語 (必须 / 考试 / 选项 / must / exam / always / answer) → `points[].kind: "exam"` の 1 件と "only" 3 件 (VR detail「only the virtual scene」・AR analogy「only on the sheet」= 通常用法) のみで偽陽性。図: VR = flow steps 4、AR = svg static (v1 資産)、メタバース = tree static、他 4 語 = 図なし — 全て登録 FIGURE_KINDS 内。**a1 r0 の MR flow (軸のない「現実だけ → AR → MR → VR」) は削除済み** (`terms[4].fig: null`、三語共通の 1 オブジェクト)。pair 配置: VR / AR (3 行 key 1)、AR / MR (2 行 key 1)。
6. **D-200**: 考点数 1/0/1/0/1/0/1 (≤3 ✓)、各 JP 文数・字数 = VR 1 文 66 字 / AR 1 文 59 字 / MR 2 文 85 字 / メタバース 1 文 58 字 (≤2 文・≤100 字 ✓)。**framing 件数** (validateV2 `framing`): jp 0 / zh 0 / en 0 (上限 2、validate 0 issues)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ない」「限らず」の照合): VR detail「視界を仮想空間の映像だけに」「現実の景色は見えなくなる」は pairs[0].rows[0].a「見えない」・overview_rows[0] と一致; AR「平面の表示に限らず、立体の映像の場合もある」は detail と key_points[1] で一致し、pairs[1].rows[0].a「弱い (現実の映像に重ねて見せることが中心)」は「中心」で限定せず AR から立体・位置合わせを排除しない; MR は one・detail・考点・overview_rows[4]・key_points[2]・pairs[1].rows[0].b で「空間の形を読み取る / 作用し合う」が一致; メタバース「技術ではなく場」(overview_rows[6]・考点・goals[2]) と detail「VR の装置でもパソコン・スマホでも」が一致 → 不整合 0。ただし `unit_summary_*` (v1 のまま) は O1。書き方 8 (対比の出現欄) → §3 末。書き方 9 (限定条件): q100 の「など」・q019 の「AR 又は VR」の枠は保持、落ち 0。§6 → L4。§9 言い直し → L4 / L5。
8. **D-208 既知失敗型**: (1) §1-4、なし。(2) 限定条件落ち なし。(3) 別名を別物として教える: 仮想現実 / 拡張現実 / 複合現実 の one が「日本語名であり、両者は同じ技術を指す」、総表 extra「VR と同じもの」等 → なし。(4) 比喩・図の範囲: AR analogy の透明シートは平面の印・道順の像だが、「地図は消えずに見える」= 現実を残す点だけを運び、detail の「立体の場合もある」を否定しない (記録不要)。VR analogy (投影の部屋) は HMD 限定を言わず detail の「など」と両立。(5) zh / en の後退: a1 の 3 MEDIUM の論点を三語で確認 — AR を文字・画像に限る語なし (zh「不限于文字、箭头这类平面显示，也可能是立体影像」/ en "not limited to flat items … can also be a 3D image")、MR 図なし、AR 考点の「手持ちの端末だけで使える」型の機器結論なし (jp / zh / en 全文 grep: 手持ち・端末だけ・handheld・only a phone・仅用手机 等 0 件) → 後退なし。(6) 訳語が誤答肢に寄る: なし (zh「元宇宙」= q025 エ の訳と同じ見出し語)。(7) D-210 改正: 該当なし。(8) 比喩・hook の鍵語が他の見出し語: 複合現実 hook の「複合機」は単元の見出し語でない。(9) hook / 手がかりを引用題の場面に当てる: VR / AR の決め手「現実が見えているか」を q019 の 4 肢に当てると正答アのみ VR → 正しい。MR の手がかり (空間の形を読み取る・机の上に載せる) を q019 イ (現実の部屋に家具を試し置き) に当てると MR と読める余地があるが、題は VR を問うのでどの手がかりでも誤答を選ばない → L2 / L3 (LOW)。(10) 閉じた列挙: 該当なし (メタバースの入り口・活動は「など」付き)。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・caption・表セル・比較行の三語一致 (parity 29 箇所 0 diff)、`[[jp:…]]` 原語 8 種 (仮想現実 / 拡張現実 / 複合現実 / メタバース / アバター / 仮想 / 拡張 / 複合) が jp 本文に実在、one_zh / one_en の見出し語 `[[jp:]]` = 日本語見出し語 4 語 (仮想現実 / 拡張現実 / 複合現実 / メタバース) に有り、VR / AR / MR は三語同表記で不要。zh 訳語は `zh_terms.unit.json` (虚拟现实 / 增强现实 / 混合现实 / 元宇宙 / 头戴式显示器 / 智能手机) と一致 (validate B6 warn 0)。訳の細部 → L1 / L7 / L8 / L9。
10. **同 topic 他単元との整合**: u01 (加法混色・減法混色・dpi・ppi・CG; CG detail の 3 次元 CG・プロジェクションマッピング) と u02 (3D・シミュレーター・ゲーム・4K/8K; シミュレーター考点「決め手は表示の方法ではなく現実の代わりに試す用途」) に xR 語の記述はなく、u03 の VR detail「危険を伴う作業を安全に練習する用途」は u02 のシミュレーター (用途で定まる仕組み、3D 映像は手段の一つ) と両立 (VR = 表示・体験の技術、用途例として訓練)。u01 / u02 と矛盾する記述なし。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | VR | OK — mix 1 / 1 題: 視界を仮想空間で満たす VR と現実を見せたまま重ねる AR は「現実が見えているか」で分かれる (2025r07-q019 正答ア、誤答イ・ウ・エ = AR 側に正しく分類; 題の「AR 又は VR」の枠内で述べる)。detail「現実の景色は見えなくなる」は q019 正答の「顔を覆うゴーグル」と一致。flow steps 4 (センサ → 描画 → 表示 → 没入感) は detail と一致 | OK | OK | なし |
| 2 | 仮想現実 | OK — VR の日本語名・同じ技術 (D-208 (3) なし)。quiz q019 | OK (analogy 空・hook 無し = a1 r1 LOW の定義言い換え hook 削除) | L8 | L8 |
| 3 | AR | OK — exam 1 / 2 題: 現実の映像・景色が見えたまま情報が上に加わる (2016h28h-q100 正答イ / 2024r06-q025 正答ア; q100 の「など」保持)。a1 M1 (文字・画像への限定) は detail・key_points[1] の「立体の映像の場合もある」で解消、a1 r2 M1 (「手持ちの端末だけで使える」結論) は考点から削除され三語とも機器の結論なし | OK (svg static v1 資産) | OK | L4 |
| 4 | 拡張現実 | OK — AR の日本語名・同じ技術。hook「拡張機能」の字 | OK | L8 | L8 |
| 5 | MR | OK (出題なし) — mix: AR も MR も現実の上に表示、MR は空間の形の認識・現実の物との作用・操作の度合いが強い。事実として一般に認められた区別で、AR を排除する語は「度合い」で緩められている。a1 M2 (軸のない flow) は図削除で解消 | OK (図なし) | L7 | L2 (建議修)・L3・L7 |
| 6 | 複合現実 | OK — MR の日本語名・同じ技術 | OK | L1 | L1 (建議修)・L8 |
| 7 | メタバース | OK — mix: VR = 体験させる技術 / メタバース = 多人数が集まる場 (qid 無し、両側正の定義)。detail「VR の装置で入ると没入感が高まるが、パソコンやスマートフォンからも」は q025 で VR とメタバースが別の誤答肢である扱いと一致。tree static (参加者・活動・入り口) | OK | L9 | L6・L9 |

**単元レベル**: goals 3 点 (VR / AR の区別・MR の度合い・メタバース = 場)・overview_cols 2 (現実の景色 / 要点)・overview_rows 7 行・pairs 2 組 (VR / AR 3 行 key 1、AR / MR 2 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 3 件 (q100 / q025 / q019、§1-3)。overview_rows[6].extra「入り口の機器による / 技術ではなく場・サービス」は メタバース detail・考点と一致。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 2)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[5](複合現実).detail_en` | 「The Japanese name, which means "compound", reflects …」は日本語名 (複合現実) 全体が "compound" を意味すると読める。jp は「複合」という部分に名前の意味が表れているという内容で、同型の `terms[3](拡張現実).detail_en` は「The first word of the Japanese name means "extend"」と正確 (a2 loc-review LOW、未修)。欄同士の書き方不揃い + 軽微な意味ずれ | en のみ: before「The Japanese name, which means "compound", reflects how two different things, the real and the virtual, are combined and treated as a single space.」→ after「The first word of the Japanese name means "compound", reflecting how two different things, the real and the virtual, are combined and treated as a single space.」(jp / zh は変更なし) |
| L2 | LOW **建議修** | `terms[4](MR).detail_jp / detail_zh / detail_en` 1 文目後半 | MR でできることの最初の例が「仮想の物体を机の上に載せる」で、装置が空間を認識する**から**できる (= MR の働き) と読める。2025r07-q019 は現実の部屋に仮想の家具を置く事例を AR 側 (誤答イ) として扱っており、a1 M1 で問題になった「立体の仮想物を現実の空間に置く = MR」の線引きを例の側に弱く残す。題は VR を問うため誤答は招かず、pairs[1].rows[0] (key 行) の決め手は「作用し合う度合い」なので LOW。例を AR と重ならない「現実の物の陰に隠れる (前後関係)」に寄せる | jp: before「仮想の物体を机の上に載せたり、現実の物の陰に隠れて見えなくしたりできる。」→ after「仮想の物体が現実の物の陰に入ると隠れて見えなくなるなど、現実の物との前後関係まで表せる。」/ zh: before「因此可以把虚拟物体放在桌面上，或让它被现实物体挡住而看不见。」→ after「因此虚拟物体移到现实物体后面时会被挡住而看不见，连与现实物体的前后关系也能表现出来。」/ en: before「it can place a virtual object on a desk or let it disappear behind a real object.」→ after「a virtual object that moves behind a real object is hidden from view, so even which one is in front can be shown.」(派生 `explanation_*` は自動追随) |
| L3 | LOW | `terms[4].points[0].text_jp/zh/en` 2 文目、`overview_rows[4].one_line_*`、`key_points_*[2]`、`goals_*[1]` | MR の分かれ目に「装置が現実の空間の形を認識し」を並べる。実際には AR の端末も床面などを読み取ることがあり、空間の認識自体は MR だけの性質ではない (q019 イ の家具試し置きも床・部屋への位置合わせを伴う)。ただし考点・key 行・goals は「度合いが強い」で述べ、AR を排除する断定はなく、MR は topic 内出題 0 で支持・反証する題もない | 記録のみ (L2 を直せば例による排他の読みは消える。考点の「認識し」を削ると MR の one との結びが弱くなるため改稿しない) |
| L4 | LOW | `terms[2](AR).points[0].text_jp/zh/en`、`terms[2].hook_*` 2 文目 | AR exam 考点は one・detail 1 文目の言い直し (D-203 §9)、hook 2 文目「現実を消さずに上乗せするのが AR」は定義の言い換え (§6)。引用 2 題の正答と一致し写しでない (a2 jp-review LOW と同旨) | 記録のみ (a1 r2 M1 の修正として正答の核心を主文で言い切る形にした結果で、事実は正しい) |
| L5 | LOW | `key_points_*[1]`、`key_points_*[2]`、`key_points_*[3]` | 要点 2 = AR detail 2 文目、要点 3 = MR one・detail、要点 4 = メタバース one・detail の言い直し (§9)。要点 1 (略語と日本語名の対応) は単元固有の整理 | 記録のみ |
| L6 | LOW | `terms[6](メタバース).fig` (tree)、`terms[6].detail_*` 3 文目 | tree 図 (参加者・活動・入り口) は one・detail の項目分けで、図で初めて分かる構造は少ない (飾りに近い)。「入り口 = VR 装置もパソコン・スマホも」は図・detail・overview_rows[6].extra[0] の 3 箇所 (書き方 8 の反復) | 記録のみ (VR はメタバースの入り口の一つという関係を示す役はある) |
| L7 | LOW | `terms[4](MR).points[0].text_en` 2 文目 | jp は「空間の形を認識し、作用し合い、操作できる度合いが強い」の並列、en は「…recognizes the shape of real space, so virtual objects interact more…」で因果 (so) に変えている。detail と矛盾せず考点の意味は変わらない (a2 loc-review LOW) | 記録のみ (直すなら en「…recognizes the shape of real space, and virtual objects interact more with real ones and the user can handle them more freely.」) |
| L8 | LOW | `terms[1/3/5].one_zh/one_en`、`overview_rows[1/3/5].one_line_zh/en` | 「**Virtual reality** ([[jp:仮想現実]]) is the Japanese term for **VR**」型は、英語 virtual reality 自体が日本語名のように読める (zh 同型)。`[[jp:]]` 併記で意図は伝わる (a2 loc-review LOW) | 記録のみ |
| L9 | LOW | `terms[6].fig.data.root.children[1].label.zh` | 「活动：交谈、会议、各类活动、买卖等」で「活动」が見出しと項目に重なる (jp「イベント」) | 記録のみ (直すなら「…会议、展会与演出、买卖等」) |

**対比の出現欄 (書き方 8 の列挙)**: ① VR = 現実が見えない / AR = 見える: `pairs[0].rows[0]` (key)、VR 考点、overview_rows[0]/[2] extra[0]、goals[0] — goals は予告・総表は D-195 §3 の構造で、内容の繰り返しは pairs と考点の 2 箇所 → 許容。② VR 置き換え / AR 付け足し: `pairs[0].rows[1]`、overview_rows extra[1]、VR detail 2 文目 (「現実を仮想空間に置き換える技術といえる」)、AR hook — hook の語源手がかりは §6 の対比手がかりで数えず、detail 1 箇所 → 許容範囲 (記録不要)。③ AR / MR = 作用の度合い: `pairs[1].rows[0]` (key)、MR 考点、goals[1] → 2 箇所 + 予告で許容。④ VR 技術 / メタバース 場: メタバース考点、overview_rows[6].extra[1]、goals[2] → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。「VR・AR・MR … と、それらが構成するメタバースという没入空間」は、本文の「メタバース = 技術ではなく場、パソコン・スマホからも参加でき、VR 装置で入ると没入感が高まる」とやや食い違う (メタバースを xR が構成する没入空間と読ませる)。v1 フィールドで validate の対象外、事実誤りまでは至らない。次に unit_summary を改稿する機会があれば「…と、多くの人が集まるネット上の仮想空間であるメタバースを学ぶ」に寄せる余地。
- O2 独立 copy 照合の近似 1 件 (スマートフォンのカメラ) と Dice 上位 (見出し語・AR 標準定義) は偽陽性 (§1-4)。

確認済みで問題なし: a1 の MEDIUM 3 件 (AR を文字・画像に限る / MR 図の軸なし / AR 考点の「手持ち端末だけ」結論) は三語とも解消・後退なし、限定条件 (q100「など」・q019「AR 又は VR」枠) 保持、§9 禁止句 0、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤85 字)、D-198 (copy guard 0・独立照合 遮蔽あり / なし とも 0・近似は偽陽性・(iii) なし)、`[[jp:]]` 原語 (8 種実在)、zh 訳語表 (B6 warn 0)、図種 (flow steps / svg static / tree static = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、u01 / u02 との整合。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 2: L1・L2 / 記録のみ 7: L3〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 4 件 (qid 付き 2 件)・引用 3 題 (= challenge 3 題) で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1 の MEDIUM 3 件は三語とも解消し後退なし。AR / MR / VR の境界は全欄で「現実が見えるか (VR / AR)」「現実の物と作用し合う度合い (AR / MR)」に揃い、AR から立体表示を排除する語は無い。LOW 建議修 2 件 (L1 = 複合現実 detail_en、L2 = MR detail の「机の上に載せる」例) は補丁 (B3) で修正推奨、L3〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-20-53-u03
✓ technology-20-53-u03 unit: 0 issues (data/ip/textbook/units/technology-20-53-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-20-53-u03
✓ technology-20-53-u03 parity: 29 locations, 0 diff
EXIT=0
```
