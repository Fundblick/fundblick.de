'use strict';
// Writes a reviewable artifact and evidence. Does NOT approve, activate, merge
// or deploy. Failed/missing image, metadata or either consent route is excluded.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const {canonicalProductDigest}=require('./merchant-artifact-integrity.js');
const {policyFor,policyDigest,validateReport,readProducts}=require('./destination-link-health.js');
const {validateQualityReport}=require('./merchant-product-quality.js');
const auditDir=path.resolve(process.argv[2]||'build/amazgifts-audit');
const load=name=>JSON.parse(fs.readFileSync(path.join(auditDir,name),'utf8'));
const candidates=load('production-candidates.json'),decoded=load('decoded-images.json'),whitelist=load('whitelist-products.json');
if(candidates.status!=='complete'||candidates.results.length!==whitelist.length||new Set(candidates.results.map(r=>r.id)).size!==whitelist.length||whitelist.some(p=>!candidates.results.some(r=>r.id===p.id&&r.shopifyProductId===p.shopifyProductId)))throw new Error('Incomplete canonical candidate coverage');
const original=readProducts('development/amazgifts-products.json.gz.b64');
const originalDigest=canonicalProductDigest(original);
if(originalDigest!==require('./merchant-feed-registry.js').getMerchant('amazgifts').expected.artifactSha256)throw new Error('Incident snapshot changed');
const images=new Map(decoded.results.map(r=>[r.id,r]));if(images.size!==decoded.results.length)throw new Error('Duplicate image evidence');
const rejected=[],selected=[],duplicates=new Map();
function category(title,type){const s=(title+' '+type).toLowerCase();if(/schlüsselanhänger|schluesselanhaenger|keychain/.test(s))return 'gifts.personalized.keychains';if(/armb[aä]nd|armreif|kette|\bring(?:e|en)?\b|ohrring|anhänger|anhanger|schmuck/.test(s))return 'gifts.personalized.jewelry';if(/bild|foto|photo|rahmen|leinwand|lampe|licht|projektion/.test(s))return 'gifts.personalized.photo-gifts';return 'gifts.personalized.other';}
for(const r of candidates.results){
 const image=images.get(r.id);
 if(r.status!=='pass'||image?.status!=='pass'){rejected.push({id:r.id,merchantProductId:r.shopifyProductId,finalProductUrl:r.finalProductUrl,reason:r.reason||image?.reason||'missing-decoded-image'});continue;}
 const source=original.find(p=>p.merchantVariantId===r.source.merchant_product_id);
 if(!source||r.product.directUrl!==source.directUrl||r.product.affiliateUrl!==source.affiliateUrl||r.source.aw_deep_link!==source.affiliateUrl)throw new Error('Source identity/link mapping changed: '+r.id);
 if(image.url!==r.product.image||image.bodySha256!==r.image.bodySha256)throw new Error('Decoded image does not match selected artifact');
 const duplicateKey=r.product.name.normalize('NFKC').trim().toLowerCase()+'|'+image.bodySha256;
 if(duplicates.has(duplicateKey)){rejected.push({id:r.id,merchantProductId:r.shopifyProductId,finalProductUrl:r.finalProductUrl,reason:'duplicate-live-title-and-image',keptProductId:duplicates.get(duplicateKey)});continue;}
 duplicates.set(duplicateKey,r.product.id);
 r.product.category=category(r.product.name,r.product.rawAttributes.productType);r.product.rawAttributes.taxonomySource='verified_live_title_and_type';r.product.updatedAt=r.completedAt;
 // Availability remains UNKNOWN in the public feed contract: current selection
 // uses available variants but makes no guaranteed delivery/shipping claim.
 selected.push(r);
}
selected.sort((a,b)=>a.product.id.localeCompare(b.product.id));
if(!selected.length)throw new Error('No fully verified eligible products');
const products=selected.map(r=>r.product),digest=canonicalProductDigest(products),completedAt=new Date().toISOString();
const health={version:1,auditorVersion:1,merchant:'amazgifts',scope:'full',status:'pass',artifactSha256:digest,policySha256:policyDigest(policyFor('amazgifts')),productCount:products.length,expectedTargets:products.length*2,startedAt:candidates.startedAt,completedAt,results:selected.flatMap(r=>[r.direct,r.affiliate]),failedTargets:0};
validateReport(health,{key:'amazgifts',products});
const quality={version:1,merchant:'amazgifts',scope:'full',status:'pass',artifactSha256:digest,productCount:products.length,startedAt:candidates.startedAt,completedAt,decoder:decoded.decoder,results:selected.map(r=>({status:'pass',productId:r.product.id,merchantProductId:r.shopifyProductId,variantId:r.variant.id,available:r.variant.available,price:r.product.price,currency:r.product.currency,finalProductUrl:r.finalProductUrl,metadataSha256:r.metadataSha256,checkedAt:images.get(r.id).checkedAt,image:{...r.image,...images.get(r.id)}}))};
validateQualityReport(quality,{key:'amazgifts',products});
fs.mkdirSync('destination-health',{recursive:true});
const source='development/amazgifts-verified-products.json.gz.b64';
fs.writeFileSync(source,zlib.gzipSync(Buffer.from(JSON.stringify(products)),{level:9}).toString('base64')+'\n');
fs.writeFileSync('destination-health/amazgifts-clean-links.json',JSON.stringify(health,null,2)+'\n');
fs.writeFileSync('destination-health/amazgifts-clean-quality.json',JSON.stringify(quality,null,2)+'\n');
const categoryCounts=products.reduce((a,p)=>(a[p.category]=(a[p.category]||0)+1,a),{});
fs.writeFileSync('production-merchant-artifacts.json',JSON.stringify({version:1,merchants:{amazgifts:{source,productCount:products.length,artifactSha256:digest,identityPath:'rawAttributes.shopifyProductId',categoryCounts,ancestorArtifactSha256:originalDigest}}},null,2)+'\n');
const selection={version:1,checkedCandidateFamilies:whitelist.length,selectedProducts:products.length,rejectedProducts:rejected.length,artifactSha256:digest,originalArtifactSha256:originalDigest,completedAt,rejected,selected:selected.map(r=>({productId:r.product.id,merchantProductId:r.shopifyProductId,variantId:r.variant.id,awProductId:r.source.aw_product_id,originalMerchantDeepLink:r.source.merchant_deep_link,awDeepLink:r.source.aw_deep_link,finalProductUrl:r.finalProductUrl,price:r.product.price,image:r.product.image,sourceRows:whitelist.find(p=>p.id===r.id).sourceRows}))};
fs.writeFileSync('destination-health/amazgifts-clean-selection.json',JSON.stringify(selection,null,2)+'\n');
const pages=load('url-audit.json');fs.writeFileSync('destination-health/amazgifts-page-audit.json',JSON.stringify(pages,null,2)+'\n');
console.log(JSON.stringify({selected:products.length,rejected,categoryCounts,artifactSha256:digest},null,2));
