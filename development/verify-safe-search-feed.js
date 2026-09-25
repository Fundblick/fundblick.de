'use strict';
const fs=require('fs');
const path=require('path');
const root=__dirname;
const products=JSON.parse(fs.readFileSync(path.join(root,'core-products.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'catalog/manifest.json'),'utf8'));
const index=JSON.parse(fs.readFileSync(path.join(root,'catalog',manifest.searchFile),'utf8'));
if(!Array.isArray(products)||products.length!==manifest.itemCount||products.length!==index.length)throw Error('Simulator search feed count mismatch');
const expected=new Set(index.map(item=>item.i)),seen=new Set();
const allowed=new Set(['id','name','category','brand','description','image','price','currency','merchant','active','testData']);
for(const item of products){
  if(!item||typeof item!=='object'||!expected.has(item.id)||seen.has(item.id)||!item.name||!item.category||item.active!==true||item.testData!==true||item.currency!=='EUR'||!Number.isFinite(item.price)||item.price<0)throw Error('Invalid simulator search product');
  if(Object.keys(item).some(key=>!allowed.has(key)))throw Error('Unsafe field in simulator feed');
  seen.add(item.id);
}
console.log('Safe simulator search feed OK:',products.length,'products without offer links');
