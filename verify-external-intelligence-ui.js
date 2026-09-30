'use strict';
const assert=require('node:assert/strict');const ui=require('./external-intelligence-ui.js');
const items=[{attributes:{brand:{value:'castrol'},volume:{value:5}}},{attributes:{brand:{value:'shell'},volume:{value:5}}},{attributes:{brand:{value:'castrol'},volume:{value:1}}}];
assert.equal(ui.apply(items,{brand:'castrol'}).length,2);assert.equal(ui.apply(items,{brand:'castrol',volume:'5'}).length,1);assert.equal(ui.apply(items,{brand:''}).length,3);console.log('External intelligence UI: dynamic facet filtering OK');