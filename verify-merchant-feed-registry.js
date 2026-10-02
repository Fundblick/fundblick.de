'use strict';
const assert=require('node:assert/strict');
const {merchants,getMerchant,assertInput}=require('./merchant-feed-registry.js');

assert(Object.keys(merchants).length>=1,'registry must contain at least one merchant');
for(const [key,config] of Object.entries(merchants)){
  assert.equal(config.key,key,`${key}: key mismatch`);
  assert(config.merchant,`${key}: merchant name required`);
  assert(config.network,`${key}: network required`);
  assert(config.advertiserId,`${key}: advertiserId required`);
  assert(config.normalizer,`${key}: normalizer required`);
  assert(config.inputPattern instanceof RegExp,`${key}: inputPattern must be RegExp`);
  assert(Array.isArray(config.catalogCategories)&&config.catalogCategories.length,`${key}: catalog categories required`);
  assert.equal(getMerchant(key),config,`${key}: lookup must be stable`);
}
const amazgifts=getMerchant('amazgifts');
assert.equal(amazgifts.expected.products,2964);
assert.match(amazgifts.expected.rawFeedSha256,/^[a-f0-9]{64}$/);
assert.equal(amazgifts.expected.rawFeedSha256,'9dadbc32d81303f38a4d8a92520d9ac29abf5aea3ac8c10d89393e8fd43822bf');
assert.match(amazgifts.expected.artifactSha256,/^[a-f0-9]{64}$/);
assert.equal(amazgifts.expected.artifactSha256,'1525723cff8652b1822d522a9fe7b7443d0dbf77ca4ba28300b860da642fb9e8');
const anthbot=getMerchant('anthbot');
assert.equal(anthbot.network,'awin');
assert.equal(anthbot.advertiserId,'125144');
assert.doesNotThrow(()=>assertInput(anthbot,'125144-retail-de_DE.csv.gz'));
assert.doesNotThrow(()=>assertInput(anthbot,'125144-retail-de_DE.csv'));
assert.throws(()=>assertInput(anthbot,'120341-retail-de_DE.csv.gz'),/unexpected feed filename/);
assert.throws(()=>getMerchant('unknown-merchant'),/Unknown merchant feed key/);
console.log(`Merchant feed registry gate passed: ${Object.keys(merchants).length} merchant(s)`);
