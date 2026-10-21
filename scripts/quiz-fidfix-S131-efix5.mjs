#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix5** (解説是正 lane、D-178: exam をまたぐ low 集約 unit): efix4b〜4k の Rule D (各 evidence §4) で
// 任意とされた low を是正する。evidence/quiz_efix5_low_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4d と同じ (subN・D-143 note 後置・note の全文で後置済み判定・TRFIX は "stem" も可)。
// translations sidecar の訂正は sidecar と .phase1 tr_ の両方に当てる (sidecar は再 merge 禁止)。
//
// ── 是正 (判定は evidence §1) ──
//   2018h30h-q089 zh: 规格 → 标准、4G 世代 → 第四代（4G）(解説 + 選択肢ウ)
//   2019r01a-q029 要点 2 zh / en: efix4d で直した jp (検索エンジンに向けて自社サイトを最適化) に揃える
//   2020r02o-q039 題幹 zh 後半: 24小时响应 → 24小时服务 (前半の服务时间と揃える)
//   2021r03-q020 要点 2: 特徴量の自動抽出は深層学習の特徴、と限定。zh の 特征量 → 特征・使用例 → 应用实例
//   2021r03-q058 要点 2: 「論理的な対策」→ 記録で判定する入退室管理の仕組み (2022r04-q074 の「物理入退室管理の対策」と整合)。
//                zh 出室 → 离开 (2022r04-q074 の zh も揃える)
//   2022r04: q084 イ 駆動機構はドライブ側 / q094 イ zh 多联复写纸 / q022 ウ zh 价值链 / q068 要点 2 に ANY 接続を追記
//   2023r05: q100 ウ zh 交集（积）→ 交集 / q055 エ zh の文体
//   2024r06: q009 イ・q012 イ・q055 ア の jp 補足の半角括弧を全角に
//   2025r07: q033 イ 「運転装置の無い車両でも…走行できる」/ q051 zh 经营者直辖组织 → 经营者直属部门 (解説 + 選択肢エ)
//   2026r08: q089 zh の語順 (正解解説 + 題幹) / q037 ア の冗長な補足 / q089 ウ en の引用符とカンマ
//
// Run: node scripts/quiz-fidfix-S131-efix5.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix5.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>
//     (2018h30h 2019r01a 2020r02o 2021r03 2022r04 2023r05 2024r06 2025r07 2026r08)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const LOADED = new Map();
const rj = (f) => { const d = JSON.parse(readFileSync(f, "utf-8")); LOADED.set(f, JSON.stringify(d, null, 2)); return d; };
const written = [];
const wj = (f, d) => {
  const next = JSON.stringify(d, null, 2);
  if (LOADED.get(f) === next) return;
  written.push(path.relative(ROOT, f));
  if (!DRY) writeFileSync(f, next + "\n");
};
let applied = 0, skipped = 0; const log = [];

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。事後確認つき (quiz-fidfix-S130-n9b と同じ)。
function subN(obj, key, from, to, n, where) {
  const s = obj?.[key];
  if (typeof s !== "string") throw new Error(`${where}: field ${key} missing`);
  const k = s.split(from).length - 1;
  if (k === 0) { skipped++; return false; }
  if (k !== n) throw new Error(`${where}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  const next = s.split(from).join(to);
  const cnt = (x, y) => x.split(y).length - 1;
  if (cnt(next, to) !== cnt(s, to) - n * cnt(from, to) + n || next.includes(from)) throw new Error(`${where}: 置換後の事後確認に失敗 — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」 ×${n}`); return true;
}

// [id, where (correct | d:ア〜エ | p:idx), lang (jp | zh | en), from, to, n]
const EXPL = [
  // 2018h30h-q089 (zh)
  ["2018h30h-q089", "correct", "zh", "无线通信规格", "无线通信标准", 2],
  ["2018h30h-q089", "correct", "zh", "实质上的 4G 世代技术", "实质上的第四代（4G）技术", 1],
  ["2018h30h-q089", "d:ア", "zh", "作为移动电话规格的 LTE", "作为移动电话标准的 LTE", 1],
  ["2018h30h-q089", "d:エ", "zh", "LTE 指的是通信规格本身", "LTE 指的是通信标准本身", 1],
  ["2018h30h-q089", "p:0", "zh", "无线通信规格（实质上属于 4G 世代）", "无线通信标准（实质上属于第四代（4G））", 1],
  // 2019r01a-q029 (zh / en)
  ["2019r01a-q029", "p:1", "zh", "它是「优化一方（网站运营者）所采取的对策」，要与开发搜索引擎本身或做日志分析区分开来。", "它是网站运营者一方针对搜索引擎优化本公司网站的对策，要与开发搜索引擎本身或做日志分析区分开来。", 1],
  ["2019r01a-q029", "p:1", "en", "It is a measure taken by the optimizing side (the site operator), and should be distinguished", "It is a measure taken by the site operator to optimize its own site for search engines, and should be distinguished", 1],
  // 2021r03-q020
  ["2021r03-q020", "p:1", "jp", "人が特徴量を設計しなくてもデータから自動で抽出できる (深層学習) のが機械学習の特徴で、", "人が特徴量を設計しなくてもデータから自動で抽出できる点は深層学習の特徴で、", 1],
  ["2021r03-q020", "p:1", "zh", "无需人来设计特征量、可以从数据中自动提取（深度学习），这是机器学习的特点；在图像识别中，从大量图像中学习特征量是要点。", "无需人来设计特征、可以从数据中自动提取，这是深度学习的特点；在图像识别中，从大量图像中学习特征是要点。", 1],
  ["2021r03-q020", "p:1", "en", "A feature of machine learning is that features can be extracted automatically from data without people designing them (deep learning), and", "Extracting features automatically from data without people designing them is a characteristic of deep learning, and", 1],
  ["2021r03-q020", "correct", "zh", "规律性和特征（特征量）", "规律性和特征", 1],
  ["2021r03-q020", "correct", "zh", "特征量", "特征", 2],
  ["2021r03-q020", "p:0", "zh", "规律性和特征（特征量）", "规律性和特征", 1],
  ["2021r03-q020", "d:ウ", "zh", "「生物识别认证」的使用例", "「生物识别认证」的应用实例", 1],
  // 2021r03-q058
  ["2021r03-q058", "p:1", "jp", "共連れを検知・抑止する論理的な対策で、両者を区別して押さえる。", "共連れを検知・抑止する仕組み (物理的な障壁ではなく記録で判定する入退室管理) で、両者を区別して押さえる。", 1],
  ["2021r03-q058", "p:1", "zh", "（没有入室记录的 ID 不允许出室）、从而检测和抑制尾随的逻辑性对策，两者要区分开来。", "（没有入室记录的 ID 不允许离开）、从而检测和抑制尾随的机制（不是物理屏障，而是依据记录进行判定的出入室管理），两者要区分开来。", 1],
  // en は amend (Rule D N1) 後の最終形に直接置き換える。from を元の文全体にしておかないと、最終形の末尾「…tailgating; distinguish the two.」に
  // 再び当たって冪等でなくなる (Rule B: failures/quiz_efix5_amend_idempotency_S131_attempt_1.md)
  ["2021r03-q058", "p:1", "en", "Anti-passback is a logical control that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating; distinguish the two.",
    "Anti-passback is a record-based entry/exit control, not a physical barrier, that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating; distinguish the two.", 1],
  // 2022r04-q074 (zh、2021r03-q058 と「出室」を揃える)
  ["2022r04-q074", "correct", "zh", "因此出室（以及之后的入室）认证会被拒绝", "因此离开（以及之后的进入）时的认证会被拒绝", 1],
  ["2022r04-q074", "p:0", "zh", "拒绝没有入室记录的 ID 出室", "拒绝没有入室记录的 ID 离开", 1],
  // 2022r04-q084
  ["2022r04-q084", "d:イ", "jp", "ディスクを回す駆動機構を持つため", "読み書きにはディスクを回す駆動機構を持つドライブが必要になるため", 1],
  ["2022r04-q084", "d:イ", "zh", "它带有旋转盘片的驱动机构，因此", "读写时需要带有旋转盘片驱动机构的驱动器，因此", 1],
  ["2022r04-q084", "d:イ", "en", "Because it has a drive mechanism that rotates the disc, it violates", "Because reading and writing require a drive with a mechanism that rotates the disc, it violates", 1],
  // 2022r04-q094 (zh)
  ["2022r04-q094", "d:イ", "zh", "复写纸（复印纸）", "多联复写纸", 1],
  // 2022r04-q022 (zh)
  ["2022r04-q022", "d:ウ", "zh", "价值链（价值连锁）分析", "价值链分析", 1],
  // 2022r04-q068
  ["2022r04-q068", "p:1", "jp", "ボタン操作での簡単接続は WPS。", "ボタン操作での簡単接続は WPS、SSID 空欄での接続は ANY 接続。", 1],
  ["2022r04-q068", "p:1", "zh", "仅靠按键操作的简易连接是 WPS。", "仅靠按键操作的简易连接是 WPS，把 SSID 留空进行的连接是 ANY 连接。", 1],
  ["2022r04-q068", "p:1", "en", "and easy connection via button operation only is WPS.", "easy connection via button operation only is WPS, and connecting with a blank SSID is ANY connection.", 1],
  // 2023r05-q100 (zh)
  ["2023r05-q100", "d:ウ", "zh", "更接近交集（积）这类集合运算", "更接近交集这类集合运算", 1],
  // 2023r05-q055 (zh、文体)
  ["2023r05-q055", "d:エ", "zh", "这是从全部 150 人日中减去的不是已完成的 40 人日、而是最初 5 天的不足量 10 人日，把剩余工作量算成 140 人日的错误（140÷10 天＝14 人）。",
    "这是没有从全部 150 人日中减去已完成的 40 人日，而是减去了最初 5 天的不足量 10 人日，从而把剩余工作量算成 140 人日的错误（140÷10 天＝14 人）。", 1],
  // 2024r06 (jp、補足の括弧を全角に)
  ["2024r06-q009", "d:イ", "jp", "「エスノグラフィ」(参与観察やフィールドワークによって集団の文化を理解する手法) の説明です。", "「エスノグラフィ」（参与観察やフィールドワークによって集団の文化を理解する手法）の説明です。", 1],
  ["2024r06-q012", "d:イ", "jp", "「人間中心の原則」(AI の利用は人が判断・決定し、結果の責任は関係者が分担して負う) に関するもの。", "「人間中心の原則」（AI の利用は人が判断・決定し、結果の責任は関係者が分担して負う）に関するもの。", 1],
  ["2024r06-q055", "d:ア", "jp", "システムを (開発中のものを含むライフサイクル全体にわたって) 点検・評価する", "システムを（開発中のものを含むライフサイクル全体にわたって）点検・評価する", 1],
  // 2025r07-q033
  ["2025r07-q033", "d:イ", "jp", "限定された地域で運転装置の無い車両が無人で走るレベル4「高度運転自動化」の説明である", "限定された地域であれば運転装置の無い車両でも無人で走行できるレベル4「高度運転自動化」の説明である", 1],
  ["2025r07-q033", "d:イ", "zh", "是在限定区域内由没有驾驶装置的车辆无人行驶的级别4", "是在限定区域内即使是没有驾驶装置的车辆也能无人行驶的级别4", 1],
  ["2025r07-q033", "d:イ", "en", "in which vehicles without driving devices run unmanned within limited areas", "in which, within limited areas, even vehicles without driving devices can run unmanned", 1],
  // 2025r07-q051 (zh)
  ["2025r07-q051", "correct", "zh", "经营者直辖组织", "经营者直属部门", 2],
  ["2025r07-q051", "p:1", "zh", "经营者直辖组织", "经营者直属部门", 1],
  // 2026r08-q089
  ["2026r08-q089", "correct", "zh", "信息资产自身可能损害其价值的弱点", "可能损害信息资产自身价值的弱点", 1],
  ["2026r08-q089", "d:ウ", "en", "not a ‘weakness,’ so neither fits.", "not a ‘weakness’, so neither fits.", 1],
  // 2026r08-q037
  ["2026r08-q037", "d:ア", "jp", "ファンクションポイント法（FP法、選択肢ではFP法を指す）", "ファンクションポイント法（FP法）", 1],
  ["2026r08-q037", "d:ア", "zh", "功能点法（FP 法；选项中指的即 FP 法）", "功能点法（FP 法）", 1],
  ["2026r08-q037", "d:ア", "en", "The Function Point method (FP method; this is what the choice refers to)", "The Function Point method (FP method)", 1],
  // ── Rule D 後の amend (N1〜N3・info)。上の行の適用結果を from にするので、上の行の後に当たる ──
  ["2021r03-q058", "p:1", "en", "Anti-passback is a mechanism that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating, a record-based entry/exit control rather than a physical barrier; distinguish the two.",
    "Anti-passback is a record-based entry/exit control, not a physical barrier, that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating; distinguish the two.", 1],
  ["2018h30h-q089", "p:0", "zh", "（实质上属于第四代（4G））", "（实质上属于第四代 4G）", 1],
  ["2021r03-q020", "correct", "en", "the regularities and features (feature quantities) hidden", "the regularities and features hidden", 1],
  ["2021r03-q020", "correct", "en", "it learns the feature quantities from the image data", "it learns the features from the image data", 1],
  ["2021r03-q020", "p:0", "en", "regularities and features (feature quantities) from", "regularities and features from", 1],
  ["2021r03-q020", "p:1", "en", "learning feature quantities from a large number of images", "learning features from a large number of images", 1],
  ["2022r04-q068", "p:1", "en", "is ANY connection.", "is an ANY connection.", 1],
];

// translations sidecar (+ .phase1 tr_): [id, choice の字母 | "stem", lang, from, to, n]
const TRFIX = [
  ["2018h30h-q089", "ウ", "zh", "移动电话无线通信规格。", "移动电话无线通信标准。", 1],
  ["2020r02o-q039", "stem", "zh", "A公司认为这样即可实现24小时响应", "A公司认为这样即可实现24小时服务", 1],
  ["2025r07-q051", "エ", "zh", "隶属于经营者直辖组织", "隶属于经营者直属部门", 1],
  ["2026r08-q089", "stem", "zh", "将信息资产自身可能损害其价值的弱点称为 b", "将可能损害信息资产自身价值的弱点称为 b", 1],
];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix5";
const E = "S131 efix5 low 集約 (D-178)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const NOTE_APPEND = [
  N("2018h30h-q089", "zh の「无线通信规格」「4G 世代」を「无线通信标准」「第四代（4G）」に改めた (解説と translations の選択肢ウ)。correct_answer は不変"),
  N("2019r01a-q029", "要点 2 の zh / en を、efix4d で改めた jp (検索エンジンに向けて自社サイトを最適化する、サイト運営者側の対策) に揃えた。correct_answer は不変"),
  N("2020r02o-q039", "translations の題幹 zh 後半「24小时响应」を、前半の「服务时间」と揃えて「24小时服务」にした。correct_answer は不変"),
  N("2021r03-q020", "要点 2 を、特徴量の自動抽出は深層学習の特徴、と限定した (jp / zh / en)。zh の「特征量」を「特征」、「使用例」を「应用实例」にした。correct_answer は不変"),
  N("2021r03-q058", "要点 2 の「論理的な対策」を「記録で判定する入退室管理の仕組み (物理的な障壁ではない)」に改めた (IPA はアンチパスバックを入退室管理の一部として扱う。2022r04-q074 の要点 1 と整合)。zh の「出室」を「离开」にした。correct_answer は不変"),
  N("2022r04-q074", "zh の「出室」を「离开」に改めた (2021r03-q058 と揃えた)。correct_answer は不変"),
  N("2022r04-q084", "誤答肢イで、駆動機構を持つのは読み書きに使うドライブであることがわかるようにした (jp / zh / en)。correct_answer は不変"),
  N("2022r04-q094", "誤答肢イの zh「复写纸（复印纸）」を「多联复写纸」に改めた。correct_answer は不変"),
  N("2022r04-q022", "誤答肢ウの zh「价值链（价值连锁）」を「价值链」に改めた。correct_answer は不変"),
  N("2022r04-q068", "要点 2 に、SSID 空欄での接続は ANY 接続であることを追記した (jp / zh / en)。correct_answer は不変"),
  N("2023r05-q100", "誤答肢ウの zh「交集（积）」を「交集」に改めた。correct_answer は不変"),
  N("2023r05-q055", "誤答肢エの zh の文体を整えた (内容は efix4h と同じ)。correct_answer は不変"),
  N("2024r06-q009", "誤答肢イの jp の補足の括弧を全角にした。correct_answer は不変"),
  N("2024r06-q012", "誤答肢イの jp の補足の括弧を全角にした。correct_answer は不変"),
  N("2024r06-q055", "誤答肢アの jp の補足の括弧を全角にした。correct_answer は不変"),
  N("2025r07-q033", "誤答肢イの「運転装置の無い車両が無人で走るレベル4」を「限定された地域であれば運転装置の無い車両でも無人で走行できるレベル4」に改めた (運転装置が無いことがレベル 4 の条件と読めないように、jp / zh / en)。correct_answer は不変"),
  N("2025r07-q051", "zh の「经营者直辖组织」を「经营者直属部门」に改めた (解説と translations の選択肢エ)。correct_answer は不変"),
  N("2026r08-q089", "zh の語順「信息资产自身可能损害其价值的弱点」を「可能损害信息资产自身价值的弱点」に改め (正解解説と translations の題幹)、誤答肢ウの en の引用符とカンマの位置を揃えた。correct_answer は不変"),
  N("2026r08-q037", "誤答肢アの冗長な補足「選択肢では FP 法を指す」を削った (jp / zh / en)。correct_answer は不変"),
  // Rule D 後の amend の note (同じ題の 2 本目。後置済みかは note の全文で判定)
  N("2021r03-q058", "Rule D 後の amend: 要点 2 の en を \"Anti-passback is a record-based entry/exit control, not a physical barrier, that checks …\" の語順に整えた。correct_answer は不変"),
  N("2018h30h-q089", "Rule D 後の amend: 要点 1 の zh「（实质上属于第四代（4G））」の括弧の入れ子を「（实质上属于第四代 4G）」にした。correct_answer は不変"),
  N("2021r03-q020", "Rule D 後の amend: en の \"feature quantities\" を \"features\" に揃えた (正解解説 2 箇所・要点 1・要点 2)。correct_answer は不変"),
  N("2022r04-q068", "Rule D 後の amend: 要点 2 の en \"is ANY connection\" を \"is an ANY connection\" にした。correct_answer は不変"),
];

// ── 適用 ──
const EXP = new Map();
const explPair = (id) => {
  if (!EXP.has(id)) {
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    EXP.set(id, { jf, tf, j: rj(jf), tr: rj(tf) });
  }
  return EXP.get(id);
};
const explField = (id, w, Lg) => {
  const { j, tr } = explPair(id);
  if (Lg === "jp") {
    if (w === "correct") return [j, "correct_jp"];
    if (w.startsWith("d:")) return [j.distractors_jp.find((d) => d.letter === w.slice(2)), "why_wrong_jp"];
    return [j.points_jp, Number(w.slice(2))];
  }
  const o = w === "correct" ? tr.correct : w.startsWith("d:") ? tr.distractors.find((d) => d.letter === w.slice(2)) : tr.points[Number(w.slice(2))];
  return [o, Lg];
};
for (const [id, w, Lg, from, to, n] of EXPL) { const [o, k] = explField(id, w, Lg); subN(o, k, from, to, n, `${id} expl_${Lg === "jp" ? "jp" : "tr"}.${w}.${Lg}`); }

const TR = {}; const T1 = new Map();
for (const [id, ch, Lg, from, to, n] of TRFIX) {
  const e = id.split("-q")[0];
  TR[e] ??= rj(P("data/ip/quiz/translations", `${e}.json`));
  const t = TR[e].questions[id];
  if (!t) throw new Error(`${id}: sidecar に無い`);
  // ch = "stem" なら題幹、それ以外は選択肢の字母
  subN(ch === "stem" ? t.stem : t.choices[ch], Lg, from, to, n, `${id} translations.${ch === "stem" ? "stem" : `choices.${ch}`}.${Lg}`);
  const f1 = P("data/ip/quiz/.phase1", `tr_${id}.json`);
  if (existsSync(f1)) {
    if (!T1.has(f1)) T1.set(f1, rj(f1));
    const d1 = T1.get(f1);
    subN(ch === "stem" ? d1.stem : d1.choices.find((c) => c.letter === ch), Lg, from, to, n, `${id} .phase1 tr_.${ch === "stem" ? "stem" : `choices.${ch}`}.${Lg}`);
  }
}

for (const { jf, tf, j, tr } of EXP.values()) { wj(jf, j); wj(tf, tr); }
for (const e of Object.keys(TR)) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);
for (const [f, d] of T1) wj(f, d);

const GR = {};
for (const [id, mk] of NOTE_APPEND) {
  const e = id.split("-q")[0];
  GR[e] ??= rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`));
  const r = GR[e].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(mk())) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk()}`; applied++; log.push(`  ✓ ${id} final note: 追記 (round1・flag untouched)`);
}
for (const e of Object.keys(GR)) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix5: applied ${applied}, skipped ${skipped}`);
