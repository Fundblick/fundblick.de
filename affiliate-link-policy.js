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
  const normalizeNetwork=(value,config={})=>{
    const candidate=String(value||config.defaultNetwork||'adcell').trim().toLowerCase();
    return config?.[candidate]?candidate:'adcell';
  };
  function trackingAllowed(config,consent,network='adcell'){
    const decision=typeof consent==='string'?normalizeDecision(consent):normalizeDecision(consent?.decision);
    const key=normalizeNetwork(network,config);
    const provider=config?.[key];
    return Boolean(provider?.enabled&&provider?.outboundEnabled&&provider?.trackingEnabled&&decision==='granted');
  }
  function directUrl(offer={}){
    return cleanUrl(offer.directUrl||offer.merchantUrl||offer.destinationUrl||(offer.urlType==='direct'?offer.url:null));
  }
  function affiliateUrl(offer={}){
    return cleanUrl(offer.affiliateUrl||offer.trackingUrl||offer.publisherUrl||(offer.urlType==='affiliate'?offer.url:null));
  }
  function withConsentSignal(url,network,consent,config={}){
    const cleaned=cleanUrl(url);if(!cleaned)return null;
    const decision=typeof consent==='string'?normalizeDecision(consent):normalizeDecision(consent?.decision);
    if(network!=='awin'||decision!=='granted')return cleaned;
    try{
      const parsed=new URL(cleaned);
      parsed.searchParams.set(config?.awin?.consentParam||'cons','1');
      return parsed.href;
    }catch{return cleaned;}
  }
  function resolve(offer={},config={},consent=null){
    if(offer?.simulated===true)return {allowed:false,mode:'simulated',url:null,reason:'simulated-offer',network:null};
    const network=normalizeNetwork(offer.network||offer.affiliateNetwork||offer.networkName,config);
    const direct=directUrl(offer);
    const affiliate=affiliateUrl(offer);
    const canTrack=trackingAllowed(config,consent,network);
    if(canTrack&&affiliate)return {allowed:true,mode:'affiliate',url:withConsentSignal(affiliate,network,consent,config),reason:'consented-affiliate',network};
    if(direct)return {allowed:true,mode:'direct',url:direct,reason:canTrack?'no-affiliate-url':'tracking-not-consented',network};
    if(affiliate)return {allowed:false,mode:'blocked',url:null,reason:'consent-required',network};
    return {allowed:false,mode:'blocked',url:null,reason:'missing-safe-url',network};
  }
  return {ALLOWED_PROTOCOLS,cleanUrl,normalizeDecision,normalizeNetwork,trackingAllowed,directUrl,affiliateUrl,withConsentSignal,resolve};
});
