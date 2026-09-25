'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const i18n=require('./product-copy-i18n.js');
assert.equal(i18n.SUPPORTED.length,20);
for(const lang of i18n.SUPPORTED){assert.ok(i18n.COPY[lang],`missing ${lang}`);assert.equal(i18n.COPY[lang].cats.length,13,`bad category labels ${lang}`);}
const arabicGeneric=i18n.localize({title:'Wooden Bathroom Sink With Mirror',description:'The Wooden Bathroom Sink with Mirror is a stylish bathroom item.',brand:'Bath Trends'},'ar');
assert.match(arabicGeneric.title,/أثاث/);
assert.doesNotMatch(arabicGeneric.description,/Wooden|Bathroom|Mirror|stylish/i);
assert.match(arabicGeneric.description,/FundBlick/);
const arabicModel=i18n.localize({title:'AudioLab Wire 300 On-Ear',description:'Wired On-Ear headphones with microphone.',brand:'AudioLab',family:'audio'},'ar');
assert.equal(arabicModel.title,'AudioLab Wire 300 On-Ear');
assert.match(arabicModel.description,/صوتيات/);
const germanGeneric=i18n.localize({title:'Red Lipstick',description:'Classic red lipstick.',brand:'Chic Cosmetics'},'de');
assert.match(germanGeneric.title,/Beauty/);
assert.doesNotMatch(germanGeneric.description,/Classic red lipstick/i);
const english=i18n.localize({title:'Red Lipstick',description:'Classic red lipstick.',brand:'Chic Cosmetics'},'en');
assert.equal(english.title,'Red Lipstick');
assert.equal(english.description,'Classic red lipstick.');
const catalog=JSON.parse(fs.readFileSync('products.json','utf8'));
assert.ok(catalog.length>20,'expected representative test catalog');
for(const product of catalog){
  for(const lang of i18n.SUPPORTED.filter(x=>x!=='en')){
    const localized=i18n.localize({title:product.name,description:product.description,brand:product.brand},lang);
    assert.ok(localized.title.trim(),`empty localized title for ${product.id}/${lang}`);
    assert.ok(localized.description.trim(),`empty localized description for ${product.id}/${lang}`);
    assert.notEqual(localized.description,product.description,`source description leaked for ${product.id}/${lang}`);
  }
}
const arabicCatalog=catalog.map(product=>i18n.localize({title:product.name,description:product.description,brand:product.brand},'ar'));
assert.ok(arabicCatalog.every(item=>/[؀-ۿ]/.test(item.description)),'Arabic catalog descriptions must contain Arabic text');
console.log('product copy localization tests passed');
