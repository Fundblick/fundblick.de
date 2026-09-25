'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const outputRoot=process.argv[2]||path.join('build','catalog');
const sourceFiles=['development/core-products.json'];
const targetShardBytes=24576;
const maxItemsPerShard=8;

const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
const normalize=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();

function readSources(){
  const byId=new Map();
  for(const file of sourceFiles){
    const data=JSON.parse(fs.readFileSync(file,'utf8'));
    if(!Array.isArray(data))throw new Error(`${file} must contain an array`);
    for(const raw of data){
      if(!raw||raw.active===false||!raw.id||!raw.name)continue;
      const price=Number(raw.price);
      if(!Number.isFinite(price)||price<0)continue;
      byId.set(String(raw.id),{...raw,id:String(raw.id),name:String(raw.name),price});
    }
  }
  return [...byId.values()].sort((a,b)=>a.id.localeCompare(b.id));
}

function splitShards(items){
  const shards=[];let current=[];let bytes=2;
  for(const item of items){
    const encoded=JSON.stringify(item);const itemBytes=Buffer.byteLength(encoded,'utf8')+(current.length?1:0);
    if(current.length&&(current.length>=maxItemsPerShard||bytes+itemBytes>targetShardBytes)){shards.push(current);current=[];bytes=2;}
    current.push(item);bytes+=itemBytes;
  }
  if(current.length)shards.push(current);
  return shards;
}

function main(){
  const items=readSources();
  if(!items.length)throw new Error('No active catalog products found');
  fs.rmSync(outputRoot,{recursive:true,force:true});
  fs.mkdirSync(path.join(outputRoot,'shards'),{recursive:true});
  const shards=splitShards(items);const shardMeta={};const productShard=new Map();
  shards.forEach((products,index)=>{
    const json=JSON.stringify(products);const hash=sha256(json);const file=`shards/${index}.${hash.slice(0,12)}.json`;
    fs.writeFileSync(path.join(outputRoot,file),json+'\n');
    shardMeta[String(index)]={itemCount:products.length,sha256:hash,file};
    products.forEach(product=>productShard.set(product.id,index));
  });
  const searchIndex=items.map(product=>({
    i:product.id,
    n:product.name,
    b:String(product.brand||''),
    c:String(product.category||''),
    q:normalize([product.name,product.brand,product.category,product.description].filter(Boolean).join(' ')),
    p:product.price,
    u:String(product.currency||'EUR'),
    s:productShard.get(product.id)
  }));
  const indexJson=JSON.stringify(searchIndex);const indexHash=sha256(indexJson);const searchFile=`search-index.${indexHash.slice(0,12)}.json`;
  fs.writeFileSync(path.join(outputRoot,searchFile),indexJson+'\n');
  const manifest={
    version:2,
    source:'curated-live-beta',
    itemCount:items.length,
    targetShardBytes,
    maxItemsPerShard,
    shardCount:shards.length,
    searchIndexSha256:indexHash,
    searchFile,
    shards:shardMeta
  };
  fs.writeFileSync(path.join(outputRoot,'manifest.json'),JSON.stringify(manifest)+'\n');
  console.log(`live catalog built: ${items.length} items, ${shards.length} shards`);
}

main();
