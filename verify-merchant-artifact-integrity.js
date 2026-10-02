'use strict';
const assert=require('node:assert/strict');
const {canonicalProductDigest,assertCanonicalProductDigest}=require('./merchant-artifact-integrity.js');
const products=[
 {id:'awin-87569-1',name:'Foto Kette',price:40.95,rawAttributes:{productType:'Schmuck'}},
 {id:'awin-87569-2',name:'Foto Schlüsselanhänger',price:19.95,rawAttributes:{productType:'Schlüsselanhänger'}}
];
const parsedCompact=JSON.parse(JSON.stringify(products));
const parsedPretty=JSON.parse(JSON.stringify(products,null,2));
const expected=canonicalProductDigest(products);
assert.equal(canonicalProductDigest(parsedCompact),expected,'compact JSON must hash identically');
assert.equal(canonicalProductDigest(parsedPretty),expected,'pretty JSON must hash identically');
assert.doesNotThrow(()=>assertCanonicalProductDigest(parsedPretty,expected,'format-only variant'));
const changed=JSON.parse(JSON.stringify(products));changed[0].price=41.95;
assert.notEqual(canonicalProductDigest(changed),expected,'real product mutation must change digest');
assert.throws(()=>assertCanonicalProductDigest(changed,expected,'mutated artifact'),/digest mismatch/);
console.log('Canonical merchant artifact digest regression passed');
