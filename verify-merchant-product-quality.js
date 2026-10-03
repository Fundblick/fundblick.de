'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {validateQualityReport,requireProductQuality}=require('./merchant-product-quality.js');
const {productionArtifactFor,assertProductionArtifact}=require('./merchant-production-artifact.js');
const {readProducts,MAX_AGE_MS}=require('./destination-link-health.js');
const {canonicalProductDigest}=require('./merchant-artifact-integrity.js');
const key='amazgifts',contract=productionArtifactFor(key),products=readProducts(contract.source);
assertProductionArtifact(key,products,contract.source);
const approval=JSON.parse(fs.readFileSync('production-merchant-approvals.json','utf8')).merchants[key];
const rawReport=JSON.parse(fs.readFileSync(approval.productQualityReport||'destination-health/amazgifts-clean-quality.json','utf8'));
// Quarantine/rollback can ship even after historical evidence expires. Active
// production still requires the real current clock; historical regression tests
// use the original report completion time and never authorize activation.
const now=approval.approved===true?Date.now():Date.parse(rawReport.completedAt);
const report=approval.approved===true?requireProductQuality(key,products,approval):validateQualityReport(rawReport,{key,products,now});
const reject=(mutate,pattern)=>{const copy=JSON.parse(JSON.stringify(report));mutate(copy);assert.throws(()=>validateQualityReport(copy,{key,products,now}),pattern);};
reject(r=>{r.results.pop();},/coverage/);
reject(r=>{r.results[0].image.decoded=false;},/decoded image/);
reject(r=>{r.results[0].image.width=1;},/decoded image/);
reject(r=>{r.results[0].image.url='https://amazgifts.de/missing.jpg';},/decoded image/);
reject(r=>{r.results[0].image.entropy=0;},/decoded image/);
reject(r=>{r.results[0].image.bodySha256='missing';},/decoded image/);
reject(r=>{r.results[0].price+=1;},/metadata mismatch/);
reject(r=>{r.results[0].variantId='other';},/metadata mismatch/);
reject(r=>{r.results[0].available=false;},/metadata mismatch/);
reject(r=>{r.startedAt=new Date(now-MAX_AGE_MS-1).toISOString();},/stale/);
reject(r=>{r.artifactSha256='0'.repeat(64);},/digest mismatch/);
assert.throws(()=>requireProductQuality(key,products,{}),/report required/);
assert.throws(()=>assertProductionArtifact(key,products,'development/amazgifts-products.json.gz.b64'),/source mismatch/);
assert.throws(()=>assertProductionArtifact(key,[{...products[0],price:1},...products.slice(1)],contract.source),/digest mismatch/);
// Digest equality alone cannot excuse duplicate merchant families in a newly
// reviewed pin: exercise the identity/category validator with a temporary registry.
const registryBefore=fs.readFileSync('production-merchant-artifacts.json');
try{
 const duplicate=products.map(p=>({...p}));duplicate[1]={...duplicate[1],rawAttributes:{...duplicate[1].rawAttributes,shopifyProductId:duplicate[0].rawAttributes.shopifyProductId}};
 const registry=JSON.parse(registryBefore);registry.merchants[key].artifactSha256=canonicalProductDigest(duplicate);fs.writeFileSync('production-merchant-artifacts.json',JSON.stringify(registry));
 assert.throws(()=>assertProductionArtifact(key,duplicate,contract.source),/duplicate\/missing/);
}finally{fs.writeFileSync('production-merchant-artifacts.json',registryBefore);}
console.log('Product quality gate passed: decoded images, live metadata, freshness, price/variant/image binding, unique families, archive rejection');
