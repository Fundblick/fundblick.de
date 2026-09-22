const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('preview.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw new Error('preview script missing');
const start=script.indexOf('const HANDOFF_VOCAB='),end=script.indexOf('function formatPrice');
if(start<0||end<0||end<=start)throw new Error('merchant handoff block missing');
const source=script.slice(start,end)+"\n;globalThis.__handoff={handoffLanguage,merchantLanguageNeedsHelp,handoffVocabulary,merchantTerms};";
const ctx={};vm.createContext(ctx);vm.runInContext(source,ctx);
const h=ctx.__handoff;
const eq=(a,b,l)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(l+': '+JSON.stringify(a))};
eq(h.handoffLanguage('DE-de'),'de','normalizes language tag');
eq(h.handoffLanguage('ru_RU'),'ru','normalizes underscore tag');
eq(h.handoffLanguage(''),null,'rejects empty language');
eq(h.merchantLanguageNeedsHelp('de','de'),false,'same language needs no help');
eq(h.merchantLanguageNeedsHelp('ru','de'),true,'different language needs help');
eq(h.merchantLanguageNeedsHelp(null,'de'),false,'unknown merchant language does not pretend mismatch');
if(h.merchantTerms('ru').checkout!=='Оформление заказа')throw new Error('Russian merchant checkout vocabulary missing');
if(h.merchantTerms('ro').payment!=='Metodă de plată')throw new Error('Romanian merchant payment vocabulary missing');
if(h.merchantTerms('zh').cart!=='购物车')throw new Error('Chinese merchant cart vocabulary missing');
if(h.merchantTerms('ja').address!=='お届け先住所')throw new Error('Japanese merchant address vocabulary missing');
if(h.merchantTerms('th').payment!=='วิธีชำระเงิน')throw new Error('Thai merchant payment vocabulary missing');
if(h.merchantTerms('fr').checkout!=='Checkout')throw new Error('Merchant vocabulary English fallback missing');
if(h.handoffVocabulary('fr').open!=='Open merchant page')throw new Error('English fallback missing');
const manifest=JSON.parse(fs.readFileSync('development/catalog/manifest.json','utf8'));
const detailOffers=Object.values(manifest.shards).flatMap(meta=>{
  const shard=JSON.parse(fs.readFileSync('development/catalog/'+meta.file,'utf8'));
  return Object.values(shard).flatMap(product=>(product.variants||[]).flatMap(variant=>variant.offers||[]));
});
const languages=new Set(detailOffers.map(offer=>offer.merchantLanguage).filter(Boolean));
for(const language of ['de','ru','ro','zh','ja','th'])if(!languages.has(language))throw new Error('Missing merchant-language simulator case: '+language);
const foreign=detailOffers.filter(offer=>['ru','ro','zh','ja','th'].includes(offer.merchantLanguage));
if(!foreign.length)throw new Error('Missing foreign-language offers');
for(const offer of foreign){
  const host=new URL(offer.affiliateUrl).hostname.toLowerCase();
  if(!host.endsWith('.example')||host==='example.com')throw new Error('Foreign-language offer must use reserved non-production .example host');
  if(!h.merchantLanguageNeedsHelp(offer.merchantLanguage,'de'))throw new Error('Foreign-language offer does not trigger handoff');
}
if(!detailOffers.some(offer=>offer.merchantLanguage==='de'&&!h.merchantLanguageNeedsHelp(offer.merchantLanguage,'de')))throw new Error('Missing same-language control case');
console.log('FundBlick merchant-language handoff contract OK');
