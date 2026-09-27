'use strict';
(function(){
  const host=document.querySelector('#amazon-refinements');
  const query=document.querySelector('#query');
  const api=window.FundBlickExternalSearch;
  if(!host||!api)return;

  const t=window.FundBlickExternalI18n||{};
  const title=`Amazon · ${String(t.filters||'Refine search')}`;
  const resetLabel=String(t.reset||'Reset filters');
  const URL_KEYS={searchIndex:'amazonSearchIndex',browseNodeId:'amazonBrowseNode',brand:'amazonBrand'};
  let refinements=[];

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim().slice(0,160);
  const cleanStateValue=(value,max)=>clean(value).slice(0,max);
  const emptyState=()=>({searchIndex:'',browseNodeId:'',brand:''});
  const readUrlState=()=>{
    const params=new URLSearchParams(location.search);
    return {
      searchIndex:cleanStateValue(params.get(URL_KEYS.searchIndex),64),
      browseNodeId:cleanStateValue(params.get(URL_KEYS.browseNodeId),64),
      brand:cleanStateValue(params.get(URL_KEYS.brand),100)
    };
  };
  const normalizeState=raw=>({
    searchIndex:cleanStateValue(raw?.searchIndex,64),
    browseNodeId:cleanStateValue(raw?.browseNodeId,64),
    brand:cleanStateValue(raw?.brand,100)
  });

  window.FundBlickAmazonRefinementState=normalizeState(window.FundBlickAmazonRefinementState||readUrlState());

  const state=()=>window.FundBlickAmazonRefinementState;
  const hasActive=()=>Object.values(state()).some(Boolean);
  const valueKey=refinement=>{
    if(refinement.type==='searchIndex')return 'searchIndex';
    if(refinement.type==='browseNode')return 'browseNodeId';
    if(String(refinement.id||'').toLowerCase()==='brand')return 'brand';
    return '';
  };

  function syncUrl(mode='replace'){
    const url=new URL(location.href);
    const active=state();
    for(const [key,param] of Object.entries(URL_KEYS)){
      if(active[key])url.searchParams.set(param,active[key]);
      else url.searchParams.delete(param);
    }
    const next=url.pathname+url.search+url.hash;
    if(mode==='push')history.pushState({fundblickAmazonRefinement:true},'',next);
    else history.replaceState(history.state,'',next);
  }

  function setState(next,{historyMode='replace'}={}){
    window.FundBlickAmazonRefinementState=normalizeState(next);
    syncUrl(historyMode);
  }

  function resetState({keepUi=false,historyMode='replace'}={}){
    setState(emptyState(),{historyMode});
    if(!keepUi)refinements=[];
    render();
  }

  function render(){
    const supported=refinements.map(r=>({...r,key:valueKey(r)})).filter(r=>r.key&&Array.isArray(r.bins)&&r.bins.length);
    if(!supported.length&&!hasActive()){host.hidden=true;host.innerHTML='';return}
    const active=state();
    host.hidden=false;
    host.innerHTML=`<div class="amazon-refinement-head"><strong>${esc(title)}</strong><button type="button" id="amazon-refinement-reset">${esc(resetLabel)}</button></div>${supported.length?`<div class="amazon-refinement-groups">${supported.map(group=>`<fieldset class="amazon-refinement-group"><legend>${esc(group.displayName)}</legend><div class="amazon-refinement-options">${group.bins.slice(0,12).map(bin=>{const selected=active[group.key]===bin.id;return `<button type="button" aria-pressed="${selected?'true':'false'}" class="amazon-refinement-chip${selected?' is-active':''}" data-amazon-refinement-key="${esc(group.key)}" data-amazon-refinement-value="${esc(bin.id)}">${esc(bin.displayName)}</button>`}).join('')}</div></fieldset>`).join('')}</div>`:''}`;
    bind();
  }

  function bind(){
    host.querySelectorAll('[data-amazon-refinement-key]').forEach(button=>button.addEventListener('click',async()=>{
      const key=button.dataset.amazonRefinementKey;
      const value=button.dataset.amazonRefinementValue||'';
      const next={...state(),[key]:state()[key]===value?'':value};
      if(key==='searchIndex'){next.browseNodeId='';next.brand=''}
      if(key==='browseNodeId')next.brand='';
      setState(next,{historyMode:'push'});
      render();
      await api.evaluate?.();
    }));
    host.querySelector('#amazon-refinement-reset')?.addEventListener('click',async()=>{
      resetState({keepUi:true,historyMode:'push'});
      await api.evaluate?.();
    });
  }

  window.addEventListener('fundblick:amazon-refinements',event=>{
    const eventQuery=clean(event.detail?.baseQuery);
    const currentQuery=clean(query?.value);
    if(eventQuery&&eventQuery!==currentQuery)return;
    refinements=Array.isArray(event.detail?.refinements)?event.detail.refinements:[];
    render();
  });

  window.addEventListener('fundblick:external-provider',event=>{
    const provider=String(event.detail?.provider||'');
    const status=String(event.detail?.status||'');
    if(provider==='amazon-creators-api-relay'&&(status==='error'||status==='timeout'))resetState();
  });

  window.addEventListener('fundblick:external-search',event=>{
    if(event.detail?.used===false)resetState();
  });

  query?.addEventListener('input',()=>{
    if(hasActive()||refinements.length)resetState();
  });

  window.addEventListener('popstate',async()=>{
    window.FundBlickAmazonRefinementState=readUrlState();
    refinements=[];
    render();
    await api.evaluate?.();
  });

  if(hasActive())syncUrl('replace');
  window.FundBlickAmazonRefinementUI={render,reset:resetState,getState:()=>({...state()}),readUrlState};
})();
