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
// Execute the actual category-routing function. A historical spelling assertion
// missed the equivalent early-return implementation now used in production.
const runSearchSource=search.match(/function runSearch\(\)\{[^\r\n]+\}/)?.[0];
assert.ok(runSearchSource,'search routing function missing');
let captured=null;
const routing={window,queryAliases:[],state:{query:'foto schlüsselanhänger'},routedCategory:'gifts.personalized.keychains',products:[{id:'one',family:'gifts.personalized.keychains'},{id:'two',family:'gifts.personalized.jewelry'}],schemaFor:id=>window.FB_CATEGORY_SCHEMAS[id],interpret:()=>{throw new Error('Canonical route must not reinterpret alias words');},render:()=>{captured={category:routing.category,base:routing.base};}};
vm.runInNewContext('('+runSearchSource+')()',routing);
assert.equal(captured.category.id,'gifts.personalized.keychains');
assert.equal(captured.base,routing.products,'canonical route must retain the category pool for facet filtering');
routing.routedCategory='';routing.interpret=()=>['foto'];routing.detect=()=>null;routing.queryMatch=p=>p.id==='two';
vm.runInNewContext('('+runSearchSource+')()',routing);
assert.deepEqual(captured.base.map(p=>p.id),['two'],'free text must still apply the query matcher');
const categoryI18n=fs.readFileSync('category-display-i18n.js','utf8');
assert.match(categoryI18n,/Personalisierte Schlüsselanhänger/,'German gift category label missing');
assert.match(categoryI18n,/Personalized keychains/,'English gift category fallback missing');
assert.match(categoryI18n,/Персонализированные брелоки/,'Russian gift category label missing');
assert.match(categoryI18n,/Object\.assign\(\{\},labels\.en,labels\[lang\]\|\|\{\}\)/,'missing translations must fall back to English');
for(const [id,term] of [['gifts.personalized.keychains','foto schlüsselanhänger'],['gifts.personalized.jewelry','halskette mit foto'],['gifts.personalized.photo-gifts','geschenk mit foto'],['craft.jewelry-making.supplies','perlenkettenzubehör']]) assert.ok(window.FB_CATEGORY_SCHEMAS[id]?.terms?.includes(term),id+' missing routed alias '+term);
console.log('Amazgifts search runtime taxonomy, facets, routed aliases and outbound data wiring OK');
