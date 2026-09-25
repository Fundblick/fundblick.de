'use strict';
(function(root,factory){
  const config=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=config;
  if(root)root.FundBlickAffiliateConfig=config;
})(typeof window!=='undefined'?window:null,function(){
  return Object.freeze({
    version:2,
    network:'ADCELL',
    mode:'prepared',
    adcell:Object.freeze({
      enabled:false,
      outboundEnabled:false,
      trackingEnabled:false,
      liveDisclosure:false,
      vendorId:766,
      consentVersion:'2026-09-25-v2',
      consentStorageKey:'fundblick-adcell-consent-v1',
      privacyUrl:'https://www.adcell.de/datenschutz'
    })
  });
});
