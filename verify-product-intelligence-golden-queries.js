'use strict';
const assert=require('node:assert/strict');
const core=require('./product-intelligence-core.js');
const strategy=require('./product-query-strategy.js');
const pipeline=require('./product-intelligence-pipeline.js');
const matrix=[
 ['Castrol 10W40 5 Liter','automotive.motor_oil',['viscosity','volume']],
 ['Winterreifen 205/55 R16','automotive.tires',['width','aspect_ratio','rim_size']],
 ['Adidas Damen Schuhe EU 39','fashion.shoes',['brand','size']],
 ['Nike Jacke Herren schwarz','fashion.clothing',['brand']],
 ['Samsung Fernseher 65 Zoll','electronics.television',['brand','screen_size']],
 ['Apple Smartphone 256 GB','electronics.smartphone',['brand','storage']],
 ['Sony Bluetooth Kopfhörer','electronics.headphones',['brand']],
 ['Lenovo Laptop 512 GB','computing.laptop',['brand','storage']],
 ['LG Monitor 27 Zoll','computing.monitor',['brand','screen_size']],
 ['Bosch Akkuschrauber 18V','tools.cordless_drill',['brand','voltage']],
 ['Makita Winkelschleifer 18V','tools.angle_grinder',['brand','voltage']],
 ['Dyson Staubsauger','home.vacuum',['brand']],
 ['DeLonghi Kaffeevollautomat','home.coffee_machine',['brand']],
 ['Husqvarna Mähroboter','garden.robot_mower',['brand']],
 ['Stihl Rasenmäher','garden.lawn_mower',['brand']],
 ['Cybex Kinderwagen','baby.stroller',['brand']],
 ['Cube Mountainbike','sports.bicycle',['brand']],
 ['Haibike E-Bike','sports.ebike',['brand']],
 ['Miele Waschmaschine','appliance.washing_machine',['brand']],
 ['Siemens Kühlschrank','appliance.refrigerator',['brand']]
];
for(const [q,category,attrs] of matrix){const a=core.analyze(q);assert.equal(a.category,category,`${q}: category`);for(const id of attrs)assert.ok(a.attributes[id],`${q}: missing ${id}`);const s=strategy.build(q,'de');assert.equal(s.analysis.category,category,`${q}: strategy category`);assert.ok(s.query.length>=q.length,`${q}: strategy must not erase user query`)}
let results=[{title:'Continental Winterreifen 205/55 R16',price:89},{title:'Michelin Winterreifen 205/55 R16',price:95},{title:'Goodyear Winterreifen 225/45 R17',price:99}];let out=pipeline.run('Winterreifen 205/55 R16',results,{conflicts:{minKeep:2,minCleanRatio:.5}});assert.equal(out.results.length,2);assert.equal(out.quality.suppressedCount,1);assert.ok(out.results.every(x=>x.attributes.width.value===205));
results=[{title:'Bosch Akkuschrauber 18 V 5 Ah 60 Nm',price:129},{title:'Bosch Akkuschrauber 18 V 2 Ah 40 Nm',price:99},{title:'Makita Akkuschrauber 12 V',price:79}];out=pipeline.run('Bosch Akkuschrauber 18V',results,{conflicts:{minKeep:2,minCleanRatio:.5}});assert.equal(out.results.length,2);assert.ok(out.results.every(x=>x.attributes.brand.value==='bosch'&&x.attributes.voltage.value===18));
console.log(`Golden query matrix: ${matrix.length} product classes + ranking quality scenarios OK`);
