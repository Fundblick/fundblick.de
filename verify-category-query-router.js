'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function route(query,extra=''){
 let redirected=null;const window={location:{search:'?q='+encodeURIComponent(query)+extra,pathname:'/search.html',replace:value=>{redirected=value}},addEventListener(){}};
 const context=vm.createContext({window,URLSearchParams});vm.runInContext(fs.readFileSync('facet-schemas.js','utf8'),context);vm.runInContext(fs.readFileSync('category-query-router.js','utf8'),context);return redirected;
}
for(const query of ['Mosaiktisch','Hocker','Beistelltisch','Lampe','Vase','Korb','Zusatzfutter','Anthbot Genie'])assert.equal(route(query),null,'product subtype/model must remain a text query: '+query);
for(const [query,category]of [['Möbel','home.furniture'],['moebel','home.furniture'],['home.decor','home.decor'],['Pferd','pet.equestrian'],['Mähroboter','home.garden.robot-mowers'],['Mähroboter Zubehör','home.garden.robot-mower-accessories']]){
 const target=route(query);assert.ok(target,query);const p=new URL('https://fundblick.de'+target).searchParams;assert.equal(p.get('category'),category);assert.equal(p.get('rawq'),query);assert.equal(p.has('q'),false);
}
assert.equal(route('Mosaiktisch','&category=home.decor'),null,'explicit category selection is preserved');
console.log('Category routing: category names route; product types and model queries keep their meaning OK');
