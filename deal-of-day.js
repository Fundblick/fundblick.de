'use strict';
(function(root){
  const DEFAULTS={minMerchants:3,minDiscountPct:15,minSaving:10,minReferenceSamples:3,maxAgeMinutes:180};
  const number=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
  const median=values=>{const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!sorted.length)return null;const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;};
  const available=product=>product&&product.active!==false&&product.inStock!==false&&String(product.availability||'IN_STOCK').toUpperCase()!=='OUT_OF_STOCK';
  const realProduct=product=>product?.testData===false&&product?.simulatedOffers!==true;
  function normalizeOffer(offer,now,cfg){
    const price=number(offer?.price),shipping=number(offer?.shippingCost)??number(offer?.shipping),explicitTotal=number(offer?.totalPrice),total=explicitTotal??(price!==null&&shipping!==null?price+shipping:null);
    if(total===null||total<=0)return null;
    const simulated=offer?.simulated===true;
    if(!simulated&&offer?.updatedAt){const ts=Date.parse(offer.updatedAt);if(!Number.isFinite(ts)||(now-ts)/60000>cfg.maxAgeMinutes)return null;}
    return {...offer,price,shippingCost:shipping,totalPrice:total};
  }
  function qualifyMultiMerchant(product,options={}){
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
    return {kind:'deal',evidence:'multi-merchant',productId:product.id,name:product.name,brand:product.brand||'',merchant:best.merchant||'',image:product.image||'',best,currentPrice:best.totalPrice,reference,saving,discountPct,merchantCount:merchants.size,simulated:offers.every(offer=>offer.simulated===true),score:discountPct*Math.log2(merchants.size+1)+Math.min(saving,100)/10};
  }
  function qualifyMerchantReference(product,options={}){
    const cfg={...DEFAULTS,...options};
    if(!realProduct(product)||!available(product))return null;
    const current=number(product.price),reference=number(product.originalPrice??product.referencePrice??product.rrpPrice);
    if(current===null||current<=0||reference===null||reference<=current)return null;
    const saving=reference-current,discountPct=saving/reference*100;
    if(saving<cfg.minSaving||discountPct<cfg.minDiscountPct)return null;
    const best=product.bestOffer||product.offers?.[0]||{price:current,merchant:product.merchant||''};
    return {kind:'deal',evidence:'merchant-reference',productId:product.id,name:product.name,brand:product.brand||'',merchant:best.merchant||product.merchant||'',image:product.image||'',best,currentPrice:current,reference,saving,discountPct,merchantCount:1,simulated:false,score:discountPct+Math.min(saving,100)/10};
  }
  function qualify(product,options={}){
    const candidates=[qualifyMultiMerchant(product,options),qualifyMerchantReference(product,options)].filter(Boolean);
    return candidates.sort((a,b)=>b.score-a.score)[0]||null;
  }
  function select(products,options={}){return (products||[]).map(product=>qualify(product,options)).filter(Boolean).sort((a,b)=>b.score-a.score||b.saving-a.saving||String(a.productId).localeCompare(String(b.productId)))[0]||null;}
  function dateKey(value){const d=value instanceof Date?value:new Date(value||Date.now());return Number.isFinite(d.getTime())?d.toISOString().slice(0,10):new Date().toISOString().slice(0,10);}
  function hash(text){let h=2166136261;for(const ch of String(text)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function spotlight(products,options={}){
    const key=dateKey(options.date||options.now),eligible=(products||[]).filter(product=>realProduct(product)&&available(product)&&number(product.price)>0&&String(product.name||'').trim()&&String(product.image||'').trim());
    if(!eligible.length)return null;
    eligible.sort((a,b)=>hash(`${key}|${a.id}`)-hash(`${key}|${b.id}`)||String(a.id).localeCompare(String(b.id)));
    const product=eligible[0],best=product.bestOffer||product.offers?.[0]||null,currentPrice=number(product.price);
    return {kind:'spotlight',evidence:'daily-rotation',productId:product.id,name:product.name,brand:product.brand||'',merchant:best?.merchant||product.merchant||'',image:product.image||'',best,currentPrice,reference:null,saving:null,discountPct:null,merchantCount:best?1:0,simulated:false,score:0,date:key};
  }
  function selectDaily(products,options={}){return select(products,options)||spotlight(products,options);}
  const api={defaults:DEFAULTS,qualify,qualifyMultiMerchant,qualifyMerchantReference,select,spotlight,selectDaily};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.FundBlickDealOfDay=api;
})(typeof window!=='undefined'?window:null);
