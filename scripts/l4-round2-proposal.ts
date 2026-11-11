#!/usr/bin/env node
// Track L step L4 round 2 — READ-ONLY proposal (no data change). Builds evidence/phase5/hosting/L4_round2.json:
// every occurrence before → after on the CURRENT data (after round 1), the whole field before / after, the editing path
// and machine checks. Families: H-1, H-2, L4-c zh 75 labels (re-judged) + サブロク + 降 etc., 指摘, 试作, 个人编号,
// UNSURE (reviewer's "change" set), M-4 (传票 / 决裁 / 不正当竞争防止法), M-1 LOW (申请人 / 审批人).
// Checks: each `before` occurs exactly once in its field at that moment (edits of one field applied in order);
// hooks: stripInline(after) = stripInline(before), inlineErrors(after) = [], compatText equal; touched units: validateUnit
// (validateV2 + svg + copy) of the unit with the proposed source fields + re-derived compat fields — new issues and new
// B6 zh-term warnings (with the proposed zh_terms entries) are reported; quiz: residue of the old words in the touched
// questions' zh fields after all edits.
// Run: node scripts/l4-round2-proposal.ts [--write]

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const imp = (p: string) => import(pathToFileURL(path.join(ROOT, p)).href);
const lib = await imp("scripts/lib/textbook-v2.mjs");
const { readFrozen, BATCH_DIR } = await imp("scripts/textbook-v2-patch.mjs");
const { validateUnit } = await imp("scripts/textbook-v2-validate.mjs");
const { stripInline, compatText, inlineErrors } = await imp("apps/web/src/lib/textbook/inline.ts");
const kit = await lib.loadKit();
const paths = lib.dataPaths();
const frozen: Record<string, string> = readFrozen(BATCH_DIR);
type Row = Record<string, any>;
const J = (f: string) => JSON.parse(readFileSync(path.join(ROOT, f), "utf-8"));
const clone = (v: unknown) => JSON.parse(JSON.stringify(v));
const occ = (s: string, sub: string) => (sub === "" ? 0 : s.split(sub).length - 1);

// ---------- targets ----------
// quiz: "q:<qid>:<where>" where = stem | c:ア | correct | d:ア | p:0 ; unit: "u:<unit>:<path>" (units path, e.g. terms[3].hook_zh)
type Edit = { family: string; target: string; before: string; after: string; nth?: number; note?: string; ids?: string[] };
const E: Edit[] = [];
const q = (family: string, qid: string, where: string, before: string, after: string, note = "", ids: string[] = []) => E.push({ family, target: `q:${qid}:${where}`, before, after, note, ids });
const u = (family: string, unit: string, p: string, before: string, after: string, note = "", ids: string[] = []) => E.push({ family, target: `u:${unit}:${p}`, before, after, note, ids });

// ===== H-1 (L4_review.md H-1, whole fields re-read) =====
q("H-1", "2010h22a-q010", "d:ウ", "而且B公司的负责人不在A公司的现场", "而且B公司的工作人员不在A公司的现场", "同欄の追加: ja「B社の担当者」。選択肢イ/エの 负责人 (= 責任者) と区別", []);
q("H-1", "2010h22a-q010", "d:ウ", "（IT 运维担当）", "（IT 运维人员）", "", ["B0292"]);
q("H-1", "2011h23tokubetsu-q036", "d:イ", "而不是由担当者自行修改后重新执行", "而不是由测试人员自行修改后重新执行", "同文の「经过负责人的评审和批准」と衝突しない", ["B0386"]);
q("H-1", "2011h23tokubetsu-q036", "d:ウ", "而且, 担当者在没有记录", "而且, 测试人员在没有记录", "", ["B0387"]);
q("H-1", "2011h23tokubetsu-q036", "p:1", "如果担当者擅自更改它", "如果测试人员擅自更改它", "en: a tester", ["B0388"]);
q("H-1", "2023r05-q007", "c:エ", "系统规划负责人", "系统规划人员", "ja システム企画担当者 (en staff member)。誤答肢が正解 (责任者) に見える誤訳", []);
q("H-1", "2023r05-q007", "d:エ", "系统规划负责人是在实务上承担按照信息系统战略进行规划制定的担当者", "系统规划人员是在实务上承担按照信息系统战略进行规划制定工作的人员", "文末「作为负责人并不适当」(= 責任者としては不適切) は残す", ["B0720"]);
q("H-1", "2025r07-q052", "d:エ", "的质量管理担当者", "的质量管理人员", "選択肢エ 质量管理负责人 (= 品質管理責任者) は正しい訳なので残す", ["B0781"]);

// ===== H-2 (编制者 = 题文 表 1) =====
for (const L of ["ア", "イ", "ウ", "エ"]) q("H-2", "2013h25a-q095", `c:${L}`, "作成者姓名", "编制者姓名", "", [{ ア: "B0186", イ: "B0187", ウ: "B0188", エ: "B0189" }[L]!]);
q("H-2", "2013h25a-q095", "correct", "+ 作成者姓名。", "+ 编制者姓名。", "", ["B0444"]);
q("H-2", "2013h25a-q095", "correct", "+ 作成者姓名 开头", "+ 编制者姓名 开头", "", ["B0445"]);
q("H-2", "2013h25a-q095", "d:ウ", "作成者姓名", "编制者姓名", "", ["B0446"]);
q("H-2", "2013h25a-q094", "d:エ", "编写者姓名", "编制者姓名", "review 追加", []);

// ===== 指摘 (D-222 改訂 3: 名詞 = 指出的问题 / 审计意见 / 意见、動詞 = 指出) =====
q("指摘", "2011h23tokubetsu-q034", "stem", "基于该指摘事项制定", "基于所指出的问题制定", "名詞", ["B0176"]);
q("指摘", "2011h23tokubetsu-q034", "correct", "基于该指摘事项制定", "基于所指出的问题制定", "題文と同形", ["B0380"]);
q("指摘", "2011h23tokubetsu-q034", "d:イ", "提出指摘、就改善", "指出问题、就改善", "動詞句", ["B0381"]);
q("指摘", "2011h23tokubetsu-q034", "d:ウ", "本次被指摘的营业部门", "本次被指出问题的营业部门", "動詞", ["B0382"]);
q("指摘", "2011h23tokubetsu-q034", "d:ウ", "针对个别指摘事项制定", "针对个别被指出的问题制定", "名詞", ["B0383"]);
q("指摘", "2011h23tokubetsu-q034", "d:エ", "本题的指摘是：", "本题指出的问题是：", "名詞 (review)", ["B0384"]);
q("指摘", "2011h23tokubetsu-q034", "p:0", "立场提出指摘并就改善", "立场指出问题并就改善", "動詞句", ["B0385"]);
q("指摘", "2012h24a-q097", "stem", "作为该指摘内容，", "作为所指出的问题，", "名詞 (review)", ["B0182"]);
q("指摘", "2012h24a-q097", "correct", "这一イ的指摘是恰当的", "这一イ所指出的问题是恰当的", "題文と同形", ["B0404"]);
q("指摘", "2012h24a-q097", "d:ウ", "进行采集的指摘。", "进行采集的问题。", "名詞", ["B0405"]);
q("指摘", "2014h26a-q040", "stem", "作为系统审计的指摘事项之一，指出了", "作为系统审计所指出的问题之一，提到了", "名詞 + 指出 の重複回避", ["B0191"]);
q("指摘", "2014h26a-q040", "stem", "针对该指摘事项进行改善", "针对所指出的这一问题进行改善", "名詞", ["B0192"]);
q("指摘", "2014h26a-q040", "correct", "本题的指摘事项是「", "本题所指出的问题是「", "名詞", ["B0470"]);
q("指摘", "2014h26a-q040", "d:イ", "本题的指摘属于", "本题所指出的问题属于", "名詞", ["B0471"]);
q("指摘", "2014h26a-q040", "d:ウ", "只到报告指摘事项、", "只到报告所指出的问题、", "名詞", ["B0472"]);
q("指摘", "2014h26h-q099", "stem", "A收到了如下指摘。", "A收到了如下意见。", "見出しと一括 (改名家族)", ["B0238"]);
q("指摘", "2014h26h-q099", "stem", "〔A收到的指摘〕", "〔A收到的意见〕", "見出し", ["B0239"]);
q("指摘", "2014h26h-q099", "correct", "根据指摘(2)", "根据意见(2)", "見出しに揃える", ["B0509"]);
q("指摘", "2013h25a-q038", "correct", "（指摘事项）", "（指出的问题）", "名詞", ["B0424"]);
q("指摘", "2013h25a-q038", "d:ア", "是收到指摘的被审计部门", "是被指出问题的被审计部门", "動詞", ["B0425"]);
q("指摘", "2013h25a-q038", "d:ウ", "根据审计报告的指摘，", "根据审计报告指出的问题，", "名詞", ["B0426"]);
q("指摘", "2013h25a-q057", "correct", "针对该指摘，", "针对所指出的问题，", "名詞", ["B0437"]);
q("指摘", "2013h25a-q057", "d:ア", "在收到审计指摘这一检查结果之后", "在收到审计意见这一检查结果之后", "名詞", ["B0438"]);

// ===== 试作 (D-222 改訂 3: 原型 / 原型制作 系; 題文・選択肢で答えの語 (原型法) を漏らさない) =====
q("试作", "2010h22a-q034", "stem", "在早期阶段制作试作软件以明确", "在早期阶段制作可试用的软件以明确", "題文: 正解 エ が 原型法 のため「原型」を使わない (答えの語の漏れ)", ["B0150"]);
q("试作", "2010h22a-q034", "correct", "作为试作品（原型）的可运行软件", "作为原型的可运行软件", "", ["B0294"]);
q("试作", "2010h22a-q034", "correct", "把画面和操作的试作品拿给用户看", "把画面和操作的原型拿给用户看", "", ["B0295"]);
q("试作", "2010h22a-q034", "correct", "「在早期阶段制作试作软件以明确用户需求事项」", "「在早期阶段制作可试用的软件以明确用户需求事项」", "題文の引用 (B0150 と同形)", ["B0296"]);
q("试作", "2010h22a-q034", "d:ア", "也不是用试作品来确认", "也不是用原型来确认", "", ["B0297"]);
q("试作", "2010h22a-q034", "d:イ", "以「制作试作软件来明确用户需求事项」为目的", "以「制作可试用的软件来明确用户需求事项」为目的", "題文の引用", ["B0298"]);
q("试作", "2010h22a-q034", "d:ウ", "与制作试作品来确认", "与制作原型来确认", "", ["B0299"]);
q("试作", "2010h22a-q034", "p:0", "制作试作品并让用户确认", "制作原型并让用户确认", "", ["B0300"]);
q("试作", "2010h22a-q034", "p:1", "（用试作品来确定需求的方式", "（用原型来确定需求的方式", "", ["B0301"]);
q("试作", "2020r02o-q051", "c:イ", "制作软件的试作品（原型），", "制作软件的原型，", "選択肢 (既に 原型 を含む誤答肢)", ["B0250"]);
q("试作", "2020r02o-q051", "d:イ", "“制作试作品（原型）并将", "“制作原型并将", "選択肢イの引用", ["B0678"]);
q("试作", "2020r02o-q051", "p:1", "原型法（试作评价）", "原型法（制作原型并评价）", "", ["B0679"]);
q("试作", "2009h21h-q038", "d:エ", "是先做出试作品让用户评价的原型模型", "是先做出可试用的版本让用户评价的原型模型", "「原型…原型模型」の重複回避", ["B0284"]);
q("试作", "2009h21h-q038", "p:1", "原型 = 用试作品在早期获得用户的评价", "原型 = 先做出原型，在早期获得用户的评价", "", ["B0285"]);
q("试作", "2016h28h-q049", "correct", "粗略实现的试作，", "粗略实现的试用版本，", "主語が 原型 なので 原型 を繰り返さない", ["B0549"]);
q("试作", "2016h28h-q049", "d:イ", "与作为可运行试作软件的原型不同", "与作为可运行的简易软件的原型不同", "", ["B0550"]);
q("试作", "2016h28h-q049", "p:0", "早期制作的简易试作软件。", "早期制作的简易的可运行软件。", "原型の定義文", ["B0551"]);
q("试作", "2016h28h-q049", "p:1", "用「可运行的试作」尽早", "用「可运行的原型」尽早", "", ["B0552"]);
q("试作", "2019h31h-q048", "d:ウ", "制作试作品（原型），", "制作原型，", "", ["B0636"]);
q("试作", "2019r01a-q049", "d:イ", "是制作试作品加以确认的原型模型", "是制作原型加以确认的原型模型", "", ["B0661"]);
q("试作", "2019r01a-q049", "p:1", "通过试作探寻需求", "通过制作原型探寻需求", "", ["B0662"]);
q("试作", "2019r01a-q052", "d:ウ", "制作试作品 (原型)，", "制作原型，", "", ["B0663"]);
q("试作", "2019r01a-q052", "d:ウ", "通过试作来确认需求", "通过制作原型来确认需求", "", ["B0664"]);
q("试作", "2019r01a-q052", "p:1", "原型法 = 通过试作确认需求", "原型法 = 通过制作原型确认需求", "", ["B0665"]);
q("试作", "2019r01a-q055", "d:ア", "的原型（试作品），", "的原型，", "", ["B0666"]);
q("试作", "2019r01a-q055", "p:1", "原型法（试作评估）", "原型法（制作原型并评估）", "review", ["B0667"]);
q("试作", "2020r02o-q046", "d:ウ", "制作试作品（原型）让用户确认", "制作原型让用户确认", "", ["B0675"]);
q("试作", "2020r02o-q046", "p:1", "原型法是通过试作确定需求", "原型法是通过制作原型确定需求", "", ["B0676"]);
q("试作", "2020r02o-q053", "d:エ", "原型（试作品）是在开发初期制作简易的试作模型", "原型是在开发初期制作的简易模型", "同じ窓の 2 出現", ["B0680", "B0681"]);
q("试作", "2021r03-q041", "d:エ", "制作试作品(原型)、", "制作原型、", "", ["B0690"]);
q("试作", "2021r03-q041", "p:1", "原型法(使用试作品的开发过程)", "原型法(使用原型的开发过程)", "", ["B0691"]);
q("试作", "2023r05-q040", "d:ア", "而制作试作品（原型）的开发手法", "而制作原型的开发手法", "", ["B0730"]);
q("试作", "2024r06-q047", "d:ア", "的原型（试作品）、", "的原型、", "", ["B0745"]);
q("试作", "2024r06-q047", "p:1", "原型法（用试作评估妥当性）", "原型法（用原型评估妥当性）", "", ["B0746"]);
q("试作", "2025r07-q009", "correct", "集中制作原型（试作品），", "集中制作原型，", "", ["B0775"]);
q("试作", "2026r08-q038", "d:エ", "制作原型（试作品）让用户确认", "制作原型让用户确认", "", ["B0793"]);
q("试作", "2026r08-q038", "p:1", "迭代型、试作型方法", "迭代型、原型式方法", "review", ["B0794"]);

// ===== UNSURE (reviewer の「改」) =====
u("UNSURE", "management-09-26-u04", "terms[5].detail_zh", "通过**冲刺回顾**检讨工作方式", "通过**冲刺回顾**反思工作方式", "review B0002", ["B0002"]);
u("UNSURE", "technology-15-41-u02", "unit_summary_zh", "与实装内存模块（DIMM 系列）", "与内存模块（DIMM 系列）", "review: 实装 を外す", ["B0104"]);
q("UNSURE", "2012h24h-q088", "stem", "按照选定要件被选中的机型", "按照选型要求被选中的机型", "題文の見出し〔选型要求〕に揃える (review の「选定条件」より題文に一致)", ["B0184"]);
q("UNSURE", "2012h24h-q087", "correct", "中题A 的〔选定要件〕(4)", "中题A 的〔选型要求〕(4)", "題文見出しの引用", ["B0413"]);
q("UNSURE", "2012h24h-q087", "correct", "此外〔选定要件〕(3)", "此外〔选型要求〕(3)", "", ["B0414"]);
q("UNSURE", "2012h24h-q087", "p:0", "由〔选定要件〕(4)", "由〔选型要求〕(4)", "", ["B0415"]);
q("UNSURE", "2012h24h-q087", "p:1", "〔选定要件〕(3)", "〔选型要求〕(3)", "", ["B0416"]);
q("UNSURE", "2012h24h-q088", "correct", "本组题的选定要件规定", "本组题的选型要求规定", "", ["B0417"]);
q("UNSURE", "2012h24h-q088", "correct", "因此按照选定要件被选中", "因此按照选型要求被选中", "", ["B0418"]);
q("UNSURE", "2019r01a-q017", "c:ア", "价值或满足度，", "价值或满足感，", "", ["B0248"]);
q("UNSURE", "2019r01a-q017", "d:ア", "价值与满足度随", "价值与满足感随", "選択肢アの引用", ["B0644"]);
q("UNSURE", "2009h21a-q064", "d:ウ", "这个误答项", "这个错误选项", "review", ["B0274"]);
q("UNSURE", "2009h21h-q069", "p:1", "记忆装置要区分", "存储装置要区分", "", ["B0291"]);
q("UNSURE", "2013h25a-q044", "correct", "长期未结的案件在不断堆积", "长期未结的事件在不断堆积", "事件管理の文脈", ["B0427"]);
q("UNSURE", "2013h25a-q044", "d:ア", "被搁置的案件正在堆积", "被搁置的事件正在堆积", "", ["B0428"]);
q("UNSURE", "2013h25a-q044", "d:ア", "长期未结案件积压", "长期未结事件积压", "", ["B0429"]);
q("UNSURE", "2014h26h-q037", "p:1", "记录全部案件", "记录全部受理事项", "review B0501", ["B0501"]);
q("UNSURE", "2014h26h-q095", "correct", "审批文件（稟议书）", "审批文件（稟議書）", "混成字形 → 日本語のまま (括弧の原語)", ["B0505"]);
q("UNSURE", "2014h26h-q095", "p:0", "（审批／稟议系统）", "（审批（稟議）系统）", "混成字形を解消", ["B0506"]);
q("UNSURE", "2025r07-q006", "d:ア", "这是事业者自行公开的地址", "这是经营者自行公开的地址", "个人信息处理经营者 の登録と一致", ["B0773"]);
q("UNSURE", "2025r07-q006", "p:1", "已公开的事业者地址", "已公开的经营者地址", "", ["B0774"]);

// ===== M-4 (走査漏れ) =====
// 2009h21a-q100: 伝票番号 → 单据编号 (題文の図 2 が既に「单据编号」)。伝票 = 单据 を題の zh 全欄で統一
const T100 = ["stem", "c:ア", "c:イ", "c:ウ", "c:エ", "correct", "d:ア", "d:イ", "d:エ", "p:0", "p:1"];
for (const w of T100) E.push({ family: "M-4 传票", target: `q:2009h21a-q100:${w}`, before: "传票", after: "单据", nth: -1, note: "題内で全置換 (伝票 = 单据、伝票番号 = 单据编号)" });
q("M-4 传票", "2013h25a-q025", "p:0", "其实现手段是使用传票（看板）的看板方式", "其实现手段是使用看板（作业指示卡）的看板方式", "JIT のかんばん。伝票 の直訳を外す", []);
q("M-4 决裁", "2012h24h-q027", "d:エ", "像申请、审批、决裁那样", "像申请、审批、最终核准那样", "review M-4", []);
q("M-4 决裁", "2019h31h-q002", "correct", "审批人、决裁人路径", "审批人、最终核准人路径", "本 writer の追加発見 (括弧外)", []);
q("M-4 决裁", "2019h31h-q002", "p:0", "把审批与决裁电子化", "把审批与最终核准电子化", "本 writer の追加発見 (括弧外)", []);
for (const [qid, w] of [["2013h25a-q027", "d:イ"], ["2013h25a-q027", "p:1"], ["2026r08-q021", "d:エ"], ["2026r08-q021", "p:1"]] as const)
  q("M-4 不正当竞争防止法", qid, w, "不正当竞争防止法", "反不正当竞争法", "zh_terms 不正競争防止法 = 反不正当竞争法", []);

// ===== M-1 LOW (2014h26a 申请人 / 审批人 → 申请者 / 审批者、共通題文の語に揃える) =====
for (const [w, n] of [["correct", 4], ["d:ア", 1], ["d:イ", 1], ["d:ウ", 2]] as const) E.push({ family: "M-1 LOW", target: `q:2014h26a-q098:${w}`, before: "申请人", after: "申请者", nth: -1, note: `共通題文 (申请者) に揃える ×${n}` });
E.push({ family: "M-1 LOW", target: "q:2014h26a-q098:c:ウ", before: "申请人", after: "申请者", nth: -1, note: "選択肢ウ" });
for (const [w, words] of [["stem", ["申请人", "审批人"]], ["correct", ["申请人", "审批人"]], ["d:ア", ["申请人"]], ["d:イ", ["申请人", "审批人"]]] as const)
  for (const b of words) E.push({ family: "M-1 LOW", target: `q:2014h26a-q100:${w}`, before: b, after: b.replace("人", "者"), nth: -1, note: "" });

// ===== 个人编号 (D-222 改訂 1): rules over every zh source field of quiz + units =====
const MYN: [RegExp, string][] = [
  [/《我的编号法》（编号法）/g, "《个人编号法》"],
  [/我的编号法（编号法）/g, "个人编号法"],
  [/号码法（个人番号法）/g, "个人编号法"],
  [/《番号法》（个人番号法）/g, "《个人编号法》"],
  [/个人编号（我的编号）/g, "个人编号（My Number）"],
  [/我的编号法/g, "个人编号法"],
  [/个人番号/g, "个人编号"],
  [/(?<!个人)番号法/g, "个人编号法"],
  [/(?<![个人编])号码法/g, "个人编号法"],
  [/(?<!个人)编号法/g, "个人编号法"],
  [/我的编号/g, "个人编号"],
  [/(?<![個ト])番号/g, "编号"],
];
// fields whose rule result is replaced by a hand-written value (hook: cite the Japanese legal name)
const MYN_OVERRIDE: Record<string, string> = {
  "u:strategy-05-14-u05:terms[3].hook_zh": "「My Number」（我的号码）是昵称，法律上的正式名称是「[[jp:個人番号]]」（个人号码）。",
};

// ===== L4-c zh: the 75 non-glyph labels re-judged (rule: mark only the quoted Japanese original) =====
// [unit, term, label, nth occurrence of “label” among quoted occurrences in the hook (1-based), decision, why]
type HL = [string, string, string, number, "mark" | "drop", string];
const HOOK75: HL[] = [
  ["management-08-25-u05", "類推見積法", "推", 1, "drop", "“类”“推” は中国語 类推 の分解 (类 は簡体)"],
  ["management-11-29-u04", "サービス可用性管理", "可用", 1, "mark", "日语的“可用” = 引用された日本語"],
  ["management-11-30-u01", "自家発電装置", "自家", 1, "mark", "日本語名 自家発電装置 の分解 (zh 名は 自备)"],
  ["strategy-01-01-u01", "経営理念", "理", 1, "drop", "borderline: 理念 は中国語 经营理念 と同字、手がかり無し"],
  ["strategy-01-01-u01", "経営理念", "念", 1, "drop", "同上"],
  ["strategy-01-01-u01", "人的資本経営", "本", 1, "drop", "人力资本 (中国語) の字。“费” も無印"],
  ["strategy-01-01-u10", "第4次産業革命", "次", 1, "mark", "日语的“次” = 日本語の字"],
  ["strategy-01-01-u11", "国家戦略特別区域法", "特区", 1, "mark", "简称“特区” = 日本語の略称 (en も [[jp:特区]])"],
  ["strategy-01-02-u04", "相関と因果", "因果", 1, "mark", "日语的「[[jp:相関]]」「因果」= 2 語とも引用された日本語。2 つ目の“因果”(有因才有果) は中国語の説明で無印"],
  ["strategy-01-02-u05", "散布図", "散布", 1, "mark", "日语名“[[jp:散布図]]”的“散布” = 日本語名の部分"],
  ["strategy-01-02-u09", "母集団", "母", 1, "mark", "日语写作「[[jp:母集団]]」，「母」= 日本語の字"],
  ["strategy-01-02-u09", "全数調査", "悉", 1, "mark", "「[[jp:悉皆調査]]」中的「悉」= 日本語名の字"],
  ["strategy-01-03-u01", "粗利益", "粗", 1, "mark", "[[jp:粗利益]]里的“粗”"],
  ["strategy-01-03-u04", "固定資産", "固定", 1, "drop", "borderline: 固定资产 (中国語) と同字、手がかり無し (L3 C06)"],
  ["strategy-02-04-u01", "著作権法", "著", 1, "mark", "日文“著”"],
  ["strategy-02-04-u01", "実用新案法", "新案", 1, "mark", "日本語名の部分 (zh は 实用新型)。[[jp:実用]] と並ぶ"],
  ["strategy-02-04-u01", "意匠法", "意匠", 1, "mark", "日本語名 (zh は 外观设计)"],
  ["strategy-02-04-u01", "意匠法", "匠", 1, "mark", "“意匠”的“匠” = 日本語名の字"],
  ["strategy-02-05-u01", "匿名加工情報", "匿名", 1, "mark", "名称の部分 (review: ok)"],
  ["strategy-02-05-u01", "匿名加工情報", "加工", 1, "mark", "同上"],
  ["strategy-02-06-u02", "景品表示法", "景品", 1, "mark", "名称中的“景品” = 日本語 (zh 赠品)"],
  ["strategy-02-06-u02", "景品表示法", "表示", 1, "mark", "名称の部分 (日本語の 表示 = 标示)"],
  ["strategy-02-06-u03", "独占禁止法", "独禁法", 1, "mark", "日本語の略称"],
  ["strategy-02-06-u03", "金融商品取引法", "金商法", 1, "mark", "日本語の略称 (review: ok)"],
  ["strategy-02-07-u04", "公益通報者保護法", "公益", 1, "drop", "三段のうち 通报者・保护 は簡体で書き直し済。1 段だけ lang=ja は不統一 (review)"],
  ["strategy-05-14-u02", "金融情報システム", "勘定", 1, "mark", "日语「勘定」"],
  ["strategy-05-14-u02", "金融情報システム", "勘定系", 1, "mark", "日本語の語 (無引用、MANUAL)"],
  ["strategy-05-14-u04", "デジタルガバメント", "政府", 1, "drop", "ガバメント の中国語訳"],
  ["strategy-05-14-u04", "電子自治体", "自治体", 1, "mark", "日本語 (zh 地方政府) (review: ok)"],
  ["strategy-05-14-u05", "電子入札", "入札", 1, "mark", "日语「入札」 (review: ok)"],
  ["strategy-05-14-u06", "AI利活用ガイドライン", "利活用", 1, "mark", "日语“利活用”"],
  ["strategy-05-14-u06", "AI利活用ガイドライン", "利用", 1, "mark", "“利活用”の構成語として引用"],
  ["strategy-05-14-u06", "AI利活用ガイドライン", "活用", 1, "mark", "同上"],
  ["strategy-05-16-u04", "暗号資産", "暗号", 1, "mark", "日本語名 [[jp:暗号資産]] の部分 ([[jp:資産]] と並ぶ)"],
  ["strategy-07-22-u01", "企画プロセス", "企", 1, "mark", "日语[[jp:企画]]中的“企”"],
  ["strategy-07-23-u01", "要件の合意", "合意", 1, "mark", "見出し語の日本語 (zh 达成共识)"],
  ["technology-13-33-u02", "XOR", "排他", 1, "mark", "日语名称“[[jp:排他的論理和]]”中的“排他”"],
  ["technology-13-34-u01", "確率", "率", 1, "drop", "borderline: 概率 (中国語) の字、手がかり無し (review LOW)"],
  ["technology-13-34-u01", "順列", "列", 1, "drop", "borderline: 排列 (中国語) の字、手がかり無し"],
  ["technology-13-34-u03", "推定", "推定", 1, "mark", "日语写作「推定」 (review: ok)"],
  ["technology-13-34-u03", "推定", "推", 1, "mark", "同上の分解"],
  ["technology-13-34-u03", "推定", "定", 1, "mark", "同上の分解"],
  ["technology-13-34-u04", "尺度", "尺度", 1, "mark", "日语“尺度” (review: ok、B6 warn は D-222.9 で受容)"],
  ["technology-13-35-u01", "量子化", "量子", 1, "mark", "日本語名 量子化 の部分 (zh 名は 量化 で 子 を含まない)。要確認: 中国語の物理用語 量子 と同形"],
  ["technology-13-35-u02", "符号化", "符号", 1, "mark", "日文 [[jp:符号化]] 的「符号」"],
  ["technology-13-35-u04", "特徴量", "量", 1, "mark", "日语名称里的“量”"],
  ["technology-14-37-u02", "演算子", "演算子", 1, "mark", "日语写作“演算子” (zh 运算符)"],
  ["technology-14-37-u02", "演算子", "原子", 1, "drop", "比較の例語。中国語でも同じ語として読める (被引用の日本語名ではない)"],
  ["technology-14-37-u02", "演算子", "因子", 1, "drop", "同上"],
  ["technology-14-37-u02", "演算子", "子", 1, "mark", "“演算子”の字"],
  ["technology-14-37-u03", "関数", "函数", 1, "mark", "日语里它原本写作“函数” = 日本語の旧表記"],
  ["technology-14-37-u03", "関数", "函", 1, "mark", "同上の字"],
  ["technology-14-37-u04", "データ型", "型", 1, "drop", "1 つ目 = type の中国語訳 (review)"],
  ["technology-14-37-u04", "データ型", "型", 2, "mark", "日语的“型” (review)"],
  ["technology-15-40-u01", "演算", "演", 1, "mark", "日文「演」"],
  ["technology-15-40-u01", "演算", "演", 2, "drop", "表演的「演」 = 中国語の語の字"],
  ["technology-15-40-u01", "制御", "制", 1, "mark", "日文「制」"],
  ["technology-15-41-u01", "不揮発性メモリ", "不", 1, "mark", "[[jp:揮発]] 前の“不” = 日本語名の字 (zh 名は 非易失)"],
  ["technology-16-43-u02", "デュアルシステム", "二刀流", 1, "mark", "日本語の語"],
  ["technology-20-52-u06", "可逆圧縮", "可逆", 1, "mark", "日语名称“可逆”"],
  ["technology-22-60-u05", "基地局", "局", 1, "mark", "日语 [[jp:基地局]] 里的“局”"],
  ["technology-23-61-u01", "漏えい", "漏", 1, "mark", "日本語名 漏えい の字 (zh 泄露)。2 つ目の 漏 (漏出来) は中国語の動詞で対象外"],
  ["technology-23-61-u04", "災害", "巛", 1, "mark", "[[jp:災]] の字の部品 (中国語 灾 は別構成)"],
  ["technology-23-61-u04", "災害", "火", 1, "mark", "同上"],
  ["technology-23-62-u03", "可用性", "可用", 1, "mark", "日语“可用”"],
  ["technology-23-62-u03", "真正性", "真正", 1, "mark", "日语“真正” (zh 名は 真实性)"],
  ["technology-23-63-u03", "検疫ネットワーク", "疫", 1, "drop", "中国語 检疫 の分解 (检 は簡体) (review)"],
  ["technology-23-63-u05", "施錠管理", "管理", 1, "mark", "[[jp:施錠]] と並ぶ日本語名の後半 (無印だと 公益 と同じ不統一)"],
  ["technology-23-63-u06", "暗号化", "暗", 1, "mark", "日语写作[[jp:暗号]]：“暗”"],
  ["technology-23-63-u06", "暗号化", "号", 1, "mark", "同上 (号 は日本の新字体と同形)"],
  ["technology-23-63-u10", "本人拒否率", "本人", 1, "mark", "日本語名の主語として引用 (他人受入率 と同形、review: ok)"],
  ["technology-23-63-u10", "本人拒否率", "本人拒否率", 1, "mark", "日文“本人拒否率”"],
  ["technology-23-63-u10", "他人受入率", "他人", 1, "mark", "review: ok"],
  ["technology-23-63-u10", "他人受入率", "他人受入率", 1, "mark", "review: ok"],
  ["technology-23-63-u12", "認証局", "局", 1, "mark", "日文「[[jp:認証]]」…「局」"],
];
const REVIEW75: Row[] = J("evidence/phase5/hosting/L4_review_samples.json").l4c_zh_full_read_candidates.items;
// additions (under-marks of the same kind: a character of the cited Japanese word left outside the label)
const HOOK_ADD: HL[] = [
  ["technology-13-34-u04", "データの並べ替え", "降", 1, "mark", "review: “[[jp:昇]]” と対の 降 (降順 の字)"],
  ["strategy-07-23-u01", "要件の合意", "合", 1, "mark", "「合意」的「合」= 日本語の字 (追加、reviewer 判断)"],
  ["strategy-01-02-u04", "相関と因果", "相", 1, "mark", "“相”是“相互”的相 の 1 つ目 = [[jp:相関]] の字 (追加、reviewer 判断)"],
  ["technology-13-35-u02", "符号化", "化", 1, "mark", "「化」是转换成它 = [[jp:符号化]] の字 (en も [[jp:化]]) (追加、reviewer 判断)"],
];

// --final: the Rule D review (L4_round2_review.md) + main-session decisions (session-154 log) applied → L4_round2_final.json
const FINAL = process.argv.includes("--final");
if (FINAL) {
  const fix: Record<string, [string, string]> = {
    B0285: ["原型 = 用试作品在早期获得用户的评价", "原型 = 先做出可试用的版本，在早期获得用户的评价"],
    B0438: ["在收到审计指摘这一检查结果之后", "在审计中被指出问题这一检查结果之后"],
    B0182: ["作为该指摘内容，", "作为所指出的内容，"],
    B0404: ["这一イ的指摘是恰当的", "这一イ所指出的内容是恰当的"],
  };
  for (const e of E) for (const id of e.ids ?? []) if (fix[id]) [e.before, e.after] = fix[id], (e.note = `${e.note} / review L-${{ B0285: 1, B0438: 2, B0182: 3, B0404: 3 }[id]}`);
  MYN_OVERRIDE["u:strategy-05-14-u05:terms[3].hook_zh"] = "「My Number」（我的号码）是昵称，法律上的正式名称是「[[jp:個人番号]]」（即个人编号）。";
  const unmark = (u: string, l: string) => HOOK75.forEach((h) => { if (h[0] === u && h[2] === l) [h[4], h[5]] = ["drop", `review 規則 d: 普通の中国語で意味同一・term_zh の一部 (${h[5]})`]; });
  unmark("strategy-02-05-u01", "匿名");
  unmark("strategy-02-05-u01", "加工");
  unmark("technology-23-63-u05", "管理");
  const k = HOOK_ADD.findIndex((h) => h[0] === "strategy-01-02-u04" && h[2] === "相");
  if (k >= 0) HOOK_ADD.splice(k, 1);
}
// ---------- data access ----------
const quizDocs = new Map<string, Row>();
const quizDoc = (kind: "translations" | "explanations", exam: string) => {
  const k = `${kind}/${exam}`;
  if (!quizDocs.has(k)) quizDocs.set(k, J(`data/ip/quiz/${k}.json`));
  return quizDocs.get(k)!;
};
const unitDocs = new Map<string, Row>();
const unitDoc = (unit: string) => {
  if (!unitDocs.has(unit)) unitDocs.set(unit, J(`data/ip/textbook/units/${unit}.json`));
  return unitDocs.get(unit)!;
};
function ref(target: string): { get: () => string; set: (v: string) => void; layer: string; file: string } {
  const [kind, id, ...rest] = target.split(":");
  const w = rest.join(":");
  if (kind === "q") {
    const exam = id.split("-q")[0];
    const tr = w === "stem" || w.startsWith("c:");
    const d = quizDoc(tr ? "translations" : "explanations", exam).questions[id];
    if (!d) throw new Error(`${target}: no question`);
    const o = w === "stem" ? d.stem : w.startsWith("c:") ? d.choices[w.slice(2)] : w === "correct" ? d.correct : w.startsWith("d:") ? d.distractors[w.slice(2)] : d.points[Number(w.slice(2))];
    if (!o || typeof o.zh !== "string") throw new Error(`${target}: no zh`);
    return { get: () => o.zh, set: (v) => (o.zh = v), layer: tr ? "quiz-translations (sidecar only, D-222.5)" : "quiz-explanations (.phase2/expl_tr → quiz-phase2-merge)", file: tr ? `data/ip/quiz/translations/${exam}.json` : `data/ip/quiz/.phase2/expl_tr_${id}.json` };
  }
  const doc = unitDoc(id);
  const keys = w.split(/\.|\[|\]/).filter(Boolean).map((k) => (/^\d+$/.test(k) ? +k : k));
  let o: any = doc;
  for (const k of keys.slice(0, -1)) o = o?.[k];
  const last = keys.at(-1)!;
  if (typeof o?.[last] !== "string") throw new Error(`${target}: no string`);
  return { get: () => o[last], set: (v) => (o[last] = v), layer: "unit", file: `data/ip/textbook/units/${id}.json` };
}
const unitRoute = (unit: string, p: string) => {
  if (frozen[unit]) return "frozen: 査読つき直接編集 (units/)";
  if (p === "title_zh") return "直接編集 units/ + unit_index.json (C18 / C10 の前例)";
  if (/^unit_summary_zh$/.test(p)) return "unit-level B3 (--manifest、field unit.unit_summary_zh)";
  if (/^terms\[\d+\]\.term_zh$/.test(p)) return "B3 不可: units/ term_zh 直接 + manifest.v1_terms + apps/web v1terms fixture";
  if (/^challenge_questions/.test(p)) return "直接編集 units/ (C11、loc part で再現しない)";
  return "B3 loc-part 補丁 (--part 最終 loc part) → merge dry-run → units/ in-place";
};
const DERIVED = /^(terms\[\d+\]\.(definition|explanation|memory_hook)_zh|overview\.intro_zh|summary\.)/;

// ---------- apply (in memory) ----------
const fieldsBefore = new Map<string, string>();
const items: Row[] = [];
const applyEdit = (e: Edit) => {
  const r = ref(e.target);
  if (!fieldsBefore.has(e.target)) fieldsBefore.set(e.target, r.get());
  const s = r.get();
  const n = occ(s, e.before);
  let ok = e.nth === -1 ? n >= 1 : n === 1;
  const next = e.nth === -1 ? s.split(e.before).join(e.after) : s.replace(e.before, () => e.after);
  if (ok) r.set(next);
  items.push({ ...e, occurrences: n, ok, layer: r.layer, file: r.file });
};
for (const e of E) applyEdit(e);

// 个人编号 rules
const mynFields: Row[] = [];
const scanZh = (o: any, p: string, cb: (p: string, s: string) => void) => {
  if (typeof o === "string") cb(p, o);
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) scanZh(v, Array.isArray(o) ? `${p}[${k}]` : p ? `${p}.${k}` : k, cb);
};
// the Japanese inside [[jp:…]] and the Japanese words 個人番号 / ポート番号 etc. are not touched
const maskJp = (s: string) => s.replace(/\[\[jp:.+?\]\]/g, (m) => "\u0000".repeat(m.length));
const MYN_HIT = { test: (s: string) => /个人番号|我的编号|(?<![個ト])番号|号码法|(?<!个人)编号法/.test(maskJp(s)) };
const mynApply = (s: string) => {
  // apply each rule only where the match lies outside [[jp:…]]
  let out = s;
  for (const [re, to] of MYN) {
    const m = maskJp(out);
    let res = "";
    let last = 0;
    for (const x of m.matchAll(new RegExp(re.source, "g"))) {
      res += out.slice(last, x.index) + to;
      last = x.index! + x[0].length;
    }
    out = res + out.slice(last);
  }
  return out;
};
for (const kind of ["translations", "explanations"] as const)
  for (const f of (await import("node:fs")).readdirSync(path.join(ROOT, "data/ip/quiz", kind))) {
    const exam = f.replace(/\.json$/, "");
    const d = quizDoc(kind, exam);
    for (const [qid, qq] of Object.entries(d.questions as Row)) {
      const ws: string[] = kind === "translations" ? ["stem", ...Object.keys(qq.choices ?? {}).map((L) => `c:${L}`)] : ["correct", ...Object.keys(qq.distractors ?? {}).map((L) => `d:${L}`), ...(qq.points ?? []).map((_: unknown, i: number) => `p:${i}`)];
      for (const w of ws) {
        const t = `q:${qid}:${w}`;
        const s = ref(t).get();
        if (!MYN_HIT.test(s)) continue;
        mynFields.push({ target: t });
      }
    }
  }
for (const f of (await import("node:fs")).readdirSync(path.join(ROOT, "data/ip/textbook/units"))) {
  const unit = f.replace(/\.json$/, "");
  scanZh(unitDoc(unit), "", (p, s) => {
    if (!/(_zh|\.zh)(\[\d+\])?$/.test(p) || DERIVED.test(p)) return;
    if (MYN_HIT.test(s)) mynFields.push({ target: `u:${unit}:${p}` });
  });
}
for (const m of mynFields) {
  const r = ref(m.target);
  const s = r.get();
  if (!fieldsBefore.has(m.target)) fieldsBefore.set(m.target, s);
  let next = mynApply(s);
  if (MYN_OVERRIDE[m.target]) next = MYN_OVERRIDE[m.target];
  if (next === s) continue;
  r.set(next);
  items.push({ family: "个人编号", target: m.target, before: s, after: next, whole_field: true, ok: true, layer: r.layer, file: r.file, note: MYN_OVERRIDE[m.target] ? "hook: 日本語の法律上の名称 個人番号 を [[jp:]] で引用 (rule 置換ではなく手書き)" : "" });
}

// hooks
const hookItems: Row[] = [];
const quotedAt = (s: string, label: string) => {
  // positions of label as a whole quoted segment (「」“”『』‘’) outside existing [[jp:…]]; fallback: bare occurrences
  const out: number[] = [];
  const jp = [...s.matchAll(/\[\[jp:.+?\]\]/g)].map((m) => [m.index!, m.index! + m[0].length]);
  const inJp = (i: number) => jp.some(([a, b]) => i >= a && i < b);
  for (const [o, c] of [["「", "」"], ["“", "”"], ["『", "』"], ["‘", "’"]])
    for (let i = s.indexOf(o + label + c); i !== -1; i = s.indexOf(o + label + c, i + 1)) if (!inJp(i + 1)) out.push(i + 1);
  if (out.length) return out.sort((a, b) => a - b);
  for (let i = s.indexOf(label); i !== -1; i = s.indexOf(label, i + 1)) if (!inJp(i)) out.push(i);
  return out;
};
for (const [unit, term, label, nth, dec, why] of [...HOOK75, ...HOOK_ADD]) {
  const doc = unitDoc(unit);
  const i = doc.terms.findIndex((t: Row) => t.term === term);
  if (i < 0) throw new Error(`${unit} ${term}: no term`);
  const t = `u:${unit}:terms[${i}].hook_zh`;
  const r = ref(t);
  if (!fieldsBefore.has(t)) fieldsBefore.set(t, r.get());
  const s = r.get();
  const pos = quotedAt(s, label);
  const row: Row = { family: HOOK_ADD.some((h) => h[0] === unit && h[2] === label) ? "L4-c zh 追加" : "L4-c zh 75", target: t, term, label, nth, decision: dec, why, candidates: pos.length };
  if (dec === "mark") {
    const at = pos[nth - 1];
    if (at === undefined) row.ok = false;
    else {
      const next = `${s.slice(0, at)}[[jp:${label}]]${s.slice(at + label.length)}`;
      r.set(next);
      row.ok = true;
    }
  } else row.ok = quotedAt(fieldsBefore.get(t)!, label).length >= nth;
  const cand = REVIEW75.find((c: Row) => c.unit === unit && c.term === term && c.label === label);
  if (cand) {
    row.hook_has_cue = cand.hook_has_cue;
    row.label_chars_in_term_zh = cand.label_chars_in_term_zh;
    if (dec === "mark" && !cand.hook_has_cue && cand.label_chars_in_term_zh) row.confirm = "要確認: 日语 提示なし・字が term_zh 内";
  }
  hookItems.push(row);
}
// サブロク (D-222.7)
{
  const doc = unitDoc("strategy-02-06-u01");
  const i = doc.terms.findIndex((t: Row) => t.term === "36協定");
  const t = `u:strategy-02-06-u01:terms[${i}].hook_zh`;
  const r = ref(t);
  if (!fieldsBefore.has(t)) fieldsBefore.set(t, r.get());
  const s = r.get();
  const ok = occ(s, "“サブロク协定”") === 1;
  if (ok) r.set(s.replace("“サブロク协定”", "“[[jp:サブロク]]协定”"));
  hookItems.push({ family: "L4-c サブロク", target: t, term: "36協定", label: "サブロク", decision: "mark", why: "D-222.7: 読みの部分だけ日本語、协定 は中国語", ok });
}

// ---------- checks per field ----------
const fieldRows: Row[] = [];
for (const [t, before] of fieldsBefore) {
  const after = ref(t).get();
  if (after === before) continue;
  const row: Row = { target: t, before, after };
  const [kind, id, w] = [t.split(":")[0], t.split(":")[1], t.split(":").slice(2).join(":")];
  if (kind === "u") {
    row.route = unitRoute(id, w);
    if (/hook_zh$/.test(w)) {
      row.strip_equal = stripInline(after) === stripInline(before);
      if (MYN_OVERRIDE[t]) row.text_change_expected = "个人编号: hand-written hook (text changes by design)";
      row.inline_errors = inlineErrors(after);
      row.compat_equal = compatText(after, "zh") === compatText(before, "zh");
    } else row.inline_errors = inlineErrors(after);
  } else row.route = ref(t).layer;
  fieldRows.push(row);
}

// units: re-derive compat fields + validateUnit (with the proposed zh_terms / v1_terms)
const zhTable = clone(lib.readJson(paths.zhTerms));
const ZT = zhTable.terms ?? zhTable;
const zhTermsChange = { "マイナンバー": [ZT["マイナンバー"], "个人编号（My Number）"], "マイナンバー法": [ZT["マイナンバー法"], "个人编号法"] };
ZT["マイナンバー"] = "个人编号（My Number）";
ZT["マイナンバー法"] = "个人编号法";
const unitReports: Row[] = [];
const origZh = lib.readJson(paths.zhTerms);
for (const [unit, mod] of unitDocs) {
  const orig = J(`data/ip/textbook/units/${unit}.json`);
  if (JSON.stringify(orig) === JSON.stringify(mod)) continue;
  mod.terms.forEach((t: Row) => {
    for (const l of ["zh"]) {
      if (typeof t[`one_${l}`] === "string") t[`definition_${l}`] = compatText(t[`one_${l}`], l);
      if (typeof t[`detail_${l}`] === "string") t[`explanation_${l}`] = compatText(t[`detail_${l}`], l);
      if (typeof t[`hook_${l}`] === "string") t[`memory_hook_${l}`] = compatText(t[`hook_${l}`], l);
    }
  });
  if (Array.isArray(mod.goals_zh)) mod.overview.intro_zh = kit.introOf(mod.goals_zh, "zh");
  if (Array.isArray(mod.key_points_zh)) mod.summary.key_points_zh = mod.key_points_zh.map((x: string) => compatText(x, "zh"));
  mod.summary.memory_hooks_zh = kit.hookLines(mod, "zh");
  const manifest = lib.readJson(paths.manifest(unit));
  const man2 = clone(manifest);
  for (const vt of man2.v1_terms ?? []) {
    const mt = mod.terms.find((x: Row) => x.term === vt.term);
    if (mt && mt.term_zh !== vt.term_zh) vt.term_zh = mt.term_zh;
  }
  const key = (i: Row) => `${i.code}|${i.field}|${i.message}`;
  const before = new Set((await validateUnit(orig, manifest, paths)).map(key));
  const newIssues = (await validateUnit(mod, man2, paths)).filter((i: Row) => !before.has(key(i)));
  const wB = new Set(lib.zhTermWarnings(orig, origZh).map((w: Row) => `${w.field}|${w.term}`));
  const wA = lib.zhTermWarnings(mod, zhTable);
  const derivedDiff: string[] = [];
  const dd = (a: any, b: any, p: string) => {
    if (a === b) return;
    if (a && b && typeof a === "object") {
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) dd(a[k], b[k], Array.isArray(a) ? `${p}[${k}]` : p ? `${p}.${k}` : k);
      return;
    }
    derivedDiff.push(p);
  };
  dd(orig, mod, "");
  unitReports.push({
    unit,
    frozen: frozen[unit] ?? null,
    changed_paths: derivedDiff,
    new_validate_issues: newIssues.map((i: Row) => `${i.severity ?? ""} ${i.code} ${i.field} ${i.message}`),
    zh_term_warnings_new: wA.filter((w: Row) => !wB.has(`${w.field}|${w.term}`)).map((w: Row) => `${w.field} ${w.term}`),
    zh_term_warnings_resolved: [...wB].filter((k) => !wA.some((w: Row) => `${w.field}|${w.term}` === k)),
  });
}

// quiz residue (touched questions)
const OLD = ["担当", "作成者", "编写者姓名", "指摘", "试作", "个人番号", "我的编号", "番号", "号码法", "传票", "决裁", "不正当竞争防止法", "选定要件", "满足度", "误答项", "记忆装置", "事业者", "稟议", "系统规划负责人"];
const residue: Record<string, number> = {};
const touchedQ = new Set(fieldRows.filter((r) => r.target.startsWith("q:")).map((r) => r.target.split(":")[1]));
for (const qid of touchedQ) {
  const exam = qid.split("-q")[0];
  const zh: string[] = [];
  for (const kind of ["translations", "explanations"] as const) scanZh(quizDoc(kind, exam).questions[qid], "", (p, s) => p.endsWith(".zh") && zh.push(s));
  const all = zh.join("\n");
  for (const w of OLD) {
    const n = occ(all.replace(/个人编号/g, ""), w);
    if (n) residue[`${qid} ${w}`] = n;
  }
}

// closure: every L4b hit, looked up in the end state (round 1 applied on disk + round 2 in memory)
const getAt = (o: any, p: string) => p.replace(/\(([^)]*)\)/g, "").split(/\.|\[|\]/).filter(Boolean).reduce((a: any, k) => a?.[/^\d+$/.test(k) ? +k : k], o);
const closure: Record<string, number> = {};
const closureLeft: Row[] = [];
for (const h of J("evidence/phase5/hosting/L4b_hits.json").hits as Row[]) {
  if (h.classification === "OK") continue;
  let doc: any;
  if (h.source === "ui-messages") doc = J(h.file);
  else if (h.source === "textbook-units") doc = unitDoc(path.basename(h.file, ".json"));
  else doc = quizDoc(h.source === "quiz-explanations" ? "explanations" : "translations", path.basename(h.file, ".json"));
  const s = getAt(doc, h.path);
  const left = typeof s === "string" && s.includes(h.match);
  if (left) {
    const k = `${h.classification} ${h.word}`;
    closure[k] = (closure[k] ?? 0) + 1;
    closureLeft.push({ id: h.id, classification: h.classification, word: h.word, source: h.source, path: h.path });
  }
}
// B6 zh-term warnings over ALL units, old table vs proposed table (the zh_terms change is global)
const allB6: Row = { units: 0, new: [] as string[] };
for (const f of (await import("node:fs")).readdirSync(path.join(ROOT, "data/ip/textbook/units"))) {
  const unit = f.replace(/\.json$/, "");
  const orig = J(`data/ip/textbook/units/${unit}.json`);
  const end = unitDocs.get(unit) ?? orig;
  const wB = new Set(lib.zhTermWarnings(orig, origZh).map((w: Row) => `${w.field}|${w.term}`));
  for (const w of lib.zhTermWarnings(end, zhTable)) if (!wB.has(`${w.field}|${w.term}`)) allB6.new.push(`${unit} ${w.field} ${w.term}`);
  allB6.units++;
}
const fam = (rows: Row[]) => Object.fromEntries([...new Set(rows.map((r) => r.family))].map((f) => [f, rows.filter((r) => r.family === f).length]));
const summary = {
  occurrence_edits: fam(items),
  occurrence_edits_failed: items.filter((i) => !i.ok).map((i) => `${i.family} ${i.target} "${i.before}" occurs ${i.occurrences}`),
  hook_labels: { mark: hookItems.filter((h) => h.decision === "mark").length, drop: hookItems.filter((h) => h.decision === "drop").length, by_family: fam(hookItems), failed: hookItems.filter((h) => !h.ok).map((h) => `${h.target} ${h.label}#${h.nth}`) },
  fields_changed: fieldRows.length,
  fields_by_route: Object.fromEntries([...new Set(fieldRows.map((r) => r.route))].map((k) => [k, fieldRows.filter((r) => r.route === k).length])),
  hook_check_failures: fieldRows.filter((r) => (r.strip_equal === false && !r.text_change_expected) || r.compat_equal === false || (r.inline_errors ?? []).length).map((r) => r.target),
  units_touched: unitReports.length,
  units_with_new_validate_issues: unitReports.filter((r) => r.new_validate_issues.length).map((r) => `${r.unit}: ${r.new_validate_issues.join(" / ")}`),
  zh_term_warnings_new: unitReports.flatMap((r) => r.zh_term_warnings_new.map((w: string) => `${r.unit} ${w}`)),
  zh_terms_change: zhTermsChange,
  quiz_residue_after: residue,
  hook_marks_to_confirm: hookItems.filter((h) => h.confirm).map((h) => `${h.target.split(":")[1]} ${h.term} ${h.label}`),
  closure_left_after_round2: closure,
  closure_left_ids: closureLeft.map((c) => `${c.id} ${c.classification} ${c.word}`),
  b6_all_units: { units: allB6.units, new: allB6.new },
  b3_registrability: "NOT simulated for round 2 (overlaps with today's patches → retire + composite are decided at apply time by the round-1 tool's plan mode)",
};
console.log(JSON.stringify(summary, null, 1));
if (process.argv.includes("--write"))
  writeFileSync(path.join(ROOT, FINAL ? "evidence/phase5/hosting/L4_round2_final.json" : "evidence/phase5/hosting/L4_round2.json"), `${JSON.stringify({ schema: "l4-round2-1", final: FINAL, generated_at: new Date().toISOString(), command: `node scripts/l4-round2-proposal.ts ${process.argv.slice(2).join(" ")}`, read_only: true, base: "data after L4 round 1 (uncommitted)", summary, occurrence_edits: items, hook_labels: hookItems, fields: fieldRows, units: unitReports }, null, 1)}\n`);
