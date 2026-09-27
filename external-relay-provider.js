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

  function cleanText(value,max=140){return String(value||'').replace(/\s+/g,' ').trim().slice(0,max)}

  function sanitizeRefinements(raw){
    if(!Array.isArray(raw))return [];
    return raw.slice(0,12).map(refinement=>{
      const id=cleanText(refinement?.id,64);
      const type=cleanText(refinement?.type,32);
      const displayName=cleanText(refinement?.displayName||id,100);
      const bins=Array.isArray(refinement?.bins)?refinement.bins.slice(0,50).map(bin=>({id:cleanText(bin?.id,100),displayName:cleanText(bin?.displayName||bin?.id,140)})).filter(bin=>bin.id&&bin.displayName):[];
      return id&&bins.length?{type,id,displayName,bins}:null;
    }).filter(Boolean);
  }

  function amazonRefinementState(){
    const raw=window.FundBlickAmazonRefinementState||{};
    return {
      searchIndex:cleanText(raw.searchIndex,64),
      browseNodeId:cleanText(raw.browseNodeId,64),
      brand:cleanText(raw.brand,100)
    };
  }

  function emitAmazonRefinements(route,data,baseQuery){
    if(route.upstreamProvider!=='amazon-creators-api')return;
    const refinements=sanitizeRefinements(data?.refinements);
    try{window.dispatchEvent(new CustomEvent('fundblick:amazon-refinements',{detail:{provider:'amazon-creators-api',marketplace:String(data?.marketplace||'www.amazon.de'),baseQuery:cleanText(baseQuery,160),refinements,active:amazonRefinementState()}}))}catch{}
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
        const baseQuery=cleanText(query,160);
        const url=new URL(base+'/search');
        url.searchParams.set('q',baseQuery);
        const maxLimit=Math.min(Math.max(Number(route.maxLimit||24),1),24);
        url.searchParams.set('limit',String(Math.min(Math.max(Number(context.limit||maxLimit),1),maxLimit)));
        if(isAmazon){
          const refinement=amazonRefinementState();
          if(refinement.searchIndex)url.searchParams.set('searchIndex',refinement.searchIndex);
          if(refinement.browseNodeId)url.searchParams.set('browseNodeId',refinement.browseNodeId);
          if(refinement.brand)url.searchParams.set('brand',refinement.brand);
        }
        const response=await fetch(url,{method:'GET',headers:{accept:'application/json'},cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
        if(!response.ok)throw new Error(`${route.upstreamProvider} relay ${response.status}`);
        const data=await response.json();
        if(data?.schemaVersion!==1||!Array.isArray(data?.items))throw new Error(`${route.upstreamProvider} relay schema mismatch`);
        if(data?.provider&&data.provider!==route.upstreamProvider)throw new Error(`${route.upstreamProvider} relay provider mismatch`);
        emitAmazonRefinements(route,data,baseQuery);
        return data.items;
      }
    });
  }

  window.FundBlickExternalRelay={sanitizeRefinements,amazonRefinementState};
  routes.forEach(registerRoute);
  api.evaluate?.();
})();
