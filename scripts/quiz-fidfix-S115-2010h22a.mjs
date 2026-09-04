#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S115 (2010h22a).
//
// Provenance A — s7x 保真核験 (双 pass, Rule D)。母数 34/100 = **Phase 2 最大**:
//   pass 1 agentType general-purpose                 → CLEAN 28 / DISCREPANT 6、差分 17
//   pass 2 agentType pr-review-toolkit:code-reviewer → CLEAN 29 / DISCREPANT 5、差分 13
//   (id, field, text) **一致 12** / p1-only 4 / p2-only 1、正解肢上 0 / answer_affecting 0 /
//   UNREADABLE 0。DISCREPANT: q048 q079 q086 q094 q095 q097 (union)。
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S115_2010h22a{,_pass2}.json
//   主 context 裁決: page-19 / page-34 / page-38 / page-43 を実読して全件確認 (S115 §1)。
//
// Provenance B — 決定的 junk スキャン (主 context, 全 100 問 × 表示層 stem+choices)。
//   走査規則: 分野見出し混入 / ASCII 引用符 / 語中空白 / 重複字 / 末尾 junk / 選択肢の
//   stem 漏出 / 中問リンク切れ。markdown 表の行末 `|` を偽陽性として除外したうえで
//   26 hit → 源実読で裁決。**s7x 監査が CLEAN と言った問にも残っていた** (S114 §1b と同型)。
//
// 中問 (q089〜100) の是正は本スクリプトではなく D-141 の 2 段で実施済:
//   ① quiz-chumon-normalize-S115.mjs   — 言い換え版・見出し付きの旧前文を剥がす
//   ② quiz-chumon-preamble-apply.mjs   — 原典逐字の前文 (Extract≠Verify, 6/6 PASS) を前置
//   これにより q089 の見出し誤り (問89〜92 → 問89) / q090 の書き換え+加筆 /
//   q092 の 表2 重複 / **q094 の前文 12 箇所書き換え + 選択肢漏出** / q097 の
//   「部門で・計画した」+〔ストラテジ〕+「問97」混入 がまとめて解消される。
//
// NOT fixed here (裁決理由つき):
//   - 語中空白 (q028/q032/q047 など raw のみ): 表示層は clean が無い問だが、これらは
//     corpus 全体に分布する OCR 由来の折り返し空白で本 exam 局所の欠陥ではない (S113/S114 と
//     同じ backlog 裁定)。熟語を割るもの・ルビ由来のものだけを直す方針を踏襲し、本 exam には
//     該当なし。
//   - q079/q084/q087/q095 の ASCII 引用符 ("業者"表 等): 源は全角 “…”。corpus 実測で
//     ASCII 引用符は 139 問・全角は 92 問に分布する **横断的な正規化課題**であり、本 exam
//     だけ直すと不整合が増える。混在 (同一問に両方) の q078 のみ本スクリプトで是正し、
//     残りは横断 backlog へ。
//   - q087 zh の「社员」「部署」(日式借词): S114 Rule A が指摘した zh 本土化 backlog と同系。
//     trsweep / Rule A で扱う。
//
// Run: node scripts/quiz-fidfix-S115-2010h22a.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2010h22a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const PKFK_NOTE_JP =
  "（下線のうち実線は主キー，破線は外部キーを表す。" +
  "業者表：業者コードが実線下線。仕入明細表：伝票番号・枝番が実線下線，商品コードが破線下線。" +
  "商品表：商品コードが実線下線，業者コードが破線下線。）";
const PKFK_NOTE_ZH =
  "（下划线中实线表示主键，虚线表示外键。" +
  "业者表：业者编码为实线下划线。进货明细表：单据编号、行号为实线下划线，商品编码为虚线下划线。" +
  "商品表：商品编码为实线下划线，业者编码为虚线下划线。）";
const PKFK_NOTE_EN =
  "(Among the underlines, a solid underline marks a primary key and a dashed underline marks a foreign key. " +
  "Supplier table: Supplier Code is solid-underlined. Purchase Detail table: Slip Number and Line Number are " +
  "solid-underlined, Product Code is dashed-underlined. Product table: Product Code is solid-underlined, " +
  "Supplier Code is dashed-underlined.)";

const KEY87_JP =
  "（下線のうち実線は主キー，破線は外部キーを表す。" +
  "部署表：部署コードが実線下線。都道府県表：都道府県コードが実線下線。A 表：社員番号が実線下線。" +
  "選択肢は 4 肢とも 社員番号 が実線下線で，部署コード・都道府県コードは破線下線。）";
const KEY87_ZH =
  "（下划线中实线表示主键，虚线表示外键。" +
  "部署表：部署代码为实线下划线。都道府县表：都道府县代码为实线下划线。A 表：社员编号为实线下划线。" +
  "四个选项中社员编号均为实线下划线，部署代码、都道府县代码为虚线下划线。）";
const KEY87_EN =
  "(Among the underlines, a solid underline marks a primary key and a dashed underline marks a foreign key. " +
  "Department table: Department code is solid-underlined. Prefecture table: Prefecture code is solid-underlined. " +
  "Table A: Employee number is solid-underlined. In all four answer choices Employee number is solid-underlined, " +
  "while Department code and Prefecture code are dashed-underlined.)";

// kind: "stem" (layer raw|clean|both) / "choice_jp" (key) / "tr_stem" (lang) / "tr_choice" (key, lang)
const FIXES = [
  // ═══════════ A. s7x 保真核験 ═══════════

  // ---- q048 (page-19): 図の資源化で **源に無い「V 字モデル」という概念名を付加**し、
  //      同時に **右側の上向き実線矢印 3 本 (単体テスト → a → b → c) を脱落**させていた。
  //      源の図中文字は 要件定義/外部設計/内部設計/プログラミング/単体テスト/a/b/c/凡例 のみ。
  //      双 pass が 2 件とも一致して報告。主 context が page-19 実読で確認。
  {
    id: q(48), kind: "stem", layer: "clean",
    from: "図は V 字モデルを表す。左側にシステム開発プロセスの工程, 右側に対応するテストの種類を配置し, 破線の矢印 (←---→) が「対応する工程」を, 実線の矢印 (←——) が「システム開発プロセスの流れ」を示す。",
    to: "図は, 左側にシステム開発プロセスの工程, 右側に対応するテストの種類を配置したものである。破線の矢印 (←---→) が「対応する工程」を, 実線の矢印 (←——) が「システム開発プロセスの流れ」を示す。",
    why: "semantic (双 pass 一致): 源に「V 字モデル」の語は無い。工程⇔テストの対応関係の呼称そのものであり、図形から自力で読み取るべき情報を名指しで与えてしまっていた",
  },
  {
    id: q(48), kind: "stem", layer: "clean",
    from: "システム開発プロセスの流れは 要件定義 → 外部設計 → 内部設計 → プログラミング の順で, 各工程はその右側のテストと「対応する工程」として破線で結ばれている。",
    to: "実線の矢印は, 左側を 要件定義 → 外部設計 → 内部設計 → プログラミング と下向きに進み, 続いて右側を 単体テスト → a → b → c と上向きに進む。破線の矢印は, 左右で「対応する工程」どうしを結んでいる。",
    why: "semantic (双 pass 一致): 源の図に明示されている右側の上向き実線矢印 3 本 (単体テスト→a→b→c) が脱落。dataset 自身が実線を「システム開発プロセスの流れ」と定義しているのに、その流れが途中で切れていた",
  },
  {
    id: q(48), kind: "tr_stem", lang: "zh",
    from: "图表示 V 字模型。左侧为系统开发过程的各工序，右侧为对应的测试种类，虚线箭头（←---→）表示「对应的工序」，实线箭头（←——）表示「系统开发过程的流向」。",
    to: "图中左侧为系统开发过程的各工序，右侧为对应的测试种类。虚线箭头（←---→）表示「对应的工序」，实线箭头（←——）表示「系统开发过程的流向」。",
    why: "zh も同じ捏造 (「图表示 V 字模型」) をしていたため連帯是正",
  },
  {
    id: q(48), kind: "tr_stem", lang: "zh",
    from: "系统开发过程的流向为 需求定义 → 外部设计 → 内部设计 → 编程 的顺序，各工序与其右侧的测试以「对应的工序」用虚线相连。",
    to: "实线箭头在左侧按 需求定义 → 外部设计 → 内部设计 → 编程 的顺序向下推进，随后在右侧按 单元测试 → a → b → c 的顺序向上推进。虚线箭头把左右两侧「对应的工序」连接起来。",
    why: "zh も右側の上向き実線矢印を脱落させていたため連帯是正",
  },
  {
    id: q(48), kind: "tr_stem", lang: "en",
    from: "The figure represents a V-model. The development process phases are placed on the left and the corresponding test types on the right.",
    to: "In the figure, the development process phases are placed on the left and the corresponding test types on the right.",
    why: "en も同じ捏造 (\"represents a V-model\") をしていたため連帯是正",
  },
  {
    id: q(48), kind: "tr_stem", lang: "en",
    from: "The flow of the system development process is in the order requirements definition → external design → internal design → programming, and each phase is linked by a dashed line to the test on its right as a 'corresponding phase'.",
    to: "The solid arrows run down the left side in the order requirements definition → external design → internal design → programming, and then continue up the right side in the order unit testing → a → b → c. The dashed arrows link each left-hand phase to its 'corresponding phase' on the right.",
    why: "en も右側の上向き実線矢印を脱落させていたため連帯是正",
  },

  // ---- q079 (page-31): 設問文が「下線は主キーを示し，破線は外部キーを示す」と明示的に
  //      参照しているのに、markdown 平坦化で **実線下線 (主キー) / 破線下線 (外部キー) の
  //      記号注記が全脱落**していた。参照先が表示テキストから消えている状態。
  //      corpus 既存の表記法 (2011h23a-q057) に倣い、表の直後に括弧注記を置く。
  {
    id: q(79), kind: "stem", layer: "clean",
    from: "商品\n\n| 商品コード | 商品名 | 業者コード | 単価 |\n|---|---|---|---|",
    to: `商品\n\n| 商品コード | 商品名 | 業者コード | 単価 |\n|---|---|---|---|\n\n${PKFK_NOTE_JP}`,
    why: "semantic (pass1): 主キー/外部キーの下線が全脱落し、設問文の参照先が表示上に存在しなかった。corpus 既存の注記法 (2011h23a-q057) に合わせて復元",
  },
  {
    id: q(79), kind: "tr_stem", lang: "zh",
    from: "商品\n\n| 商品编码 | 商品名 | 业者编码 | 单价 |\n|---|---|---|---|",
    to: `商品\n\n| 商品编码 | 商品名 | 业者编码 | 单价 |\n|---|---|---|---|\n\n${PKFK_NOTE_ZH}`,
    why: "zh も同じ脱落 (設問文は「下划线表示主键，虚线表示外键」と参照している)",
  },
  {
    id: q(79), kind: "tr_stem", lang: "en",
    from: "Product\n\n| Product Code | Product Name | Supplier Code | Unit Price |\n|---|---|---|---|",
    to: `Product\n\n| Product Code | Product Name | Supplier Code | Unit Price |\n|---|---|---|---|\n\n${PKFK_NOTE_EN}`,
    why: "en も同じ脱落",
  },

  // ---- q086 (page-33): 源は「…時間を　a　タイム，単位時間当たりに…量を　b　という。」
  //      という 1 文の並列構造 (「という」は文末に 1 回)。dataset は「という。」を追加して
  //      2 文に割り、源の読点を消していた。双 pass 一致。
  {
    id: q(86), kind: "stem", layer: "clean",
    from: "までの時間を　a　タイムという。単位時間当たりに処理される仕事の量を　b　という。",
    to: "までの時間を　a　タイム，単位時間当たりに処理される仕事の量を　b　という。",
    why: "semantic (双 pass 一致): 源に無い「という」の追加 + 並列の読点「，」の消失。a と b は一つの「という」を共有する並列文",
  },

  // ---- q087 (page-34): q079 と同型の脱落。両 pass とも CLEAN と判定したが、主 context の
  //      決定的 PK/FK スキャンが検出し、page-34 実読で確認した。**選択肢 4 肢にも下線がある**
  //      (社員番号=実線 / 部署コード・都道府県コード=破線) 点が本問の弁別材料。
  {
    id: q(87), kind: "stem", layer: "clean",
    from: "A\n| 社員番号 | 社員名 | 部署名 | 都道府県名 | 年齢 |\n| --- | --- | --- | --- | --- |",
    to: `A\n| 社員番号 | 社員名 | 部署名 | 都道府県名 | 年齢 |\n| --- | --- | --- | --- | --- |\n\n${KEY87_JP}`,
    why: "semantic (主 context の PK/FK スキャン + page-34 実読): 設問文が参照する下線注記が全脱落。選択肢側の破線 (外部キー) が本問の弁別材料である",
  },
  {
    id: q(87), kind: "tr_stem", lang: "zh",
    from: "A\n| 社员编号 | 社员名 | 部署名 | 都道府县名 | 年龄 |\n| --- | --- | --- | --- | --- |",
    to: `A\n| 社员编号 | 社员名 | 部署名 | 都道府县名 | 年龄 |\n| --- | --- | --- | --- | --- |\n\n${KEY87_ZH}`,
    why: "zh も同じ脱落",
  },
  {
    id: q(87), kind: "tr_stem", lang: "en",
    from: "A\n| Employee number | Employee name | Department name | Prefecture name | Age |\n| --- | --- | --- | --- | --- |",
    to: `A\n| Employee number | Employee name | Department name | Prefecture name | Age |\n| --- | --- | --- | --- | --- |\n\n${KEY87_EN}`,
    why: "en も同じ脱落",
  },

  // ---- q095 (page-41): 図1 のキャプションに **源に無い説明句**が加筆されていた。
  //      源は「図1　ポリシの許可区分が ACCEPT のときの設定の記述」で終わる。
  //      ①〜④ は源では表の左脇の矢印記号として図示されるのみ。
  {
    id: q(95), kind: "stem", layer: "clean",
    from: "図 1　ポリシの許可区分が ACCEPT のときの設定の記述（①〜④は設定を追加できる位置を示す）",
    to: "図 1　ポリシの許可区分が ACCEPT のときの設定の記述",
    why: "semantic (pass1、pass2 も同旨): 源のキャプションに括弧書きは無い。内容は真だが原典に無い語句の追加",
  },
  {
    id: q(95), kind: "tr_stem", lang: "zh",
    from: "图 1　策略许可类别为 ACCEPT 时的设置描述（①〜④表示可追加设置的位置）",
    to: "图 1　策略许可类别为 ACCEPT 时的设置描述",
    why: "zh も同じ加筆",
  },
  {
    id: q(95), kind: "tr_stem", lang: "en",
    from: "Figure 1　Setting description when the policy permission type is ACCEPT (①〜④ indicate positions where a setting can be added)",
    to: "Figure 1　Setting description when the policy permission type is ACCEPT",
    why: "en も同じ加筆",
  },

  // ═══════════ B. 決定的 junk スキャン (源実読で裁決) ═══════════

  // ---- q052 (page-20) 選択肢エ 末尾の異物。源は「…作業効率が向上する。」で終わる。
  {
    id: q(52), kind: "choice_jp", key: "エ",
    from: "要素分解を細かくすればするほど作業効率が向上する。|  。。。 。 |",
    to: "要素分解を細かくすればするほど作業効率が向上する。",
    why: "cosmetic: 源 (page-20 実読) に無い末尾 junk「|  。。。 。 |」。zh/en は既に正しい (波及なし)",
  },

  // ---- q078 (page-30) 引用符の**混在**。開きは全角 “ なのに閉じが ASCII " になっている。
  //      corpus 全体の引用符正規化は backlog だが、**同一問内で開閉が食い違う**のは
  //      表示上の破損なので本 exam で是正する。
  {
    id: q(78), kind: "stem", layer: "clean",
    from: "情報の“機密性\"や“完全性\"を維持するために",
    to: "情報の“機密性”や“完全性”を維持するために",
    why: "cosmetic: 開き “ と閉じ \" の混在 (同一問内で開閉が食い違う破損)。zh は既に正しい “机密性”",
  },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

const replaceOnce = (s, f, where) => {
  const n = s.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${where}: expected exactly 1 occurrence of «${f.from.slice(0, 60)}…», found ${n}`);
  return s.replace(f.from, f.to);
};

const counts = { raw: 0, clean: 0, choice: 0, tr: 0 };
for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const t = trDoc.questions[f.id];

  if (f.kind === "stem") {
    if (f.layer === "raw" || f.layer === "both") {
      rec.stem_jp = replaceOnce(rec.stem_jp, f, "raw");
      counts.raw++;
      console.log(`  ✓ ${f.id} [raw]      ${f.why}`);
    }
    if (f.layer === "clean" || f.layer === "both") {
      if (!t?.stem_jp_clean) throw new Error(`${f.id}: no stem_jp_clean`);
      t.stem_jp_clean = replaceOnce(t.stem_jp_clean, f, "clean");
      counts.clean++;
      console.log(`  ✓ ${f.id} [clean]    ${f.why}`);
    }
  } else if (f.kind === "choice_jp") {
    rec.choices_jp[f.key] = replaceOnce(rec.choices_jp[f.key], f, `choice_jp.${f.key}`);
    counts.choice++;
    console.log(`  ✓ ${f.id} [choice ${f.key}] ${f.why}`);
  } else if (f.kind === "tr_stem") {
    if (!t?.stem?.[f.lang]) throw new Error(`${f.id}: no tr stem ${f.lang}`);
    t.stem[f.lang] = replaceOnce(t.stem[f.lang], f, `tr_stem.${f.lang}`);
    counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.lang}]    ${f.why}`);
  } else if (f.kind === "tr_choice") {
    if (!t?.choices?.[f.key]?.[f.lang]) throw new Error(`${f.id}: no tr choice ${f.key}.${f.lang}`);
    t.choices[f.key][f.lang] = replaceOnce(t.choices[f.key][f.lang], f, `tr_choice.${f.key}.${f.lang}`);
    counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.key}.${f.lang}] ${f.why}`);
  }
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S115-2010h22a: raw ${counts.raw} / clean ${counts.clean} / choice ${counts.choice} / tr ${counts.tr}`);
console.log(`  next: node scripts/build-quiz-corpus.mjs`);
