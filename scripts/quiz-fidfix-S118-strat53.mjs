#!/usr/bin/env node
// Stage 6 / Quiz — S118 ⑤-3 層化無作為保真核験 (seed 118、4 exam × 20 問 = 80 問、gp/cr 双 pass) の差分を是正する。
// 源: S118 log の 8 workflow (2015h27a / 2018h30a / 2020r02o / 2026r08 × {gp, cr})。
//     結果 JSON = evidence/phase5/stage_06_quiz_fidelity/strat53_fidelity_S118_<exam>_<gp|cr>.json
//     機械 diff = scripts/quiz-fidelity-machdiff.mjs (S117 §22b) → AGENT_MISSED から 2 題 8 フィールドを追加採用。
//
// 層・方針は quiz-fidfix-S117-batch4.mjs と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②: .phase1 入力層が stale。sidecar と .phase1 の両方に同じ置換を当てる)
//   - explanations は .phase2 (expl_jp_/expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等。page 番号は question_bank.source から
//
// 採用した差分 (12 題は双 pass 由来、2 題は machdiff 由来):
//   2015h27a-q015 stem  B原料 49kg → 40kg (semantic。源 page-08、双 pass 一致。正解字母イ=6 は不変だが与件が源と異なる)
//   2018h30a-q066 ウ    「利用されでいる」→「利用されている」(非語。gp=semantic / cr=cosmetic で severity 不一致 → 主 context
//                        が page-27 を原解像度で実読し「て」を確認、非語のため semantic を採る)
//   2018h30a-q070 イ    末尾「ものである。」の脱落を復元 (源は 2 行組。他 3 肢はいずれも「ものである。」で終わる)
//   2018h30a-q096 エ    **肯定/否定が源と完全逆転 (answer_affecting)**。源「2.4GHz 帯は…受けないが，5GHz 帯は…受ける」。
//                        腐敗版は現実として正しい記述に読めるため正解肢イと二重正解化していた。主 context が page-38 を実読して確定。
//                        → 選択肢 jp/zh/en + 解説 distractor エ jp/zh/en を全文書き換え (S117 の answer_affecting 処置と同型)
//   2020r02o-q010 ア    「コミュニケーションの環」→「輪」(zh「圈子」/ en「circle」は既に正しく不変)
//   2020r02o-q018 エ    正解肢末尾の混入「ig 9 Je」(ノンブル「- 9 -」+ スキャン汚れ) を除去
//   2020r02o-q077 ア    正解肢の「構 .築」→「構築」(余白の汚れ由来のピリオド混入)
//   2026r08-q013 ウ     正解肢末尾の空白 17 + 開き括弧「を除去
//   2026r08-q036 stem   「導入作業について，」→「導入作業の行動に関する記述のうち，」(限定句の脱落を復元) + zh/en 追随
//   2026r08-q037 ア     「FPP 法」→「FP 法」(実在しない技法名になっていた。zh/en は既に FP で不変)
//   2026r08-q062 ウ     「1/0 回数」→「I/O 回数」(zh/en は既に I/O で不変)
//   2026r08-q065 ア     「Web サーバヘ」(片仮名ヘ U+30D8) →「へ」(平仮名 U+3078)
//   2018h30a-q041 ア〜エ **machdiff 由来**。丸数字の区切り「，」が全 4 肢で脱落 (源 page-17 を原解像度で実読して確認)。正解肢アを含む
//   2018h30a-q057 ア〜エ **machdiff 由来**。同上 (源 page-24 実読)。正解肢エを含む
//
// 見送り (evidence に理由を明記):
//   2015h27a-q085 stem  図1 キャプションが導入文に書き換わっている = D-144 段 3 の共有図埋込み仕様 (S117 §28)。既知・意図的で欠陥ではない
//   2015h27a-q071 stem  見出し「[処理一覧]」 vs 源「〔処理一覧〕」= 括弧字形の表記揺れ。corpus 全体で [ ] 系 20 題 / 〔 〕系 91 題が併存する
//                        横断クラスのため、本 batch では触らず backlog (N6-b) に登記
//   丸数字区切りの同族 13 フィールド (2015h27h-q070 ×3 / 2018h30a-q081 ×3 / ほか) は源未照合のため backlog (N6-a) に登記
//
// Run: node scripts/quiz-fidfix-S118-strat53.mjs [--dry-run]
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2015h27a && node scripts/quiz-phase2-merge.mjs 2018h30a

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0; const log = [];

// assert-once: 対象文字列がちょうど 1 回だけ出ることを要求し、2 回以上なら中断 (誤爆防止)。
// 冪等: to ⊃ from で既に to が入っている、または from が 0 回なら skip。
function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  obj[key] = s.replace(from, to); applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 36)}」→「${to.slice(0, 36)}」`); return true;
}

const Q013_TAIL = "できる情報" + " ".repeat(17) + "「"; // 源に無い空白 17 + 開き括弧

const FIX = {
  // ── 2015h27a ────────────────────────────────────────────────────────────
  "2015h27a-q015": {
    jp: [["stem", "B原料は49kgである場合", "B原料は40kgである場合"]],
    zh: [["stem", "B原料为49kg时", "B原料为40kg时"]],
    en: [["stem", "49 kg for material B", "40 kg for material B"]],
  },
  // ── 2018h30a ────────────────────────────────────────────────────────────
  "2018h30a-q066": { jp: [["ウ", "データ交換などに利用されでいる。", "データ交換などに利用されている。"]] },
  // 源は 2 行組で 2 行目「ものである。」が脱落。zh/en は既に完結した文 (「它给出了…。」/「It presents ….」) で不変。
  "2018h30a-q070": { jp: [["イ", "具体的な手順を示す", "具体的な手順を示すものである。"]] },
  // answer_affecting: 肯定/否定の完全逆転。
  "2018h30a-q096": {
    jp: [["エ", "2.4GHz帯は家電製品の電波干渉を受けるが，5GHz帯は電波干渉を受けない。", "2.4GHz帯は家電製品の電波干渉を受けないが，5GHz帯は電波干渉を受ける。"]],
    zh: [["エ", "2.4 GHz 频段会受到家用电器的电波干扰，而 5 GHz 频段不会受到电波干扰。", "2.4 GHz 频段不会受到家用电器的电波干扰，而 5 GHz 频段会受到电波干扰。"]],
    en: [["エ", "The 2.4 GHz band is subject to radio interference from home appliances, but the 5 GHz band is not subject to any radio interference.", "The 2.4 GHz band is not subject to radio interference from home appliances, but the 5 GHz band is subject to radio interference."]],
  },
  // machdiff 由来: 丸数字の区切り「，」脱落 (源 page-17 実読)。zh/en も同じ列挙を写しているため 3 言語とも揃える。
  "2018h30a-q041": {
    jp: [
      ["ア", "経営者：①②　情報システム部門の責任者：③④", "経営者：①，②　情報システム部門の責任者：③，④"],
      ["イ", "経営者：①③　情報システム部門の責任者：②④", "経営者：①，③　情報システム部門の責任者：②，④"],
      ["ウ", "経営者：②③　情報システム部門の責任者：①④", "経営者：②，③　情報システム部門の責任者：①，④"],
      ["エ", "経営者：②④　情報システム部門の責任者：①③", "経営者：②，④　情報システム部門の責任者：①，③"],
    ],
    zh: [
      ["ア", "经营者：①②　信息系统部门负责人：③④", "经营者：①，②　信息系统部门负责人：③，④"],
      ["イ", "经营者：①③　信息系统部门负责人：②④", "经营者：①，③　信息系统部门负责人：②，④"],
      ["ウ", "经营者：②③　信息系统部门负责人：①④", "经营者：②，③　信息系统部门负责人：①，④"],
      ["エ", "经营者：②④　信息系统部门负责人：①③", "经营者：②，④　信息系统部门负责人：①，③"],
    ],
    en: [
      ["ア", "Management: ①② / Head of information systems department: ③④", "Management: ①, ② / Head of information systems department: ③, ④"],
      ["イ", "Management: ①③ / Head of information systems department: ②④", "Management: ①, ③ / Head of information systems department: ②, ④"],
      ["ウ", "Management: ②③ / Head of information systems department: ①④", "Management: ②, ③ / Head of information systems department: ①, ④"],
      ["エ", "Management: ②④ / Head of information systems department: ①③", "Management: ②, ④ / Head of information systems department: ①, ③"],
    ],
  },
  // machdiff 由来: 同上 (源 page-24 実読)。
  "2018h30a-q057": {
    jp: [["ア", "①②", "①，②"], ["イ", "①②③", "①，②，③"], ["ウ", "①③", "①，③"], ["エ", "②③", "②，③"]],
    zh: [["ア", "①②", "①，②"], ["イ", "①②③", "①，②，③"], ["ウ", "①③", "①，③"], ["エ", "②③", "②，③"]],
    en: [["ア", "① ②", "①, ②"], ["イ", "① ② ③", "①, ②, ③"], ["ウ", "① ③", "①, ③"], ["エ", "② ③", "②, ③"]],
  },
  // ── 2020r02o ────────────────────────────────────────────────────────────
  "2020r02o-q010": { jp: [["ア", "コミュニケーションの環を広げる。", "コミュニケーションの輪を広げる。"]] },
  "2020r02o-q018": { jp: [["エ", "感じ方や反応ig 9 Je", "感じ方や反応"]] },
  "2020r02o-q077": { jp: [["ア", "ネットワーク上にも構 .築することができる。", "ネットワーク上にも構築することができる。"]] },
  // ── 2026r08 ─────────────────────────────────────────────────────────────
  "2026r08-q013": { jp: [["ウ", Q013_TAIL, "できる情報"]] },
  "2026r08-q036": {
    jp: [["stem", "導入作業について，適切なものだけを", "導入作業の行動に関する記述のうち，適切なものだけを"]],
    zh: [["stem", "关于这项安装工作，仅列出全部恰当做法的是哪一项？", "在关于该安装工作的行动的描述中，仅列出全部恰当的描述的是哪一项？"]],
    en: [["stem", "Regarding this installation work, which option lists all and only the appropriate actions?", "Among the statements about the actions in this installation work, which option lists all and only the appropriate ones?"]],
  },
  "2026r08-q037": { jp: [["ア", "FPP 法を用いて見積もる。", "FP 法を用いて見積もる。"]] },
  "2026r08-q062": { jp: [["ウ", "ハードウェア性能, 1/0 回数の", "ハードウェア性能, I/O 回数の"]] },
  "2026r08-q065": { jp: [["ア", "Web サーバヘアクセスして", "Web サーバへアクセスして"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
// 2015h27a-q015: 腐敗値 49kg を前提に「49÷5=9.8→9個」「切り捨て」という説明が組み立てられていた。
//   源の 40kg では 40÷5=8 で割り切れるため、correct / 誤答肢ア・ウ・エ / 要点[1] がすべて事実と噛み合わなくなる → 全面差し替え。
// 2018h30a-q096: 誤答肢エの解説が**腐敗した逆転文を前提に**「『受けない』と断定しているため誤り」と論じていた → 全文書き換え。
const EXPL = {
  "2015h27a-q015": {
    correctSub: {
      jp: [["B原料は月49kgあり、1個に5kg使うので49÷5=9.8、すなわち9個まで。両方の原料を同時に使うため、実際に作れるのは小さいほうの値に制限され、6個が最大となる（このときA原料をちょうど使い切り、B原料は6×5=30kgでまだ余る）。",
            "B原料は月40kgあり、1個に5kg使うので40÷5=8個まで。両方の原料を同時に使うため、実際に作れるのは小さいほうの値に制限され、6個が最大となる（このときA原料をちょうど使い切り、B原料は6×5=30kgで10kg余る）。"]],
      zh: [["B原料每月有49kg，每个产品用5kg，所以49÷5=9.8，即最多能做9个。由于两种原料要同时使用，实际能生产的数量受较小值限制，最大为6个（此时A原料正好用完，B原料用6×5=30kg后仍有剩余）。",
            "B原料每月有40kg，每个产品用5kg，所以40÷5=8，即最多能做8个。由于两种原料要同时使用，实际能生产的数量受较小值限制，最大为6个（此时A原料正好用完，B原料用6×5=30kg后还剩10kg）。"]],
      en: [["Material B is 49 kg per month and each unit uses 5 kg, so 49÷5=9.8, that is, up to 9 units. Because both materials are used at the same time, the number that can actually be produced is limited by the smaller value, making 6 units the maximum (at this point material A is used up exactly, while material B uses 6×5=30 kg and still has some left).",
            "Material B is 40 kg per month and each unit uses 5 kg, so 40÷5=8, that is, up to 8 units. Because both materials are used at the same time, the number that can actually be produced is limited by the smaller value, making 6 units the maximum (at this point material A is used up exactly, while material B uses 6×5=30 kg and 10 kg is left over)."]],
    },
    distSub: {
      "ア": {
        jp: [["A原料なら6個、B原料なら9個まで作れるので", "A原料なら6個、B原料なら8個まで作れるので"]],
        zh: [["A原料最多能做6个、B原料最多能做9个", "A原料最多能做6个、B原料最多能做8个"]],
        en: [["Material A allows up to 6 units and material B up to 9 units", "Material A allows up to 6 units and material B up to 8 units"]],
      },
      "ウ": {
        jp: [["8個作るにはA原料が8×10=80kg必要だが、月間可能量は60kgしかなく足りない。B原料側だけを見て切り上げるなどしても8にはならず、A原料の制約を見落とした誤り。",
              "8個はB原料だけを見たときの上限（40÷5=8個）であり、A原料の制約を見落とした値である。8個作るにはA原料が8×10=80kg必要だが、月間可能量は60kgしかなく足りない。二つの制約のうち厳しいほう（A原料の6個）を採らなければならない。"]],
        zh: [["要生产8个需要A原料8×10=80kg，但每月可用量只有60kg，不够。即使只看B原料一侧再向上取整也得不到8，这是漏看了A原料约束的错误。",
              "8个是只看B原料一侧时的上限（40÷5=8个），是漏看了A原料约束的值。要生产8个需要A原料8×10=80kg，但每月可用量只有60kg，不够。必须在两个约束中取更严格的一方（A原料的6个）。"]],
        en: [["Making 8 units would require 8×10=80 kg of material A, but only 60 kg is available per month, which is not enough. Even rounding up based on material B alone does not give 8, so this error overlooks the material A constraint.",
              "The value 8 is the upper limit when looking only at material B (40÷5=8 units), and it overlooks the material A constraint. Making 8 units would require 8×10=80 kg of material A, but only 60 kg is available per month, which is not enough. Of the two constraints, the more restrictive one (6 units from material A) must be taken."]],
      },
      "エ": {
        jp: [["10個はB原料の49÷5=9.8を単純に切り上げた値に近いが、まずA原料が10×10=100kgも必要で60kgでは全く足りない。より厳しいA原料の制約を無視した誤り。",
              "10個作るにはA原料が10×10=100kg、B原料が10×5=50kg必要で、いずれも月間の使用可能量（A原料60kg・B原料40kg）を超える。どちらの原料の制約も満たせない値であり、最も厳しいA原料の制約を無視した誤り。"]],
        zh: [["10接近于把B原料的49÷5=9.8简单向上取整后的值，但首先生产10个需要A原料10×10=100kg，而只有60kg根本不够。这是无视了更严格的A原料约束的错误。",
              "要生产10个需要A原料10×10=100kg、B原料10×5=50kg，两者都超过了每月可用量（A原料60kg、B原料40kg）。这是任何一种原料的约束都无法满足的值，属于无视了最严格的A原料约束的错误。"]],
        en: [["The value 10 is close to simply rounding up material B's 49÷5=9.8, but making 10 units would first require 10×10=100 kg of material A, and 60 kg is nowhere near enough. This error ignores the more restrictive material A constraint.",
              "Making 10 units would require 10×10=100 kg of material A and 10×5=50 kg of material B, both of which exceed the amounts available per month (60 kg of material A and 40 kg of material B). It is a value that satisfies neither material's constraint, and it ignores the most restrictive constraint, that of material A."]],
      },
    },
    pointSub: [
      { idx: 1,
        jp: ["割り切れない場合は個数を切り捨てる（49÷5=9.8→9個）。整数個しか作れないことに注意する。",
             "作れるのは整数個なので、割り切れない場合は切り捨てる。また、ボトルネックでない側の原料は余りが出る（本問ではB原料が40−6×5=10kg余る）が、余りだけでは製品を作れない。"],
        zh: ["除不尽时数量要向下取整（49÷5=9.8→9个）。注意只能生产整数个。",
             "只能生产整数个，所以除不尽时要向下取整。此外，非瓶颈一侧的原料会有剩余（本题中B原料剩40−6×5=10kg），但仅靠剩余的原料无法生产产品。"],
        en: ["When the division is not exact, round the number of units down (49÷5=9.8→9 units). Note that only whole units can be made.",
             "Only whole units can be made, so round down when the division is not exact. Also, the material that is not the bottleneck is left over (here material B has 40−6×5=10 kg left), but leftovers alone cannot produce a unit."] },
    ],
  },
  "2018h30a-q096": {
    distSub: {
      "エ": {
        jp: [["2.4GHz 帯が電子レンジなど家電製品の電波干渉を受けやすいのは正しいが、5GHz 帯も気象レーダーなど他の電波の干渉を受けることがあり (このため DFS 機能が必要)、「電波干渉を全く受けない」とは言えない。「受けない」と断定しているため誤り。",
              "干渉の向きが実際とは逆である。2.4GHz 帯は電子レンジ・コードレス電話・Bluetooth などと同じ ISM バンドを使うため家電製品の電波干渉を受けやすい。一方 5GHz 帯は家電製品とは帯域が重ならず、家電由来の干渉はほとんど受けない。よって「2.4GHz 帯は受けない、5GHz 帯は受ける」とするこの記述は誤り。"]],
        zh: [["2.4 GHz 频段容易受到微波炉等家用电器的电波干扰这一点是正确的，但 5 GHz 频段也会受到气象雷达等其他电波的干扰（正因如此才需要 DFS 功能），因此不能说它「完全不受电波干扰」。该选项断定「不受干扰」，所以是错误的。",
              "干扰的方向与实际情况正好相反。2.4 GHz 频段与微波炉、无绳电话、Bluetooth 等使用同一 ISM 频段，因此容易受到家用电器的电波干扰；而 5 GHz 频段与家用电器的频段不重叠，几乎不会受到家电带来的干扰。因此「2.4 GHz 频段不受干扰、5 GHz 频段受干扰」这一记述是错误的。"]],
        en: [["It is true that the 2.4 GHz band is prone to radio interference from home appliances such as microwave ovens, but the 5 GHz band can also be interfered with by other radio waves such as weather radar (which is why the DFS function is needed), so it cannot be said to 'receive no radio interference at all'. Because this choice asserts that it receives no interference, it is incorrect.",
              "The direction of the interference is the reverse of reality. The 2.4 GHz band shares the ISM band with microwave ovens, cordless phones, Bluetooth and the like, so it is prone to radio interference from home appliances. The 5 GHz band, by contrast, does not overlap with those appliances and receives almost no appliance-borne interference. The statement that the 2.4 GHz band is not interfered with while the 5 GHz band is, is therefore incorrect."]],
      },
    },
  },
};

const MARK = "fidfix-S118-strat53";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触 (merge が差分時に round1 block を併記する)。
// NOTE_FULL = 全文差し替え / NOTE_SUB = 腐敗テキストを述べた区間だけを差し替え。どちらも MARK 冪等。
const NOTE_FULL = {
  "2015h27a-q015": (p) => `図なしの計算問。製品1個あたりA原料10kg・B原料5kgが必要。A原料の月間可能量60kgからは60÷10=6個、B原料40kgからは40÷5=8個まで作れる。両制約を同時に満たす最大は少ないほうの6個で、A原料がボトルネック。導出結果イ=6は stored key と一致。stem の「B原料は49kg」は S118 に ${p} 実読 (双 pass 一致) で源の「40kg」に是正済 (${MARK})`,
};
const NOTE_SUB = {
  "2018h30a-q066": (p) => [
    "（選択肢ウの「利用されでいる」等は distractor 側の軽微な OCR 誤字で答えに影響しない）",
    `（選択肢ウの「利用されでいる」は S118 に ${p} 実読で源の「利用されている」に是正済 — ${MARK}）`,
  ],
};

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set([...Object.keys(NOTE_FULL), ...Object.keys(NOTE_SUB)].map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const q = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[q, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[q, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); const j = rj(jf), tr = rj(tf);
  for (const [L, d] of Object.entries(ex.distSub ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    for (const [f, t] of d.jp ?? []) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${L}`);
    for (const [f, t] of d.zh ?? []) sub(dt, "zh", f, t, `${id} expl_tr.${L}.zh`);
    for (const [f, t] of d.en ?? []) sub(dt, "en", f, t, `${id} expl_tr.${L}.en`);
  }
  if (ex.correctSub) {
    for (const [f, t] of ex.correctSub.jp ?? []) sub(j, "correct_jp", f, t, `${id} expl_jp.correct_jp`);
    for (const [f, t] of ex.correctSub.zh ?? []) sub(tr.correct, "zh", f, t, `${id} expl_tr.correct.zh`);
    for (const [f, t] of ex.correctSub.en ?? []) sub(tr.correct, "en", f, t, `${id} expl_tr.correct.en`);
  }
  for (const p of ex.pointSub ?? []) {
    if (p.jp) { const [f, t] = p.jp; const arr = j.points_jp; if (typeof arr?.[p.idx] !== "string") throw new Error(`${id} points_jp[${p.idx}] missing`);
      const box = { v: arr[p.idx] }; if (sub(box, "v", f, t, `${id} expl_jp.points[${p.idx}]`)) arr[p.idx] = box.v; }
    if (p.zh) { const [f, t] = p.zh; sub(tr.points[p.idx], "zh", f, t, `${id} expl_tr.points[${p.idx}].zh`); }
    if (p.en) { const [f, t] = p.en; sub(tr.points[p.idx], "en", f, t, `${id} expl_tr.points[${p.idx}].en`); }
  }
  wj(jf, j); wj(tf, tr);
}

for (const [id, mk] of Object.entries(NOTE_FULL)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = mk(pg(id)) + "。"; applied++; log.push(`  ✓ ${id} final note: 全文差し替え (${pg(id)}, round1 untouched)`);
}
for (const [id, mk] of Object.entries(NOTE_SUB)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  const [from, to] = mk(pg(id));
  if (!sub(r.key_guard, "note_jp", from, to, `${id} final note`)) log.push(`  ⚠ ${id}: note segment not found`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S118-strat53: applied ${applied}, skipped ${skipped}`);
