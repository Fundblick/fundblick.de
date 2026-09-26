'use strict';
const assert=require('assert');
const {registry}=require('./taxonomy-registry.js');
const classifier=require('./home-facet-classifier.js');
const allowed={type:new Set(),material:new Set(registry.facets.material),style:new Set(registry.facets.style),room:new Set(registry.facets.room)};
for(const f of Object.values(registry.families))for(const t of f.types)allowed.type.add(t);
for(const [family,rules] of Object.entries(classifier.rules)){
  assert(registry.families[family],`Classifier family missing in registry: ${family}`);
  for(const [facet,values] of Object.entries(rules))for(const [label] of values){
    assert(allowed[facet],`Unknown facet: ${facet}`);
    assert(allowed[facet].has(label),`Unregistered taxonomy value: ${family}.${facet}=${label}`);
  }
}
for(const [family,data] of Object.entries(registry.families))assert.equal(data.types.length,new Set(data.types).size,`Duplicate type in ${family}`);
for(const [facet,values] of Object.entries(registry.facets))assert.equal(values.length,new Set(values).size,`Duplicate ${facet} value`);
console.log(`Taxonomy registry OK: ${Object.keys(registry.families).length} families, ${allowed.type.size} canonical types, ${Object.values(registry.facets).reduce((n,v)=>n+v.length,0)} canonical facet values.`);
