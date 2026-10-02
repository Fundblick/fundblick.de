'use strict';
(function(root,factory){const api=factory(root);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickSemanticTaxonomyAdapter=api;})(typeof window!=='undefined'?window:globalThis,function(root){
 const uniq=a=>[...new Set((a||[]).filter(Boolean).map(String))];
 function canonicalId(key,schema={}){const explicit=String(schema.id||'').trim();if(explicit)return explicit;const dotted=(schema.terms||[]).map(String).find(x=>x.includes('.'));return dotted||String(key||'').trim()}
 function facetIds(schema={}){return uniq((schema.facets||[]).map(x=>typeof x==='string'?x:x?.key).concat(schema.commonFacets||[]))}
 function normalize(input=[]){return(input||[]).map((x,i)=>({id:String(x?.id||i),label:String(x?.label||x?.id||''),terms:uniq([...(x?.terms||[]),...(x?.labels||[])]),facets:uniq(x?.facets||[])})).filter(x=>x.id)}
 function fromBrowser(){const schemas=root?.FB_CATEGORY_SCHEMAS||{},common=(root?.FB_COMMON_FACETS||[]).map(x=>x?.key).filter(Boolean);return Object.entries(schemas).map(([key,s])=>({id:canonicalId(key,s),label:String(s?.label||key),terms:uniq([key,...(s?.terms||[])]),facets:uniq([...facetIds(s),...common])}))}
 function taxonomy(options={}){return Array.isArray(options.taxonomy)&&options.taxonomy.length?normalize(options.taxonomy):fromBrowser()}
 function match(list,id){return(list||[]).find(x=>x.id===id)||null}
 return Object.freeze({canonicalId,facetIds,normalize,fromBrowser,taxonomy,match});
});