'use strict';
const assert=require('node:assert/strict');
const Deal=require('./deal-of-day.js');

const realOffer={merchant:'Test Händler',merchantId:'test',price:80,shippingCost:0,totalPrice:80,inStock:true,availability:'IN_STOCK',simulated:false};
const qualified=Deal.qualify({id:'p1',name:'Qualified',brand:'Brand',price:80,originalPrice:100,inStock:true,testData:false,simulatedOffers:false,offers:[realOffer],bestOffer:realOffer,image:'https://example.test/a.jpg'});
assert(qualified,'merchant reference price should qualify');
assert.equal(qualified.kind,'deal');
assert.equal(qualified.evidence,'merchant-reference');
assert.equal(Math.round(qualified.discountPct),20);
assert.equal(qualified.saving,20);

const weak=Deal.qualify({id:'p2',name:'Weak',price:90,originalPrice:100,inStock:true,testData:false,simulatedOffers:false,offers:[{...realOffer,price:90,totalPrice:90}],image:'https://example.test/b.jpg'});
assert.equal(weak,null,'weak reference-price discount must not qualify');

const multi=Deal.qualify({id:'p3',name:'Multi',price:70,inStock:true,testData:false,simulatedOffers:false,image:'https://example.test/c.jpg',offers:[
  {merchant:'A',merchantId:'a',price:70,shippingCost:0,totalPrice:70,inStock:true,simulated:false},
  {merchant:'B',merchantId:'b',price:90,shippingCost:0,totalPrice:90,inStock:true,simulated:false},
  {merchant:'C',merchantId:'c',price:100,shippingCost:0,totalPrice:100,inStock:true,simulated:false}
]},{maxAgeMinutes:999999});
assert(multi,'three real offers should still support multi-merchant evidence');
assert.equal(multi.evidence,'multi-merchant');

const products=[
  {id:'real-1',name:'Real one',price:49,inStock:true,testData:false,simulatedOffers:false,image:'https://example.test/1.jpg',merchant:'Merchant A',offers:[{merchant:'Merchant A',price:49,inStock:true,simulated:false}]},
  {id:'real-2',name:'Real two',price:59,inStock:true,testData:false,simulatedOffers:false,image:'https://example.test/2.jpg',merchant:'Merchant B',offers:[{merchant:'Merchant B',price:59,inStock:true,simulated:false}]},
  {id:'test-1',name:'Test',price:1,inStock:true,testData:true,simulatedOffers:true,image:'https://example.test/t.jpg'}
];
const dayA=Deal.selectDaily(products,{date:'2026-09-26'}),dayB=Deal.selectDaily(products,{date:'2026-09-26'});
assert(dayA,'daily fallback should select a real product');
assert.equal(dayA.kind,'spotlight');
assert.equal(dayA.productId,dayB.productId,'same day must be deterministic');
assert.equal(dayA.simulated,false);
assert.equal(dayA.reference,null);
assert.equal(dayA.discountPct,null);
assert.notEqual(dayA.productId,'test-1');

assert.equal(Deal.spotlight([{id:'x',name:'No image',price:20,inStock:true,testData:false,simulatedOffers:false,image:''}],{date:'2026-09-26'}),null,'spotlight requires a real product image');
console.log('Deal-of-day contract OK');
