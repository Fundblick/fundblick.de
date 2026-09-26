'use strict';
const fs=require('fs');
const path=require('path');
const {classify,inferFamily}=require('./home-facet-classifier.js');
const dir=process.argv[2]||'catalog';
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const products=[];
for(const shard of Object.values(manifest.shards||{})){
  const data=JSON.parse(fs.readFileSync(path.join(dir,shard.file),'utf8'));
  products.push(...(Array.isArray(data)?data:Object.values(data)));
}
const merchantFamily=p=>({'home.furniture':'furniture','home.lighting':'lighting','home.decor':'decor','home.living':'living'}[p.category]||null);
const stats={total:products.length,classified:0,reclassified:0,families:{},facets:{type:0,material:0,style:0,room:0}};
for(const p of products){
  const fallback=merchantFamily(p);
  const family=inferFamily(p,fallback);
  if(family){stats.classified++;stats.families[family]=(stats.families[family]||0)+1;}
  if(fallback&&family&&fallback!==family)stats.reclassified++;
  const f=classify(p,fallback);
  for(const k of Object.keys(stats.facets))if(f[k])stats.facets[k]++;
}
const pct=n=>stats.total?Number((100*n/stats.total).toFixed(1)):0;
stats.coverage=Object.fromEntries(Object.entries(stats.facets).map(([k,v])=>[k,pct(v)]));
console.log(JSON.stringify(stats,null,2));
if(!stats.total)process.exitCode=2;
