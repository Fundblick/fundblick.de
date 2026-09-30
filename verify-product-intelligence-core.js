'use strict';
const assert=require('node:assert/strict');
const intel=require('./product-intelligence-core.js');

let x=intel.analyze('Castrol 10W40 5 Liter');
assert.equal(x.category,'automotive.motor_oil');
assert.equal(x.attributes.brand.value,'castrol');
assert.equal(x.attributes.viscosity.value,'10W-40');
assert.equal(x.attributes.volume.value,5);
assert.ok(x.facets.includes('unit_price'));

x=intel.analyze('Adidas Schuhe Damen EU 39');
assert.equal(x.category,'fashion.shoes');
assert.equal(x.attributes.brand.value,'adidas');
assert.equal(x.attributes.size.value,39);
assert.ok(x.facets.includes('color'));

x=intel.analyze('Samsung Fernseher 65 Zoll');
assert.equal(x.category,'electronics.television');
assert.equal(x.attributes.brand.value,'samsung');
assert.equal(x.attributes.screen_size.value,65);

x=intel.analyze('Bosch Akkuschrauber 18V');
assert.equal(x.category,'tools.cordless_drill');
assert.equal(x.attributes.brand.value,'bosch');
assert.equal(x.attributes.voltage.value,18);

x=intel.analyze('seltsames unbekanntes produkt xyz');
assert.equal(x.category,null);
assert.deepEqual(x.facets,['brand','price']);
console.log('Product intelligence core: golden queries + conservative fallback OK');
