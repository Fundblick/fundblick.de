'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const window={FundBlickLanguage:{lang:'de'}};
const context=vm.createContext({window,globalThis:window,console});
vm.runInContext(fs.readFileSync('facet-schemas.js','utf8'),context);
vm.runInContext(fs.readFileSync('search-facet-engine-v2.js','utf8'),context);
const cases=[
 ['gifts.personalized.keychains','Schlüsselanhänger'],
 ['gifts.personalized.jewelry','Schmuck'],
 ['gifts.personalized.photo-gifts','Fotogeschenk'],
 ['craft.jewelry-making.supplies','Schmuckzubehör']
];
for(const [family,productType] of cases){
 assert.ok(window.FB_CATEGORY_SCHEMAS[family],family+' schema missing');
 const p={family,rawAttributes:{productType},attrs:{}};
 window.FBFacetEngineV2.enrich(p);
 assert.equal(p.attrs.productType,productType,family+' productType facet');
 assert.equal(window.FBFacetEngineV2.matches(p,'productType',new Set([productType])),true,family+' facet match');
}
const search=fs.readFileSync('search.js','utf8');
assert.match(search,/taxonomy=String\(raw\.category\|\|''\)/,'search must read canonical category');
assert.match(search,/for\(const \[id,schema\] of Object\.entries\(SCHEMAS\)\)/,'search must infer schema family');
assert.match(search,/deliveryDays,rawAttributes\}/,'search product must retain rawAttributes');
assert.match(search,/p\.affiliateUrl=affiliateUrl;p\.directUrl=directUrl/,'search product must retain outbound URLs for live decorator');
assert.match(search,/const tokens=routedSchema\?\[\]:interpret\(translated\)/,'canonical routed category must not be narrowed again by alias literals');
console.log('Amazgifts search runtime taxonomy, facets and outbound data wiring OK');
