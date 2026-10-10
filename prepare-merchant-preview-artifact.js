'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const {getMerchant}=require('./merchant-feed-registry.js');
const {canonicalProductDigest}=require('./merchant-artifact-integrity.js');
const {validateQualityReport}=require('./merchant-product-quality.js');
function gtin(value){const s=String(value||'');if(!/^(?:\d{12}|\d{13}|\d{14})$/.test(s))return '';const digits=s.split('').map(Number),check=digits.pop();const sum=digits.reverse().reduce((n,d,i)=>n+d*(i%2?1:3),0);return (10-sum%10)%10===check?s:'';}
function prepare(key,feed,qualityFile,sourceFile,reportFile){
 const config=getMerchant(key),normalizer=require(config.normalizer),raw=fs.readFileSync(feed),digest=crypto.createHash('sha256').update(raw).digest('hex');
 if(config.expected.rawFeedSha256!==digest)throw new Error('Original source digest mismatch');
 const input=normalizer.readCsv(feed),candidates=normalizer.normalize(input),errors=normalizer.validate(candidates);
 if(errors.length||candidates.length!==config.expected.products)throw new Error('Original source normalization contract failed');
 const audit=JSON.parse(fs.readFileSync(qualityFile,'utf8'));
 if(audit.sourceSha256!==digest||!audit.completedAt||audit.decoder?.name!=='Pillow'||!Array.isArray(audit.results)||!audit.blocked)throw new Error('Complete original-source metadata/image evidence required');
 const evidence=new Map(audit.results.map(r=>[r.variantId,r]));
 if(evidence.size!==audit.results.length)throw new Error('Duplicate metadata evidence');
 const all=new Set(candidates.map(p=>p.merchantVariantId));
 for(const id of [...evidence.keys(),...Object.keys(audit.blocked)])if(!all.has(id))throw new Error('Unexpected evidence identity');
 for(const id of all)if(Number(evidence.has(id))+Number(Object.hasOwn(audit.blocked,id))!==1)throw new Error('Incomplete or overlapping source coverage');
 const accepted=[],results=[],excluded=[];
 for(const p of candidates){
  const r=evidence.get(p.merchantVariantId);
  if(audit.blocked[p.merchantVariantId]||r?.status!=='pass'){excluded.push({id:p.id,reason:audit.blocked[p.merchantVariantId]||r?.reason||'missing-evidence'});continue;}
  if(r.id!==p.id||r.price!==p.price||r.currency!==p.currency||r.available!==true||r.image?.url!==p.image||r.finalProductUrl!==p.directUrl)throw new Error('Source/verified metadata mismatch '+p.id);
  if(normalizer.verifiedCategory){const tax=normalizer.verifiedCategory(p,r);if(!tax){excluded.push({id:p.id,reason:'unclassified-verified-main-item'});continue;}p.category=tax.category;Object.assign(p.rawAttributes,{productType:tax.productType,sourceProductType:r.sourceProductType,taxonomyFamily:tax.family});}
  p.productGroupId='shopify-'+config.advertiserId+'-'+r.merchantProductId;
  p.gtin=gtin(r.barcode);p.mpn=String(r.sku||'');
  Object.assign(p.rawAttributes,{shopifyProductId:r.merchantProductId,verifiedFinalProductUrl:r.finalProductUrl,metadataSha256:r.metadataSha256});
  accepted.push(p);results.push({productId:p.id,variantId:r.variantId,merchantProductId:r.merchantProductId,status:'pass',checkedAt:r.checkedAt,price:r.price,currency:r.currency,available:true,finalProductUrl:r.finalProductUrl,metadataSha256:r.metadataSha256,image:r.image});
 }
 if(!accepted.length)throw new Error('No qualified preview candidates');
 const report={version:1,merchant:key,status:'pass',scope:'full',decoder:audit.decoder,artifactSha256:canonicalProductDigest(accepted),productCount:accepted.length,startedAt:audit.startedAt,completedAt:audit.completedAt,results};
 validateQualityReport(report,{key,products:accepted});
 for(const file of [sourceFile,reportFile])fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(sourceFile,zlib.gzipSync(JSON.stringify(accepted),{level:9}).toString('base64')+'\n');
 fs.writeFileSync(reportFile,JSON.stringify(report)+'\n');
 const contract={source:sourceFile,productCount:accepted.length,artifactSha256:report.artifactSha256,identityPath:config.artifactIdentityPath||'rawAttributes.shopifyProductId',categoryCounts:accepted.reduce((a,p)=>(a[p.category]=(a[p.category]||0)+1,a),{})};
 console.log(JSON.stringify({sourceRows:candidates.length,accepted:accepted.length,excluded,contract,qualityReport:reportFile},null,2));
 return {products:accepted,contract,excluded};
}
if(require.main===module)prepare(...process.argv.slice(2));
module.exports={prepare,gtin};
