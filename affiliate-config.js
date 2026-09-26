'use strict';
(function(root,factory){
  const config=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=config;
  if(root)root.FundBlickAffiliateConfig=config;
})(typeof window!=='undefined'?window:null,function(){
  return Object.freeze({
    version:3,
    network:'MULTI',
    defaultNetwork:'adcell',
    mode:'prepared',
    consent:Object.freeze({
      version:'2026-09-26-v3',
      storageKey:'fundblick-affiliate-consent-v1'
    }),
    adcell:Object.freeze({
      enabled:false,
      outboundEnabled:false,
      trackingEnabled:false,
      liveDisclosure:false,
      vendorId:766,
      privacyUrl:'https://www.adcell.de/datenschutz'
    }),
    awin:Object.freeze({
      enabled:false,
      outboundEnabled:false,
      trackingEnabled:false,
      liveDisclosure:false,
      vendorId:907,
      consentParam:'cons',
      privacyUrl:'https://www.awin.com/de/datenschutzerklarung'
    })
  });
});
