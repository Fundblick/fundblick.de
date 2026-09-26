'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const policy=require('./affiliate-link-policy.js');
const normalizer=require('./adcell-feed-normalizer.js');
const config=require('./affiliate-config.js');

for(const [name,provider] of Object.entries({adcell:config.adcell,awin:config.awin})){
  assert.equal(provider.enabled,false,`${name} must stay inactive before activation`);
  assert.equal(provider.outboundEnabled,false,`${name} outbound links must stay inactive before activation`);
  assert.equal(provider.trackingEnabled,false,`${name} tracking must stay inactive before activation`);
}
const adcellActive={defaultNetwork:'adcell',adcell:{enabled:true,outboundEnabled:true,trackingEnabled:true},awin:{enabled:false,outboundEnabled:false,trackingEnabled:false}};
const awinActive={defaultNetwork:'awin',adcell:{enabled:false,outboundEnabled:false,trackingEnabled:false},awin:{enabled:true,outboundEnabled:true,trackingEnabled:true,consentParam:'cons'}};
const both={directUrl:'https://merchant.example/item',affiliateUrl:'https://tracking.example/click'};
assert.equal(policy.resolve({...both,network:'adcell'},adcellActive,{decision:'granted'}).mode,'affiliate');
assert.equal(policy.resolve({...both,network:'adcell'},adcellActive,{decision:'denied'}).mode,'direct');
assert.equal(policy.resolve({affiliateUrl:'https://tracking.example/click',network:'adcell'},adcellActive,{decision:'denied'}).reason,'consent-required');
const awinGranted=policy.resolve({...both,network:'awin'},awinActive,{decision:'granted'});
assert.equal(awinGranted.mode,'affiliate');
assert.equal(new URL(awinGranted.url).searchParams.get('cons'),'1','Awin affiliate link must carry positive consent signal');
const awinDenied=policy.resolve({...both,network:'awin'},awinActive,{decision:'denied'});
assert.equal(awinDenied.mode,'affiliate-no-track','Awin may keep the merchant journey available after tracking rejection');
assert.equal(new URL(awinDenied.url).searchParams.get('cons'),'0','Awin rejected journey must carry cons=0');
const awinDeniedAffiliateOnly=policy.resolve({affiliateUrl:'https://tracking.example/click',network:'awin'},awinActive,{decision:'denied'});
assert.equal(awinDeniedAffiliateOnly.allowed,true,'Awin consent-zero link must remain navigable even without a direct merchant URL');
assert.equal(new URL(awinDeniedAffiliateOnly.url).searchParams.get('cons'),'0');
const awinUnknown=policy.resolve({affiliateUrl:'https://tracking.example/click',network:'awin'},awinActive,{decision:null});
assert.equal(awinUnknown.reason,'consent-required','unknown Awin consent must never silently inherit Awin default consent');
assert.equal(policy.resolve({directUrl:'javascript:alert(1)',network:'awin'},awinActive,{decision:'denied'}).allowed,false);
assert.equal(policy.resolve({simulated:true,...both,network:'awin'},awinActive,{decision:'granted'}).allowed,false,'simulator offers must never navigate externally');
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
assert.ok(!links.includes('https://www.awin1.com'),'FundBlick must not preload Awin tracking code');
console.log('affiliate routing, Awin consent signals and multi-network preparation passed');
