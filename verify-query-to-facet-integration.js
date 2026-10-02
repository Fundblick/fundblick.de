'use strict';
const assert=require('assert');
const blueprint=require('./query-facet-blueprint.js');
const extractor=require('./product-result-attribute-extractor.js');
const facets=require('./product-facet-engine.js');
const pipeline=require('./product-intelligence-pipeline.js');

const q='32GB DDR5 RAM 6000 MHz für Laptop';
const bp=blueprint.analyze(q,'de');
assert.equal(bp.category,'computing.memory');
assert.equal(bp.attributes.memory_generation,'DDR5');
assert.equal(bp.attributes.memory_capacity.value,32);
assert.equal(bp.attributes.memory_speed.value,6000);
assert.equal(bp.attributes.memory_form_factor,'SO-DIMM');

const raw=[
 {title:'Kingston Fury 32GB DDR5 6000 MHz SO-DIMM Kit 2x16GB',url:'https://shop.example/a',productUrl:'https://shop.example/a',price:'109,90 €',currency:'EUR',productCandidate:true,attributes:{brand:{value:'Kingston',confidence:'HIGH'}}},
 {title:'Corsair Vengeance 32GB DDR5 6000 MHz SO-DIMM 2x16GB',url:'https://shop2.example/b',productUrl:'https://shop2.example/b',price:'119,90 €',currency:'EUR',productCandidate:true,attributes:{brand:{value:'Corsair',confidence:'HIGH'}}}
];
const extracted=extractor.extractAll(raw,{category:'computing.memory'});
for(const item of extracted){assert.equal(item.attributes.memory_generation.value,'DDR5');assert.equal(item.attributes.memory_capacity.value,32);assert.equal(item.attributes.memory_speed.value,6000);assert.equal(item.attributes.memory_form_factor.value,'SO-DIMM')}
const fs=facets.derive({category:bp.category,facets:bp.facets,attributes:bp.attributes},extracted,{minCoverage:.35,maxPrimary:7});
assert(fs.primary.some(x=>x.id==='memory_generation'));
assert(fs.primary.some(x=>x.id==='memory_capacity'));
assert(fs.primary.some(x=>x.id==='memory_speed'));
assert(fs.primary.some(x=>x.id==='memory_form_factor'));
const state=pipeline.run(q,raw,{language:'de',facets:{minCoverage:.35,maxPrimary:7}});
assert.equal(state.analysis.category,'computing.memory');
assert.equal(state.blueprint.category,'computing.memory');
assert(state.facets.primary.some(x=>x.id==='memory_generation'));
console.log('query-to-facet integration checks passed');