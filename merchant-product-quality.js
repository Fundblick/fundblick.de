'use strict';
const fs=require('node:fs');
const {canonicalProductDigest}=require('./merchant-artifact-integrity.js');
const {MAX_AGE_MS}=require('./destination-link-health.js');
function validateQualityReport(report,{key,products,now=Date.now()}){
 const fail=reason=>{throw new Error(`Product quality ${key}: ${reason}`);};
 if(![1,2].includes(report?.version)||report.merchant!==key||report.status!=='pass'||report.scope!=='full'||report.decoder?.name!=='Pillow')fail('full decoded-image and metadata report required');
 if(report.artifactSha256!==canonicalProductDigest(products))fail('artifact digest mismatch');
 const start=Date.parse(report.startedAt),end=Date.parse(report.completedAt);
 if(!Number.isFinite(start)||!Number.isFinite(end)||start>end||end>now||now-start>MAX_AGE_MS)fail('stale/future/invalid report');
 if(report.productCount!==products.length||report.results?.length!==products.length)fail('incomplete coverage');
 const results=new Map(report.results.map(r=>[r.productId,r]));if(results.size!==products.length)fail('duplicate evidence');
 for(const p of products){
  const r=results.get(p.id),image=r?.image,checked=Date.parse(r?.checkedAt);
  if(!r||r.status!=='pass'||checked<start||checked>end||!Number.isFinite(checked))fail('missing/invalid product evidence');
  const stockMatches=report.version===1?r.available===true:typeof p.inStock==='boolean'&&r.available===p.inStock&&p.availability===(p.inStock?'IN_STOCK':'OUT_OF_STOCK');
  if(r.variantId!==p.merchantVariantId||r.merchantProductId!==p.rawAttributes?.shopifyProductId||r.price!==p.price||r.currency!==p.currency||!stockMatches||r.finalProductUrl!==p.rawAttributes?.verifiedFinalProductUrl||r.metadataSha256!==p.rawAttributes?.metadataSha256||!/^[a-f0-9]{64}$/.test(r.metadataSha256||''))fail('metadata mismatch');
  if(image?.url!==p.image||image.status!=='pass'||image.httpStatus!==200||image.decoded!==true||!['JPEG','PNG','WEBP','AVIF'].includes(image.format)||!Number.isInteger(image.width)||!Number.isInteger(image.height)||image.width<200||image.height<200||image.bodyBytes<1000||!/^[a-f0-9]{64}$/.test(image.bodySha256||'')||!Number.isFinite(image.entropy)||image.entropy<0.1)fail('missing/failed decoded image');
 }
 return report;
}
function requireProductQuality(key,products,approval){
 if(!approval?.productQualityReport)throw new Error(`Product quality ${key}: full decoded-image and metadata report required`);
 return validateQualityReport(JSON.parse(fs.readFileSync(approval.productQualityReport,'utf8')),{key,products});
}
module.exports={validateQualityReport,requireProductQuality};
