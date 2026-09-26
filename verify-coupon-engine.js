'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const Coupons=require('./coupon-engine.js');

const product={id:'p1',brand:'Demo',category:'headphones'};
const offer={price:100,shippingCost:5,totalPrice:105};
const percent={id:'p10',mode:'code',type:'percent',value:10,code:'SAVE10',minBasket:50,verification:'verified',active:true,validUntil:'2099-12-31T23:59:59Z'};
let result=Coupons.evaluate(product,offer,percent,{now:Date.parse('2026-09-25T12:00:00Z')});
assert.equal(result.status,'verified');assert.equal(result.effectiveTotal,95);assert.equal(result.savings,10);
result=Coupons.evaluate(product,{...offer,price:40,totalPrice:45},percent,{now:Date.parse('2026-09-25T12:00:00Z')});
assert.equal(result.eligible,false);assert.equal(result.reason,'minimum-order');
result=Coupons.evaluate(product,offer,{...percent,id:'new',newCustomerOnly:true},{now:Date.parse('2026-09-25T12:00:00Z')});
assert.equal(result.status,'conditional');assert.equal(result.effectiveTotal,null);
const ranked=Coupons.rankOffers(product,[{id:'a',price:90,shippingCost:0,totalPrice:90,promotions:[]},{id:'b',price:96,shippingCost:0,totalPrice:96,promotions:[percent]}],{now:Date.parse('2026-09-25T12:00:00Z')});
assert.equal(ranked[0].id,'b');assert.equal(ranked[0].effectiveTotal,86.4);

const root=process.argv[2]||path.join('build','catalog');
if(fs.existsSync(path.join(root,'manifest.json'))){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  assert.equal(manifest.promotionSchema,'fundblick-promotion-v1');
  let promotionCount=0,simulatedPromotionCount=0;
  for(const meta of Object.values(manifest.shards||{})){
    const products=JSON.parse(fs.readFileSync(path.join(root,meta.file),'utf8'));
    for(const item of products)for(const liveOffer of item.offers||[])for(const promotion of liveOffer.promotions||[]){promotionCount++;if(promotion.simulated===true)simulatedPromotionCount++;}
  }
  if(manifest.dataMode==='real'){
    assert.equal(promotionCount,0,'real catalog must not invent unverified promotions');
  }else if(manifest.dataMode==='simulated'){
    assert.ok(promotionCount>0,'simulated catalog should exercise promotion logic');assert.equal(simulatedPromotionCount,promotionCount);
  }
}
console.log('coupon engine verification passed for current catalog mode');
