'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.FundBlickCoupons=api;
})(typeof window!=='undefined'?window:null,function(){
  const num=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
  const money=value=>Math.round(Number(value)*100)/100;
  const text=value=>String(value||'').trim();
  const norm=value=>text(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const inList=(value,list)=>!Array.isArray(list)||!list.length||list.some(item=>norm(item)===norm(value));
  const dateMs=value=>{if(!value)return null;const parsed=Date.parse(value);return Number.isFinite(parsed)?parsed:null;};

  function regularTotal(offer){
    const direct=num(offer?.totalPrice);if(direct!==null)return money(direct);
    const price=num(offer?.price),shipping=num(offer?.shippingCost)??0;
    return price===null?null:money(price+shipping);
  }

  function ruleMatch(product,offer,promotion,context){
    const itemPrice=num(offer?.price);if(itemPrice===null)return {ok:false,reason:'missing-price'};
    const now=context?.now instanceof Date?context.now.getTime():(num(context?.now)??Date.now());
    const start=dateMs(promotion.validFrom),end=dateMs(promotion.validUntil);
    if(start!==null&&now<start)return {ok:false,reason:'not-started'};
    if(end!==null&&now>end)return {ok:false,reason:'expired'};
    if(promotion.active===false)return {ok:false,reason:'inactive'};
    if(num(promotion.minBasket)!==null&&itemPrice<num(promotion.minBasket))return {ok:false,reason:'minimum-order'};
    if(num(promotion.maxBasket)!==null&&itemPrice>num(promotion.maxBasket))return {ok:false,reason:'maximum-order'};
    if(!inList(product?.brand,promotion.brands))return {ok:false,reason:'brand'};
    if(!inList(product?.category,promotion.categories))return {ok:false,reason:'category'};
    if(Array.isArray(promotion.excludedBrands)&&promotion.excludedBrands.some(v=>norm(v)===norm(product?.brand)))return {ok:false,reason:'excluded-brand'};
    if(Array.isArray(promotion.excludedCategories)&&promotion.excludedCategories.some(v=>norm(v)===norm(product?.category)))return {ok:false,reason:'excluded-category'};
    if(Array.isArray(promotion.countries)&&promotion.countries.length){
      if(!context?.country)return {ok:true,conditional:true,reason:'country-unknown'};
      if(!promotion.countries.map(norm).includes(norm(context.country)))return {ok:false,reason:'country'};
    }
    if(promotion.newCustomerOnly===true){
      if(context?.isNewCustomer===false)return {ok:false,reason:'new-customer'};
      if(context?.isNewCustomer!==true)return {ok:true,conditional:true,reason:'new-customer-unknown'};
    }
    if(promotion.requiresLogin===true&&context?.loggedIn!==true)return {ok:true,conditional:true,reason:'login-required'};
    if(Array.isArray(promotion.paymentMethods)&&promotion.paymentMethods.length){
      if(!context?.paymentMethod)return {ok:true,conditional:true,reason:'payment-unknown'};
      if(!promotion.paymentMethods.map(norm).includes(norm(context.paymentMethod)))return {ok:false,reason:'payment'};
    }
    return {ok:true,conditional:false,reason:null};
  }

  function evaluate(product,offer,promotion,context={}){
    const total=regularTotal(offer),price=num(offer?.price),shipping=num(offer?.shippingCost)??0;
    if(total===null||price===null||!promotion)return {eligible:false,status:'invalid',effectiveTotal:null,savings:0,reason:'missing-data'};
    const rules=ruleMatch(product,offer,promotion,context);
    if(!rules.ok)return {eligible:false,status:'invalid',effectiveTotal:null,savings:0,reason:rules.reason,promotion};
    const verified=promotion.verification==='verified'||promotion.mode==='automatic';
    const conditional=rules.conditional||!verified;
    let itemDiscount=0,shippingDiscount=0;
    const value=num(promotion.value)??0;
    switch(String(promotion.type||'').toLowerCase()){
      case 'percent': itemDiscount=price*Math.max(0,value)/100;break;
      case 'fixed': itemDiscount=Math.max(0,value);break;
      case 'free-shipping': shippingDiscount=shipping;break;
      default:return {eligible:false,status:'invalid',effectiveTotal:null,savings:0,reason:'unsupported-type',promotion};
    }
    const maxDiscount=num(promotion.maxDiscount);if(maxDiscount!==null)itemDiscount=Math.min(itemDiscount,maxDiscount);
    itemDiscount=Math.min(price,itemDiscount);shippingDiscount=Math.min(shipping,shippingDiscount);
    const savings=money(itemDiscount+shippingDiscount);
    const effective=money(Math.max(0,total-savings));
    return {
      eligible:true,
      status:conditional?'conditional':(promotion.mode==='automatic'?'automatic':'verified'),
      effectiveTotal:conditional?null:effective,
      projectedTotal:effective,
      savings,
      itemDiscount:money(itemDiscount),
      shippingDiscount:money(shippingDiscount),
      reason:rules.reason,
      promotion
    };
  }

  function bestForOffer(product,offer,context={}){
    const evaluations=(offer?.promotions||[]).map(p=>evaluate(product,offer,p,context)).filter(x=>x.eligible);
    const applicable=evaluations.filter(x=>x.effectiveTotal!==null).sort((a,b)=>a.effectiveTotal-b.effectiveTotal||b.savings-a.savings);
    const conditional=evaluations.filter(x=>x.effectiveTotal===null).sort((a,b)=>b.savings-a.savings);
    return applicable[0]||conditional[0]||null;
  }

  function decorateOffer(product,offer,context={}){
    const regular=regularTotal(offer);const best=bestForOffer(product,offer,context);
    const effective=best?.effectiveTotal??regular;
    return {...offer,regularTotal:regular,effectiveTotal:effective,promotionEvaluation:best,promotionSavings:best?.effectiveTotal!==null?best.savings:0};
  }

  function rankOffers(product,offers,context={}){
    return (offers||[]).map(offer=>decorateOffer(product,offer,context)).sort((a,b)=>(a.effectiveTotal??Infinity)-(b.effectiveTotal??Infinity)||(a.regularTotal??Infinity)-(b.regularTotal??Infinity)||(Number(a.deliveryDays)||99)-(Number(b.deliveryDays)||99));
  }

  return {regularTotal,ruleMatch,evaluate,bestForOffer,decorateOffer,rankOffers};
});
