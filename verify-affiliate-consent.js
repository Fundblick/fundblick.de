'use strict';
const assert=require('node:assert/strict');
const consent=require('./affiliate-consent.js');

const storage=value=>({getItem:()=>value});

assert.equal(consent.readDecision(storage('granted'),'consent'),'granted','granted must remain valid');
assert.equal(consent.readDecision(storage('denied'),'consent'),'denied','denied must remain valid');
for(const value of ['yes','true','false','1','0','foo','GRANTED','DENIED','',null,undefined]){
  assert.equal(consent.readDecision(storage(value),'consent'),null,`invalid persisted consent must normalize to null: ${String(value)}`);
}
assert.equal(consent.readDecision({getItem(){throw new Error('blocked')}},'consent'),null,'storage failures must normalize to null');

const awinOnly={adcell:{enabled:false,trackingEnabled:false},awin:{enabled:true,trackingEnabled:true}};
assert.equal(consent.canTrack(awinOnly,'granted','awin'),true);
assert.equal(consent.canTrack(awinOnly,'denied','awin'),false);
assert.equal(consent.canTrack(awinOnly,'foo','awin'),false);
assert.deepEqual(consent.enabledNames(awinOnly),['Awin'],'only enabled networks may be publicly named');

console.log('affiliate consent normalization gate passed');
