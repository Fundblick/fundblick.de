'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const window={location:{search:'',pathname:'/search.html'},document:{querySelector:()=>null},FundBlickLanguage:{lang:'de'}};
const context=vm.createContext({window,globalThis:window,URLSearchParams,module:{exports:{}},exports:{},require,console});
vm.runInContext(fs.readFileSync('facet-schemas.js','utf8'),context);
vm.runInContext(fs.readFileSync('search-facet-engine-v2.js','utf8'),context);
context.module={exports:{}};context.exports=context.module.exports;
vm.runInContext(fs.readFileSync('search.js','utf8'),context);
const {inferFamily}=context.module.exports;
const cases=[
 ['gifts.personalized.keychains','Personalisierter Foto Schlüsselanhänger','Schlüsselanhänger'],
 ['gifts.personalized.jewelry','Personalisierte Foto Projektion Herz Kette mit Bild im Stein','Schmuck'],
 ['gifts.personalized.photo-gifts','Personalisiertes Fotogeschenk mit Bild','Fotogeschenk'],
 ['craft.jewelry-making.supplies','Perlenkettenzubehör Stahldraht','Schmuckzubehör']
];
for(const [category,name,productType] of cases){
 const family=inferFamily(name,category);
 assert.equal(family,category,category+' must survive family inference');
 const p={name,description:'',category,family,rawAttributes:{productType},attrs:{}};
 window.FBFacetEngineV2.enrich(p);
 assert.equal(p.attrs.productType,productType,category+' productType facet');
 assert.equal(window.FBFacetEngineV2.matches(p,'productType',new Set([productType])),true,category+' facet match');
}
console.log('Amazgifts search runtime: taxonomy family and productType facets survive end-to-end OK');
