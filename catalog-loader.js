'use strict';
(function(root){
  const LARGE_CATALOG_THRESHOLD=600;
  const MAX_QUERY_PRODUCTS=320;
  const MAX_QUERY_SHARDS=32;
  const normalizeSearch=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const tokensFor=query=>normalizeSearch(query).split(/\s+/).filter(token=>token.length>1);
  const allShardIds=manifest=>Object.keys(manifest?.shards||{}).sort((a,b)=>Number(a)-Number(b));
  const familyTerms={
    headphones:['headphone','headphones','earbud','earbuds','earphone','kopfhörer','kopfhorer'],
    tv:['television','fernseher','oled','qled','smart tv'],
    shoes:['shoe','shoes','sneaker','sneakers','schuhe','laufschuhe'],
    smartphone:['smartphone','iphone','galaxy','pixel','handy'],
    coffee:['coffee','kaffee','kaffeemaschine','espresso'],
    heatgun:['heat gun','heißluftfön','heissluftfon','heißluftgebläse','heissluftgeblase']
  };
  function rowScore(row,tokens,extraTerms=[]){
    const q=normalizeSearch(row?.q||'');
    const name=normalizeSearch(row?.n||'');
    const brand=normalizeSearch(row?.b||'');
    const category=normalizeSearch(row?.c||'');
    let score=0,matched=0;
    for(const token of tokens){
      let hit=0;
      if(name.includes(token))hit=Math.max(hit,5);
      if(brand.includes(token))hit=Math.max(hit,4);
      if(category.includes(token))hit=Math.max(hit,3);
      if(q.includes(token))hit=Math.max(hit,2);
      if(hit){matched++;score+=hit;}
    }
    for(const term of extraTerms){const normalized=normalizeSearch(term);if(normalized&&q.includes(normalized))score+=2;}
    if(tokens.length&&matched===tokens.length)score+=8;
    return score;
  }
  function selectShardIds(manifest,index,query,detectedFamily){
    const all=allShardIds(manifest);
    const itemCount=Number(manifest?.itemCount||0);
    const tokens=tokensFor(query);
    if(itemCount<=LARGE_CATALOG_THRESHOLD||!tokens.length)return all;
    const extraTerms=familyTerms[detectedFamily]||[];
    const ranked=(Array.isArray(index)?index:[]).map(row=>({row,score:rowScore(row,tokens,extraTerms)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||String(a.row?.i||'').localeCompare(String(b.row?.i||''))).slice(0,MAX_QUERY_PRODUCTS);
    if(!ranked.length)return all;
    const ids=[];
    for(const {row} of ranked){const id=String(row?.s??'');if(!id||ids.includes(id)||!manifest.shards?.[id])continue;ids.push(id);if(ids.length>=MAX_QUERY_SHARDS)break;}
    return ids.length?ids:all;
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={LARGE_CATALOG_THRESHOLD,MAX_QUERY_PRODUCTS,MAX_QUERY_SHARDS,normalizeSearch,selectShardIds,rowScore};
  if(!root||typeof root.fetch!=='function')return;

  const nativeFetch=root.fetch.bind(root);
  let metaPromise=null,homePromise=null;
  const shardPromises=new Map();
  const queryPromises=new Map();
  const fetchJson=async url=>{const response=await nativeFetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`Catalog request failed: ${url} (${response.status})`);return response.json();};
  const numeric=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
  function adaptCanonical(product){
    if(!product||!product.id||!product.name)return null;
    if(Number.isFinite(Number(product.price)))return {...product,price:Number(product.price)};
    const offer=product.bestOffer||{};
    const price=numeric(offer.price)??numeric(product.priceFrom);if(price===null)return null;
    const total=numeric(offer.totalPrice)??numeric(product.totalPriceFrom);
    const shipping=numeric(offer.shippingCost)??(total!==null?Math.max(0,total-price):null);
    return {
      id:String(product.id),name:String(product.name),description:String(product.description||''),brand:String(product.brand||''),category:String(product.category||''),
      image:String(product.image||product.imageUrl||offer.imageUrl||''),price,shippingCost:shipping,currency:String(offer.currency||product.currency||'EUR'),
      inStock:String(offer.availability||'').toUpperCase()==='IN_STOCK',merchantCount:numeric(product.offerCount),active:true,testData:true,
      affiliateUrl:String(offer.affiliateUrl||''),catalogCanonical:true
    };
  }
  function flattenShard(payload){
    const values=Array.isArray(payload)?payload:(payload&&typeof payload==='object'?Object.values(payload):[]);
    return values.map(adaptCanonical).filter(Boolean);
  }
  function initialQuery(){try{return new URL(root.location?.href||'https://fundblick.de/').searchParams.get('q')||'';}catch{return '';}}
  function detectedFamily(query){try{return root.FB_detectCategory?.(query)?.id||null;}catch{return null;}}
  function onSearchPage(){try{return /\/search\.html$/i.test(root.location?.pathname||'')||!!root.document?.querySelector?.('.results-page');}catch{return false;}}
  async function meta(){
    if(!metaPromise)metaPromise=(async()=>{const manifest=await fetchJson('catalog/manifest.json');if(!manifest||!manifest.searchFile||!manifest.shards)throw new Error('Invalid live catalog manifest');const index=await fetchJson('catalog/'+manifest.searchFile);const largeCatalog=Number(manifest.itemCount||0)>LARGE_CATALOG_THRESHOLD;root.FundBlickCatalog={...(root.FundBlickCatalog||{}),manifest,index,largeCatalog,load,loadHome,meta,selectShardIds};return {manifest,index};})();
    return metaPromise;
  }
  async function loadShard(id,entry){
    const key=String(id);
    if(!shardPromises.has(key))shardPromises.set(key,fetchJson('catalog/'+entry.file).then(flattenShard));
    return shardPromises.get(key);
  }
  async function loadAll(manifest){
    const ids=allShardIds(manifest);
    const payloads=await Promise.all(ids.map(id=>loadShard(id,manifest.shards[id])));
    const byId=new Map();payloads.flat().forEach(product=>byId.set(product.id,{...(byId.get(product.id)||{}),...product}));
    return [...byId.values()];
  }
  async function loadHome(){
    if(!homePromise)homePromise=(async()=>{
      const {manifest}=await meta();
      if(!manifest.homeDealFile)return loadAll(manifest);
      const payload=await fetchJson('catalog/'+manifest.homeDealFile);
      const products=flattenShard(payload);
      root.FundBlickCatalog={...(root.FundBlickCatalog||{}),homeProducts:products,homeDealFile:manifest.homeDealFile,homeDealCount:products.length,load,loadHome,meta,selectShardIds};
      return products;
    })();
    return homePromise;
  }
  async function load(query=initialQuery()){
    if(!normalizeSearch(query)&&!onSearchPage())return loadHome();
    const queryKey=normalizeSearch(query)||'__all__';
    if(!queryPromises.has(queryKey))queryPromises.set(queryKey,(async()=>{
      const {manifest,index}=await meta();
      const ids=selectShardIds(manifest,index,query,detectedFamily(query));
      const payloads=await Promise.all(ids.map(id=>loadShard(id,manifest.shards[id])));
      const byId=new Map();
      payloads.flat().forEach(product=>byId.set(product.id,{...(byId.get(product.id)||{}),...product}));
      const products=[...byId.values()];
      root.FundBlickCatalog={...(root.FundBlickCatalog||{}),manifest,index,products,loadedShardIds:ids,partial:ids.length<allShardIds(manifest).length,largeCatalog:Number(manifest.itemCount||0)>LARGE_CATALOG_THRESHOLD,load,loadHome,meta,selectShardIds};
      return products;
    })());
    return queryPromises.get(queryKey);
  }
  const jsonResponse=async data=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
  root.fetch=async function(input,init){
    const raw=typeof input==='string'?input:(input&&input.url)||'';
    let url=null,path='';try{url=new URL(raw,root.location?.href||'https://fundblick.de/');path=url.pathname;}catch{}
    if(raw==='catalog-live'||path.endsWith('/catalog-live'))return jsonResponse(await load(url?.searchParams.get('q')||initialQuery()));
    if(path.endsWith('/products.json'))return jsonResponse([]);
    return nativeFetch(input,init);
  };
  root.FundBlickCatalog={load,loadHome,meta,selectShardIds,largeCatalog:false};
})(typeof window!=='undefined'?window:null);
