'use strict';
(function(){
  const host=document.querySelector('#amazon-refinements');
  const api=window.FundBlickExternalSearch;
  if(!host||!api)return;

  const t=window.FundBlickExternalI18n||{};
  const labels={
    de:{title:'Amazon-Suche verfeinern',reset:'Amazon-Filter zurücksetzen'},
    en:{title:'Refine Amazon search',reset:'Reset Amazon filters'},
    ru:{title:'Уточнить поиск Amazon',reset:'Сбросить фильтры Amazon'}
  };
  const params=new URLSearchParams(location.search);
  const rawLang=params.get('lang')||document.documentElement.lang||'de';
  const copy=labels[rawLang]||labels[rawLang.split('-')[0]]||labels.en;
  let refinements=[];
  window.FundBlickAmazonRefinementState=window.FundBlickAmazonRefinementState||{searchIndex:'',browseNodeId:'',brand:''};

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
  const state=()=>window.FundBlickAmazonRefinementState;
  const valueKey=refinement=>{
    if(refinement.type==='searchIndex')return 'searchIndex';
    if(refinement.type==='browseNode')return 'browseNodeId';
    if(String(refinement.id||'').toLowerCase()==='brand')return 'brand';
    return '';
  };

  function render(){
    const supported=refinements.map(r=>({...r,key:valueKey(r)})).filter(r=>r.key&&Array.isArray(r.bins)&&r.bins.length);
    if(!supported.length){host.hidden=true;host.innerHTML='';return}
    const active=state();
    host.hidden=false;
    host.innerHTML=`<div class="amazon-refinement-head"><strong>${esc(copy.title)}</strong><button type="button" id="amazon-refinement-reset">${esc(copy.reset||t.reset||'Reset')}</button></div><div class="amazon-refinement-groups">${supported.map(group=>`<fieldset class="amazon-refinement-group"><legend>${esc(group.displayName)}</legend><div class="amazon-refinement-options">${group.bins.slice(0,12).map(bin=>`<button type="button" class="amazon-refinement-chip${active[group.key]===bin.id?' is-active':''}" data-amazon-refinement-key="${esc(group.key)}" data-amazon-refinement-value="${esc(bin.id)}">${esc(bin.displayName)}</button>`).join('')}</div></fieldset>`).join('')}</div>`;
    bind();
  }

  function bind(){
    host.querySelectorAll('[data-amazon-refinement-key]').forEach(button=>button.addEventListener('click',async()=>{
      const key=button.dataset.amazonRefinementKey;
      const value=button.dataset.amazonRefinementValue||'';
      const next={...state(),[key]:state()[key]===value?'':value};
      if(key==='searchIndex'){next.browseNodeId='';next.brand=''}
      if(key==='browseNodeId')next.brand='';
      window.FundBlickAmazonRefinementState=next;
      render();
      await api.evaluate?.();
    }));
    host.querySelector('#amazon-refinement-reset')?.addEventListener('click',async()=>{
      window.FundBlickAmazonRefinementState={searchIndex:'',browseNodeId:'',brand:''};
      render();
      await api.evaluate?.();
    });
  }

  window.addEventListener('fundblick:amazon-refinements',event=>{
    refinements=Array.isArray(event.detail?.refinements)?event.detail.refinements:[];
    render();
  });

  window.FundBlickAmazonRefinementUI={render,getState:()=>({...state()})};
})();
