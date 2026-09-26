'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const root=process.argv[2]||path.join('build','catalog');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
assert.equal(manifest.version,3);
assert.equal(manifest.offerSchema,'fundblick-offer-v3');
assert.equal(manifest.promotionSchema,'fundblick-promotion-v1');
assert.ok(['real','simulated','mixed'].includes(manifest.dataMode),'invalid data mode');
assert.ok(manifest.itemCount>=1,'catalog empty');
assert.ok(manifest.shardCount>=1,'catalog has no shards');
assert.ok(manifest.searchFile&&!manifest.searchFile.includes('development/'));
assert.ok(manifest.homeDealFile&&!manifest.homeDealFile.includes('development/'));
assert.ok(Number.isInteger(manifest.homeDealCount)&&manifest.homeDealCount>=0);
assert.ok(manifest.homeDealCount<=manifest.homeDealLimit&&manifest.homeDealLimit===60);

const index=JSON.parse(fs.readFileSync(path.join(root,manifest.searchFile),'utf8'));
assert.equal(index.length,manifest.itemCount);
const seen=new Set();let counted=0,realProducts=0,simulatedProducts=0,realWithImage=0,realWithAffiliate=0;
for(const [key,meta] of Object.entries(manifest.shards)){
  assert.equal(Number(key)>=0,true);
  const payload=JSON.parse(fs.readFileSync(path.join(root,meta.file),'utf8'));
  assert.ok(Array.isArray(payload));assert.equal(payload.length,meta.itemCount);counted+=payload.length;
  for(const product of payload){
    assert.ok(product.id&&product.name);assert.ok(!seen.has(product.id),`duplicate ${product.id}`);seen.add(product.id);
    assert.ok(Number.isFinite(Number(product.price))&&Number(product.price)>0,`invalid price ${product.id}`);
    assert.ok(Array.isArray(product.offers)&&product.offers.length>=1,`offers missing ${product.id}`);
    assert.equal(product.merchantCount,product.offers.length,`merchant count mismatch ${product.id}`);
    const real=product.testData===false;
    if(real){realProducts++;if(product.image)realWithImage++;if(product.affiliateUrl||product.offers.some(o=>o.affiliateUrl))realWithAffiliate++;}
    else simulatedProducts++;
    for(const offer of product.offers){
      assert.ok(offer.merchant&&offer.id,`invalid offer ${product.id}`);
      assert.ok(Number.isFinite(Number(offer.price))&&Number(offer.price)>0,`invalid offer price ${product.id}`);
      const shippingKnown=offer.shippingKnown!==false&&offer.shippingCost!==null&&offer.shippingCost!==undefined;
      if(shippingKnown){
        assert.ok(Number.isFinite(Number(offer.shippingCost))&&Number(offer.shippingCost)>=0,`invalid shipping ${product.id}`);
        assert.ok(Number.isFinite(Number(offer.totalPrice)),`known shipping requires total ${product.id}`);
        assert.equal(Math.round((Number(offer.price)+Number(offer.shippingCost))*100),Math.round(Number(offer.totalPrice)*100),`invalid total ${product.id}`);
      }else{
        assert.equal(offer.shippingCost,null,`unknown shipping must stay null ${product.id}`);
        assert.equal(offer.totalPrice,null,`unknown shipping must not invent total ${product.id}`);
      }
      if(real){
        assert.equal(offer.simulated,false,`real offer marked simulated ${product.id}`);
        assert.equal(Array.isArray(offer.promotions)?offer.promotions.length:0,0,`unverified promotion on real offer ${product.id}`);
        assert.ok(/^https?:\/\//i.test(String(offer.affiliateUrl||product.affiliateUrl||'')),`real offer missing affiliate URL ${product.id}`);
      }else{
        assert.equal(offer.simulated,true,`test offer not marked simulated ${product.id}`);
      }
    }
  }
}
assert.equal(counted,manifest.itemCount);assert.equal(realProducts,manifest.realCount);assert.equal(simulatedProducts,manifest.simulatedCount);
if(manifest.dataMode==='real'){
  assert.equal(simulatedProducts,0,'real catalog may not contain simulator products');
  assert.ok(realProducts>=1,'real catalog missing products');
  assert.ok(realWithImage/realProducts>=0.95,'real image coverage below 95%');
  assert.ok(realWithAffiliate/realProducts>=0.95,'real affiliate URL coverage below 95%');
}else if(manifest.dataMode==='simulated'){
  assert.equal(realProducts,0,'simulated catalog unexpectedly contains real products');
}
for(const row of index){
  assert.ok(seen.has(row.i),`index points to missing ${row.i}`);assert.ok(manifest.shards[String(row.s)],`invalid shard ${row.s}`);assert.ok(row.q.length>0);assert.ok(Number.isFinite(Number(row.p))&&Number(row.p)>0);assert.ok(Number.isInteger(row.o)&&row.o>=1);
  if(row.t!==null)assert.ok(Number.isFinite(Number(row.t))&&Number(row.t)>=Number(row.p));
}
const homeDeals=JSON.parse(fs.readFileSync(path.join(root,manifest.homeDealFile),'utf8'));
assert.ok(Array.isArray(homeDeals));assert.equal(homeDeals.length,manifest.homeDealCount);assert.ok(homeDeals.length<=60);
for(const product of homeDeals){assert.ok(seen.has(product.id));assert.ok(Array.isArray(product.offers)&&product.offers.length>=2,'deal candidate must compare at least two offers');}
console.log(`catalog verification passed: mode=${manifest.dataMode}, items=${manifest.itemCount}, real=${realProducts}, simulated=${simulatedProducts}`);
