#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix1** (解説是正 lane): 解説全量監査 efull_1 (evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_1.json、
// opus v2 + input_only、389 題、medium 16 / high 0) と ecal3 の backlog (evidence/quiz_expl_ecal3_result_S131.md) を是正する。
// evidence/quiz_efix1_expl_S131.md。
//
// 層・方針は quiz-fidfix-S130-n9b と同じ (subN で出現数を厳密に要求・0 回なら skip / expl は .phase2 expl_jp_ / expl_tr_ を直して
// phase2-merge で再生成 / D-143 note は final に純粋後置・round1 と既存 note・flag は不可触)。
//
// ── 是正 (ACCEPT 分。REJECT 2009h21a-q086 zh dual/duplex 訳語・2010h22a-q033 ウ の分類は evidence §1) ──
//   2009h21a-q082 ア: 2×10^9 の原因を「M と G の取り違え」(×1000 で 0.4 秒) から「効率 20% を 20 として掛ける」に。
//                 エ: 「効率はファイル量を割るものではない」(D ÷ 0.2 ÷ S = D ÷ (S × 0.2) で同値) を、本当の原因の説明に置換。
//   2009h21h-q033 要点 2: 「原因と影響範囲を確認したうえで復旧」→ 影響範囲の確認と証跡の確保 (原因の特定を復旧の前提にしない)。
//   2009h21h-q088 要点 1: ログファイルを「障害回復の唯一の情報源」→「欠かせない、更新の履歴を持つ情報源」(バックアップも要る)。
//   2010h22a-q005 ア・要点 2: エコファーム (環境に配慮した農業・農場) をエコファーマー (持続農業法の認定農業者の愛称) と混同。
//   2010h22a-q014 ウ: 2 + 3 + 1 = 6 は部品 A の加工 1 週も落とした場合 (直列化だけなら 7 = エ)。
//   2010h22a-q037 正解: インシデントの例から「パスワードを忘れてログインできない」(現行の枠組みではサービス要求) を削除。
//   2010h22a-q055 エ: n(n-1)/2 は「相手が n 人」ではなく「n 人が互いに通信」。
//   2010h22a-q078 正解: 完全性の括弧書きから「持出し」(機密性) を削除。
//   2010h22h-q025 エ: 第 49 条は「さかのぼって例外外」ではなく、目的外の頒布・公衆提示の時点で複製を行ったものとみなす規定。
//   2010h22h-q047 正解・要点 1: 単体テストは「ブラックボックステストではなく」ではなく、ホワイトボックス中心で併用。
//   2011h23tokubetsu-q025 エ: バリューチェーンの主活動「購買」→「購買物流」(procurement / 采购 は支援活動の調達)。
//   2011h23tokubetsu-q027 要点 2: 「コンティンジェンシープラン (BCP)」の同一視 → 並列。
//   2011h23tokubetsu-q045 エ: 「プロジェクト憲章 (プロジェクト計画書)」の同一視を削除。
//   2026r08-q012 イ・要点 1: DMM は発想支援ツールではなく、EA の機能構成図の記述様式 (業務機能の階層分解)。
//   2022r04-q037 要点 1: ログイン照合を「入退場管理」と呼んでいた → 利用可否の制御。
//   key_guard note: 2010h22a-q028 / q098 / q099 / q100 の【S115 裁決】末尾「key X 不変」の字母誤り (訂正 note を後置)。
//
// Run: node scripts/quiz-fidfix-S131-efix1.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S131-efix1.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>  (2009h21a 2009h21h 2010h22a 2010h22h 2011h23tokubetsu 2022r04 2026r08)
import { readFileSync, writeFileSync } from "node:fs";
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
  // 2009h21a-q082
  ["2009h21a-q082", "d:ア", "jp",
    "例えば実効速度を 2×10^7 ビット/秒ではなく 2×10^9 ビット/秒と置く（Mとギガの桁を取り違える）と 8×10^9 ÷ 2×10^9 = 4 秒になります。100Mビット/秒 = 10^8 ビット/秒 という基本の桁を固定してから効率を掛ければ、この取り違えは防げます。",
    "例えば伝送効率 20% を 0.2 ではなく 20 のまま掛けると、実効速度が 10^8 × 20 = 2×10^9 ビット/秒 となり、8×10^9 ÷ 2×10^9 = 4 秒になります。効率は 20% = 0.2 と小数に直してから速度に掛ければ、この取り違えは防げます。", 1],
  ["2009h21a-q082", "d:ア", "zh",
    "例如把有效速率取成 2×10^9 比特/秒而不是 2×10^7 比特/秒（把 M 和 G 的数量级弄混），就会得到 8×10^9 ÷ 2×10^9 = 4 秒。只要先固定 100M 比特/秒 = 10^8 比特/秒 这个基本数量级，再乘以效率，就能避免这种混淆。",
    "例如不把传输效率 20% 换成 0.2 而直接按 20 去乘，有效速率就成了 10^8 × 20 = 2×10^9 比特/秒，得到 8×10^9 ÷ 2×10^9 = 4 秒。只要先把效率换成小数（20% = 0.2）再乘到速率上，就能避免这种混淆。", 1],
  ["2009h21a-q082", "d:ア", "en",
    "For example, if you take the effective speed as 2×10^9 bit/s instead of 2×10^7 bit/s (confusing the M and G orders of magnitude), you get 8×10^9 ÷ 2×10^9 = 4 seconds. Fixing the basic order of magnitude first, 100 Mbit/s = 10^8 bit/s, and only then multiplying by the efficiency prevents this mistake.",
    "For example, if you multiply by the 20% efficiency as 20 instead of 0.2, the effective speed becomes 10^8 × 20 = 2×10^9 bit/s, and you get 8×10^9 ÷ 2×10^9 = 4 seconds. Converting the efficiency to a decimal first (20% = 0.2) and only then multiplying the speed by it prevents this mistake.", 1],
  ["2009h21a-q082", "d:エ", "jp",
    "効率20%は速度に「掛ける」ものであり、ファイル量を割るものではない点に注意が必要です。",
    "ファイル量を効率で割っても速度に効率を掛けても結果は同じ (10^9 ÷ 0.2 ÷ 10^6 = 10^9 ÷ (10^6 × 0.2)) なので、この値の原因はビット換算の漏れと、速度の桁を 10^8 ではなく 10^6 とした誤りです。", 1],
  ["2009h21a-q082", "d:エ", "zh",
    "需要注意的是，20% 的效率是要“乘”到速率上的，而不是用来除文件大小的。",
    "用效率去除文件大小与把效率乘到速率上结果相同（10^9 ÷ 0.2 ÷ 10^6 = 10^9 ÷ (10^6 × 0.2)），所以得到这个值的原因是漏掉了比特换算，以及把速率的数量级误当成 10^6 而不是 10^8。", 1],
  ["2009h21a-q082", "d:エ", "en",
    "Note that the 20% efficiency is something you multiply the speed by, not something you divide the file size by.",
    "Dividing the file size by the efficiency gives the same result as multiplying the speed by it (10^9 ÷ 0.2 ÷ 10^6 = 10^9 ÷ (10^6 × 0.2)), so the causes of this value are the missing bit conversion and taking the speed as 10^6 instead of 10^8.", 1],
  // 2009h21h-q033
  ["2009h21h-q033", "p:1", "jp", "(2) 原因と影響範囲を確認したうえで復旧する、", "(2) 影響範囲 (データの破損など) を確認し、原因究明に必要な証跡 (ログなど) を確保したうえで復旧する、", 1],
  ["2009h21h-q033", "p:1", "zh", "(2) 确认原因和影响范围之后再恢复；", "(2) 确认影响范围（数据是否损坏等）并保全查明原因所需的证据（日志等）之后再恢复；", 1],
  ["2009h21h-q033", "p:1", "en", "(2) recover after checking the cause and the scope of impact,", "(2) recover after checking the scope of impact (such as data corruption) and securing the evidence, such as logs, needed to investigate the cause,", 1],
  // 2009h21h-q088
  ["2009h21h-q088", "p:0", "jp", "障害回復の唯一の情報源であり、", "障害回復に欠かせない、更新の履歴を持つ情報源であり、", 1],
  ["2009h21h-q088", "p:0", "zh", "它是故障恢复唯一的信息来源，", "它是故障恢复不可或缺、记录更新履历的信息来源，", 1],
  ["2009h21h-q088", "p:0", "en", "It is the only source of information for failure recovery, and", "It is the indispensable source of update history for failure recovery, and", 1],
  // 2010h22a-q005
  ["2010h22a-q005", "d:ア", "jp",
    "エコファームは、堆肥による土づくりと化学肥料・化学農薬の低減に一体的に取り組む農業者を都道府県知事が認定する制度 (持続農業法に基づく認定農業者の通称) を指す農業分野の用語です。",
    "エコファームは、化学肥料・化学農薬を減らすなど環境に配慮した農業や、それを行う農場を指す農業分野の語です (持続農業法に基づいて都道府県知事が認定した農業者の愛称「エコファーマー」とは別の語)。", 1],
  ["2010h22a-q005", "d:ア", "zh",
    "生态农场（Eco Farm）是农业领域的术语，指由都道府县知事认定那些把用堆肥改良土壤与减少化肥、化学农药一体化推进的农业经营者的制度（依据《持续农业法》认定的农业者的通称）。",
    "生态农场（Eco Farm）是农业领域的用语，指减少化肥、化学农药等注重环保的农业或从事这种农业的农场（与依据《持续农业法》由都道府县知事认定的农业者的爱称「Eco Farmer（生态农业者）」是不同的词）。", 1],
  ["2010h22a-q005", "d:ア", "en",
    "An eco-farm is a term from agriculture. It refers to a system under which the prefectural governor certifies farmers who work in an integrated way on improving the soil with compost while reducing chemical fertilizers and chemical pesticides (the common name for farmers certified under the Sustainable Agriculture Act).",
    "An eco-farm is a term from agriculture. It refers to environmentally conscious farming, such as reducing chemical fertilizers and chemical pesticides, or a farm that practices it (a different word from “eco-farmer”, the nickname for farmers certified by the prefectural governor under the Sustainable Agriculture Act).", 1],
  ["2010h22a-q005", "p:1", "jp", "エコファーム = 環境に配慮した農業者の認定 (農業)", "エコファーム = 環境に配慮した農業・農場 (農業)", 1],
  ["2010h22a-q005", "p:1", "zh", "生态农场＝对注重环保的农业者的认定（农业）", "生态农场＝注重环保的农业或农场（农业）", 1],
  ["2010h22a-q005", "p:1", "en", "eco-farm = certifying environmentally conscious farmers (agriculture)", "eco-farm = environmentally conscious farming or farms (agriculture)", 1],
  // 2010h22a-q014
  ["2010h22a-q014", "d:ウ", "jp",
    "6 週は購買を直列に数えた誤り。部品 B の納入 2 週と部品 C の納入 3 週を順番に行うと考えて 2 + 3 = 5 週とし、そこに組立 1 週を足すと 6 週になる。",
    "6 週は購買を直列に数えたうえで、部品 A の加工 1 週も落とした誤り。部品 B の納入 2 週と部品 C の納入 3 週を順番に行うと考えて 2 + 3 = 5 週とし、C の納入後に必要な A の加工 1 週を数えずに組立 1 週だけを足すと 6 週になる (A の加工まで数えて直列にすると 7 週で、エの経路になる)。", 1],
  ["2010h22a-q014", "d:ウ", "zh",
    "6 周是把采购按串行计算的错误。如果认为零件 B 的交货 2 周和零件 C 的交货 3 周要依次进行，就得到 2 + 3 = 5 周，再加上组装 1 周就成了 6 周。",
    "6 周是把采购按串行计算、又漏掉了零件 A 的加工 1 周的错误。如果认为零件 B 的交货 2 周和零件 C 的交货 3 周要依次进行，就得到 2 + 3 = 5 周，不计 C 交货后必需的 A 加工 1 周而只加上组装 1 周，就成了 6 周（若把 A 的加工也算进去串行累加则是 7 周，即エ的路径）。", 1],
  ["2010h22a-q014", "d:ウ", "en",
    "6 weeks is the mistake of counting the purchases in series. If you assume that the 2 weeks of delivery for part B and the 3 weeks of delivery for part C are carried out one after the other, you get 2 + 3 = 5 weeks, and adding 1 week of assembly gives 6 weeks.",
    "6 weeks is the mistake of counting the purchases in series while also dropping the 1 week of processing for part A. If you assume that the 2 weeks of delivery for part B and the 3 weeks of delivery for part C are carried out one after the other, you get 2 + 3 = 5 weeks, and adding only the 1 week of assembly, without the 1 week of processing part A that is needed after C arrives, gives 6 weeks (counting A's processing as well in series gives 7 weeks, which is the path of エ).", 1],
  // 2010h22a-q037
  ["2010h22a-q037", "correct", "jp", "プリンタが印刷できない、利用者がパスワードを忘れてログインできない、といった", "プリンタが印刷できない、といった", 1],
  ["2010h22a-q037", "correct", "zh", "打印机无法打印、用户忘记密码而无法登录等", "打印机无法打印等", 1],
  ["2010h22a-q037", "correct", "en", "an extremely slow response, a printer that cannot print, and a user who has forgotten a password and cannot log in;", "an extremely slow response, and a printer that cannot print;", 1],
  // 2010h22a-q055
  ["2010h22a-q055", "d:エ", "jp", "相手が n 人いると鍵は n(n-1)/2 個必要になり", "n 人が互いに通信するには鍵が n(n-1)/2 個必要になり", 1],
  ["2010h22a-q055", "d:エ", "zh", "因此当对象有 n 人时就需要 n(n-1)/2 个密钥", "因此 n 人相互通信时就需要 n(n-1)/2 个密钥", 1],
  ["2010h22a-q055", "d:エ", "en", "so if there are n partners, n(n-1)/2 keys are required", "so if n parties communicate with one another, n(n-1)/2 keys are required", 1],
  // 2010h22a-q078
  ["2010h22a-q078", "correct", "jp", "完全性 (勝手な書換え・持出しを防ぐ)", "完全性 (勝手な書換えを防ぐ)", 1],
  ["2010h22a-q078", "correct", "zh", "完整性（防止擅自改写和带出）", "完整性（防止擅自改写）", 1],
  ["2010h22a-q078", "correct", "en", "integrity (preventing unauthorized rewriting and removal)", "integrity (preventing unauthorized rewriting)", 1],
  // 2010h22h-q025
  ["2010h22h-q025", "d:エ", "jp",
    "私的使用の目的で作った複製物を、その目的を超えて公衆に提示・送信すると、当初の複製もさかのぼって私的使用の例外の対象外として扱われる点にも注意が必要である。",
    "なお、私的使用の目的で作った複製物をその目的以外で頒布したり公衆に提示したりすると、その時点で複製を行ったものとみなされる (第 49 条) 点にも注意が必要である。", 1],
  ["2010h22h-q025", "d:エ", "zh",
    "还需要注意: 如果把以私人使用为目的制作的复制件超出该目的向公众展示或传播, 那么最初的复制也会被追溯认定为不属于私人使用例外的对象。",
    "还需要注意: 如果把以私人使用为目的制作的复制件用于该目的以外的发行或向公众展示, 就会在那一时刻被视为进行了复制 (第 49 条)。", 1],
  ["2010h22h-q025", "d:エ", "en",
    "Note also that if a copy made for private use is presented or transmitted to the public beyond that purpose, the original copying is retroactively treated as falling outside the private-use exception.",
    "Note also that if a copy made for private use is distributed or presented to the public for any other purpose, the person is deemed to have reproduced the work at that point (Article 49).", 1],
  // 2010h22h-q047
  ["2010h22h-q047", "correct", "jp",
    "入出力だけを見るブラックボックステストではなく、内部の処理手順をたどりながら検証するホワイトボックステストを用いる。",
    "入出力だけを見るブラックボックステストと併せて、内部の処理手順をたどりながら検証するホワイトボックステストが中心になる。", 1],
  ["2010h22h-q047", "correct", "zh",
    "所以不采用只看输入输出的黑盒测试，而是使用沿着内部处理步骤逐步验证的白盒测试。",
    "所以除了只看输入输出的黑盒测试之外，以沿着内部处理步骤逐步验证的白盒测试为中心。", 1],
  ["2010h22h-q047", "correct", "en",
    "so instead of black-box testing that looks only at inputs and outputs, white-box testing is used, which verifies the program while tracing its internal processing steps.",
    "so alongside black-box testing that looks only at inputs and outputs, white-box testing, which verifies the program while tracing its internal processing steps, is central.", 1],
  ["2010h22h-q047", "p:0", "jp", "開発者がホワイトボックステストとして実施する。", "開発者がホワイトボックステストを中心に (ブラックボックステストと併用して) 実施する。", 1],
  ["2010h22h-q047", "p:0", "zh", "由开发者以白盒测试的方式实施。", "由开发者以白盒测试为中心（并结合黑盒测试）实施。", 1],
  ["2010h22h-q047", "p:0", "en", "and developers carry it out as white-box testing.", "and developers carry it out mainly as white-box testing (combined with black-box testing).", 1],
  // 2011h23tokubetsu-q025
  ["2011h23tokubetsu-q025", "d:エ", "jp", "購買・製造・出荷・販売などの主活動", "購買物流・製造・出荷物流・販売などの主活動", 1],
  ["2011h23tokubetsu-q025", "d:エ", "zh", "采购、制造、出货、销售等主要活动", "进货物流、制造、出货物流、销售等主要活动", 1],
  ["2011h23tokubetsu-q025", "d:エ", "en", "primary activities such as procurement, manufacturing, outbound logistics, and sales", "primary activities such as inbound logistics, manufacturing, outbound logistics, and sales", 1],
  // 2011h23tokubetsu-q027
  ["2011h23tokubetsu-q027", "p:1", "jp", "備えはコンティンジェンシープラン (BCP)。", "備えはコンティンジェンシープラン (緊急時対応計画) や事業継続計画 (BCP)。", 1],
  ["2011h23tokubetsu-q027", "p:1", "zh", "做的准备是应急计划 (BCP)。", "做的准备是应急计划或业务连续性计划 (BCP)。", 1],
  ["2011h23tokubetsu-q027", "p:1", "en", "is a contingency plan (BCP).", "is a contingency plan or a business continuity plan (BCP).", 1],
  // 2011h23tokubetsu-q045
  ["2011h23tokubetsu-q045", "d:エ", "jp", "プロジェクト憲章 (プロジェクト計画書) や", "プロジェクト憲章や", 1],
  ["2011h23tokubetsu-q045", "d:エ", "zh", "项目章程（项目计划书）和", "项目章程和", 1],
  ["2011h23tokubetsu-q045", "d:エ", "en", "the project charter (project plan) and", "the project charter and", 1],
  // 2026r08-q012 (ecal3 backlog)
  ["2026r08-q012", "d:イ", "jp",
    "DMM (Diamond Mandala Matrix) は、中心テーマの周囲のマスにアイデアを書き出して発想を広げる、マンダラ・チャート系の発想支援ツールです。業務プロセスの流れを順序立てて描く用途には向きません。",
    "DMM (Diamond Mandala Matrix) は、EA (エンタープライズアーキテクチャ) で機能構成図を描くための記述様式で、業務の機能を階層的に分解して示します。業務の流れ (手順の順序) は表さないので、業務プロセスの流れを順序立てて描く用途には向きません。", 1],
  ["2026r08-q012", "d:イ", "zh",
    "DMM（Diamond Mandala Matrix，钻石曼陀罗矩阵）是一种曼陀罗图（mandala chart）类的发想辅助工具，通过在中心主题周围的格子里写出想法来拓展思路。它不适合用于有顺序地描绘业务流程。",
    "DMM（Diamond Mandala Matrix，钻石曼陀罗矩阵）是在 EA（企业架构）中绘制功能构成图所用的记述样式，用于把业务功能按层次分解表示。它不表示业务的流程（步骤的先后顺序），因此不适合用于有顺序地描绘业务流程。", 1],
  ["2026r08-q012", "d:イ", "en",
    "DMM (Diamond Mandala Matrix) is a mandala-chart-type ideation support tool that expands ideas by writing them in the cells surrounding a central theme. It is not suited for depicting a business process flow in a sequenced manner.",
    "DMM (Diamond Mandala Matrix) is the notation used in EA (enterprise architecture) to draw a function structure diagram, showing business functions decomposed hierarchically. It does not represent the business flow (the order of steps), so it is not suited for depicting a business process flow in a sequenced manner.", 1],
  ["2026r08-q012", "p:0", "jp", "DMM=発想支援。", "DMM=業務機能の階層分解 (機能構成図)。", 1],
  ["2026r08-q012", "p:0", "zh", "DMM＝发想辅助。", "DMM＝业务功能的层次分解（功能构成图）。", 1],
  ["2026r08-q012", "p:0", "en", "DMM = ideation support.", "DMM = hierarchical decomposition of business functions (function structure diagram).", 1],
  // 2022r04-q037 (ecal3 backlog)
  ["2022r04-q037", "p:0", "jp", "ログイン ID・パスワード照合による入退場管理はその典型例。", "ログイン ID・パスワード照合による利用可否の制御はその典型例。", 1],
  ["2022r04-q037", "p:0", "zh", "通过登录 ID 与口令核对来管理准入是其典型示例。", "通过登录 ID 与口令核对来控制能否使用系统是其典型示例。", 1],
  ["2022r04-q037", "p:0", "en", "Managing admission through login ID and password verification is a typical example.", "Controlling whether a user may use the system through login ID and password verification is a typical example.", 1],
];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix1";
const E = "S131 efix1 解説監査 (efull_1)";
const NOTE_APPEND = {
  "2009h21a-q082": () => `（${E}: 誤答肢アの 2×10^9 ビット/秒 の原因を「M と G の桁の取り違え」としていたが、M→G は 1000 倍で 0.4 秒になり 4 秒にならない。効率 20% を 20 のまま掛ける (10^8 × 20) 経路に直した。誤答肢エの「効率はファイル量を割るものではない」は 10^9 ÷ 0.2 ÷ 10^6 = 10^9 ÷ (10^6 × 0.2) で同値のため、ビット換算の漏れと速度の桁 (10^6) を原因とする説明に置換 (jp / zh / en)。8×10^9 ÷ 2×10^7 = 400 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2009h21h-q033": () => `（${E}: 要点 2 の原則 (2)「原因と影響範囲を確認したうえで復旧」は原因の特定を復旧の前提とするように読めるため、「影響範囲 (データの破損など) を確認し、原因究明に必要な証跡を確保したうえで復旧」に改めた (jp / zh / en)。correct_answer=エ は不変 — ${MARK}）`,
  "2009h21h-q088": () => `（${E}: 要点 1 のログファイルを「障害回復の唯一の情報源」としていたのは、要点 2・誤答肢イの「バックアップ復元 + ログのロールフォワード」と矛盾するため、「障害回復に欠かせない、更新の履歴を持つ情報源」に改めた (jp / zh / en)。correct_answer=ウ は不変 — ${MARK}）`,
  "2010h22a-q005": () => `（${E}: 誤答肢ア・要点 2 が選択肢の「エコファーム」を持続農業法の認定農業者 (愛称エコファーマー) の制度として定義していたのを、環境に配慮した農業・農場を指す語に改めた (jp / zh / en)。IT 機器と無関係という排除の結論・correct_answer=ウ は不変 — ${MARK}）`,
  "2010h22a-q014": () => `（${E}: 誤答肢ウの「購買を直列に数えた誤り 2 + 3 + 1 = 6」は部品 A の加工 1 週も落とした場合にしか成り立たない (直列化だけなら 2 + 3 + 1 + 1 = 7 でエの経路)。A の加工の見落としを明記した (jp / zh / en)。C 3 週 → A 加工 1 週 → 組立 1 週 = 5 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2010h22a-q037": () => `（${E}: 正解解説のインシデントの具体例から「利用者がパスワードを忘れてログインできない」(ITIL v3 以降・JIS Q 20000 ではサービス要求の代表例) を削除した (jp / zh / en)。correct_answer=イ は不変 — ${MARK}）`,
  "2010h22a-q055": () => `（${E}: 誤答肢エの「相手が n 人いると鍵は n(n-1)/2 個」は公式の前提の取り違え (自分から見て相手 n 人なら n 個)。「n 人が互いに通信するには n(n-1)/2 個」に改めた (jp / zh / en)。correct_answer=ウ は不変 — ${MARK}）`,
  "2010h22a-q078": () => `（${E}: 正解解説末尾の「完全性 (勝手な書換え・持出しを防ぐ)」の「持出し」は機密性の側の話なので削除し「勝手な書換えを防ぐ」とした (jp / zh / en)。b・c・d = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2010h22a-q098": () => `（${E}・S131 ecal3 採点者の走査: 上記【S115 裁決】末尾の「key ア 不変」はコピペ由来の転記誤りで、正しくは「key イ 不変」。correct_answer は questions.json の全 79 commit で イ、derived_answer も イ — ${MARK}）`,
  "2010h22h-q025": () => `（${E}: 誤答肢エの「目的外で公衆に提示・送信すると当初の複製もさかのぼって私的使用の例外の対象外」は第 49 条の仕組みと違う (目的外の頒布・公衆提示の時点で複製を行ったものとみなす規定)。その形に改めた (jp / zh / en)。アップロードが公衆送信権 (送信可能化権) の侵害である点・correct_answer=ア は不変 — ${MARK}）`,
  "2010h22h-q047": () => `（${E}: 正解解説・要点 1 が単体テストを「ブラックボックステストではなく」ホワイトボックステストで行うと二者択一で述べていたのを、ホワイトボックス中心でブラックボックスと併用する形に改めた (jp / zh / en)。correct_answer=エ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q025": () => `（${E}: 誤答肢エのバリューチェーンの主活動「購買」(en procurement / zh 采购 は支援活動の調達に当たる) を「購買物流」(inbound logistics / 进货物流) に改めた (jp / zh / en)。correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q027": () => `（${E}: 要点 2 の「コンティンジェンシープラン (BCP)」は両者を同一視する書き方なので、誤答肢ウの説明と同じく「コンティンジェンシープラン (緊急時対応計画) や事業継続計画 (BCP)」と並列にした (jp / zh / en)。correct_answer=エ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q045": () => `（${E}: 誤答肢エの「プロジェクト憲章 (プロジェクト計画書)」は別の文書を同一視しているので括弧書きを削除した (jp / zh / en)。correct_answer=イ は不変 — ${MARK}）`,
  "2026r08-q012": () => `（S131 efix1 (ecal3 backlog): 誤答肢イ・要点 1 が DMM (Diamond Mandala Matrix) をマンダラ・チャート系の発想支援ツールとしていたのを、EA の機能構成図の記述様式 (業務機能の階層分解、業務の流れは表さない) に改めた (jp / zh / en)。EA の 4 様式は DMM = 機能構成図 / DFD = 機能情報関連図 / WFA = 業務流れ図 / E-R 図。correct_answer=エ (WFA) は不変 — ${MARK}）`,
  "2022r04-q037": () => `（S131 efix1 (ecal3 backlog): 要点 1 がログイン ID・パスワード照合を「入退場管理」(建物・部屋の物理的な入退室の管理) の典型例としていたのを「利用可否の制御」に改めた (jp / zh / en)。correct_answer=イ は不変 — ${MARK}）`,
  "2010h22a-q028": () => `（S131 efix1 (ecal3 採点者の走査): 上記【S115 裁決】末尾の「key ウ 不変」はコピペ由来の転記誤りで、正しくは「key ア 不変」。correct_answer は questions.json の全 79 commit で ア、derived_answer も ア — ${MARK}）`,
  "2010h22a-q099": () => `（S131 efix1 (ecal3 採点者の走査): 上記【S115 裁決】末尾の「key ウ 不変」はコピペ由来の転記誤りで、正しくは「key イ 不変」。correct_answer は questions.json の全 79 commit で イ、derived_answer も イ — ${MARK}）`,
  "2010h22a-q100": () => `（S131 efix1 (ecal3 採点者の走査): 上記【S115 裁決】末尾の「key エ 不変」はコピペ由来の転記誤りで、正しくは「key イ 不変」。correct_answer は questions.json の全 79 commit で イ、derived_answer も イ — ${MARK}）`,
};

// ── 適用 ──
const EXP = new Map();
const explPair = (id) => {
  if (!EXP.has(id)) {
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    EXP.set(id, { jf, tf, j: rj(jf), tr: rj(tf) });
  }
  return EXP.get(id);
};
const explField = (id, w, L) => {
  const { j, tr } = explPair(id);
  if (L === "jp") {
    if (w === "correct") return [j, "correct_jp"];
    if (w.startsWith("d:")) return [j.distractors_jp.find((d) => d.letter === w.slice(2)), "why_wrong_jp"];
    return [j.points_jp, Number(w.slice(2))];
  }
  const o = w === "correct" ? tr.correct : w.startsWith("d:") ? tr.distractors.find((d) => d.letter === w.slice(2)) : tr.points[Number(w.slice(2))];
  return [o, L];
};
for (const [id, w, L, from, to, n] of EXPL) { const [o, k] = explField(id, w, L); subN(o, k, from, to, n, `${id} expl_${L === "jp" ? "jp" : "tr"}.${w}.${L}`); }
// 事後確認: 2026r08-q012 / 2022r04-q037 の解説に旧定義が残っていない
{
  const s = JSON.stringify(explPair("2026r08-q012"));
  if (/発想支援|发想辅助|ideation/.test(s)) throw new Error("2026r08-q012: DMM の旧定義が残存 — abort");
  if (/入退場|准入|admission/.test(JSON.stringify(explPair("2022r04-q037")))) throw new Error("2022r04-q037: 入退場管理が残存 — abort");
}
for (const { jf, tf, j, tr } of EXP.values()) { wj(jf, j); wj(tf, tr); }

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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix1: applied ${applied}, skipped ${skipped}`);
