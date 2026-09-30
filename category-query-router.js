'use strict';
(function(root){
  if(!root||!root.location)return;
  const params=new URLSearchParams(root.location.search);
  const existingCategory=String(params.get('category')||'').trim();
  const preserved=String(params.get('rawq')||'').trim();
  if(existingCategory){
    if(preserved)root.addEventListener('load',()=>{const input=root.document?.querySelector?.('#query');if(input)input.value=preserved;},{once:true});
    return;
  }

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

  const categoryNames={
    'home.furniture':['möbel','moebel','furniture'],
    'home.lighting':['lampen','beleuchtung','lighting'],
    'home.decor':['dekoration','deko','decor'],
    'home.living':['wohnen','haushalt','living'],
    'pet.equestrian':['pferd','pferde','reitsport','equestrian','horse care']
  };
  let matched='';
  let matchedLength=0;
  for(const [key,schema] of Object.entries(schemas)){
    const canonical=canonicalFor(key,schema);
    if(!canonical)continue;
    // Schema terms also contain product subtypes and model names. Those must
    // remain text queries rather than losing their meaning in a broad category.
    const candidates=[schema?.label,canonical,...(categoryNames[canonical]||[])].filter(Boolean);
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
  matched=Object.entries(explicit).find(([name])=>normalize(name)===query)?.[1]||matched;
  if(!matched)return;

  params.set('category',matched);
  params.set('rawq',raw);
  params.delete('q');
  params.delete('web');
  params.delete('intentView');
  root.location.replace(`${root.location.pathname}?${params.toString()}`);
})(typeof window!=='undefined'?window:null);
