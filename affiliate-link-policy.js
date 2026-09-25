'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.FundBlickAffiliateLinkPolicy=api;
})(typeof window!=='undefined'?window:null,function(){
  const ALLOWED_PROTOCOLS=new Set(['http:','https:']);
  const cleanUrl=value=>{
    if(!value)return null;
    try{
      const url=new URL(String(value),typeof location!=='undefined'?location.href:'https://fundblick.de/');
      if(!ALLOWED_PROTOCOLS.has(url.protocol))return null;
      return url.href;
    }catch{return null;}
  };
  const normalizeDecision=value=>value==='granted'||value==='denied'?value:null;
  function trackingAllowed(config,consent){
    const decision=typeof consent==='string'?normalizeDecision(consent):normalizeDecision(consent?.decision);
    return Boolean(config?.adcell?.enabled&&config?.adcell?.outboundEnabled&&config?.adcell?.trackingEnabled&&decision==='granted');
  }
  function directUrl(offer={}){
    return cleanUrl(offer.directUrl||offer.merchantUrl||offer.destinationUrl||(offer.urlType==='direct'?offer.url:null));
  }
  function affiliateUrl(offer={}){
    return cleanUrl(offer.affiliateUrl||offer.trackingUrl||offer.publisherUrl||(offer.urlType==='affiliate'?offer.url:null));
  }
  function resolve(offer={},config={},consent=null){
    if(offer?.simulated===true)return {allowed:false,mode:'simulated',url:null,reason:'simulated-offer'};
    const direct=directUrl(offer);
    const affiliate=affiliateUrl(offer);
    const canTrack=trackingAllowed(config,consent);
    if(canTrack&&affiliate)return {allowed:true,mode:'affiliate',url:affiliate,reason:'consented-affiliate'};
    if(direct)return {allowed:true,mode:'direct',url:direct,reason:canTrack?'no-affiliate-url':'tracking-not-consented'};
    if(affiliate)return {allowed:false,mode:'blocked',url:null,reason:'consent-required'};
    return {allowed:false,mode:'blocked',url:null,reason:'missing-safe-url'};
  }
  return {ALLOWED_PROTOCOLS,cleanUrl,trackingAllowed,directUrl,affiliateUrl,resolve};
});
