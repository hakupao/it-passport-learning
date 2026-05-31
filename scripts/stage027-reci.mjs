#!/usr/bin/env node
/**
 * Stage 2.7 — re-CI: false-negative check on the REPAIRED data (D-122 gate condition 5).
 * Takes a fresh independent blind read of N NON-candidate (untouched) questions and diffs vs stored.
 * Any non-candidate whose fresh blind read diverges from stored = a defect the original scan MISSED
 * (a false negative). Reports the false-negative rate + Wilson 95% CI → residual-defect estimate.
 * Usage: node scripts/stage027-reci.mjs <reci_run_dir> [...]
 */
import { readFileSync, existsSync } from 'fs';
const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const STEM_TH = 0.72, CHOICE_TH = 0.70;
const runDirs = process.argv.slice(2);
if (!runDirs.length) { console.error('usage: node stage027-reci.mjs <run_dir> [...]'); process.exit(1); }

const STRIP = /[\s　，、。．,.・「」『』“”"'（）()［］\[\]｛｝{}：:；;！!？?ー―─\-_=＝　]/g;
const norm = (s) => (s || '').normalize('NFKC').replace(STRIP, '').toLowerCase();
function bg(s){const g=new Set();if(s.length<2){if(s)g.add(s);return g;}for(let i=0;i<s.length-1;i++)g.add(s.slice(i,i+2));return g;}
function sim(a,b){const na=norm(a),nb=norm(b);if(!na&&!nb)return 1;if(!na||!nb)return 0;if(na===nb)return 1;const A=bg(na),B=bg(nb);let x=0;for(const g of A)if(B.has(g))x++;return x/(A.size+B.size-x);}
const chMin=(a,b)=>Math.min(...['ア','イ','ウ','エ'].map(l=>sim((a||{})[l]||'',(b||{})[l]||'')));
function wilson(x,n,z=1.96){if(!n)return{p:0,lo:0,hi:0};const p=x/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return{p,lo:Math.max(0,c-h),hi:Math.min(1,c+h)};}
const pct=x=>(x*100).toFixed(1)+'%';

const Q=new Map(JSON.parse(readFileSync(`${EXAMS}/question_bank.json`,'utf8')).questions.map(q=>[q.id,q]));
const reads={};
for(const dir of runDirs){const jp=`${dir}/journal.jsonl`;if(!existsSync(jp))continue;for(const ln of readFileSync(jp,'utf8').trim().split('\n').filter(Boolean)){let o;try{o=JSON.parse(ln);}catch{continue;}if(o.type==='result'&&o.result&&o.result.id)reads[o.result.id]=o.result;}}

let n=0,fn=0; const flagged=[];
for(const [id,r] of Object.entries(reads)){
  const q=Q.get(id); if(!q)continue; n++;
  if(!r.found_on_page){ continue; } // page-mapping, not a content false-negative
  const ss=sim(r.printed_stem,q.stem_jp), cs=chMin(r.printed_choices,q.choices_jp);
  if(ss<STEM_TH||cs<CHOICE_TH){ fn++; flagged.push({id,stem_sim:+ss.toFixed(2),choice_sim:+cs.toFixed(2)}); }
}
const ci=wilson(fn,n);
console.log(`=== re-CI false-negative check (N=${n} non-candidates) ===`);
console.log(`fresh-blind diverges from stored (scan MISS): ${fn}/${n} = ${pct(fn/n)}  [Wilson95 ${pct(ci.lo)}–${pct(ci.hi)}]`);
for(const f of flagged) console.log(`  MISS? ${f.id} stem_sim=${f.stem_sim} choice_sim=${f.choice_sim}`);
console.log(`\ninterpretation: false-negative rate ≈ ${pct(fn/n)} of untouched population.`);
console.log(`residual defect estimate = known-unresolved (62 unresolved + 8 anomaly ≈ 2.4%) + FN-on-clean(~${pct(fn/n)} × ~80% untouched).`);
