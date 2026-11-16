# D-231 — zh: 太字キーワードの縁が漢字同士なら半角空白を置かない (C25)

- 状態: **LOCKED** (2026-11-16 Session 159、委任判断 D-161)
- 関連: D-195 §5 (キーワード太字 + 日本語原語)、D-215 C2 (`compatText`)、C24 (S158 minor D:「） 汉」)、D-230 (clreq に依る先例)

## 規則
zh の教科書本文 (content 欄、派生欄は merge で追従) で、`**キーワード**` の開き側・閉じ側の境界に半角空白 (U+0020) があり、
**空白の外側の字が漢字・仮名・中国語の約物** (`，。、；：“”《》（）` 等) で、**キーワード側の字 (開き側はキーワードの先頭、閉じ側は後続の文字 / JP 原語の先頭) が漢字・仮名** なら、その空白を消す (S159 Rule D L2: 実装 `scripts/c25-edits.ts` の判定に合わせた文言。キーワード側が約物の形「汉 **“X”**」「**X** ，」は HEAD で 0 件)。

- 「汉 **X**」→「汉**X**」、「**X** 汉」→「**X**汉」、「**X** [[jp:Y]]」→「**X**[[jp:Y]]」(zh)。
- 標識の無い本文の空白は原則維持。例外 1 件: strategy-01-01-u06 `terms[1].hook_zh`「”␣来管理」(閉じ引用符の後)。

## 維持 (変えない)
1. **漢字と欧文・数字の間の空白** (「的 **3D 打印**是」の左)。clreq §6.3.3 は漢字と欧文の間に最大 1/4 em の間隔を置くのを原則とし、U+0020 を使う方式も挙げる。
   キーワードの片端が欧文なら、その側の空白だけ残る。これは意図した結果である。
2. **式そのものが太字** (中身に `= + − × ÷` を含む、縁 8 か所 (開き 4・閉じ 4)、strategy-01-03-u02・-u03)。`compatText` は `**` を落とすので、派生欄では空白が唯一の区切りになる。標識の無い式 (「按 期初存货 + … 求出」) の空白とも揃う。
3. **全角演算子・「・」の隣**、図の凡例 (「□计划 ■实际 ・无工作」)、人名 (「佐藤 一郎」)、題名の「 — 」、図ラベルの語の区切り。
4. **裸の `[[jp:]]` の隣の空白 (97)** は本 D の範囲外 → **C25b**。派生の平文欄 (glossary・today に出る memory_hook 等) では色が消える。漢字だけのラベルは空白が唯一の区切りになる (「日语 与信 字面」)。直すなら `compatText` 側の設計が先。

## 根拠
- コーパスの多数形 (S159 計数、zh content 欄): 開き側 空白なし 2,930 / あり 788、閉じ側 2,569 / 485、`**X**[[jp:` 394 / `**X** [[jp:` 32。
- W3C clreq (Group Note Draft 2026-11-04) §6.3.1: "When composing a line with characters, in principle, no extra spacing appears between their character frames. This is called solid setting."
- 同 §6.3.3 "Mixed text composition in horizontal writing mode": "In principle, there is tracking or spacing between an adjacent Han character and a Western character or a European numerals of up to 1/4 em, except at the line start or end." / Note: "Another approach is to use a Western word space (U+0020 SPACE) …"
- 描画: `.kw` に左右の余白は無い。空白はそのまま隙間として見え、派生欄では「以 手机号码 为」と見える (C24 Rule D MEDIUM)。

## 却下
- CSS や描画器で空白を詰める: データと派生欄の隙間が残る。source と表示がずれる。
- 漢字–欧文の空白も消す: clreq §6.3.3 の原則と corpus の多数 (「汉 **LAT」544 / 74) に反する。
- 裸の `[[jp:]]` も同時に消す: 派生欄で区切りが消える (上記 4)。
- minor D (session log のみ) とする: コーパス全体の規則で、少数側が 10〜20% あるため standalone にした。

## 施工
`scripts/tbjp-apply.ts --round c25 --edits evidence/phase5/hosting/c25_edits.json`。edits は `scripts/c25-edits.ts` が tokenizer で生成する (欄全体の before/after)。
検査は 2 つ。対象欄は「選んだ空白だけが消え、key/jp の中身は同一」。派生追従欄は「before から U+0020 だけが消えた」。記録は `evidence/phase5/hosting/c25_*`。
