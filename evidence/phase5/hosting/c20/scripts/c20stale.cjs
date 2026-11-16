// jp changed (beyond whitespace/quote/punct normalization) while zh or en stayed byte-identical, per commit
const {execSync}=require("child_process");const fs=require("fs");
const sh=c=>execSync(c,{maxBuffer:1<<30}).toString();
const norm=s=>(s||"").replace(/[\s「」『』“”"'（）()、，,。.・•]/g,"");
const commits=sh("git log --reverse --format=%h -- data/ip/quiz/explanations").trim().split("\n");
const show=(c,f)=>{try{return JSON.parse(sh(`git show ${c}:${f}`))}catch{return null}};
const fields=q=>{const o={};if(!q)return o;if(q.correct)o.correct=q.correct;for(const[k,v]of Object.entries(q.distractors||{}))o["d."+k]=v;(q.points||[]).forEach((v,i)=>o["p"+i]=v);return o};
const out=[];
for(const c of commits){
  const files=sh(`git diff-tree --no-commit-id --name-only -r ${c}^ ${c} -- data/ip/quiz/explanations 2>/dev/null || true`).trim().split("\n").filter(Boolean);
  const subj=sh(`git show -s --format=%s ${c}`).trim().slice(0,90);
  for(const f of files){const A=show(c+"^",f),B=show(c,f);if(!A||!B)continue;
    for(const[id,qb]of Object.entries(B.questions)){const qa=A.questions[id];if(!qa)continue;const fa=fields(qa),fb=fields(qb);
      for(const[n,vb]of Object.entries(fb)){const va=fa[n];if(!va)continue;
        if(norm(va.jp)!==norm(vb.jp)){const zs=va.zh===vb.zh,es=va.en===vb.en;if(zs||es)out.push({c,subj,id,n,zhSame:zs,enSame:es,jpA:va.jp.length,jpB:vb.jp.length});}}}}
}
fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
const by={};for(const r of out){const k=r.c+" "+r.subj;by[k]=(by[k]||0)+1}console.log(out.length);console.log(by);
