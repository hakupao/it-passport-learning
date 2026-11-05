// D-208 calibration: echo of cited questions' choices in 考点 text_jp
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const R='/Volumes/DevSSD/Project/IT-Passport-Learning', V=R+'/data/ip/textbook/.planning/v2', U=R+'/data/ip/textbook/units';
const strip=s=>s.replace(/\[\[jp:([^\]]*)\]\]/g,'$1').replace(/\*\*/g,'');
const norm=s=>strip(s).normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu,'');
const big=s=>{const o=new Set();for(let i=0;i+1<s.length;i++)o.add(s.slice(i,i+2));return o};
const join=v=>Array.isArray(v)?v.join(''):v??'';
export function feats(text, qids, man){
  const P=norm(text), PB=big(P); const res=[];
  for(const id of qids){const q=man.questions?.[id]; if(!q) continue;
    const ch=Object.entries(q.choices_jp??{}).map(([k,c])=>{const n=norm(join(c));const b=big(n);let hit=0;for(const g of b)if(PB.has(g))hit++;
      const cov=b.size?hit/b.size:0; const contained=n.length>=2&&P.includes(n);
      return {k,len:n.length,cov,contained,correct:k===q.correct_answer}});
    res.push({id,ch});}
  return res;
}
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
export function basePart(unit, baseSha){ for(const run of fs.readdirSync(V+'/'+unit+'/parts')){for(const f of fs.readdirSync(V+'/'+unit+'/parts/'+run)) if(/loc/.test(f)){const p=V+'/'+unit+'/parts/'+run+'/'+f; if(sha(p)===baseSha) return JSON.parse(fs.readFileSync(p))}} return null }
export const POS=[['technology-23-61-u02',6,0],['technology-23-61-u07',2,1],['technology-23-61-u12',2,1],['technology-23-61-u12',0,0],['technology-23-61-u12',0,1],['technology-22-58-u01',0,0],['technology-22-58-u01',1,2],['technology-22-58-u01',2,2],['technology-22-58-u01',6,1],['technology-22-58-u03',1,1],['technology-22-58-u03',5,1],['technology-22-58-u04',2,1],['technology-22-58-u05',1,1],['technology-22-58-u05',2,0]];
export const LOWS=[['technology-22-58-u02',0,2,'L1'],['technology-22-58-u02',2,1,'L5'],['technology-22-58-u02',4,1,'L6'],['technology-22-58-u01',1,0,'L1'],['technology-23-61-u13',1,0,'L2'],['technology-23-61-u07',5,1,'L1']];
export function loadPos(list){const out=[];for(const [u,t,p,lab] of list){const pf=R+'/evidence/phase5/stage_07_ui/phase3/batch/patches/'+u+'.json';const pt=JSON.parse(fs.readFileSync(pf));const base=basePart(u,pt.patches[0].base_sha256);const man=JSON.parse(fs.readFileSync(V+'/'+u+'/manifest.json'));const pt0=base.terms[t].points[p];out.push({u,t,p,lab,text:pt0.text_jp,qids:pt0.qids??[],man})}return out}
export function loadNeg(){const out=[];for(const f of fs.readdirSync(U)){const u=f.replace('.json','');const mf=V+'/'+u+'/manifest.json';if(!fs.existsSync(mf))continue;const unit=JSON.parse(fs.readFileSync(U+'/'+f));if(!unit.terms?.[0]?.points)continue;const man=JSON.parse(fs.readFileSync(mf));unit.terms.forEach((T,t)=>(T.points??[]).forEach((pt,p)=>{if(pt.qids?.length)out.push({u,t,p,text:pt.text_jp,qids:pt.qids,man})}))}return out}
