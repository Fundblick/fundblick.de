'use strict';
const assert=require('node:assert/strict');const e=require('./product-result-attribute-extractor.js');
let x=e.extract({title:'Castrol Magnatec 10W-40 Motoröl 5 Liter',description:'Angebot'},{category:'automotive.motor_oil'});assert.equal(x.attributes.brand.value,'castrol');assert.equal(x.attributes.viscosity.value,'10W-40');assert.equal(x.attributes.volume.value,5);
x=e.extract({title:'Adidas Damen Sneaker schwarz EU 39',description:''},{category:'fashion.shoes'});assert.equal(x.attributes.brand.value,'adidas');assert.equal(x.attributes.audience.value,'women');assert.equal(x.attributes.color.value,'black');assert.equal(x.attributes.size.value,39);
x=e.extract({title:'Samsung Smart TV 65 Zoll',description:''},{category:'electronics.television'});assert.equal(x.attributes.brand.value,'samsung');assert.equal(x.attributes.screen_size.value,65);
x=e.extract({title:'Bosch Akkuschrauber 18 V',description:''},{category:'tools.cordless_drill'});assert.equal(x.attributes.voltage.value,18);
console.log('Web offer attribute extractor: category-aware normalized attributes OK');