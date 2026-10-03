'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('live-health.js','utf8');
function run(offers){
 const window={FundBlickLanguage:{},FB_CATEGORY_SCHEMAS:{one:{}},FB_COMMON_FACETS:[],FBCommonFilterI18n:{},FB_parseSearchIntent(){},FundBlickCoupons:{rankOffers(){}},FundBlickMerchantOffers:offers};
 const document={readyState:'complete',querySelector:()=>({}),documentElement:{dataset:{}}};
 vm.runInNewContext(source,{window,document});return{health:window.FundBlickHealth,state:document.documentElement.dataset.searchHealth};
}
assert.equal(run({}).state,'ok','Current merchant offers API must satisfy health');
const missing=run(null);assert.equal(missing.state,'degraded');assert.equal(missing.health.checks.find(x=>x.name==='merchant-offers').ok,false,'Missing current API is detected');
assert.ok(!source.includes('FundBlickOfferComparison'),'Retired comparison API must not degrade live');
console.log('Live health: current API present/absent executed regression OK');
