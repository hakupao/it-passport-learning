# Adjudication — Session 110 (Phase 2 batch 9: 2014h26h / 2013h25a)

All adjudications below were made by **主 context** reading the IPA source page images directly
(2.2–3.0× crops), independently of the generator, the in-pipeline reviewer and the Rule A critic.

---

## §0 s7x display-text fidelity (run BEFORE generation — S109 What's Next #1)

Two independent passes per exam (`general-purpose` / `pr-review-toolkit:code-reviewer`).

| exam | s7x-resourced | pass1 | pass2 | agreement |
|---|---|---|---|---|
| 2014h26h | 18/100 | 8 DISCREPANT / 23 findings | 8 / 24 | **same 8 questions; 14/14 (id,field) pairs matched**, zero one-sided |
| 2013h25a | 6/100 | 1 / 2 | 1 / 2 | **identical** |

### 2014h26h — fixed (21 field-edits, `quiz-fidfix-S110-2014h26h.mjs`)

| q | field(s) | source | dataset | severity |
|---|---|---|---|---|
| **069** | stem ×3 | 60,000 時間 / 60,000 時間目 / MTTR 60 時間 | 66,000 / 69,000 / 69 | **answer_affecting** |
| 042 | choice ア (=key), イ | 「レベル**まで**要素分解**を**する」/「**外部に発注する**場合は…作成する**ので**」 | 「レベルで要素分解する」/「要素分解する場合は…作成するか自社で作成するかで」 | semantic |
| 081 | choice ア, イ (=key), ウ | 「PC 以外では使用できない」/「1対1**でなら**」/「1種類に**統一されている**」 | 「1台のPCしか」/「1対1から」/「1種類しかない」 | semantic |
| 087 | stem (図2) ×2 + 注記 ×2 | P1 = 9〜17 の 9 コマ / P2 = 12〜20 の 9 コマ / ラベル「注記」 | 各 6 コマ / ラベル「注」 | semantic |
| 088 | stem ×2 | 「特売コーナ」 | 「特売コーナー」 | cosmetic |
| **096** | stem, choice ア, イ | 「**稟議システム**」/「申請，同意，**差戻し**，承認」/「承認**までに**」 | 「ワークフローシステム」/「差戻し，」脱落/「承認まで」 | semantic |
| 099 | stem, choice ウ | 「**図1**に示す」/「c: **対策案3**」 | 「図に示す」/「c: 対策案4」 | semantic |

**q069 は本 session 最重要の保真発見**。源の 3 値はすべて 60 系で、(60,000 − 100×60)/100 = **540 = 選択肢イ = stored key**。
腐敗版では 591 (66,000 基準) / 621 (69,000 基準) となり ア480・イ540・ウ599.4・エ600 の**どれにも着地せず、
「表示上 正解が存在しない」設問**になっていた (S103 q036 / S109 q029 と同型)。

**q096 は S109 q062 と同クラス**: 稟議システムはワークフローシステムの一種なので、置換後も日本語として自然かつ
内容的に真になり、key-guard・in-pipeline reviewer・Rule A のいずれにも信号が出ない。s7x 保真核験だけが見つけられる。

### 2013h25a — fixed (4 field-edits, `quiz-fidfix-S110-2013h25a.mjs`)

q092 stem: 「**W**さん」→「**M** さん」、「最も**良い**評価」→「最も**高い**評価」 (page-38 実読で両方確証)。
いずれも設問文に閉じ、選択肢 ア案1〜エ案4 と key エ は不変 = 非 answer-affecting。

### 意図的に是正しなかったもの

- **q087 の下線** — 源は「適切でないもの」に下線があるが、本 corpus は下線表現を一切持たない
  (`questions.json` の `<u>` 出現数 = 0、否定形 stem は 9 問存在)。q087 固有の欠陥ではなく
  **全 corpus の表現規約ギャップ** → backlog。
- **q097** — ① 図1→表の線形化は Phase 1.5 が意図的に生成 (内容は図に忠実、臨界経路 14.0 = key エ)、
  ② 注記第4行「（　）内の数値は…」の脱落は、線形化で（　）表記自体が消えている以上復元すると
  存在しない記法を指す、③ 中問D 前文の非添付 = 図/シナリオ再抽出 track。
- **en の敬称** — 「Yさん」「Aさん」「Mさん」は性別中立だが en 既訳は `Ms. Y` / `Mr. A`。
  保真是正で新規に入れたものではないことを確認済 (修復 agent も保存のみ) → 訳語規約 backlog。

### 連帯修復 (zh/en)

両 exam とも生成前なので解説層は無く、訳文のみ。`quiz-fidfix-repair` → `quiz-fidfix-repair-apply`
(書込パスに LLM なし)。2014h26h = **18 フィールド / 6 問** (q088 は agent 自身が cosmetic のみと判定し 0 件)、
2013h25a = **2 フィールド / 1 問**。

---

## §1 correct_answer — 本 corpus 初の是正 (invariant「correct_answer 変更 0」を初めて破る)

2014h26h-q100 の key-guard が stored key との不一致を報告したことをきっかけに、
**answer_keys.json ↔ questions.json の全 corpus 交叉核対 (2,900 件) を初めて実施** した。
この 2 ファイルを突き合わせる検査はパイプラインのどこにも存在しなかった。

**結果 = 4 件の不一致。根本原因は 3 種類に分かれ、一律の対処は誤りだった。**

| # | 問 | questions | answer_keys | 裁決 | 処置 |
|---|---|---|---|---|---|
| 1 | 2014h26h-q100 | イ | **ア** | **questions.json が誤登録** | **是正 (イ→ア)** |
| 2 | 2009h21a-q012 | ウ | **ア** | **questions.json が誤登録** | **是正 (ウ→ア)** |
| 3 | 2009h21a-q091 | **イ** | ウ | **answer_keys.json 側が疑わしい** | 不変更・記録のみ |
| 4 | 2010h22a-q091 | エ | ア | **Phase 1 抽出欠陥 (key の問題ではない)** | 不変更・backlog 登録 |

### #1 2014h26h-q100 (page-47 実読)

源 (1) は「**2,000 件**」(dataset は 2,900 = 0→9 OCR、これも同時是正)。独立検算:
顧客コードは 6 桁だが 6 桁目はチェックディジット (上位 5 桁から従属) ゆえ自由採番は 10⁵ = 100,000 件 →
ブランドM = 5% = 5,000 件 → M の 10% = 500 件は S にも重複し移行しない → S = 2,000 − 500 = 1,500 件 →
統合後 **6,500 = ア**。

四肢はちょうど 2×2 の罠マトリクスである:

| | 重複除外 ○ | 重複除外 ✗ |
|---|---|---|
| **CD 考慮 ○** | **ア 6,500 (正解)** | イ 7,000 ← stored key |
| **CD 考慮 ✗** | ウ 51,500 | エ 52,000 |

stored「イ」は「重複を引き忘れた」典型的誤答であり、源からは正当化できない。
生成された解説は是正前から公式キー ア 前提で書かれており、key を直さなければ解説と stored key が
自己矛盾したまま配信されていた。**Rule A critic (別 agent type) も独立に ア を導出**している。

### #2 2009h21a-q012 (page-06 実読)

源の図は ①→②→③→④→**[実行計画策定]**。並べる 4 工程のうち、実行計画策定の直前 (=④) に来られるのは
「重要成功要因の抽出」だけ (CSF は戦略から抽出され実行計画の入力になる)。①〜③ の順序をどう取っても
**④ = ア** は動かない。stored「ウ」(ビジネス戦略の立案) は ③ の答え。
併せて、この問の stem には図の線形化が崩壊した残骸が入り込み、**4 択の文言がそのまま設問本文に漏れていた**
(`| @ | [ 生計画定 - ア 重要成功要因の抽出 …`) ため、`［図］ ① → ② → ③ → ④ → 実行計画策定` に置換した。

### #3 2009h21a-q091 (page-35 実読) — **answer_keys 側が疑わしい**

源の表: 前日在庫 100 / 10:00 通常 80 / 10:30 優先 10 / 11:00 通常 40。
11:00 の注文に引当可能なのは 100 − 80 − 10 = **10 = イ** で **questions.json が正しい**。
「14」を導く読み方は存在しない (「20」なら優先注文を無視した場合)。
→ answer_keys.json 側の抽出誤りと見られるが、**公式解答冊子の画像を持っていないため推測で公式記録を
書き換えない**。アプリが読むのは questions.json なので利用者影響は無い。要調査として記録に留める。

### #4 2010h22a-q091 — **key の誤りですらなかった**

dataset の **q089 と q091 は同一の題面を持つ重複**で、源 page-36 の問89 の内容が q091 にもコピーされている。
源 page-37 の**本物の問91**「次の表は，テストデータ（地区，3辺計，重量）を用いて実際にテストを行った結果の
一部である。この結果の判断として，適切なものはどれか。」(結果表 + ア〜エ) は **dataset に存在しない**。
answer_keys の「ア」はその本物の問91 に対する解答である。
ここで correct_answer を ア に変えると、**問89 の題面に問91 の答えが付く**という最悪の組合せになる。
正しい対処は Phase 1 の再抽出 (欠落 1 問の復元 + 重複の除去) → **高優先 backlog**。

---

## §2 2014h26h merge 裁決 (key-guard suspects)

generate `wf_6a2f5958-654` = 100/100・jp PASS99/CONCERNS1・tr PASS99/CONCERNS1・error 0
(424 agent / 13.18M tok / ~69 分、一発完走)。suspect 4 = q091 / q092 / q093 / q100。

**この exam には 0→9 の桁 OCR が系統的に発生している** (q069・q091 ×2・q092・q100 の計 5 箇所)。
q069 は s7x 保真核験が、残りは key-guard が捕捉した — **2 つのゲートの担当範囲が相補的**であることの実例。

| q | 源 | dataset | 是正後の独立検算 |
|---|---|---|---|
| 091 | 月間 **400** 台 / **2,000** 万円 | 499 台 / 2,090 万円 | 400P −(1,400 + 6×400)≧ 2,000 → P ≧ 14.5 万 = **145,000 = イ** = key |
| 092 | 1台 **10** 万円 | 19 万円 | 5N − 2,000 ≧ 2,000 → N ≧ 800、2,000/8,000 = **25% = イ** = key |
| 100 | **2,000** 件 | 2,900 件 | 5,000 + 1,500 = **6,500 = ア** (§1 #1) |
| 093 | — | — | benign。matches_key=true、中問C 表1 の linkage-gap のみ |

q091 / q092 は `figure_derivable=false` を維持 = **SUSPECT のまま正直に記録**する。表1 (案A/案B の固定費・変動費) は
q089 のリード文にしかなく、テキスト是正では解消しない linkage-gap だから。

---

## §3 Rule A (2014h26h) — `wf_66d1dd48-ab6`

**N=28 (全図 14 + suspect 4 + stem-corrupt 8)・accurate 27/28・severity {none 4, low 20, medium 4}
・independent_answer == stored key 28/28 (bad key 0)**。

medium 4 はすべて**解説本文ではなく key_guard の記録品質**に対する指摘で、4 件とも是正した:

- **q085 = 捏造された linkage-gap**。note が「〔データ管理要領〕は原典の別枠への参照で、枠内本文が
  未取り込み」と主張していたが、主 context が page-34 を 2.4 倍で実読したところ **問85 は当該ページに
  単独掲載され、〔データ管理要領〕は設問文中のインライン文書名にすぎず、囲み枠は原典に存在しない**。
  放置すれば後続 session が存在しない図表を探すことになるため note を訂正 (実在する cosmetic OCR 3 件は保持)。
- **q091 / q092 / q100 = sidecar の key_guard が是正前の物語のまま**。3 人の critic が独立に
  「レコードの現状と矛盾する」と指摘した。これは merge の設計に起因する (下記 §4)。

---

## §4 パイプライン是正 — merge が sidecar に publish する key_guard

`quiz-phase2-merge.mjs` は sidecar に **round-1** の key_guard をそのまま書いていた。round-1 は
「盲目導出の正直な記録」という意図だが、裁決による是正が入った瞬間に**その物語は事実と食い違う**。
2014h26h-q100 は stem が 2,000 に是正済みなのに「保存されている「2,900件」は OCR 誤り」と書かれた
note を出荷していた。

**変更**: sidecar は **final (裁決後)** の導出と note を publish し、round-1 が異なる場合のみ
`key_guard.round1` として併記する。**`suspect` の union(round1, final) 計算は一切変更していない** —
masking 防止という本来の目的はそのまま維持される。監査痕跡は gitignored な `.phase2` ではなく
**commit される成果物の中に明示的に残る**ようになった。

既存 18 exam の sidecar は再 merge するまで round-1 の note を持ち続ける (収束は backlog)。

---

## 証拠ファイル

- `evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S110_{2014h26h,2013h25a}{,_pass2}.json`
- `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S110_2014h26h.json`
- `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S110_2013h25a.json`
