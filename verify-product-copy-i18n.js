'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const i18n=require('./product-copy-i18n.js');

assert.equal(i18n.SUPPORTED.length,20);
assert.ok(i18n.COPY.de&&i18n.COPY.ru&&i18n.COPY.en,'reference language packs missing');
for(const lang of ['de','ru','en'])assert.equal(i18n.COPY[lang].cats.length,13,`bad category labels ${lang}`);

// Real merchant source copy must never be replaced by invented localized prose.
const real={title:'AudioLab Wire 300 On-Ear',description:'Wired On-Ear headphones with microphone.',brand:'AudioLab',family:'audio'};
for(const lang of i18n.SUPPORTED){
  const localized=i18n.localize(real,lang);
  assert.equal(localized.title,real.title,`merchant title changed for ${lang}`);
  assert.equal(localized.description,real.description,`merchant description changed for ${lang}`);
  assert.equal(localized.preserved,true,`merchant copy not marked preserved for ${lang}`);
}
assert.equal(i18n.localize(real,'ru').category,'Аудио');

// Only explicit FundBlick test/demo copy may be replaced by localized explanatory copy.
const ruTest=i18n.localize({title:'FundBlick Testprodukt',description:'Testdaten',family:'furniture'},'ru');
assert.match(ruTest.description,/Тестовый товар/);
assert.match(ruTest.description,/Мебель/);
assert.equal(ruTest.preserved,false);
const deTest=i18n.localize({title:'Testprodukt',description:'Demo product',family:'audio'},'de');
assert.match(deTest.description,/Testprodukt/);
assert.equal(deTest.preserved,false);

// Curated catalog remains structurally usable under the new source-preservation policy.
const catalog=JSON.parse(fs.readFileSync('development/core-products.json','utf8'));
assert.ok(catalog.length>=15,'expected representative curated catalog');
for(const product of catalog){
  const localized=i18n.localize({title:product.name,description:product.description,brand:product.brand,family:product.family,category:product.category},'ru');
  assert.ok(localized.title.trim(),`empty title for ${product.id}`);
  assert.ok(localized.category.trim(),`empty Russian category for ${product.id}`);
  if(!i18n.isTestCopy(product.name,product.description)){
    assert.equal(localized.title,product.name,`real source title changed for ${product.id}`);
    assert.equal(localized.description,product.description||'',`real source description changed for ${product.id}`);
    assert.equal(localized.preserved,true,`real source copy not preserved for ${product.id}`);
  }
}
console.log('product copy policy tests passed: merchant source preserved, explicit test copy localized');
