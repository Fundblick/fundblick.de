'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const outputRoot=process.argv[2]||path.join('build','catalog');
const sourceFiles=['development/core-products.json'];
const targetShardBytes=24576;
const maxItemsPerShard=8;
const merchantNames=['DemoMarkt','ShopTest','PreisDemo','DirektTest','Handel24','KaufDemo','MarktProbe'];
const priceDeltas=[0,-0.025,0.018,-0.012,0.035,-0.02,0.012];
const shippingPattern=[0,4.5,0,5.99,2.99,0,3.49];
const deliveryOffsets=[0,1,2,-1,3,1,2];

const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
const normalize=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const money=value=>Math.round(Number(value)*100)/100;
const numeric=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;

function simulatedOffers(raw){
  const basePrice=Number(raw.price);
  const requested=Math.round(numeric(raw.merchantCount)??3);
  const count=Math.max(1,Math.min(merchantNames.length,requested));
  const originalShipping=numeric(raw.shippingCost);
  const originalDelivery=Math.max(1,Math.round(numeric(raw.deliveryDays)??3));
  const originalStock=raw.inStock!==false;
  const offers=[];
  for(let i=0;i<count;i++){
    const price=money(basePrice*(1+priceDeltas[i]));
    const shippingCost=money(i===0&&originalShipping!==null?originalShipping:shippingPattern[i]);
    const deliveryDays=Math.max(1,originalDelivery+deliveryOffsets[i]);
    offers.push({
      id:`${raw.id}-offer-${i+1}`,
      merchantId:`demo-merchant-${i+1}`,
      merchant:merchantNames[i],
      price,
      shippingCost,
      totalPrice:money(price+shippingCost),
      currency:String(raw.currency||'EUR'),
      deliveryDays,
      availability:originalStock?'IN_STOCK':'OUT_OF_STOCK',
      inStock:originalStock,
      simulated:true
    });
  }
  return offers.sort((a,b)=>a.totalPrice-b.totalPrice||a.deliveryDays-b.deliveryDays||a.merchant.localeCompare(b.merchant));
}

function enrichProduct(raw){
  const offers=simulatedOffers(raw);
  const purchasable=offers.filter(offer=>offer.inStock);
  const best=(purchasable.length?purchasable:offers)[0];
  return {
    ...raw,
    sourcePrice:Number(raw.price),
    price:best.price,
    shippingCost:best.shippingCost,
    totalPrice:best.totalPrice,
    inStock:best.inStock,
    deliveryDays:best.deliveryDays,
    merchantCount:offers.length,
    offers,
    bestOffer:best,
    priceFrom:Math.min(...offers.map(offer=>offer.price)),
    totalPriceFrom:Math.min(...offers.map(offer=>offer.totalPrice)),
    simulatedOffers:true
  };
}

function readSources(){
  const byId=new Map();
  for(const file of sourceFiles){
    const data=JSON.parse(fs.readFileSync(file,'utf8'));
    if(!Array.isArray(data))throw new Error(`${file} must contain an array`);
    for(const raw of data){
      if(!raw||raw.active===false||!raw.id||!raw.name)continue;
      const price=Number(raw.price);
      if(!Number.isFinite(price)||price<0)continue;
      const normalized={...raw,id:String(raw.id),name:String(raw.name),price};
      byId.set(normalized.id,enrichProduct(normalized));
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
    t:product.totalPrice,
    o:product.merchantCount,
    u:String(product.currency||'EUR'),
    s:productShard.get(product.id)
  }));
  const indexJson=JSON.stringify(searchIndex);const indexHash=sha256(indexJson);const searchFile=`search-index.${indexHash.slice(0,12)}.json`;
  fs.writeFileSync(path.join(outputRoot,searchFile),indexJson+'\n');
  const manifest={
    version:2,
    source:'curated-live-beta',
    offerSchema:'simulated-v1',
    itemCount:items.length,
    targetShardBytes,
    maxItemsPerShard,
    shardCount:shards.length,
    searchIndexSha256:indexHash,
    searchFile,
    shards:shardMeta
  };
  fs.writeFileSync(path.join(outputRoot,'manifest.json'),JSON.stringify(manifest)+'\n');
  console.log(`live catalog built: ${items.length} items, ${shards.length} shards, simulated merchant offers enabled`);
}

main();
