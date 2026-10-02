'use strict';
const crypto=require('node:crypto');
function canonicalProductDigest(products){
  if(!Array.isArray(products))throw new TypeError('products must be an array');
  return crypto.createHash('sha256').update(Buffer.from(JSON.stringify(products),'utf8')).digest('hex');
}
function assertCanonicalProductDigest(products,expected,label='merchant artifact'){
  const actual=canonicalProductDigest(products);
  if(expected&&actual!==expected)throw new Error(`${label} digest mismatch: expected ${expected}, got ${actual}`);
  return actual;
}
module.exports={canonicalProductDigest,assertCanonicalProductDigest};
