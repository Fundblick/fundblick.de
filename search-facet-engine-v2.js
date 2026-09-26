'use strict';
(function(root){
  const values=v=>Array.isArray(v)?v:(v===undefined||v===null||v===''?[]:[v]);
  function enrich(product){
    const family=product?.family;
    const classified=root.FBHomeFacetClassifier?.classify?.(product,family)||{};
    product.attrs=product.attrs||{};
    for(const [key,value] of Object.entries(classified)){
      const merged=[...new Set([...values(product.attrs[key]),...values(value)].map(String).filter(Boolean))];
      if(merged.length)product.attrs[key]=merged.length===1?merged[0]:merged;
    }
    return product;
  }
  function availableValues(products,key,configured=[]){
    const counts=new Map();
    for(const p of products||[])for(const value of values(p?.attrs?.[key]))counts.set(String(value),(counts.get(String(value))||0)+1);
    const order=configured.length?configured.map(String):[...counts.keys()].sort((a,b)=>a.localeCompare(b,'de',{numeric:true}));
    return order.filter(v=>counts.has(v)).map(value=>({value,count:counts.get(value)}));
  }
  function dominantSchema(products,schema){
    if(schema)return schema;
    const schemas=root.FB_CATEGORY_SCHEMAS||{};
    const counts=new Map();
    for(const p of products||[]){const family=String(p?.family||'');if(schemas[family])counts.set(family,(counts.get(family)||0)+1);}
    const winner=[...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0];
    return winner?schemas[winner]:null;
  }
  function facetsFor(products,schema){
    const effective=dominantSchema(products,schema);
    return (effective?.facets||[]).map(f=>({...f,options:availableValues(products,f.key,f.values||[])})).filter(f=>f.options.length);
  }
  function matches(product,key,selected){
    if(!selected?.size)return true;
    const own=new Set(values(product?.attrs?.[key]).map(String));
    return [...selected].some(v=>own.has(String(v)));
  }
  root.FBFacetEngineV2={enrich,availableValues,dominantSchema,facetsFor,matches};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.FBFacetEngineV2;
})(typeof window!=='undefined'?window:globalThis);
