'use strict';
(function(root){
  const normalize=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const scopeFor=query=>normalize(query)||'*';
  const filterKeys=['brand','facets','min','max'];
  const hasScopedState=params=>filterKeys.some(key=>{const value=params.get(key);return value!==null&&value!=='';});
  function sanitizeParams(params){
    const expected=scopeFor(params.get('q')||'');const supplied=params.get('scope');let changed=false;
    if(hasScopedState(params)&&supplied!==expected){for(const key of filterKeys)params.delete(key);params.delete('sort');changed=true;}
    if((params.get('q')||hasScopedState(params))&&params.get('scope')!==expected){params.set('scope',expected);changed=true;}
    if(!(params.get('q')||hasScopedState(params))&&params.has('scope')){params.delete('scope');changed=true;}
    return {changed,expected};
  }
  const api={normalize,scopeFor,hasScopedState,sanitizeParams};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(!root||!root.location||!root.history)return;
  root.FundBlickSearchState=api;
  const originalReplace=root.history.replaceState.bind(root.history);
  const current=new URL(root.location.href);const initial=sanitizeParams(current.searchParams);
  if(initial.changed)originalReplace(root.history.state,'',current.href);
  root.history.replaceState=function(state,title,url){
    if(url===undefined||url===null)return originalReplace(state,title,url);
    try{const next=new URL(url,root.location.href);sanitizeParams(next.searchParams);return originalReplace(state,title,next.href);}catch{return originalReplace(state,title,url);}
  };
})(typeof window!=='undefined'?window:null);
