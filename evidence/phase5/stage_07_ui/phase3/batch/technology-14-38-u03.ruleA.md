# Rule A 全数抽検 — technology-14-38-u03 (ライブラリ・API と低コード開発)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b73)、repo HEAD `ca4b2748` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b73-u03-a1` merge 結果、sha256 先頭 `d54b978609e3d8ec`)。
- **対象**: `data/ip/textbook/units/technology-14-38-u03.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (ライブラリ / API / WebAPI / ローコード / ノーコード) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。topic = technology-14-38 プログラム言語。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202 / D-203、D-204 / D-205、D-208 既知失敗型 (1)〜(10)、D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-14-38-u03/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。前段審査: `journal.b73-u03-a1.jsonl` (jp r0 → jp-review r1 REVISE [MEDIUM 1] → jp r1 → jp-review r2 PASS → loc r0 → loc-review r1 PASS)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・裏付けのない限定 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`、`summary.key_points_*`、`summary.memory_hooks_*` [「用語: 」前置き付き]) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題**: 考点 全 4 件 (exam 1 + mix 3)、qid 付き 2 件、引用 qid 異なり 2 題 (2009h21h-q060 / 2022r04-q061、ともに topic technology-14-38)。`data/ip/quiz/questions.json` から題文・選択肢・`correct_answer` を再読し、主張が正答と一致すること・誤答肢を支持しないこと・一般化 / 限定 / 限定条件落ちがないことを 1 件ずつ確認。ローコード・ノーコードは本 topic に過去問なし (freq 0)。補助として全 2900 題から ライブラリ / API / マッシュアップ / プラグイン / ローコード / ノーコード を含む題を grep (9 題) し、他 topic の題 (2011h23a-q076・2016h28a-q093 プラグイン誤答 vs プラグアンドプレイ、2021r03-q031・2023r05-q031 API エコノミー、2024r06-q019 オープン API) とも矛盾しないことを確認。
3. **quiz / challenge_questions** (quiz: ライブラリ = q060、API = q061、WebAPI = q061、ローコード / ノーコード = 空; challenge 4 題 = q060 / q061 / 2024r06-q088 / 2017h29h-q070): 本文と矛盾しないことを確認。q088 (JavaScript、正答 = ブラウザ上に動的な振る舞いを組み込める) と q070 (機械語、正答 = C などは機械語に変換されてから実行) は本単元の見出し語を問わないが、本単元に矛盾する記述はなく、u01 (JavaScript / C / Fortran) の内容で解ける → L6。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 81 本 (派生除く) を topic 内全 13 題の題文 (`stem_jp_clean` 優先) + 選択肢と 12 字連続照合 (句読点・記号・空白除去)、(a) カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外) → **0 件**、(b) 遮蔽なし → **0 件**、(c) 1〜2 字置換の近似一致 (12 字窓 Hamming ≤2) → **1 件、偽陽性**: `terms[1].one_jp`「あるソフトウェアの機能を」↔ 2009h21h-q060 の「(アプリケーシ)ョンソフトウェアの機能を」— 一般語の連なりで、題の判断項目 (組み込んで拡張 / 個別に更新・削除できる) の表現ではない。カタカナの多い文の目視: ライブラリ考点「プラグインは完成したアプリに後から差し込んで機能を足す追加部品」は q060 の特徴 (1) を一般の定義として言い換えたもので、特徴 (2) (個別の更新・影響なく削除) と選択肢の組 (スクリプト / パッチ / マクロ) は再現しない。WebAPI 考点は q061 の場面 (大学のキャンパス案内に地図を組み込む) を使わない。
5. **D-208 既知失敗型**: (1) option tracing — validate の `choice-echo` warn 0 件。q060 は分類題 (この特徴のソフトは何か) で、考点は正答 (プラグイン) を一般定義として述べ、見出し語ライブラリと両側肯定の対比にしている (D-209 免除の範囲、選択肢の語・組・順を再現しない)。q061 も分類題 (この手法は何か) で、考点は正答 (マッシュアップ) の一般定義、誤答 (シングルサインオン / デジタルフォレンジックス / トークン) に触れない → 該当なし。(2) 限定条件 — §2。(3) シラバス別名の別物扱い — なし。(4) 比喩・図と one / detail の矛盾 — なし。(5) 前回修正の zh / en 回帰 — §4。(6) zh / en が誤答肢寄りに読める — なし (q061 の誤答の語は zh / en に無い)。(7) 改正前の規定 — 法令・規格なし。(8) 比喩 / フックの鍵語が他見出し語と衝突 — API 比喩「注文票」、WebAPI 比喩「問い合わせ窓口」は単元内の他用語名ではない。ローコード / ノーコードの比喩「組立式の家具 / 完成品の家具」は u02 モジュール分割の比喩 (家具の部品) と像が近いが、モジュール分割は本単元の用語ではなく、意味も衝突しない (O2)。(9) フックを引用題に当てて誤答を選ぶ — ライブラリのフック (処理を借りる) を q060 に当てても、正答プラグインの説明 (考点) と食い違う誤答 (パッチ = 修正、マクロ、スクリプト) を選ばせない; WebAPI のフックは q061 で正答マッシュアップへ導く。(10) 法令・規格の構成員の閉じた列挙 — なし。
6. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2〜3 文 (3/2/2/2/2 文)、比喩・フック (§6 → L4)、定義前使用 (関数 = ライブラリ one で「関数などの部品」、u02 サブルーチンで既出; HTTP・URL は前提知識、jp-review r0 でも low; OS は前提)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → 本文 0 件、`freq_badge`「低頻」のみ; zh 考试 / 出题 / 必须 / 重要 0、en must / always / never 0、exam 4 件は全て "for example" と points.kind)、図の型 (API = flow static 3 ノード、WebAPI = flow steps 4; 登録内。ライブラリ・ローコード・ノーコード = 図なし)、pair 配置 (API→WebAPI は WebAPI の後、ローコード→ノーコードはノーコードの後、各組 key 行 1)。
7. **D-200**: 考点数 1/1/1/0/1 (≤3 ✓)、各 JP 1 文・字数 54〜69 (≤100 ✓、最大はライブラリ `points[0]` の 69 字)。**framing 件数** (`pointFraming` の型で目視 + validate): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 / D-205 単元全体点検**: 書き方 7 (欄同士の範囲) → WebAPI の経路の言い方が one「インターネット上」/ pairs・goals「ネットワーク越し」で揃っていない (L1)、他は不整合 0。書き方 8 → L3。書き方 9 → §2。D-205 (問題外の事実): WebAPI detail の用途は「例えば」付き、ライブラリ detail の処理例は「〜のような」付き。改訂のある文書 (規格・法令・知識体系) の構成数・名称の記述はなし。全称・排他の言い切り: ノーコード「一切書かず」「範囲に収まる」は定義そのもの、API detail「影響しない」は原則の言い方で L5、他になし。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・caption・比較行・総表セルの三語一致 (parity 24 箇所 0 diff)、`[[jp:]]` 原語 (ライブラリ / プラグイン / マッシュアップ / WebAPI / ローコード / ノーコード) が jp 本文に実在、one_zh / one_en の見出し語併記 (ライブラリ・ローコード・ノーコード = zh/en とも、WebAPI = en; API の zh/en と WebAPI の zh は jp と同表記のため併記なし — 19-51-u04 CSS と同じ扱いで validate 0)、zh 訳語 (`zh_terms.unit.json`: 库 / API（应用程序编程接口） / WebAPI / 低代码 / 无代码 / 操作系统 / 开发者 / 服务 / HTTP 一致、B6 warn 0)。loc-review r1 の low 5 件のうち 4 件が未反映 (L2 / L7)。
10. **同 topic・関連単元との整合**: technology-14-38-u01 (C / Fortran / Java / C++ / Python / JavaScript / R; Python の「ライブラリが豊富」と一致)、u02 (モジュール分割「作った部品を別のプログラムで使い回す」、サブルーチン「言語によっては関数」— ライブラリ one「関数などの部品」・detail と一致)、technology-19-51-u04 (GUI の部品 = リストボックス・メニュー、CSS、リダイレクトの URL / Web サーバ — ローコードの「画面上で部品を配置」、WebAPI の URL・HTTP 要求の記述と矛盾なし)。矛盾 0。
11. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ライブラリ | OK — mix 1 / 1 題: プラグインは完成したアプリに後から差し込んで機能を足す追加部品で、開発者が自分のコードから呼び出すライブラリとは使われ方が違う (2009h21h-q060 正答ウ プラグイン; 題の特徴 (1) ブラウザなどのアプリに組み込んで機能を拡張 と一致、誤答 パッチ・マクロ・スクリプトを支持しない)。題の「ブラウザなどの」は考点で「アプリ」と一般化され、範囲を閉じていない。他 topic のプラグイン誤答題 (2011h23a-q076 / 2016h28a-q093 = 正答プラグアンドプレイ・デバイスドライバ) とも矛盾しない (考点はアプリへの追加部品と述べ、周辺機器の自動設定とは言わない)。one・detail (文字列整形・日付計算の「ような」例、手間が減り品質をそろえやすい) は標準的事実 | OK (図なし = 定義型) | OK | L3 (detail 3 文目の対比) |
| 2 | API | OK — 考点 mix 1 (qid なし): API = 呼び出しの約束事、ライブラリ = 呼び出される処理を収めた部品で指す対象が違う — 標準的事実。quiz q061 (正答マッシュアップ) は API の定義と矛盾しない。detail「取り決めを変えなければ内部を作り直しても呼び出す側に影響しない」は原則の言い方 (L5)。flow static (呼び出す側 → API → 提供側) は one と一致 | OK | OK | L3 / L4 (fig) / L5 |
| 3 | WebAPI | OK — exam 1 / 1 題: マッシュアップ = 公開されている複数のサービスの機能やデータを WebAPI などで取り込み新しいサービスを作る手法 (2022r04-q061 正答エ)。題は手段を述べないが考点は「など」で開き、標準定義の範囲 (jp-review r2 も low)。題の「公開されている Web ページや Web サービス」は「公開されている…サービスの機能やデータ」に、「新しいコンテンツ」は「新しいサービス」に言い換えられているが範囲を閉じない (key_points[2] は「サービスや情報」)。他 topic の 2024r06-q019 (正答オープン API: 接続仕様を外部に公開し契約した外部事業者に利用させる) / 2021r03-q031 (API エコノミー) とも矛盾しない。flow steps 4 (要求 → 受付 → 処理 → 結果データ返却) は one・detail と一致 | OK | OK | L1 (one の経路), L2 (en), L4 (hook) |
| 4 | ローコード | OK — 過去問なし (freq 0)、考点 0。one (画面操作中心 + 必要な部分だけ少量のコード)・detail (部品の組合せで早く形に、部品で表せない処理はコードを書き足す) は標準的定義 | OK (図なし) | OK | L4 (hook) |
| 5 | ノーコード | OK — 過去問なし、考点 mix 1 (qid なし): ノーコード = コードを書かず用意された機能の範囲、ローコード = 足りない部分をコードで書き足して広げられる — 標準的事実で pairs[1].rows[0..1] と一致 | OK (図なし) | zh「业务负责人」L2 | L2 / L3 / L4 (hook) |

**単元レベル**: goals 3・overview_cols 2 (種類 / 要点)・overview_rows 5 行・pairs 2 組 (API / WebAPI 3 行 key 1、ローコード / ノーコード 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 4 件 (§1-3)。pairs[0].rows[0].a「通信の方法を限らない (同じコンピュータ内の呼び出しも含む)」/ rows[1]「そのうち Web の通信で公開されたもの」は WebAPI one と包含関係で一致。key_points[3]「画面操作中心の開発手法は、開発を速め、専門の開発者以外も開発に加わりやすくする」は両 detail と一致。事実誤りなし、三語一致。

## 3. 前段 JP / loc 審査指摘の解消確認 (回帰なし)

| 前段 | 重大度 | 箇所 | 指摘 | 現状 |
|---|---|---|---|---|
| jp-review r1 | **MEDIUM** | `key_points_jp[2]` | マッシュアップを WebAPI を使う方法だけに限る定義 (考点の「など」・q061 と範囲が食い違う) | **解消**。jp「公開されている既存のサービスや情報を組み合わせて新しいサービスを作る**マッシュアップ**では、**WebAPI** などが取り込みの手段になる。」— 定義は一般範囲、WebAPI は「など」で例示。zh「…**WebAPI** 等是引入它们的手段。」/ en "…**Web APIs** and similar means are how those are pulled in." も同範囲で回帰なし。考点 `terms[2].points[0]` 三語も「など / 等 / and similar means」保持 |
| jp-review r1 | low | `pairs[0].rows[0].b_jp` / `terms[2].detail_jp` | 「インターネット越し」「外部の事業者の機能」で経路・提供者を狭める | 一部解消: pairs は「ネットワーク越しに HTTP などで」、detail は「相手のサービスの機能」に改稿 (三語とも)。ただし `terms[2].one_*` は「インターネット上のサービス」のまま → L1 |
| jp-review r1 | low | `terms[2].fig.steps[0].caption_jp` / `detail_jp` | caption と detail 1 文目がほぼ同文 | 解消 (detail 1 文目は「受け取った依頼を処理し、結果をデータとして返す」に変更)。r2 の新 low (detail 1 文目 ↔ step 3・4 caption) は L4 に含めて記録 |
| jp-review r2 | low | `key_points_jp[3]` | 用語名・太字なし | 未修 → L7 (記録のみ) |
| loc-review r1 | low ×5 | en "The using app" / "the user" ×2、zh「重复使用」×(one・key_points・overview)、zh「业务负责人」、zh「调用后重复使用」 | 直訳調・主体の曖昧さ・語感 | 全て未反映 → L2 (建議修: 意味が変わる 2 件) / L7 (記録のみ: 語感 2 件) |

## 4. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 2)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2].one_jp` / `one_zh` / `one_en` (+ 派生 `definition_*`) | WebAPI を「インターネット上のサービス」の API と定義するが、同単元の `pairs[0].rows[0].b`・`goals[1]`・`overview_rows[2]` は「ネットワーク越し / HTTP など」で、jp-review r1 の low (WebAPI は社内ネットワークでも使われる) を受けて pairs と detail は直したのに one だけ残った。引用題・誤答を支持する読みには至らない (観点 7 の措辞級) | jp「インターネット上のサービスの機能やデータを、」→「ネットワーク上のサービスの機能やデータを、」/ zh「是把互联网上服务的功能和数据公开出来、」→「是把网络上服务的功能和数据公开出来、」/ en "is an API that publishes the functions and data of a service on the internet so they can be called over web communication such as **HTTP**." → "is an API published so that the functions and data of a service on a network can be called over web communication such as **HTTP**." (現 en は API を「公開する主体」にしており、jp「公開した API」・`overview_rows[2].one_line_en` "An API published so…" とも食い違うため同時に直す)。`terms[2].fig.steps[1].caption_*`「インターネットの向こうで」は段階図の具体場面 (典型例) として意図的に据え置く — one を「ネットワーク上」にした後も包含関係で矛盾ではない |
| L2 | LOW **建議修** | `terms[2].detail_en`、`terms[2].fig.steps[0].caption_en`、`terms[2].fig.steps[2].caption_en`、`terms[4].detail_zh` (+ 派生 `explanation_en` / `explanation_zh`) | loc-review r1 の low のうち意味がずれる 2 種が未反映: en は jp「利用する側」(呼び出すアプリ) を "the user" / "The using app" と訳し、エンドユーザー (人) と読める; zh は jp「業務の担当者」を「业务负责人」(責任者・管理職の含意) と訳す。jp は正しく、誤答肢寄りの読みではない | en `detail_en` "The user can use the other service's functions" → "The calling app can use the other service's functions" / `steps[0].caption_en` "The using app sends an HTTP request" → "The calling app sends an HTTP request" / `steps[2].caption_en` "out of the user's sight." → "out of the calling app's sight." / zh `terms[4].detail_zh`「即使是编程知识不多的业务负责人，」→「即使是编程知识不多的业务人员，」 |
| L3 | LOW | `terms[0].detail_*` 3 文目、`terms[1].points[0]`、`terms[3].detail_*` / `terms[4].detail_*` / `terms[4].points[0]` / `pairs[1].rows[0..1]` | 書き方 8: ライブラリ (部品) / API (取り決め) の対比が ライブラリ detail 3 文目 + API mix 考点 (+ goals[0] 予告・overview extra「部品 / 取り決め」) で 2 箇所。ローコード / ノーコードは pairs[1] + ノーコード mix で上限 2 に収まるが、両 detail が片側ずつ同じ点を述べる (jp-review r2 low 2 件) | 記録のみ (ライブラリ detail 3 文目は次用語への橋渡し、両 detail は各定義の中核) |
| L4 | LOW | `terms[2].hook_*`、`terms[3].hook_*`、`terms[4].hook_*`、`terms[1].fig`、`terms[2].detail_*` 1 文目 | §6: WebAPI / ローコード / ノーコードのフックは語源 (Web + API / low / no) の後半が定義の言い直し。§2: API の static flow 3 ノードは one をなぞる程度。§9: WebAPI detail 1 文目が段階図 step 3・4 の caption と同内容 (jp-review r1・r2 の low) | 記録のみ (誤学習なし、語源の手がかりは別情報) |
| L5 | LOW | `terms[1].detail_*` 2 文目 | 「取り決めを変えなければ内部を作り直しても呼び出す側に影響しない」は全称の言い切り (内部の作り直しで動作が変われば影響し得る)。カプセル化の原則としては標準的な言い方で、どの過去問の誤答も支持しない | 記録のみ (任意: jp「呼び出す側に影響しない」→「呼び出す側を書き換えずに済む」/ zh「也不会影响调用方」→「调用方也不必修改」/ en "does not affect the caller" → "does not require the caller to change") |
| L6 | LOW | `challenge_questions[2]` (2024r06-q088)、`[3]` (2017h29h-q070) | 本単元の見出し語を問わない題 (JavaScript / 機械語)。本単元に結び付く題が 2 題しかなく下限 3 を満たすため同 topic の題で補ったもの (jp-review r1・r2 low)。本文に矛盾する記述なし | 記録のみ |
| L7 | LOW | `key_points_jp[3]` (三語)、`terms[0].one_zh` / `key_points_zh[0]` / `overview_rows[0].one_line_zh` / `overview_rows[0].extra_zh[1]`、`key_points_*[2]` | `key_points[3]` は用語名・太字なし (他の要点と不揃い); zh「重复使用」はソフトウェア文脈の定着語「复用」(`unit_summary_zh` は「复用」) と不揃い、「调用后重复使用」は時間順に読める (loc-review low); `key_points[2]` は WebAPI exam 考点の言い直し (§9、r2 low) | 記録のみ (任意: `key_points_jp[3]`「画面操作中心の開発手法は、」→「**ローコード**や**ノーコード**のような画面操作中心の開発手法は、」/ zh「以界面操作为主的开发方法能」→「**低代码**、**无代码**这类以界面操作为主的开发方法能」/ en "Development methods centred on screen operations speed up" → "Development methods centred on screen operations, such as **low-code** and **no-code**, speed up") |

**対比の出現欄 (書き方 8 の列挙)**: ① ライブラリ = 部品 / API = 取り決め: `terms[0].detail` 3 文目、`terms[1].points[0]`、`goals[0]` (予告)、`overview_rows[0..1].extra[0]` (総表構造) → L3。② API = 経路を限らない / WebAPI = Web の通信: `pairs[0].rows[0..1]`、WebAPI hook (語構成の手がかり) → 許容。③ ローコード = 少量書く・広げられる / ノーコード = 書かない・範囲内: `pairs[1].rows[0..2]`、`terms[4].points[0]`、両 hook (low / no の対比手がかり、反復に数えない)、両 detail → L3。④ プラグイン / ライブラリ: `terms[0].points[0]` のみ → 許容。

**範囲外の観察**:
- O1 `unit_summary_*` は v1 と同文 (未改稿)。事実は正しい。
- O2 比喩の像の近さ: 本単元のローコード (組立式家具 + 板を切って棚を足す) / ノーコード (完成品家具を選んで並べる) と u02 モジュール分割 (板・脚・引き出しの部品で家具を組む) はどれも家具。単元をまたぐ像の重なりで、意味の衝突はない (モジュール = 交換できる部品、ローコード = 不足分を自作) ため指摘しない。

確認済みで問題なし: 前段 MEDIUM の解消 (§3)、限定条件 (qid 付き考点 2 件とも保持、§2)、§9 禁止句 grep (0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤69 字)、D-198 写し (validate 0、独立照合 遮蔽あり 0 / 遮蔽なし 0 / 近似 1 = 偽陽性)、option tracing (choice-echo 0、§1-5)、D-205 (例示に「例えば / のような」、改訂文書の構成数なし)、`[[jp:]]` 原語、zh 訳語表、図種 (flow static ×1 / flow steps ×1 / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、同 topic u01 / u02 と 19-51-u04 との整合。

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 2: L1 / L2、記録のみ 5: L3〜L7、うち L5・L7 は任意の修正案あり) |

## 6. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 4 件 (qid 付き 2 件)・引用 2 題 + 未引用の challenge 2 題 + 他 topic 関連 7 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。前段 jp-review r1 の MEDIUM (`key_points_jp[2]` のマッシュアップ限定) は三語とも解消済みで回帰なし。LOW 建議修 2 件 (L1 / L2) は補丁 (B3) で修正推奨、L3〜L7 はバッチ証拠の「未修 LOW」表へ。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-38-u03
✓ technology-14-38-u03 unit: 0 issues (data/ip/textbook/units/technology-14-38-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-38-u03
✓ technology-14-38-u03 parity: 24 locations, 0 diff
EXIT=0
```
