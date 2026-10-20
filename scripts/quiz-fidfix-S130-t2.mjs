#!/usr/bin/env node
// Stage 6 / Quiz — S130 **T2** (D-150 §4 段 3、訳層照合: ⑤-2 population 16 exam の 985 題) の採用差分を是正する。
// 源: S130 の訳層照合 run (Sonnet、batch 5、画像なし)。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/t2_tr_fidelity_sn.json
//     マニフェスト = data/ip/quiz/.phase2/t2_tr_input.json (985 題、zh/en は sidecar と 9,850 field 一致を確認済)
//     CLEAN 980 / DISCREPANT 5 / 差分 8 (evidence/quiz_T2_tr_fix_S130.md §2)
//
// 層・方針は quiz-fidfix-S130-t1 / S127-a2b と同じ (subN で出現数を厳密に要求・0 回なら skip / sidecar と .phase1 tr_ の両方に同じ置換 /
// expl は .phase2 expl_tr_ を直して phase2-merge で再生成 / D-143 note は final に純粋後置・round1 不可触 / jp 3 層は読まない・書かない)。
//
// ── 採用差分 (evidence §4) ──
//   2015h27a-q021 イ・エ zh/en 選択肢の略語に jp に無い展開を付けていたのを除去 (A2b BYOD の規則: 消去法・答えの手掛かりになる)
//                       イ (正解肢)「企业社会责任（CSR）」/ "CSR (Corporate Social Responsibility)" は題幹「社会に対する貢献」と直結 (agent 見落とし、fixer 追加)
//                       エ「MBO(目标管理)」/ "MBO (Management by Objectives)" は誤答肢を別概念と明かす (しかも試験文脈の MBO = マネジメントバイアウトと食い違う)
//   2016h28a-q089 zh/en 「100年前に1度氾濫したきり」→ 過去 100 年に 1 回 (時点の意味がずれる) を「100 年前に 1 度だけ」に (解説 correct も追随)
//   2017h29a-q041 ア en 請負契約 "a contract (a subcontracting agreement)" → "a contract for work" (corpus 多数派、解説 ア も追随)
//   2017h29h-q062 エ en 「情報セキュリティ方針」"Information Security Basic Policy" → "Information security policy"
//                       (jp に無い Basic が題幹の "basic principles" と呼応する。A2b 2023r05-q094 と同型。解説は初出で同一視を残す)
//   2021r03-q094 ア zh/en 正解肢 RAT の展開「（远程访问木马）」/ " (Remote Access Trojan)" を除去 (題幹「遠隔から操作」と直結する答えの手掛かり)
//
// ── 仕事 2: D-171 (lead 判断、corpus 全体 2900 題) ──
//   (a) 選択肢: jp が略語だけ (ABBR_RE、展開・訳語なし) の選択肢は zh / en も略語だけにする。展開は解説に任せる (解説は不変)。
//       決定的に処理する形は「ABBR（展開）」「ABBR (展開)」「展開（ABBR）」の 3 つだけで、結果は jp の文字列そのもの。
//       それ以外の形 (D171_MANUAL) と、展開に略語の意味以外の情報 (数字・単位など) を含むもの (D171_SKIP_RE) は自動処理から外して個別に記録する。
//       事前に件数を D171_CHOICE_EXPECT で固定する (違えば中断、0 なら skip)。
//   (b) 題幹: 題幹が説明している概念 = 問われている知識に直結する略語の展開だけを除去する (2025r07-q068 CSIRT 型)。
//       対象の (題, 言語, 展開付きの文字列) は STEM_GLOSS に列挙 (fixer が 108 候補から裁定 + Rule D MINOR-1 で 1 組追加、evidence §12)。それ以外の題幹の展開は据え置く。
//   D-143: 正解肢の文字列が変わる題に note を付ける (題幹だけの題には付けない)。
//
// Run: node scripts/quiz-fidfix-S130-t2.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S130-t2.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>  (対象 exam ごと)
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

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。
// 事後確認は to 出現数が「置換前 − from 内に含まれていた分 + n」と完全一致 (to が from の部分列のときも成り立つ形)。
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

// [lang, field (stem | ア〜エ), from, to, n] — sidecar と .phase1 tr_ の両方に当てる
const FIX = {
  "2015h27a-q021": [["zh", "イ", "企业社会责任（CSR）", "CSR", 1], ["en", "イ", "CSR (Corporate Social Responsibility)", "CSR", 1],
                    ["zh", "エ", "MBO(目标管理)", "MBO", 1], ["en", "エ", "MBO (Management by Objectives)", "MBO", 1]],
  "2016h28a-q089": [["zh", "stem", "但该河流在过去100年里仅泛滥过一次，", "但该河流仅在100年前泛滥过一次，", 1],
                    ["en", "stem", "the river has flooded only once in the past 100 years, so", "the river has flooded only once, 100 years ago, so", 1]],
  "2017h29a-q041": [["en", "ア", "conclude a contract (a subcontracting agreement).", "conclude a contract for work.", 1]],
  "2017h29h-q062": [["en", "エ", "Information Security Basic Policy", "Information security policy", 1]],
  "2021r03-q094": [["zh", "ア", "RAT（远程访问木马）", "RAT", 1], ["en", "ア", "RAT (Remote Access Trojan)", "RAT", 1]],
};
// [where (correct | d:ア〜エ | p:idx), lang, from, to, n] — .phase2 expl_tr_ (phase2-merge で explanations を再生成)
//   展開・同一視の説明は答えた後に読む解説なので据え置く (2015h27a-q021 の CSR / MBO、2021r03-q094 の RAT)。
//   2015h27a-q021 の解説が MBO を目標管理として説明している点は jp 解説 (expl_jp) も同じで、訳層の問題ではない (evidence §8、⑨)。
const EXPL = {
  "2016h28a-q089": [["correct", "zh", "该河流在100年里仅泛滥过一次", "该河流仅在100年前泛滥过一次", 1],
                    ["correct", "en", "the river had flooded only once in 100 years", "the river had flooded only once, 100 years ago,", 1]],
  "2017h29a-q041": [["d:ア", "en", "It is not limited to subcontracting agreements;", "It is not limited to contracts for work;", 1],
                    ["d:ア", "en", "limiting it to “subcontracting agreements only”", "limiting it to “contracts for work only”", 1]],
  "2017h29h-q062": [["correct", "en", "“エ Information Security Basic Policy.”", "“エ Information security policy.”", 1],
                    ["correct", "en", "The information security basic policy is the top-level", "The information security policy (information security basic policy) is the top-level", 1],
                    ["correct", "en", "is the “Information Security Basic Policy,” so エ", "is the “information security policy,” so エ", 1]],
};

const MARK = "fidfix-S130-t2";
const BANK = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8"));
const pg = (id) => { const b = (BANK.questions ?? BANK).find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 正解肢に当たる是正 + semantic 是正。
//   追記しない: 2017h29a-q041 (en の cosmetic、誤答肢)
const NOTE_APPEND = {
  "2015h27a-q021": (p) => `（S130 T2: ${p} の jp 選択肢は略語だけ (BCP / CSR / M&A / MBO) だが、zh / en がイ「企业社会责任（CSR）」/ "CSR (Corporate Social Responsibility)" とエ「MBO(目标管理)」/ "MBO (Management by Objectives)" にだけ展開を付け、題幹の「社会に対する貢献」と正解肢の展開が直結していたのを、jp どおり略語だけに是正。イは**正解肢**だが展開の除去のみで、利益の追求だけでなく社会課題に取り組む企業活動の基本となる考え方 = CSR という導出・correct_answer=イ は不変 — ${MARK}）`,
  "2016h28a-q089": (p) => `（S130 T2: ${p} の jp「川は100年前に1度氾濫したきり」を zh / en が「过去100年里仅泛滥过一次」/ "only once in the past 100 years" と訳し、時点の意味がずれていたのを「仅在100年前泛滥过一次」/ "only once, 100 years ago" に是正（解説も追随）。可能性はほとんどないと判断し対策を講じない = リスク受容という導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2017h29h-q062": (p) => `（S130 T2: ${p} の jp 選択肢エ「情報セキュリティ方針」を en が "Information Security Basic Policy" と jp に無い Basic を付けて訳し、題幹の "basic principles" と呼応していたのを "Information security policy" に是正（解説は初出で基本方針との同一視を残す）。エは**正解肢**だが語の是正のみで、トップマネジメントの考え方や基本原理を示す公式文書 = 情報セキュリティ方針という導出・correct_answer=エ は不変 — ${MARK}）`,
  "2021r03-q026": (p) => `（S130 T2 D-171: ${p} の jp 選択肢ウ「HRTech」を zh が「HR 科技(HR Tech)」(訳語 + 原語)、en が "HR Tech" としていたのを jp どおり「HRTech」に是正。ウは**正解肢**だが表記の是正のみで、人事評価や採用などの人事業務に IT を活用する = HRTech という導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2021r03-q094": (p) => `（S130 T2: ${p} の jp 選択肢アは略語「RAT」だけだが、zh / en が「RAT（远程访问木马）」/ "RAT (Remote Access Trojan)" と展開を付け、題幹の「遠隔から操作」と直結していたのを略語だけに是正。アは**正解肢**だが展開の除去のみで、標的型攻撃で遠隔からファイル送受信やコマンド実行をさせる = RAT という導出・correct_answer=ア は不変 — ${MARK}）`,
};

// ── 仕事 2 (D-171) のデータ ──
const ABBR_RE = /^[A-Za-z][A-Za-z0-9&\-\/\. ]{1,12}$/;
const D171_SKIP_RE = /[0-9０-９]/; // 展開に数字・単位などが入るものは略語の意味以外の情報を含むとみなし、自動処理しない
const D171_CHOICE_EXPECT = 207; // 213 field (3 形) − 仕事 1 で先に処理する 6 field (2015h27a-q021 イ・エ、2021r03-q094 ア)
// 自動の 3 形に当たらないもの: 個別に裁定 (sidecar と .phase1 tr_ に subN)
const D171_MANUAL = {
  // jp「HRTech」(正解肢ウ)。zh は「HR 科技(HR Tech)」(訳語 + 原語)、en は "HR Tech" (分かち書きだけの差)。jp の表記に揃える。同じ問の FinTech (イ) も jp どおり
  "2021r03-q026": [["zh", "ウ", "HR 科技(HR Tech)", "HRTech", 1], ["en", "ウ", "HR Tech", "HRTech", 1]],
};
// [id, lang, 展開付きの文字列, 置換後 (略語), 出現数] — 題幹の展開で、題幹が説明する概念 = 問われている知識に直結するもの
const STEM_GLOSS = [
  ["2009h21a-q003", "zh", "企业社会责任（CSR）", "CSR", 1], ["2009h21a-q003", "en", "CSR (Corporate Social Responsibility)", "CSR", 1],
  ["2010h22a-q022", "zh", "CSR（企业社会责任）", "CSR", 1], ["2010h22a-q022", "en", "CSR (Corporate Social Responsibility)", "CSR", 1],
  ["2010h22a-q027", "zh", "MOT（技术经营）", "MOT", 1], ["2010h22a-q027", "en", "MOT (Management of Technology)", "MOT", 1],
  ["2010h22h-q017", "en", "TOB (Take-Over Bid)", "TOB", 1],
  ["2011h23a-q001", "zh", "OJT（在岗培训）", "OJT", 1], ["2011h23a-q001", "en", "OJT (On-the-Job Training)", "OJT", 1],
  ["2011h23a-q002", "zh", "CIO（首席信息官）", "CIO", 1], ["2011h23a-q002", "en", "CIO (Chief Information Officer)", "CIO", 1],
  ["2011h23a-q025", "zh", "RFP（提案邀请书）", "RFP", 1], ["2011h23a-q025", "en", "RFP (Request For Proposal)", "RFP", 1],
  ["2011h23tokubetsu-q045", "zh", "WBS（工作分解结构）", "WBS", 1], ["2011h23tokubetsu-q045", "en", "WBS (Work Breakdown Structure)", "WBS", 1],
  ["2013h25a-q026", "zh", "TOB（要约收购）", "TOB", 1], ["2013h25a-q026", "en", "TOB (Take-Over Bid)", "TOB", 1],
  ["2013h25a-q071", "zh", "WAN（广域网）", "WAN", 1],
  ["2014h26a-q008", "zh", "TOB（要约收购）", "TOB", 1], ["2014h26a-q008", "en", "TOB (Take-Over Bid)", "TOB", 1],
  ["2014h26a-q056", "zh", "局域网（LAN）", "LAN", 1],
  ["2014h26h-q025", "zh", "OJT（在岗培训）", "OJT", 1], ["2014h26h-q025", "en", "OJT (On-the-Job Training)", "OJT", 1],
  ["2015h27h-q013", "zh", "SFA（销售支持系统）", "SFA", 1], ["2015h27h-q013", "en", "SFA (Sales Force Automation)", "SFA", 1],
  ["2015h27h-q016", "zh", "RFP（提案邀请书）", "RFP", 1], ["2015h27h-q016", "en", "RFP (Request For Proposal)", "RFP", 1],
  ["2015h27h-q018", "zh", "BSC（平衡计分卡）", "BSC", 1], ["2015h27h-q018", "en", "BSC (Balanced Scorecard)", "BSC", 1],
  ["2015h27h-q019", "zh", "SEO（搜索引擎优化）", "SEO", 1],
  ["2016h28a-q007", "zh", "BCP（业务连续性计划）", "BCP", 1], ["2016h28a-q007", "en", "BCP (Business Continuity Plan)", "BCP", 1],
  ["2016h28a-q012", "zh", "并购（M&A）", "M&A", 1],
  ["2016h28a-q014", "zh", "RFI（信息征询书）", "RFI", 1], ["2016h28a-q014", "en", "RFI (Request For Information)", "RFI", 1],
  ["2017h29a-q085", "zh", "VPN（虚拟专用网络）", "VPN", 1],
  ["2017h29h-q084", "zh", "WAN（广域网）", "WAN", 1],
  ["2018h30a-q030", "zh", "BYOD（自带设备办公）", "BYOD", 1],
  ["2019r01a-q013", "zh", "IoT（物联网）", "IoT", 1],
  ["2020r02o-q080", "zh", "HyperText（超文本）", "HyperText", 1],
  ["2023r05-q032", "zh", "RFP（提案邀请书）", "RFP", 1],
  ["2023r05-q067", "zh", "IDS（入侵检测系统）", "IDS", 1],
  ["2024r06-q090", "zh", "WAF（Web 应用防火墙）", "WAF", 1],
  ["2025r07-q068", "zh", "CSIRT（计算机安全事件响应组）", "CSIRT", 1], ["2025r07-q068", "en", "CSIRT (Computer Security Incident Response Team)", "CSIRT", 1],
  ["2026r08-q002", "zh", "BYOD（自带设备办公）", "BYOD", 1],
  ["2026r08-q020", "zh", "RFP（提案邀请书）", "RFP", 1], ["2026r08-q020", "en", "RFP (Request For Proposal)", "RFP", 1],
  ["2026r08-q039", "zh", "WBS（工作分解结构）", "WBS", 1], ["2026r08-q039", "en", "WBS (Work Breakdown Structure)", "WBS", 1],
  ["2010h22a-q052", "zh", "WBS（工作分解结构）", "WBS", 1], ["2010h22a-q052", "en", "WBS (Work Breakdown Structure)", "WBS", 1],
  ["2010h22a-q077", "zh", "OSS(开源软件)", "OSS", 3], ["2010h22a-q077", "en", "OSS (Open Source Software)", "OSS", 1],
  ["2011h23a-q031", "zh", "SFA（销售支持系统）", "SFA", 1], ["2011h23a-q031", "en", "SFA (Sales Force Automation)", "SFA", 1],
  ["2011h23tokubetsu-q055", "zh", "DMZ（隔离区）", "DMZ", 1],
  ["2011h23tokubetsu-q071", "zh", "MTBF（平均故障间隔）", "MTBF", 1], ["2011h23tokubetsu-q071", "zh", "MTTR（平均修复时间）", "MTTR", 1],
  ["2012h24a-q006", "zh", "Off-JT（脱产培训）", "Off-JT", 1], ["2012h24a-q006", "en", "Off-JT (Off-the-Job Training)", "Off-JT", 1],
  ["2012h24a-q011", "en", "PPM (Product Portfolio Management)", "PPM", 1],
  ["2013h25a-q070", "zh", "操作系统(OS)", "OS", 1],
  ["2014h26h-q007", "zh", "RFI（信息征询书）", "RFI", 1], ["2014h26h-q007", "en", "RFI (Request For Information)", "RFI", 1],
  ["2014h26h-q007", "zh", "RFP（提案邀请书）", "RFP", 1], ["2014h26h-q007", "en", "RFP (Request For Proposal)", "RFP", 1],
  ["2014h26h-q069", "zh", "MTTR（平均修复时间）", "MTTR", 1], ["2014h26h-q069", "en", "MTTR (mean time to repair)", "MTTR", 1],
  ["2014h26h-q069", "zh", "MTBF（平均故障间隔）", "MTBF", 1], ["2014h26h-q069", "en", "MTBF (mean time between failures)", "MTBF", 1],
  ["2015h27a-q013", "zh", "RFID（射频识别）", "RFID", 1], ["2015h27a-q013", "en", "RFID (Radio Frequency Identification)", "RFID", 1],
  ["2015h27h-q004", "zh", "SNS（社交网络服务）", "SNS", 1], ["2015h27h-q004", "en", "SNS (social networking service)", "SNS", 1],
  ["2016h28a-q018", "zh", "POS（销售时点信息管理）", "POS", 1], ["2016h28a-q018", "en", "POS (Point of Sale)", "POS", 1],
  ["2016h28h-q017", "zh", "SNS（社交网络服务）", "SNS", 1], ["2016h28h-q017", "en", "SNS (social networking service)", "SNS", 1],
  ["2016h28h-q024", "zh", "OJT（在岗培训）", "OJT", 1], ["2016h28h-q024", "en", "OJT (On-the-Job Training)", "OJT", 1],
  ["2016h28h-q057", "en", "PKI (Public Key Infrastructure)", "PKI", 1],
  ["2016h28h-q067", "zh", "广域网（WAN）", "WAN", 1],
  ["2016h28h-q099", "zh", "IrDA（红外数据通信）", "IrDA", 1],
  ["2017h29a-q034", "zh", "RFP（提案邀请书）", "RFP", 1], ["2017h29a-q034", "en", "RFP (Request For Proposal)", "RFP", 1],
  ["2017h29a-q080", "zh", "ISMS（信息安全管理体系）", "ISMS", 1],
  ["2017h29a-q099", "zh", "WAN（广域网）", "WAN", 1], ["2017h29a-q099", "zh", "LAN（局域网）", "LAN", 2],
  ["2017h29h-q018", "zh", "RFP（提案邀请书）", "RFP", 1], ["2017h29h-q018", "en", "RFP (Request For Proposal)", "RFP", 1],
  ["2018h30h-q041", "zh", "FAQ（常见问题）", "FAQ", 1], ["2018h30h-q041", "en", "FAQ (Frequently Asked Questions)", "FAQ", 1],
  ["2018h30h-q048", "zh", "WBS（工作分解结构）", "WBS", 1],
  ["2019r01a-q003", "zh", "IoT（物联网）", "IoT", 1],
  ["2019r01a-q016", "zh", "RFI（信息征询书）", "RFI", 1], ["2019r01a-q016", "en", "RFI (Request For Information)", "RFI", 1],
  ["2019r01a-q028", "zh", "SFA（销售支持系统）", "SFA", 1], ["2019r01a-q028", "en", "SFA (Sales Force Automation)", "SFA", 1],
  ["2019r01a-q031", "zh", "RFID（射频识别）", "RFID", 1], ["2019r01a-q031", "en", "RFID (Radio Frequency Identification)", "RFID", 1],
  ["2019r01a-q092", "zh", "DMZ（隔离区）", "DMZ", 1],
  ["2020r02o-q010", "zh", "IoT（物联网）", "IoT", 1],
  ["2020r02o-q064", "zh", "DBMS（数据库管理系统）", "DBMS", 1],
  ["2021r03-q027", "zh", "BYOD（自带设备办公）", "BYOD", 1],
  ["2021r03-q053", "zh", "SLM（服务级别管理）", "SLM", 1], ["2021r03-q053", "en", "SLM (Service Level Management)", "SLM", 1],
  ["2021r03-q054", "zh", "WBS（工作分解结构）", "WBS", 1], ["2021r03-q054", "en", "WBS (Work Breakdown Structure)", "WBS", 1],
  ["2021r03-q100", "zh", "TCO（总拥有成本）", "TCO", 1], ["2021r03-q100", "en", "TCO (Total Cost of Ownership)", "TCO", 1],
  ["2022r04-q008", "zh", "RFI（信息征询书）", "RFI", 1], ["2022r04-q008", "en", "RFI (Request For Information)", "RFI", 1],
  ["2022r04-q017", "zh", "BYOD（自带设备办公）", "BYOD", 1],
  ["2022r04-q036", "zh", "WBS（工作分解结构）", "WBS", 1], ["2022r04-q036", "en", "WBS (Work Breakdown Structure)", "WBS", 1],
  ["2025r07-q087", "zh", "CRL（证书吊销列表）", "CRL", 1], ["2025r07-q087", "en", "CRL (Certificate Revocation List)", "CRL", 1],
  ["2026r08-q008", "zh", "IoT（物联网）", "IoT", 1],
  // Rule D MINOR-1: 「广域网」が正解肢エ「广域以太网」と字面で直結する (zh のみ。en は展開なし)
  ["2014h26h-q052", "zh", "广域网（WAN）", "WAN", 1],
];
const MARK171 = "fidfix-S130-t2-d171";
const D171_NOTE = (p, L, jp, ans) => `（S130 T2 D-171: ${p} の jp 選択肢${L}は略語「${jp}」だけだが、zh / en が展開を付けていたのを jp どおり略語だけに是正（展開は解説に残る）。${L}は**正解肢**だが展開の除去のみで、題意の導出・correct_answer=${ans} は不変 — ${MARK171}）`;

const QS = JSON.parse(readFileSync(P("data/ip/quiz/questions.json"), "utf-8")).questions; // jp 選択肢の判定と正解の参照のみ (書かない)
const exams = [...new Set([...Object.keys(FIX), ...Object.keys(EXPL), ...Object.keys(D171_MANUAL), ...STEM_GLOSS.map((r) => r[0]), ...QS.map((q) => q.id)].map((id) => id.split("-q")[0]))].sort();
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));
const T1 = new Map();
const tr1 = (id) => { if (!T1.has(id)) { const f = P("data/ip/quiz/.phase1", `tr_${id}.json`); T1.set(id, { f, d: existsSync(f) ? rj(f) : null }); } return T1.get(id).d; };
const EX = new Map();
const expl = (id) => { if (!EX.has(id)) { const f = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); EX.set(id, { f, d: rj(f) }); } return EX.get(id).d; };

for (const [id, list] of Object.entries(FIX)) {
  const t = TR[id.split("-q")[0]].questions[id], t1 = tr1(id);
  if (!t) throw new Error(`${id}: sidecar に無い`);
  for (const [L, field, from, to, n] of list) {
    if (field === "stem") { subN(t.stem, L, from, to, n, `${id} translations.stem.${L}`); if (t1) subN(t1.stem, L, from, to, n, `${id} .phase1 tr_.stem.${L}`); }
    else { subN(t.choices[field], L, from, to, n, `${id} translations.choices.${field}.${L}`); if (t1) subN(t1.choices.find((c) => c.letter === field), L, from, to, n, `${id} .phase1 tr_.choices.${field}.${L}`); }
  }
}
// Rule D NIT-3: jp 解説 (AI 生成、源ではない) が題幹「100年前に1度氾濫したきり」を「100年に1度きり」と読み違えていたのを、
// 題幹どおりに最小限直す (zh / en 解説の是正と揃える)。.phase2 expl_jp_ を直し phase2-merge で再生成。
const EXPL_JP = {
  "2016h28a-q089": [["correct_jp", "氾濫は100年に1度きりで", "氾濫は100年前に1度あったきりで", 1]],
};
for (const [id, list] of Object.entries(EXPL_JP)) {
  const f = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), d = rj(f);
  for (const [key, from, to, n] of list) subN(d, key, from, to, n, `${id} expl_jp.${key}`);
  wj(f, d);
}
for (const [id, list] of Object.entries(EXPL)) {
  const tr = expl(id);
  for (const [w, L, from, to, n] of list) {
    const o = w === "correct" ? tr.correct : w.startsWith("d:") ? tr.distractors.find((d) => d.letter === w.slice(2)) : tr.points[Number(w.slice(2))];
    subN(o, L, from, to, n, `${id} expl_tr.${w}.${L}`);
  }
}

// ── 仕事 2 (D-171) ──
const applyFix = (id, list) => {
  const t = TR[id.split("-q")[0]].questions[id], t1 = tr1(id);
  for (const [L, field, from, to, n] of list) {
    if (field === "stem") { subN(t.stem, L, from, to, n, `${id} translations.stem.${L}`); if (t1) subN(t1.stem, L, from, to, n, `${id} .phase1 tr_.stem.${L}`); }
    else { subN(t.choices[field], L, from, to, n, `${id} translations.choices.${field}.${L}`); if (t1) subN(t1.choices.find((c) => c.letter === field), L, from, to, n, `${id} .phase1 tr_.choices.${field}.${L}`); }
  }
};
for (const [id, list] of Object.entries(D171_MANUAL)) applyFix(id, list);
// (a) 選択肢: 件数を数えてから書き換える
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const glossForm = (s, jp) => new RegExp(`^${esc(jp)}\\s*[（(]([^（）()]+)[）)]$`).exec(s) ?? new RegExp(`^([^（）()]+?)\\s*[（(]${esc(jp)}[）)]$`).exec(s);
const plan171 = [], skip171 = [], other171 = [], noteIds = new Map();
for (const q of QS) {
  const t = TR[q.exam_id].questions[q.id];
  for (const L of ["ア", "イ", "ウ", "エ"]) {
    const jp = q.choices_jp[L].trim();
    if (!ABBR_RE.test(jp)) continue;
    for (const lang of ["zh", "en"]) {
      const s = t.choices[L][lang].trim();
      if (s === jp) continue;
      const m = glossForm(s, jp);
      if (!m) { if (!D171_MANUAL[q.id]) other171.push(`${q.id} ${L} ${lang}「${s}」`); continue; }
      if (D171_SKIP_RE.test(m[1])) { skip171.push(`${q.id} ${L} ${lang}「${s}」`); continue; }
      plan171.push({ id: q.id, L, lang, before: t.choices[L][lang], jp });
      if (L === q.correct_answer) noteIds.set(q.id, [L, jp, q.correct_answer]);
    }
  }
}
if (other171.length) throw new Error(`D-171: 3 形にも D171_MANUAL にも当たらない field — 手で裁定:\n  ${other171.join("\n  ")}`);
if (plan171.length && plan171.length !== D171_CHOICE_EXPECT) throw new Error(`D-171: 選択肢 ${plan171.length} field (expected ${D171_CHOICE_EXPECT}) — abort`);
if (!plan171.length) skipped++;
for (const r of plan171) {
  const t = TR[r.id.split("-q")[0]].questions[r.id], t1 = tr1(r.id);
  t.choices[r.L][r.lang] = r.jp; applied++;
  log.push(`  ✓ D-171 ${r.id} ${r.L} ${r.lang}: 「${r.before}」→「${r.jp}」`);
  const c1 = t1?.choices.find((c) => c.letter === r.L);
  if (c1 && c1[r.lang] === r.before) c1[r.lang] = r.jp;
  else if (c1 && c1[r.lang] !== r.jp) log.push(`    (.phase1 tr_ は sidecar と乖離「${c1[r.lang]}」— 不触)`);
}
// (b) 題幹
for (const [id, lang, from, to, n] of STEM_GLOSS) {
  const t = TR[id.split("-q")[0]].questions[id], t1 = tr1(id);
  subN(t.stem, lang, from, to, n, `D-171 ${id} translations.stem.${lang}`);
  if (t1 && t1.stem[lang].includes(from)) subN(t1.stem, lang, from, to, t1.stem[lang].split(from).length - 1, `D-171 ${id} .phase1 tr_.stem.${lang}`);
}

for (const { f, d } of T1.values()) if (d) wj(f, d);
for (const { f, d } of EX.values()) wj(f, d);
for (const e of exams) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
// D-171 の note: 正解肢の文字列が変わった題 (仕事 1 で T2 note を付けた題は除く)
for (const [id, [L, jp, ans]] of noteIds) {
  const e = id.split("-q")[0];
  GR[e] ??= rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`));
  const r = GR[e].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; } // fidfix-S130-t2 / -d171 のどちらかが既にある
  r.key_guard.note_jp = `${r.key_guard.note_jp}${D171_NOTE(pg(id), L, jp, ans)}`; applied++; log.push(`  ✓ ${id} final note: D-171 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of Object.keys(GR)) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);
console.log(`  D-171: 選択肢 ${plan171.length} field (自動) + 個別 ${Object.values(D171_MANUAL).flat().length} field、除外 (略語の意味以外を含む) ${skip171.length}${skip171.length ? ": " + skip171.join(" / ") : ""}、題幹 ${STEM_GLOSS.length} 項、note ${noteIds.size} 題`);

console.log(log.join("\n"));
console.log(`  exams: ${exams.join(" ")}`);
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S130-t2: applied ${applied}, skipped ${skipped}`);
