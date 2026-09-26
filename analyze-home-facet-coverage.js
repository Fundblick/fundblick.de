'use strict';
const fs=require('fs'),path=require('path');
const {classify,inferFamily}=require('./home-facet-classifier.js');
const root=process.argv[2]||'catalog/shards';
if(!fs.existsSync(root))throw new Error(`Catalog shard directory not found: ${root}`);
const products=fs.readdirSync(root).filter(f=>f.endsWith('.json')).flatMap(f=>{const v=JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));return Array.isArray(v)?v:(v.products||[])}).filter(p=>!p.testData);
const families=['furniture','lighting','decor','living'];
const report={products:products.length,families:{}};
for(const family of families){
 const rows=products.filter(p=>p.category===`home.${family}`);const s={total:rows.length,reclassified:0,effectiveFamilies:{},coverage:{type:0,material:0,style:0,room:0},types:{}};
 for(const p of rows){const effective=inferFamily(p,family);s.effectiveFamilies[effective]=(s.effectiveFamilies[effective]||0)+1;if(effective!==family)s.reclassified++;const a=classify(p,family);for(const k of Object.keys(s.coverage))if(a[k])s.coverage[k]++;for(const type of [].concat(a.type||[]))s.types[type]=(s.types[type]||0)+1;}
 for(const k of Object.keys(s.coverage))s.coverage[k]=rows.length?{count:s.coverage[k],pct:+(100*s.coverage[k]/rows.length).toFixed(1)}:{count:0,pct:0};
 s.types=Object.fromEntries(Object.entries(s.types).sort((a,b)=>b[1]-a[1]));report.families[family]=s;
}
console.log(JSON.stringify(report,null,2));
