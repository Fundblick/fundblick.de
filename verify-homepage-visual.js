'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const deals=require('./deal-of-day.js');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('home.css','utf8');
const categoryCss=fs.readFileSync('home-categories.css','utf8');
const categories=fs.readFileSync('home-categories.js','utf8');
const extras=fs.readFileSync('home-extras.js','utf8');
for(const marker of ['id="deal"','Schnäppchen des Tages','id="categories"','id="categoryToggle"','id="categoryMore"','deal-of-day.js','home-extras.js','home-categories.js','home-categories.css'])assert.ok(html.includes(marker),`homepage marker missing: ${marker}`);
assert.equal((html.match(/data-category-key=/g)||[]).length,16,'homepage must keep the full 16-category set behind the compact navigation');
assert.equal((html.match(/data-category-primary/g)||[]).length,6,'homepage must show only six categories before the user asks for all');
assert.equal((html.match(/data-category-extra/g)||[]).length,10,'homepage must keep ten additional categories collapsed initially');
assert.ok(html.includes('id="categoryMore" class="category-more" hidden'),'additional categories must start collapsed');
assert.ok(html.includes('aria-expanded="false"'),'all-categories toggle must start collapsed');
assert.ok(!html.includes('id="showcaseList"'),'homepage must not pre-populate ordinary product offers without user input');
assert.ok(!html.includes('Erst das Produkt. Dann die Angebote.'),'automatic product showcase must not return');
assert.ok(!html.includes('Schnelleinstieg'),'rejected quick-entry block must not return');
assert.ok(!extras.includes('renderShowcase'),'homepage runtime must not auto-render random products');
assert.ok(!extras.includes('product-row'),'homepage runtime must not build ordinary product cards before a search');
assert.ok(css.includes('.deal-card'),'daily deal styling missing');
assert.ok(categoryCss.includes('.category-more[hidden]'),'collapsed category styling missing');
assert.ok(categoryCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'mobile categories must render as two touch-friendly columns');
assert.ok(categories.includes("de:{showAll:'Alle Kategorien'"),'German category toggle copy missing');
assert.ok(categories.includes("ar:{showAll:'كل الفئات'"),'Arabic category toggle copy missing');
assert.ok(categories.includes("'zh-Hans':{showAll:'全部分类'"),'Chinese category toggle copy missing');
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
console.log('homepage cleanup verification passed');
