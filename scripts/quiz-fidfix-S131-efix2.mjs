#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix2** (解説是正 lane): 解説全量監査 efull_2 (evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_2.json、
// opus v2 + input_only、389 題、medium 25) の是正 + 2010h22a-q033 ウ の両論併記 (D-161) + D-175 (zh 訳語 dual = 双重系统 /
// duplex = 双工系统 の corpus 統一)。evidence/quiz_efix2_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix1 と同じ (subN で出現数を厳密に要求・0 回なら skip / expl は .phase2 expl_jp_ / expl_tr_ を直して
// phase2-merge で再生成 / D-143 note は final に純粋後置・round1 と既存 note・flag は不可触)。
// D-175 の translations sidecar は quiz-fidfix-S130-t1 と同じく再 merge 禁止 → sidecar と .phase1 tr_ の両方に同じ置換を当てる。
//
// ── 是正 (ACCEPT 分。判定は evidence §1) ──
//   2011h23tokubetsu-q077 正解: UDP は「到達を優先」ではなく、再送せず欠損を許容して即時性 (低遅延) を優先。
//   2011h23tokubetsu-q081 正解: コンパイル方式の例から Java (javac の出力はバイトコード) を外す。
//   2011h23tokubetsu-q088 ウ: パリティチェックは誤り検出、訂正はハミング符号など。
//   2011h23tokubetsu-q092 正解・エ・要点 1/2: 保守契約の範囲は題幹どおり「問合せ，障害の切分け」。無償修正の根拠は瑕疵担保責任
//                 (検収後 6 か月、障害は検収の翌月で期間内) で、保守料ではない。key_guard note は後置のみ。
//   2012h24a-q009 要点 1: 技術的アイディアは特許法と実用新案法、ビジネスの仕組みまで守れるのは特許法だけ。
//   2012h24a-q017 正解・ウ・要点 1: EC 形態名を「売り手 to 買い手」と定義すると CtoB の逆オークションと矛盾 → 「提供する側 (起点) to 受け取る側」。
//   2012h24a-q018 要点 2: アライアンス「資本移動を伴わず」→「経営権の移転を原則伴わず」(資本提携もある)。
//   2012h24a-q055 要点 2: RAID10 = RAID1+0 (RAID0+1 とは別構成)。
//   2012h24h-q060 要点 2: SFTP は FTP の拡張ではなく SSH 上の別プロトコル。
//   2012h24h-q063 ア: HDD は「主記憶と補助記憶の橋渡し」ではなく補助記憶そのもの。
//   2013h25a-q003 正解・要点 2: PER の分母は株価ではなく 1 株当たり利益、EVA は金額で分母を持たない。
//   2013h25a-q013 ア: 資本剰余金・利益剰余金は株主資本の内訳。
//   2013h25a-q042 ウ・要点 2: マネジメント予備はスコープ内の未知の事象用。スコープ外の新要求は変更管理だけで扱う。
//   2013h25a-q091 正解: 写真の取り違えの理由は題幹どおり「商品名が非常に複雑」(写真は商品ごとに数枚)。
//   2013h25a-q097 正解・要点 1: バーコードも非接触。RFID との差は一度に複数枚・電波 (向き・見通し不要)。
//   2013h25h-q005 ア・要点 2: 画面・帳票の要件確定は開発プロセスのシステム要件定義。
//   2013h25h-q026 正解・要点 1: 会計監査人は役員ではない (役員 = 取締役・会計参与・監査役、会社法 329 条)。
//   2014h26a-q069 エ: ワンタイムパスワードは主に所持による認証。key_guard note は後置のみ。
//   2014h26a-q074 正解: 射影・選択・結合は集合演算ではなく関係演算。
//   2014h26h-q025 要点 2: e ラーニングは Off-JT だが集合教育ではない。
//   2014h26h-q049 イ: 机上デバッグはプログラミング工程 (設計書レビューは設計工程)。
//   2014h26h-q076 ア: 「② は正しいので不成立」→ 正しい ④ が抜けている。
//   2015h27a-q003 ウ: 完成責任を負うのは受注者。「成果物を受け取る発注者」に。
//   2010h22a-q033 ウ: インシデント解決の読みを残し、本番への適用はリリース管理としても整理されると両論併記 (D-161)。
//   D-175: 2009h21a-q086 / 2012h24a-q057 / 2013h25a-q047 / 2014h26h-q056 / 2015h27a-q082 の zh で dual / duplex の訳語が
//          逆 (dual = 双工系统、duplex = 双重系统 / 双机系统) だったのを入れ替える (efull_2 の q057 / q056 はこれで是正)。
//          他の題は既に dual = 双重系统 / duplex = 双工系统。事後に corpus 全体を jp の語で照合する。
//
// Run: node scripts/quiz-fidfix-S131-efix2.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S131-efix2.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>
//     (2009h21a 2010h22a 2011h23tokubetsu 2012h24a 2012h24h 2013h25a 2013h25h 2014h26a 2014h26h 2015h27a)
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
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
  // 2011h23tokubetsu-q077
  ["2011h23tokubetsu-q077", "correct", "jp", "多少の欠損を許容してでも到達を優先する UDP", "再送をしない代わりに多少の欠損を許容して即時性 (低遅延) を優先する UDP", 1],
  ["2011h23tokubetsu-q077", "correct", "zh", "即使容忍少量丢失也优先保证送达的 UDP", "不做重传、容忍少量丢失而优先保证实时性（低延迟）的 UDP", 1],
  ["2011h23tokubetsu-q077", "correct", "en", "UDP, which tolerates some loss in order to give priority to delivery,", "UDP, which does not retransmit and tolerates some loss in order to give priority to timeliness (low delay),", 1],
  // 2011h23tokubetsu-q081
  ["2011h23tokubetsu-q081", "correct", "jp", "C や Java のような人間が読み書きする言語", "C のような人間が読み書きする言語", 1],
  ["2011h23tokubetsu-q081", "correct", "zh", "用 C 或 Java 这类供人阅读和书写的语言", "用 C 这类供人阅读和书写的语言", 1],
  ["2011h23tokubetsu-q081", "correct", "en", "such as C or Java,", "such as C,", 1],
  // 2011h23tokubetsu-q088
  ["2011h23tokubetsu-q088", "d:ウ", "jp", "誤りを訂正するのはパリティチェックやハミング符号などの誤り訂正符号の役割であり", "誤りの検出はパリティチェック、訂正はハミング符号などの誤り訂正符号の役割であり", 1],
  ["2011h23tokubetsu-q088", "d:ウ", "zh", "纠正错误是奇偶校验、汉明码等纠错码的职责", "检测错误是奇偶校验的职责，纠正错误是汉明码等纠错码的职责", 1],
  ["2011h23tokubetsu-q088", "d:ウ", "en", "Correcting errors is the role of error-correcting codes such as parity checks and Hamming codes,", "Detecting errors is the role of parity checks, and correcting them is the role of error-correcting codes such as Hamming codes,", 1],
  // 2011h23tokubetsu-q092
  ["2011h23tokubetsu-q092", "correct", "jp",
    "保守契約とは、納品後に稼働しているシステムについて、障害発生時の原因調査・復旧・修正、問合せ対応、稼働状況の点検などをベンダが継続的に提供する契約であり、利用者はその対価として保守料を支払う。障害が起きたときにベンダへ調査を依頼できることこそが保守契約を結ぶ目的であるから、",
    "X社の提案では、この保守契約の内容は「導入したシステムに関する問合せ，障害の切分けの対応」である。障害の切分け (原因がどこにあるかの特定) をX社に依頼できるのだから、", 1],
  ["2011h23tokubetsu-q092", "correct", "jp",
    "この場合X社は契約不適合責任 (旧・瑕疵担保責任) を負い、無償で修正しなければならない。検収を終えていても、検収時には発見できなかった不具合についてはこの責任が及ぶ点が重要である。さらに本件では保守契約も締結されており、契約範囲内の障害対応の対価は保守料として既に支払われているから、この面からも追加費用は発生しない。",
    "契約条件では X社の開発物の瑕疵担保期間は「検収後 6 か月」で、障害は検収の翌月に発生しているので期間内である。したがって X社は瑕疵担保責任 (現在の民法では契約不適合責任) を負い、無償で修正しなければならない。無償になる根拠はこの瑕疵担保責任であり、保守契約ではない (本問の保守契約の範囲は問合せと障害の切分けで、修正は含まれない)。期間を過ぎてから見つかったバグは、別の取決めがなければ有償になり得る。", 1],
  ["2011h23tokubetsu-q092", "correct", "zh",
    "所谓维护合同，是指供应商就交付后正在运行的系统，持续提供故障发生时的原因调查、恢复、修复、咨询应答、运行状况检查等服务，用户方为此支付维护费的合同。发生故障时能够委托供应商进行调查，正是签订维护合同的目的所在，因此",
    "按X公司的提案，这份维护合同的内容是「对所导入系统的咨询以及故障的隔离（判定原因所在）」。既然可以委托X公司进行故障隔离，", 1],
  ["2011h23tokubetsu-q092", "correct", "zh",
    "此时X公司要承担合同不符责任（原瑕疵担保责任），必须免费修复。重要的是，即使已经完成验收，对于验收时未能发现的缺陷，这一责任依然适用。而且本案中还签订了维护合同，合同范围内的故障处理对价已经以维护费的形式支付过了，因此从这一点看也不会产生额外费用。",
    "合同条件规定X公司开发物的瑕疵担保期间为「验收后 6 个月」，而故障发生在验收的次月，处于期间之内。因此X公司要承担瑕疵担保责任（现行民法称合同不符责任），必须免费修复。免费的依据是这一瑕疵担保责任，而不是维护合同（本题维护合同的范围是咨询和故障隔离，不包括修复）。超过期间后才发现的缺陷，如果没有另行约定，可能变成有偿。", 1],
  ["2011h23tokubetsu-q092", "correct", "en",
    "A maintenance contract is a contract in which the vendor continuously provides services for a system that is running after delivery — investigating the cause of failures, restoring and repairing the system, answering inquiries, checking the operating status, and so on — while the user pays a maintenance fee in return. Being able to ask the vendor to investigate when a failure occurs is exactly the purpose of signing a maintenance contract, so",
    "In Company X's proposal, this maintenance contract covers “inquiries about the installed system and isolating failures” (identifying where the cause lies). Since Company W can ask Company X to isolate the failure,", 1],
  ["2011h23tokubetsu-q092", "correct", "en",
    "In that case Company X bears liability for non-conformity with the contract (formerly called warranty liability for defects) and must repair it free of charge. What matters here is that this liability still applies to defects that could not be found at the time of acceptance, even though acceptance has been completed. Furthermore, a maintenance contract has also been signed in this case, and the consideration for handling failures within the scope of the contract has already been paid as the maintenance fee, so from this angle too no extra cost arises.",
    "Under the contract terms, the warranty period for defects in Company X's deliverables is six months after acceptance, and the failure occurred in the month after acceptance, so it falls within that period. Company X therefore bears warranty liability for defects (called liability for non-conformity with the contract under the current Civil Code) and must repair it free of charge. The basis for the free repair is this warranty liability, not the maintenance contract (the maintenance contract in this question covers inquiries and failure isolation, not repairs). A bug found after the period has ended may be charged for unless there is a separate agreement.", 1],
  ["2011h23tokubetsu-q092", "d:エ", "jp", "加えて保守契約の対価は保守料として既に支払われているため、契約範囲内の障害対応に別途の費用は生じない。", "本問の障害は検収の翌月で、瑕疵担保期間 (検収後 6 か月) の内にある。", 1],
  ["2011h23tokubetsu-q092", "d:エ", "jp", "「保守契約の範囲内かどうか」で切り分ける。", "「瑕疵担保期間内かどうか」で切り分ける。", 1],
  ["2011h23tokubetsu-q092", "d:エ", "zh", "加之维护合同的对价已经以维护费的形式支付，合同范围内的故障处理不会另外产生费用。", "本题的故障发生在验收的次月，处于瑕疵担保期间（验收后 6 个月）之内。", 1],
  ["2011h23tokubetsu-q092", "d:エ", "zh", "「是否在维护合同的范围之内」来区分。", "「是否在瑕疵担保期间之内」来区分。", 1],
  ["2011h23tokubetsu-q092", "d:エ", "en", "In addition, the consideration for the maintenance contract has already been paid as the maintenance fee, so handling a failure within the scope of the contract incurs no separate cost.", "The failure in this question occurred in the month after acceptance, within the warranty period for defects (six months after acceptance).", 1],
  ["2011h23tokubetsu-q092", "d:エ", "en", "and whether the work is within the scope of the maintenance contract.", "and whether it is within the warranty period for defects.", 1],
  ["2011h23tokubetsu-q092", "p:0", "jp", "障害時の原因調査・復旧・修正や問合せ対応をベンダが継続的に提供し", "契約で定めた範囲のサービス (本問では問合せ対応と障害の切分け) をベンダが継続的に提供し", 1],
  ["2011h23tokubetsu-q092", "p:0", "zh", "持续提供故障时的原因调查、恢复、修复以及咨询应答等服务", "持续提供合同所定范围的服务（本题为咨询应答和故障隔离）", 1],
  ["2011h23tokubetsu-q092", "p:0", "en", "such as investigating the cause of failures, restoring and repairing it, and answering inquiries,", "within the scope set by the contract (in this question, answering inquiries and isolating failures),", 1],
  ["2011h23tokubetsu-q092", "p:1", "jp", "検収後に発覚したものであってもベンダが無償で修正する義務を負う。", "検収後に発覚したものでも、瑕疵担保期間 (本問では検収後 6 か月) 内であればベンダが無償で修正する義務を負う。", 1],
  ["2011h23tokubetsu-q092", "p:1", "zh", "即使是在验收之后才发现的，供应商也有义务免费修复。", "即使是在验收之后才发现的，只要在瑕疵担保期间（本题为验收后 6 个月）之内，供应商就有义务免费修复。", 1],
  ["2011h23tokubetsu-q092", "p:1", "en", "the vendor is obliged to repair it free of charge even if the problem comes to light after acceptance.", "the vendor is obliged to repair it free of charge even if the problem comes to light after acceptance, as long as it is within the warranty period (six months after acceptance in this question).", 1],
  // 2012h24a-q009
  ["2012h24a-q009", "p:0", "jp", "仕組み・アイディアを守るのは特許法だけである。", "技術的なアイディアを守るのは特許法と実用新案法で、ビジネスモデルのような方法・仕組みまで守れるのは特許法だけである (実用新案は物品の形状・構造・組合せに限られる)。", 1],
  ["2012h24a-q009", "p:0", "zh", "保护运作机制与想法的只有专利法。", "保护技术性想法的是专利法和实用新型法，而能保护商业模式这类方法和运作机制的只有专利法（实用新型仅限于物品的形状、构造及其组合）。", 1],
  ["2012h24a-q009", "p:0", "en", "The only one that protects a mechanism or an idea is the Patent Act.", "Technical ideas are protected by the Patent Act and the Utility Model Act, but only the Patent Act can protect a method or mechanism such as a business model (utility models are limited to the shape, structure, or combination of articles).", 1],
  // 2012h24a-q017
  ["2012h24a-q017", "correct", "jp", "取引形態の名前は「（前）売り手 to （後）買い手」の順で当事者の種別を表す、と覚えると迷いません。", "取引形態の名前は「（前）商品・サービス・情報を提供する側（取引の起点） to （後）受け取る側」の順で当事者の種別を表す、と覚えると迷いません。", 1],
  ["2012h24a-q017", "correct", "zh", "只要记住交易形态的名称是按照「（前）卖方 to （后）买方」的顺序来表示当事方类别，就不会弄混。", "只要记住交易形态的名称是按照「（前）提供商品、服务或信息的一方（交易的起点） to （后）接受的一方」的顺序来表示当事方类别，就不会弄混。", 1],
  ["2012h24a-q017", "correct", "en", "If you remember that the name of a transaction form lists the party types in the order of seller first and buyer second, you will not get confused.", "If you remember that the name of a transaction form lists the party types in the order of the side that provides goods, services, or information (the starting point of the transaction) first and the side that receives them second, you will not get confused.", 1],
  ["2012h24a-q017", "d:ウ", "jp", "CtoB は Consumer to Business で、個人が売り手・企業が買い手になる形態です。", "CtoB は Consumer to Business で、個人が起点となって企業と取引する形態です (個人が商品・情報を企業に提供する、または個人が条件を示して企業が応じる)。", 1],
  ["2012h24a-q017", "d:ウ", "jp", "オンライン書店では企業が売り手ですから、売り買いの向きが逆で誤りです。", "オンライン書店は企業が起点となって個人に販売する形態ですから、取引の向きが逆で誤りです。", 1],
  ["2012h24a-q017", "d:ウ", "zh", "CtoB 是 Consumer to Business，即个人为卖方、企业为买方的形态。", "CtoB 是 Consumer to Business，即由个人作为起点与企业进行交易的形态（个人向企业提供商品或信息，或由个人提出条件、企业来响应）。", 1],
  ["2012h24a-q017", "d:ウ", "zh", "在线书店中卖方是企业，买卖的方向正好相反，所以错误。", "在线书店是由企业作为起点向个人销售的形态，交易的方向正好相反，所以错误。", 1],
  ["2012h24a-q017", "d:ウ", "en", "CtoB is Consumer to Business, a form in which an individual is the seller and a company is the buyer.", "CtoB is Consumer to Business, a form in which an individual is the starting point of a transaction with a company (an individual provides goods or information to a company, or an individual states conditions and a company responds).", 1],
  ["2012h24a-q017", "d:ウ", "en", "In an online bookstore the seller is a company, so the direction of buying and selling is reversed, which makes this choice wrong.", "An online bookstore is a form in which a company is the starting point and sells to individuals, so the direction of the transaction is reversed, which makes this choice wrong.", 1],
  ["2012h24a-q017", "p:0", "jp", "EC（電子商取引）の形態は「売り手 to 買い手」の当事者種別で分類する。", "EC（電子商取引）の形態は「提供する側（取引の起点） to 受け取る側」の当事者種別で分類する。", 1],
  ["2012h24a-q017", "p:0", "zh", "EC（电子商务）的形态是按照「卖方 to 买方」的当事方类别来分类的。", "EC（电子商务）的形态是按照「提供的一方（交易的起点） to 接受的一方」的当事方类别来分类的。", 1],
  ["2012h24a-q017", "p:0", "en", "Forms of EC (electronic commerce) are classified by the types of the parties, in the order of seller to buyer.", "Forms of EC (electronic commerce) are classified by the types of the parties, in the order of the providing side (the starting point of the transaction) to the receiving side.", 1],
  // 2012h24a-q018
  ["2012h24a-q018", "p:1", "jp", "アライアンス（提携、資本移動を伴わず資源を補完）", "アライアンス（提携、経営権の移転を原則伴わず資源を補完）", 1],
  ["2012h24a-q018", "p:1", "zh", "联盟（合作，不涉及股权变动，互相补足资源）", "联盟（合作，原则上不涉及经营权转移，互相补足资源）", 1],
  ["2012h24a-q018", "p:1", "en", "alliance (a tie-up that complements resources without any movement of capital)", "alliance (a tie-up that complements resources without, in principle, any transfer of management control)", 1],
  // 2012h24a-q055
  ["2012h24a-q055", "p:1", "jp", "RAID10 (RAID0+1)", "RAID10 (RAID1+0)", 1],
  ["2012h24a-q055", "p:1", "zh", "RAID10（RAID0+1）", "RAID10（RAID1+0）", 1],
  ["2012h24a-q055", "p:1", "en", "RAID10 (RAID0+1)", "RAID10 (RAID1+0)", 1],
  // 2012h24h-q060
  ["2012h24h-q060", "p:1", "jp", "FTPS / SFTP = FTP に暗号化を加えたもの、", "FTPS = FTP に SSL/TLS による暗号化を加えたもの、SFTP = SSH 上で暗号化して転送する別のプロトコル、", 1],
  ["2012h24h-q060", "p:1", "zh", "FTPS / SFTP = 在 FTP 上加了加密的方式，", "FTPS = 在 FTP 上加了 SSL/TLS 加密的方式，SFTP = 在 SSH 上加密传输的另一种协议，", 1],
  ["2012h24h-q060", "p:1", "en", "FTPS / SFTP = FTP with encryption added,", "FTPS = FTP with SSL/TLS encryption added, SFTP = a separate protocol that transfers files encrypted over SSH,", 1],
  // 2012h24h-q063
  ["2012h24h-q063", "d:ア", "jp", "HDD が主記憶と補助記憶の橋渡し役として常用され", "HDD が OS やファイルを置く常用の補助記憶として使われ", 1],
  ["2012h24h-q063", "d:ア", "zh", "HDD 之所以被长期用作主存储器与辅助存储器之间的桥梁", "HDD 之所以被用作存放操作系统和文件的常用辅助存储器", 1],
  ["2012h24h-q063", "d:ア", "en", "the HDD is routinely used as the bridge between main memory and secondary storage", "the HDD is routinely used as the everyday secondary storage that holds the OS and files", 1],
  // 2013h25a-q003
  ["2013h25a-q003", "correct", "jp", "分母が何か (自己資本か、総資産か、株価か) に注目すれば", "分母が何か (自己資本か、総資産か) に注目すれば", 1],
  ["2013h25a-q003", "correct", "zh", "只要关注分母是什么 (是自有资本、总资产，还是股价)", "只要关注分母是什么 (是自有资本还是总资产)", 1],
  ["2013h25a-q003", "correct", "en", "If you focus on what the denominator is (shareholders’ equity, total assets, or the stock price)", "If you focus on what the denominator is (shareholders’ equity or total assets)", 1],
  ["2013h25a-q003", "p:1", "jp", "収益性・投資指標は分母で区別する。分母が自己資本なら ROE、総資産 (自己資本 + 他人資本) なら ROA、1 株当たり利益に対する株価の倍率なら PER、資本コストを超えた利益額なら EVA。",
    "収益性指標は分母で区別する。分母が自己資本なら ROE、総資産 (自己資本 + 他人資本) なら ROA。投資指標の PER は株価 ÷ 1 株当たり利益 (分母は 1 株当たり利益)、EVA は資本コストを超えた利益の金額 (比率ではなく分母を持たない)。", 1],
  ["2013h25a-q003", "p:1", "zh", "盈利性指标和投资指标要靠分母来区分。分母是自有资本就是 ROE，是总资产 (自有资本 + 负债资本) 就是 ROA，是每股利润对应的股价倍数就是 PER，是超过资本成本的利润金额就是 EVA。",
    "盈利性指标要靠分母来区分。分母是自有资本就是 ROE，是总资产 (自有资本 + 负债资本) 就是 ROA。投资指标 PER 是股价 ÷ 每股利润 (分母是每股利润)，EVA 是超过资本成本的利润金额 (不是比率，没有分母)。", 1],
  ["2013h25a-q003", "p:1", "en", "Tell profitability and investment indicators apart by their denominators. If the denominator is shareholders’ equity it is ROE; if it is total assets (shareholders’ equity + debt capital) it is ROA; if it is the multiple of the stock price over earnings per share it is PER; and if it is the amount of profit exceeding the cost of capital it is EVA.",
    "Tell profitability indicators apart by their denominators. If the denominator is shareholders’ equity it is ROE; if it is total assets (shareholders’ equity + debt capital) it is ROA. Among investment indicators, PER is the stock price ÷ earnings per share (the denominator is earnings per share), and EVA is the amount of profit exceeding the cost of capital (an amount, not a ratio, so it has no denominator).", 1],
  // 2013h25a-q013
  ["2013h25a-q013", "d:ア", "jp", "純資産 (株主資本、資本剰余金、利益剰余金など)", "純資産 (資本金・資本剰余金・利益剰余金などからなる株主資本ほか)", 1],
  ["2013h25a-q013", "d:ア", "zh", "所有者权益 (股东权益、资本公积、留存收益等)", "所有者权益 (由股本、资本公积、留存收益等构成的股东权益及其他)", 1],
  ["2013h25a-q013", "d:ア", "en", "equity (shareholders' equity, capital surplus, retained earnings, and so on)", "equity (shareholders' equity, made up of capital stock, capital surplus, retained earnings, and so on, plus other items)", 1],
  // 2013h25a-q042
  ["2013h25a-q042", "p:1", "jp", "マネジメント予備 (未知の事象・スコープ外の変化用)", "マネジメント予備 (スコープ内で予見できない未知の事象用)", 1],
  ["2013h25a-q042", "p:1", "zh", "管理储备（用于未知事件、范围之外的变化）", "管理储备（用于范围内无法预见的未知事件）", 1],
  ["2013h25a-q042", "p:1", "en", "the management reserve (for unknown events and changes outside the scope)", "the management reserve (for unforeseeable unknown events within the scope)", 1],
  ["2013h25a-q042", "d:ウ", "jp", "範囲外の未知の事象や新規要求は、変更管理 (変更要求) の手続きで別途契約・予算化するか、上位のマネジメント予備 (management reserve) で扱う対象であり、コンティンジェンシー予備とは区別される。",
    "範囲外の新規要求は、変更管理 (変更要求) の手続きでスコープとベースラインを改訂し、別途契約・予算化して扱う対象であり、コンティンジェンシー予備 (やスコープ内の未知の事象に備えるマネジメント予備) で吸収するものではない。", 1],
  ["2013h25a-q042", "d:ウ", "zh", "范围之外的未知事件或新增需求，应通过变更管理（变更请求）流程另行签约和列入预算，或者由更高层级的管理储备（management reserve）来处理，与应急储备是有区别的。",
    "范围之外的新增需求，应通过变更管理（变更请求）流程修订范围和基准，另行签约和列入预算，而不是由应急储备（或用于范围内未知事件的管理储备）来吸收。", 1],
  ["2013h25a-q042", "d:ウ", "en", "Unknown events or new requests outside the scope should be contracted and budgeted separately through the change management (change request) process, or handled by the higher-level management reserve, which is distinct from a contingency reserve.",
    "New requests outside the scope should be handled through the change management (change request) process by revising the scope and baseline and contracting and budgeting for them separately; they are not absorbed by a contingency reserve (or by the management reserve, which is for unknown events within the scope).", 1],
  // 2013h25a-q091
  ["2013h25a-q091", "correct", "jp", "「掲載されている写真が違っている」という誤りは、商品ごとに多数の写真を登録しているために取り違えが起きやすいことが背景にある。そこで",
    "題幹のメモでは、商品ごとに数枚の写真を掲載しており、ワインは商品名が非常に複雑なので掲載する写真を間違えやすいとされている。取り違えの主因は商品名の複雑さだが、", 1],
  ["2013h25a-q091", "correct", "zh", "「刊登的照片有误」这一错误，其背景在于每件商品都登记了大量照片，因而容易弄错。所以，",
    "题干的备忘录写道，每件商品刊登数张照片，而葡萄酒的商品名非常复杂，所以容易弄错要刊登的照片。弄错的主要原因是商品名复杂，但", 1],
  ["2013h25a-q091", "correct", "en", "The error “the posted photo is wrong” arises because many photos are registered for each product, which makes mix-ups easy. Therefore, if",
    "According to the interview memo in the stem, several photos are posted for each product, and because wine product names are very complicated, the wrong photo is easily posted. The main cause of the mix-ups is the complexity of the names, but if", 1],
  // 2013h25a-q097
  ["2013h25a-q097", "correct", "jp", "RFID（ICタグ）はバーコードと違い、電波を使うため読取装置にかざす向きや接触が不要で、", "RFID（ICタグ）は光学的に読み取るバーコードと違い、電波を使うためタグの向きや見通しを合わせる必要がなく、", 1],
  ["2013h25a-q097", "correct", "zh", "RFID（IC 标签）与条形码不同，它利用无线电波，因此既不需要对准读取装置的方向，也不需要接触，", "RFID（IC 标签）与光学读取的条形码不同，它利用无线电波，因此不需要对准标签的方向或保证视线无遮挡，", 1],
  ["2013h25a-q097", "correct", "en", "Unlike a barcode, RFID (an IC tag) uses radio waves, so the tag does not have to be held up in a particular direction and does not have to touch the reader,", "Unlike a barcode, which is read optically, RFID (an IC tag) uses radio waves, so the tag does not have to face a particular direction or be in the reader's line of sight,", 1],
  ["2013h25a-q097", "p:0", "jp", "電波による非接触読取で、向きや接触が不要、かつ複数タグの一括読取ができる。バーコードの「1 件ずつ・かざす必要あり」との差が",
    "電波による読取りで、光学式のバーコードのようにコードの向きや見通しを合わせる必要がなく、かつ複数タグの一括読取ができる。バーコードの「一度に 1 枚」との差が", 1],
  ["2013h25a-q097", "p:0", "zh", "通过无线电波非接触读取，不需要对准方向或接触，而且可以对多个标签进行批量读取。与条形码「逐件读取、必须对准」的差异，",
    "通过无线电波读取，不像光学式条形码那样需要对准方向或保证视线无遮挡，而且可以对多个标签进行批量读取。与条形码「一次只能读 1 张」的差异，", 1],
  ["2013h25a-q097", "p:0", "en", "contactless reading by radio waves, with no need for a particular orientation or contact, plus bulk reading of several tags at once. This difference from a barcode, which must be read one item at a time and held up to the reader,",
    "reading by radio waves, with no need to align the orientation or keep a line of sight as with an optical barcode, plus bulk reading of several tags at once. This difference from a barcode, which is read one item at a time,", 1],
  // 2013h25h-q005
  ["2013h25h-q005", "d:ア", "jp", "画面や帳票などのユーザインタフェース要件を確定するのは、企画プロセスの次に来る要件定義プロセス (さらに詳細化すればシステム要件定義) の作業である。",
    "画面や帳票などのユーザインタフェース要件を確定するのは、要件定義プロセスの後に来る開発プロセスの中のシステム要件定義の作業である。", 1],
  ["2013h25h-q005", "d:ア", "zh", "确定画面、报表等用户界面需求，是规划流程之后到来的需求定义流程（再细化则是系统需求定义）的工作。",
    "确定画面、报表等用户界面需求，是需求定义流程之后的开发流程中系统需求定义的工作。", 1],
  ["2013h25h-q005", "d:ア", "en", "Finalizing user interface requirements such as screens and report forms is work of the requirements definition process, which comes after the planning process (or, more specifically, of system requirements definition).",
    "Finalizing user interface requirements such as screens and report forms is work of system requirements definition within the development process, which comes after the requirements definition process.", 1],
  ["2013h25h-q005", "p:1", "jp", "画面/帳票などの具体的な要件確定と関係者の要件合意は要件定義プロセス、RFP 作成とベンダ選定は調達の作業であり、",
    "画面/帳票などの具体的な要件確定は開発プロセスのシステム要件定義、関係者の要件合意は要件定義プロセス、RFP 作成とベンダ選定は調達の作業であり、", 1],
  ["2013h25h-q005", "p:1", "zh", "画面/报表等具体需求的确定以及与相关人员就需求达成一致属于需求定义流程，RFP 的编制和供应商选定属于采购工作，两者都不是规划流程的工作。",
    "画面/报表等具体需求的确定属于开发流程中的系统需求定义，与相关人员就需求达成一致属于需求定义流程，RFP 的编制和供应商选定属于采购工作，这些都不是规划流程的工作。", 1],
  ["2013h25h-q005", "p:1", "en", "finalizing concrete requirements such as screens and report forms, and reaching agreement with stakeholders on requirements, belong to the requirements definition process, while creating the RFP and selecting a vendor is procurement work. Neither is work of the planning process.",
    "finalizing concrete requirements such as screens and report forms belongs to system requirements definition in the development process, reaching agreement with stakeholders on requirements belongs to the requirements definition process, and creating the RFP and selecting a vendor is procurement work. None of these is work of the planning process.", 1],
  // 2013h25h-q026
  ["2013h25h-q026", "correct", "jp", "役員 (取締役・監査役・会計監査人) の選任と解任", "役員 (取締役・会計参与・監査役) および会計監査人の選任と解任", 1],
  ["2013h25h-q026", "correct", "zh", "高管（董事、监事、会计审计人）的选任与解任", "高管（董事、会计参与、监事）及会计审计人的选任与解任", 1],
  ["2013h25h-q026", "correct", "en", "officers (directors, company auditors, and the accounting auditor) are appointed and dismissed", "officers (directors, accounting advisors, and company auditors) and the accounting auditor are appointed and dismissed", 1],
  ["2013h25h-q026", "p:0", "jp", "取締役・監査役・会計監査人の選任と解任", "取締役・会計参与・監査役 (役員) と会計監査人の選任と解任", 1],
  ["2013h25h-q026", "p:0", "zh", "董事、监事、会计审计人的选任与解任", "董事、会计参与、监事（高管）及会计审计人的选任与解任", 1],
  ["2013h25h-q026", "p:0", "en", "appointing and dismissing directors, company auditors, and the accounting auditor;", "appointing and dismissing directors, accounting advisors, and company auditors (the officers) and the accounting auditor;", 1],
  // 2014h26a-q069
  ["2014h26a-q069", "d:エ", "jp", "本質は知識 (と、トークンを使う場合は所持) による認証である。", "トークンやスマートフォンなど本人が持つ機器で生成・受信する値を使うので、主に所持による認証に当たる。", 1],
  ["2014h26a-q069", "d:エ", "zh", "但本质上仍是基于知识（若使用令牌则还包括持有）的认证。", "但它使用由令牌或智能手机等本人持有的设备生成或接收的值，因此主要属于基于持有的认证。", 1],
  ["2014h26a-q069", "d:エ", "en", "but in essence it is authentication by knowledge (and by possession when a token is used).", "but because it uses a value generated or received by a device the user holds, such as a token or a smartphone, it is mainly authentication by possession.", 1],
  // 2014h26a-q074
  ["2014h26a-q074", "correct", "jp", "表に対する集合演算 (射影・選択・結合)", "表に対する関係演算 (射影・選択・結合)", 1],
  ["2014h26a-q074", "correct", "zh", "针对表的集合运算（投影、选择、连接）", "针对表的关系运算（投影、选择、连接）", 1],
  ["2014h26a-q074", "correct", "en", "set operations on tables (projection, selection, join)", "relational operations on tables (projection, selection, join)", 1],
  // 2014h26h-q025
  ["2014h26h-q025", "p:1", "jp", "研修・勉強会・説明会・e ラーニングなどの集合教育で、", "研修・勉強会・説明会などの集合教育や e ラーニングで、", 1],
  ["2014h26h-q025", "p:1", "zh", "培训课程、学习会、说明会、e-Learning 等集体教育，", "培训课程、学习会、说明会等集体教育以及 e-Learning，", 1],
  ["2014h26h-q025", "p:1", "en", "is group training conducted away from normal work, such as training courses, study sessions, information sessions, and e-learning,", "is training conducted away from normal work, such as group training in courses, study sessions, and information sessions, and e-learning,", 1],
  // 2014h26h-q049
  ["2014h26h-q049", "d:イ", "jp", "設計書のレビューや机上でのチェック (デスクチェック、机上デバッグ) は、設計工程で成果物の誤りを早期に見つけるために行う作業であり、",
    "設計書のレビューは設計工程で、机上でのチェック (デスクチェック、机上デバッグ) はプログラミング工程で、成果物の誤りを早期に見つけるために行う作業であり、", 1],
  ["2014h26h-q049", "d:イ", "zh", "设计文档的评审以及在书面上进行的检查（桌面检查、桌面调试），是在设计阶段为尽早发现交付物中的错误而进行的工作，",
    "设计文档的评审在设计阶段、在书面上进行的检查（桌面检查、桌面调试）在编程阶段，都是为尽早发现交付物中的错误而进行的工作，", 1],
  ["2014h26h-q049", "d:イ", "en", "Reviewing design documents and checking on paper (desk checking, desk debugging) are tasks performed in the design phase in order to find errors in the deliverables early;",
    "Reviewing design documents (in the design phase) and checking on paper (desk checking, desk debugging, in the programming phase) are tasks performed in order to find errors in the deliverables early;", 1],
  // 2014h26h-q076
  ["2014h26h-q076", "d:ア", "jp", "なお ② は正しいので、①, ②の組合せ自体が成立しない。", "また、正しい ④ が抜けているため、効果があるものを全て挙げたことにもならない。", 1],
  ["2014h26h-q076", "d:ア", "zh", "另外 ② 是正确的，所以 ①、② 这个组合本身就不能成立。", "另外，正确的 ④ 没有包含在内，所以也不算列举了全部有效的项目。", 1],
  ["2014h26h-q076", "d:ア", "en", "Also, since ② is correct, the combination of ① and ② cannot hold in the first place.", "Also, the correct ④ is missing, so it does not list all the items that are effective.", 1],
  // 2015h27a-q003
  ["2015h27a-q003", "d:ウ", "jp", "完成責任を負う発注者が", "成果物を受け取る発注者が", 1],
  ["2015h27a-q003", "d:ウ", "zh", "负有完成责任的发包方", "接收成果物的发包方", 1],
  ["2015h27a-q003", "d:ウ", "en", "the client, who bears responsibility for completion,", "the client, who receives the deliverable,", 1],
  // 2010h22a-q033 (D-161 両論併記)
  ["2010h22a-q033", "d:ウ", "jp", "サービスを元の状態に戻すインシデント管理 (および復旧に伴う実作業) に該当する。",
    "サービスを元の状態に戻すインシデント管理 (および復旧に伴う実作業) として説明できる。なお、題幹が挙げる 3 プロセスに当てはめると、交換した部品を本番環境に適用して確認する作業は、ITIL v2 や JIS Q 20000 ではリリース管理 (変更管理で承認された変更を本番環境へ展開する活動) としても整理される。どちらの読み方でも原因の究明ではないので、問題管理には当たらない。", 1],
  ["2010h22a-q033", "d:ウ", "zh", "而属于把服务恢复到原状的事件管理（以及恢复所伴随的实际作业）。",
    "而可以解释为把服务恢复到原状的事件管理（以及恢复所伴随的实际作业）。另外，套用题干列出的 3 个流程来看，把更换的部件应用到生产环境并加以确认的作业，在 ITIL v2 和 JIS Q 20000 中也被归入发布管理（把经变更管理批准的变更部署到生产环境的活动）。无论按哪种理解，它都不是查明原因，因此不属于问题管理。", 1],
  ["2010h22a-q033", "d:ウ", "en", "it belongs to incident management (and the actual work that goes with recovery), which returns the service to its original state.",
    "it can be explained as incident management (and the actual work that goes with recovery), which returns the service to its original state. Mapped onto the three processes listed in the stem, applying the replacement part to the production environment and confirming it is also organized in ITIL v2 and JIS Q 20000 as release management (the activity of deploying changes approved through change management into production). Either way, it is not an investigation of the cause, so it is not problem management.", 1],
];

// ── D-175: zh の dual / duplex 訳語の入替え (対象 5 題の zh field だけ) ──
// 単一 pass の正規表現で入れ替えるので循環しない。双工 / 双重 の単独形は後続の文脈で系の名前と判定できるものだけ
// (「双重运行」「双重化」「双机冗余」など一般語は対象外)。
const D175_IDS = ["2009h21a-q086", "2012h24a-q057", "2013h25a-q047", "2014h26h-q056", "2015h27a-q082"];
// 題ごとの置換数 (sidecar + .phase1 tr_ + expl_tr の合計)。dry-run で数えた値を固定し、ずれたら中断する。
const D175_EXPECT = { "2009h21a-q086": 10, "2012h24a-q057": 12, "2013h25a-q047": 3, "2014h26h-q056": 6, "2015h27a-q082": 15 };
const SW = /双工系统|双重系统|双机系统|双工(?=（dual）|（双重运行|是用)|双重(?=（duplex）|是准备)/g;
const swap = (s) => s.replace(SW, (m, off) =>
  m === "双工系统" ? "双重系统" : m === "双重系统" ? "双工系统" : m === "双机系统" ? "双工系统"
    : m === "双工" ? (s.startsWith("（双重运行", off + 2) ? "双重系统" : "双重") : "双工");
const d175Log = []; const d175Count = {};
function swapZh(o, id, where) {
  if (!o || typeof o.zh !== "string") return;
  const k = (o.zh.match(SW) || []).length;
  if (!k) return;
  const before = o.zh; o.zh = swap(o.zh);
  d175Count[id] = (d175Count[id] ?? 0) + k; applied++;
  d175Log.push({ id, where, k, before, after: o.zh });
  log.push(`  ✓ ${id} ${where}.zh: D-175 dual/duplex 入替え ×${k}`);
}

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix2";
const E = "S131 efix2 解説監査 (efull_2)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const D175N = (s) => `（S131 efix2 D-175: zh 訳語を dual system = 双重系统 / duplex system = 双工系统 に統一 (${s})。訳語のみの変更で、correct_answer は不変 — ${MARK}）`;
const NOTE_APPEND = Object.fromEntries([
  N("2011h23tokubetsu-q077", "正解解説の UDP を「多少の欠損を許容してでも到達を優先する」としていたのを、再送せず欠損を許容して即時性 (低遅延) を優先する、に改めた (jp / zh / en)。correct_answer=イ は不変"),
  N("2011h23tokubetsu-q081", "正解解説のコンパイル方式の例から Java (javac が出力するのは JVM 用のバイトコード) を外し C だけにした (jp / zh / en)。correct_answer=ウ は不変"),
  N("2011h23tokubetsu-q088", "誤答肢ウの「誤りを訂正するのはパリティチェックやハミング符号など」を、検出はパリティチェック・訂正はハミング符号などと分けた (jp / zh / en)。correct_answer=イ は不変"),
  N("2011h23tokubetsu-q092", "上記の導出と正解解説・誤答肢エ・要点 1/2 は、保守契約に原因調査・復旧・修正が含まれ、保守料の支払いも無償の根拠になるとしていたが、題幹の保守契約は「導入したシステムに関する問合せ，障害の切分けの対応」だけで修正を含まない。無償修正の根拠は瑕疵担保責任 (契約条件: 検収後 6 か月、障害は検収の翌月で期間内) なので、その形に書き直した (jp / zh / en)。X社に切分けを依頼し、X社のバグなら瑕疵担保期間内で無償 = ウという導出・correct_answer=ウ は不変"),
  N("2012h24a-q009", "要点 1 の「仕組み・アイディアを守るのは特許法だけ」は実用新案法 (考案 = 技術的思想の創作) と矛盾するため、技術的アイディアは特許法と実用新案法、ビジネスモデルのような方法・仕組みまで守れるのは特許法だけ、に改めた (jp / zh / en)。correct_answer=エ は不変"),
  N("2012h24a-q017", "正解解説・要点 1 の「売り手 to 買い手」の覚え方と、誤答肢ウの CtoB の定義 (個人が売り手) は、例に挙げた逆オークション (企業が売り手) と矛盾するため、「提供する側 (取引の起点) to 受け取る側」に改めた (jp / zh / en)。correct_answer=イ は不変"),
  N("2012h24a-q018", "要点 2 のアライアンス「資本移動を伴わず」は資本提携を除外してしまうため、「経営権の移転を原則伴わず」に改めた (jp / zh / en)。correct_answer=イ は不変"),
  N("2012h24a-q055", "要点 2 の「RAID10 (RAID0+1)」を「RAID10 (RAID1+0)」に改めた (RAID0+1 は別構成) (jp / zh / en)。correct_answer=エ は不変"),
  N("2012h24h-q060", "要点 2 の「FTPS / SFTP = FTP に暗号化を加えたもの」を、FTPS = FTP + SSL/TLS、SFTP = SSH 上の別プロトコル、に分けた (jp / zh / en)。correct_answer=ウ は不変"),
  N("2012h24h-q063", "誤答肢アの「HDD が主記憶と補助記憶の橋渡し役」を「OS やファイルを置く常用の補助記憶」に改めた (jp / zh / en)。correct_answer=エ は不変"),
  N("2013h25a-q003", "正解解説の「分母が…株価か」と要点 2 の PER・EVA の分母の説明を改めた (PER = 株価 ÷ 1 株当たり利益で分母は EPS、EVA は金額で分母を持たない) (jp / zh / en)。correct_answer=エ は不変"),
  N("2013h25a-q013", "誤答肢アの「純資産 (株主資本、資本剰余金、利益剰余金など)」は内訳と区分を並べていたため「資本金・資本剰余金・利益剰余金などからなる株主資本ほか」に改めた (jp / zh / en)。correct_answer=ウ は不変"),
  N("2013h25a-q042", "要点 2 と誤答肢ウがマネジメント予備をスコープ外の変化・新要求用としていたのを、スコープ内の予見できない事象用に改め、スコープ外の新要求は変更管理でスコープとベースラインを改訂して扱うとした (jp / zh / en)。correct_answer=ア は不変"),
  N("2013h25a-q091", "正解解説が写真の取り違えの背景を「商品ごとに多数の写真を登録している」としていたが、題幹のメモでは写真は商品ごとに数枚で、間違えやすい理由は商品名の複雑さ。題幹どおりに改めた (jp / zh / en)。correct_answer=イ は不変"),
  N("2013h25a-q097", "正解解説・要点 1 が「接触不要」を RFID とバーコードの違いとしていたが、バーコードも光学式の非接触読取で、表1 の読取距離も同じ。違いは読取枚数 (一度に複数枚) と読取方式 (電波で向き・見通し不要) なので、その形に改めた (jp / zh / en)。correct_answer=ア は不変"),
  N("2013h25h-q005", "誤答肢ア・要点 2 が画面・帳票の要件確定を要件定義プロセスの作業としていたのを、開発プロセスのシステム要件定義に改めた (jp / zh / en)。correct_answer=エ は不変"),
  N("2013h25h-q026", "正解解説・要点 1 が会計監査人を役員に含めていたのを、会社法 329 条どおり 役員 (取締役・会計参与・監査役) および会計監査人 に改めた (jp / zh / en)。correct_answer=ア は不変"),
  N("2014h26a-q069", "誤答肢エのワンタイムパスワードを「本質は知識による認証」としていたのを、主に所持による認証に改めた (jp / zh / en)。上記導出の「エ (知識ベースの使い捨て情報)」も同じ趣旨で、正しくは所持の要素。指紋 = ウという導出・correct_answer=ウ は不変"),
  N("2014h26a-q074", "正解解説の「集合演算 (射影・選択・結合)」を「関係演算 (射影・選択・結合)」に改めた (jp / zh / en)。correct_answer=エ は不変"),
  N("2014h26h-q025", "要点 2 が e ラーニングを集合教育の一種として並べていたのを、集合教育と e ラーニングを分けて書いた (jp / zh / en)。correct_answer=エ は不変"),
  N("2014h26h-q049", "誤答肢イが机上デバッグを設計工程の作業としていたのを、設計書レビューは設計工程・机上デバッグはプログラミング工程と分けた (jp / zh / en)。correct_answer=ア は不変"),
  N("2014h26h-q076", "誤答肢アの末文「② は正しいので組合せ自体が成立しない」は理由にならないため、「正しい ④ が抜けている」に改めた (jp / zh / en)。②, ④ = ウという導出・correct_answer=ウ は不変"),
  N("2015h27a-q003", "誤答肢ウの「完成責任を負う発注者」を「成果物を受け取る発注者」に改めた (請負で完成責任を負うのは受注者) (jp / zh / en)。correct_answer=エ は不変"),
  N("2010h22a-q033", "誤答肢ウ (故障部品の交換と確認テスト) の分類を、主 context の判断 (D-161) で両論併記にした: インシデントの解決として説明でき、本番環境への適用は ITIL v2 / JIS Q 20000 ではリリース管理としても整理される。どちらでも原因の究明ではないので問題管理ではない (jp / zh / en)。correct_answer=エ は不変"),
  ["2009h21a-q086", () => D175N("題幹・正解解説・誤答肢ア/ウ・要点 1/2")],
  ["2012h24a-q057", () => D175N("題幹・正解解説・誤答肢ア/イ/ウ・要点 1。efull_2 の medium 指摘")],
  ["2013h25a-q047", () => D175N("正解解説・要点 1")],
  ["2014h26h-q056", () => D175N("誤答肢イ・要点 2、duplex の「双机系统」も 双工系统 に。efull_2 の medium 指摘")],
  ["2015h27a-q082", () => D175N("題幹 a〜c・正解解説・誤答肢ウ/エ・要点 1/2")],
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

// D-175: sidecar + .phase1 tr_ + expl_tr
// 入替えは対合 (2 回当てると元に戻る) なので、subN の「0 回なら skip」では冪等にならない。
// 題の final note に MARK があれば適用済みとして題ごと skip する (note は同じ run の最後に後置される)。
const GR = {};
const grOf = (id) => { const e = id.split("-q")[0]; return (GR[e] ??= rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))); };
const TR = {}; const T1 = new Map();
for (const id of D175_IDS) {
  const e = id.split("-q")[0];
  if (grOf(id).results.find((x) => x.id === id)?.key_guard?.note_jp.includes(MARK)) { skipped++; continue; }
  TR[e] ??= rj(P("data/ip/quiz/translations", `${e}.json`));
  const t = TR[e].questions[id];
  if (!t) throw new Error(`${id}: sidecar に無い`);
  swapZh(t.stem, id, "translations.stem");
  for (const [k, c] of Object.entries(t.choices)) swapZh(c, id, `translations.choices.${k}`);
  const f1 = P("data/ip/quiz/.phase1", `tr_${id}.json`);
  if (existsSync(f1)) {
    const d1 = rj(f1); T1.set(f1, d1);
    swapZh(d1.stem, id, ".phase1 tr_.stem");
    for (const c of d1.choices ?? []) swapZh(c, id, `.phase1 tr_.choices.${c.letter}`);
  }
  const { tr } = explPair(id);
  swapZh(tr.correct, id, "expl_tr.correct");
  for (const d of tr.distractors) swapZh(d, id, `expl_tr.d:${d.letter}`);
  tr.points.forEach((p, i) => swapZh(p, id, `expl_tr.p:${i}`));
}
for (const id of D175_IDS) {
  const k = d175Count[id] ?? 0;
  if (k && k !== D175_EXPECT[id]) throw new Error(`${id}: D-175 置換数 ${k} (expected ${D175_EXPECT[id]}) — abort`);
}

// 事後確認 (D-175、corpus 全体): 系の名前の zh 訳語が同じ field の jp の語と食い違っていない。
// field の jp が デュアル だけなら 双工系统 / 双机系统 を含まない、デュプレックス だけなら 双重系统 を含まない。
// 英語併記の取り違え (双工系统（dual / 双重系统（duplex) は corpus のどこにも無い。
{
  const Q = Object.fromEntries(JSON.parse(readFileSync(P("data/ip/quiz/questions.json"), "utf-8")).questions.map((q) => [q.id, q]));
  const bad = [];
  const chk = (id, where, jp = "", zh = "") => {
    const D = jp.includes("デュアル"), X = jp.includes("デュプレックス");
    if (/双工系统（[Dd]ual|双重系统（duplex|双机系统/.test(zh)) bad.push(`${id} ${where}: 英語併記と食い違い`);
    if (D && !X && /双工系统/.test(zh)) bad.push(`${id} ${where}: jp デュアル / zh 双工系统`);
    if (X && !D && /双重系统/.test(zh)) bad.push(`${id} ${where}: jp デュプレックス / zh 双重系统`);
  };
  for (const f of readdirSync(P("data/ip/quiz/translations"))) {
    const e = f.replace(/\.json$/, "");
    const t = TR[e] ?? JSON.parse(readFileSync(P("data/ip/quiz/translations", f), "utf-8"));
    for (const [id, v] of Object.entries(t.questions)) {
      chk(id, "translations.stem", Q[id]?.stem_jp, v.stem?.zh);
      for (const [k, c] of Object.entries(v.choices ?? {})) chk(id, `translations.choices.${k}`, Q[id]?.choices_jp?.[k], c.zh);
    }
  }
  for (const f of readdirSync(P("data/ip/quiz/.phase2")).filter((x) => x.startsWith("expl_tr_"))) {
    const id = f.slice(8, -5);
    const { j, tr } = EXP.get(id) ?? { j: JSON.parse(readFileSync(P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), "utf-8")), tr: JSON.parse(readFileSync(P("data/ip/quiz/.phase2", f), "utf-8")) };
    chk(id, "expl.correct", j.correct_jp, tr.correct.zh);
    for (const d of tr.distractors) chk(id, `expl.d:${d.letter}`, j.distractors_jp.find((x) => x.letter === d.letter)?.why_wrong_jp, d.zh);
    tr.points.forEach((p, i) => chk(id, `expl.p:${i}`, j.points_jp[i], p.zh));
  }
  if (bad.length) throw new Error(`D-175 事後確認に失敗:\n${bad.join("\n")}`);
}
for (const { jf, tf, j, tr } of EXP.values()) { wj(jf, j); wj(tf, tr); }
for (const e of Object.keys(TR)) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);
for (const [f, d] of T1) wj(f, d);

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = grOf(id).results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk()}`; applied++; log.push(`  ✓ ${id} final note: 追記 (round1・flag untouched)`);
}
for (const e of Object.keys(GR)) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

if (process.argv.includes("--d175-log")) console.log(JSON.stringify(d175Log, null, 1));
console.log(log.join("\n"));
console.log(`  D-175 置換数: ${JSON.stringify(d175Count)}`);
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix2: applied ${applied}, skipped ${skipped}`);
