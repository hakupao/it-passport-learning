# ⑤-2 全量保真掃引 U8 — 2023r05 の集計と是正 (S125)

⑤-2 全量核験の **U8** (`docs/phase5/PLAN_52_units.md` §2、D-146 第 10 unit)。母数は
`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の 2023r05 = **91 問**。
**Sonnet 5 単 pass** の 7 回目の本番 unit。

---

## 1. 入力と実行

- run: `wf_b22ad070-03c` (label `u8`、pass `sn`、model = **Sonnet 5**)
- マニフェスト: `data/ip/quiz/.phase2/u8_fidelity_input_2023r05.json` (`--precrop` 版、crop **85/91**)
  - skip 6 問: **page_mismatch 4** = `q087` (page-40、detected 3 / expected 2) / `q088`〜`q090` (page-41、detected 2 / expected 3)、**merged_preamble 2** = `q013` (p06、displayed 238 字 vs bank 114 字) / `q033` (p14、546 字 vs 207 字 — 表と注記が帯外)
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u8_2023r05_sn.json`
- **覆盖 91/91 / CLEAN 75 / DISCREPANT 16 / UNREADABLE 0**、差分 20 {semantic 12, cosmetic 8}、正解肢上 4 (`q035 ア` / `q093 エ` ×2 / `q099 ウ`)
- 是正器: `scripts/quiz-fidfix-S125-u8.mjs` (既定 dry-run、`--apply` で書込み)

### Sonnet 単 pass の実測

| 項目 | U5 (2020r02o 60) | U6 (2021r03 88) | U7 (2022r04 75) | **U8 (2023r05 91)** |
|---|---|---|---|---|
| token | 3,877,830 | 5,572,875 | 4,944,550 | **5,933,780** |
| token / 問 | 64,631 | 63,328 | 65,927 | **65,206** |
| 時間 | 9.3 分 | 11.9 分 | 13.4 分 | **13.7 分** |
| tool 呼び出し | 561 (9.4) | 685 (7.8) | 740 (9.9) | **851 (9.4 回/問)** |
| UNREADABLE | 0 | 1 | 0 | **0** |

(token・時間・tool 数は主 context 申告の workflow ログ値。)

---

## 2. 率

| exam | n | agent DISCREPANT | +machdiff | 計上 (率) | **是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|
| 2023r05 | 91 | **16** | **+0 題** (machdiff 実残差 0) | 16 (**17.6%**) | **16 (17.6%)** | **4** (3 肢) | **0** |

- 題数 16 = q004 q011 q016 q024 q025 q031 q032 q033 q034 q035 q060 q072 q092 q093 q094 q099 (agent DISCREPANT 16 題と同一)。
- agent の 20 差分は**全件採用** (うち `q033` は注記見出しの括弧のみの**部分採用**、「（空欄のセル）」は描画補助として保持 — §4a)。machdiff 実残差 **0** (§3)。非採用 **0 件 + 部分 1**。
- **severity 再分類 (fixer、20 論理差分)**: cosmetic **9** / semantic **11** / answer_affecting **0**。
  規則 (U6 / U7 §2 と同一): 読点・句点・引用符・括弧の字種、見出し、空白 → cosmetic、語の内部で字が入る / 落ちる / 置き換わる → semantic。
  - agent {semantic 12, cosmetic 8} から **1 件を cosmetic に移した**: `q033` stem (採用部分が見出しの括弧のみになったため)。
  - cosmetic 9 = `q004` stem 引用符 / `q032 ア` 読点 / `q033` stem 注記見出し / `q034` stem 引用符 / `q035 ア` 句点→読点 / `q060` stem 括弧・空白 ×2 / `q092 ウ` 引用符 / `q093 エ` 閉じ引用符。
  - semantic 11 = `q011` stem 刷新 / `q016 ア` の / `q024 イ` 多寡 / `q025` stem 10万円 / `q031 ウ` シ / `q032 イ` む / `q035 ウ` 工 / `q072 ア` ない / `q093 エ` 削 / `q094 ウ` 間 / `q099 ウ` 際。
- **正解肢上 4 差分 (3 肢)** = `q035 ア` (cosmetic) / `q093 エ` (semantic + cosmetic) / `q099 ウ` (semantic)。**`correct_answer` はいずれも不変**。
- `correct_answer` 変更 **0 / 2900**、`data/ip/exams/answer_keys.json` **バイト不変** (md5 `6802bb0bc13004da78ad3c4e5117d997`、mtime `1788586696` 前後同一)。

### 既往波との比較

| | 標本 | 計上 | 率 | 正解肢上 | answer_affecting | 抄写 model |
|---|---|---|---|---|---|---|
| 波 1–3 (Opus 双 pass) | 462 | 40 | 8.7% | 6 | 2 | Opus 双 pass |
| U3a (2018h30h) | 70 | 8 | 11.4% | 2 | 1 | Sonnet 単 pass |
| U3b (2019h31h) | 87 | 9 | 10.3% | 1 | 0 | Sonnet 単 pass |
| U4 (2019r01a) | 52 | 4 | 7.7% | 1 | 0 | Sonnet 単 pass |
| U5 (2020r02o) | 60 | 15 | 25.0% | 4 | 0 | Sonnet 単 pass |
| U6 (2021r03) | 88 | 13 | 14.8% | 2 | 0 | Sonnet 単 pass |
| U7 (2022r04) | 75 | 19 | 25.3% | 9 | 3 | Sonnet 単 pass |
| **U8 (2023r05)** | **91** | **16** | **17.6%** | **4** | **0** | **Sonnet 単 pass** |
| **累計 (波 1–3 + U3a〜U8)** | **985** | **124** | **12.6%** | **29** | **6** | — |

(正解肢上は従来どおり**差分数**で数える。U8 の 4 = q035 ア 1 + q093 エ 2 + q099 ウ 1。)

U8 の支配型は **1 字の置換・挿入・脱落** (刷 / の / 寡 / シ / む / 工 / い / 削 / 間 / 際) と **引用符字種** (q004 / q034 / q092 / q093)、
加えて **slashed zero の 0→9 誤読** (`q025`「10万円→19万円」、U5・U7 に続く 3 unit 目)。
**`q011` は clean 層が raw の脱字「新」を「変革」と推測補完していた** — raw の腐敗を clean で「直した」つもりの語が源と違う型で、
zh「变革」/ en "transform" もその推測語を訳しており、en は**正解肢 (Digital transformation) の語を題幹に置く**形になっていた (§4b)。

---

## 3. 機械 diff (machdiff) — **AGENT_MISSED 3 = 実残差 0 + 偽陽性 3**

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u8_fidelity_input_2023r05.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u8_2023r05_sn.json
✗ AGENT_MISSED 2023r05-q041 stem verdict=CLEAN: @76 disp(after agent fixes)「てどれくらい変化したか.(アロ-ダイアグラム.凡例は矢線の上」 src「てどれくらい変化したか.」
✗ AGENT_MISSED 2023r05-q042 stem verdict=CLEAN: row 4: disp [] src ["[表]","列","単体テスト","結合テスト","システムテスト"]
✗ AGENT_MISSED 2023r05-q092 choice.ウ verdict=DISCREPANT: @11 disp(after agent fixes)「メ-ルアドレスの"@""の左側部分に記述されているドメイン」 src「メ-ルアドレスの"@"の左側部分に記述されているドメイン名」
machdiff: fields same=452 | AGENT_MISSED=3 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 91/91
```

主 context の候補 3 件を**源実読で独立に確認した**。

| id.field | 源実読 | 判定 |
|---|---|---|
| `q041` stem | crop: 題幹 2 行の下にアローダイアグラム (A2 / B3 / C4 / D1 / E1 / F5 / G5) と凡例「作業名 (矢線の上) / 所要日数 (下)」。clean は題幹の後に「（アローダイアグラム。凡例は矢線の上に「作業名」，下に「所要日数」を表す）」と結合点つきの 7 行を持つ。7 行の接続 (開始→A→結合点1→C→結合点3 / 開始→B→結合点2→D→結合点3 / 結合点2→E→結合点4→G / 結合点3→F) と日数は図と一致 | **偽陽性** — 図の文本化 (描画補助、2012h24h q092 / 2011h23a q089 と同クラス)。agent の transcript は図を写していない。`has_figure=true` |
| `q042` stem | crop: 題幹・記述 a〜c の下に組合せ表 (列 単体 / 結合 / システムテスト、行 ア abc / イ acb / ウ bac / エ cba) | **偽陽性** — dataset は表を 4 肢の「単体テスト：a，結合テスト：b，…」に構造化しており、対応は 4 行とも源と一致 (体裁差、agent notes も同旨) |
| `q092` ウ | crop: 「メールアドレスの“@”の左側部分に…」 | **偽陽性** — agent 計上済の差分 (`“@"”`→`“@”`) を machdiff が patch した後、引用符正規化で `“ " ”` を `"` に畳むため残る人工物 (U6 `q011` / U7 `q100` と同根)。是正後の実 field は `“@”` とバイト一致 (§8) |

---

## 4. 裁定 (fixer が源を原寸〜3 倍で独立実読)

実読した源: `data/ip/quiz/.phase2/precrop/2023r05/` の **q004 / q011 / q016 / q024 / q025 / q031 / q032 / q034 / q035 / q041 / q042 / q060 / q072 / q092 / q093 / q094 / q099** (crop)、
crop を持たない **`q033` は page-14 直読**。語句レベルの主張 (`q011` 刷新 / `q024` 多寡 / `q025` 10万円 / `q031` シ) は **sharp で 3 倍に拡大**して確認した。
agent の `source_text` は候補として扱い、すべて自分の目で読んでから from/to を決めた。**採用 20 (うち部分 1) / 非採用 0**。

### 4a. `q033` stem — **部分採用** (注記見出しの括弧のみ)

**源 (page-14 直読)**: 表の直下に「注記　網掛けの部分は，表示していない。」。
表は 週 1〜6 × (製品Aの生産個数 / 部品a 所要・手持在庫・発注 / 部品b 所要・手持在庫・発注)、網掛けは 部品a 手持在庫 2〜6 週・発注 1〜6 週、部品b 所要 2〜6 週・手持在庫 2〜6 週・発注 1〜6 週 — clean の markdown 表の空欄と一致。

- 「（注記）」→「注記　」: **採用** (cosmetic)。括弧は源に無く、sidecar 全 29 exam の注記見出しは「注記　」12 /「注記 」16 /「（注記）」2 で括弧は少数形。
- 「（空欄のセル）」: **非採用 (保持)**。markdown 表は網掛けを表現できず、網掛けセルは空欄で表示されている。
  「（空欄のセル）」はその対応を示す**描画補助**で、`2012h24h q092`「（網掛け＝休日：…）」/ `2011h23a q089`「（■＝黒、□＝白）」と同じクラス (いずれも S113 で保持と裁定済)。
  解答を漏らさず、削ると「網掛けの部分」が表示上どこも指さなくなる。**Rule D 確認点**。
- zh「（注）…（空白单元格）」/ en "(Note) … (blank cells)" は各言語の体裁と同じ描画補助で**不変**。
- `.phase1/tr_2023r05-q033.json` は `stem_jp_clean` キーを持たない (sidecar のみ、実測) → 置換は sidecar 1 層のみ。raw には表・注記が無く n=0。

### 4b. `q011` stem — 「変革」→ 源「刷新」(semantic) — clean の推測補完

page-05 crop を 3 倍: 「…戦略的にビジネスモデルの**刷新**や新たな付加価値を…」。
- raw「ビジネスモデルの**新**や」は「刷」の脱落、clean「ビジネスモデルの**変革**や」は **clean 化の際の推測補完** (expl_jp の非出荷 note にも「stem_jp_clean で「変革」に是正済み」とある)。
- zh「从战略层面**变革**商业模式」/ en "to strategically **transform** business models" は推測語を訳していた。en は正解肢「Digital transformation」の語を題幹に置いており、
  源が「刷新」を使って避けている**語の一致による手掛かり**を作っていた → zh「**革新**」/ en "**revamp**" に追随 (U7 `q018 ア` の源語義への追随 precedent)。
- 解説: correct は設問を「…ビジネスモデルの変革や…」と**引用**している → 引用部のみ jp「刷新」/ zh「革新」/ en "revamp" に追随。
  DX の定義文・誤答肢の説明・points の「変革 / transform」は解説者自身の DX の説明で設問の引用ではない → **不変** (U7 `q027` 解説の precedent)。
- 答え (ウ デジタルトランスフォーメーション) は不変。

### 4c. `q025` stem — slashed zero「19万円」→ 源「10万円」(semantic)

page-11 crop を 3 倍: 記述 a「…応募者の中から抽選で現金**10**万円が当たるキャンペーンを実施した。」。0 は斜線入りゼロ (U5 `q004` / U7 `q066` と同じ書体)。
- raw・clean とも「19万円」→ 10万円。zh「19 万日元」→「10 万日元」、en "190,000 yen" → "100,000 yen"。
- 解説 correct / distractor イ の金額 (jp・zh・en) は置換で追随。
- **points[0] は置換でなく論拠の書換**: 旧「（一般懸賞は…最高10万円が上限）。**19万円という金額に惑わされず**、応募条件で見分ける。」は
  「19万円 > 一般懸賞の上限 10万円」を罠とする論拠で、是正後 (10万円 = 上限と同額) には成り立たない →
  「賞金の金額ではなく、応募条件（商品購入を条件とするか否か）で見分ける。」に改めた (zh / en 同義)。**Rule D 確認点**。
- 答え (エ b, c — a はオープン懸賞で景品額の上限規制なし) は不変。

### 4d. 1 字の誤字 (semantic)

| id | 源 | dataset | 備考 |
|---|---|---|---|
| `q016 ア` (p08 crop) | 質疑応答**の**事例 | 質疑応答事例 | 解説アの言い換え「質疑応答事例」も jp のみ追随 (zh「问答案例」/ en "cases" は既に源の語義) |
| `q024 イ` (p11 crop、3 倍) | 発注回数の多**寡** | 多**容** | 解説イの OCR 注記「(なお「多容」は「多寡」の表記化けです)」を jp・zh・en から除去 (U7 `q014` precedent) |
| `q031 ウ` (p13 crop、3 倍) | **シ**ェアリングエコノミー | **ジ**ェアリング | 解説ウの OCR 注記を jp・zh・en から除去。zh「共享经济」/ en "Sharing economy" は正 |
| `q032 イ` (p14 crop) | 定義するもの | 定義**む**するもの | U7 `2022r04-q036` と同じ「む」挿入 |
| `q035 ウ` (p15 crop) | **工**業製品 (行末の「工」+ 次行「業製品」) | **エ**業製品 (カタカナ U+30A8) | 書体上ほぼ同形だが「エ業」は語として成立しない。zh「工业产品」/ en "industrial products" は正 |
| `q072 ア` (p33 crop) | 取り扱わ**ない** | 取り扱わ**なか**い | |
| `q093 エ` (p42 crop) | “**削**除してよいか” | “**肖**除してよいか" | **正解肢**。閉じ引用符 (ASCII `"` → `”`) も同じ置換で (cosmetic 1 を含む) |
| `q094 ウ` (p43 crop) | 両社**間** | 両社**問** | 同じ置換で「について,両社」→「について, 両社」(house rule) |
| `q099 ウ` (p44 crop) | 署名する**際**の | 署名する**除**の | **正解肢**。zh「签名时」/ en "when signing" は正 |

### 4e. 句読点・引用符・括弧・空白 (cosmetic)

- `q004` stem (clean): 源「（以下“自社方式”という）」→ clean の ASCII `"` を源の字形へ (U7 `q027` precedent)。raw「"自社方式”」(開きが ASCII) は n=0 skip (N5)。
- `q034` stem (clean): 源 “人間中心の AI 社会原則” → clean「「…」」を源の字形へ。raw「“…"」は n=0 skip (N5)。
- `q032 ア`: 源「情報収集を行い，システムの」→ 読点復元 (house rule「, 」)。
- `q035 ア` (**正解肢**): 源「…様々な領域で，インターネットや AI を活用して，…」(1 文)。dataset「領域で。 インターネット」は読点が句点に化けて 2 文に割れていた → 「領域で, インターネット」。
- `q092 ウ`: 源「“@”」→ dataset「“@"”」の源に無い ASCII `"` を除去。
- `q060` stem:
  - 「[プログラム]」→ 源「〔プログラム〕」。sidecar の形は「〔プログラム〕」7 /「[プログラム]」2 (本題と `2024r06`) /「［プログラム］」0 で、源と多数形に揃えた。
    **反対の precedent**: `2012h24h q094` (S113) は「［…］(源=〔…〕)」を表記揺れとして据え置いた。本 unit は引用符字種を差分とする S119 基準 (U7 q027 以降) の延長で括弧字種も揃えた。raw にも「[プログラム]」があり 3 層とも置換。**Rule D 確認点**。
  - 「全ての要素を先頭から」→ 源「全ての要素 を先頭から」。IPA 擬似言語の字句区切り空白 (S118 fidelity 規則の例外)。
    S118 R8c spacefix が保護対象とした `2026r08-q067`「workArray の全ての要素 を先頭から順に…」と同一の構文。raw は既に空白ありで n=0 skip。
  - zh「[程序]」/ en "[Program]" は各言語の体裁 (⑨-c 保留)。

### 4f. CLEAN 標本の無作為抽検

CLEAN 73 問 (machdiff 対象の q041 / q042 を除く、id 昇順) から **seed 128 の LCG** (node の double 演算で再現) (`s = (s·1103515245 + 12345) mod 2^31`) で 3 問を抽出 (`q078` / `q028` / `q083`) し、源 crop と逐字照合した。

| id | 実読結果 |
|---|---|
| `q078` (p37 crop) | 題幹「関係データベースの主キーの設定に関する記述として，適切なものだけを全て挙げたものはどれか。」、a〜d 4 行、4 肢 a,c / a,d / b,c / b,d が一致 |
| `q028` (p12 crop) | 題幹「AI を開発するベンチャー企業の A 社が，資金調達を目的に，…新たに公開することを表す用語として，…」と 4 肢 IPO / LBO / TOB / VC が一致 |
| `q083` (p38 crop) | 題幹「スマートフォンなどで，相互に同じアプリケーションを用いて，インターネットを介した音声通話を…」と 4 肢 MVNO / NFC / NTP / VoIP が一致 |

→ **見落とし 0**。

---

## 5. SOURCE_TYPOS

本 unit では**該当なし**。

---

## 6. 採用した差分 (16 題 / 20 論理差分)

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q004 (p03) | stem (clean) | `（以下"自社方式"という）` → 源 `“自社方式”` | cosmetic | agent |
| q011 (p05) | stem | clean `変革` / raw `新` → 源 `刷新` (zh / en・解説引用追随) | **semantic** | agent |
| q016 (p08) | choice.ア | `質疑応答事例` → 源 `質疑応答の事例` (解説ア jp 追随) | **semantic** | agent |
| q024 (p11) | choice.イ | `多容` → 源 `多寡` (解説イの OCR 注記除去) | **semantic** | agent |
| q025 (p11) | stem | raw・clean `19万円` → 源 `10万円` (zh / en・解説追随、points[0] 書換) | **semantic** | agent |
| q031 (p13) | choice.ウ | `ジェアリング` → 源 `シェアリング` (解説ウの OCR 注記除去) | **semantic** | agent |
| q032 (p14) | choice.ア | `行い システム` → `行い, システム` | cosmetic | agent |
| q032 (p14) | choice.イ | `定義むする` → 源 `定義する` | **semantic** | agent |
| q033 (p14) | stem (clean) | `（注記）` → 源 `注記　` (**部分採用**、`（空欄のセル）` は保持) | cosmetic (agent: semantic) | agent |
| q034 (p15) | stem (clean) | `「人間中心のAI社会原則」` → 源 `“…”` | cosmetic | agent |
| q035 (p15) | choice.ア | `領域で。 ` → `領域で, `。**正解肢** | cosmetic | agent |
| q035 (p15) | choice.ウ | `エ業` (カタカナ) → 源 `工業` | **semantic** | agent |
| q060 (p28) | stem | `[プログラム]` → 源 `〔プログラム〕` (raw・clean) | cosmetic | agent |
| q060 (p28) | stem (clean) | `要素を` → 源 `要素 を` (擬似言語の字句区切り) | cosmetic | agent |
| q072 (p33) | choice.ア | `取り扱わなかい` → 源 `取り扱わない` | **semantic** | agent |
| q092 (p42) | choice.ウ | `“@"”` → 源 `“@”` | cosmetic | agent |
| q093 (p42) | choice.エ | `肖除` → 源 `削除`。**正解肢** | **semantic** | agent |
| q093 (p42) | choice.エ | 閉じ引用符 `"` → 源 `”`。**正解肢** (上と 1 置換) | cosmetic | agent |
| q094 (p43) | choice.ウ | `両社問` → 源 `両社間` (同置換で読点 house rule) | **semantic** | agent |
| q099 (p44) | choice.ウ | `署名する除の` → 源 `署名する際の`。**正解肢** | **semantic** | agent |

- jp 読点の字種は house rule の ASCII `", "` (D-147 §1)。

### zh / en / 解説の追随

| id | zh | en | 解説 | 判定 |
|---|---|---|---|---|
| q011 stem | 变革 → **革新** | transform → **revamp** | correct の設問引用のみ jp・zh・en 追随 | **全層追随** |
| q025 stem | 19 万日元 → 10 万日元 | 190,000 → 100,000 yen | correct・イ を jp・zh・en で置換、points[0] は**書換** | **全層追随** |
| q024 イ / q031 ウ | 既に正 | 既に正 | OCR 注記を jp・zh・en から除去 | **解説のみ追随** |
| q016 ア | 既に正 | 既に正 | 誤答肢アの言い換えを jp のみ追随 | **解説 jp のみ** |
| q004 / q034 / q033 / q060 | 引用符・括弧・注記見出しは各言語の体裁 | 同左 | — | 不変 (⑨-c) |
| q032 / q035 / q072 / q092 / q093 / q094 / q099 | 既に源の語義 | 同左 | 出荷解説に腐敗語の引用なし (grep) | 不変 |

(q093 の解説 correct は「『削除してよいか』」と正しい語で書かれている。)

### 指示から外した点

**なし。** 指示で名指しされた語句レベルの主張 (q011 / q016 / q033) と q024 / q025 / q031 / q032 / q035 / q072 / q093 / q094 / q099 / q060 / q004 / q034 / q092、machdiff 候補 3 件をすべて源実読で確認した。
- 指示外で追加したもの (いずれも同じ差分の追随): q011 の zh / en と解説引用、q025 の zh / en と解説 (points[0] 書換を含む)、q024 / q031 解説の OCR 注記除去、q016 解説 jp の言い換え。
- q094 ウ は誤字の置換に同じ from 内の読点を house rule で揃えた (U7 q022 precedent、1 field 内)。

---

## 7. 層と局所性

適用前 dry-run の ✓ 行 (§9 のログ) を層別に数えた実数:

| 層 | 置換操作数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/2023r05.json`) | **45** | choices 12 置換 × 3 = 36 / stem 3 置換 (q011「新や」・q025・q060「[プログラム]」) × 3 = 9 |
| sidecar (`translations/2023r05.json`) | **11** | `stem_jp_clean` 7 (q004 / q011 / q025 / q033 / q034 / q060 ×2) + zh・en 4 (q011 / q025 stem) |
| `.phase1/tr_<id>.json` | **10** | sidecar と同一の置換。q033 は `.phase1` に `stem_jp_clean` キーが無い (実測) ため 1 少ない |
| 解説 `.phase2/expl_{jp,tr}_*.json` | **19** | q025 correct 3 + イ 3 + points[0] 3 / q011 correct 3 / q024 イ 3 / q031 ウ 3 / q016 ア 1 |
| key_guard final note (`.phase2/generate_result_2023r05.json`) | **11** | D-143: **final のみ**、round1 不可触 |
| **fidfix 合計** | **96** | `quiz-fidfix-S125-u8.mjs` の `applied` と一致 |
| skip (想定どおり) | **17** | clean のみの腐敗の raw 3 層: q004 / q033 / q034 / q060「要素 を」= 12、q011 の 2 行のうち各層で当たらない側 5 (raw 3 は「変革」行、clean 2 は「新や」行)。**無言 guard skip 0** |

### 選択肢に clean 層は無い = **腐敗は学習者に見えていた**

- 2023r05 の sidecar のキー集合 = {`stem`, `choices`, `stem_jp_clean`} (clean は 63 題)。**`choices_jp_clean` は存在しない** (実測)。
- → 選択肢の 12 置換はすべて出荷層の腐敗。stem は q004 / q011 / q025 / q033 / q034 / q060 が clean を持つ (表示は clean 層)。

### 適用ループの由来 (Rule D 向け)

`quiz-fidfix-S125-u8.mjs` の冒頭 (`import` 〜 `sub()`) と適用ループ (「// ── 適用」以降) は `quiz-fidfix-S125-u7.mjs` の同範囲を**機械的に連結**して作成した。
`diff` の差は最終 console.log のラベル 1 語 (`u7`→`u8`) のみ (`import`〜`sub()` は差 0)。
本 unit で実行された分岐: **stem 分岐 (raw + clean) / choices 分岐 / zh・en 分岐 (stem) / EXPL の distSub・correctSub・pointSub / NOTE_APPEND**。zh・en の choices 分岐と NOTE_SUB は未実行。
**pointSub は S122 以降で初めて実行された分岐** (`scripts/quiz-fidfix-S12*.mjs` で `pointSub: [` を持つのは本 script のみ — grep) — Rule D で本体の配列書戻し (`box` 経由で `points_jp[idx]` に戻す) を確認されたい。実データでは `expl_jp_2023r05-q025.json` の `points_jp[0]` が書き換わったことを確認済 (§8)。

### key_guard final note

- 対象 **11 件** = 語義 (`q011` `q016` `q024` `q025` `q031` `q032` `q035` `q072` `q094`) + 正解肢命中 (`q035` `q093` `q099`)。
  **追記しない 5 件** = `q004` / `q034` (引用符) / `q033` (注記見出し) / `q060` (括弧・空白) / `q092` (誤答肢の引用符)。
- 11 問とも final note・round1 とも空文字 (事前)。**11 件とも純粋な後置** (`final.startsWith(旧 final)` 11/11)、`key_guard_round1` の変更 **0 / 100**、`key_guard` の note_jp 以外の path と `suspect` の変化 **0** (適用前退避との機械照合)。
- merge は final ≠ round1 のため **11 問に `round1` ブロック (note_jp = "") を新規 publish** (U5〜U7 と同じ D-143 の挙動)。`explanations` 内の MARK `fidfix-S125-u8` = **11**。

### tracked データの差分 (`git diff --numstat`)

| ファイル | 差分 | 内訳 |
|---|---|---|
| `data/ip/quiz/questions.json` | +15 / −15 | 15 key 変化 = choices 12 (q016 / q024 / q031 / q032 ×2 / q035 ×2 / q072 / q092 / q093 / q094 / q099) + stem_jp 3 (q011 / q025 / q060) |
| `data/ip/quiz/translations/2023r05.json` | +10 / −10 | clean 6 行 (q004 / q011 / q025 / q033 / q034 / q060) + zh・en 4 行 |
| `data/ip/quiz/explanations/2023r05.json` | +107 / −30 | 解説本文 (q011 / q016 / q024 / q025 / q031) + final `note_jp` 11 + **`round1` ブロック 11 の新規 publish** |
| `translations/*.json` の他 28 exam・`explanations/` の他 28 exam | **0** | 再 merge なし |


`question_bank.json` / `by_year/2023r05.json` / `.phase1` / `.phase2` は gitignore 下 (適用前状態は scratchpad `u8/pre/` に控えて照合)。
`.phase1` の変化は `tr_q004 / q011 / q025 / q033 / q034 / q060` の 6 本、`.phase2` の expl は `expl_jp_q011 / q016 / q024 / q025 / q031` と `expl_tr_q011 / q024 / q025 / q031` の 9 本のみ (他は `cmp` で byte 同一)。
`questions.json` の key 変化は上記 15 のみ、他 2885 問は無変化 (HEAD との機械照合)。

---

## 8. 事後核験

**(a) 是正後 manifest を再構成して machdiff を再実行**

```
node scripts/quiz-fidelity-prep-any.mjs 2023r05 u8post "<91 問の番号>" --precrop
  precrop: 85/91 questions cropped; skipped 6 questions (page_mismatch 4 / chumon 0 / merged_preamble 2 / thin_band 0), 2 pages (page_mismatch)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u8post_fidelity_input_2023r05.json <同じ結果 JSON>
✗ AGENT_MISSED 2023r05-q033 stem verdict=DISCREPANT: row 9: disp ["注記網掛けの部分(空欄のセル)は,表示していない."] src ["注記網掛けの部分は,表示していない."]
✗ AGENT_MISSED 2023r05-q041 stem … (事前と同一の偽陽性)
✗ AGENT_MISSED 2023r05-q042 stem … (事前と同一の偽陽性)
machdiff: fields same=452 | AGENT_MISSED=3 | VERDICT_CONFLICT=0 | … | coverage 91/91
```

- `q092` ウ は**解消** (patch 人工物の元になった `"` が消えたため)。
- 残る 3 件は**すべて実残差でない**: `q033` = **意図的** (「（空欄のセル）」の保持、§4a。見出しの括弧は解消済) / `q041` / `q042` = 事前と同一の偽陽性 (§3)。
- precrop は再 prep で **85 枚すべて byte 不変** (適用前退避 `scratchpad/u8/pre/precrop_2023r05/` と `cmp`)。生成した `u8post` manifest は削除済。

**(b) 採用 20 件の `source_text` と是正後表示テキストの直接照合** (patch を使わない。許容表記揺れ = NFKC / 読点字種 / 空白 のみ潰す):

| 判定 | 件数 |
|---|---|
| EXACT | **6** |
| TOLERANT | **13** (読点字種・英数字周囲の空白のみ) |
| RESIDUAL | **1** — `q033` = **意図的** (描画補助「（空欄のセル）」の保持) |

- `q092 ウ` の是正後 field は `"メールアドレスの “@” の左側部分に記述されているドメイン名に基づいて, 電子メールが転送される。"` (源の `“@”` と字形一致)。

**(c) 波及ゼロの機械証明**

| 検査 | 結果 |
|---|---|
| `questions.json` 2900 問の変化 key | **15 key / 13 題** = §6 の 16 題から clean のみの是正 (q004 / q033 / q034) を除いたもの |
| `correct_answer` 変更 | **0 / 2900** (機械照合) / `git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| `translations/` 追跡下 29 exam | **2023r05 の 10 行のみ** |
| `explanations/2023r05.json` | 解説本文は q011 / q016 / q024 / q025 / q031 のみ、note 11、round1 新規 11。出荷解説中の `19万円` / `多容` / `ジェアリング` / `肖除` / `両社問` / `取り扱わなかい` / `エ業` / `定義むする` / `質疑応答事例` は **note 内の是正記述のみ**、`19 万日元` / `190,000` は **0** (grep) |
| `answer_keys.json` | **md5 `6802bb0bc13004da78ad3c4e5117d997`、mtime `1788586696` 前後同一** |

---

## 9. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE 0 件 / (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` (`? 2015h27h-mqC` / `mqD` は既存の情報行) |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm -C apps/web exec vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** |
| `node --check scripts/quiz-fidfix-S125-u8.mjs` | ✅ |
| fidfix dry-run (既定) 再実行 | ✅ **applied 0 / skipped 113** (完全冪等) |
| `correct_answer` 差分 | ✅ **0 / 2900** |
| `answer_keys.json` | ✅ byte 不変 (md5 + mtime) |
| 事後 machdiff | ✅ 実残差 0 (MISSED 3 = 意図的 1 + 偽陽性 2、§8a) |
| D-143 | ✅ MARK 付き final note **11**、純粋後置 11/11、round1 変更 0、`explanations` 内 MARK **11** |
| e2e (Playwright) | **未実行** — `apps/web/playwright.config.ts` は prod 別名を叩く構成で未 push のローカル変更は検証できない (U7 §9 と同じ)。本 unit は文字列置換のみで表示経路の変更なし |

適用前の前提検証: `quiz-phase2-merge.mjs 2023r05` を**先に実行して `git diff` 0** (merge 冪等) を確認。
merge の報告 `SUSPECT 1 (q056)` / `STEM-CORRUPTION 4 (q004* / q021* / q023* / q056†!)` は**適用前後で同一** (本 unit の変更対象外)。
再生成: `build-quiz-corpus.mjs` (2900 問 / with_fig 511) → `quiz-phase2-merge.mjs 2023r05`。図の変更は無いので `build-quiz-figures` は不要。

---

## 10. 見送り

| クラス | 該当 | 理由 |
|---|---|---|
| 描画補助 (表・図の文本化) | `q033`「（空欄のセル）」/ `q041` clean のアローダイアグラム文本化 / `q042` 組合せ表→選択肢の構造化 | 源の図・表を text で読めるようにする補助で内容は源と一致。2012h24h q092 / 2011h23a q089 precedent |
| 非出荷の key_guard note | `.phase2/expl_jp_*.json` の note (`q011`「stem_jp_clean で「変革」に是正済み」/ `q024`「多容」/ `q025`「現金19万円」/ `q093`「肖除」) | merge が読まない (U5 §7)。⑨ 継続。**q011 / q025 の note は是正前の値を正として述べている** (非出荷だが記述は偽) |
| N5 (raw stem の残存腐敗、clean が出荷層) | `q004` raw「初期費用は6円」「306万円」「9円」「500万円年」/ `q025` raw「a て c」「販売 し法」/ `q034` raw「記述 ac」/ `q060` raw の選択肢混入「誠 1る4 …」ほか | 学習者不可視。`q004` の数値 3 件は**字が変わる型** (N5 別ランク台帳の対象、`q004` は merge の STEM-CORRUPTION 名簿にも既載) |
| zh / en の体裁 | `q004` / `q034` の引用符、`q033`「（注）/ (Note)」、`q060`「[程序] / [Program]」 | 各言語の慣行 (⑨-c 保留) |
| 解説者自身の文 | `q011` の DX 定義・誤答肢・points の「変革 / transform」、`q093` correct の『削除してよいか』 | 設問の引用ではない |
| 読点の字種・空白 | 英数字周囲の空白 (`q004`「ASP 利用」ほか) | 許容表記揺れ |

---

## 11. backlog (⑨ / 次 unit へ)

### ⑨ 新規: **clean 層の推測補完** — `2023r05-q011`

- raw の脱字「ビジネスモデルの新や」を clean 化が「変革や」と**語を推測して補完**しており、源の「刷新」と違う語が出荷されていた。
  zh / en はその推測語を訳し、en は正解肢の語 (transformation) を題幹に置いていた (手掛かりの混入)。
  raw 腐敗 → clean の「修復」が源と異なる型は、raw と clean を突き合わせるだけでは検出できない (clean は日本語として自然)。
  → 他 exam で「raw に脱字、clean で語が置き換わった」箇所 (raw と clean の編集距離が 2 字以上の語) を抽出し源照合する走査を提起。

### ⑨ 新規: `[プログラム]` の括弧字種 — `2024r06`

- sidecar で「[プログラム]」が残るのは本題 (是正済) と `2024r06` の 1 題。U10 (2024r06) で同じ裁定を当てるか、横断で揃えるかを決める。
  2012h24h q094 (S113) の「［…］は表記揺れ」裁定との整合もあわせて決める。

### ⑨ (継続)

- **machdiff の「agent 計上済 field は patch を外して評価」改修**: 本 unit では `q092 ウ` (引用符正規化で patch 後に `"@""` が残る) で再発。U6 `q011` / U7 `q100` と同根。
- **machdiff の描画補助の偽陽性**: `q041` (図の文本化) / `q042` (組合せ表→選択肢) / 是正後 `q033` (網掛け注記)。既知型として許容リストを持つかの判断。
- **非出荷の expl_jp key_guard note**: `q011` / `q025` note は是正前の値を正と断定 (§10)。将来 note を出荷層に上げるなら要是正。
- **N5 の「字が変わる型」の別ランク台帳化**: 本 unit で `q004` raw「6円 / 306万円 / 9円」(slashed zero 型の数値) が加わる (**7 unit 連続**)。
- **slashed zero 型の横断走査**: U5 (q004 / q075)、U7 (q066) に続き **U8 q025**。本文の数値に 9 を含む問の全量抽出 → 源照合を提起 (3 unit で 5 件、うち正解肢 1)。
- **precrop の skip**: page_mismatch 2 ページ (`page-40` 偶数 detected 3 / expected 2、`page-41` 奇数 detected 2 / expected 3) と merged_preamble 2 (`q013` / `q033`、表・前文が帯外)。U7 ⑨ (偶数ページの頁パリティ) と同じ原因かは未検証 (page-41 は奇数で、page-40 は過検出側) — precrop 改修の 1 件にまとめて検証する。

---

## 12. Rule B (失敗記録)

**本 unit の抄写 run・是正器に失敗 attempt は無し。** run は 1 回で完走 (91/91、UNREADABLE 0)。
是正器は dry-run → `--apply` の初回で assert-once 違反 0 (`q060` の「要素を」2 回出現は dry-run 前に from を「全ての要素を先頭から」に絞って回避 — 事前の設計で、失敗 attempt ではない)。
`failures/` への新規追加は**なし**。

---

## 13. Rule D

Writer = `u8-fixer` (opus)。**Reviewer は別 `subagent_type` (opus) で本 evidence の後に別途実施すること**
(本ファイルは writer の自己申告であり、Rule D の審査は未了)。

審査時の重点:

1. **§4a q033 の部分採用** — 「（注記）」の括弧除去は採用、「（空欄のセル）」は描画補助として保持した裁定 (precedent 2 件との同型性、表の網掛けと空欄の一致)。
2. **§4b q011** — 源が「刷新」であること (3 倍)、zh「革新」/ en "revamp" の訳語選択、解説は correct の**設問引用部のみ**追随し解説者自身の「変革 / transform」を残した線引き。
3. **§4c q025** — 源が「10万円」であること (斜線入りゼロ、3 倍)、zh / en の金額、**points[0] の論拠書換** (置換でなく意味の書換) の妥当性と zh / en の同義性。
4. **§4e q060** — 「[プログラム]」→「〔プログラム〕」を 2012h24h q094 の反対 precedent がある中で採用した点、「要素 を」の空白復元 (S118 擬似言語例外 / 2026r08-q067)。
5. **§3 machdiff 偽陽性 3** (q041 図の文本化 / q042 組合せ表 / q092 patch 人工物) の線引きと、q041 の 7 行が図と一致すること。
6. **§2 severity 再分類** (agent 12/8 → fixer 11/9)、`q033` を cosmetic に移した点。
7. **§7 key_guard note 11 件** — 対象選定 (追記しない 5 件)。
8. **§7 pointSub 分岐の初実行** — 適用ループは U7 から逐字流用だが、pointSub (points_jp[idx] の書戻し) は S122 以降で初めて実データに当たった。
9. §4d の 1 字誤字 9 件 (特に `q035 ウ`「エ→工」は書体上ほぼ同形 — 文脈判定)。
10. §9 e2e 未実行の扱い。

---

## 14. Rule D 独立審閲 (S125 U8、reviewer pr-review-toolkit:code-reviewer opus)

Writer = `u8-fixer` (`oh-my-claudecode:executor` opus)、Reviewer = 本節 (`pr-review-toolkit:code-reviewer` opus、別 type・別 context)。
データ・脚本は**一切変更していない** (本節の追記のみ)。書込みを伴う再生成 (build-quiz-corpus / phase2-merge / `--apply` / prep-any) は実行していない。
源は `data/ip/exams/pages/2023r05/page-NN.png` (1432×2026) から **reviewer 自身が sharp で切り出し** (scratchpad `rv8/`、0.6 倍の全頁 + 要所 3〜4 倍) て実読した。fixer の precrop・scratchpad 画像は使っていない。

**判定: PASS-with-notes — MAJOR 0 / MINOR 0 / NIT 5。データ修正は不要。**

### 14a. 採用 20 差分の源実読 — 20/20 支持

| 頁 | 実読した field | 結果 |
|---|---|---|
| p03 | q004 題幹「（以下“自社方式”という）」(全角二重引用符) | 支持 |
| p05 | q011「…ビジネスモデルの**刷新**や新たな付加価値」(3 倍、14c) | 支持 |
| p08 | q016 ア「既存の FAQ を用いた質疑応答**の**事例を Web の画面で」 | 支持 |
| p11 | q024 イ「発注回数の多**寡**で比較」(3 倍) / q025 a「現金**10**万円」(4 倍、14d) | 支持 |
| p13 | q031 ウ「**シ**ェアリングエコノミー」(3 倍、濁点なし) | 支持 |
| p14 | q032 ア「情報収集を行い，システムの」/ イ「…性能要件などを定義するもの」、q033 注記「注記　網掛けの部分は，表示していない。」(括弧なし、14e) | 支持 |
| p15 | q034 “人間中心の AI 社会原則”、q035 ア「…様々な領域で，インターネットや AI を活用して，…」(3 倍、1 文) / ウ 行末「工」+ 次行「業製品」(14b) | 支持 |
| p28 | q060「〔プログラム〕」(亀甲括弧) /「integerArray の全ての要素 を先頭から順に…」(要素の後に空白) | 支持 |
| p33 | q072 ア「個人情報を取り扱わないなど」 | 支持 |
| p42 | q092 ウ「メールアドレスの“@”の左側部分に」/ q093 エ「“削除してよいか”の確認メッセージ」(**正解肢**) | 支持 |
| p43 | q094 ウ「…保護方法について，/ 両社間で合意したもの」 | 支持 |
| p44 | q099 ウ「タッチペンなどを用いて署名する際の筆跡や筆圧など」(**正解肢**) | 支持 |

是正後の表示テキスト (questions.json / sidecar) を上記の実読と突き合わせ、20 件とも源の語に一致 (読点の house rule「, 」と英数字周囲の空白を除く)。

### 14b. q035 ウ「エ→工」— 字形の画素計測

`node rv/cc.cjs page-15.png 1225 1355 60 50 170` → 行末の字 **(1237,1376) 24×20px・154 画素**。
同頁の選択肢記号「エ」(問35 エ の行頭) `cc.cjs page-15.png 195 1475 50 50 170` → **(208,1487) 23×16px・136 画素**。
高さが 20 vs 16 で、同じ字形ではない (漢字「工」は仮名「エ」より字面が高い)。文脈 (「エ業製品」は語として成立しない) に加えて画素でも**漢字「工」を支持**。

### 14c. q011「変革」→「刷新」— clean の推測補完の検証

- 源 p05 を 3 倍: 「ビジネスモデルの**刷新**や新たな付加価値」。raw「の新や」は「刷」の脱落、clean「の変革や」は源に無い語 → fixer の「raw の脱字を clean が推測で埋めていた」という説明は源と整合する。
- **zh「革新」/ en "revamp"**: 刷新 = 古いものを改めて新しくする。zh「革新商业模式」は自然な訳で原義に沿う (zh「刷新」は「記録を塗り替える」の意に傾くので避けたのは妥当)。en "revamp" (作り直す・刷新する) も原義に沿う。
  en の選択肢ウは "Digital transformation"、zh の選択肢ウは「数字化转型」 → 手掛かりの漏れがあったのは **en のみ** (zh「变革」は选项「转型」と字が違う)。§4b の「en は正解肢の語を題幹に置いていた」は正確。
- **解説の線引き**: 是正後に残る「変革 / 变革 / transform」は shipped 解説の q011 で 4 箇所 — correct の DX 定義文 (「業務やビジネスモデルそのものを戦略的に変革し」)、誤答肢ア・エの「…変革を表す / 示す言葉ではない」、points[0] の DX 定義。いずれも**解説者自身の DX の説明**で設問の引用ではない。引用部 (「設問の「IT を活用し，…ビジネスモデルの刷新や…」」) は jp / zh / en とも追随済。経産省の DX 定義も「変革」を用いるので、定義文の「変革」は正しい → 線引きを支持。
- 答え ウ は不変、key_guard 導出も不変。

### 14d. q025 19万円 → 10万円 — 数値と points[0] 書換

- 源 p11 を 4 倍: 「抽選で現金**10**万円」。0 は斜線入りゼロ (同頁の他の数字と同じ書体)。
- 伝播: stem raw / clean / zh「10 万日元」/ en "100,000 yen"、解説 correct・イ (jp / zh / en) すべて 10 万。shipped 全層で `19万円` / `19 万日元` / `190,000` / `惑わされず` / `misled` の残存 **0** (key_guard note を除く、`rv8/v.cjs`)。
- **points[0] 書換の正しさ**: 旧文「19万円という金額に惑わされず」は「19万円 > 一般懸賞の上限 10万円 だが問題ない」を罠とする論拠で、10万円 (上限と同額) では成り立たない → 書換は必要。
  新文「賞金の金額ではなく、応募条件（商品購入を条件とするか否か）で見分ける」は、a が誰でも応募可 = オープン懸賞 = 景品額の上限規制なし (2006 年の規制撤廃以降) という正解の論理と整合し、b (ステマ)・c (原産国の不当表示) の判定にも影響しない。答え **エ (b, c)** と矛盾しない。
  括弧内「一般懸賞は取引価額の20倍かつ最高10万円」は、正確には「取引価額 5,000 円未満は 20 倍、5,000 円以上は 10 万円」の簡略表現 (既存文、本 unit の変更外)。zh「不要看赠品金额，而要从应征条件…」/ en "not by the prize amount but by the entry conditions…" は jp と同義。

### 14e. q033 部分採用 — 「（空欄のセル）」保持は妥当

- 源 p14 の表: 網掛け = 部品a 手持在庫 2〜6 週・発注 1〜6 週、部品b 所要 2〜6 週・手持在庫 2〜6 週・発注 1〜6 週。clean の markdown 表の空欄と**セル単位で一致** (値 0/40/80/250/150 も一致)。
- 源の注記は「注記　網掛けの部分は，表示していない。」で括弧なし → 「（注記）」の除去は正しい。
- 「（空欄のセル）」は markdown が網掛けを表現できないことへの対応注記。precedent の実物を確認: `2012h24h-q092` clean「（網掛け＝休日：6，7，13，…）」/ `2011h23a-q089` clean「（■＝黒、□＝白）」。同クラスで、答えを漏らさず、除去すると「網掛けの部分」の指示先が表示上なくなる → **保持を支持**。
- zh「（注）…（空白单元格）」/ en "(Note) … (blank cells)" も同じ補助で不変は妥当。

### 14f. q060「[プログラム]」→「〔プログラム〕」— 現行規則の判断

- **2012h24h q094 は反対の precedent ではない**: S113 log (`docs/discussion/2026-08-22-session-113.md:56`) の対象は全角角括弧「［事務所統合プロジェクトのメンバ］」(源 〔…〕) で、S119 (U3a) 以前の、引用符・括弧の字種を差分として数えない時期の裁定。
  本題は ASCII の `[ ]` で、擬似言語の配列添字 `integerArray[m]` と同じ字が見出しに入っており、源の見出しとの区別がつかない。U7 q027 以降の現行規則 (引用符・括弧の字種も源に揃える) を当てるのが正しい → **採用を支持**。§4e / §11 の「反対の precedent」は「S119 以前の裁定で、字種も違う (全角［］)」と書くのが正確 (NIT-3)。
- sidecar 全 29 exam の実測 (是正後): 〔プログラム〕 8 / [プログラム] 1 (`2024r06-q062` clean)。raw には `2023r05-q064` の**対応の崩れた「[プログラム〕」**・`2024r06-q085` / `2025r07-q078` の「[プログラム]」が残る (いずれも clean は〔〕で出荷層は正、N5)。
- 「要素 を」の空白: 源 p28 で「要素」と「を」の間に空白を確認。S118 の擬似言語例外と同型 → 支持。

### 14g. machdiff 候補 3 件 — 偽陽性 3/3 を独立確認

| id.field | 源 (p18 / p42) | 判定 |
|---|---|---|
| `q041` stem | 図: 開始→A2→n1→C4→n3、開始→B3→n2、n2→D1→n3、n2→E1→n4、n3→F5→終了、n4→G5→終了。凡例 作業名 (上) / 所要日数 (下) | clean の 7 行 + 凡例注記と**全て一致** → 図の文本化 (描画補助) で偽陽性 |
| `q042` stem | 表: 単体 / 結合 / システム × ア a,b,c / イ a,c,b / ウ b,a,c / エ c,b,a | 選択肢 4 本の「単体テスト：x，結合テスト：y，システムテスト：z」と一致 → 体裁差で偽陽性 |
| `q092` ウ | 「“@”」 | 是正後の field は `“@”`。patch 後の引用符正規化の人工物 (U6 q011 / U7 q100 と同根) → 偽陽性 |

### 14h. key_guard note 11 件 (D-143)

`.phase2/generate_result_2023r05.json` を適用前控え (`scratchpad/u8/pre/phase2/`) と機械照合 (`rv8/v.cjs`):
final `note_jp` 変化 **11** (q011 q016 q024 q025 q031 q032 q035 q072 q093 q094 q099)、**純粋後置 11/11**、`key_guard_round1` 変化 **0**、note 以外の変化 **0**。
追記しない 5 件 (q004 / q033 / q034 / q060 / q092 — 引用符・括弧・注記見出し・空白のみ) の選定は U7 と同じ基準で妥当。note の文面は 14a の源実読と一致。
**zh / en への伝播 (U7 の教訓)**: 是正した選択肢 10 肢 (q016 ア / q024 イ / q032 イ / q035 ア・ウ / q072 ア / q092 ウ / q093 エ / q094 ウ / q099 ウ) の zh / en を全件読んだ — いずれも源の語義 (「工业产品」「是否确认删除」「签名时」「双方」「多少」等) で腐敗の伝播は**なし**。q035 ア zh / en も 1 文。題幹は q011 / q025 の zh / en を是正済。

### 14i. 波及ゼロ

| 検査 | 結果 |
|---|---|
| `questions.json` (HEAD と全 2900 問照合) | 変化 **13 題 / 15 key** (§8c と一致)。`correct_answer` 変化 **0 / 2900**、`git diff -U0 data \| grep -c '"correct_answer"'` = 0 |
| `question_bank.json` / `by_year/2023r05.json` (適用前控えと照合) | 変化はそれぞれ**同じ 13 題**、key は stem_jp / choices_jp のみ |
| `.phase1` (100 本) | byte 変化 6 本 (q004 q011 q025 q033 q034 q060)。**q033 は内容同一・再直列化のみ** (NIT-1) |
| `.phase2` (201 本) | 変化 10 本 = expl_jp ×5 (q011 q016 q024 q025 q031) + expl_tr ×4 (q011 q024 q025 q031) + generate_result — §7 と一致 |
| `answer_keys.json` | md5 `6802bb0bc13004da78ad3c4e5117d997`、mtime `1788586696` — §2 と一致 (git 管理外なので根拠は md5 + mtime) |
| 他 exam の translations / explanations | `git status` 上の変更は 2023r05 の 2 本のみ |
| 2023r05 sidecar のキー集合 | {`stem`, `choices`, `stem_jp_clean`}、clean **63 題**、**`choices_jp_clean` は無い** → 選択肢 12 置換はすべて出荷層、§7 どおり |
| shipped の腐敗語残存 (key_guard 除く) | `多容` `ジェアリング` `肖除` `両社問` `取り扱わなかい` `エ業` `定義むする` `質疑応答事例` `[プログラム]` `（注記）` `ビジネスモデルの新や` いずれも **0** |
| sidecar ↔ `.phase1` | 是正した 4 本 (q011 / q025 / q034 / q060) は clean / zh / en とも一致。q004 / q033 の不一致は**適用前から** (U7 NIT-3 と同型、本 unit 起因ではない) |

### 14j. CLEAN 標本 (fixer の q078 / q028 / q083 と重ならない 4 問)

| id | 源 | 結果 |
|---|---|---|
| `q010` (p05) | 題幹「フォーラム標準に関する記述として，…」+ 4 肢 (工業製品 / 公的な標準化機関 / 特定の企業 / 複数の企業などが集まって) | 一致 |
| `q029` (p13) | 題幹「不正な販売行為を防ぐために，…コピープロテクトを無効化する…」+ 4 肢 商標法 / 特定商取引 / 不正アクセス / 不正競争防止法 | 一致 |
| `q091` (p42) | 題幹「AI に利用されるニューラルネットワークにおける活性化関数…」+ 4 肢 | 一致 |
| `q095` (p43) | 題幹 + a〜c + 4 肢 a / a,b / b / c | 一致 (源の下線「確保されなかった例」は corpus 全体が下線を持たない既知の規約ギャップ — S110 backlog。本 unit の対象外) |

→ **見落とし 0**。

### 14k. ゲート再実行 (reviewer 実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran / all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE 0 / (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 (`?` 情報行は 11 行、既存) |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm -C apps/web exec vitest run` | ✅ 33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503) |
| machdiff (事前 manifest) | ✅ same=452 / AGENT_MISSED 3 / VERDICT_CONFLICT 0 / coverage 91/91 — §3 と逐一同一 |
| `node scripts/quiz-fidfix-S125-u8.mjs` (既定 dry-run) | ✅ applied 0 / skipped 113、⚠ 行 0 |
| `node --check scripts/quiz-fidfix-S125-u8.mjs` | ✅ |

事後 machdiff (u8post manifest の再生成) は prep-any が `.phase2` に書くため**実行していない**。14a の是正後表示と源実読の直接照合で代替した。

### 14l. pointSub 分岐のコードレビュー

```js
if (p.jp) { const [f, t] = p.jp; const arr = j.points_jp; if (typeof arr?.[p.idx] !== "string") throw …;
  const box = { v: arr[p.idx] }; if (sub(box, "v", f, t, …)) arr[p.idx] = box.v; }
if (p.zh) { … sub(tr.points[p.idx], "zh", f, t, …); }
```

- jp: `points_jp` は文字列配列なので `box` で包んで `sub` (assert-once + to の肯定確認) を通し、true のときだけ書き戻す — 正しい。冪等 (再実行は `s.includes(to)` で skip、dry-run 0/113 で確認)。
- zh / en: `expl_tr.points` は `{zh, en}` オブジェクトの配列 (実測) なので直接 `sub` でよい。
- 実データ: `expl_jp_2023r05-q025.json` の `points_jp[0]` と `expl_tr` の `points[0].zh/.en` がともに新文、shipped `explanations/2023r05.json` の points[0] 3 言語も新文 (14d)。
- 細部: jp は要素欠落で throw するが、zh / en は `tr.points[idx]` が undefined のとき `sub` が ⚠ ログを出して続行する (非対称)。今回は ⚠ 0 行で実害なし → NIT-2。

### 14m. 指摘

- **NIT-1 (`.phase1` の無変更ファイル書戻し)**: 適用ループは `if (t1) wj(t1f, t1)` を**無条件**で実行するため、置換 0 の `tr_2023r05-q033.json` が内容同一のまま整形だけ変わった (適用前 1,059 byte の compact 形式 → 1,147 byte のインデント形式)。§7 / §8 の「`.phase1` の変化 6 本」は byte 上は正しいが内容上は **5 本**。データへの害はない。次の fidfix で「applied > 0 のファイルだけ書く」にするとよい (U3a 以来の共通ループなので横断で)。
- **NIT-2 (pointSub の欠落時の非対称)**: 14l。zh / en も jp と同じく欠落で throw するのが望ましい。
- **NIT-3 (§4e / §11 の precedent 記述)**: 2012h24h q094 は全角「［…］」で S119 以前の裁定 → U8 の ASCII `[…]` とは字種も時期も違い、反対の precedent ではない (14f)。§11 の「[プログラム] … `2024r06` の 1 題」は `2024r06-q062` (clean) と ID を明記し、raw の `2023r05-q064`「[プログラム〕」(崩れた対応) / `2024r06-q085` / `2025r07-q078` を N5 として併記するとよい。
- **NIT-4 (脚本冒頭コメントの件数)**: NOTE_APPEND の上のコメント「本 unit の追記対象 **12 問**」は誤りで、実体は 11 (語義 9 ∪ 正解肢 3、q035 重複)。evidence §7 の 11 は正しい。
- **NIT-5 (evidence 記述精度)**: §9 の chumon `--check` の情報行は `mqC` / `mqD` だけでなく計 11 行 (`2015h27h-mqA` ほか)。いずれも既存で結果に影響なし。

### 14n. 再現コマンド

```
S=<scratchpad>/rv ; P=data/ip/exams/pages/2023r05
node $S/crop.cjs $P/page-NN.png out.png <left> <top> <w> <h> [scale]    # 源の自前切り出し (0.6 全頁 / 3〜4 倍)
node $S/crop.cjs $P/page-11.png z25.png 640 1030 260 50 4                # q025「10万円」
node $S/crop.cjs $P/page-05.png z11.png 850 1590 380 55 3                # q011「刷新」
node $S/cc.cjs $P/page-15.png 1225 1355 60 50 170                        # q035 行末「工」24×20
node $S/cc.cjs $P/page-15.png 195 1475 50 50 170                         # 選択肢記号「エ」23×16
node <scratchpad>/rv8/v.cjs <scratchpad>/u8/pre                          # key_guard / bank / by_year / .phase1 / .phase2 / questions / 残存語
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u8_fidelity_input_2023r05.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u8_2023r05_sn.json
node scripts/quiz-keys-crosscheck.mjs ; node scripts/quiz-pagefix-derive-groups.mjs --assert-clean
node scripts/quiz-chumon-groups-build.mjs --check ; node scripts/quiz-fidfix-S125-u8.mjs
pnpm -C apps/web exec tsc --noEmit ; pnpm -C apps/web exec vitest run
md5 -q data/ip/exams/answer_keys.json ; stat -f %m data/ip/exams/answer_keys.json
```

### 14o. 結論

**PASS-with-notes (MAJOR 0 / MINOR 0 / NIT 5)**。採用 20 差分は源実読で 20/20 支持、正解肢 3 肢 (q035 ア / q093 エ / q099 ウ) の是正は源どおりで `correct_answer` 不変。
q011 の推測補完の是正と zh / en の訳語、q025 の斜線ゼロと points[0] の論拠書換はいずれも正しく、答えの導出と整合する。q033 の部分採用・q060 の括弧字種の採用も現行規則に合う。
machdiff 3 件は偽陽性、zh / en への腐敗伝播なし、波及ゼロ、ゲートすべて緑。**データ修正は不要**。NIT 1・2・4 は次の fidfix 脚本で、NIT 3・5 は evidence / ⑨ の記述で対応すればよい。

## 15. NIT 処置 (主 context、S125)
- NIT-1: `.phase1` q033 は置換 0 でも整形のみ変わって書き戻される (無条件 write) — 内容不変、⑨ (脚本雛形の改善: 変更が無いファイルは書かない)。
- NIT-2: pointSub で zh/en 対象が欠落しても throw しない — 本 unit は reviewer が全件一致を確認済、⑨ (雛形に to 肯定 assert を zh/en にも)。
- NIT-3: §4e / §11 の precedent 記述 — 2012h24h q094 は全角［］・S119 以前の裁定で反対 precedent ではない (reviewer §14 に明記)、本節で補記。
- NIT-4: 脚本コメント「12 問」→「11 問」訂正済 (コードの挙動は不変)。
- NIT-5: chumon の情報行は 11 行 (判定は一致)。
