'use strict';
(function(root,factory){
  const config=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=config;
  if(root)root.FundBlickAffiliateConfig=config;
})(typeof window!=='undefined'?window:null,function(){
  return Object.freeze({
    version:1,
    network:'ADCELL',
    adcell:Object.freeze({
      enabled:false,
      trackingEnabled:false,
      liveDisclosure:false,
      vendorId:766,
      consentVersion:'2026-09-25',
      consentStorageKey:'fundblick-adcell-consent-v1',
      privacyUrl:'https://www.adcell.de/datenschutz'
    })
  });
});
