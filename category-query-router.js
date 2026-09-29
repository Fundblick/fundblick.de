'use strict';
(function(root){
  if(!root||!root.location)return;
  const params=new URLSearchParams(root.location.search);
  if(params.get('category'))return;
  const raw=String(params.get('q')||'').trim();
  if(!raw)return;

  const normalize=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const query=normalize(raw);
  if(!query)return;

  const schemas=root.FB_CATEGORY_SCHEMAS||{};
  const canonicalFor=(key,schema)=>{
    const terms=Array.isArray(schema?.terms)?schema.terms:[];
    const canonical=terms.find(term=>/^(?:home|pet|health|electronics|fashion)\./i.test(String(term||'')));
    if(canonical)return String(canonical);
    if(String(key).includes('.'))return String(key);
    return '';
  };

  let matched='';
  let matchedLength=0;
  for(const [key,schema] of Object.entries(schemas)){
    const canonical=canonicalFor(key,schema);
    if(!canonical)continue;
    const candidates=[schema?.label,...(schema?.terms||[])].filter(Boolean);
    for(const candidate of candidates){
      const token=normalize(candidate);
      if(!token||token!==query)continue;
      if(token.length>matchedLength){matched=canonical;matchedLength=token.length;}
    }
  }

  const explicit={
    'mähroboter':'home.garden.robot-mowers',
    'maehroboter':'home.garden.robot-mowers',
    'rasenroboter':'home.garden.robot-mowers',
    'robot mower':'home.garden.robot-mowers',
    'robotic mower':'home.garden.robot-mowers',
    'mähroboter zubehör':'home.garden.robot-mower-accessories',
    'maehroboter zubehör':'home.garden.robot-mower-accessories',
    'mähroboter ersatzteile':'home.garden.robot-mower-accessories',
    'maehroboter ersatzteile':'home.garden.robot-mower-accessories'
  };
  matched=explicit[query]||matched;
  if(!matched)return;

  params.set('category',matched);
  params.set('rawq',raw);
  params.delete('q');
  params.delete('web');
  params.delete('intentView');
  root.location.replace(`${root.location.pathname}?${params.toString()}`);
})(typeof window!=='undefined'?window:null);
