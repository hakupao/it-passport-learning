# UI/UX 再設計 — 参考製品調査 (S132)

- 実施: background agent (general-purpose / opus)、web 調査のみ、repo 非変更。2026-10-23。
- 位置付け: 提案の素材。ここに書かれた推奨はユーザー未承認。⚠ 印は未核実・厂商自述・古い資料。

## 一、参考製品

| 製品 | 借りられる具体パターン | 出典 | 注意 |
|---|---|---|---|
| 過去問道場 (itpassportsiken.com) | 分野別出題・ランダム出題・ログインで学習履歴と苦手分野 | https://www.alc.co.jp/license/?p=20018 / https://library.libecity.com/articles/01JN2QD76CKJ5B5W90Y8PZC214 | ⚠ 直接取得 403、設定項目・解説表示時機は未核実 |
| IPA CBT 疑似体験ソフト | 各題「あとで見直すためにチェックする」+「回答見直し」一覧 (チェック済・未回答) +「試験終了」後に総正答数・分野別正答数・正誤一覧。表示設定: 白黒反転・配色・文字 200% | https://forest.watch.impress.co.jp/docs/news/20140228_637555.html | ⚠ 2014 年記事。現行本試験は 100 問 / 120 分 |
| スタディング AI問題復習 | 正答後に「簡単 / 普通 / 難しい」自己評価 → 題ごと「理解度」(簡単で大きく上昇、誤答で小幅下降、100 超で卒業)。首页「今日取り組んでほしい問題」、1 日上限 25〜500 | https://studying.jp/function/aicrossreview_nw.html / https://studying.jp/itpassport/ | ⚠ 厂商自述 |
| Anki | Leech: 8 回忘れで leech タグ + 一時停止、以後 4 回ごと警告。推奨対処は書き換え・分割・記憶フック。反面: 「カード量に圧倒される」65.7%。load balancer で日ごとの量が平準化 | https://docs.ankiweb.net/leeches.html / https://scholarworks.indianapolis.iu.edu/items/b2220124-2b3c-4eb9-85a3-e9ad7ab41722/full / https://forums.ankiweb.net/t/anki-24-11-appreciation/53769 | |
| WaniKani | 首页 = Lessons / Reviews の 2 大ボタン + 時間別 review forecast。批判: 大イラストが数字を圧す、増え続ける queue が新規学習を萎えさせる、session summary 削除に強い反発 | https://community.wanikani.com/t/forecasting-reviews-on-preview-or-previewing-review-forecasts/41969 / https://community.wanikani.com/t/forecasting-reviews-on-the-dashboard/42305?page=5 / https://community.wanikani.com/t/already-missing-the-session-review-summary-page/61068?page=3 | |
| Bunpro | Hint ボタン (PC は Space) で段階的に訳を開示、Hide Translation、誤答を ghost review として追加 | https://community.bunpro.jp/t/how-to-make-one-type-of-hint-constant/15550 / https://cdn.bunpro.jp/support/account/Review-Settings / https://community.bunpro.jp/t/feedback-suggested-improvements-feature-request/131?page=106 | ⚠ 「SRS 段階で訳を自動で減らす」はユーザー要望 (実装未確認) |
| Satori Reader | 各文に訳・注釈。語をクリックすると「この文での義項」を表示。既知漢字にふりがなを付けない適応表示 | https://satorireader.com/features / https://blog.satorireader.com/2024/07/29/how-satori-reader-improves-automated-dictionary-lookups/ | ⚠ 文訳の既定表示/非表示は不明 |
| Readwise Reader / Daily Review | 選択 → `G` で右サイドバーに chat (選択文を自動添付)、1〜3 語は Quick Lookup を優先、`Shift+G` で文書全体、preset prompt。Daily Review は 1 件ずつ・Enter で前進・単キー操作 | https://docs.readwise.io/reader/guides/ghostreader/overview / https://docs.readwise.io/readwise/docs/faqs/reviewing-highlights | |
| Duolingo | Path = 既定ルートを示す、復習をルート内に、Tips を unit guidebook に。反発: 自由選択の喪失。Explain My Answer は **誤答後のみ**、Continue と並置、👍/👎。Practice の Mistakes。反面: Energy 制 | https://blog.duolingo.com/new-duolingo-home-screen-design/ / https://piunikaweb.com/2022/11/22/duolingo-app-update-with-path-ui-faces-backlash-from-users/ / https://blog.duolingo.com/duolingo-max / https://blog.duolingo.com/guide-to-duolingo-practice-hub/ / https://www.androidauthority.com/quitting-duolingo-energy-system-3599842/ | ⚠ Max は 2023 年の記述 |
| Khan Academy | 掌握度 Familiar 50 / Proficient 80 / Mastered 100 (混合題で昇格)。hint は作答中、rationale は提出後 | https://support.khanacademy.org/hc/en-us/articles/115002552631 / https://blog.khanacademy.org/?p=963 | ⚠ 新旧ヘルプで昇格条件が不一致 |
| Linear | テーマ変数 98 → 3 (base / accent / contrast)、LCH で明度の均一な elevation、accent を中性色に滲ませない、Inter Display / Inter、厳密な整列 | https://linear.app/now/how-we-redesigned-the-linear-ui | |
| Santa TOEIC / abceed / 粉笔 / Brainscape | 理念のみ (診断・予測点・考点別練習・1〜5 自信評価) | 厂商ページ | ⚠ UI 根拠にしない |
| Jisho / LeetCode / Quizlet / Brilliant / Kahoot / Busuu | 関連弱い・根拠不足で不採用。Brilliant 長評「題が曖昧で意図を推測させる」https://cedarlila.substack.com/p/a-review-brilliant | | |

## 二、領域別の示唆 (agent の提案、未承認)

1. **IA**: 「今日」を軸に 今日 / 練習 / 教科書 / 辞典 の 4 目的地。AI 先生は上位 tab にせず文脈内で呼ぶ。学習記録は「今日」or 練習の子ページ。desktop は左の細い rail、mobile は bottom tab (M3: 2〜5 目的地; 出典 https://www.sap.com/design-system/fiori-design-android/v25-8/components/m3-standard-components/navigation-bar/usage)。既定ルートは「推奨」で「鍵」にしない (Duolingo の反発)。
2. **首页**: 主行動ボタン 1 つ (例「今日の復習 23 問 + 新しい単元 1 つ」)、試験カウントダウン 1 行、7 日 forecast (数字 + 小柱、装飾を数字より大きくしない)、弱点 Top 3 (小分類、クリックで練習)。1 日上限設定と load balance。queue 空なら「今日完了」+ 任意の追加練習。
3. **練習フロー**: 開始前 panel (範囲 = シラバス木 / 年度 / 誤答帳 / マーク題、題数、練習 / 模試)、前回条件で一键続行。一問一画面、ア〜エ固定順 (**シャッフル禁止**)、図は拡大可。練習モード = 提出直後に正解 + 理由、誤答肢の理由は折りたたみ。模試モード = IPA CBT 準拠 (見直しチェック・回答見直し一覧・終了後分野別)。キー操作 1〜4 / Enter。任意の自己評価 3 段。**セッション末の総括は必須** (正答率・時間・理解度変化・誤答一覧・誤答だけ再練習)。誤答帳 + 理解度 SRS + leech (N 回誤答で「教科書を読む / AI 先生に聞く」へ誘導)。
4. **教科書**: 単一カラム・適度な行幅、側にシラバス位置と「この単元の過去問 N 問」。単元末に「確認問題 3〜5 問」→ 誤答は単元へ戻す閉環。既読は静かに記録。
5. **辞典**: desktop は hover ≈300ms で要約カード、クリックで固定 (hover は増強のみ; https://www.patternfly.org/components/popover/design-guidelines/)。語境での義項 + 出題された過去問へのリンク。辞典ページは単一検索窓 (ja/zh/en/略語) で即時結果。
6. **AI 先生**: 誤答後のみ解説横に「AI 先生に聞く」(既定は閉)。教科書は選択 → 右サイドバー、1〜3 語は辞典優先、preset prompt (なぜ間違い / 似た問題 / 用語説明)。自由質問だけ独立入口 (今日 or 全体ショートカット)。
7. **多言語**: 日本語原文を既定、中・英は開示層 (段階開示、全体設定 常に表示 / タップで表示 / 非表示)。解説ブロック右上の ja/zh/en 分段で局所切替。
8. **視覚方向**: A 静かな道具 (Linear 系: 中性灰、単一 accent、高密度、細線) / B 紙面の読書 (Readwise・Satori 系: 暖白、明朝・セリフ本文、広い行間) / C データ前面ダッシュボード (WaniKani・Anki 系: 数字・forecast・分野ヒートマップ)。**3 theme shell は廃止し、1 設計系 + light/dark + accent + 文字サイズ/コントラスト** を推奨 (「3 shell が体験差の一因」は agent の推論)。
9. **反パターン**: 選択肢シャッフル (App Store 差評「なぜ、アイウエオがバラバラ？」https://apps.apple.com/jp/app/it%E3%83%91%E3%82%B9%E3%83%9D%E3%83%BC%E3%83%88-2025-%E9%81%8E%E5%8E%BB%E5%95%8F%E9%81%93%E5%A0%B4/id6745686211) / 設定した題数と実際の出題数の不一致 / 復習 queue 爆発 / 罰型ゲーム化 (Energy・強制 streak) / 装飾が情報を圧す / 総括ページ削除 / 曖昧な題・解説 / 中断型ポップアップ。

## 三、未核実
過去問道場の詳細 (403)、IPA CBT 現行版 UI (2014 年記事のみ)、厂商自述 5 件、Duolingo Max (2023)、Khan 昇格条件、M3 は SAP の転述、LeetCode・Brilliant の構成は出典なし、「3 shell が原因」は推論。
