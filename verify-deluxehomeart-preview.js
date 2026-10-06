'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {readProducts,requireHealth}=require('./destination-link-health.js');
const {requireProductQuality}=require('./merchant-product-quality.js');
const {assertProductionArtifact}=require('./merchant-production-artifact.js');
const {classify,inferFamily}=require('./home-facet-classifier.js');
const {registry}=require('./taxonomy-registry.js');
const {getMerchant}=require('./merchant-feed-registry.js'),{canonicalProductDigest}=require('./merchant-artifact-integrity.js');
const profile=JSON.parse(fs.readFileSync('development/merchant-preview-profile.json','utf8'));
const approval=profile.merchants.deluxehomeart,products=approval.sources.flatMap(readProducts);
requireHealth('deluxehomeart',products,approval);requireProductQuality('deluxehomeart',products,approval);
assertProductionArtifact('deluxehomeart',products,approval.sources[0],{version:1,merchants:profile.artifacts});
const productionSources=JSON.parse(fs.readFileSync('production-catalog-sources.json','utf8')),productionApprovals=JSON.parse(fs.readFileSync('production-merchant-approvals.json','utf8'));
assert(!productionApprovals.merchants.deluxehomeart);assert(!productionSources.some(s=>s.includes('deluxehomeart')));
const selection=JSON.parse(fs.readFileSync('development/deluxehomeart-preview-selection.json','utf8')),config=getMerchant('deluxehomeart');assert.equal(selection.sourceRows,config.expected.products);assert.equal(selection.sourceSha256,config.expected.rawFeedSha256);assert.equal(selection.selectedProductCount,products.length);assert.equal(selection.selectedArtifactSha256,canonicalProductDigest(products));assert.equal(selection.excluded.length+products.length,selection.sourceRows);assert.equal(new Set([...products.map(p=>p.id),...selection.excluded.map(p=>p.id)]).size,selection.sourceRows);
const allIds=new Set();for(const p of products){assert(!allIds.has(p.id));allIds.add(p.id);assert.notEqual(p.merchantVariantId,'55306770153846');assert.notEqual(p.merchantVariantId,'55389532258678');assert.equal(p.testData,false);assert.equal(p.source.advertiserId,'120411');assert.equal(p.source.network,'awin');assert.equal(p.shippingCost,null);assert.equal(p.deliveryDays,null);assert.equal(typeof p.description,'string');const family=inferFamily(p),a=classify(p);assert.notEqual(family,'furniture');assert.equal(p.category,'home.'+family);assert(registry.families[family].types.includes(a.type));assert(!Array.isArray(a.type));}
for(const p of products.filter(p=>p.brand==='Ikon Copenhagen'))assert.equal(classify(p).type,'Steh- / Tischlampe');
assert.equal(products.filter(p=>p.brand==='Ikon Copenhagen').length,16);
for(const p of products.filter(p=>p.rawAttributes.sourceProductType==='LED Schwimmlicht'))assert.equal(classify(p).type,'LED-Dekolicht');
assert.equal(products.filter(p=>classify(p).type==='Batterien').length,5);
assert.equal(products.filter(p=>classify(p).type==='Fernbedienung').length,3);
const langs=['de','en','ru','tr','ar','pl','ro','uk','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
for(const lang of langs){const window={FundBlickLanguage:{lang}};vm.runInNewContext(fs.readFileSync('taxonomy-value-i18n.js','utf8'),{window,document:{documentElement:{lang},querySelectorAll:()=>[],getElementById:()=>null},MutationObserver:class{observe(){}},queueMicrotask:()=>{}});for(const colour of new Set(products.map(p=>p.rawAttributes.facets.color).filter(Boolean))){const id=window.FundBlickTaxonomyI18n.aliases[colour];assert(id,colour);assert(window.FundBlickTaxonomyI18n.labels[lang][id],lang+' '+colour);}for(const term of ['LED-Kerze','LED-Dekolicht','Lichterkette','Batterien','Fernbedienung']){const translated=window.FundBlickTaxonomyI18n.translate(term);assert(translated);if(lang!=='de')assert.notEqual(translated,term,lang+' '+term);}}
console.log('DeluxeHomeart preview: real full evidence, independent identities, correct categories/types, source-only prices/shipping, production isolation and 20-language own labels passed: '+products.length+' products');
