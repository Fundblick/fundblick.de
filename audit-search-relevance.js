'use strict';
const fs=require('node:fs');
const Relevance=require('./search-relevance.js');

const sources=JSON.parse(fs.readFileSync('production-catalog-sources.json','utf8'));
const products=sources.flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8'))).filter(p=>p&&p.active!==false&&p.name&&Number.isFinite(Number(p.price)));

const categorySearch={
  'pet.equestrian':'pferd reitsport equestrian horse',
  'pet.dog':'hund hunde dog',
  'health.supplements':'gesundheit nahrungserganzung nahrungsergänzung supplement',
  'home.furniture':'mobel möbel furniture',
  'home.living':'wohnen haushalt living home',
  'home.lighting':'lampen beleuchtung lighting lamps',
  'home.decor':'dekoration decor decoration'
};

const norm=Relevance.normalize;
function currentHaystack(p){return norm([p.name,p.brand,p.category,p.description].filter(Boolean).join(' '));}
function enrichedHaystack(p){return norm([p.name,p.brand,p.category,p.description,categorySearch[p.category]||'',p.rawAttributes?.productType||'',p.rawAttributes?.merchantCategory||''].filter(Boolean).join(' '));}
function strictTokens(query){return norm(query).split(/\s+/).filter(t=>t.length>1);}
function currentResults(query){
  const tokens=strictTokens(query);
  return products.filter(p=>tokens.every(t=>currentHaystack(p).includes(t))).map((p,index)=>({p,index,score:Relevance.scoreFields({title:p.name,brand:p.brand,description:p.description},query)})).sort((a,b)=>b.score-a.score||a.index-b.index);
}
function enrichedResults(query){
  const tokens=strictTokens(query);
  return products.filter(p=>tokens.every(t=>enrichedHaystack(p).includes(t))).map((p,index)=>({p,index,score:Relevance.scoreFields({title:p.name,brand:p.brand,description:[p.description,categorySearch[p.category]||'',p.rawAttributes?.productType||''].join(' ')},query)})).sort((a,b)=>b.score-a.score||a.index-b.index);
}

const cases=[
  {q:'Equinox',expect:/EQUINOX/i},
  {q:'Equinox Zusatzfutter',expect:/EQUINOX/i},
  {q:'Ahipos Flexen',expect:/AHIPOS.*Flexen|Flexen.*AHIPOS/i},
  {q:'Pferd Gelenke',expect:/Gelenk|Flexen/i},
  {q:'Synomax Hund',expect:/Synomax/i},
  {q:'Mosaiktisch',expect:/Mosaik/i},
  {q:'Mosaiktih',expect:/Mosaik/i,typo:true}
];

console.log(`Search relevance audit: ${products.length} production source rows`);
let failures=0;
for(const test of cases){
  const current=currentResults(test.q),enriched=enrichedResults(test.q);
  const top=current[0]?.p?.name||'—',future=enriched[0]?.p?.name||'—';
  const ok=!!current[0]&&test.expect.test(current[0].p.name);
  if(!ok)failures++;
  console.log(`\nQUERY: ${test.q}`);
  console.log(` current: ${current.length} hits | top: ${top}`);
  console.log(` enriched-taxonomy baseline: ${enriched.length} hits | top: ${future}`);
  console.log(` expected-top-pattern: ${test.expect} | current=${ok?'PASS':'FAIL'}${test.typo?' | typo-case':''}`);
  console.log(' top5:',current.slice(0,5).map(x=>x.p.name));
}
console.log(`\nCurrent search audit failures: ${failures}/${cases.length}`);
process.exitCode=0;
