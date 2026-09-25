'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
function localAssetRefs(file){
  const html=fs.readFileSync(file,'utf8');
  const refs=[];
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    const raw=match[1];if(!raw||raw.startsWith('http:')||raw.startsWith('https:')||raw.startsWith('//')||raw.startsWith('#')||raw.startsWith('mailto:')||raw.startsWith('tel:'))continue;
    const clean=raw.split('?')[0].split('#')[0];if(!clean||clean==='/'||clean.startsWith('/'))continue;refs.push(clean);
  }
  return refs;
}
for(const page of ['index.html','search.html','impressum.html','datenschutz.html','404.html']){
  assert.ok(fs.existsSync(page),`missing page ${page}`);
  for(const ref of localAssetRefs(page))assert.ok(fs.existsSync(path.normalize(ref)),`${page} references missing local asset ${ref}`);
}
for(const required of ['products.json','development/core-products.json','CNAME','robots.txt','sitemap.xml'])assert.ok(fs.existsSync(required),`missing production asset ${required}`);
console.log('production asset reference verification passed');
