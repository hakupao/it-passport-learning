#!/usr/bin/env node
// Stage 2.6 — 全量 duplicate_extraction 再スキャン (ユーザー決定: 全量stem近重複+PDF照合)
// 別問題の本文を別 qid に複製する系統バグを網羅検出。
// 手法: 全 2,900 stem を正規化 → 近重複ペア(trigram Jaccard >= TH)を全量抽出 →
//        関与する unique qid を「PDF照合対象」として出力。
// 正当な年度跨ぎ再出題は PDF 照合で PASS、複製バグは FAIL になる。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ip/exams/question_bank.json'), 'utf8'));
const Q = bank.questions;
const TH = 0.80; // 近重複しきい値 (網羅性重視で L3 の 0.70→0.80 より広く拾うため低め維持)

const norm = (s) => (s || '').replace(/[\s　]/g, '').replace(/[，、。．,.\-―ー_|｜「」『』（）()［］\[\]【】〔〕<>＜＞:：;；!！?？"'`･・…]/g, '').toLowerCase();
const tri = (s) => { const set = new Set(); for (let i = 0; i + 3 <= s.length; i++) set.add(s.slice(i, i + 3)); return set; };

const normStems = Q.map((q) => norm(q.stem_jp));
const triSets = normStems.map(tri);

// 完全一致(正規化後)クラスタ
const exactMap = new Map();
normStems.forEach((s, i) => { if (s.length < 10) return; let a = exactMap.get(s); if (!a) exactMap.set(s, (a = [])); a.push(i); });
const exactClusters = [...exactMap.values()].filter((a) => a.length > 1);

// trigram Jaccard 近重複
const MAXDF = 200;
const inv = new Map();
triSets.forEach((set, i) => { for (const t of set) { let a = inv.get(t); if (!a) inv.set(t, (a = [])); a.push(i); } });
const pairShare = new Map();
for (const [, arr] of inv) { if (arr.length < 2 || arr.length > MAXDF) continue; for (let a = 0; a < arr.length; a++) for (let b = a + 1; b < arr.length; b++) { const k = arr[a] + ',' + arr[b]; pairShare.set(k, (pairShare.get(k) || 0) + 1); } }

const pairs = [];
for (const [k, shared] of pairShare) {
  const [i, j] = k.split(',').map(Number);
  const sa = triSets[i].size, sb = triSets[j].size; if (sa < 8 || sb < 8) continue;
  const jac = shared / (sa + sb - shared);
  if (jac < TH) continue;
  pairs.push({ a: Q[i].id, b: Q[j].id, jaccard: +jac.toFixed(3), same_exam: Q[i].id.split('-q')[0] === Q[j].id.split('-q')[0], same_choices: JSON.stringify(Q[i].choices_jp) === JSON.stringify(Q[j].choices_jp), same_answer: Q[i].correct_answer === Q[j].correct_answer });
}
pairs.sort((x, y) => y.jaccard - x.jaccard);

// 関与 qid (PDF照合対象)
const involved = new Set();
for (const p of pairs) { involved.add(p.a); involved.add(p.b); }
for (const c of exactClusters) for (const i of c) involved.add(Q[i].id);

const ALREADY = new Set(['2018h30h-q008', '2018h30h-q100', '2018h30h-q006', '2018h30h-q010']); // Phase B 確認済
const toCheck = [...involved].filter((id) => !ALREADY.has(id)).sort();

const OUT = path.join(ROOT, 'data/ip/exams/.tmp/s026');
fs.writeFileSync(path.join(OUT, 'dup_scan.json'), JSON.stringify({ threshold: TH, pairs, exact_clusters: exactClusters.map((c) => c.map((i) => Q[i].id)), involved_qids: [...involved].sort(), already_confirmed: [...ALREADY], to_pdf_check: toCheck }, null, 2));

console.log('near-dup pairs (>=' + TH + '):', pairs.length);
console.log('exact-normalized clusters:', exactClusters.length);
console.log('unique qids involved:', involved.size, '| to PDF-check (excl. already-confirmed):', toCheck.length);
console.log('\npairs:');
for (const p of pairs) console.log(' ', p.a, p.b, p.jaccard, p.same_exam ? 'SAME-EXAM' : 'cross', p.same_choices ? 'same-ch' : 'diff-ch');
console.log('\nto_pdf_check:', toCheck.join(' '));
