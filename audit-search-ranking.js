'use strict';
const fs=require('node:fs');
const R=require('./search-relevance.js');
const sources=JSON.parse(fs.readFileSync('production-catalog-sources.json','utf8'));
const products=sources.flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8'))).filter(p=>p&&p.active!==false&&p.name&&Number.isFinite(Number(p.price)));
function fields(p){return {title:p.name,brand:p.brand,description:p.description,category:p.category,productType:p.rawAttributes?.productType};}
function ranked(query){return products.filter(p=>R.matchFields(fields(p),query)).map((p,index)=>({p,index,score:R.scoreFields(fields(p),query)})).sort((a,b)=>b.score-a.score||a.index-b.index);}
const cases=[
  {q:'Mosaiktisch',expect:/^Mosaiktisch\b/i,reason:'exact product-type phrase should outrank feed order'},
  {q:'Mosaiktisch Stern',expect:/^Mosaiktisch Stern\b/i,reason:'longer exact title phrase should rank first'},
  {q:'Equinox Gelenke',expect:/^EQUINOX Flexen Plus\b/i,reason:'brand plus matching title attribute should rank first'},
  {q:'Ahipos Gelenk',expect:/AHIPOS Gelenk-Bundle/i,reason:'matching product title should beat taxonomy-only matches'},
  {q:'Pferd Gelenke',expect:/EQUINOX Flexen Plus|AHIPOS Gelenk-Bundle/i,reason:'semantic category term must not outrank title intent'}
];
let failed=0;
console.log(`Search ranking audit: ${products.length} production source rows`);
for(const c of cases){const rows=ranked(c.q),top=rows[0]?.p?.name||'—',ok=!!rows[0]&&c.expect.test(top);if(!ok)failed++;console.log(`\nQUERY: ${c.q}`);console.log(` top: ${top} | score=${rows[0]?.score??'—'} | ${ok?'PASS':'FAIL'}`);console.log(` reason: ${c.reason}`);console.log(' top5:',rows.slice(0,5).map(x=>`${x.score} :: ${x.p.name}`));}
console.log(`\nRanking audit: ${cases.length-failed}/${cases.length} passed`);
if(failed)process.exitCode=1;
