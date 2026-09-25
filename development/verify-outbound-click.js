const fs=require('fs'),vm=require('vm');
const preview=fs.readFileSync('preview.html','utf8');
const outbound=fs.readFileSync('out-preview.html','utf8');
const merchant=fs.readFileSync('merchant-preview.html','utf8');
const script=(html,marker)=>[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes(marker))||'';
new vm.Script(script(preview,'const DATA_BASE'));new vm.Script(script(outbound,'const DATA_BASE'));new vm.Script(script(merchant,'const TEXT='));
for(const needle of [
  'function outboundClickUrl(product,offer)',
  "return 'out-preview.html?'+params.toString()",
  'function merchantOfferAction(offer,product)',
  "document.getElementById('handoff-open').href=outboundClickUrl(product,offer)",
  '${merchantOfferAction(offer,p)}'
])if(!preview.includes(needle))throw new Error('outbound click contract missing in preview: '+needle);
for(const needle of [
  "const productId=params.get('p')||'',offerId=params.get('o')||''",
  "const manifest=await loadJson(DATA_BASE+'manifest.json',{mutable:true})",
  "index.find(item=>item?.i===productId)",
  "item?.id===offerId&&item.purchasable",
  "host==='example.com'||host==='www.example.com'||host.endsWith('.example')",
  "merchant-preview.html?lang=",
  "location.replace(target)"
])if(!outbound.includes(needle))throw new Error('safe outbound resolver contract missing: '+needle);
if(/params\.get\(['"](?:url|target|href)['"]\)/.test(outbound))throw new Error('outbound page must not accept a destination URL from query parameters');
if(!/name="robots" content="noindex,nofollow"/.test(outbound))throw new Error('outbound redirect page must stay out of search indexes');
const manifest=JSON.parse(fs.readFileSync('development/catalog/manifest.json','utf8'));
const index=JSON.parse(fs.readFileSync('development/catalog/'+manifest.searchFile,'utf8'));
let checked=0;
for(const compact of index){
  const meta=manifest.shards[String(compact.s)];if(!meta)continue;
  const shard=JSON.parse(fs.readFileSync('development/catalog/'+meta.file,'utf8'));
  const product=shard[compact.i];if(!product)continue;
  for(const offer of (product.variants||[]).flatMap(v=>v.offers||[])){
    if(offer?.purchasable&&offer.id&&offer.affiliateUrl){checked++;break}
  }
}
if(!checked)throw new Error('no published purchasable offer available for outbound resolver contract');
console.log('FundBlick safe outbound click contract OK',JSON.stringify({products:index.length,productsWithPurchasableOffer:checked}));

for(const code of ['en','de','ru','ro','zh','ja','th'])if(!merchant.includes(code+':{'))throw new Error('merchant simulator language missing: '+code);
if(!/DEVELOPMENT MERCHANT SIMULATOR/.test(merchant)||!/noindex,nofollow/.test(merchant))throw new Error('merchant simulator must be explicit and non-indexable');
console.log('FundBlick local merchant simulator contract OK');

if(!preview.includes('function isRealOfferUrl(value) {\n  return Boolean(safeHttpUrl(value));\n}'))throw new Error('development preview must allow reserved HTTP(S) simulator URLs');
if(!outbound.includes("host==='example.com'||host==='www.example.com'||host.endsWith('.example')"))throw new Error('reserved simulator host detection missing');
const germanSimulator=index.some(compact=>{
  const meta=manifest.shards[String(compact.s)];if(!meta)return false;
  const shard=JSON.parse(fs.readFileSync('development/catalog/'+meta.file,'utf8'));
  const product=shard[compact.i];
  return (product?.variants||[]).flatMap(v=>v.offers||[]).some(offer=>{
    if(!offer?.purchasable||offer.merchantLanguage!=='de'||!offer.affiliateUrl)return false;
    const host=new URL(offer.affiliateUrl).hostname.toLowerCase();
    return host==='example.com'||host==='www.example.com'||host.endsWith('.example');
  });
});
if(!germanSimulator)throw new Error('German merchant simulator case missing');
