'use strict';
const fs=require('fs'),path=require('path');
const {classify,inferFamily}=require('./home-facet-classifier.js');
const {registry}=require('./taxonomy-registry.js');
const dir=process.argv[2]||'catalog';
const manifestPath=path.join(dir,'manifest.json');
if(!fs.existsSync(manifestPath))throw new Error(`Missing catalog manifest: ${manifestPath}`);
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):e.isFile()&&e.name.endsWith('.json')&&p!==manifestPath?[p]:[]})}
function collect(v,out=[]){if(Array.isArray(v)){v.forEach(x=>collect(x,out));return out}if(v&&typeof v==='object'){if(('name'in v||'title'in v)&&('url'in v||'price'in v||'category'in v)){out.push(v);return out}Object.values(v).forEach(x=>collect(x,out))}return out}
const raw=[];for(const f of walk(dir)){try{collect(JSON.parse(fs.readFileSync(f,'utf8')),raw)}catch{}}
const products=[...new Map(raw.map((p,i)=>[String(p.id||p.sku||p.url||`${p.name||p.title}#${i}`),p])).values()].filter(p=>!p.simulated&&!p.isTest&&!p.testData);
const fallback={'home.furniture':'furniture','home.lighting':'lighting','home.decor':'decor','home.living':'living'};
const stats={products:products.length,knownFamily:0,typed:0,material:0,style:0,room:0,unknownFamily:0};
const unknownTitles={},merchantCategories={},families={};
for(const p of products){const merchantCat=String(p.category||'(none)');merchantCategories[merchantCat]=(merchantCategories[merchantCat]||0)+1;const family=inferFamily(p,fallback[p.category]);if(family&&registry.families[family]){stats.knownFamily++;families[family]=(families[family]||0)+1}else stats.unknownFamily++;const a=classify(p,family);if(a.type)stats.typed++;if(a.material)stats.material++;if(a.style)stats.style++;if(a.room)stats.room++;if(!a.type){const title=String(p.name||p.title||'').toLowerCase().replace(/[^a-zäöüß0-9]+/g,' ').trim();for(const w of title.split(/\s+/)){if(w.length<4)continue;unknownTitles[w]=(unknownTitles[w]||0)+1}}}
const pct=n=>products.length?+(100*n/products.length).toFixed(1):0;
const report={dataMode:manifest.dataMode||null,products:stats.products,reuse:{knownFamilyPct:pct(stats.knownFamily),typedPct:pct(stats.typed),materialPct:pct(stats.material),stylePct:pct(stats.style),roomPct:pct(stats.room)},unknownFamily:stats.unknownFamily,families:Object.fromEntries(Object.entries(families).sort((a,b)=>b[1]-a[1])),merchantCategories:Object.fromEntries(Object.entries(merchantCategories).sort((a,b)=>b[1]-a[1])),topUnknownTypeTokens:Object.entries(unknownTitles).sort((a,b)=>b[1]-a[1]).slice(0,40)};
console.log(JSON.stringify(report,null,2));
if(manifest.dataMode==='real'&&products.length&&stats.knownFamily/products.length<0.70){console.error('ONBOARDING_GATE_FAIL: less than 70% map to known FundBlick families');process.exit(2)}
