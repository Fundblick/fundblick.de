'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const Coupons=require('./coupon-engine.js');

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

function simulatedPromotions(raw,index,price,shippingCost){
  const base={
    active:true,
    verification:'verified',
    validFrom:'2026-01-01T00:00:00Z',
    validUntil:'2099-12-31T23:59:59Z',
    source:{type:'simulator',name:'FundBlick Simulator'},
    simulated:true
  };
  const promotions=[];
  if(index===1&&price>=30){
    promotions.push({...base,id:`${raw.id}-promo-blick10`,mode:'code',type:'percent',value:10,code:'BLICK10',minBasket:30,title:'10 % Test-Gutschein'});
  }
  if(index===2&&shippingCost>0){
    promotions.push({...base,id:`${raw.id}-promo-versand0`,mode:'code',type:'free-shipping',value:0,code:'VERSAND0',title:'Versandkostenfrei Test-Gutschein'});
  }
  if(index===3&&price>=80){
    promotions.push({...base,id:`${raw.id}-promo-spar8`,mode:'code',type:'fixed',value:8,code:'SPAR8',minBasket:80,title:'8 € Test-Gutschein'});
  }
  if(index===4&&price>=20){
    promotions.push({...base,id:`${raw.id}-promo-auto5`,mode:'automatic',type:'percent',value:5,title:'5 % automatische Testaktion'});
  }
  return promotions;
}

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
    const offer={
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
      simulated:true,
      promotions:simulatedPromotions(raw,i,price,shippingCost)
    };
    const decorated=Coupons.decorateOffer(raw,offer);
    offer.effectiveTotal=decorated.effectiveTotal;
    offer.promotionSavings=decorated.promotionSavings;
    offer.bestPromotionId=decorated.promotionEvaluation?.promotion?.id||null;
    offers.push(offer);
  }
  return offers.sort((a,b)=>(a.effectiveTotal??a.totalPrice)-(b.effectiveTotal??b.totalPrice)||a.totalPrice-b.totalPrice||a.deliveryDays-b.deliveryDays||a.merchant.localeCompare(b.merchant));
}

function enrichProduct(raw){
  const offers=simulatedOffers(raw);
  const purchasable=offers.filter(offer=>offer.inStock);
  const ranked=purchasable.length?purchasable:offers;
  const best=ranked[0];
  return {
    ...raw,
    sourcePrice:Number(raw.price),
    price:best.price,
    shippingCost:best.shippingCost,
    totalPrice:best.totalPrice,
    effectiveTotalPrice:best.effectiveTotal??best.totalPrice,
    promotionSavings:best.promotionSavings||0,
    inStock:best.inStock,
    deliveryDays:best.deliveryDays,
    merchantCount:offers.length,
    offers,
    bestOffer:best,
    bestEffectiveOffer:best,
    priceFrom:Math.min(...offers.map(offer=>offer.price)),
    totalPriceFrom:Math.min(...offers.map(offer=>offer.totalPrice)),
    effectiveTotalFrom:Math.min(...offers.map(offer=>offer.effectiveTotal??offer.totalPrice)),
    simulatedOffers:true,
    simulatedPromotions:true
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
    t:product.effectiveTotalPrice??product.totalPrice,
    r:product.totalPrice,
    o:product.merchantCount,
    u:String(product.currency||'EUR'),
    s:productShard.get(product.id)
  }));
  const indexJson=JSON.stringify(searchIndex);const indexHash=sha256(indexJson);const searchFile=`search-index.${indexHash.slice(0,12)}.json`;
  fs.writeFileSync(path.join(outputRoot,searchFile),indexJson+'\n');
  const manifest={
    version:2,
    source:'curated-live-beta',
    offerSchema:'simulated-v2-promotions',
    promotionSchema:'fundblick-promotion-v1',
    itemCount:items.length,
    targetShardBytes,
    maxItemsPerShard,
    shardCount:shards.length,
    searchIndexSha256:indexHash,
    searchFile,
    shards:shardMeta
  };
  fs.writeFileSync(path.join(outputRoot,'manifest.json'),JSON.stringify(manifest)+'\n');
  console.log(`live catalog built: ${items.length} items, ${shards.length} shards, simulated merchant offers and verified test promotions enabled`);
}

main();
