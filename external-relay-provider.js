'use strict';
(function(){
  const params=new URLSearchParams(location.search);
  const cfg=window.FundBlickExternalRelayConfig||{};
  const api=window.FundBlickExternalSearch;
  if(!api||typeof api.registerProvider!=='function')return;

  const mock=params.get('externalRelayMock')==='1';
  const enabled=(cfg.enabled===true||mock)&&cfg.provider==='cloudflare-workers-free-relay';
  const endpoint=mock?'http://127.0.0.1:4173/__mock_external_relay__':String(cfg.endpoint||'').trim();
  if(!enabled||!endpoint)return;

  function safeEndpoint(value){
    try{
      const url=new URL(value,location.href);
      if(!/^https?:$/.test(url.protocol))return '';
      if(!mock&&url.protocol!=='https:')return '';
      return url.href.replace(/\/$/,'');
    }catch{return ''}
  }

  const base=safeEndpoint(endpoint);
  if(!base)return;

  api.registerProvider({
    id:'cloudflare-workers-free-relay',
    tier:Number(cfg.tier)||10,
    timeoutMs:Number(cfg.timeoutMs)||2200,
    async search(query,context={}){
      const url=new URL(base+'/search');
      url.searchParams.set('q',String(query||'').trim());
      url.searchParams.set('limit',String(Math.min(Math.max(Number(context.limit||24),1),24)));
      const response=await fetch(url,{method:'GET',headers:{accept:'application/json'},cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
      if(!response.ok)throw new Error(`external relay ${response.status}`);
      const data=await response.json();
      if(data?.schemaVersion!==1||!Array.isArray(data?.items))throw new Error('external relay schema mismatch');
      return data.items;
    }
  });
  api.evaluate?.();
})();
