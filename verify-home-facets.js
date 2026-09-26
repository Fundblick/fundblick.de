'use strict';
const assert=require('assert');
const {classify,inferFamily}=require('./home-facet-classifier.js');
const cases=[
 [{name:'Marokkanischer Hocker aus Mangoholz'},'furniture',{type:'Hocker',material:'Holz',style:'Marokkanisch'}],
 [{name:'Orientalischer Mosaiktisch Metall'},'furniture',{type:'Mosaiktisch',style:'Orientalisch'}],
 [{name:'Pendelleuchte aus Messing marokkanisch'},'lighting',{type:'Hänge- / Pendelleuchte',material:'Messing',style:'Marokkanisch'}],
 [{name:'Vintage Spiegel aus Holz'},'decor',{type:'Spiegel',material:'Holz',style:'Vintage'}],
 [{name:'Seegras Korb für Aufbewahrung im Wohnzimmer'},'living',{type:'Korb / Aufbewahrung',material:'Naturfaser',room:'Wohnbereich'}],
 [{name:'Pouf Hocker - Leder',category:'home.living'},'living',{type:'Hocker',material:'Leder'}],
 [{name:'Orientalischer Teppich aus Baumwolle',category:'home.living'},'living',{type:'Teppich',material:'Textil'}],
 [{name:'Keramik Waschbecken fürs Bad',category:'home.decor'},'decor',{type:'Waschbecken',material:'Keramik',room:'Bad'}]
];
for(const [p,f,expected] of cases){const got=classify(p,f);for(const [k,v] of Object.entries(expected)){const values=Array.isArray(got[k])?got[k]:[got[k]];assert(values.includes(v),`${p.name}: expected ${k}=${v}, got ${JSON.stringify(got[k])}`)}}
assert.equal(inferFamily({name:'Pouf Hocker - Leder',category:'home.living'},'living'),'furniture');
assert.equal(inferFamily({name:'Marokkanische Pendelleuchte',category:'home.decor'},'decor'),'lighting');
assert.equal(inferFamily({name:'Keramik Waschbecken fürs Bad',category:'home.decor'},'decor'),'living');
assert.deepStrictEqual(classify({name:'Produkt ohne belastbare Merkmale'},'furniture'),{});
console.log(`Home facet classifier OK: ${cases.length} positive cases + merchant-category correction + unknown-data guard.`);
