'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('offer-comparison.js','utf8');
const home=fs.readFileSync('search.html','utf8');
const expected=['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
for(const lang of expected){const needle=lang==='zh-Hans'?"'zh-Hans':":`${lang}:`;assert.ok(source.includes(needle),`offer comparison copy missing ${lang}`);}
assert.ok(source.includes('FundBlickCatalog'),'offer comparison must use live catalog');
assert.ok(source.includes('FundBlickCoupons'),'offer comparison must use coupon engine');
assert.ok(source.includes('rankOffers'),'offers must be ranked by effective coupon-aware price');
assert.ok(source.includes('voucher-box'),'coupon UI styling missing');
assert.ok(source.includes('navigator.clipboard'),'coupon code copy interaction missing');
assert.ok(source.includes('Simulierte Testaktion')||source.includes('Simulated test promotion'),'test promotions must be clearly marked');
assert.ok(!source.includes('location.href='),'simulated offers must not create outbound navigation');
assert.ok(home.includes('coupon-engine.js'),'search page must load coupon engine');
assert.ok(home.indexOf('coupon-engine.js')<home.indexOf('offer-comparison.js'),'coupon engine must load before offer comparison UI');
console.log('offer comparison and coupon UI smoke tests passed');
