'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickProductFacetEngine=api;})(typeof window!=='undefined'?window:globalThis,function(){
  const UNIVERSAL=['brand','price'];
  const PRIORITY={
    'automotive.motor_oil':['viscosity','volume','brand','specification','approval','unit_price','price'],
    'fashion.shoes':['size','audience','color','brand','model','price'],
    'electronics.television':['screen_size','display_technology','resolution','brand','model','price'],
    'electronics.smartphone':['storage','brand','model','color','connectivity','price'],
    'tools.cordless_drill':['voltage','battery_capacity','torque','brand','model','price'],
    'computing.laptop':['processor','memory','storage','screen_size','brand','price']
  };
  function present(value){return value!==undefined&&value!==null&&String(typeof value==='object'?value.value??'':value).trim()!==''}
  function valueOf(raw){return raw&&typeof raw==='object'&&'value'in raw?raw.value:raw}
  function rank(category,id,expected){const order=PRIORITY[category]||expected||UNIVERSAL;const i=order.indexOf(id);return i<0?999:i}
  function derive(analysis,results,options={}){
    const items=Array.isArray(results)?results:[];const minCoverage=Number.isFinite(options.minCoverage)?options.minCoverage:0.35;const maxPrimary=Number.isFinite(options.maxPrimary)?options.maxPrimary:6;
    const expected=Array.isArray(analysis?.facets)&&analysis.facets.length?analysis.facets:UNIVERSAL;const category=analysis?.category||null;const stats=[];
    for(const facet of expected){if(facet==='price'){stats.push({id:facet,coverage:1,count:items.length,values:[]});continue}let count=0;const values=new Map();for(const item of items){const attrs=item?.attributes||item||{};const raw=attrs[facet];if(!present(raw))continue;count++;const v=valueOf(raw);const key=String(v).toLocaleLowerCase();if(!values.has(key))values.set(key,v)}const coverage=items.length?count/items.length:0;if(coverage>=minCoverage||facet==='brand')stats.push({id:facet,coverage:Number(coverage.toFixed(3)),count,values:[...values.values()].slice(0,30)});}
    stats.sort((a,b)=>rank(category,a.id,expected)-rank(category,b.id,expected)||b.coverage-a.coverage||a.id.localeCompare(b.id));
    return {primary:stats.slice(0,maxPrimary),more:stats.slice(maxPrimary),sampleSize:items.length,minCoverage,category};
  }
  return Object.freeze({derive,rank,PRIORITY});
});