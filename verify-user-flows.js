'use strict';
const fs=require('node:fs');
const path=require('node:path');
const Loader=require('./catalog-loader.js');

const root=process.argv[2]||path.join('build','catalog');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const index=JSON.parse(fs.readFileSync(path.join(root,manifest.searchFile),'utf8'));
const categories=[...new Set(index.map(row=>String(row.c||'').trim()).filter(Boolean))];
if(!categories.length)throw new Error('No populated categories in live search index');

function productsForShardIds(ids){
  return ids.flatMap(id=>JSON.parse(fs.readFileSync(path.join(root,manifest.shards[String(id)].file),'utf8')));
}
function assertCategory(category){
  const expected=index.filter(row=>String(row.c||'').trim()===category);
  if(!expected.length)throw new Error(`Category ${category} is empty`);
  const ids=Loader.selectShardIds(manifest,index,category,null);
  if(!ids.length||ids.length>Loader.MAX_QUERY_SHARDS)throw new Error(`Category ${category}: invalid shard selection (${ids.length})`);
  const products=productsForShardIds(ids);
  const exact=products.filter(product=>String(product.category||'').trim()===category);
  if(!exact.length)throw new Error(`Category ${category}: selected shards contain no matching products`);
  const expectedIds=new Set(expected.slice(0,Loader.MAX_QUERY_PRODUCTS).map(row=>String(row.i)));
  if(!exact.some(product=>expectedIds.has(String(product.id))))throw new Error(`Category ${category}: index-to-shard wiring broken`);
  return {category,indexed:expected.length,loaded:exact.length,shards:ids.length};
}

const categoryResults=categories.map(assertCategory);
const samples=index.slice(0,Math.min(40,index.length));
for(const row of samples){
  const ids=Loader.selectShardIds(manifest,index,row.n,null);
  const products=productsForShardIds(ids);
  if(!products.some(product=>String(product.id)===String(row.i)))throw new Error(`Free search cannot recover indexed product ${row.i}: ${row.n}`);
}

const allProducts=Object.keys(manifest.shards).flatMap(id=>productsForShardIds([id]));
const real=allProducts.filter(product=>product.testData===false);
if(real.length!==manifest.realCount)throw new Error(`Real product count mismatch: ${real.length} != ${manifest.realCount}`);
const linked=real.filter(product=>{const offer=product.bestOffer||product.offers?.[0]||{};return String(offer.affiliateUrl||offer.directUrl||product.affiliateUrl||product.directUrl||'').trim();});
if(linked.length!==real.length)throw new Error(`${real.length-linked.length} real products have no outbound merchant URL`);

const largest=categoryResults.sort((a,b)=>b.indexed-a.indexed).slice(0,12);
console.log(`User-flow smoke gate OK: ${real.length} real products, ${categories.length} populated categories, ${samples.length} free-search samples, all merchant URLs present`);
for(const item of largest)console.log(`  ${item.category}: ${item.indexed} indexed, ${item.loaded} recovered via ${item.shards} shard(s)`);
