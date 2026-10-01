'use strict';
const assert=require('assert');const b=require('./query-facet-blueprint.js');
let x=b.analyze('Ram ddr');assert.equal(x.category,'computing.memory');assert(x.facets.includes('memory_generation'));assert(x.facets.includes('memory_capacity'));
x=b.analyze('32GB DDR5 RAM 6000 MHz für Laptop');assert.equal(x.category,'computing.memory');assert.equal(x.attributes.memory_generation,'DDR5');assert.equal(x.attributes.memory_capacity.value,32);assert.equal(x.attributes.memory_speed.value,6000);assert.equal(x.attributes.memory_form_factor,'SO-DIMM');
x=b.analyze('10W40 Motoröl 5 Liter');assert.equal(x.category,'automotive.motor_oil');assert.equal(x.attributes.viscosity,'10W-40');assert.equal(x.attributes.volume.value,5);
x=b.analyze('65 Zoll OLED Fernseher');assert.equal(x.category,'electronics.television');assert.equal(x.attributes.screen_size.value,65);assert.equal(x.attributes.display_technology,'OLED');
x=b.analyze('Zündkerze');assert.equal(x.category,'automotive.spark_plug');assert(x.facets.includes('heat_range'));
for(const [q,cat] of [['Laptop 16 GB','computing.laptop'],['Smartphone 256 GB','electronics.smartphone'],['Bluetooth Kopfhörer','electronics.headphones'],['Staubsauger','home.vacuum'],['Waschmaschine','home.washing_machine'],['Mähroboter','garden.robot_mower'],['Fahrrad','cycling.bicycle']]){x=b.analyze(q);assert.equal(x.category,cat,`query family ${q}`);assert(x.facets.length>=4)}
x=b.analyze('Laptop 16 GB RAM 512 GB 15,6 Zoll');assert.equal(x.attributes.memory.value,16);assert.equal(x.attributes.storage.value,512);assert.equal(x.attributes.screen_size.value,15.6);
x=b.analyze('Waschmaschine 9 kg 1400 rpm');assert.equal(x.attributes.capacity.value,9);assert.equal(x.attributes.spin_speed.value,1400);
x=b.analyze('Mähroboter 800 m²');assert.equal(x.attributes.max_area.value,800);
x=b.analyze('irgendein völlig neues Spezialprodukt');assert.equal(x.category,null);assert.equal(x.needsSemanticFallback,true);
console.log('query facet blueprint checks passed');