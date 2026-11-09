// usage: node stage-shared.mjs <units comma>  — 共有ファイル (unit_minutes / v1terms fixture) を「HEAD + 指定単元の行だけ作業木の値」で index に載せる (作業木は変えない)
import {execFileSync as X} from 'node:child_process'; import fs from 'node:fs';
const R='/Volumes/DevSSD/Project/IT-Passport-Learning'; process.chdir(R);
const units=new Set(process.argv[2].split(','));
const isU=k=>/^(strategy|management|technology)-\d\d-\d\d-u\d\d$/.test(k);
const pick=(H,W)=>{ if(!W||typeof W!=='object'||Array.isArray(W)) return W;
  const ks=Object.keys(W); if(ks.some(isU)){ const o={}; for(const k of ks){ if(units.has(k)) o[k]=W[k]; else if(H&&k in H) o[k]=H[k]; } return o; }
  const o={}; for(const k of ks) o[k]=pick(H?.[k],W[k]); return o; };
for(const f of ['data/ip/textbook/unit_minutes.json','apps/web/src/lib/textbook/__fixtures__/v2-units.v1terms.json']){
  const wt=fs.readFileSync(f,'utf8'), W=JSON.parse(wt), H=JSON.parse(X('git',['show','HEAD:'+f],{encoding:'utf8'}));
  if(JSON.stringify(W,null,2)+'\n'!==wt){console.log('format mismatch',f);process.exit(1)}
  const out=JSON.stringify(pick(H,W),null,2)+'\n';
  const sha=X('git',['hash-object','-w','--stdin'],{input:out,encoding:'utf8'}).trim();
  X('git',['update-index','--cacheinfo','100644',sha,f]); console.log('staged',f,sha.slice(0,8));
}
