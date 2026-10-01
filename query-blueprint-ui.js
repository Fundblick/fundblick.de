'use strict';
(function(){
 const engine=window.FundBlickQueryFacetBlueprint,form=document.querySelector('.search-form'),chips=document.getElementById('chips');
 if(!engine||!form||!chips)return;
 const params=new URLSearchParams(location.search),q=params.get('rawq')||params.get('q')||'',lang=document.documentElement.lang||'de',state=engine.analyze(q,lang);
 if(!state?.category)return;
 const names={de:{recognized:'Erkannt',refine:'Relevante Merkmale',memory_generation:'DDR-Generation',memory_capacity:'Kapazität',memory_speed:'Geschwindigkeit',memory_form_factor:'Bauform',memory_modules:'Module',brand:'Hersteller',price:'Preis',viscosity:'Viskosität',volume:'Gebinde',specification:'Spezifikation',approval:'Freigabe',unit_price:'Grundpreis',application:'Einsatz',vehicle_make:'Fahrzeughersteller',vehicle_model:'Fahrzeugmodell',engine:'Motor',thread_size:'Gewinde',heat_range:'Wärmewert',electrode_gap:'Elektrodenabstand',material:'Material'},en:{recognized:'Recognized',refine:'Relevant attributes'}};
 const t=names[String(lang).split('-')[0]]||names.en,box=document.createElement('section');box.className='query-blueprint';box.setAttribute('aria-label',t.recognized);
 const h=document.createElement('p');h.className='query-blueprint-title';h.textContent=`${t.recognized}: ${state.label}`;box.appendChild(h);
 const attrs=document.createElement('div');attrs.className='query-blueprint-constraints';
 const fmt=(id,v)=>{const raw=v&&typeof v==='object'?v.value:v,unit=v&&typeof v==='object'?v.unit:'';return `${t[id]||id.replace(/_/g,' ')}: ${raw}${unit?' '+unit:''}`};
 for(const [id,v] of Object.entries(state.attributes||{})){const span=document.createElement('span');span.textContent=fmt(id,v);attrs.appendChild(span)}
 if(attrs.childElementCount)box.appendChild(attrs);
 const relevant=document.createElement('p');relevant.className='query-blueprint-relevant';relevant.textContent=`${t.refine}: ${state.facets.filter(x=>x!=='price'&&x!=='brand'&&x!=='unit_price').slice(0,5).map(x=>t[x]||x.replace(/_/g,' ')).join(' · ')}`;box.appendChild(relevant);
 chips.insertAdjacentElement('beforebegin',box);
})();