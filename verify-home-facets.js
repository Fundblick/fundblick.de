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
 [{name:'Orientalischer Teppich aus Baumwolle',category:'home.living'},'living',{type:'Teppich',material:'Textil',style:'Orientalisch'}],
 [{name:'Keramik Waschbecken fürs Bad',category:'home.decor'},'decor',{type:'Waschbecken',material:'Keramik',room:'Bad'}],
 [{name:'Orientalischer Blumentopf Leon - M',category:'home.living'},'living',{type:'Vase / Blumentopf',style:'Orientalisch'}],
 [{name:'Musterfliese Marokkanische Fliesen 20x20 cm – FL7031',category:'home.living'},'living',{type:'Fliese',style:'Marokkanisch'}],
 [{name:'Indisches Holz Mandala Hossam',category:'home.living'},'living',{type:'Wanddekoration',material:'Holz',style:'Boho / Ethno'}],
 [{name:'E14-Fassung mit Zugentlastung',category:'home.living'},'living',{type:'Lampenfassung / Anschluss'}],
 [{name:'Orientalischer Kamelhocker Sadia - Braun',category:'home.living'},'living',{type:'Hocker'}],
 [{name:'Esszimmerstuhl Beige - 4er Set',category:'home.furniture'},'furniture',{type:'Stuhl'}],
 [{name:'Polsterstuhl Esszimmerstuhl - 2er Set',category:'home.furniture'},'furniture',{type:'Stuhl'}],
 [{name:'Pflanzenregal Vicenza',category:'home.furniture'},'furniture',{type:'Regal'}],
 [{name:'Orientalischer Teetisch Safi D40',category:'home.furniture'},'furniture',{type:'Beistelltisch'}],
 [{name:'Tee- Tisch Karam 50cm',category:'home.furniture'},'furniture',{type:'Beistelltisch'}],
 [{name:'Orientalisches Tablett Loubna Gold - Mittel',category:'home.living',googleProductCategory:'Furniture'},'living',{type:'Schale / Tablett'}],
 [{name:'Marokkanisches Leder Sitzkissen Rbati Orange',category:'home.furniture',googleProductCategory:'Furniture'},'furniture',{type:'Kissen / Sitzkissen',material:'Leder'}],
 [{name:'Marokkanischer Eisen-Wandhaken',category:'home.lighting',googleProductCategory:'Lighting'},'lighting',{type:'Haken / Hakenleiste',material:'Metall'}],
 [{name:'Holz Wandverkleidung White Washed Coral',category:'home.living',googleProductCategory:'Furniture'},'living',{type:'Wanddekoration',material:'Holz'}],
 [{name:'Marokko-Mosaikbrunnen Asfor Blau',category:'home.decor',googleProductCategory:'Home Decor'},'decor',{type:'Brunnen'}]
];
for(const [p,f,expected] of cases){const got=classify(p,f);for(const [k,v] of Object.entries(expected)){const values=Array.isArray(got[k])?got[k]:[got[k]];assert(values.includes(v),`${p.name}: expected ${k}=${v}, got ${JSON.stringify(got[k])}`)}}
assert.equal(inferFamily({name:'Pouf Hocker - Leder',category:'home.living'},'living'),'furniture');
assert.equal(inferFamily({name:'Marokkanische Pendelleuchte',category:'home.decor'},'decor'),'lighting');
assert.equal(inferFamily({name:'Keramik Waschbecken fürs Bad',category:'home.decor'},'decor'),'living');
assert.equal(inferFamily({name:'E14-Fassung mit Zugentlastung',category:'home.living'},'living'),'lighting');
assert.equal(inferFamily({name:'Orientalischer Kamelhocker Sadia - Braun',category:'home.living'},'living'),'furniture');
assert.equal(inferFamily({name:'Pflanzenregal Vicenza',category:'home.furniture'},'furniture'),'furniture');
assert.equal(inferFamily({name:'Orientalisches Tablett Loubna Gold - Mittel',category:'home.living',googleProductCategory:'Furniture'},'living'),'decor');
assert.equal(inferFamily({name:'Marokkanisches Leder Sitzkissen Rbati Orange',category:'home.furniture',googleProductCategory:'Furniture'},'furniture'),'decor');
assert.equal(inferFamily({name:'Marokkanischer Eisen-Wandhaken',category:'home.lighting',googleProductCategory:'Lighting'},'lighting'),'decor');
assert.equal(inferFamily({name:'Holz Wandverkleidung White Washed Coral',category:'home.living',googleProductCategory:'Furniture'},'living'),'decor');
assert.equal(inferFamily({name:'Marokko-Mosaikbrunnen Asfor Blau',category:'home.decor',googleProductCategory:'Home Decor'},'decor'),'living');
const orientalOnly=classify({name:'Orientalischer Beistelltisch aus Holz'},'furniture');
assert.equal(orientalOnly.style,'Orientalisch','Orientalisch must not imply Marokkanisch');
assert.deepStrictEqual(classify({name:'Produkt ohne belastbare Merkmale'},'furniture'),{});
console.log(`Home facet classifier OK: ${cases.length} positive cases + category correction + style separation + unknown-data guard.`);
