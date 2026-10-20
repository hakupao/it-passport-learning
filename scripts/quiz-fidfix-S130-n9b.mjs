#!/usr/bin/env node
// Stage 6 / Quiz — S130 **n9b** (解説是正 lane): opus targeted audit (evidence/phase5/stage_06_quiz_phase2/ruleA_result_S130_etgt.json、
// 200 題、accurate 197) の指摘を是正する。evidence/quiz_n9b_expl_S130.md。
//
// 層・方針は quiz-fidfix-S130-n9 と同じ (subN で出現数を厳密に要求・0 回なら skip / expl は .phase2 expl_jp_ / expl_tr_ を直して
// phase2-merge で再生成 / D-143 note は final に純粋後置・round1 と既存 note・flag は不可触)。
//
// ── 是正 ──
//   (1) 2009h21a-q096 誤答肢イ・ウ・エの zh / en が商品を 丁/丙/甲/癸・D/C/A/J と呼んでいた。表・題幹・正解解説は S130 T1 で
//       商品あ〜こ / Product あ〜こ (jp の kana ラベル) に統一済なので、それに揃える (え→丁/D、う→丙/C、あ→甲/A、こ→癸/J)。
//       中問B (q093〜q096) の解説を走査し、十干・A〜J の商品ラベルが残るのは q096 だけ (q093 / q095 の A〜J は表の列記号で正)。
//   (2) 2014h26h-q096 正解解説と要点 1: 「申請前の修正はシステム外の行為なので記録されない」という理由付けは、題幹 (1)「申請前に
//       稟議を一時保存できる」と矛盾する。決定的な根拠は題幹の仕様「申請前の入力情報は，履歴としては保存しない」なので、
//       それを引いて書き直す (jp / zh / en)。key_guard note は後置のみ。
//   (3) 2015h27h-q096 誤答肢ウ: 「変動費率 0.05 を先月の利益 1,650千円 に掛ける」経路は 82.5 − 150 = −67.5 で +200 にならない。
//       成り立つ二重控除の経路 (500 − 150 − 150 = 200) だけを残す (jp / zh / en)。
//   (4) key_guard_valid=false (古い flag): 2009h21a-q091 / 2010h22h-q097 / 2010h22h-q100 / 2011h23tokubetsu-q096 / 2011h23tokubetsu-q098。
//       key を再導出して一致を確認し、flag と既存 note は D-143 の union 則で保持したまま、解消済みであることを note に後置する。
//
// Run: node scripts/quiz-fidfix-S130-n9b.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S130-n9b.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>  (2009h21a 2010h22h 2011h23tokubetsu 2014h26h 2015h27h)
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

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。事後確認つき (quiz-fidfix-S130-t2 と同じ)。
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
  // (1) 2009h21a-q096
  ["2009h21a-q096", "d:イ", "zh", "落在累计70%以内的是丁（9.2次）、丙（12.0次）、甲（14.4次）这3个品目，其中10次以上的是丙和甲共2个。", "落在累计70%以内的是商品え（9.2次）、商品う（12.0次）、商品あ（14.4次）这3个品目，其中10次以上的是商品う和商品あ共2个。", 1],
  ["2009h21a-q096", "d:イ", "zh", "所以符合的只有丁这1个品目。", "所以符合的只有商品え这1个品目。", 1],
  ["2009h21a-q096", "d:イ", "en", "are D (9.2), C (12.0) and A (14.4), and two of them, C and A, have", "are Product え (9.2), Product う (12.0) and Product あ (14.4), and two of them, Product う and Product あ, have", 1],
  ["2009h21a-q096", "d:イ", "en", "so only D qualifies, giving one item.", "so only Product え qualifies, giving one item.", 1],
  ["2009h21a-q096", "d:ウ", "zh", "筛选出的丁、丙、甲的个数。", "筛选出的商品え、商品う、商品あ的个数。", 1],
  ["2009h21a-q096", "d:ウ", "zh", "丙（12.0次）和甲（14.4次）应被排除。", "商品う（12.0次）和商品あ（14.4次）应被排除。", 1],
  ["2009h21a-q096", "d:ウ", "en", "is the count of D, C, and A, obtained", "is the count of Product え, Product う, and Product あ, obtained", 1],
  ["2009h21a-q096", "d:ウ", "en", "; C (12.0 times) and A (14.4 times) are excluded.", "; Product う (12.0 times) and Product あ (14.4 times) are excluded.", 1],
  ["2009h21a-q096", "d:エ", "zh", "（丁、丙、甲、癸）", "（商品え、商品う、商品あ、商品こ）", 1],
  ["2009h21a-q096", "d:エ", "zh", "加入癸后", "加入商品こ后", 1],
  ["2009h21a-q096", "d:エ", "en", "(D, C, A, and J)", "(Product え, Product う, Product あ, and Product こ)", 1],
  ["2009h21a-q096", "d:エ", "en", "Including J makes", "Including Product こ makes", 1],
  // (2) 2014h26h-q096
  ["2014h26h-q096", "correct", "jp",
    "正解は ウ「申請前の修正回数」。稟議システム (ワークフローシステム) が履歴として残すのは、あくまで「システム上で実行された操作」である。申請が行われて初めてその案件がシステムに載り、以後の同意・差戻し・承認といった操作が、実行者と日時つきのログとして蓄積されていく。ところが「申請前の修正」は、起案者が申請ボタンを押す前に手元で文面を書き直しているだけで、システムに対する操作としては何も発生していない。したがって何回書き直したかという情報はシステムのどこにも渡っておらず、履歴からは確認できない。",
    "正解は ウ「申請前の修正回数」。題幹の仕様では、稟議システムは申請・同意・差戻し・承認の各画面の実行ボタンが押されたときに処理を実行し、入力項目と日時を履歴として保存する。そのうえで「申請前の入力情報は，履歴としては保存しない」と明記されている。申請前の入力は (1) のとおり一時保存もできるシステム上の操作だが、仕様で履歴の対象から外されているので、申請前に何回修正したかは履歴に残らず、確認できない。これに対し、各操作の日時 (ア)、申請から承認までに掛かった時間 (イ = 申請と承認の日時の差)、差戻しの回数 (エ = 差戻しの履歴の件数) は、保存された履歴から求められる。", 1],
  ["2014h26h-q096", "correct", "zh",
    "正确答案是 ウ「申请前的修改次数」。内部审批（稟議）系统（工作流系统）作为历史记录保留下来的，始终只是「在系统上执行过的操作」。只有在提出申请之后，该事项才会进入系统，此后的同意、退回、批准等操作才会带着执行人和日期时间，作为日志逐条积累起来。而「申请前的修改」只是起草人在按下申请按钮之前，在自己手边改写文稿而已，对系统而言并没有发生任何操作。因此改写了多少次这一信息根本没有传到系统的任何地方，也就无法从历史记录中确认。",
    "正确答案是 ウ「申请前的修改次数」。按题干的规格，内部审批（稟議）系统在申请、同意、退回、批准各界面的执行按钮被按下时执行处理，并把输入项目和日期时间作为历史记录保存。题干同时明确写着「申请前的输入信息不作为历史记录保存」。申请前的输入如 (1) 所述可以暂存，是在系统上进行的操作，但按规格不属于历史记录的对象，因此申请前修改了多少次不会留在历史记录中，无法确认。与此相对，各操作的日期时间（ア）、从申请到批准所花的时间（イ＝申请与批准的日期时间之差）、退回的次数（エ＝退回历史记录的条数）都可以从保存的历史记录中求得。", 1],
  ["2014h26h-q096", "correct", "en",
    "The correct answer is ウ, the number of revisions made before the application. What a ringi system (an internal approval-request system, that is, a workflow system) keeps as history is strictly the operations that were actually performed on the system. Only after an application is submitted does the case enter the system, and from that point on operations such as agreement, return, and approval accumulate as log entries that carry the person who performed them and a date and time. A revision made before the application, however, is only the drafter rewriting the text at hand before pressing the application button, so nothing occurs as an operation on the system. Therefore the information on how many times it was rewritten never reaches the system anywhere, and it cannot be confirmed from the history.",
    "The correct answer is ウ, the number of revisions made before the application. Under the specification in the stem, the ringi system (an internal approval-request system) executes processing when the execute button on the application, agreement, return, or approval screen is pressed, and saves the input items and the date and time as history. The stem also states explicitly that information entered before the application is not saved as history. Input before the application is an operation on the system, since a ringi can even be saved temporarily as in (1), but the specification excludes it from the history, so how many times it was revised before the application is not recorded and cannot be confirmed. In contrast, the date and time of each operation (ア), the time taken from application to approval (イ, the difference between the application and approval times), and the number of returns (エ, the count of return entries in the history) can all be obtained from the saved history.", 1],
  ["2014h26h-q096", "p:0", "jp",
    "稟議システム (ワークフローシステム) の履歴に残るのは「システム上で実行された操作」だけ。申請前の下書き・書き直しのようにシステム外で行われた行為は記録対象外である。",
    "稟議システムの履歴は、仕様どおり申請・同意・差戻し・承認の実行時の入力項目と日時。「申請前の入力情報は，履歴としては保存しない」ので、一時保存はできても申請前の修正は履歴に残らない。", 1],
  ["2014h26h-q096", "p:0", "zh",
    "内部审批（稟議）系统（工作流系统）的历史记录中留下的，只有「在系统上执行过的操作」。像申请前的草稿、改写这样在系统之外进行的行为，不属于记录对象。",
    "按规格，内部审批（稟議）系统的历史记录是申请、同意、退回、批准执行时的输入项目和日期时间。由于「申请前的输入信息不作为历史记录保存」，即使可以暂存，申请前的修改也不会留在历史记录中。", 1],
  ["2014h26h-q096", "p:0", "en",
    "What remains in the history of a ringi system (a workflow system) is only the operations performed on the system. Acts carried out outside the system, such as drafting or rewriting before the application, are not subject to recording.",
    "Per the specification, the history of the ringi system consists of the input items and the date and time at each execution of application, agreement, return, and approval. Because information entered before the application is not saved as history, revisions made before the application are not recorded even though a temporary save is possible.", 1],
  // (3) 2015h27h-q096
  ["2015h27h-q096", "d:ウ", "jp",
    "「200千円増加する」は、変動費率 0.05 の効果を 10,000千円 ではなく先月の利益 1,650千円 など別の基準に掛けたり、150千円 を二重に差し引いたりした場合に出る誤答です。",
    "「200千円増加する」は、150千円 を二重に差し引いた (500千円 − 150千円 − 150千円 = 200千円) 場合に出る誤答です。", 1],
  ["2015h27h-q096", "d:ウ", "zh",
    "「增加200千日元」是把变动成本率0.05乘到了别的基数上（例如上个月的利润1,650千日元）而不是10,000千日元，或者把150千日元重复扣了两次时出现的错误答案。",
    "「增加200千日元」是把150千日元重复扣了两次（500千日元 − 150千日元 − 150千日元 = 200千日元）时出现的错误答案。", 1],
  ["2015h27h-q096", "d:ウ", "en",
    "“Increases by 200 thousand yen” appears when the 0.05 change in the variable cost ratio is applied to some other base (such as last month's profit of 1,650 thousand yen) instead of 10,000 thousand yen, or when the 150 thousand yen is subtracted twice.",
    "“Increases by 200 thousand yen” appears when the 150 thousand yen is subtracted twice (500 − 150 − 150 = 200 thousand yen).", 1],
];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S130-n9b";
const NOTE_APPEND = {
  "2009h21a-q096": () => `（S130 n9b 解説監査: 誤答肢イ・ウ・エの zh / en が商品を 丁/丙/甲/癸・D/C/A/J と呼び、表・題幹・正解解説の 商品あ〜こ / Product あ〜こ（S130 T1 で統一）と照合できなかったのを、商品え・う・あ・こ / Product え・う・あ・こ に揃えた。累計 70% 以内 (え・う・あ) かつ回転率 10 回以下 = え の 1 品目 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2014h26h-q096": () => `（S130 n9b 解説監査: 上記の導出と正解解説・要点 1 は「申請前の修正はシステム外の行為なので記録されない」としていたが、題幹 (1) で申請前の一時保存はシステム上でできる。決定的な根拠は題幹の仕様「申請前の入力情報は，履歴としては保存しない」なので、正解解説と要点 1（jp / zh / en）をそれに基づいて書き直した。履歴から確認できないのは申請前の修正回数 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2015h27h-q096": () => `（S130 n9b 解説監査: 誤答肢ウの解説（jp / zh / en）が挙げていた「変動費率 0.05 を先月の利益 1,650千円 に掛ける」経路は 1,650 × 0.05 − 150 = −67.5 で +200 にならないので削除し、成り立つ二重控除の経路（500 − 150 − 150 = 200）だけを残した。+500 − 150 = +350 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2009h21a-q091": () => `（S130 n9b 解説監査: key_guard の解消確認。冒頭段落の「stored correct_answer が『イ』」は S116 の key 是正 (イ→ウ、上記【S116 裁決】) より前の記述で、round1 の matches_key=false により suspect は union 則 (D-143 §4/§5) で残るが、問題は解消済み。再導出: 在庫 100、10:00 通常 80 は 70% の 70 を引当て在庫 30、10:30 優先 10 で在庫 20、11:00 通常 40 は 20 × 70% = 14 = ウ で correct_answer=ウ と一致 — ${MARK}）`,
  "2010h22h-q097": () => `（S130 n9b 解説監査: key_guard の解消確認。上記本文の figure_derivable=false・stem_corruption_suspected=true・「人間による前置き復元を要請」は前文欠落時 (round1) の判定で、【S114 裁決】の前文埋め込みにより解消済み（flag は union 則 D-143 §4/§5 で保持）。再導出: (1) 営業拠点数が少ない = 内部・不利 b、(2) 競合 T 社の撤退 = 外部・有利 c = アで correct_answer=ア と一致 — ${MARK}）`,
  "2010h22h-q100": () => `（S130 n9b 解説監査: key_guard の解消確認。上記本文の figure_derivable=false・stem_corruption_suspected=true は前文欠落時 (round1) の判定で、【S114 裁決】の前文埋め込みにより解消済み（flag は union 則 D-143 §4/§5 で保持）。再導出: 買収後の S 社のシェアは 12% + 10% = 22% で Q 社 25% に次ぐ 2 位 → 自社の強み（(3) 商品企画力）で他社を攻撃 = エで correct_answer=エ と一致 — ${MARK}）`,
  "2011h23tokubetsu-q096": () => `（S130 n9b 解説監査: key_guard の解消確認。suspect=true と round1 の stem_corruption_suspected / figure_derivable=false は前文欠落時の判定で、【S114 裁決】の前文埋め込みと S129 B8 の是正により解消済み（flag は union 則 D-143 §4/§5 で保持。上記本文の原典頁 page-35 は中問B 前文の頁、S129 B8 の page-38 は本問の頁）。再導出: TP(2,1) = 4,000、TP(2,2) = 1,500 で 10 × 4,000 + 20 × 1,500 = 70,000、J + K = 30 ≧ 20 なので × 0.9 = 63,000 = ウで correct_answer=ウ と一致 — ${MARK}）`,
  "2011h23tokubetsu-q098": () => `（S130 n9b 解説監査: key_guard の解消確認。suspect=true と round1 の stem_corruption_suspected / figure_derivable=false は前文欠落時の判定で、【S114 裁決】の前文埋め込み（〔作成に関する主な指示〕(3) 1 枚 200k バイト以下）により解消済み（flag は union 則 D-143 §4/§5 で保持）。上記本文の「has_figure=false のため図は無く」は当時の状態で、現在は中問C の共有図（図1 懸賞ページ案）が付くが本問の計算には関係しない。再導出: 2 × 3 インチを 100dpi で 200 × 300 画素 × 3 バイト = 180,000 バイト ≦ 200k、300dpi は 1,620,000 バイトで超過 = イで correct_answer=イ と一致 — ${MARK}）`,
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
// (1) の事後確認: q096 解説に十干の商品ラベルが残っていない
{
  const { tr } = explPair("2009h21a-q096");
  const rest = JSON.stringify(tr).match(/[甲乙丙丁戊己庚辛壬癸]/g);
  if (rest) throw new Error(`2009h21a-q096: 十干ラベルが残存 ${rest.join("")} — abort`);
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S130-n9b: applied ${applied}, skipped ${skipped}`);
