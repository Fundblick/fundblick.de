'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickProductFacetEngine=api;})(typeof window!=='undefined'?window:globalThis,function(){
  const UNIVERSAL=['brand','price'];
  function present(value){return value!==undefined&&value!==null&&String(typeof value==='object'?value.value??'':value).trim()!==''}
  function valueOf(raw){return raw&&typeof raw==='object'&&'value'in raw?raw.value:raw}
  function derive(analysis,results,options={}){
    const items=Array.isArray(results)?results:[];const minCoverage=Number.isFinite(options.minCoverage)?options.minCoverage:0.35;const maxPrimary=Number.isFinite(options.maxPrimary)?options.maxPrimary:6;
    const expected=Array.isArray(analysis?.facets)&&analysis.facets.length?analysis.facets:UNIVERSAL;
    const stats=[];
    for(const facet of expected){if(facet==='price'){stats.push({id:facet,coverage:1,count:items.length,values:[]});continue}let count=0;const values=new Map();for(const item of items){const attrs=item?.attributes||item||{};const raw=attrs[facet];if(!present(raw))continue;count++;const v=valueOf(raw);const key=String(v).toLocaleLowerCase();if(!values.has(key))values.set(key,v)}const coverage=items.length?count/items.length:0;if(coverage>=minCoverage||facet==='brand')stats.push({id:facet,coverage:Number(coverage.toFixed(3)),count,values:[...values.values()].slice(0,30)});}
    stats.sort((a,b)=>{const ua=UNIVERSAL.includes(a.id)?1:0,ub=UNIVERSAL.includes(b.id)?1:0;return ub-ua||b.coverage-a.coverage||a.id.localeCompare(b.id)});
    return {primary:stats.slice(0,maxPrimary),more:stats.slice(maxPrimary),sampleSize:items.length,minCoverage};
  }
  return Object.freeze({derive});
});
