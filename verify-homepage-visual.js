'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const deals=require('./deal-of-day.js');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('home.css','utf8');
const extras=fs.readFileSync('home-extras.js','utf8');
for(const marker of ['id="deal"','Schnäppchen des Tages','id="categories"','id="showcaseList"','deal-of-day.js','home-extras.js','catalog-loader.js'])assert.ok(html.includes(marker),`homepage marker missing: ${marker}`);
assert.ok(css.includes('.deal-card'),'daily deal styling missing');
assert.ok(css.includes('.product-row'),'showcase styling missing');
assert.ok(extras.includes("ar:{categories:'الفئات'"),'Arabic homepage extras missing');
assert.ok(extras.includes("'zh-Hans':{categories:'分类'"),'Chinese homepage extras missing');
const now=Date.now();
const product={id:'p1',name:'Test',brand:'Demo',offers:[
  {merchantId:'a',price:70,shippingCost:0,totalPrice:70,inStock:true,simulated:true},
  {merchantId:'b',price:95,shippingCost:0,totalPrice:95,inStock:true,simulated:true},
  {merchantId:'c',price:100,shippingCost:0,totalPrice:100,inStock:true,simulated:true},
  {merchantId:'d',price:105,shippingCost:0,totalPrice:105,inStock:true,simulated:true}
]};
const qualified=deals.qualify(product,{now});
assert.ok(qualified,'qualified deal should be selected');
assert.equal(qualified.best.totalPrice,70);
assert.ok(qualified.discountPct>=15);
assert.equal(deals.qualify({...product,offers:product.offers.slice(0,2)},{now}),null,'fewer than three merchants must never qualify');
console.log('homepage morning-design verification passed');
