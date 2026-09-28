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
const anthbot=getMerchant('anthbot');
assert.equal(anthbot.network,'awin');
assert.equal(anthbot.advertiserId,'125144');
assert.doesNotThrow(()=>assertInput(anthbot,'125144-retail-de_DE.csv.gz'));
assert.doesNotThrow(()=>assertInput(anthbot,'125144-retail-de_DE.csv'));
assert.throws(()=>assertInput(anthbot,'120341-retail-de_DE.csv.gz'),/unexpected feed filename/);
assert.throws(()=>getMerchant('unknown-merchant'),/Unknown merchant feed key/);
console.log(`Merchant feed registry gate passed: ${Object.keys(merchants).length} merchant(s)`);
