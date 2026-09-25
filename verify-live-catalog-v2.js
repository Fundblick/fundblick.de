'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const root=process.argv[2]||path.join('build','catalog');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
assert.equal(manifest.version,2);
assert.equal(manifest.offerSchema,'simulated-v2-promotions');
assert.equal(manifest.promotionSchema,'fundblick-promotion-v1');
assert.ok(manifest.itemCount>=15,'catalog unexpectedly small');
assert.ok(manifest.shardCount>=2,'catalog should exercise multiple shards');
assert.ok(manifest.searchFile&&!manifest.searchFile.includes('development/'));
const index=JSON.parse(fs.readFileSync(path.join(root,manifest.searchFile),'utf8'));
assert.equal(index.length,manifest.itemCount);
const seen=new Set();let counted=0,multiOfferProducts=0,promotionProducts=0;
for(const [key,meta] of Object.entries(manifest.shards)){
  assert.equal(Number(key)>=0,true);
  const payload=JSON.parse(fs.readFileSync(path.join(root,meta.file),'utf8'));
  assert.ok(Array.isArray(payload));
  assert.equal(payload.length,meta.itemCount);
  counted+=payload.length;
  for(const product of payload){
    assert.ok(product.id&&product.name);assert.ok(!seen.has(product.id),`duplicate ${product.id}`);seen.add(product.id);
    assert.ok(Array.isArray(product.offers)&&product.offers.length>=1,`offers missing for ${product.id}`);
    assert.equal(product.merchantCount,product.offers.length,`merchant count mismatch for ${product.id}`);
    if(product.offers.length>1)multiOfferProducts++;
    if(product.offers.some(offer=>Array.isArray(offer.promotions)&&offer.promotions.length))promotionProducts++;
    for(const offer of product.offers){
      assert.ok(offer.merchant&&offer.id,`invalid offer for ${product.id}`);
      assert.ok(Number.isFinite(offer.price)&&offer.price>=0,`invalid price for ${product.id}`);
      assert.ok(Number.isFinite(offer.shippingCost)&&offer.shippingCost>=0,`invalid shipping for ${product.id}`);
      assert.equal(Math.round((offer.price+offer.shippingCost)*100),Math.round(offer.totalPrice*100),`invalid regular total for ${product.id}`);
      assert.ok(Number.isFinite(offer.effectiveTotal)&&offer.effectiveTotal>=0&&offer.effectiveTotal<=offer.totalPrice,`invalid effective total for ${product.id}`);
      assert.equal(offer.simulated,true,`live-beta offer must be marked simulated for ${product.id}`);
      for(const promotion of offer.promotions||[]){assert.equal(promotion.simulated,true);assert.equal(promotion.verification,'verified');}
    }
    const bestPool=product.offers.filter(offer=>offer.inStock);const expectedBest=(bestPool.length?bestPool:product.offers).slice().sort((a,b)=>(a.effectiveTotal??a.totalPrice)-(b.effectiveTotal??b.totalPrice)||a.totalPrice-b.totalPrice||a.deliveryDays-b.deliveryDays||a.merchant.localeCompare(b.merchant))[0];
    assert.equal(product.bestOffer.id,expectedBest.id,`best offer mismatch for ${product.id}`);
    assert.equal(product.bestEffectiveOffer.id,expectedBest.id,`best effective offer mismatch for ${product.id}`);
    assert.equal(product.price,expectedBest.price,`display price must use best effective offer for ${product.id}`);
    assert.equal(product.shippingCost,expectedBest.shippingCost,`display shipping must use best effective offer for ${product.id}`);
    assert.equal(product.effectiveTotalPrice,expectedBest.effectiveTotal,`effective price mismatch for ${product.id}`);
  }
}
assert.equal(counted,manifest.itemCount);
assert.ok(multiOfferProducts>=10,'too few products exercise merchant comparison');
assert.ok(promotionProducts>=10,'too few products exercise promotion comparison');
for(const row of index){assert.ok(seen.has(row.i),`index points to missing ${row.i}`);assert.ok(manifest.shards[String(row.s)],`invalid shard ${row.s}`);assert.ok(row.q.length>0);assert.ok(Number.isFinite(row.t)&&row.t>=0);assert.ok(Number.isFinite(row.r)&&row.r>=row.p);assert.ok(row.t<=row.r);assert.ok(Number.isInteger(row.o)&&row.o>=1);}
for(const expected of ['electronics.audio.headphones','electronics.televisions','fashion.shoes','electronics.smartphones','tools.heat-guns','home.kitchen.coffee-machines'])assert.ok(index.some(row=>row.c.includes(expected)),`missing category ${expected}`);
console.log('live catalog v2 + simulated merchant promotions verification passed');
