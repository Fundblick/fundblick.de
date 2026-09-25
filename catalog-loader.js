'use strict';
(function(root){
  if(!root||typeof root.fetch!=='function')return;
  const nativeFetch=root.fetch.bind(root);
  let metaPromise=null,productsPromise=null;

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
  async function meta(){
    if(!metaPromise)metaPromise=(async()=>{const manifest=await fetchJson('catalog/manifest.json');if(!manifest||!manifest.searchFile||!manifest.shards)throw new Error('Invalid live catalog manifest');const index=await fetchJson('catalog/'+manifest.searchFile);return {manifest,index};})();
    return metaPromise;
  }
  async function load(){
    if(!productsPromise)productsPromise=(async()=>{
      const {manifest,index}=await meta();
      const shardEntries=Object.entries(manifest.shards).sort((a,b)=>Number(a[0])-Number(b[0]));
      const payloads=await Promise.all(shardEntries.map(([,entry])=>fetchJson('catalog/'+entry.file)));
      const byId=new Map();
      payloads.flatMap(flattenShard).forEach(product=>byId.set(product.id,{...(byId.get(product.id)||{}),...product}));
      const products=[...byId.values()];
      root.FundBlickCatalog={...(root.FundBlickCatalog||{}),manifest,index,products,load};
      return products;
    })();
    return productsPromise;
  }
  const jsonResponse=async data=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
  root.fetch=async function(input,init){
    const raw=typeof input==='string'?input:(input&&input.url)||'';
    let path='';try{path=new URL(raw,root.location?.href||'https://fundblick.de/').pathname;}catch{}
    if(raw==='catalog-live'||path.endsWith('/catalog-live'))return jsonResponse(await load());
    if(path.endsWith('/products.json'))return jsonResponse([]);
    return nativeFetch(input,init);
  };
  root.FundBlickCatalog={load,meta};
})(typeof window!=='undefined'?window:null);
