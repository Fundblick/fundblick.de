'use strict';
const fs=require('node:fs');
const path=require('node:path');

const outputRoot=process.argv[2]||path.join('build','catalog');
const sourceManifest=JSON.parse(fs.readFileSync('production-catalog-sources.json','utf8'));
if(!Array.isArray(sourceManifest)||!sourceManifest.length)throw new Error('production-catalog-sources.json must contain at least one source file');

const coreFile=path.normalize('development/core-products.json');
if(!sourceManifest.map(file=>path.normalize(String(file))).includes(coreFile))throw new Error('Production source manifest must include development/core-products.json');

const originalRead=fs.readFileSync.bind(fs);
const combined=[];
const seenIds=new Map();
for(const file of sourceManifest){
  const normalizedFile=path.normalize(String(file));
  const data=JSON.parse(originalRead(normalizedFile,'utf8'));
  if(!Array.isArray(data))throw new Error(`${file} must contain an array`);
  for(const product of data){
    const id=String(product?.id||'').trim();
    if(!id)throw new Error(`${file} contains product without id`);
    if(seenIds.has(id))throw new Error(`Duplicate production product id ${id} in ${seenIds.get(id)} and ${file}`);
    seenIds.set(id,file);
    combined.push(product);
  }
}

fs.readFileSync=function(file,...args){
  if(path.normalize(String(file))===coreFile)return JSON.stringify(combined);
  return originalRead(file,...args);
};

process.argv[2]=outputRoot;
require('./build-live-catalog.js');

const preferred=['home.living','home.furniture','home.lighting','home.decor','pet.equestrian','pet.dog','health.supplements'];
const counts=new Map();
for(const product of combined){
  if(!product||product.active===false)continue;
  const category=String(product.category||'').trim();
  const price=Number(product.price);
  if(!category||!product.id||!product.name||!Number.isFinite(price)||price<=0)continue;
  counts.set(category,(counts.get(category)||0)+1);
}
const rank=id=>{const index=preferred.indexOf(id);return index>=0?index:preferred.length;};
const categories=[...counts.entries()].map(([id,count])=>({id,count})).sort((a,b)=>rank(a.id)-rank(b.id)||b.count-a.count||a.id.localeCompare(b.id,'de'));
fs.writeFileSync(path.join(outputRoot,'categories.json'),JSON.stringify({version:1,categories})+'\n');
console.log(`production categories built: ${categories.length} categories`);