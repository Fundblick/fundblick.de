'use strict';
const assert=require('assert');
const adapter=require('./semantic-taxonomy-adapter.js');
const pipeline=require('./product-intelligence-pipeline.js');
const extractor=require('./product-result-attribute-extractor.js');

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
assert(nike.results.length>=1,'brand plus type query keeps relevant shoe evidence');
assert(nike.results.every(x=>x.attributes?.brand?.value),'structured brand evidence remains attached to retained shoe results');

const colorEvidence=extractor.extract({title:'Nike Damen Schuhe weiß Größe 39'}, {category:'fashion.shoes'});
assert.equal(colorEvidence.attributes.color?.value,'white','explicit shoe color evidence survives lower-level extraction');
assert.equal(colorEvidence.attributeEvidence.color,'title');

const unseen=pipeline.run('Luftreiniger fürs Schlafzimmer',[
 {title:'AirPure 300 Luftreiniger',rawAttributes:{productType:'Luftreiniger'},attributes:{room_area:{value:30,unit:'m²',confidence:'HIGH'},filter_type:{value:'HEPA H13',confidence:'HIGH'},noise:{value:24,unit:'dB',confidence:'HIGH'}}},
 {title:'CleanAir 500 Luftreiniger',rawAttributes:{productType:'Luftreiniger'},attributes:{room_area:{value:50,unit:'m²',confidence:'HIGH'},filter_type:{value:'HEPA H14',confidence:'HIGH'},noise:{value:31,unit:'dB',confidence:'HIGH'}}},
 {title:'SleepAir Luftreiniger',rawAttributes:{productType:'Luftreiniger'},attributes:{room_area:{value:20,unit:'m²',confidence:'HIGH'},filter_type:{value:'HEPA H13',confidence:'HIGH'},noise:{value:18,unit:'dB',confidence:'HIGH'}}}
],{taxonomy:[],facets:{minCoverage:.35,maxPrimary:8}});
assert.equal(unseen.semanticResolution.category,'evidence.luftreiniger');assert.equal(unseen.semanticResolution.provisional,true);assert(unseen.facets.primary.some(x=>x.id==='room_area'));assert(unseen.facets.primary.some(x=>x.id==='filter_type'));assert(unseen.refinementSuggestions.some(x=>x.id==='room_area'||x.id==='filter_type'),'unprepared evidence-only family can produce generic high-utility refinement');
const unseenRoom=unseen.facets.primary.find(x=>x.id==='room_area');assert.deepEqual(unseenRoom.values.slice().sort((a,b)=>a-b),[20,30,50],'unseen-family values remain grounded in structured offer evidence');assert(!unseen.facets.primary.some(x=>x.id==='size'),'unseen family must not inherit an unrelated prepared facet');

const stableIdA=require('./semantic-product-resolver.js').stableId('Luftreiniger');const stableIdB=require('./semantic-product-resolver.js').stableId('Luftreiniger');assert.equal(stableIdA,stableIdB);assert.equal(stableIdA,'evidence.luftreiniger');

const ambiguous=pipeline.run('Air fürs Zimmer',[
 {title:'AirPure Gerät',rawAttributes:{productType:'Luftreiniger'},attributes:{filter_type:{value:'HEPA',confidence:'HIGH'}}},
 {title:'CoolAir Gerät',rawAttributes:{productType:'Klimagerät'},attributes:{cooling_capacity:{value:2.5,unit:'kW',confidence:'HIGH'}}}
],{taxonomy:[]});assert.equal(ambiguous.analysis.category||null,null,'ambiguous low-confidence evidence must not become an active product family');assert.equal(ambiguous.semanticResolution.needsRemoteFallback,true);

const weakEvidence=pipeline.run('Luftreiniger',[
 {title:'AirPure Gerät',rawAttributes:{productType:'Luftreiniger'},attributes:{filter_type:{value:'HEPA',confidence:'HIGH'}}},
 {title:'Noisy snippet',rawAttributes:{productType:'Produkt'},attributes:{size:{value:'XL',confidence:'HIGH'}}}
],{taxonomy:[]});assert.equal(weakEvidence.semanticResolution.category,'evidence.luftreiniger');assert(!weakEvidence.facets.primary.some(x=>x.id==='size'),'generic noisy product labels must not inject unrelated selectable facets');

const queryConstraintUnseen=pipeline.run('Luftreiniger HEPA H14',[
 {title:'CleanAir H14',rawAttributes:{productType:'Luftreiniger'},attributes:{filter_type:{value:'HEPA H14',confidence:'HIGH'},room_area:{value:45,unit:'m²',confidence:'HIGH'}}},
 {title:'AirPure H13',rawAttributes:{productType:'Luftreiniger'},attributes:{filter_type:{value:'HEPA H13',confidence:'HIGH'},room_area:{value:30,unit:'m²',confidence:'HIGH'}}}
],{taxonomy:[]});assert.equal(queryConstraintUnseen.semanticResolution.category,'evidence.luftreiniger');

const unknown=pipeline.run('QXZ Spezialadapter 4711',[],{taxonomy});
assert.equal(unknown.semanticResolution.needsRemoteFallback,true);
assert.equal(unknown.analysis.category||null,null);
console.log('generic semantic taxonomy/facet integration checks passed');