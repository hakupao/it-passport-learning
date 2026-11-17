// S164 D-238: classification → edits. Textbook loc fields → d238_edits.json (tbjp-apply --round d238);
// textbook titles / unit_index / zh_terms → direct.json; quiz → quiz_patches.json (c20-quiz-apply.ts).
// Each row's replacement char: COMMA → 、, EXACT → the char of to_ctx at the「·」 position, KEEP_* → none.
const fs=require('fs');const D='evidence/phase5/hosting/oq25/';
const cands=JSON.parse(fs.readFileSync(D+'cands.json'));
const inTb=JSON.parse(fs.readFileSync(D+'input_tb.json')),inQ=JSON.parse(fs.readFileSync(D+'input_quiz.json'));
const cls=new Map([...JSON.parse(fs.readFileSync(D+'classify_tb.json')).rows,...JSON.parse(fs.readFileSync(D+'classify_quiz.json')).rows].map(r=>[r.n,r]));
const DERIVED=/(^|\.)(terms\[\d+\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))_(zh|en)(\[\d+\])?$/;
const repl=(row)=>{const c=cls.get(row.n);if(!c)throw new Error('no class '+row.n);
  if(c.class==='COMMA')return '、';if(c.class.startsWith('KEEP'))return null;
  if(c.class==='EXACT'){const mid=row.ctx.indexOf('·',Math.min(25,row.pos));const i=Math.min(25,row.pos);
    if(row.ctx[i]!=='·')throw new Error('ctx mid not dot '+row.n);if(c.to_ctx.length!==row.ctx.length)throw new Error('EXACT length differs '+row.n+' '+c.to_ctx);
    const ch=c.to_ctx[i];for(let k=0;k<row.ctx.length;k++)if(k!==i&&row.ctx[k]!==c.to_ctx[k]&&!(row.ctx[k]==='·'))throw new Error('EXACT changes other char '+row.n);return ch}
  throw new Error('bad class '+c.class)};
// group by field
const fields=new Map();
for(const row of [...inTb,...inQ]){const ch=repl(row);if(ch===null)continue;const k=row.layer+'|'+row.loc;if(!fields.has(k))fields.set(k,{layer:row.layer,loc:row.loc,subs:[]});fields.get(k).subs.push([row.pos,ch])}
// field full text
const read=(f)=>JSON.parse(fs.readFileSync(f));const get=(o,p)=>p.split(/\.|\[|\]/).filter(Boolean).reduce((a,k)=>a?.[/^\d+$/.test(k)?+k:k],o);
const tbEdits=[],direct=[],quiz=[],derivedExpect=[];
for(const f of fields.values()){
  let before,path;
  if(f.layer==='textbook'){const sp=f.loc.indexOf(' ');const file=f.loc.slice(0,sp);path=f.loc.slice(sp+1);
    before=get(read(file==='unit_index.json'?'data/ip/textbook/unit_index.json':'data/ip/textbook/units/'+file+'.json'),path);
    const a=[...before];for(const[pos,ch]of f.subs){if(a[pos]!=='·')throw new Error('pos not dot '+f.loc+' '+pos);a[pos]=ch}const after=a.join('');
    if(file==='unit_index.json'||/(^|\.)title_zh$/.test(path))direct.push({file,path,before,after});
    else if(DERIVED.test(path))derivedExpect.push({file,path,before,after});
    else tbEdits.push([file,path,[[before,after]]]);}
  else if(f.layer.startsWith('zh_terms')){direct.push({file:'zh_terms.json',key:f.loc,subs:f.subs})}
  else{const [id,where]=f.loc.split(' ');const exam=id.slice(0,id.indexOf('-q'));const j=read('data/ip/quiz/'+f.layer+'/'+exam+'.json').questions[id];
    const o=where==='stem'?j.stem:where.startsWith('c:')?j.choices[where.slice(2)]:where==='correct'?j.correct:where.startsWith('d:')?j.distractors[where.slice(2)]:j.points[+where.slice(2)];
    before=o.zh;const a=[...before];for(const[pos,ch]of f.subs){if(a[pos]!=='·')throw new Error('pos not dot '+f.loc+' '+pos);a[pos]=ch}
    quiz.push({id,where,lang:'zh',from:before,to:a.join(''),target_note:'D-238 zh「·」並列 → 「、」/EXACT'})}
}
fs.writeFileSync(D+'d238_edits.json',JSON.stringify(tbEdits,null,1)+'\n');
fs.writeFileSync(D+'derived_expect.json',JSON.stringify(derivedExpect,null,1)+'\n');
fs.writeFileSync(D+'direct.json',JSON.stringify(direct,null,1)+'\n');
fs.writeFileSync(D+'quiz_patches.json',JSON.stringify({note:'S164 D-238 quiz zh',patches:quiz},null,1)+'\n');
console.log('textbook loc fields',tbEdits.length,'derived expected',derivedExpect.length,'direct',direct.length,'quiz fields',quiz.length);
