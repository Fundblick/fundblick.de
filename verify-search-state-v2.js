'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const state=require('./search-state-guard.js');
const relevance=require('./search-relevance.js');
const catalogLoader=require('./catalog-loader.js');

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

const largeManifest={itemCount:5000,shards:{'0':{},'1':{},'2':{},'3':{}}};
const largeIndex=[
  {i:'a',n:'Audio Kopfhörer',b:'AudioLab',c:'electronics headphones',q:'audio kopfhorer headphones wireless',s:0},
  {i:'b',n:'Bosch GSR 18V-55',b:'Bosch',c:'tools drills',q:'bosch gsr 18v 55 akkuschrauber drill',s:1},
  {i:'c',n:'Samsung TV',b:'Samsung',c:'electronics televisions',q:'samsung television qled tv',s:2},
  {i:'d',n:'Adidas Runner',b:'Adidas',c:'fashion shoes',q:'adidas runner schuhe shoes',s:3}
];
assert.deepEqual(catalogLoader.selectShardIds(largeManifest,largeIndex,'Bosch GSR'),['1'],'large catalog search must select only relevant shards for a precise query');
assert.deepEqual(catalogLoader.selectShardIds({...largeManifest,itemCount:19},largeIndex,'Bosch GSR'),['0','1','2','3'],'small catalogs must keep full-loading behavior');
assert.equal(catalogLoader.LARGE_CATALOG_THRESHOLD,600);

const html=fs.readFileSync('search.html','utf8');
const mobileCss=fs.readFileSync('search-mobile.css','utf8');
const loaderSource=fs.readFileSync('catalog-loader.js','utf8');
assert.ok(html.includes('id="results-search-reset"'),'results page must include the search reset behavior');
assert.ok(html.includes("const clearResultSearch=()=>{input.value='';input.removeAttribute('value');};"),'results search field must be cleared visually');
assert.ok(html.includes("form.addEventListener('submit',()=>queueMicrotask(clearResultSearch))"),'results search must clear again after a new search');
assert.ok(html.includes("window.addEventListener('pageshow',clearResultSearch)"),'results search must also clear after browser restore/refresh');
assert.ok(html.includes('search-mobile.css?v=20260925-live23'),'mobile search CSS must be cache-busted');
assert.ok(html.includes('catalog-loader.js?v=20260925-live24'),'query-aware catalog loader must be cache-busted');
assert.ok(html.includes('id="large-catalog-search-navigation"'),'large catalogs must reload on a new query so the correct shards can be selected');
assert.ok(loaderSource.includes('MAX_QUERY_SHARDS=32'),'large catalog loader must cap query shard fan-out');
assert.ok(loaderSource.includes('loadedShardIds:ids'),'catalog loader must expose loaded shard diagnostics');
assert.ok(mobileCss.includes('.results-page>.search-form{position:sticky;top:8px;z-index:45'),'mobile result search must stay reachable while scrolling');
assert.ok(mobileCss.includes('.mobile-search-tools{display:grid;grid-template-columns:1fr 1fr;gap:8px;position:sticky;top:76px'),'mobile filter/sort tools must stack below the sticky search bar');
console.log('search state, relevance, mobile UX and query-aware shard loading verification passed');
