'use strict';
(function(){
  const host=document.querySelector('#amazon-refinements');
  const query=document.querySelector('#query');
  const api=window.FundBlickExternalSearch;
  if(!host||!api)return;

  const t=window.FundBlickExternalI18n||{};
  const title=`Amazon · ${String(t.filters||'Refine search')}`;
  const resetLabel=String(t.reset||'Reset filters');
  const applyLabel=String(t.apply||'Apply');
  const priceLabel=String(t.price||'Price');
  const fromLabel=String(t.from||'From');
  const toLabel=String(t.to||'To');
  const sortLabel=String(document.querySelector('label[for="sort"] span')?.textContent||'Sort');
  const pageSort=document.querySelector('#sort');
  const sortText=value=>String(pageSort?.querySelector(`option[value="${value}"]`)?.textContent||'').trim();
  const URL_KEYS={
    searchIndex:'amazonSearchIndex',browseNodeId:'amazonBrowseNode',brand:'amazonBrand',
    minPrice:'amazonMinPrice',maxPrice:'amazonMaxPrice',minRating:'amazonMinRating',sortBy:'amazonSort'
  };
  const SORT_MAP={relevance:'Relevance','price-asc':'Price:LowToHigh','price-desc':'Price:HighToLow'};
  const SORT_ALLOWED=new Set(Object.values(SORT_MAP));
  let refinements=[];
  let amazonEmpty=false;
  let pagination={...(window.FundBlickAmazonPaginationState||{page:1,total:0,loaded:0,canLoadMore:false})};

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim().slice(0,160);
  const cleanStateValue=(value,max)=>clean(value).slice(0,max);
  const cleanPrice=value=>{
    const raw=String(value??'').replace(',','.').trim();
    if(!raw)return '';
    const n=Number(raw);
    return Number.isFinite(n)&&n>=0&&n<=1000000?String(Math.round(n*100)/100):'';
  };
  const cleanRating=value=>{
    const n=Number(value);
    return Number.isInteger(n)&&n>=1&&n<=4?String(n):'';
  };
  const cleanSort=value=>SORT_ALLOWED.has(String(value||''))?String(value):'';
  const normalizePriceRange=(minPrice,maxPrice)=>{
    let min=cleanPrice(minPrice),max=cleanPrice(maxPrice);
    if(min&&max&&Number(min)>Number(max))[min,max]=[max,min];
    return {minPrice:min,maxPrice:max};
  };
  const emptyState=()=>({searchIndex:'',browseNodeId:'',brand:'',minPrice:'',maxPrice:'',minRating:'',sortBy:''});
  const normalizeState=raw=>{
    const range=normalizePriceRange(raw?.minPrice,raw?.maxPrice);
    return {
      searchIndex:cleanStateValue(raw?.searchIndex,64),
      browseNodeId:cleanStateValue(raw?.browseNodeId,64),
      brand:cleanStateValue(raw?.brand,100),
      minPrice:range.minPrice,
      maxPrice:range.maxPrice,
      minRating:cleanRating(raw?.minRating),
      sortBy:cleanSort(raw?.sortBy)
    };
  };
  const readUrlState=()=>{
    const params=new URLSearchParams(location.search);
    return normalizeState({
      searchIndex:params.get(URL_KEYS.searchIndex),
      browseNodeId:params.get(URL_KEYS.browseNodeId),
      brand:params.get(URL_KEYS.brand),
      minPrice:params.get(URL_KEYS.minPrice),
      maxPrice:params.get(URL_KEYS.maxPrice),
      minRating:params.get(URL_KEYS.minRating),
      sortBy:params.get(URL_KEYS.sortBy)
    });
  };

  window.FundBlickAmazonRefinementState=normalizeState(window.FundBlickAmazonRefinementState||readUrlState());

  const state=()=>window.FundBlickAmazonRefinementState;
  const hasActive=()=>Object.values(state()).some(Boolean);
  const valueKey=refinement=>{
    if(refinement.type==='searchIndex')return 'searchIndex';
    if(refinement.type==='browseNode')return 'browseNodeId';
    if(String(refinement.id||'').toLowerCase()==='brand')return 'brand';
    return '';
  };

  function resetPagination(){
    window.FundBlickExternalRelay?.resetAmazonPagination?.();
    pagination={page:1,total:0,loaded:0,canLoadMore:false};
    window.FundBlickAmazonPaginationState={...pagination};
  }

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

  function setState(next,{historyMode='replace',resetPage=true}={}){
    window.FundBlickAmazonRefinementState=normalizeState(next);
    amazonEmpty=false;
    if(resetPage)resetPagination();
    syncUrl(historyMode);
  }

  function resetState({keepUi=false,historyMode='replace'}={}){
    setState(emptyState(),{historyMode,resetPage:true});
    if(!keepUi)refinements=[];
    render();
  }

  function advancedControls(active){
    const relevance=sortText('relevance')||'Relevance';
    const priceAsc=sortText('price-asc')||'Price: low to high';
    const priceDesc=sortText('price-desc')||'Price: high to low';
    return `<fieldset class="amazon-refinement-advanced"><legend>${esc(priceLabel)} · ★ · ${esc(sortLabel)}</legend><div class="amazon-refinement-advanced-grid"><label>${esc(fromLabel)}<input id="amazon-min-price" type="number" min="0" step="0.01" inputmode="decimal" value="${esc(active.minPrice)}"></label><label>${esc(toLabel)}<input id="amazon-max-price" type="number" min="0" step="0.01" inputmode="decimal" value="${esc(active.maxPrice)}"></label><label>★<select id="amazon-min-rating"><option value="">–</option>${[1,2,3,4].map(n=>`<option value="${n}" ${active.minRating===String(n)?'selected':''}>${n}+ ★</option>`).join('')}</select></label><label>${esc(sortLabel)}<select id="amazon-sort"><option value="">${esc(relevance)}</option><option value="Price:LowToHigh" ${active.sortBy==='Price:LowToHigh'?'selected':''}>${esc(priceAsc)}</option><option value="Price:HighToLow" ${active.sortBy==='Price:HighToLow'?'selected':''}>${esc(priceDesc)}</option></select></label><button type="button" id="amazon-advanced-apply">${esc(applyLabel)}</button></div></fieldset>`;
  }

  function paginationControls(){
    if(!pagination.canLoadMore)return '';
    const target=Math.min(Number(pagination.total||0),Number(window.FundBlickExternalRelay?.visibleLimit||24));
    return `<div class="amazon-pagination"><span>${Number(pagination.loaded||0)} / ${target}</span><button type="button" id="amazon-load-more">Amazon +10</button></div>`;
  }

  function render(){
    const supported=refinements.map(r=>({...r,key:valueKey(r)})).filter(r=>r.key&&Array.isArray(r.bins)&&r.bins.length);
    if(!supported.length&&!hasActive()&&!pagination.canLoadMore){host.hidden=true;host.innerHTML='';return}
    const active=state();
    host.hidden=false;
    const emptyNotice=amazonEmpty&&hasActive()?`<div class="amazon-refinement-empty" role="status"><strong>Amazon · 0</strong><span>${esc(resetLabel)}</span></div>`:'';
    host.innerHTML=`<div class="amazon-refinement-head"><strong>${esc(title)}</strong><button type="button" id="amazon-refinement-reset">${esc(resetLabel)}</button></div>${emptyNotice}${advancedControls(active)}${supported.length?`<div class="amazon-refinement-groups">${supported.map(group=>`<fieldset class="amazon-refinement-group"><legend>${esc(group.displayName)}</legend><div class="amazon-refinement-options">${group.bins.slice(0,12).map(bin=>`<button type="button" class="amazon-refinement-chip${active[group.key]===bin.id?' is-active':''}" aria-pressed="${active[group.key]===bin.id?'true':'false'}" data-amazon-refinement-key="${esc(group.key)}" data-amazon-refinement-value="${esc(bin.id)}">${esc(bin.displayName)}</button>`).join('')}</div></fieldset>`).join('')}</div>`:''}${paginationControls()}`;
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
    host.querySelector('#amazon-advanced-apply')?.addEventListener('click',async()=>{
      const next={
        ...state(),
        minPrice:host.querySelector('#amazon-min-price')?.value||'',
        maxPrice:host.querySelector('#amazon-max-price')?.value||'',
        minRating:host.querySelector('#amazon-min-rating')?.value||'',
        sortBy:host.querySelector('#amazon-sort')?.value||''
      };
      setState(next,{historyMode:'push'});
      render();
      await api.evaluate?.();
    });
    host.querySelector('#amazon-refinement-reset')?.addEventListener('click',async()=>{
      resetState({keepUi:true,historyMode:'push'});
      await api.evaluate?.();
    });
    host.querySelector('#amazon-load-more')?.addEventListener('click',async()=>{
      const nextPage=Math.min(Number(pagination.page||1)+1,10);
      pagination={...pagination,page:nextPage,canLoadMore:false};
      window.FundBlickAmazonPaginationState={...pagination};
      render();
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

  window.addEventListener('fundblick:amazon-search-status',event=>{
    const eventQuery=clean(event.detail?.baseQuery);
    const currentQuery=clean(query?.value);
    if(eventQuery&&eventQuery!==currentQuery)return;
    amazonEmpty=event.detail?.hasActive===true&&Number(event.detail?.itemCount||0)===0;
    render();
  });

  window.addEventListener('fundblick:amazon-pagination',event=>{
    pagination={
      page:Math.max(1,Math.min(Number(event.detail?.page||1),10)),
      total:Math.max(0,Number(event.detail?.total||0)),
      loaded:Math.max(0,Number(event.detail?.loaded||0)),
      canLoadMore:event.detail?.canLoadMore===true
    };
    window.FundBlickAmazonPaginationState={...pagination};
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
    if(hasActive()||refinements.length||pagination.page>1)resetState();
  });

  window.addEventListener('popstate',async()=>{
    window.FundBlickAmazonRefinementState=readUrlState();
    refinements=[];
    amazonEmpty=false;
    resetPagination();
    render();
    await api.evaluate?.();
  });

  if(hasActive())syncUrl('replace');
  window.FundBlickAmazonRefinementUI={render,reset:resetState,getState:()=>({...state()}),readUrlState,normalizePriceRange,getPagination:()=>({...pagination})};
})();
