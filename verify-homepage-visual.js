'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const deals=require('./deal-of-day.js');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('home.css','utf8');
const categoryCss=fs.readFileSync('home-categories.css','utf8');
const categories=fs.readFileSync('home-categories.js','utf8');
for(const marker of ['id="deal"','Schnäppchen des Tages','id="categories"','id="showcaseList"','deal-of-day.js','home-extras.js','home-categories.js','home-categories.css'])assert.ok(html.includes(marker),`homepage marker missing: ${marker}`);
assert.equal((html.match(/data-category-key=/g)||[]).length,16,'homepage must expose the approved 16 compact categories');
for(const key of ['electronics','household','beauty','fashion','shoes','sport','tools','garden','auto','baby','pets','health','office','toys','gaming','photo'])assert.ok(html.includes(`data-category-key="${key}"`),`homepage category missing: ${key}`);
assert.ok(!html.includes('Schnelleinstieg'),'rejected quick-entry block must not return');
assert.ok(css.includes('.deal-card'),'daily deal styling missing');
assert.ok(css.includes('.product-row'),'showcase styling missing');
assert.ok(categoryCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'mobile categories must render as two touch-friendly columns');
assert.ok(categories.includes("ar:{electronics:'إلكترونيات'"),'Arabic homepage category labels missing');
assert.ok(categories.includes("'zh-Hans':{electronics:'电子产品'"),'Chinese homepage category labels missing');
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
