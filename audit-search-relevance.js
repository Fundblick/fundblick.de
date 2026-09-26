'use strict';
const fs=require('node:fs');
const Relevance=require('./search-relevance.js');
const Intent=require('./search-intent.js');

const sources=JSON.parse(fs.readFileSync('production-catalog-sources.json','utf8'));
const products=sources.flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8'))).filter(p=>p&&p.active!==false&&p.name&&Number.isFinite(Number(p.price)));

function ranked(query){
  const corrected=Intent.correctSpelling(query);
  return products.filter(p=>Relevance.matchFields({title:p.name,brand:p.brand,description:p.description,category:p.category,productType:p.rawAttributes?.productType},corrected)).map((p,index)=>({p,index,score:Relevance.scoreFields({title:p.name,brand:p.brand,description:p.description,category:p.category,productType:p.rawAttributes?.productType},corrected)})).sort((a,b)=>b.score-a.score||a.index-b.index);
}

const cases=[
  {q:'Equinox',expect:/EQUINOX/i,min:5},
  {q:'Equinox Zusatzfutter',expect:/EQUINOX/i,min:3},
  {q:'Ahipos Flexen',expect:/AHIPOS.*Flexen|Flexen.*AHIPOS/i,min:1},
  {q:'Pferd Gelenke',expect:/Gelenk|Flexen/i,min:1},
  {q:'Synomax Hund',expect:/Synomax/i,min:1},
  {q:'Mosaiktisch',expect:/Mosaik/i,min:100},
  {q:'Mosaiktih',expect:/Mosaik/i,min:100,corrected:'Mosaiktisch'}
];

console.log(`Search relevance gate: ${products.length} production source rows`);
let failures=0;
for(const test of cases){
  const corrected=Intent.correctSpelling(test.q),results=ranked(test.q),top=results[0]?.p?.name||'—';
  const ok=results.length>=test.min&&!!results[0]&&test.expect.test(results[0].p.name)&&(test.corrected===undefined||corrected===test.corrected);
  if(!ok)failures++;
  console.log(`\nQUERY: ${test.q}${corrected!==test.q?` -> ${corrected}`:''}`);
  console.log(` hits: ${results.length} | top: ${top} | ${ok?'PASS':'FAIL'}`);
  console.log(' top5:',results.slice(0,5).map(x=>x.p.name));
}
if(failures)throw new Error(`Search relevance gate failed: ${failures}/${cases.length}`);
console.log(`\nSearch relevance gate passed: ${cases.length}/${cases.length}`);
