#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix3** (解説是正 lane): 解説全量監査 efull_3 (evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_3.json、
// opus v2 + input_only、medium 25) の是正 + efix2 Rule D の low 3 件。evidence/quiz_efix3_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix1 と同じ (subN で出現数を厳密に要求・0 回なら skip / expl は .phase2 expl_jp_ / expl_tr_ を直して
// phase2-merge で再生成 / D-143 note は final に純粋後置・round1 と既存 note・flag は不可触)。
// 2016h28a-q033 選択肢ア の zh だけは translations sidecar と .phase1 tr_ の両方に当てる (quiz-fidfix-S130-t1 と同じ、sidecar は再 merge 禁止)。
//
// ── 是正 (判定は evidence §1。2015h27a-q082 は efix2 D-175 で是正済みのため対象外) ──
//   2015h27a-q027 イ CSF「単一の分析対象」→ 少数の重要要因 / q059 ア・要点 2「許容値（しきい値）」の同一視を削除 /
//   q077 要点 2 OSI 基本参照モデルはプロトコルではない → TCP/IP、HTTP
//   2015h27h-q021 ア・要点 2 意匠権 = 出願から最長 25 年 (2020 年 4 月施行の改正後) / q032 ア = ラウンドトリップ /
//   q071 イ「暗号処理の観点では速度改善の要因にならない」→ 本問の原因 (電波干渉) に効かない
//   2016h28a-q012 zh カンパニー制 = 内部公司制 / q033 zh 委託先 = 受托方 (選択肢アの訳も) / q067 要点 2 冗長化と保守の削減を分ける
//   2016h28h-q021 ウ 2022 年改正の体制整備義務 (通報対応体制に限る) / q025 要点 1 学術研究機関の除外は出題当時 /
//   q034 イ タスクフォースの説明 / q086 zh エ の係り受け・正解の「当面」
//   2017h29a-q008 要点 2 系統図・マトリックス図は新 QC 七つ道具 / q027 c = 支払用カード電磁的記録不正作出 / q034 エ 提案書は受注前 /
//   q051 zh 調達先 = 供应商 / q058 zh 字下げ = 缩进 / q071 生体 = something you are / q073 要点 2 増分バックアップ /
//   q099 ア jp「WAN を含む」→「WAN を必要としない」
//   2017h29h-q010 要点 2 特許法はプログラムを保護し得る / q013 ア 紹介予定派遣は例外 / q019 ウ・要点 2 システム要件定義は開発プロセス
//   efix2 low: 2013h25h-q005 ア・要点 2「開発プロセス (システム要件定義〜外部設計)」(2014h26h-q049 ア の外部設計と整合) /
//   2011h23tokubetsu-q092 正解冒頭「保守契約と契約条件 (瑕疵担保期間)」/ 2018h30a-q082 要点 2 zh「双工化」→「双重化」(jp 二重化)
//
// Run: node scripts/quiz-fidfix-S131-efix3.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S131-efix3.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>
//     (2011h23tokubetsu 2013h25h 2015h27a 2015h27h 2016h28a 2016h28h 2017h29a 2017h29h 2018h30a)
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
  // 2015h27a-q027
  ["2015h27a-q027", "d:イ", "jp", "であり、単一の分析対象を絞り込むもの。", "であり、目標達成の鍵となる少数の重要要因を絞り込むもの。", 1],
  ["2015h27a-q027", "d:イ", "zh", "聚焦于确定关键的分析对象。", "聚焦于确定少数关键因素。", 1],
  ["2015h27a-q027", "d:イ", "en", "it narrows down to key targets of analysis.", "it narrows down to a small number of key factors.", 1],
  // 2015h27a-q059
  ["2015h27a-q059", "d:ア", "jp", "照合の許容値（しきい値）を大きくすると", "照合誤差の許容値を大きくすると", 1],
  ["2015h27a-q059", "d:ア", "zh", "若将比对的容许值（阈值）调大", "若将比对误差的容许值调大", 1],
  ["2015h27a-q059", "d:ア", "en", "If the tolerance value (threshold) for matching is increased", "If the tolerance for matching errors is increased", 1],
  ["2015h27a-q059", "p:1", "jp", "許容値（しきい値）を上げると", "照合誤差の許容値を上げる (判定を緩める) と", 1],
  ["2015h27a-q059", "p:1", "zh", "提高容许值（阈值）会使", "提高比对误差的容许值（放宽判定）会使", 1],
  ["2015h27a-q059", "p:1", "en", "Raising the tolerance value (threshold) lowers", "Raising the tolerance for matching errors (loosening the judgment) lowers", 1],
  // 2015h27a-q077
  ["2015h27a-q077", "p:1", "jp", "（例: OSI基本参照モデル、TCP/IP）", "（例: TCP/IP、HTTP）", 1],
  ["2015h27a-q077", "p:1", "zh", "（例如 OSI 基本参考模型、TCP/IP）", "（例如 TCP/IP、HTTP）", 1],
  ["2015h27a-q077", "p:1", "en", "(e.g., OSI reference model, TCP/IP)", "(e.g., TCP/IP, HTTP)", 1],
  // 2015h27h-q021
  ["2015h27h-q021", "d:ア", "jp", "設定登録から一定年数で満了し、", "存続期間に上限があって満了し (2020 年 4 月施行の改正後は出願から最長 25 年。改正前は登録から 20 年)、", 1],
  ["2015h27h-q021", "d:ア", "zh", "自设定注册起经过一定年数即期满，", "存续期间有上限，到期即期满（2020 年 4 月施行的修订后为自申请起最长 25 年，修订前为自注册起 20 年），", 1],
  ["2015h27h-q021", "d:ア", "en", "It expires a fixed number of years after registration and", "Its term has an upper limit after which it expires (since the amendment effective April 2020, up to 25 years from filing; before that, 20 years from registration), and it", 1],
  ["2015h27h-q021", "p:1", "jp", "意匠権=登録から一定年数", "意匠権=出願から最長25年 (2020年改正以降。改正前は登録から20年)", 1],
  ["2015h27h-q021", "p:1", "zh", "外观设计权=自注册起一定年数", "外观设计权=自申请起最长25年（2020年修订以后，修订前为自注册起20年）", 1],
  ["2015h27h-q021", "p:1", "en", "design right = a fixed number of years from registration", "design right = up to 25 years from filing (since the 2020 amendment; 20 years from registration before that)", 1],
  // 2015h27h-q032
  ["2015h27h-q032", "d:ア", "jp", "オブジェクト指向開発で用いられる反復型の開発 (アジャイル開発や反復型モデル) の説明です。", "オブジェクト指向開発におけるラウンドトリップ (設計と実装を往復する反復的な進め方) の説明です。", 1],
  ["2015h27h-q032", "d:ア", "zh", "说的是面向对象开发中所采用的迭代式开发（敏捷开发或迭代模型）。", "说的是面向对象开发中的往返工程（round trip，在设计与实现之间往返的迭代式做法）。", 1],
  ["2015h27h-q032", "d:ア", "en", "describes iterative development used in object-oriented development (agile development or an iterative model).", "describes round trip in object-oriented development (an iterative way of going back and forth between design and implementation).", 1],
  // 2015h27h-q071
  ["2015h27h-q071", "d:イ", "jp", "むしろ暗号処理の観点では速度が改善する要因にはならず、", "本問の原因と考えられる電波干渉には効かず、", 1],
  ["2015h27h-q071", "d:イ", "zh", "而且从加密处理的角度看，它也不会成为速度改善的因素，同样无法解释", "它对本题中被认为是原因的电波干扰不起作用，也无法解释", 1],
  ["2015h27h-q071", "d:イ", "en", "Moreover, from the viewpoint of encryption processing it is not a factor that improves speed, and it also fails to explain", "It does not address the radio interference that is the likely cause in this question, and it also fails to explain", 1],
  // 2016h28a-q012 (zh)
  ["2016h28a-q012", "d:イ", "zh", "事业部制（Company 制）", "内部公司制（カンパニー制）", 1],
  ["2016h28a-q012", "p:1", "zh", "事业部制（拆分业务以提高自主性）", "内部公司制（拆分业务以提高自主性）", 1],
  // 2016h28a-q033 (zh)
  ["2016h28a-q033", "correct", "zh", "业务委托方", "业务受托方", 4],
  ["2016h28a-q033", "p:0", "zh", "业务委托方", "业务受托方", 1],
  // 2016h28a-q067
  ["2016h28a-q067", "p:1", "jp", "冗長性を減らす施策 (複数回線を 1 本に統合、保守・点検を削減) は単一障害点を生んだり信頼性を下げたりし、障害耐性を損なう。",
    "冗長性を捨てる施策 (複数回線を 1 本に統合) は単一障害点を生み、保守・点検の削減は故障の予兆の見逃しで信頼性を下げる。どちらも障害耐性を損なう。", 1],
  ["2016h28a-q067", "p:1", "zh", "减少冗余性的措施（把多条线路合并为一条、削减维护和检查）会产生单点故障或降低可靠性，从而损害容错能力。",
    "放弃冗余性的措施（把多条线路合并为一条）会产生单点故障，削减维护和检查则会因漏看故障征兆而降低可靠性，两者都会损害容错能力。", 1],
  ["2016h28a-q067", "p:1", "en", "Measures that reduce redundancy (consolidating multiple lines into one, cutting back on maintenance and inspection) create single points of failure or lower reliability, undermining fault tolerance.",
    "A measure that gives up redundancy (consolidating multiple lines into one) creates a single point of failure, and cutting back on maintenance and inspection lowers reliability because signs of failure are missed; both undermine fault tolerance.", 1],
  // 2016h28h-q021
  ["2016h28h-q021", "d:ウ", "jp", "通報者の保護が目的であり、会社に体制整備そのものを義務付ける趣旨の法令ではない。",
    "2022 年施行の改正で一定規模 (常時使用する労働者 300 人超) の事業者に公益通報に対応する体制の整備が義務付けられたが、それは通報対応の体制に限られ、取締役の職務全般のコンプライアンスを確保する体制 (内部統制システム) を定めるものではない。", 1],
  ["2016h28h-q021", "d:ウ", "zh", "其目的在于保护举报人，并不是意在强制要求公司建立健全体制本身的法令。",
    "2022 年施行的修订规定一定规模（常时雇用劳动者超过 300 人）的经营者有义务建立应对公益举报的体制，但这仅限于应对举报的体制，并不规定确保董事职务整体合规的体制（内部控制系统）。", 1],
  ["2016h28h-q021", "d:ウ", "en", "Its purpose is to protect whistleblowers, and it is not a law intended to require companies to establish such a system itself.",
    "The amendment effective in 2022 requires business operators of a certain size (more than 300 regularly employed workers) to establish a system for handling whistleblowing reports, but that is limited to a report-handling system and does not prescribe a system that ensures compliance in directors' duties as a whole (an internal control system).", 1],
  // 2016h28h-q025
  ["2016h28h-q025", "p:0", "jp", "個人情報保護法の適用除外：", "個人情報保護法の適用除外 (出題当時。2022 年 4 月施行の改正で学術研究機関は一律の適用除外から外れ、義務の一部だけが例外になった)：", 1],
  ["2016h28h-q025", "p:0", "zh", "《个人信息保护法》的适用除外：", "《个人信息保护法》的适用除外（出题当时。2022 年 4 月施行的修订把学术研究机构从一律适用除外中移出，只对部分义务例外）：", 1],
  ["2016h28h-q025", "p:0", "en", "Exemptions under the Act on the Protection of Personal Information:", "Exemptions under the Act on the Protection of Personal Information (as of when the question was set; the amendment effective April 2022 removed academic research institutions from the blanket exemption, leaving exceptions only for some obligations):", 1],
  // 2016h28h-q034
  ["2016h28h-q034", "d:イ", "jp", "対等・自律や「企業・部門の壁を越える」という常設的な連携の特徴とは異なる。",
    "構成員はリーダーの下で特定の課題に取り組み、通常は企業の枠を越えないので、対等・自律で「企業・部門の壁を越える」というネットワーク組織の特徴とは異なる。", 1],
  ["2016h28h-q034", "d:イ", "zh", "这与对等、自律以及「跨越企业、部门的壁垒」这种常设性协作的特征不同。",
    "其成员在领导之下处理特定课题，通常不跨越企业的边界，因此与对等、自律且「跨越企业、部门的壁垒」这种网络组织的特征不同。", 1],
  ["2016h28h-q034", "d:イ", "en", "This differs from the characteristics of equality and autonomy and of the permanent cooperation that crosses the boundaries of companies and departments.",
    "Its members work on a specific issue under a leader and it usually does not cross company boundaries, so it differs from the network organization's characteristics of equality, autonomy, and crossing the boundaries of companies and departments.", 1],
  // 2016h28h-q086 (zh)
  ["2016h28h-q086", "d:エ", "zh", "一旦运行就会下载进行非法操作的软件，", "下载一旦被用户运行就会进行非法操作的软件，", 1],
  ["2016h28h-q086", "correct", "zh", "在取得对方信任后当面口头套取", "在取得对方信任后通过电话口头套取", 1],
  // 2017h29a-q008
  ["2017h29a-q008", "p:1", "jp", "QC七つ道具の識別: 管理図（工程の安定監視）・系統図（手段の枝分かれ展開）・マトリックス図（行×列の対応整理）と、それぞれの用途・見た目の違いを区別する。",
    "QC七つ道具の管理図（工程の安定監視）と、新QC七つ道具の系統図（手段の枝分かれ展開）・マトリックス図（行×列の対応整理）を、それぞれの用途・見た目の違いで区別する。", 1],
  ["2017h29a-q008", "p:1", "zh", "区分 QC 七大工具：控制图（监视工序稳定性）、系统图（手段的分枝展开）、矩阵图（行 × 列的对应整理），要分清它们各自的用途和外观差异。",
    "区分 QC 七大工具中的控制图（监视工序稳定性）与新 QC 七大工具中的系统图（手段的分枝展开）、矩阵图（行 × 列的对应整理），要分清它们各自的用途和外观差异。", 1],
  ["2017h29a-q008", "p:1", "en", "Identifying the QC Seven Tools: distinguish the control chart (monitoring process stability), the tree diagram (branching expansion of means), and the matrix diagram (organizing row × column correspondence) by their respective uses and visual differences.",
    "Distinguish the control chart (monitoring process stability), one of the QC Seven Tools, from the tree diagram (branching expansion of means) and the matrix diagram (organizing row × column correspondence), which belong to the New QC Seven Tools, by their respective uses and visual differences.", 1],
  // 2017h29a-q027
  ["2017h29a-q027", "d:ア", "jp", "私電磁的記録不正作出", "支払用カード電磁的記録不正作出", 1],
  ["2017h29a-q027", "d:ウ", "jp", "私電磁的記録不正作出", "支払用カード電磁的記録不正作出", 1],
  ["2017h29a-q027", "p:1", "jp", "私電磁的記録不正作出", "支払用カード電磁的記録不正作出", 1],
  ["2017h29a-q027", "d:ア", "zh", "私电磁记录非法制作", "支付用卡电磁记录非法制作", 1],
  ["2017h29a-q027", "d:ウ", "zh", "私电磁记录非法制作", "支付用卡电磁记录非法制作", 1],
  ["2017h29a-q027", "p:1", "zh", "私电磁记录非法制作", "支付用卡电磁记录非法制作", 1],
  ["2017h29a-q027", "d:ア", "en", "of private electromagnetic records", "of electromagnetic records of payment cards", 1],
  ["2017h29a-q027", "d:ウ", "en", "of private electromagnetic records", "of electromagnetic records of payment cards", 1],
  ["2017h29a-q027", "p:1", "en", "of private electromagnetic records", "of electromagnetic records of payment cards", 1],
  // 2017h29a-q034
  ["2017h29a-q034", "d:エ", "jp", "受注後にベンダが提案書で示す", "RFP を受けてベンダが提案書で示す", 1],
  ["2017h29a-q034", "d:エ", "zh", "供应商在接单后于提案书中给出的", "供应商收到 RFP 后在提案书中给出的", 1],
  ["2017h29a-q034", "d:エ", "en", "the vendor shows in its proposal after winning the order", "the vendor shows in the proposal it submits in response to the RFP", 1],
  // 2017h29a-q051 (zh)
  ["2017h29a-q051", "d:エ", "zh", "零部件采购方", "零部件供应商", 1],
  // 2017h29a-q058 (zh)
  ["2017h29a-q058", "d:ア", "zh", "插入空白进行退格", "插入空白进行缩进", 1],
  ["2017h29a-q058", "p:1", "zh", "缩进（退格排版）", "缩进（行首缩进排版）", 1],
  // 2017h29a-q071
  ["2017h29a-q071", "correct", "jp", "本人自身が「持っている（being）」特徴を使うため", "本人自身の身体的特徴 (本人そのもの = something you are) を使うため", 1],
  ["2017h29a-q071", "correct", "zh", "使用的是本人自身所「具有（being）」的特征", "使用的是本人自身的特征（即“本人是谁”，something you are）", 1],
  ["2017h29a-q071", "correct", "en", "relies on a trait the person themselves “has (being),”", "relies on a trait of who the person is (something you are),", 1],
  // 2017h29a-q073
  ["2017h29a-q073", "p:1", "jp", "差分バックアップ", "増分バックアップ", 1],
  ["2017h29a-q073", "p:1", "zh", "差异备份", "增量备份", 1],
  ["2017h29a-q073", "p:1", "en", "a differential backup", "an incremental backup", 1],
  // 2017h29a-q099 (jp)
  ["2017h29a-q099", "d:ア", "jp", "WANを含むaやbを挙げている点が誤りです。", "WANを必要としないaやbを挙げている点が誤りです。", 1],
  // 2017h29h-q010
  ["2017h29h-q010", "p:1", "jp", "意匠法・実用新案法などの産業財産権は物品のデザインや考案を保護対象とし、プログラム自体は保護しない。",
    "意匠法・実用新案法は物品のデザインや考案を保護対象とし、プログラム自体は保護しない (なお、同じ産業財産権でも特許法ではプログラムが「物の発明」として保護され得る)。", 1],
  ["2017h29h-q010", "p:1", "zh", "外观设计法、实用新型法等工业产权以物品的设计或构思为保护对象，并不保护程序本身。",
    "外观设计法、实用新型法以物品的设计或构思为保护对象，并不保护程序本身（不过同属工业产权的专利法可以把程序作为“物的发明”加以保护）。", 1],
  ["2017h29h-q010", "p:1", "en", "Industrial property rights such as the Design Act and the Utility Model Act protect the design or devising of an article and do not protect the program itself.",
    "The Design Act and the Utility Model Act protect the design or devising of an article and do not protect the program itself (although the Patent Act, another industrial property right, can protect a program as an invention of a product).", 1],
  // 2017h29h-q013
  ["2017h29h-q013", "d:ア", "jp", "契約の種類を問わず指名要請は認められないため、a を含む「ア」は誤り。",
    "この特定を目的とする行為は原則禁止で、例外は紹介予定派遣だけである。a は契約の種類を問わず指名しているので不適切で、a を含む「ア」は誤り。", 1],
  ["2017h29h-q013", "d:ア", "zh", "无论合同的种类如何，指名要求都不被允许，因此包含 a 的「ア」是错误的。",
    "这类以特定为目的的行为原则上被禁止，例外只有介绍预定派遣。a 不论合同种类都指名要求，因此不恰当，包含 a 的「ア」是错误的。", 1],
  ["2017h29h-q013", "d:ア", "en", "A naming request is not permitted regardless of the type of contract, so “ア”, which includes a, is wrong.",
    "Such actions are prohibited in principle, the only exception being temp-to-perm dispatch; a names an individual regardless of the type of contract, so it is inappropriate, and “ア”, which includes a, is wrong.", 1],
  // 2017h29h-q019
  ["2017h29h-q019", "d:ウ", "jp", "システム要件定義の内容で、要件定義プロセスに属する。", "システム要件定義の内容で、開発プロセスに属する。", 1],
  ["2017h29h-q019", "d:ウ", "zh", "的内容，属于需求定义流程，", "的内容，属于开发流程，", 1],
  ["2017h29h-q019", "d:ウ", "en", "it belongs to the requirements definition process,", "it belongs to the development process,", 1],
  ["2017h29h-q019", "p:1", "jp", "要件定義=業務要件 (業務手順・ルール) とシステム要件 (機能・構成)、", "要件定義=業務要件 (業務手順・ルール)、開発 (システム要件定義)=システムの機能・構成、", 1],
  ["2017h29h-q019", "p:1", "zh", "需求定义＝业务需求（业务步骤、规则）与系统需求（功能、配置），", "需求定义＝业务需求（业务步骤、规则），开发（系统需求定义）＝系统的功能、配置，", 1],
  ["2017h29h-q019", "p:1", "en", "requirements definition = business requirements (business procedures, rules) and system requirements (functions, configuration);", "requirements definition = business requirements (business procedures, rules); development (system requirements definition) = system functions and configuration;", 1],
  // efix2 low: 2013h25h-q005
  ["2013h25h-q005", "d:ア", "jp", "要件定義プロセスの後に来る開発プロセスの中のシステム要件定義の作業である。", "要件定義プロセスの後に来る開発プロセス (システム要件定義〜外部設計) の作業である。", 1],
  ["2013h25h-q005", "d:ア", "zh", "是需求定义流程之后的开发流程中系统需求定义的工作。", "是需求定义流程之后的开发流程（系统需求定义～外部设计）的工作。", 1],
  ["2013h25h-q005", "d:ア", "en", "is work of system requirements definition within the development process, which comes after the requirements definition process.", "is work of the development process (from system requirements definition to external design), which comes after the requirements definition process.", 1],
  ["2013h25h-q005", "p:1", "jp", "開発プロセスのシステム要件定義、", "開発プロセス (システム要件定義〜外部設計)、", 1],
  ["2013h25h-q005", "p:1", "zh", "属于开发流程中的系统需求定义，", "属于开发流程（系统需求定义～外部设计），", 1],
  ["2013h25h-q005", "p:1", "en", "belongs to system requirements definition in the development process,", "belongs to the development process (from system requirements definition to external design),", 1],
  // efix2 low: 2011h23tokubetsu-q092
  ["2011h23tokubetsu-q092", "correct", "jp", "の二点を、保守契約という取決めに照らして判断させるものである。", "の二点を、保守契約と契約条件 (瑕疵担保期間) に照らして判断させるものである。", 1],
  ["2011h23tokubetsu-q092", "correct", "zh", "本题要求依据维护合同这一约定，判断两点", "本题要求依据维护合同和合同条件（瑕疵担保期间），判断两点", 1],
  ["2011h23tokubetsu-q092", "correct", "en", "This question asks you to judge two things against the arrangement called a maintenance contract:", "This question asks you to judge two things against the maintenance contract and the contract terms (the warranty period for defects):", 1],
  // efix2 low: 2018h30a-q082 (zh)
  ["2018h30a-q082", "p:1", "zh", "双工化与提升可用率", "双重化与提升可用率", 1],
];

// translations sidecar (+ .phase1 tr_): [id, choice, lang, from, to, n]
const TRFIX = [
  ["2016h28a-q033", "ア", "zh", "对业务委托方进行监督", "对业务受托方进行监督", 1],
];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix3";
const E = "S131 efix3 解説監査 (efull_3)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const L = (id, s) => [id, () => `（S131 efix3 (efix2 Rule D の low): ${s} — ${MARK}）`];
const NOTE_APPEND = Object.fromEntries([
  N("2015h27a-q027", "誤答肢イの CSF「単一の分析対象を絞り込む」を「目標達成の鍵となる少数の重要要因を絞り込む」に改めた (jp / zh / en)。correct_answer は不変"),
  N("2015h27a-q059", "誤答肢ア・要点 2 の「許容値（しきい値）」は、照合スコアの合格ラインとしてのしきい値 (上げると FRR↑・FAR↓) と逆向きに読めるため括弧を外し「照合誤差の許容値」とした (jp / zh / en)。correct_answer は不変"),
  N("2015h27a-q077", "要点 2 がプロトコルの例に OSI 基本参照モデル (参照モデルで、プロトコルではない) を挙げていたのを TCP/IP、HTTP に改めた (jp / zh / en)。correct_answer は不変"),
  N("2015h27h-q021", "誤答肢ア・要点 2 の意匠権の存続期間「登録から一定年数」を、2020 年 4 月施行の改正後の「出願から最長 25 年」(改正前は登録から 20 年) に改めた (jp / zh / en)。更新制度が無く永続保有できないという結論・correct_answer は不変"),
  N("2015h27h-q032", "誤答肢アをアジャイル開発・反復型モデルと同定していたのを、オブジェクト指向開発のラウンドトリップに改めた (jp / zh / en)。correct_answer は不変"),
  N("2015h27h-q071", "誤答肢イの「暗号処理の観点では速度が改善する要因にはならない」は 802.11n/ac で WEP/TKIP が高速レートを使えないことと合わないため、「本問の原因 (電波干渉) には効かない」に限定した (jp / zh / en)。correct_answer は不変"),
  N("2016h28a-q012", "誤答肢イ・要点 2 の zh がカンパニー制を「事业部制（Company 制）」としていたのを「内部公司制（カンパニー制）」に改めた (zh)。correct_answer は不変"),
  N("2016h28a-q033", "zh が委託先を「业务委托方」(委託する側) と訳していたのを「业务受托方」に改めた (正解解説 4 箇所・要点 1、および translations の選択肢ア)。correct_answer=ア は不変"),
  N("2016h28a-q067", "要点 2 が保守・点検の削減を「冗長性を減らす施策」に入れていたのを、冗長性を捨てる施策 (回線の統合) と保守・点検の削減に分けた (jp / zh / en)。correct_answer は不変"),
  N("2016h28h-q021", "誤答肢ウの「会社に体制整備そのものを義務付ける趣旨の法令ではない」は 2022 年施行の改正 (300 人超の事業者に通報対応体制の整備を義務付け) と合わないため、義務は通報対応の体制に限られ内部統制システムではない、に改めた (jp / zh / en)。correct_answer=ア は不変"),
  N("2016h28h-q025", "要点 1 の適用除外の列挙に、学術研究機関は 2022 年 4 月施行の改正で一律の除外から外れたことを時点つきで注記した (jp / zh / en)。報道 = ウという導出・correct_answer=ウ は不変"),
  N("2016h28h-q034", "誤答肢イのタスクフォースの説明が「部門の壁を越える」ことを否定し、題幹に無い「常設」を持ち込んでいたのを、リーダーの下で特定課題に取り組み通常は企業の枠を越えない点で区別する形に改めた (jp / zh / en)。correct_answer は不変"),
  N("2016h28h-q086", "zh の誤答肢エ (係り受けの誤読) と正解解説の「当面」(題材は電話) を改めた (zh)。correct_answer=ア は不変"),
  N("2017h29a-q008", "要点 2 が系統図・マトリックス図を QC 七つ道具としていたのを、新 QC 七つ道具と分けた (jp / zh / en)。correct_answer は不変"),
  N("2017h29a-q027", "誤答肢ア・ウ・要点 2 の c の罪名「私電磁的記録不正作出」を、カード偽造の専用の罪「支払用カード電磁的記録不正作出」(刑法 163 条の 2) に改めた (jp / zh / en)。上記導出の同じ記述も同じ訂正の対象。d だけ = エという導出・correct_answer=エ は不変"),
  N("2017h29a-q034", "誤答肢エの「受注後にベンダが提案書で示す」は時系列が逆なので「RFP を受けてベンダが提案書で示す」に改めた (jp / zh / en)。correct_answer は不変"),
  N("2017h29a-q051", "誤答肢エの zh「零部件采购方」(調達する側) を「零部件供应商」に改めた (zh)。correct_answer は不変"),
  N("2017h29a-q058", "誤答肢ア・要点 2 の zh で字下げを「退格」(Backspace) と訳していたのを「缩进」に改めた (zh)。correct_answer は不変"),
  N("2017h29a-q071", "正解解説の生体認証「持っている（being）」は所持認証と紛らわしいため「本人そのもの = something you are」に改めた (jp / zh / en)。correct_answer=ア は不変"),
  N("2017h29a-q073", "要点 2 の「差分バックアップ」は題幹 (4)「その日に更新されたファイルだけ」と合わないため「増分バックアップ」に改めた (jp / zh / en)。50 分という導出・correct_answer は不変"),
  N("2017h29a-q099", "誤答肢アの jp 結論文「WAN を含む a や b」を「WAN を必要としない a や b」に改めた (jp)。correct_answer は不変"),
  N("2017h29h-q010", "要点 2 が「意匠法・実用新案法などの産業財産権」はプログラムを保護しないと一般化していたのを、意匠法・実用新案法に限定し、特許法はプログラムを保護し得ると注記した (jp / zh / en)。correct_answer は不変"),
  N("2017h29h-q013", "誤答肢アの「契約の種類を問わず指名要請は認められない」を、特定を目的とする行為は原則禁止・紹介予定派遣は例外、a は契約の種類を問わず指名しているので不適切、に改めた (jp / zh / en)。correct_answer は不変"),
  N("2017h29h-q019", "誤答肢ウ・要点 2 がシステム要件定義を要件定義プロセスに入れていたのを、開発プロセスに改めた (jp / zh / en)。correct_answer=エ は不変"),
  L("2013h25h-q005", "誤答肢ア・要点 2 の工程名を「開発プロセス (システム要件定義〜外部設計)」とし、2014h26h-q049 (外部設計で画面・帳票の項目を検討する = 正解ア) と揃えた (jp / zh / en)。correct_answer=エ は不変"),
  L("2011h23tokubetsu-q092", "正解解説の冒頭「保守契約という取決めに照らして」を、efix2 で書き直した本文に合わせて「保守契約と契約条件 (瑕疵担保期間) に照らして」に改めた (jp / zh / en)。correct_answer=ウ は不変"),
  L("2018h30a-q082", "要点 2 の zh「双工化」を jp「二重化」に合わせて「双重化」に改めた (zh、D-175 で 双工 = duplex に固定したため)。correct_answer は不変"),
]);

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
  subN(t.choices[ch], Lg, from, to, n, `${id} translations.choices.${ch}.${Lg}`);
  const f1 = P("data/ip/quiz/.phase1", `tr_${id}.json`);
  if (existsSync(f1)) {
    if (!T1.has(f1)) T1.set(f1, rj(f1));
    subN(T1.get(f1).choices.find((c) => c.letter === ch), Lg, from, to, n, `${id} .phase1 tr_.choices.${ch}.${Lg}`);
  }
}

for (const { jf, tf, j, tr } of EXP.values()) { wj(jf, j); wj(tf, tr); }
for (const e of Object.keys(TR)) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);
for (const [f, d] of T1) wj(f, d);

const GR = {};
for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const e = id.split("-q")[0];
  GR[e] ??= rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`));
  const r = GR[e].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk()}`; applied++; log.push(`  ✓ ${id} final note: 追記 (round1・flag untouched)`);
}
for (const e of Object.keys(GR)) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix3: applied ${applied}, skipped ${skipped}`);
