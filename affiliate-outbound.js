'use strict';
(function(root){
  if(!root||!root.document)return;
  const doc=root.document;
  const getConfig=()=>root.FundBlickAffiliateConfig||{};
  const getConsent=()=>root.FundBlickAffiliateConsent?.state?.()||{decision:null,trackingAllowed:false};
  const getPolicy=()=>root.FundBlickAffiliateLinkPolicy;
  function offerFromElement(el){
    return {
      directUrl:el.dataset.offerDirectUrl||null,
      affiliateUrl:el.dataset.offerAffiliateUrl||null,
      network:el.dataset.offerNetwork||el.dataset.affiliateNetwork||null,
      simulated:el.dataset.offerSimulated==='true'
    };
  }
  function resolveElement(el){
    const policy=getPolicy();
    if(!policy)return {allowed:false,mode:'blocked',url:null,reason:'policy-unavailable'};
    return policy.resolve(offerFromElement(el),getConfig(),getConsent());
  }
  function applyElement(el){
    const result=resolveElement(el);
    el.dataset.linkMode=result.mode;
    el.dataset.linkReason=result.reason;
    if(result.network)el.dataset.resolvedAffiliateNetwork=result.network;
    if(result.allowed&&result.url){
      el.setAttribute('href',result.url);
      el.setAttribute('target','_blank');
      const sponsored=result.mode==='affiliate'||result.mode==='affiliate-no-track';
      el.setAttribute('rel',sponsored?'sponsored noopener noreferrer':'noopener noreferrer');
      el.removeAttribute('aria-disabled');
    }else{
      el.removeAttribute('href');
      el.removeAttribute('target');
      el.setAttribute('aria-disabled','true');
    }
    return result;
  }
  function refresh(){doc.querySelectorAll('[data-affiliate-link]').forEach(applyElement);}
  doc.addEventListener('click',event=>{
    const link=event.target.closest?.('[data-affiliate-link]');
    if(!link)return;
    const result=applyElement(link);
    if(result.allowed)return;
    event.preventDefault();
    if(result.reason==='consent-required')root.FundBlickAffiliateConsent?.openSettings?.();
  });
  root.addEventListener('fundblick:affiliate-consent',refresh);
  root.addEventListener('DOMContentLoaded',refresh,{once:true});
  refresh();
  root.FundBlickAffiliateOutbound={refresh,applyElement,resolveElement};
})(typeof window!=='undefined'?window:null);
