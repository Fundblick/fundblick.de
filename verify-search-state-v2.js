'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const state=require('./search-state-guard.js');
const relevance=require('./search-relevance.js');

let params=new URLSearchParams('lang=ar&brand=BrewDemo%2CBosch%2CBath+Trends&sort=brand');
let out=state.sanitizeParams(params);
assert.equal(out.changed,true);
assert.equal(params.has('brand'),false);
assert.equal(params.has('sort'),false);
assert.equal(params.has('scope'),false);

params=new URLSearchParams('q=kopfh%C3%B6rer&brand=AudioLab&scope=kopfhorer');
out=state.sanitizeParams(params);
assert.equal(out.changed,false);
assert.equal(params.get('brand'),'AudioLab');

params=new URLSearchParams('q=smartphone&brand=AudioLab&scope=kopfhorer');
state.sanitizeParams(params);
assert.equal(params.has('brand'),false);
assert.equal(params.get('scope'),'smartphone');

const exact=relevance.scoreFields({title:'Bosch Akkuschrauber GSR 18V-55',brand:'Bosch',description:'18 Volt Akkuschrauber'},'Bosch');
const descriptionOnly=relevance.scoreFields({title:'Demo Werkzeug',brand:'Test',description:'kompatibel mit Bosch'},'Bosch');
const miss=relevance.scoreFields({title:'Adidas Laufschuh',brand:'Adidas',description:'Running shoe'},'Bosch');
assert.ok(exact>descriptionOnly);
assert.ok(descriptionOnly>miss);

const html=fs.readFileSync('search.html','utf8');
assert.ok(html.includes('id="results-search-reset"'),'results page must include the search reset behavior');
assert.ok(html.includes("const clearResultSearch=()=>{input.value='';input.removeAttribute('value');};"),'results search field must be cleared visually');
assert.ok(html.includes("form.addEventListener('submit',()=>queueMicrotask(clearResultSearch))"),'results search must clear again after a new search');
assert.ok(html.includes("window.addEventListener('pageshow',clearResultSearch)"),'results search must also clear after browser restore/refresh');
console.log('search state, relevance and empty result-search verification passed');
