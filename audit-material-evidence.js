'use strict';
const fs=require('fs'),path=require('path');
const {classify,inferFamily}=require('./home-facet-classifier.js');
const dir=process.argv[2]||'build/facet-audit-catalog';
const manifest=path.join(dir,'manifest.json');
if(!fs.existsSync(manifest))throw new Error(`Missing manifest: ${manifest}`);
function files(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?files(p):e.isFile()&&e.name.endsWith('.json')&&p!==manifest?[p]:[]})}
function products(v,out=[]){if(Array.isArray(v)){v.forEach(x=>products(x,out));return out}if(v&&typeof v==='object'){if(('name'in v||'title'in v)&&('url'in v||'price'in v||'category'in v)){out.push(v);return out}Object.values(v).forEach(x=>products(x,out))}return out}
const all=[];for(const f of files(dir)){try{products(JSON.parse(fs.readFileSync(f,'utf8')),all)}catch{}}
const uniq=[...new Map(all.map((p,i)=>[String(p.id||p.sku||p.url||`${p.name||p.title}#${i}`),p])).values()].filter(p=>!p.simulated&&!p.isTest&&!p.testData);
const fallback={'home.furniture':'furniture','home.lighting':'lighting','home.decor':'decor','home.living':'living'};
const explicit=/\b(holz|wood|mango\w*|akazie\w*|teak\w*|metall\w*|metal\w*|stahl\w*|steel\w*|eisen\w*|iron\w*|schmiedeeisen\w*|keramik\w*|ceramic\w*|zement\w*|cement\w*|rattan\w*|wicker\w*|geflecht\w*|textil\w*|stoff\w*|fabric\w*|velvet\w*|samt\w*|baumwoll\w*|cotton\w*|leder\w*|leather\w*|messing\w*|brass\w*|kupfer\w*|copper\w*|silber\w*|silver\w*|glas\w*|glass\w*|marmor\w*|marble\w*|jute\w*|seegras\w*|seagrass\w*|bambus\w*|bamboo\w*|naturfaser\w*)\b/ig;
const rows=[];
for(const p of uniq){const fam=inferFamily(p,fallback[p.category]);const a=classify(p,fam);if(a.material)continue;const raw=String(p.rawAttributes?.material||'').trim();const desc=String(p.description||'').replace(/\s+/g,' ').trim();const source=[p.name,p.title,raw,desc,p.googleProductCategory].filter(Boolean).join(' ');const hits=[...new Set((source.match(explicit)||[]).map(x=>x.toLowerCase()))];rows.push({family:fam,category:p.category||'',name:p.name||p.title||'',rawMaterial:raw,hits,description:desc.slice(0,220)});}
console.log(`MISSING_MATERIAL=${rows.length}`);
const withRaw=rows.filter(r=>r.rawMaterial);const withExplicit=rows.filter(r=>r.hits.length);
console.log(`WITH_RAW_MATERIAL=${withRaw.length}`);
console.log(`WITH_EXPLICIT_MATERIAL_TOKEN=${withExplicit.length}`);
console.log('\nEXPLICIT_EVIDENCE');
withExplicit.forEach(r=>console.log(JSON.stringify(r)));
console.log('\nRAW_MATERIAL_UNRECOGNIZED');
withRaw.filter(r=>!r.hits.length).forEach(r=>console.log(JSON.stringify(r)));
