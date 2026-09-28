'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const normalizer=require('./anthbot-feed-normalizer.js');

// Build a representative product through the real ANTHBOT normalizer.
const raw={advertiser_id:'125144',id:'m1',title:'ANTHBOT Genie 800 1500m² 4G',description:'Mähroboter',link:'https://de.anthbot.com/products/genie-800',aw_deep_link:'https://www.awin1.com/cread.php?awinmid=125144',image_link:'https://example.com/a.jpg',price:'999.00 EUR',availability:'in_stock',brand:'xcotton',condition:'new',google_product_category:'Home & Garden > Lawn & Garden > Outdoor Power Equipment > Lawn Mowers > Robotic Mowers'};
const product=normalizer.normalize([raw])[0];
assert(product,'normalizer must produce ANTHBOT product');
assert.equal(product.rawAttributes.facets.lawnAreaM2,1500);
assert.equal(product.rawAttributes.facets.connectivity4G,true);

// Exercise the browser facet engine in isolation and verify feed-backed evidence survives enrichment.
const context={globalThis:null};context.globalThis=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('search-facet-engine-v2.js','utf8'),context,{filename:'search-facet-engine-v2.js'});
const engine=context.FBFacetEngineV2;
assert(engine,'facet engine must initialize');
const searchProduct={name:product.name,rawAttributes:product.rawAttributes,attrs:{},family:'robot-mowers'};
engine.enrich(searchProduct);
assert.equal(searchProduct.attrs.lawnAreaM2,'1500');
assert.equal(searchProduct.attrs.connectivity4G,'4G');
assert.equal(searchProduct.attrs.model,'Genie 800');
assert.equal(searchProduct.attrs.condition,'Neu');

// Guard the exact search wiring that previously dropped rawAttributes.
const searchSource=fs.readFileSync('search.js','utf8');
assert.match(searchSource,/const rawAttributes=raw\.rawAttributes&&typeof raw\.rawAttributes==='object'/,'search normalize must retain rawAttributes');
assert.match(searchSource,/deliveryDays,rawAttributes\}/,'search product object must expose rawAttributes to facet engine');
assert.match(searchSource,/FBFacetEngineV2\?\.enrich\)window\.FBFacetEngineV2\.enrich\(p\)/,'search must enrich after rawAttributes are attached');
console.log('ANTHBOT search facet wiring gate passed');
