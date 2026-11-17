# Stage 7 Phase 3c — 一括書き直し後の掃除 (D-215、S152 起案 / S153 実施)

> 一括書き直し (b01〜b78) で「記録のみ」「範囲外」「ユーザー判断待ち」になった項目の処置。ユーザー「都按照你建议得来」(S152) → D-019 の「你来定」経路で Claude が処置を決定 (D-214 / D-215)。
> Tier 2: 本 PLAN + evidence `evidence/phase5/stage_07_ui/phase3/cleanup/` + failures は既存 batch 置き場 + 完了時に `RETROSPECTIVE_stage7_ui.md` 一括書き直し節へ追記 (Rule C)。
> 同時実行 ≤ 4 (D-206 既定、一時例外は 11-09 で終了)。書き手 = 主 session、審査 = verifier opus (Rule D)。local Playwright 全項目 + 本番 HTML smoke (D-213)。local 走行中は units/・共有ファイルを書かない (S152 Rule B)。

## 処置表

| # | 項目 (出所) | 処置 | 編集経路 | 審査 | 状態 |
|---|---|---|---|---|---|
| C1 | OQ-19: v1 回帰テスト 2 件が v1 = 0 で無検査 | **D-214**: `v1-snapshot.test.ts` と `__snapshots__/v1-units.json`、zh-terms の `--probe-v1` を退役し、`v2-corpus.test.ts` に「全単元が `textbook-unit-v2`」の不変量を 1 件追加。`--check-units` は現行 (S152) のまま | コード (TDD: 不変量を先に追加して通過確認 → 旧テスト削除) | code-reviewer opus | **done (S153、APPROVE)** |
| C2 | zh 本文 `**…**[[jp:…]]` 括弧なし表記で派生欄が「会计审计会計監査」と連結 (S150 b56 O1、S152 再計数 24 単元 / 244) | 派生欄を作る関数を直して全単元を再派生 (単元ごとの補丁にしない)。まず派生が merge 時保存か描画時かを確認し、保存なら merge 経路で再 `--write` | コード + 再 merge | verifier opus (派生欄の差分全件) | **done (S153、verifier PASS、in-place 再派生 = 計画からの逸脱、`cleanup/C2.md`)** |
| C3 | b77 L3: v1 図 `figures/technology-14-39-u01-t01.svg` と `terms[1].figure.mermaid` の 〈p〉〈/p〉 全角山かっこ | 直接修正 (`&lt;p&gt;` / mermaid `#lt;p#gt;`)。`figure_index.json` に当該図の hash 等が無いことは S152 で確認済 | 図ファイル直接編集 | verifier opus (截図で目視) | **done (S153、verifier PASS、`cleanup/C3_C10.md`)** |
| C4 | b32 u04 スクラム tree 図のインクリメント欠落 (f) | 図の構造修正 (図 data の追加)。B3 は文字列置換のみのため、merge 経路外の直接編集として evidence に before/after を残す | 単元 JSON 直接 + 記録 | verifier opus | **done (S153、直接編集 + pin)** |
| C5 | zh 訳語の単元間分裂: アクセシビリティ 可访问性 (19-50-u02) / 无障碍设计 (19-51-u01) | **可访问性に統一**。根拠: 2015h27a-q061 の誤答ア バリアフリーデザイン の zh 訳が「无障碍设计」で、19-51-u01 の訳は誤答肢と同語 (型 6)。zh_terms に登録 + B3 補丁 | B3 | verifier opus | **done (S153、B3 + merge、`cleanup/C5_C8.md`)** |
| C6 | zh 訳語: Web ページ 网页 (多数 20 ファイル) / Web 页面 (14-38-u01・19-51-u04) | **网页に統一** (多数側、zh_terms に登録) | B3 | 同上 (C5 と合同) | **done (S153)** |
| C7 | (g) 公的個人認証 zh/en、zh 电子证书、SECI 段階名 zh 表記 | zh_terms に登録し、不一致の欄を B3 で揃える。訳語は IPA 用語集 / 既存多数側から決め、根拠を evidence に | B3 + zh_terms | 同上 | **done (S153、公的個人認証 en・SECI zh・電子証明書 zh)** |
| C8 | `zh_terms.json` の偽陽性 warn (バリュー→价值观、スイッチ→交换机、集合、尺度 等) | per_unit / excluded に登録して warn を消す (本文は変えない) | zh_terms | verifier opus | **done (S153、warn 71 → 0)** |
| C9 | v1 由来 `unit_summary_*` (b74 u02「高清」、b78「押さえ」) | 全 244 単元の `unit_summary_*` を §9 禁止句と既知の訳語問題で機械走査 → 該当を unit-level B3 補丁 (`unit.unit_summary_*`、既に 4 単元で実績) | B3 (unit-level) | verifier opus (Rule A: 走査結果の N 抽検) | **done (S153、3 単元)** |
| C10 | (i) strategy-04-13-u02 `title_zh`「产业化」 | 直接修正 + `unit_index.json` の title_zh も同時更新 (patch tool 対象外) | 直接 + index | 同上 | **done (S153、verifier PASS、`cleanup/C3_C10.md`)** |
| C11 | (e) b30 u04 2012h24h-q012 クロスセリング (本文で解けない紐付け)、(h) 該当過去問 0 単元の `challenge_questions` が v1 継承の無関係題 (strategy-05-14-u08、technology-13-35-u07 等) | 全単元の `challenge_questions` / `term_questions` を「その単元の本文で解けるか」で走査し、無関係題を外す。配列欄のため直接編集 + evidence | 直接 + 記録 | verifier opus | **done (S153、D-216: 除去 95・差し替え 11・CONFIRM_SHORT 29 単元、verifier PASS、`cleanup/C11.md`)** |
| C12 | (k) quiz 解説 q091・q069 の「絶対参照」呼称 | **本 pass から外す**: quiz 層 (D-143 explfix 方針) の別工程に引き渡す | — | — | 引継ぎ |
| C13 | (l) validateV2 `wordAt` の漢字境界、en 層 D-198 Dice 基準 | **行わない** (生成は完了し、両者は新規生成・補丁時の検査のみに効く)。B3 を再開する場合に再検討 | — | — | 不採用 |
| C14 | (j) 金商法等改正の施行後に strategy-02-06-u03 へ暗号資産、日付追跡 4 件 | 日付到来時に B3 (STATE 次セッション行で追跡) | B3 | verifier opus | 日付待ち |
| C15 | リモート `stage7-ui` ブランチ | 削除を推奨: `origin/stage7-ui` (`1ef669ad`) は `origin/main` の祖先で独自 commit 0 (S152 確認)。外部への破壊的操作のためユーザー自身が実行: `! git push origin --delete stage7-ui` | ユーザー | — | **done (S152、ユーザー実行、`[deleted] stage7-ui`)** |
| C16 | Vercel deploy 保持期間 (D-212 §4) | 推奨 7 日 (最少 10 保持)。Vercel Project → Settings → Security → Deployment Retention でユーザーが設定 | ユーザー | — | **done (ユーザー設定済、S152 に Vercel API 読取で確認: expirationDays 7 / production 7 / canceled 7 / errored 7、deploymentsToKeep 10)** |
| C17 | C2 の残余 (S153): keyword 以外の直後の裸 `[[jp:…]]` (zh 約 284 / en 約 206)。注記 (`系统管理标准[[jp:システム管理基準]]`) と言及 (`日语的[[jp:憲章]]`) が混在し位置規則では分けられない → compat 欄で連結のまま | 本文側に括弧を入れる B3 補丁 (注記のみを人手で選別)。本 pass では行わず候補として記録 (読書画面は色分けで区別される) | B3 | verifier opus | **done (S154、glossary 可視欄 one / detail / hook に限定: 209 件判定 → 括弧付け 16 件 / 10 単元、B3 + in-place、`cleanup/C17.md`)** |
| C18 | S153 Rule D LOW: unit_summary_zh の半角句読点 (management-11-29-u02 / management-12-31-u02 / strategy-04-13-u01 / strategy-06-21-u01) と strategy-04-13-u01 title_zh「(MOT)」、technology-23-62-u01 unit_summary_zh「一整套手续」(手続き の直訳) | unit-level B3 補丁 (title は直接 + index + pin) | B3 | verifier opus | **done (S154、全走査で unit_summary_zh 11 + title_zh 6 に拡大、B3 unit-level + in-place / 題名は直接 + index、pins 不変量、verifier PASS、`cleanup/C18.md`)** |
| C19 | S154 C18 Rule D LOW: zh 本文欄の ASCII 句読点 (verifier 計数 text_zh 920 / one_zh 576 / detail_zh 218 / hook_zh 46 / term_zh 18 ほか) | コード・式・時刻等の正当な用法を含むため要選別。読書画面の可読性への影響は小 → 候補として記録のみ | B3 | verifier opus | **C19a done (S158)**: 注釈の ASCII 括弧 41 対 → 全角 (`evidence/phase5/hosting/c19_table.json`・`c19a_review.md`)、数式・論理・擬似言語は維持、他の ASCII 句読点は全件維持判定。**C19b done (S158)**: zh_terms 見出し語 18 を全出現 (units・zh_terms・fixture・quiz 26 欄) で全角に、Rule D critic PASS (`c19b_review.md`) |
| C20 | S154 L3 B20: quiz zh/en 解説が ja と対応しない (篇幅 2〜4 倍、論証の追加、commit `b0a60fbd`) | 訳の忠実度。D-234: low の内容ずれ約 50 題 + 監査記録の無い 42 題を最小補丁、その後 quiz zh「」→ “” | quiz explanations | verifier opus | **done・本番確認済** (S162: 41 題 96 欄、29 題 67 欄 `d872210b` Rule D PASS、引号 8,316 欄 `72f67cfa`、記録 `evidence/phase5/hosting/c20/`) |
| C21 | S154 L3 B26: duplex system — 教科書「双重系统」/ quiz「双工系统」(D-175) | quiz 側 (D-175) に合わせて教科書を統一するか判断 | B3 + zh_terms | verifier opus | **done (S155、OQ-15 と同一として解消: technology-16-44-u03 の入替え、critic opus PASS、`93e9bc1c`、`evidence/phase5/hosting/oq15_*`)** |
| C22 | S155 tb-jp-unmarked Rule D LOW-1: lang-allow `tb-data` 6 項目中の説明された日本語 (例 technology-14-37-u03 `整数型`) | 選別: 試験の語 (整数型 en ×3) に `[[jp:]]`、例データ (あ・山) と図ラベル (印の描画経路なし) は `tb-data` のまま。zh の 整数型 は中国語形として印なし | B3 (`tbjp-apply.ts --round c22`) + allowlist 再生成 | 別 type (Rule D) | **done (S156、verifier opus PASS、`evidence/phase5/hosting/c22_{apply,review}.md`)** |
| C23 | S157 L4-d 截図: quiz 表示の生記法 — 表 cell の生 `<br>` (73、全て表の中) と生 `**` (2009h21a q097〜q100 の図見出し、q096 解説イ) | `<br>` は描画側 (`CellText`)、`**` はデータで外す (quiz の描画器に太字なし) | QuizRichText + sidecar / .phase2 | code-reviewer opus | **done (S158、Rule D PASS、`evidence/phase5/hosting/c23_review.md`)** |
| C24 | S158 C19a Rule D L3: zh の全角閉じ括弧の後の空白 (「HR（人事） 与」、コーパス「）漢字」7,375 / 「） 漢字」61) | 61 件を選別 (英字との間の空白は残す等) | B3 | verifier opus | **done (S158)**: 「） 汉」4・「）** 汉」82・keyword+gloss+空白 10 の空白を除去 (派生 65 追従)、Rule D code-reviewer PASS (`c24_review.md`) |
| C25 | S158 C24 Rule D MEDIUM: 太字の漢字キーワードの前後の空白 (「漢字** 漢字」485・「漢字 **漢字」788、派生欄で「以 手机号码 为」)、「** [[jp:X]]漢」22、中国語文に埋め込んだ日本語の前後「]] 汉」30、「”␣漢」3・「》␣漢」2 | 規則を先に決める (CJK–Latin の空白は維持、太字の前後は描画で隙間になるか確認) → 全件選別 | B3 | verifier opus | 準備済 (S158: 計数 1,480 / 818 欄、太字の隣 1,306 と裸 jp の隣 97 を分ける、D-231 を lock してから canary → 全件、手順は session-158 log) |
| C25b | S159 C25 の範囲外: 裸 `[[jp:]]` の隣の CJK 間空白 97 (73 ラベル)、glossary 平文で漢字の言及が溶ける (「日语与信字面」) | D-232 (働きで分ける: 言及 → 引号、注釈 → 空白削除) | B3 (凍結 1 単元は直接編集) | verifier opus | **done** (S160: 44 単元 81 欄 + 派生 110、Rule D PASS、Playwright 331/0/2) |
| C26 | zh の引号の形が混在 (教科書「」178 / “ 1,615、UI「」11) | D-233 (教科書・UI は “”、入れ子は ‘’。quiz は C20 で) | B3 (unit_summary 3 は unit-level) + UI 直接 | critic opus | **done** (S161: 31 単元 119 欄 + 派生 184 + UI 11、Rule D PASS、Playwright 283/0/2) |
| C27 | S162 C20 round 3: jp 解説の誤り 27 件 (zh/en も同じ誤り、例 RASIS→RAS・DHCP を 3 文字略語・チェックサムが改ざんを検出、境界判定 8) | 三語同時に修正、境界判定 8 は 1 件ずつ判断 (ユーザー選択「另开一项来修」) | quiz explanations (.phase2) | verifier opus | **done・本番確認済** (S163: 27 題 97 欄 三語、境界 8 は全件採用、Rule D PASS → LOW 5 処置、`evidence/phase5/hosting/c27/`) |
| C28 | S163 C27 の範囲外: 2015h27a-q098 の key_guard が「料金表が stem に無い」の誤った前提で suspect: true (UI に「正解を確認できなかった」1 行が出る)。他の suspect 83 題に同型が混じるか未調査 | key_guard の再判定 (merge の generate_result 層、`explanationSuspect.test.ts` anchor 84) | quiz explanations (key_guard) | 未定 | 候補 (未着手) |

## 順序 (S153)
1. C1 (テスト、独立) と C3・C10 (小さい直接修正) を先に。
2. C2 (派生関数、全単元再派生) — 他の単元編集より前に入れ、以降の補丁は新しい派生で再 merge。
3. C5〜C8 (zh 訳語・zh_terms) を 1 組で。
4. C9・C11 (全単元走査 → 該当のみ修正、Rule A 抽検)。
5. C4 (図の構造)。
6. gates → local e2e (全単元) → commit (項目ごと) → push → 本番 smoke (変更単元)。retro 追記。
