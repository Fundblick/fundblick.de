'use strict';
(function(root){
  const DEFAULTS={minMerchants:3,minDiscountPct:15,minSaving:10,minReferenceSamples:3,maxAgeMinutes:180};
  const number=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
  const median=values=>{const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!sorted.length)return null;const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;};
  function normalizeOffer(offer,now,cfg){
    const price=number(offer?.price),shipping=number(offer?.shippingCost)??number(offer?.shipping)??0,total=number(offer?.totalPrice)??(price===null?null:price+shipping);
    if(total===null||total<=0)return null;
    const simulated=offer?.simulated===true;
    if(!simulated&&offer?.updatedAt){const ts=Date.parse(offer.updatedAt);if(!Number.isFinite(ts)||(now-ts)/60000>cfg.maxAgeMinutes)return null;}
    return {...offer,price,shippingCost:shipping,totalPrice:total};
  }
  function qualify(product,options={}){
    const cfg={...DEFAULTS,...options},now=options.now||Date.now();
    if(!product||!Array.isArray(product.offers))return null;
    const offers=product.offers.map(offer=>normalizeOffer(offer,now,cfg)).filter(Boolean).filter(offer=>offer.inStock!==false&&String(offer.availability||'IN_STOCK').toUpperCase()!=='OUT_OF_STOCK');
    const merchants=new Set(offers.map(offer=>offer.merchantId||offer.merchant).filter(Boolean));
    if(merchants.size<cfg.minMerchants||offers.length<cfg.minReferenceSamples)return null;
    offers.sort((a,b)=>a.totalPrice-b.totalPrice);const best=offers[0];
    const reference=median(offers.slice(1).map(offer=>offer.totalPrice));
    if(reference===null||reference<=best.totalPrice)return null;
    const saving=reference-best.totalPrice,discountPct=saving/reference*100;
    if(saving<cfg.minSaving||discountPct<cfg.minDiscountPct)return null;
    return {productId:product.id,name:product.name,brand:product.brand||'',image:product.image||'',best,reference,saving,discountPct,merchantCount:merchants.size,simulated:offers.every(offer=>offer.simulated===true),score:discountPct*Math.log2(merchants.size+1)+Math.min(saving,100)/10};
  }
  function select(products,options={}){return (products||[]).map(product=>qualify(product,options)).filter(Boolean).sort((a,b)=>b.score-a.score||b.saving-a.saving)[0]||null;}
  const api={defaults:DEFAULTS,qualify,select};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.FundBlickDealOfDay=api;
})(typeof window!=='undefined'?window:null);
