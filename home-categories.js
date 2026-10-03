'use strict';
(function(root){
  if(!root||!root.document)return;
  const select=document.querySelector('#language');
  const container=document.querySelector('.category-links');
  const normalize=value=>String(value||'').trim();
  function lang(){return select?.value||document.documentElement.lang||'de';}
  function label(category){return root.FundBlickCategoryLabels?.getLabel(category,lang())||category;}
  function normalizeManifest(payload){return Array.isArray(payload?.categories)?payload.categories.map(item=>({id:normalize(item?.id),count:Number(item?.count)||0})).filter(item=>item.id&&item.count>0):[];}
  function linkFor(category,count){const a=document.createElement('a');a.dataset.liveCategory='true';a.href='search.html?'+new URLSearchParams({category,lang:lang()}).toString();a.textContent=label(category);a.title=`${count} Produkt${count===1?'':'e'}`;a.dataset.catalogCategory=category;return a;}
  async function apply(){
    if(!container)return;
    try{
      const response=await fetch('catalog/categories.json',{cache:'no-store'});
      if(!response.ok)throw new Error(`Category manifest unavailable (${response.status})`);
      const categories=normalizeManifest(await response.json());
      if(!categories.length)throw new Error('Category manifest is empty');
      container.innerHTML='';
      for(const {id,count} of categories)container.appendChild(linkFor(id,count));
      container.closest('.hero-categories')?.removeAttribute('hidden');
    }catch(error){
      console.warn('FundBlick live categories unavailable',error);
      /* Keep the server-rendered/static fallback links rather than hiding categories. */
    }
  }
  select?.addEventListener('change',()=>queueMicrotask(apply));
  root.FundBlickHomeCategories={apply,label,normalizeManifest};
  apply();
})(typeof window!=='undefined'?window:null);