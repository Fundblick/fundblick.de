'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('offer-comparison.js','utf8');
const home=fs.readFileSync('search.html','utf8');
const expected=['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
for(const lang of expected){const needle=lang==='zh-Hans'?"'zh-Hans':":`${lang}:`;assert.ok(source.includes(needle),`offer comparison copy missing ${lang}`);}
assert.ok(source.includes('FundBlickCatalog'),'offer comparison must use live catalog');
assert.ok(source.includes('product.offers'),'offer comparison must render structured offers');
assert.ok(source.includes('offer.simulated')||source.includes('Simulated')||source.includes('simulated'),'offer comparison must remain clearly simulated');
assert.ok(!source.includes('location.href='),'simulated offers must not create outbound navigation');
assert.ok(home.includes('offer-comparison.js'),'search page must load offer comparison');
console.log('offer comparison UI smoke tests passed');
