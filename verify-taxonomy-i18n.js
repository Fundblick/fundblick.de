'use strict';
const fs=require('fs');
const assert=require('assert');
const taxonomy=fs.readFileSync('taxonomy-value-i18n.js','utf8');
const search=fs.readFileSync('search.html','utf8');

assert(search.includes('taxonomy-value-i18n.js'),'search.html must load taxonomy-value-i18n.js');
assert(search.indexOf('facet-value-i18n.js')<search.indexOf('taxonomy-value-i18n.js'),'taxonomy layer must run after existing facet localization');

for(const pair of [
  ["Beistelltisch:'side_table'","side_table:'Приставной столик'"],
  ["Bank:'bench'","bench:'Скамья'"],
  ["'Sessel / Sofa':'armchair_sofa'","armchair_sofa:'Кресло / диван'"],
  ["Holz:'wood'","wood:'Дерево'"],
  ["Metall:'metal'","metal:'Металл'"],
  ["Textil:'textile'","textile:'Текстиль'"],
  ["Leder:'leather'","leather:'Кожа'"]
]){
  assert(taxonomy.includes(pair[0]),`missing taxonomy alias ${pair[0]}`);
  assert(taxonomy.includes(pair[1]),`missing Russian label ${pair[1]}`);
}

assert(taxonomy.includes("if(!input||input.dataset.key==='brand')return"),'brand values must remain merchant/source labels');
assert(taxonomy.includes('const translated=translate(input.value)'),'display translation must derive from unchanged input value');
assert(!/input\.value\s*=/.test(taxonomy),'taxonomy localization must never rewrite filter input values');
assert(!/history\.|location\.(?:href|assign|replace)/.test(taxonomy),'taxonomy localization must not mutate navigation/history');
assert(taxonomy.includes('window.FundBlickTaxonomyI18n'),'taxonomy API must remain inspectable for future languages');

console.log('Taxonomy localization safety checks passed.');