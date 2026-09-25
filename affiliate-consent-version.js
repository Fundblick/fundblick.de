'use strict';
(function(root){
  if(!root||!root.document)return;
  const config=root.FundBlickAffiliateConfig;
  if(!config?.adcell)return;
  const adcell=config.adcell;
  const decisionKey=adcell.consentStorageKey||'fundblick-adcell-consent-v1';
  const metaKey=`${decisionKey}:meta`;
  const currentVersion=String(adcell.consentVersion||'1');
  const read=key=>{try{return root.localStorage?.getItem(key)||null}catch{return null}};
  const remove=key=>{try{root.localStorage?.removeItem(key)}catch{}};
  const write=(key,value)=>{try{root.localStorage?.setItem(key,value)}catch{}};
  function parseMeta(raw){try{const value=JSON.parse(raw||'null');return value&&typeof value==='object'?value:null}catch{return null;}}
  const storedDecision=read(decisionKey);
  const meta=parseMeta(read(metaKey));
  if(storedDecision&&(meta?.version!==currentVersion||meta?.decision!==storedDecision)){
    remove(decisionKey);
    remove(metaKey);
  }
  root.addEventListener('fundblick:affiliate-consent',event=>{
    const decision=event?.detail?.decision;
    if(decision!=='granted'&&decision!=='denied')return;
    write(metaKey,JSON.stringify({decision,version:currentVersion,savedAt:new Date().toISOString(),network:'ADCELL'}));
  });
  root.FundBlickAffiliateConsentVersion={decisionKey,metaKey,currentVersion};
})(typeof window!=='undefined'?window:null);
