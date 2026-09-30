'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickProductFashionAttributes=api;})(typeof window!=='undefined'?window:globalThis,function(){
 const colors={schwarz:'black',black:'black',noir:'black',nero:'black',weiß:'white',weiss:'white',white:'white',blanc:'white',bianco:'white',rot:'red',red:'red',rouge:'red',rosso:'red',blau:'blue',blue:'blue',bleu:'blue',blu:'blue',grün:'green',gruen:'green',green:'green',vert:'green',verde:'green',grau:'gray',grey:'gray',gray:'gray',silber:'silver',silver:'silver'};
 const audiences={women:'damen|women|woman|femme|donna|женские|женская|женский',men:'herren|men|man|homme|uomo|мужские|мужская|мужской',kids:'kinder|kids|children|junior|детские|детская|детский',unisex:'unisex|унисекс'};
 const word='[\\p{L}\\p{M}\\p{N}_]';
 function tokens(pattern){return new RegExp(`(?<!${word})(?:${pattern})(?!${word})`,'iu')}
 const audienceMatchers=Object.entries(audiences).map(([id,pattern])=>({id,pattern:tokens(pattern)})),colorMatchers=Object.entries(colors).map(([pattern,id])=>({id,pattern:tokens(pattern)}));
 function extract(value,category){const attributes={},ambiguities=[],text=String(value||'').normalize('NFKC');if(!['fashion.shoes','fashion.clothing'].includes(category))return{attributes,ambiguities};
  function unique(id,values,extra={}){const found=[...new Set(values)];if(found.length===1)attributes[id]={value:found[0],...extra,confidence:'HIGH'};else if(found.length>1)ambiguities.push(id)}
  unique('audience',audienceMatchers.filter(entry=>entry.pattern.test(text)).map(entry=>entry.id));
  unique('color',colorMatchers.filter(entry=>entry.pattern.test(text)).map(entry=>entry.id));
  if(category==='fashion.shoes'){
   // A bare model number is not evidence of a European shoe size.
   const sizes=[...text.matchAll(/(?<![\p{L}\p{M}\p{N}_])(?:EU\s*|Gr(?:öße|\.)?\s*)(3[5-9]|4[0-9]|5[0-2])(?:([.,]5))?(?![\p{L}\p{M}\p{N}_]|[.,]\d)/giu)].map(m=>Number(m[1]+(m[2]?m[2].replace(',','.') : '')));
   unique('size',sizes,{system:'EU'});
  }
  return{attributes,ambiguities};
 }
 return Object.freeze({extract});
});
