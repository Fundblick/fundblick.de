'use strict';
(function(root){
  const values=v=>Array.isArray(v)?v:(v===undefined||v===null||v===''?[]:[v]);
  const textOf=p=>[p?.name,p?.description,p?.category,p?.brand].filter(Boolean).join(' ');
  const horseProduct=p=>String(p?.category||'')==='animals.horse'||/\b(pferd|pferde|horse|equestrian)\b/i.test(textOf(p));
  function classify(product,family){
    if(family!=='equine'&&!horseProduct(product))return {};
    const text=textOf(product);
    let type='Zusatzfutter';
    if(/\bbundle\b/i.test(text))type='Bundle';
    else if(/lehm|clay|umschlag/i.test(text))type='Lehm / Umschlag';
    else if(/\bpaste\b/i.test(text))type='Paste';
    else if(/sirup|syrup/i.test(text))type='Sirup';
    return {type};
  }
  const api={classify,horseProduct,values};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.FBEquineFacetClassifier=api;
})(typeof window!=='undefined'?window:globalThis);
