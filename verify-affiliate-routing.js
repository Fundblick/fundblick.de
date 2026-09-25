'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const policy=require('./affiliate-link-policy.js');
const normalizer=require('./adcell-feed-normalizer.js');
const config=require('./affiliate-config.js');

assert.equal(config.adcell.enabled,false,'ADCELL must stay inactive before activation');
assert.equal(config.adcell.outboundEnabled,false,'real ADCELL outbound links must stay inactive before activation');
assert.equal(config.adcell.trackingEnabled,false,'ADCELL tracking must stay inactive before activation');
const active={adcell:{enabled:true,outboundEnabled:true,trackingEnabled:true}};
const both={directUrl:'https://merchant.example/item',affiliateUrl:'https://tracking.example/click'};
assert.equal(policy.resolve(both,active,{decision:'granted'}).mode,'affiliate');
assert.equal(policy.resolve(both,active,{decision:'denied'}).mode,'direct');
assert.equal(policy.resolve({affiliateUrl:'https://tracking.example/click'},active,{decision:'denied'}).reason,'consent-required');
assert.equal(policy.resolve({directUrl:'javascript:alert(1)'},active,{decision:'denied'}).allowed,false);
assert.equal(policy.resolve({simulated:true,...both},active,{decision:'granted'}).allowed,false,'simulator offers must never navigate externally');
const normalized=normalizer.normalize({sku:'42',title:'Demo',price:'1.299,90 €',shop:'Demo Shop',direct:'https://merchant.example/p/42',track:'https://tracking.example/p/42',image:'https://merchant.example/p.jpg'},
  {id:'sku',name:'title',price:'price',merchant:'shop',directUrl:'direct',affiliateUrl:'track',imageUrl:'image'},
  {programId:'123',feedId:'feed-a'});
assert.equal(normalized.id,'adcell:123:42');
assert.equal(normalized.price,1299.9);
assert.equal(normalized.source,'adcell');
assert.equal(normalized.directUrl,'https://merchant.example/p/42');
assert.equal(normalized.affiliateUrl,'https://tracking.example/p/42');
const links=fs.readFileSync('language-links.js','utf8');
for(const file of ['affiliate-consent-version.js','affiliate-link-policy.js','affiliate-outbound.js'])assert.ok(links.includes(file),`${file} must be bootstrapped site-wide`);
assert.ok(!links.includes('https://www.adcell.de/js'),'FundBlick must not preload ADCELL tracking code');
console.log('affiliate routing and ADCELL feed preparation passed');
