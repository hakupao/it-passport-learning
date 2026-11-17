// S164 D-238 candidate scan: every U+00B7 in zh content fields, with the jp sibling of the same field.
// Textbook: source fields only (explanation_* / definition_* / memory_hook_* are derived compat fields).
// Run (repo root): node evidence/phase5/hosting/oq25/scan.cjs <out.json>
const fs=require('fs'),path=require('path');const out=[];const DOT='·';
const DERIVED=/^(explanation|definition|memory_hook)_zh$/;
const ctxs=(s)=>{const r=[];let i=-1;while((i=s.indexOf(DOT,i+1))>=0)r.push({pos:i,ctx:s.slice(Math.max(0,i-25),i+26)});return r};
function unitWalk(o,p,file){
  if(Array.isArray(o)){o.forEach((v,i)=>unitWalk(v,p+'['+i+']',file));return}
  if(!o||typeof o!=='object')return;
  for(const[k,v]of Object.entries(o)){
    const q=p?p+'.'+k:k;
    if(typeof v==='string'&&(k.endsWith('_zh')||k==='zh')&&v.includes(DOT)){
      const jpKey=k==='zh'?'jp':k.replace(/_zh$/,'_jp');
      for(const c of ctxs(v))out.push({layer:'textbook',file,field:q,derived:DERIVED.test(k),...c,full_zh:v,jp:o[jpKey]??null});
    } else if(Array.isArray(v)&&(k.endsWith('_zh'))){const jpArr=o[k.replace(/_zh$/,'_jp')];v.forEach((x,i)=>{if(typeof x==='string'&&x.includes(DOT))for(const c of ctxs(x))out.push({layer:'textbook',file,field:q+'['+i+']',derived:false,...c,full_zh:x,jp:Array.isArray(jpArr)?jpArr[i]??null:null})})}
    else if(typeof v==='object') unitWalk(v,q,file);
  }
}
for(const f of fs.readdirSync('data/ip/textbook/units'))unitWalk(JSON.parse(fs.readFileSync('data/ip/textbook/units/'+f)),'',f.replace('.json',''));
const Q=JSON.parse(fs.readFileSync('data/ip/quiz/questions.json'));const arr=Array.isArray(Q)?Q:Q.questions||Object.values(Q);const byId=new Map(arr.map(x=>[x.id,x]));
for(const d of['explanations','translations'])for(const f of fs.readdirSync('data/ip/quiz/'+d)){const j=JSON.parse(fs.readFileSync('data/ip/quiz/'+d+'/'+f));
  for(const[id,q]of Object.entries(j.questions)){const raw=byId.get(id)||{};
    const fields=[];if(q.stem)fields.push(['stem',q.stem,raw.stem_jp]);for(const[k,v]of Object.entries(q.choices||{}))fields.push(['c:'+k,v,raw.choices_jp?.[k]]);
    if(q.correct)fields.push(['correct',q.correct,q.correct.jp]);for(const[k,v]of Object.entries(q.distractors||{}))fields.push(['d:'+k,v,v.jp]);(q.points||[]).forEach((v,i)=>fields.push(['p:'+i,v,v.jp]));
    for(const[w,o,jp]of fields)if(typeof o.zh==='string'&&o.zh.includes(DOT))for(const c of ctxs(o.zh))out.push({layer:d,id,where:w,...c,full_zh:o.zh.length>600?null:o.zh,jp:jp??null});}}
const z=JSON.parse(fs.readFileSync('data/ip/textbook/zh_terms.json'));
for(const[jp,zh]of Object.entries(z.terms))if(String(zh).includes(DOT))out.push({layer:'zh_terms',key:jp,zh});
for(const[u,m]of Object.entries(z.per_unit||{}))for(const[jp,zh]of Object.entries(m||{}))if(String(zh).includes(DOT))out.push({layer:'zh_terms.per_unit',unit:u,key:jp,zh});
unitWalk(JSON.parse(fs.readFileSync('data/ip/textbook/unit_index.json')),'','unit_index.json');
const by={};for(const h of out){const k=h.layer+(h.derived?'(derived)':'');by[k]=(by[k]||0)+1}console.log(by);
fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
