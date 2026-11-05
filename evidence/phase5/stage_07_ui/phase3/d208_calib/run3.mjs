import {feats,loadPos,loadNeg,POS,LOWS} from './calib.mjs';
const NEG_RE=/ではない|ではなく|とは別|別物|別の現象|当たらない|限らない|限られず|代わりにはならない|互換性がない|わけではない|含まれない|分類されない|指す言葉ではない|ない/;
const sents=t=>t.split(/(?<=。)/).filter(Boolean);
function ev(s,{th,minLen,sent,needNeg,minW}){
  let best=0;
  const units=sent?sents(s.text):[s.text];
  for(const u of units){ if(needNeg&&!NEG_RE.test(u)) continue;
    const F=feats(u,s.qids,s.man); let w=0;
    for(const q of F) for(const c of q.ch){ if(c.correct) continue; if((c.len>=minLen&&c.cov>=th)||(c.contained&&c.len>=minLen)) w++; }
    best=Math.max(best,w);}
  return best>=minW;
}
const P=loadPos(POS),L=loadPos(LOWS),N=loadNeg();
for(const sent of [false,true]) for(const th of [0.3,0.4,0.5]) for(const minLen of [2,6]) for(const minW of [1,2]){
  const o={th,minLen,sent,needNeg:true,minW};
  const p=P.filter(s=>ev(s,o)).length,l=L.filter(s=>ev(s,o)).length,n=N.filter(s=>ev(s,o)).length;
  console.log(JSON.stringify(o),`POS ${p}/14 LOW ${l}/6 NEG ${n}/${N.length}`);
}
