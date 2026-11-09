// D-213: 本番の軽量確認。args: units(comma)。各単元 × ja/zh/en を 1 回ずつ GET (HTML のみ、JS/画像は取らない)。
// 判定: HTTP 200 / 単元の title が HTML に含まれる / 生記法 (**, [[jp:) と "undefined" が本文に無い。
import fs from 'node:fs';
const R='/Volumes/DevSSD/Project/IT-Passport-Learning/', BASE='https://web-mu-sandy-78.vercel.app';
const loc={ja:'jp',zh:'zh',en:'en'}; let bad=0, n=0;
const dec=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'");
for(const U of process.argv[2].split(',')){
  const u=JSON.parse(fs.readFileSync(R+`data/ip/textbook/units/${U}.json`,'utf8'));
  for(const [l,k] of Object.entries(loc)){
    n++; const r=await fetch(`${BASE}/${l}/textbook/${U}`); const h=dec(await r.text());
    const main=(h.match(/<main[\s\S]*?<\/main>/)||[''])[0].replace(/<[^>]+>/g,' ');
    const title=u[`title_${k}`]; const errs=[];
    if(r.status!==200) errs.push('status '+r.status);
    if(!title||!h.includes(title)) errs.push('title missing');
    if(/\*\*|\[\[jp:|undefined/.test(main)) errs.push('raw markup');
    if(!main.trim()) errs.push('empty main');
    console.log(errs.length?'✗':'✓',U,l,r.status,errs.join(', ')); if(errs.length) bad++;
  }
}
console.log(`smoke ${n-bad}/${n}`); process.exit(bad?1:0);
