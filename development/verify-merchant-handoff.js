const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('preview.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw new Error('preview script missing');
const start=script.indexOf('const HANDOFF_VOCAB='),end=script.indexOf('function formatPrice');
if(start<0||end<0||end<=start)throw new Error('merchant handoff block missing');
const source=script.slice(start,end)+"\n;globalThis.__handoff={handoffLanguage,merchantLanguageNeedsHelp,handoffVocabulary,merchantTerms,detectBrowserContext,browserLabel,languageName,translationInstruction};";
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

const merchantHtml=fs.readFileSync('merchant-preview.html','utf8');
for(const id of ['cart','checkout','shipping','address','payment'])if(!merchantHtml.includes('id="'+id+'"'))throw new Error('Merchant simulator missing '+id+' action');
for(const term of ['Доставка','Адрес доставки','Livrare','Adresa de livrare','配送','收货地址','お届け先住所','การจัดส่ง','ที่อยู่จัดส่ง'])if(!merchantHtml.includes(term))throw new Error('Merchant simulator vocabulary missing: '+term);

const chromeAndroid=h.detectBrowserContext({userAgent:'Mozilla/5.0 (Linux; Android 17; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'});
if(chromeAndroid.browser!=='chrome'||chromeAndroid.device!=='android')throw new Error('Chrome Android detection failed');
const edgeWindows=h.detectBrowserContext({userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0'});
if(edgeWindows.browser!=='edge'||edgeWindows.device!=='desktop')throw new Error('Edge desktop detection failed');
const safariIOS=h.detectBrowserContext({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 Version/27.0 Mobile/15E148 Safari/604.1'});
if(safariIOS.browser!=='safari'||safariIOS.device!=='ios')throw new Error('Safari iOS detection failed');
const firefoxAndroid=h.detectBrowserContext({userAgent:'Mozilla/5.0 (Android 17; Mobile; rv:143.0) Gecko/143.0 Firefox/143.0'});
if(firefoxAndroid.browser!=='firefox'||firefoxAndroid.device!=='android')throw new Error('Firefox Android detection failed');
const ruChrome=h.translationInstruction('de','ru',chromeAndroid);
if(!ruChrome.includes('Chrome')||!ruChrome.includes('Всегда переводить'))throw new Error('Russian Chrome translation guide missing');
const roEdge=h.translationInstruction('de','ro',edgeWindows);
if(!roEdge.includes('Edge')||!roEdge.includes('întotdeauna'))throw new Error('Romanian Edge translation guide missing');

if(!merchantHtml.includes("document.documentElement.lang=l"))throw new Error('Merchant simulator must declare merchant language before page translation');
if(/name="google" content="notranslate"/.test(merchantHtml))throw new Error('Merchant simulator must remain browser-translatable');
