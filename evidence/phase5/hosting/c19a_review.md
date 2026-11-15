# C19a review (S158, Rule D: independent reviewer / verifier lane)

対象: 未 commit 差分 vs HEAD 499d81d6 — zh 本文の注釈 ASCII `( )` → 全角 `（ ）`（6 単元 39 欄 + 派生追従 10、B3 補丁 39 + retire/合成 1、`scripts/tbjp-apply.ts --round c19a`、`cleanup-pins.test.ts` C19a 不変量）。
reviewer は tracked file を変更していない（書いたのはこのファイルのみ。merge dry-run は gitignored の `.planning/v2/<unit>/merged.json` を再生成）。

## 判定: PASS（条件付き — M1 を commit 前に処理するか、keep の理由を session log に残す）

| 重大度 | 件数 |
|---|---|
| HIGH | 0 |
| MEDIUM | 1 |
| LOW | 4 |

## 1. 判定表 154 行の全件確認

- 独立列挙（HEAD の全 units、zh 本文欄＝`_zh`/`.zh` 終端かつ DERIVED 以外、`[[jp:]]` をマスクして ASCII `( )` の対を数える）: **154 対**、(unit, path) の多重集合が `c19_table.json` と **差 0**。作業ツリーでは **115 対**（= 154 − 39）。変換済み欄に残る ASCII 括弧は `terms[4].one_zh` の見出し語 `HR 科技(HR Tech)`（C19b）だけ。
- convert 39（c19a_edits.json）: 全行が注釈（英語原語・中国語の言い換え・「例：」・10 進値/文字数/比特数の注記・変数名 x/y・ACID の原語・規格の版）。構文括弧の誤変換 **0**。
- keep（"convert?" だが未採用）: 73-74 `2 的 (n-1) 次方`（指数のグルーピング）、94 `向量 (4, 3)`（タプル）、97-107 述語論理（`谓词(对象)`・`猫(咪咪)`・`∀x (猫(x) → 动物(x))`）、112-120 擬似言語（`if (条件)`・`名称(参数)`・`整数型: 名称`）— いずれも構文で keep が正しい。
- keep:math: 7-10/83-89/95-96/149-151（`n(n−1)`）、61-68/117/121-124（式中のグルーピング）は正しい。**71-72 は M1 参照**。
- C19b 53 行: 見出し語 18 個すべて `data/ip/textbook/zh_terms.json` に存在（`RAD(快速应用开发)` … `CRL(证书吊销列表)`、zh_terms 内の ASCII 括弧はちょうどこの 18）。本文中の見出し語の出現（goals/one/points/key_points）も C19b に寄せるのは整合。

### M1 (MEDIUM) — 行 71-72 は「式の括弧」ではなく「値の注記」
`strategy-06-21-u01 terms[3].fig.data.rows[3|4].cells[0].zh` = `净效益 (900 − 300)` / `投资回收期 (1,800 ÷ 600)`。ラベルの後ろに導出を添えた注記で、式の一部ではない（セル右側が結果 `600 万日元/年` / `3 年`）。コーパスの同型は全角: `technology-23-61-u08` `1,296 次（36 × 36）`、`strategy-01-03-u02` `边际利润率（1 − 变动成本率）`・`总成本（固定成本 60,000 日元 + 每个 500 日元）`。writer 自身の規則（「値の注記」→ 全角）とも食い違う。
提案: c19a_edits.json に 2 行追加（`" (900 − 300)"→"（900 − 300）"`, `" (1,800 ÷ 600)"→"（1,800 ÷ 600）"`）して再施工、または keep の理由を session log に記録。中身に漢字が無いので現行の pin 試験はどちらでも緑（L2 参照）。

## 2. 括弧以外の ASCII 句読点（漢字文脈）
作業ツリーで 79 欄を列挙して全件目視: 千位区切り（`1,800 万日元`、`46,656 次`）、時刻 `8:00～20:00`、規格年 `ISO 31000:2019`、CSV 例 `店铺,来客数`、階乗 `n!`/`r!`/`2! = 2`、データ列 `4, 9, 7, 2`・`2, 2, 3, 5, 8`、述語の引数 `大(咪咪, 小花)`、擬似言語の型宣言 `类型: 名称`、JSON 例 `{"商品名": "笔记本", …}`、ワイルドカード/SQL プレースホルダの `?` そのもの。**全件 keep で妥当**（writer の判断を確認）。

## 3. 機構
- units 差分（構造 diff vs HEAD）: 6 単元 49 欄、全パスが zh（ja/en 変更 **0**）。各欄で `（）：→():` と「( の前の空白」を無視すると前後同一（非括弧の変更 **0**）。49 = 39 対象 + 派生 10（strategy-01-01-u06 の `memory_hook_zh`×4, `explanation_zh`, `definition_zh`, `summary.memory_hooks_zh[0-3]`）で c19a_apply.json の `derived_followers` と一致。
- merge dry-run（全 journal を指定、`--write` なし）: strategy-01-01-u06 / management-08-25-u01 / technology-13-33-u01 / technology-20-52-u06 / technology-21-57-u01 は exit 0・validate 0・parity 0、**merged == units（差 0）**。technology-13-34-u03 は exit 1（`challenge_questions` 3 問が CONFIRM_SHORT 未登録、D-216）で merged と units の差は `challenge_questions[0-2]` のみ — HEAD から変わっていない欄で、apply 記録の `baseline_diff` と同じ既知の事象。C19a 起因ではない。
- 補丁ファイル: 5 ファイルは追記のみ（削除行 0）。management-08-25-u01 は p08（`:2013` 追記）を retired にし p14 に合成（before = loc part の原文 ` (JIS X 25010)`、after = `（JIS X 25010:2013）`）— C17 型で正しく、merge で p14 が適用され units と一致。
- `tbjp-apply.ts`: c19a 分岐は edits を JSON から読み、各置換に `parenNorm(from) === parenNorm(to)` を課し、派生追従は DERIVED かつ `parenOnly` のものだけ許可、その他の差分は throw。既存 round（b/c22/l4d）の条件式は `!ROUND_C19A` の追加のみで挙動不変。

### L1 (LOW) — parenNorm は向きを見ない緩い正規化
`（→(`・`）→)`・`例：→例: `・`" ("→"("` を全域で写すので、逆向き（全角→半角）や「( の前の空白の追加/削除」も通る。edits は人手でレビュー済みなので実害なし。強化するなら `to` 側に ASCII `(` が残らないこと、`from` 側に半角があることを追加チェック。

## 4. 試験
- `cd apps/web && npx vitest run src/lib/textbook`: **13 files / 176 tests passed**。`-t C19a` で新規試験 1 件が実行され pass。
- `node --no-warnings scripts/lang-leak-scan.ts --gate`: **PASS**（507 entries、warn 197 は既存）。
- KEEP 集合: 表の keep/C19b のうち「中に漢字がある」内側文字列と **完全一致**（数式 5・論理 5・擬似言語 5 + C19b 12 = 27; 漢字を含まない C19b `talent management`/`retention`/`reskilling`/`HR Tech`/`flowchart`/`OSS` は判定対象外なので不要）。過不足 0。
- HEAD で赤になるか: tracked file を戻せないため、試験の walk/KEEP/DERIVED をそのまま写したスクリプトで HEAD の units（`git show HEAD:`）を走査 → **17 件ヒット（赤）**、作業ツリーでは 0 件。

### L2 (LOW) — pin の網羅は 39 中 17
試験は「中に漢字がある括弧」しか見ないので、Latin/数字の注釈 21 件（`(Atomicity)`・`(5)`・`(x)`・`(JIS X 25010:2013)` 等）の後退は検出しない。また KEEP が内側文字列キー（path 非依存）なので、見出し語用の `人力资源管理` が図ラベル `HRM (人力资源管理)`（行 21）の後退も隠す。`对象`・`条件`・`参数` のような汎用語が将来の新規注釈を素通しさせる余地もある。C19b 完了時に KEEP を (unit, path, inner) キーにすると締まる。

### L3 (LOW) — 閉じ括弧の後ろの空白が残る
`HR（Human Resource） 负责`・`HR（人事） 与`・`平等（Equality） 是`・`re（再一次） +`（+ 派生）。規則は「前の空白を落とす」だけなので仕様どおりだが、コーパスでは `）漢字` 7,375 / `） 漢字` 61 で後者は少数派（`OJT（在岗培训） 与` 等、既存 58）。別候補として記録推奨（C19a の阻害要因ではない）。

### L4 (LOW) — タプル表記の不統一（既存）
`向量 (4, 3)`（keep ASCII）に対し `technology-13-34-u06` は `带顺序的组（P, Q）` と全角。keep の判断自体は妥当、既存の不統一として記録のみ。

## 推奨
APPROVE（M1 の 2 行を追加施工するか keep 理由を記録したうえで commit）。L1-L4 は非阻害、L2/L3 は C19b / 次候補で扱う。
