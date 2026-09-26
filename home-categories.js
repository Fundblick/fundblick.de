'use strict';
(function(root){
  if(!root||!root.document)return;
  const select=document.querySelector('#language');
  const container=document.querySelector('.category-links');
  const more=document.querySelector('#categoryMore');
  const toggle=document.querySelector('#categoryToggle');
  const normalize=value=>String(value||'').trim();
  const labels={
    de:{'home.living':'Wohnen & Haushalt','home.furniture':'Möbel','home.lighting':'Lampen & Beleuchtung','home.decor':'Dekoration'},
    en:{'home.living':'Home & Living','home.furniture':'Furniture','home.lighting':'Lighting','home.decor':'Decoration'},
    tr:{'home.living':'Ev & Yaşam','home.furniture':'Mobilya','home.lighting':'Aydınlatma','home.decor':'Dekorasyon'},
    ru:{'home.living':'Дом и быт','home.furniture':'Мебель','home.lighting':'Освещение','home.decor':'Декор'},
    ar:{'home.living':'المنزل والمعيشة','home.furniture':'أثاث','home.lighting':'إضاءة','home.decor':'ديكور'},
    pl:{'home.living':'Dom i wnętrze','home.furniture':'Meble','home.lighting':'Oświetlenie','home.decor':'Dekoracje'},
    ro:{'home.living':'Casă & Locuință','home.furniture':'Mobilier','home.lighting':'Iluminat','home.decor':'Decorațiuni'},
    uk:{'home.living':'Дім і побут','home.furniture':'Меблі','home.lighting':'Освітлення','home.decor':'Декор'},
    it:{'home.living':'Casa & Abitare','home.furniture':'Mobili','home.lighting':'Illuminazione','home.decor':'Decorazione'},
    fr:{'home.living':'Maison & Habitat','home.furniture':'Meubles','home.lighting':'Éclairage','home.decor':'Décoration'},
    es:{'home.living':'Hogar','home.furniture':'Muebles','home.lighting':'Iluminación','home.decor':'Decoración'},
    pt:{'home.living':'Casa','home.furniture':'Móveis','home.lighting':'Iluminação','home.decor':'Decoração'}
  };
  function lang(){return select?.value||document.documentElement.lang||'de'}
  function label(category){return labels[lang()]?.[category]||labels.en[category]||category}
  function categoryCounts(index){const counts=new Map();for(const row of Array.isArray(index)?index:[]){const category=normalize(row?.c);if(!category)continue;counts.set(category,(counts.get(category)||0)+1)}return [...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'de'));}
  function linkFor(category,count){const a=document.createElement('a');a.dataset.liveCategory='true';a.href='search.html?'+new URLSearchParams({category,lang:lang()}).toString();a.textContent=label(category);a.title=`${count} Produkt${count===1?'':'e'}`;a.dataset.catalogCategory=category;return a;}
  async function apply(){if(!container)return;try{const {index}=await root.FundBlickCatalog.meta();const categories=categoryCounts(index);container.querySelectorAll('[data-category-key],[data-live-category]').forEach(el=>el.remove());if(more)more.remove();if(toggle)toggle.remove();if(!categories.length){container.closest('.hero-categories')?.setAttribute('hidden','');return}container.closest('.hero-categories')?.removeAttribute('hidden');for(const [category,count] of categories)container.appendChild(linkFor(category,count));}catch(error){console.warn('FundBlick live categories unavailable',error);container.closest('.hero-categories')?.setAttribute('hidden','');}}
  select?.addEventListener('change',()=>queueMicrotask(apply));
  root.FundBlickHomeCategories={apply,categoryCounts,label};
  apply();
})(typeof window!=='undefined'?window:null);
