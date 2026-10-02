'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const approvals=JSON.parse(fs.readFileSync('production-merchant-approvals.json','utf8'));
const sources=JSON.parse(fs.readFileSync('production-catalog-sources.json','utf8'));
const registry=require('./merchant-feed-registry.js').getMerchant('amazgifts');
const approval=approvals?.merchants?.amazgifts;
assert(approval,'Amazgifts production approval record missing');
assert.equal(approval.network,'awin');
assert.equal(approval.advertiserId,'87569');
assert.equal(approval.publisherId,'3106259');
assert.deepEqual(approval.sources,['development/amazgifts-products.json.gz.b64']);
assert.equal(registry.expected.products,2964);
assert.equal(registry.expected.rawFeedSha256,'9dadbc32d81303f38a4d8a92520d9ac29abf5aea3ac8c10d89393e8fd43822bf');
assert.equal(registry.expected.artifactSha256,'32ca063fc6d02a7ba6407175100e7da84f0c75731f097033b6096aff55b2d65a');
const productionBuilder=fs.readFileSync('build-production-catalog.js','utf8');
assert.match(productionBuilder,/merchantKey==='amazgifts'/,'production builder must recognize Amazgifts source');
assert.match(productionBuilder,/canonicalProductDigest\(data\)/,'production builder must verify canonical Amazgifts digest');
assert.match(productionBuilder,/Amazgifts production artifact digest mismatch/,'production builder must reject mutated Amazgifts artifact');
const source='development/amazgifts-products.json.gz.b64';
if(approval.approved===true){
  assert.equal(approval.termsCleared,true,'approved Amazgifts requires explicit advertiser terms clearance');
  assert(sources.includes(source),'approved Amazgifts source missing from production manifest');
  assert(fs.existsSync(source),'approved Amazgifts artifact missing from repository');
}else{
  assert.equal(approval.termsCleared,false,'blocked Amazgifts should retain unresolved terms state');
  assert(!sources.includes(source),'blocked Amazgifts source must not be in production manifest');
}
console.log(`Amazgifts live-readiness configuration gate passed: approved=${approval.approved}`);
