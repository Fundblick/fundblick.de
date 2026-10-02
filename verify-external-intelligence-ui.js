'use strict';
const assert=require('node:assert/strict');const ui=require('./external-intelligence-ui.js');
const items=[{attributes:{brand:{value:'castrol'},volume:{value:5}}},{attributes:{brand:{value:'shell'},volume:{value:5}}},{attributes:{brand:{value:'castrol'},volume:{value:1}}}];
assert.equal(ui.apply(items,{brand:'castrol'}).length,2);assert.equal(ui.apply(items,{brand:'castrol',volume:'5'}).length,1);assert.equal(ui.apply(items,{brand:''}).length,3);
assert.equal(ui.display('brand','liqui moly'),'Liqui Moly');assert.equal(ui.display('viscosity','10w40'),'10W-40');assert.match(ui.display('volume',5),/^5(?:[.,]0+)? l$/);assert.equal(ui.display('voltage',18),'18 V');assert.equal(ui.display('storage',256),'256 GB');
assert.equal(ui.label('room_area'),'Raumfläche');assert.equal(ui.label('filter_type'),'Filtertyp');assert.equal(ui.label('noise'),'Geräuschpegel');assert.equal(ui.display('room_area',{value:30,unit:'m²'}),'30 m²');assert.equal(ui.display('noise',{value:24,unit:'dB'}),'24 dB');
assert.deepEqual(ui.valuesFor({id:'volume',values:[10,1,5,5]}),[1,5,10]);assert.deepEqual(ui.valuesFor({id:'size',values:['44','38','42']}),['38','42','44']);
console.log('External intelligence UI: filtering + normalized display + natural ordering OK');