'use strict';
const assert=require('assert');
global.FBHomeFacetClassifier=require('./home-facet-classifier.js');
const engine=require('./search-facet-engine-v2.js');
const products=[
 {family:'furniture',name:'Marokkanischer Hocker aus Holz',attrs:{}},
 {family:'furniture',name:'Hocker aus Metall modern',attrs:{}},
 {family:'furniture',name:'Mosaiktisch orientalisch aus Metall',attrs:{}},
 {family:'furniture',name:'Unklassifiziertes Möbel',attrs:{}}
].map(engine.enrich);
const type=engine.availableValues(products,'type',['Hocker','Mosaiktisch','Regal']);
assert.deepStrictEqual(type,[{value:'Hocker',count:2},{value:'Mosaiktisch',count:1}]);
const material=engine.availableValues(products,'material',['Holz','Metall','Rattan']);
assert.deepStrictEqual(material,[{value:'Holz',count:1},{value:'Metall',count:2}]);
const schema={facets:[{key:'type',values:['Hocker','Mosaiktisch','Regal']},{key:'material',values:['Holz','Metall','Rattan']},{key:'room',values:['Bad']}]};
const facets=engine.facetsFor(products,schema);
assert.deepStrictEqual(facets.map(x=>x.key),['type','material']);
assert(engine.matches(products[0],'type',new Set(['Hocker'])));
assert(!engine.matches(products[2],'type',new Set(['Hocker'])));
console.log('Facet engine v2 OK: data-driven options, counts, empty-facet suppression and matching.');
