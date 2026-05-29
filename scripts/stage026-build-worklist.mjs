#!/usr/bin/env node
// Stage 2.6 — Phase A センサス結果 + 既知シードを統合した深核ワークリスト生成
// 出力: data/ip/exams/.tmp/s026/deep_worklist.json
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const E = path.join(ROOT, 'evidence/phase5');
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ip/exams/question_bank.json'), 'utf8'));
const byId = Object.fromEntries(bank.questions.map((q) => [q.id, q]));
const l3 = JSON.parse(fs.readFileSync(path.join(E, 'stage_026_census_L3_contamination.json'), 'utf8'));
const l4 = JSON.parse(fs.readFileSync(path.join(E, 'stage_026_census_L4_figref.json'), 'utf8'));

const OUTDIR = path.join(ROOT, 'data/ip/exams/.tmp/s026');
fs.mkdirSync(OUTDIR, { recursive: true });

const items = new Map(); // qid -> {qid, page_image, page_number, lenses:Set, reasons:[]}
const add = (qid, lens, reason) => {
  const q = byId[qid];
  if (!q) return;
  let it = items.get(qid);
  if (!it) items.set(qid, (it = { qid, page_image: q.source?.page_image || null, page_number: q.source?.page_number ?? null, has_figure: !!q.has_figure, figure_path: q.figure_path || null, correct_answer: q.correct_answer, lenses: new Set(), reasons: [] }));
  it.lenses.add(lens);
  it.reasons.push(reason);
};

// 1) 表紙ボイラープレート汚染 (全量スキャン再実行)
const boiler = /注意事項|試験開始|監督員|監督貞|問題冊子|答案用紙|受験番号|裏表紙|問題番号\s*問|選択方法\s*全問必須/;
for (const q of bank.questions) if (boiler.test(q.stem_jp || '')) add(q.id, 'L1_recover_stem', 'stem_boilerplate_contamination');

// 2) has_figure orphan (L4 全量) — figure_path 欠落
for (const o of l4.orphans) add(o.id, 'L4_verify_figure', 'has_figure_orphan');

// 3) 図/表強参照だが has_figure=false (図欠落候補)
for (const r of l4.ref_but_no_figure) add(r.id, 'L4_verify_figure_missing', 'figref_no_figure_flag');

// 4) 同回内ほぼ同一 stem・答案違い (L3 stem_pairs, 同一 exam prefix)
for (const p of l3.stem_pairs) {
  const ea = p.a.split('-q')[0], eb = p.b.split('-q')[0];
  if (ea === eb && !p.same_answer) {
    add(p.a, 'L2_verify_dup', `same_exam_near_dup_with:${p.b}`);
    add(p.b, 'L2_verify_dup', `same_exam_near_dup_with:${p.a}`);
  }
}

// 5) 既知シード: 題幹-選択肢不整合 重点套 @2015h27h, 2022r04 (図表/計算 大問を L2 重点)
//    → これらの套の図表参照題を L2 候補に (既に L4 で多数拾えているが念のため明示)
//    （ランダム抽样で別途カバー、ここでは明示シードのみ）

const out = [...items.values()].map((it) => ({ ...it, lenses: [...it.lenses] }));
out.sort((a, b) => a.qid.localeCompare(b.qid));

fs.writeFileSync(path.join(OUTDIR, 'deep_worklist.json'), JSON.stringify(out, null, 2));

// サマリ
const byReason = {};
for (const it of out) for (const r of it.reasons) {
  const cls = r.split(':')[0];
  byReason[cls] = (byReason[cls] || 0) + 1;
}
console.log('deep worklist items (unique qid):', out.length);
console.log('by reason class:', JSON.stringify(byReason, null, 2));
console.log('items missing page_image:', out.filter((o) => !o.page_image).length);
console.log('wrote', path.join(OUTDIR, 'deep_worklist.json'));
