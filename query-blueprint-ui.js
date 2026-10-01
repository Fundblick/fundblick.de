'use strict';
(function(){
 const engine=window.FundBlickQueryFacetBlueprint,form=document.querySelector('.search-form'),chips=document.getElementById('chips'),input=document.getElementById('query');
 if(!engine||!form||!chips||!input)return;
 const names={de:{recognized:'Erkannt',refine:'Relevante Merkmale',memory_generation:'DDR-Generation',memory_capacity:'Kapazität',memory_speed:'Geschwindigkeit',memory_form_factor:'Bauform',memory_modules:'Module',processor:'Prozessor',storage:'Speicher',screen_size:'Bildschirmgröße',type:'Typ',connectivity:'Verbindung',noise_cancelling:'Geräuschunterdrückung',power:'Leistung',capacity:'Kapazität',spin_speed:'Schleuderdrehzahl',energy_class:'Energieklasse',max_area:'Fläche',max_slope:'Steigung',cutting_width:'Schnittbreite',frame_size:'Rahmengröße',wheel_size:'Radgröße',gears:'Gänge',brand:'Hersteller',price:'Preis',viscosity:'Viskosität',volume:'Gebinde',specification:'Spezifikation',approval:'Freigabe',unit_price:'Grundpreis',application:'Einsatz',vehicle_make:'Fahrzeughersteller',vehicle_model:'Fahrzeugmodell',engine:'Motor',thread_size:'Gewinde',heat_range:'Wärmewert',electrode_gap:'Elektrodenabstand',material:'Material'},en:{recognized:'Recognized',refine:'Relevant attributes'}};
 let box=null;
 function render(){
  box?.remove();box=null;const lang=document.documentElement.lang||'de',state=engine.analyze(input.value||new URLSearchParams(location.search).get('q')||'',lang);if(!state?.category)return;
  const t=names[String(lang).split('-')[0]]||names.en;box=document.createElement('section');box.className='query-blueprint';box.setAttribute('aria-label',t.recognized);
  const h=document.createElement('p');h.className='query-blueprint-title';h.textContent=`${t.recognized}: ${state.label}`;box.appendChild(h);
  const attrs=document.createElement('div');attrs.className='query-blueprint-constraints';
  const fmt=(id,v)=>{const raw=v&&typeof v==='object'?v.value:v,unit=v&&typeof v==='object'?v.unit:'';return `${t[id]||id.replace(/_/g,' ')}: ${raw}${unit?' '+unit:''}`};
  for(const [id,v] of Object.entries(state.attributes||{})){const span=document.createElement('span');span.textContent=fmt(id,v);attrs.appendChild(span)}if(attrs.childElementCount)box.appendChild(attrs);
  const relevant=document.createElement('p');relevant.className='query-blueprint-relevant';const labels=state.facets.filter(x=>!['price','brand','unit_price'].includes(x)).slice(0,5).map(x=>t[x]||x.replace(/_/g,' '));if(labels.length){relevant.textContent=`${t.refine}: ${labels.join(' · ')}`;box.appendChild(relevant)}
  chips.insertAdjacentElement('beforebegin',box);
 }
 form.addEventListener('submit',()=>queueMicrotask(render));window.addEventListener('fundblick:search-rendered',render);window.addEventListener('pageshow',render);render();
})();