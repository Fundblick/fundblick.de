'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),https=require('node:https'),dns=require('node:dns').promises;
const repo=__dirname;
const auditDir=path.resolve(process.argv[2]||'build/amazgifts-audit');
const {auditTarget,publicAddress}=require(path.join(repo,'audit-destination-links.js'));
const {policyFor}=require(path.join(repo,'destination-link-health.js'));
process.chdir(repo);
const policy=policyFor('amazgifts'),whitelist=JSON.parse(fs.readFileSync(auditDir+'/whitelist-products.json'));
const original=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync('development/amazgifts-products.json.gz.b64','utf8').trim(),'base64')));
const byVariant=new Map(original.map(p=>[p.merchantVariantId,p]));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const out=path.join(auditDir,'production-evidence');fs.mkdirSync(out,{recursive:true});
const file=path.join(auditDir,'production-candidates.json');const report=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{startedAt:new Date().toISOString(),results:[],status:'incomplete',requestPolicy:{workers:2,globalSpacingMs:350,maxAttempts:3}};
let nextAt=0,pauseUntil=0,requests=0;
async function request(url){
 const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.port||!['amazgifts.de','www.amazgifts.de','cdn.shopify.com','www.awin1.com','awin1.com'].includes(u.hostname))throw new Error('invalid-host');
 for(let n=0;n<3;n++){
  const at=Math.max(Date.now(),nextAt,pauseUntil);nextAt=at+350;await sleep(Math.max(0,at-Date.now()));
  try{const addresses=await dns.lookup(u.hostname,{all:true});if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new Error('non-public-address');const pinned=addresses[0];
   const response=await new Promise((resolve,reject)=>{const req=https.get(u,{headers:{'User-Agent':'FundBlick-Verified-Catalog/1.0','Accept':'*/*','Accept-Encoding':'identity'},lookup:(_h,o,cb)=>o?.all?cb(null,[pinned]):cb(null,pinned.address,pinned.family)},res=>{const chunks=[];let size=0;res.on('data',c=>{size+=c.length;if(size>12*1024*1024)res.destroy(new Error('response-too-large'));else chunks.push(c);});res.on('error',reject);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));});const timer=setTimeout(()=>req.destroy(new Error('timeout')),20000);req.on('close',()=>clearTimeout(timer));req.on('error',reject);});requests++;
   const evidence=sha(response.body);fs.writeFileSync(path.join(out,evidence+'.bin'),response.body);
   fs.appendFileSync(path.join(out,'requests.jsonl'),JSON.stringify({url:u.href,status:response.status,location:response.headers.location||null,contentType:response.headers['content-type'],bodyBytes:response.body.length,bodySha256:evidence,checkedAt:new Date().toISOString(),attempt:n+1})+'\n');
   if([429,500,502,503,504].includes(response.status)&&n<2){pauseUntil=Date.now()+Math.min(120000,Math.max(15000*(n+1),Number(response.headers['retry-after']||0)*1000));continue;}
   return response;
  }catch(e){if(n===2)throw e;await sleep(2000*(n+1));}
 }
}
function clean(html){return String(html||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();}
function category(title){const s=title.toLowerCase();if(/schlüsselanhänger|schluesselanhaenger|keychain/.test(s))return 'gifts.personalized.keychains';if(/armband|halskette|\bkette\b|\bringe?\b|ohrring|anhänger|anhanger|schmuck/.test(s))return 'gifts.personalized.jewelry';if(/bild|foto|photo|rahmen|leinwand|lampe|licht|projektion/.test(s))return 'gifts.personalized.photo-gifts';return 'gifts.personalized.other';}
async function verify(p){
 const r={id:p.id,shopifyProductId:p.shopifyProductId,finalProductUrl:p.finalProductUrl,startedAt:new Date().toISOString(),status:'fail'};
 try{
  const metadata=await request(new URL(p.finalProductUrl+'.js'));if(metadata.status!==200)throw new Error('metadata-http-'+metadata.status);const live=JSON.parse(metadata.body);r.metadataSha256=sha(metadata.body);
  if(String(live.id)!==p.shopifyProductId||new URL(live.url,'https://amazgifts.de').pathname!==new URL(p.finalProductUrl).pathname)throw new Error('metadata-product-mismatch');
  const candidates=p.sourceRows.map(s=>({source:s,variant:live.variants.find(v=>String(v.id)===s.merchant_product_id)})).filter(c=>c.variant?.available===true&&Number.isInteger(c.variant.price)&&c.variant.price>0&&!c.variant.requires_selling_plan).sort((a,b)=>a.variant.price-b.variant.price);
  if(!candidates.length)throw new Error('no-available-feed-variant');
  const selected=candidates[0],source=selected.source,variant=selected.variant,old=byVariant.get(source.merchant_product_id);if(!old||old.currency!=='EUR')throw new Error('missing-eur-source');r.source=source;r.variant={id:String(variant.id),title:variant.title,price:variant.price/100,available:variant.available};
  const image=new URL(variant.featured_image?.src||live.featured_image||live.images?.[0],'https://amazgifts.de').href;
  const img=await request(new URL(image));r.image={url:image,httpStatus:img.status,contentType:img.headers['content-type'],bodyBytes:img.body.length,bodySha256:sha(img.body),evidenceFile:'production-evidence/'+sha(img.body)+'.bin'};
  if(img.status!==200||!/^image\/(jpeg|png|webp|avif)/i.test(img.headers['content-type']||'')||img.body.length<1000)throw new Error('invalid-image-response');
  r.direct=await auditTarget({mode:'direct',url:source.merchant_deep_link},policy,{request});if(r.direct.status!=='pass')throw new Error('direct-'+r.direct.reason);
  r.affiliate=await auditTarget({mode:'affiliate',url:source.aw_deep_link},policy,{request});if(r.affiliate.status!=='pass')throw new Error('affiliate-'+r.affiliate.reason);
  for(const result of [r.direct,r.affiliate]){const u=new URL(result.finalUrl);if(u.pathname.replace(/\/$/,'')!==new URL(p.finalProductUrl).pathname||u.searchParams.get('variant')!==String(variant.id))throw new Error('destination-product-or-variant-mismatch');const html=fs.readFileSync(path.join(out,result.bodySha256+'.bin'),'utf8');if(!html.includes('"id":'+p.shopifyProductId)&&!html.includes('"id": '+p.shopifyProductId))throw new Error('destination-identity-not-confirmed');if(/(?:404\s*[-–—:]?\s*)?Hoppla/i.test((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||''))throw new Error('hoppla');}
  const html=fs.readFileSync(path.join(out,r.direct.bodySha256+'.bin'),'utf8');if(!/content=["']EUR["']|"priceCurrency"\s*:\s*"EUR"/.test(html))throw new Error('currency-not-confirmed');
  const name=clean(live.title);if(name.length<5||/testprodukt|404|hoppla/i.test(name))throw new Error('invalid-name');
  r.product={...old,id:'awin-87569-product-'+p.shopifyProductId,productGroupId:'amazgifts-product-'+p.shopifyProductId,name,productName:name,description:clean(live.description),category:category(name),image,price:variant.price/100,rawAttributes:{...old.rawAttributes,productType:live.type,taxonomySource:'verified_live_title',shopifyProductId:p.shopifyProductId,verifiedFinalProductUrl:p.finalProductUrl,metadataSha256:r.metadataSha256}};
  r.status='pass';
 }catch(e){r.reason=e.message;}
 r.completedAt=new Date().toISOString();return r;
}
function save(){fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');}
(async()=>{const completed=new Set(report.results.map(r=>r.id));const pending=whitelist.filter(p=>!completed.has(p.id));let i=0;await Promise.all([0,1].map(async()=>{while(i<pending.length){const p=pending[i++];const r=await verify(p);report.results.push(r);save();console.log(report.results.length+'/'+whitelist.length,r.status,r.reason||r.product.name);}}));report.status='complete';report.completedAt=new Date().toISOString();report.requestsThisRun=requests;save();console.log('COMPLETE',JSON.stringify({checked:report.results.length,passed:report.results.filter(r=>r.status==='pass').length,reasons:report.results.filter(r=>r.status!=='pass').map(r=>r.reason)}));})().catch(e=>{console.error(e);process.exitCode=1;});
