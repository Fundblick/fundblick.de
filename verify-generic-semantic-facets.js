'use strict';
const assert=require('assert');
const adapter=require('./semantic-taxonomy-adapter.js');
const pipeline=require('./product-intelligence-pipeline.js');

const taxonomy=[
 {id:'kitchen.blender',label:'Standmixer',terms:['Standmixer','Blender'],facets:['power','capacity','material']},
 {id:'home.furniture',label:'Möbel',terms:['Tisch','Stuhl'],facets:['material','color']},
 {id:'fashion.shoes',label:'Schuhe',terms:['Schuhe','Sneaker','Laufschuhe'],facets:['size','audience','color','brand']}
];
const raw=[
 {title:'ProMix Standmixer 1200 W Glas 1,5 Liter',url:'https://shop.example/mix1',productCandidate:true,attributes:{power:{value:1200,unit:'W',confidence:'HIGH'},capacity:{value:1.5,unit:'l',confidence:'HIGH'},material:{value:'Glas',confidence:'HIGH'},brand:{value:'ProMix',confidence:'HIGH'}}},
 {title:'KitchenStar Standmixer 1000 W Glas 1,2 Liter',url:'https://shop2.example/mix2',productCandidate:true,attributes:{power:{value:1000,unit:'W',confidence:'HIGH'},capacity:{value:1.2,unit:'l',confidence:'HIGH'},material:{value:'Glas',confidence:'HIGH'},brand:{value:'KitchenStar',confidence:'HIGH'}}}
];
const state=pipeline.run('Standmixer aus Glas',{length:0}); // guard accidental object input
assert.equal(state.results.length,0);
const resolved=pipeline.run('Standmixer aus Glas',raw,{taxonomy,facets:{minCoverage:.35,maxPrimary:8}});
assert.equal(resolved.blueprint.category,null,'must not rely on a known-family blueprint');
assert.equal(resolved.semanticResolution.category,'kitchen.blender');
assert.equal(resolved.analysis.category,'kitchen.blender');
assert(resolved.facets.primary.some(x=>x.id==='power'));
assert(resolved.facets.primary.some(x=>x.id==='capacity'));
assert(resolved.facets.primary.some(x=>x.id==='material'));
assert(resolved.facets.primary.find(x=>x.id==='material').values.includes('Glas'));

const evidenceOnly=pipeline.run('Pferde Zusatzfutter',[
 {title:'Mineral Plus Pferde Zusatzfutter',category:'pet.equestrian',rawAttributes:{productType:'Pferde Zusatzfutter'},attributes:{brand:{value:'Equi',confidence:'HIGH'}}},
 {title:'Pferde Zusatzfutter Kräuter',category:'pet.equestrian',rawAttributes:{productType:'Pferde Zusatzfutter'},attributes:{brand:{value:'Horse',confidence:'HIGH'}}}
],{taxonomy:[]});
assert.equal(evidenceOnly.semanticResolution.category,'pet.equestrian');

const nike=pipeline.run('Nike Schuhe',[
 {title:'Nike Air Max Schuhe Herren Größe 42 schwarz',category:'fashion.shoes',rawAttributes:{productType:'Schuhe'},attributes:{brand:{value:'Nike',confidence:'HIGH'},size:{value:42,confidence:'HIGH'},audience:{value:'men',confidence:'HIGH'},color:{value:'Schwarz',confidence:'HIGH'}}},
 {title:'Nike Revolution Schuhe Damen Größe 39 weiß',category:'fashion.shoes',rawAttributes:{productType:'Schuhe'},attributes:{brand:{value:'Nike',confidence:'HIGH'},size:{value:39,confidence:'HIGH'},audience:{value:'women',confidence:'HIGH'},color:{value:'Weiß',confidence:'HIGH'}}}
],{taxonomy,facets:{minCoverage:.35,maxPrimary:8}});
assert.equal(nike.semanticResolution.category,'fashion.shoes','brand plus generic product type resolves to the product category, not a brand category');
assert.equal(nike.analysis.category,'fashion.shoes');
assert(nike.facets.primary.some(x=>x.id==='size'));
assert(nike.facets.primary.some(x=>x.id==='audience'));
assert(nike.facets.primary.some(x=>x.id==='color'));

const unknown=pipeline.run('QXZ Spezialadapter 4711',[],{taxonomy});
assert.equal(unknown.semanticResolution.needsRemoteFallback,true);
assert.equal(unknown.analysis.category||null,null);
console.log('generic semantic taxonomy/facet integration checks passed');