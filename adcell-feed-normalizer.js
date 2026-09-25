'use strict';
(function(root,factory){
  const api=factory(typeof module!=='undefined'&&module.exports?require('./affiliate-link-policy.js'):root?.FundBlickAffiliateLinkPolicy);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.FundBlickAdcellFeedNormalizer=api;
})(typeof window!=='undefined'?window:null,function(policy){
  const first=(row,spec)=>{
    const keys=Array.isArray(spec)?spec:[spec];
    for(const key of keys){if(key&&row?.[key]!==undefined&&row?.[key]!==null&&String(row[key]).trim()!=='')return row[key];}
    return null;
  };
  const text=value=>value===null||value===undefined?null:String(value).trim()||null;
  function money(value){
    if(value===null||value===undefined||value==='')return null;
    let raw=String(value).trim().replace(/\s/g,'').replace(/[^0-9,.-]/g,'');
    if(raw.includes(',')&&raw.includes('.')){
      if(raw.lastIndexOf(',')>raw.lastIndexOf('.'))raw=raw.replace(/\./g,'').replace(',','.');
      else raw=raw.replace(/,/g,'');
    }else if(raw.includes(','))raw=raw.replace(',','.');
    const parsed=Number(raw);
    return Number.isFinite(parsed)?Math.round(parsed*100)/100:null;
  }
  function normalize(row,mapping={},meta={}){
    if(!row||typeof row!=='object')return null;
    const id=text(first(row,mapping.id));
    const name=text(first(row,mapping.name));
    const price=money(first(row,mapping.price));
    if(!id||!name||price===null||price<0)return null;
    const directUrl=policy?.cleanUrl?.(first(row,mapping.directUrl))||null;
    const affiliateUrl=policy?.cleanUrl?.(first(row,mapping.affiliateUrl))||null;
    const imageUrl=policy?.cleanUrl?.(first(row,mapping.imageUrl))||null;
    return {
      id:`adcell:${meta.programId||'program'}:${id}`,
      externalId:id,
      name,
      brand:text(first(row,mapping.brand)),
      category:text(first(row,mapping.category)),
      description:text(first(row,mapping.description)),
      price,
      currency:text(first(row,mapping.currency))||meta.currency||'EUR',
      image:imageUrl,
      merchantId:text(meta.merchantId)||text(first(row,mapping.merchantId))||null,
      merchant:text(meta.merchant)||text(first(row,mapping.merchant))||null,
      directUrl,
      affiliateUrl,
      urlType:affiliateUrl&&!directUrl?'affiliate':directUrl?'direct':null,
      inStock:String(first(row,mapping.inStock)||'true').toLowerCase()!=='false',
      source:'adcell',
      sourceMeta:{programId:meta.programId||null,feedId:meta.feedId||null,importedAt:meta.importedAt||new Date().toISOString()}
    };
  }
  function normalizeMany(rows,mapping={},meta={}){return (Array.isArray(rows)?rows:[]).map(row=>normalize(row,mapping,meta)).filter(Boolean);}
  return {first,text,money,normalize,normalizeMany};
});
