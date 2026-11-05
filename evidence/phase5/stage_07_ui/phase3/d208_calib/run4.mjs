import {loadPos,loadNeg,POS,LOWS} from './calib.mjs';
const strip=s=>s.replace(/\[\[jp:([^\]]*)\]\]/g,'$1').replace(/\*\*/g,'');
const norm=s=>strip(s).normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu,'');
const TERMLIKE=/[゠-ヿ]{4,}|[A-Za-z0-9]+/g;
const big=s=>{const o=new Set();for(let i=0;i+1<s.length;i++)o.add(s.slice(i,i+2));return o};
const join=v=>Array.isArray(v)?v.join(''):v??'';
const NEG_RE=/ない|ではなく|とは別|別物/;
function ev(s,th){ const terms=[...new Set([...(s.man.terms??[]),...(s.man.v1_terms??[]).map(t=>t.term)])].map(norm).sort((a,b)=>b.length-a.length);
  const mask=x=>{let n=norm(x);for(const t of terms) if(t.length>=2) n=n.split(t).join('〓');return n.replace(TERMLIKE,'〓')};
  const P=mask(s.text),PB=big(P.replace(/〓/g,''));
  if(!NEG_RE.test(s.text)) return 0; let w=0;
  for(const id of s.qids){const q=s.man.questions?.[id];if(!q)continue;
    for(const [k,c] of Object.entries(q.choices_jp??{})){ if(k===q.correct_answer) continue; const n=mask(join(c)).replace(/〓/g,''); if(n.length<6) continue; const b=big(n);let h=0;for(const g of b)if(PB.has(g))h++; if(h/b.size>=th) w++;}}
  return w;}
const B1417=/^technology-(23-61|22-58)-/;
const P=loadPos(POS),L=loadPos(LOWS),N=loadNeg(),N2=N.filter(s=>B1417.test(s.u)),N1=N.filter(s=>!B1417.test(s.u));
for(const th of [0.25,0.3,0.4]) console.log(`masked th=${th}: POS ${P.filter(s=>ev(s,th)>=1).length}/14  LOW ${L.filter(s=>ev(s,th)>=1).length}/6  NEG b14-17 ${N2.filter(s=>ev(s,th)>=1).length}/${N2.length}  NEG others ${N1.filter(s=>ev(s,th)>=1).length}/${N1.length}`);
