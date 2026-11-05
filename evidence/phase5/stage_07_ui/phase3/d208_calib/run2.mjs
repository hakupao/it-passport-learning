import {feats,loadPos,loadNeg,POS,LOWS} from './calib.mjs';
const NEG_RE=/ではない|ではなく|とは別|別物|別の現象|当たらない|限らない|限られず|代わりにはならない|ない。|互換性がない|ことではない|わけではない/;
const f=(s,th)=>{const F=feats(s.text,s.qids,s.man);let wEcho=0,wMax=0,anyC=0;for(const q of F)for(const c of q.ch){if(c.correct)continue;const e=(c.len>=6&&c.cov>=th)||(c.contained&&c.len>=2);if(e)wEcho++;if(c.len>=6)wMax=Math.max(wMax,c.cov)}return {neg:NEG_RE.test(s.text),wEcho,wMax:+wMax.toFixed(2)}};
for(const th of [0.25,0.3,0.35,0.4]){
 const pos=loadPos(POS).map(s=>f(s,th)), low=loadPos(LOWS).map(s=>f(s,th)), neg=loadNeg().map(s=>({s,...f(s,th)}));
 const rule=x=>x.neg&&x.wEcho>=1;
 console.log(`th=${th} POS hit ${pos.filter(rule).length}/${pos.length}  LOW hit ${low.filter(rule).length}/${low.length}  NEG hit ${neg.filter(rule).length}/${neg.length}  | wEcho>=1 any: POS ${pos.filter(x=>x.wEcho>=1).length} NEG ${neg.filter(x=>x.wEcho>=1).length} | neg-cue: POS ${pos.filter(x=>x.neg).length} NEG ${neg.filter(x=>x.neg).length}`);
 if(th===0.3){console.log(pos.map(x=>JSON.stringify(x)).join('\n'))}
}
