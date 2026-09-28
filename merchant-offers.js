'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.FundBlickMerchantOffers=api;
})(typeof window!=='undefined'?window:null,function(){
  const OFFERS=[{
    id:'awin-ahipos-sulfo-immun-immun10-20261023',
    network:'awin',
    merchant:'Ahipos Horses DE',
    merchantMatch:/ahipos/i,
    title:'10 % Rabatt auf AHIPOS SULFO IMMUN',
    description:'Sulforaphan und Spirulina (3 Varianten)',
    code:'Immun10',
    discount:{type:'percent',value:10},
    startsAt:null,
    endsAt:'2026-10-23T23:59:00+02:00',
    productMatch:/\bsulfo\s*immun\b/i,
    conditions:{newCustomersOnly:true,usagePerCustomer:1,minimumOrder:false,combinable:false,onlineShopOnly:true},
    offerUrl:null,
    source:'Awin advertiser offer',
    verifiedAt:'2026-09-28',
    active:true
  }];
  const parseTime=value=>{const time=Date.parse(value);return Number.isFinite(time)?time:null;};
  function isActive(offer,now=Date.now()){
    if(!offer||offer.active===false)return false;
    const start=offer.startsAt?parseTime(offer.startsAt):null,end=offer.endsAt?parseTime(offer.endsAt):null;
    return (start===null||now>=start)&&(end===null||now<=end);
  }
  function matches(offer,product,now=Date.now()){
    if(!isActive(offer,now)||!product)return false;
    const merchant=String(product.merchant||product.merchantName||product.source?.merchant||'');
    const text=[product.name,product.productName,product.description,product.variant,product.sku].filter(Boolean).join(' ');
    return (!offer.merchantMatch||offer.merchantMatch.test(merchant))&&(!offer.productMatch||offer.productMatch.test(text));
  }
  function forProduct(product,now=Date.now()){return OFFERS.filter(offer=>matches(offer,product,now));}
  function publicOffer(offer){if(!offer)return null;return {id:offer.id,title:offer.title,description:offer.description,code:offer.code,discount:offer.discount,endsAt:offer.endsAt,conditions:offer.conditions,offerUrl:offer.offerUrl};}
  return {OFFERS,isActive,matches,forProduct,publicOffer};
});
