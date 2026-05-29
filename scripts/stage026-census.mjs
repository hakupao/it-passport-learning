#!/usr/bin/env node
// Stage 2.6 — 全量センサス (L3/L4/L6). 決定的・スクリプト・全 2,900 題.
// D-119 / docs/phase5/STAGE_2.6_AUDIT_PLAN.md
// 出力: evidence/phase5/stage_026_census_{L3_contamination,L4_figref,L6_distribution}.json
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BANK = path.join(ROOT, 'data/ip/exams/question_bank.json');
const OUT = path.join(ROOT, 'evidence/phase5');
const ANS = ['ア', 'イ', 'ウ', 'エ'];

const bank = JSON.parse(fs.readFileSync(BANK, 'utf8'));
const Q = bank.questions;
console.log(`loaded ${Q.length} questions`);

// ---------- helpers ----------
// 正規化: 空白/改行/記号類を除去し本文字のみ残す (類似度用)
const norm = (s) =>
  (s || '')
    .replace(/[\s　]/g, '')
    .replace(/[，、。．,.\-―ー_|｜「」『』（）()［］\[\]【】〔〕<>＜＞:：;；!！?？"'`･・…]/g, '')
    .toLowerCase();

const trigrams = (s) => {
  const set = new Set();
  for (let i = 0; i + 3 <= s.length; i++) set.add(s.slice(i, i + 3));
  return set;
};

const choiceSetKey = (c) =>
  ANS.map((k) => norm(c?.[k] || '')).sort().join('||');

// ============================================================
// L3 — 跨题重复/汚染
// ============================================================
function censusL3() {
  const normStems = Q.map((q) => norm(q.stem_jp));
  const triSets = normStems.map(trigrams);

  // 逆インデックス: trigram -> [idx...]; 過剰共通 trigram(>MAXDF)は弁別力なしで除外
  const MAXDF = 150;
  const inv = new Map();
  triSets.forEach((set, i) => {
    for (const t of set) {
      let arr = inv.get(t);
      if (!arr) inv.set(t, (arr = []));
      arr.push(i);
    }
  });

  // 共有 trigram 数を pair ごとに集計
  const pairShare = new Map(); // "i,j" -> count
  for (const [, arr] of inv) {
    if (arr.length < 2 || arr.length > MAXDF) continue;
    for (let a = 0; a < arr.length; a++)
      for (let b = a + 1; b < arr.length; b++) {
        const key = arr[a] + ',' + arr[b];
        pairShare.set(key, (pairShare.get(key) || 0) + 1);
      }
  }

  const stemPairs = [];
  for (const [key, shared] of pairShare) {
    const [i, j] = key.split(',').map(Number);
    const sa = triSets[i].size, sb = triSets[j].size;
    if (sa < 5 || sb < 5) continue;
    const jac = shared / (sa + sb - shared);
    if (jac < 0.7) continue;
    const sameChoiceSet = choiceSetKey(Q[i].choices_jp) === choiceSetKey(Q[j].choices_jp);
    stemPairs.push({
      a: Q[i].id, b: Q[j].id, stem_jaccard: +jac.toFixed(3),
      same_choice_set: sameChoiceSet,
      same_answer: Q[i].correct_answer === Q[j].correct_answer,
      // 解釈: stem ほぼ同一だが choice/answer が違う → 串題/汚染の疑い濃厚
      flag: jac >= 0.85 && !sameChoiceSet ? 'stem_dup_choice_differ' : (jac >= 0.97 ? 'near_identical_reuse' : 'high_stem_overlap'),
    });
  }
  stemPairs.sort((x, y) => y.stem_jaccard - x.stem_jaccard);

  // choice-set 衝突: 同一選択肢集合を持つ qid 群 (stem が違えば swap/汚染の疑い)
  const byChoice = new Map();
  Q.forEach((q, i) => {
    const k = choiceSetKey(q.choices_jp);
    if (!k || k === '||||') return;
    let arr = byChoice.get(k);
    if (!arr) byChoice.set(k, (arr = []));
    arr.push(i);
  });
  const choiceCollisions = [];
  for (const [, idxs] of byChoice) {
    if (idxs.length < 2) continue;
    // stem 類似度を全ペアで見て、低い(=選択肢同じだが設問違う)ものを強フラグ
    const members = idxs.map((i) => {
      const sa = triSets[i];
      return { id: Q[i].id, idx: i };
    });
    // 代表 stem 多様性: 全 stem を normalize して unique 数
    const uniqStems = new Set(idxs.map((i) => normStems[i]));
    choiceCollisions.push({
      choice_count: idxs.length,
      unique_stems: uniqStems.size,
      ids: idxs.map((i) => Q[i].id),
      answers: idxs.map((i) => Q[i].correct_answer),
      // 選択肢集合が同じで stem も同じ→単なる再出題; stem 違う→swap 疑い
      flag: uniqStems.size > 1 ? 'shared_choices_diff_stem' : 'reused_question',
    });
  }
  choiceCollisions.sort((a, b) => b.choice_count - a.choice_count);

  return {
    generated: 'stage026-census L3',
    params: { trigram: 3, MAXDF, stem_jaccard_threshold: 0.7 },
    summary: {
      stem_pairs_flagged: stemPairs.length,
      stem_dup_choice_differ: stemPairs.filter((p) => p.flag === 'stem_dup_choice_differ').length,
      choice_collisions: choiceCollisions.length,
      shared_choices_diff_stem: choiceCollisions.filter((c) => c.flag === 'shared_choices_diff_stem').length,
    },
    stem_pairs: stemPairs,
    choice_collisions: choiceCollisions,
  };
}

// ============================================================
// L4 — 図文引用整合性
// ============================================================
function censusL4() {
  // 設問文/選択肢が図表に言及しているか (強シグナル)
  const figRe = /図|表|グラフ|フロー|回路|次の図|以下の図|下図|上図|下記の表|以下の表|次の表/;
  const strongRe = /(次の|以下の|下記の|右の|左の|上の|下の)(図|表|グラフ|フロー)|図\s*\d|表\s*\d|下図|上図/;

  const refButNoFigure = [];
  const figureButNoRef = [];
  const orphans = []; // has_figure=true だが figure_path 欠落

  for (const q of Q) {
    const text = (q.stem_jp || '') + ' ' + ANS.map((k) => q.choices_jp?.[k] || '').join(' ');
    const refs = figRe.test(text);
    const strongRefs = strongRe.test(text);
    const hasFig = !!q.has_figure;
    const hasPath = !!q.figure_path;

    if (hasFig && !hasPath) orphans.push({ id: q.id, has_figure: true, figure_path: null, stem_refs: refs });

    if (strongRefs && !hasFig) {
      refButNoFigure.push({ id: q.id, has_figure: hasFig, figure_path: q.figure_path || null,
        snippet: (q.stem_jp || '').slice(0, 60) });
    }
    if (hasFig && !refs) {
      figureButNoRef.push({ id: q.id, figure_path: q.figure_path || null, figure_type: q.figure_type || null,
        snippet: (q.stem_jp || '').slice(0, 60) });
    }
  }

  return {
    generated: 'stage026-census L4',
    params: { strong_regex: strongRe.source, weak_regex: figRe.source },
    summary: {
      ref_but_no_figure: refButNoFigure.length,
      figure_but_no_ref: figureButNoRef.length,
      orphans_has_figure_no_path: orphans.length,
    },
    ref_but_no_figure: refButNoFigure,
    figure_but_no_ref: figureButNoRef,
    orphans,
  };
}

// ============================================================
// L6 — 答案分布 + 構造
// ============================================================
function censusL6() {
  const examOf = (id) => id.split('-q')[0];
  const byExam = new Map();
  for (const q of Q) {
    const e = examOf(q.id);
    let g = byExam.get(e);
    if (!g) byExam.set(e, (g = { exam: e, n: 0, dist: { ア: 0, イ: 0, ウ: 0, エ: 0 }, structural: [] }));
    g.n++;
    const a = q.correct_answer;
    if (ANS.includes(a)) g.dist[a]++;
    // 構造チェック
    const issues = [];
    if (!q.stem_jp || !norm(q.stem_jp)) issues.push('empty_stem');
    const ckeys = Object.keys(q.choices_jp || {}).sort().join(',');
    if (ckeys !== 'ア,イ,ウ,エ') issues.push('choice_keys=' + ckeys);
    for (const k of ANS) if (!q.choices_jp?.[k] || !norm(q.choices_jp[k])) issues.push('empty_choice_' + k);
    if (!ANS.includes(a)) issues.push('answer=' + JSON.stringify(a));
    if (issues.length) g.structural.push({ id: q.id, issues });
  }

  const globalDist = { ア: 0, イ: 0, ウ: 0, エ: 0 };
  const examStats = [];
  for (const [, g] of byExam) {
    for (const k of ANS) globalDist[k] += g.dist[k];
    const exp = g.n / 4;
    const chi2 = ANS.reduce((s, k) => s + Math.pow(g.dist[k] - exp, 2) / exp, 0);
    examStats.push({
      exam: g.exam, n: g.n, dist: g.dist, chi2: +chi2.toFixed(2),
      // df=3, 95%=7.815, 99%=11.345
      skew_flag: chi2 > 11.345 ? 'p<0.01' : chi2 > 7.815 ? 'p<0.05' : 'ok',
      structural_issues: g.structural,
      n_flag: g.n === 100 ? 'ok' : 'COUNT!=100',
    });
  }
  examStats.sort((a, b) => b.chi2 - a.chi2);

  const totalN = Q.length;
  const gexp = totalN / 4;
  const gchi2 = ANS.reduce((s, k) => s + Math.pow(globalDist[k] - gexp, 2) / gexp, 0);

  return {
    generated: 'stage026-census L6',
    summary: {
      total_questions: totalN,
      exams: examStats.length,
      global_dist: globalDist,
      global_chi2: +gchi2.toFixed(2),
      exams_skewed_p05: examStats.filter((e) => e.skew_flag !== 'ok').length,
      exams_count_not_100: examStats.filter((e) => e.n_flag !== 'ok').length,
      exams_with_structural_issues: examStats.filter((e) => e.structural_issues.length).length,
      total_structural_issues: examStats.reduce((s, e) => s + e.structural_issues.length, 0),
    },
    exam_stats: examStats,
  };
}

// ---------- run ----------
const l3 = censusL3();
const l4 = censusL4();
const l6 = censusL6();

fs.writeFileSync(path.join(OUT, 'stage_026_census_L3_contamination.json'), JSON.stringify(l3, null, 2));
fs.writeFileSync(path.join(OUT, 'stage_026_census_L4_figref.json'), JSON.stringify(l4, null, 2));
fs.writeFileSync(path.join(OUT, 'stage_026_census_L6_distribution.json'), JSON.stringify(l6, null, 2));

console.log('\n=== L3 跨题汚染 ===');
console.log(JSON.stringify(l3.summary, null, 2));
console.log('\n=== L4 図文引用 ===');
console.log(JSON.stringify(l4.summary, null, 2));
console.log('\n=== L6 答案分布+構造 ===');
console.log(JSON.stringify(l6.summary, null, 2));
console.log('\nwrote 3 census files to evidence/phase5/');
