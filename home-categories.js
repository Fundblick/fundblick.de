'use strict';
(function(root){
  if(!root||!root.document)return;
  const select=document.querySelector('#language');
  const container=document.querySelector('.category-links');
  const more=document.querySelector('#categoryMore');
  const toggle=document.querySelector('#categoryToggle');
  const normalize=value=>String(value||'').trim();
  function lang(){return select?.value||document.documentElement.lang||'de'}
  function categoryCounts(index){const counts=new Map();for(const row of Array.isArray(index)?index:[]){const category=normalize(row?.c);if(!category)continue;counts.set(category,(counts.get(category)||0)+1)}return [...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'de'));}
  function linkFor(category,count){const a=document.createElement('a');a.dataset.liveCategory='true';a.href='search.html?'+new URLSearchParams({q:category,lang:lang()}).toString();a.textContent=category;a.title=`${count} Produkt${count===1?'':'e'}`;return a;}
  async function apply(){if(!container)return;try{const {index}=await root.FundBlickCatalog.meta();const categories=categoryCounts(index);container.querySelectorAll('[data-category-key],[data-live-category]').forEach(el=>el.remove());if(more)more.remove();if(toggle)toggle.remove();if(!categories.length){container.closest('.hero-categories')?.setAttribute('hidden','');return}container.closest('.hero-categories')?.removeAttribute('hidden');for(const [category,count] of categories)container.appendChild(linkFor(category,count));}catch(error){console.warn('FundBlick live categories unavailable',error);container.closest('.hero-categories')?.setAttribute('hidden','');}}
  select?.addEventListener('change',()=>queueMicrotask(apply));
  root.FundBlickHomeCategories={apply,categoryCounts};
  apply();
})(typeof window!=='undefined'?window:null);
