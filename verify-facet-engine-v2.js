'use strict';
const assert=require('assert');
global.FBHomeFacetClassifier=require('./home-facet-classifier.js');
global.FB_CATEGORY_SCHEMAS={furniture:{facets:[{key:'type',label:'Produkttyp',values:['Hocker','Mosaiktisch','Regal']},{key:'material',label:'Material',values:['Holz','Metall','Rattan']},{key:'style',label:'Stil',values:['Marokkanisch','Orientalisch','Modern']}]}};
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
const explicit={facets:[{key:'type',values:['Hocker','Mosaiktisch','Regal']},{key:'material',values:['Holz','Metall','Rattan']},{key:'room',values:['Bad']}]};
assert.deepStrictEqual(engine.facetsFor(products,explicit).map(x=>x.key),['type','material']);
const categoryUrlFacets=engine.facetsFor(products,null);
assert.deepStrictEqual(categoryUrlFacets.map(x=>x.key),['type','material','style'],'category-only URL must still render furniture facets');
assert.equal(engine.dominantSchema(products,null),global.FB_CATEGORY_SCHEMAS.furniture);
assert(engine.matches(products[0],'type',new Set(['Hocker'])));
assert(!engine.matches(products[2],'type',new Set(['Hocker'])));
console.log('Facet engine v2 OK: category-URL schema fallback, data-driven options, counts and matching.');
