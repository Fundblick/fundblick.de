'use strict';
(function(){
  const panel=document.getElementById('filter-panel');
  const sort=document.getElementById('sort');
  const chips=document.getElementById('chips');
  const heading=document.querySelector('.results-heading');
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
  const mq=matchMedia('(max-width:760px)');
  function updateExpanded(){filter.setAttribute('aria-expanded',String(panel.open));}
  function updateCount(){const n=chips.querySelectorAll('button[data-remove]').length;count.textContent=String(n);count.hidden=n===0;filter.setAttribute('aria-label',n?`${tx('refine')} · ${n}`:tx('refine'));}
  function adapt(){if(mq.matches){if(!panel.dataset.mobileTouched)panel.open=false;}else{panel.open=true;delete panel.dataset.mobileTouched;}updateExpanded();}
  filter.addEventListener('click',()=>{panel.dataset.mobileTouched='1';panel.open=!panel.open;updateExpanded();if(panel.open)panel.scrollIntoView({behavior:'smooth',block:'start'});});
  panel.addEventListener('toggle',updateExpanded);
  sortButton.addEventListener('click',()=>{sort.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>sort.focus({preventScroll:true}),180);});
  const observer=new MutationObserver(updateCount);observer.observe(chips,{childList:true,subtree:true});
  mq.addEventListener?.('change',adapt);adapt();updateCount();
})();
