'use strict';
const assert=require('assert');
const utility=require('./refinement-utility.js');
const analysis={category:'fashion.shoes',attributes:{brand:{value:'Nike'},size:null}};
const facets={primary:[
 {id:'brand',coverage:1,confidence:1,distinctValues:3,refinable:true,values:['Nike','Adidas','Puma']},
 {id:'size',coverage:.9,confidence:.95,distinctValues:5,refinable:true,values:[39,40,41,42,43]},
 {id:'audience',coverage:.85,confidence:.9,distinctValues:2,refinable:true,values:['women','men']},
 {id:'material',coverage:.2,confidence:.7,distinctValues:2,refinable:true,values:['textile','leather']},
 {id:'color',coverage:1,confidence:1,distinctValues:1,refinable:false,values:['black']},
 {id:'price',coverage:1,confidence:1,distinctValues:0,refinable:false,values:[]}
]};
const out=utility.suggest(analysis,facets,{limit:4});
assert(!out.some(x=>x.id==='brand'),'already answered query constraint must not be asked again');
assert(out.some(x=>x.id==='size'),'high-value open dimension should be suggested');
assert(out.some(x=>x.id==='audience'),'discriminative audience should be suggested');
assert(!out.some(x=>x.id==='material'),'weak coverage should not become a clarification');
assert(!out.some(x=>x.id==='color'),'single-value facet cannot refine');
assert(!out.some(x=>x.id==='price'),'price is excluded from clarification prompts');
assert.equal(utility.suggest({attributes:{size:{value:39}}},{primary:[{id:'size',coverage:1,confidence:1,distinctValues:3,refinable:true,values:[39,40,41]}]}).length,0);
console.log('adaptive refinement utility checks passed');
const unseenAnalysis={category:'provisional.home.air_purifier',attributes:{}};
const unseenFacets={primary:[
 {id:'room_area',coverage:.9,confidence:.9,distinctValues:3,refinable:true,values:[20,40,60]},
 {id:'filter_type',coverage:.8,confidence:.9,distinctValues:2,refinable:true,values:['HEPA H13','HEPA H14']},
 {id:'noise',coverage:.15,confidence:.8,distinctValues:2,refinable:true,values:[22,35]}
]};
const unseen=utility.suggest(unseenAnalysis,unseenFacets,{limit:4});
assert.deepEqual(unseen.map(x=>x.id),['room_area','filter_type'],'unprepared product families use evidence quality rather than product-specific rules');
