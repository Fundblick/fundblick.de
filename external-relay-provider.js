'use strict';
(function(){
  const params=new URLSearchParams(location.search);
  const cfg=window.FundBlickExternalRelayConfig||{};
  const api=window.FundBlickExternalSearch;
  if(!api||typeof api.registerProvider!=='function')return;

  const routes=Array.isArray(cfg.routes)?cfg.routes:[];
  const amazonMock=params.get('externalAmazonRelayMock')==='1';
  const ebayMock=params.get('externalEbayRelayMock')==='1';
  const legacyMock=params.get('externalRelayMock')==='1';

  function safeEndpoint(value,isMock){
    try{
      const url=new URL(value,location.href);
      if(!/^https?:$/.test(url.protocol))return '';
      if(!isMock&&url.protocol!=='https:')return '';
      return url.href.replace(/\/$/,'');
    }catch{return ''}
  }

  function registerRoute(route){
    if(!route?.id||!route?.upstreamProvider)return;
    const isAmazon=route.upstreamProvider==='amazon-creators-api';
    const isEbay=route.upstreamProvider==='ebay-browse';
    const mock=isAmazon?amazonMock:(isEbay?(ebayMock||legacyMock):false);
    const enabled=(cfg.enabled===true||mock);
    if(!enabled)return;

    const mockEndpoint=isAmazon
      ?'http://127.0.0.1:4173/__mock_amazon_relay__'
      :'http://127.0.0.1:4173/__mock_ebay_relay__';
    const endpoint=mock?mockEndpoint:String(route.endpoint||'').trim();
    const base=safeEndpoint(endpoint,mock);
    if(!base)return;

    api.registerProvider({
      id:String(route.id),
      tier:Number(route.tier)||100,
      timeoutMs:Number(route.timeoutMs)||2200,
      async search(query,context={}){
        const url=new URL(base+'/search');
        url.searchParams.set('q',String(query||'').trim());
        const maxLimit=Math.min(Math.max(Number(route.maxLimit||24),1),24);
        url.searchParams.set('limit',String(Math.min(Math.max(Number(context.limit||maxLimit),1),maxLimit)));
        const response=await fetch(url,{method:'GET',headers:{accept:'application/json'},cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
        if(!response.ok)throw new Error(`${route.upstreamProvider} relay ${response.status}`);
        const data=await response.json();
        if(data?.schemaVersion!==1||!Array.isArray(data?.items))throw new Error(`${route.upstreamProvider} relay schema mismatch`);
        if(data?.provider&&data.provider!==route.upstreamProvider)throw new Error(`${route.upstreamProvider} relay provider mismatch`);
        return data.items;
      }
    });
  }

  routes.forEach(registerRoute);
  api.evaluate?.();
})();
