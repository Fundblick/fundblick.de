'use strict';
(function(){
  const panel=document.getElementById('filter-panel');
  const sort=document.getElementById('sort');
  const chips=document.getElementById('chips');
  const heading=document.querySelector('.results-heading');
  const results=document.getElementById('results');
  if(!panel||!sort||!chips||!heading)return;
  const language=window.FundBlickLanguage||{translate:key=>key};
  const tx=key=>language.translate(key);
  const tools=document.createElement('div');tools.className='mobile-search-tools';tools.setAttribute('aria-label',tx('refine'));
  const filter=document.createElement('button');filter.type='button';filter.className='mobile-filter-toggle';filter.setAttribute('aria-controls','filter-panel');
  const filterText=document.createElement('span');filterText.textContent=tx('refine');
  const count=document.createElement('b');count.className='mobile-filter-count';count.hidden=true;
  filter.append(filterText,count);
  const sortButton=document.createElement('button');sortButton.type='button';sortButton.className='mobile-sort-toggle';sortButton.textContent='↕ '+tx('sort');
  tools.append(filter,sortButton);heading.insertAdjacentElement('afterend',tools);

  const actions=document.createElement('div');actions.className='mobile-filter-actions';
  const apply=document.createElement('button');apply.type='button';apply.className='mobile-filter-apply';
  actions.append(apply);panel.append(actions);

  const mq=matchMedia('(max-width:760px)');
  function activeCount(){return chips.querySelectorAll('button[data-remove]').length;}
  function visibleResultCount(){
    if(!results)return null;
    const cards=results.querySelectorAll('.result-card,.product-card,[data-product-id]');
    return cards.length||null;
  }
  function updateApply(){
    const n=activeCount();
    const r=visibleResultCount();
    apply.textContent=n?`${n} Filter anwenden${r!==null?` · ${r} Ergebnisse`:''}`:`Filter anwenden${r!==null?` · ${r} Ergebnisse`:''}`;
  }
  function updateExpanded(){filter.setAttribute('aria-expanded',String(panel.open));}
  function updateCount(){const n=activeCount();count.textContent=String(n);count.hidden=n===0;filter.setAttribute('aria-label',n?`${tx('refine')} · ${n}`:tx('refine'));updateApply();}
  function adapt(){if(mq.matches){if(!panel.dataset.mobileTouched)panel.open=false;}else{panel.open=true;delete panel.dataset.mobileTouched;}updateExpanded();}
  filter.addEventListener('click',()=>{panel.dataset.mobileTouched='1';panel.open=!panel.open;updateExpanded();if(panel.open)panel.scrollIntoView({behavior:'smooth',block:'start'});});
  apply.addEventListener('click',()=>{panel.dataset.mobileTouched='1';panel.open=false;updateExpanded();heading.scrollIntoView({behavior:'smooth',block:'start'});});
  panel.addEventListener('toggle',updateExpanded);
  sortButton.addEventListener('click',()=>{sort.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>sort.focus({preventScroll:true}),180);});
  const observer=new MutationObserver(updateCount);observer.observe(chips,{childList:true,subtree:true});
  if(results){const resultObserver=new MutationObserver(updateApply);resultObserver.observe(results,{childList:true,subtree:true});}
  mq.addEventListener?.('change',adapt);adapt();updateCount();
})();
