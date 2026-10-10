'use strict';
const {allowedUrl,consentTargets}=require('./destination-link-health.js');
const identities=Object.freeze({casaMoro:'31431',ahipos:'120341',anthbot:'125144',amazgifts:'87569',blazevideo:'25962',deluxehomeart:'120411',sirui:'128645'});
function structureContext(context){
 const routeBindings=new Map();
 for(const product of context.products){
  for(const offer of [product,...(Array.isArray(product.offers)?product.offers:[product.bestOffer||product])]){
   if(!offer.affiliateUrl||!offer.directUrl)continue;
   for(const route of [{mode:'affiliate',url:offer.affiliateUrl},...consentTargets(product,offer).filter(t=>t.mode==='affiliate')]){const entries=routeBindings.get(route.url)||[];entries.push({product,offer});routeBindings.set(route.url,entries);}
  }
 }
 return {...context,routeBindings};
}
function validateStructure(target,context){
 const {key,policy,routeBindings}=context.routeBindings?context:structureContext(context);

 const advertiser=identities[key];
 if(!advertiser)throw Error('missing-verified-advertiser-identity');
 const u=allowedUrl(target.url,policy.affiliateHosts);
 for(const name of ['a','m','p','awinmid','awinaffid','ued','cons'])if(u.searchParams.getAll(name).length>1)throw Error('duplicate-tracking-parameter');
 const cread=u.pathname==='/cread.php',pclick=u.pathname==='/pclick.php';
 if(!cread&&!pclick)throw Error('unsupported-affiliate-format');
 if(u.searchParams.get(cread?'awinmid':'m')!==advertiser||u.searchParams.get(cread?'awinaffid':'a')!=='3106259')throw Error('wrong-publisher-or-advertiser');
 if(u.searchParams.has('cons')&&!['0','1'].includes(u.searchParams.get('cons')))throw Error('invalid-consent-signal');
 const bindings=[];
 for(const {product,offer} of routeBindings.get(target.url)||[]){
   allowedUrl(offer.directUrl,policy.merchantHosts);
   if(cread){if(u.searchParams.get('ued')!==offer.directUrl)throw Error('embedded-product-or-variant-mismatch');}
   else {const id=String(offer.rawAttributes?.awinProductId||product.rawAttributes?.awinProductId||offer.awinProductId||'');if(!id||u.searchParams.get('p')!==id)throw Error('missing-or-wrong-feed-product-identity');}
   bindings.push({productId:product.id,directUrl:offer.directUrl});
 }
 if(!bindings.length)throw Error('unbound-affiliate-route');
 return {kind:'offline-affiliate-structure',advertiserId:advertiser,publisherId:'3106259',bindings};
}
function auditStructure(target,context){try{return {...target,status:'pass',checkedAt:new Date().toISOString(),...validateStructure(target,context)};}catch(e){return {...target,status:'fail',checkedAt:new Date().toISOString(),kind:'offline-affiliate-structure',reason:e.message};}}
module.exports={structureContext,validateStructure,auditStructure};
