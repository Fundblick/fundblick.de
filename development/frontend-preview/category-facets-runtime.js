'use strict';
(function(){
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const legacy=['Bauform','Funktionen','Akkulaufzeit'];
 function option(f,v){const unit=f.unit?` ${f.unit}`:'';const label=f.type==='threshold'?`ab ${v}${unit}`:`${v}${unit}`;return `<label><input type="checkbox" data-category-facet="${esc(f.key)}" data-value="${esc(v)}">${esc(label)} <span class="filter-count">–</span></label>`}
 function group(f,category){return `<fieldset class="filter-group category-specific" data-category-group="${esc(f.key)}"><legend>${esc(f.label)}</legend><p class="hint">Produktspezifisch für ${esc(category.label)}</p>${f.values.map(v=>option(f,v)).join('')}</fieldset>`}
 function removeOld(root){root.querySelectorAll('.category-specific').forEach(n=>n.remove());[...root.querySelectorAll('.filter-group')].forEach(n=>{const title=n.querySelector('legend')?.textContent.trim();if(legacy.includes(title))n.remove()})}
 function install(root,category){removeOld(root);const anchor=[...root.querySelectorAll('.filter-group')].find(x=>x.textContent.includes('Versand & Verfügbarkeit'))||root.lastElementChild;anchor?.insertAdjacentHTML('beforebegin',category.facets.map(f=>group(f,category)).join(''))}
 function apply(){if(!window.FB_detectCategory)return;const params=new URLSearchParams(location.search),q=params.get('q')||document.querySelector('#rq')?.value||'';const category=window.FB_detectCategory(q);document.querySelectorAll('#desktopFacetContent,#mobileFacetContent').forEach(root=>install(root,category));const note=document.querySelector('.interpret');if(note)note.innerHTML=`Erkannt: <b>${esc(category.label)}</b>. FundBlick zeigt gemeinsame Filter plus passende Produkteigenschaften für diese Kategorie.`;document.documentElement.dataset.category=category.key;window.FB_ACTIVE_CATEGORY=category;document.dispatchEvent(new CustomEvent('fundblick:category',{detail:category}))}
 window.FB_applyCategoryFacets=apply;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();