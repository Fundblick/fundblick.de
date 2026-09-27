'use strict';
(function(){
  const params=new URLSearchParams(location.search);
  if(params.get('externalPack')!=='1')return;
  const api=window.FundBlickExternalSearch;
  if(!api||typeof api.registerProvider!=='function')return;

  const packUrl='development/external-query-pack-fixture.json';

  async function loadPack(){
    const response=await fetch(packUrl,{cache:'no-store'});
    if(!response.ok)throw new Error(`external query pack load failed: ${response.status}`);
    const pack=await response.json();
    if(pack?.schemaVersion!==1)throw new Error('unsupported external query pack schema');
    if(pack?.publishable!==false)throw new Error('development pack must be non-publishable');
    if(!Array.isArray(pack?.items))throw new Error('external query pack items missing');
    return pack;
  }

  let cache=null;
  api.registerProvider({
    id:'development-query-pack',
    async search(query){
      cache=cache||await loadPack();
      if(String(cache.query||'').trim().toLocaleLowerCase()!==String(query||'').trim().toLocaleLowerCase())return [];
      return cache.items.map(item=>({...item,provider:'development-query-pack'}));
    }
  });
  api.evaluate?.();
})();
