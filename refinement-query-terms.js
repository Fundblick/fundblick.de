'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickRefinementQueryTerms=api;})(typeof window!=='undefined'?window:globalThis,function(){
 const VALUES={de:{women:'Damen',men:'Herren',unisex:'Unisex',black:'schwarz',white:'weiß',blue:'blau',red:'rot',green:'grün'},en:{women:'women',men:'men',unisex:'unisex',black:'black',white:'white',blue:'blue',red:'red',green:'green'},ru:{women:'женские',men:'мужские',unisex:'унисекс',black:'чёрный',white:'белый',blue:'синий',red:'красный',green:'зелёный'}};
 const LABELS={de:{size:'Größe',audience:'Zielgruppe',color:'Farbe',brand:'Marke',material:'Material',memory_capacity:'Speicher',screen_size:'Bildschirmgröße'},en:{size:'size',audience:'for',color:'color',brand:'brand',material:'material',memory_capacity:'memory',screen_size:'screen size'},ru:{size:'размер',audience:'для',color:'цвет',brand:'бренд',material:'материал',memory_capacity:'память',screen_size:'размер экрана'}};
 function language(code){return String(code||'de').toLowerCase().split('-')[0]}
 function term(id,value,code){const lang=language(code),raw=String(value??'').trim();if(!raw)return'';const v=VALUES[lang]?.[raw.toLowerCase()]||raw;if(id==='audience')return lang==='en'?`for ${v}`:v;return `${LABELS[lang]?.[id]||String(id).replace(/_/g,' ')} ${v}`}
 function suffix(intent,code){return Object.entries(intent||{}).filter(([,v])=>v!=null&&String(v).trim()).map(([id,v])=>term(id,v,code)).filter(Boolean).join(' ')}
 return Object.freeze({term,suffix,language,LABELS,VALUES});
});