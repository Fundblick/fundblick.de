'use strict';
const {test,expect}=require('playwright/test'),fs=require('node:fs');
const {readProducts}=require('./destination-link-health.js');
const profile=JSON.parse(fs.readFileSync('development/merchant-preview-profile.json'));
const products=profile.merchants.sirui.sources.flatMap(readProducts);
const base=process.env.FUNDBLICK_E2E_BASE||'http://127.0.0.1:4173/';
test.use({viewport:{width:1440,height:1000},...(process.env.HTTPS_PROXY?{launchOptions:{proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}}}:{})});
test.setTimeout(120000);
const cards=page=>page.locator('#cards article.product');
test.beforeEach(async({context})=>{
 // Even an accidental outbound click is intercepted before any tracking request.
 await context.route(/^https:\/\/(?:www\.)?awin1\.com\//,r=>r.fulfill({status:200,contentType:'text/html',body:'<title>Intercepted affiliate test</title><p>Weiterleitung im Test abgefangen</p>'}));
});
test('All photography categories show qualified variants and preserve return navigation',async({page})=>{
 await page.goto(base+'?lang=de',{waitUntil:'networkidle'});
 for(const id of new Set(products.map(p=>p.category))){
  const count=products.filter(p=>p.category===id).length,link=page.locator('a[data-catalog-category="'+id+'"]');
  await expect(link).toHaveAttribute('title',count+' '+(count===1?'Produkt':'Produkte'));
  await link.click();await expect(cards(page)).toHaveCount(count);await page.goBack({waitUntil:'networkidle'});
 }
});
for(const width of [1440,390,320])test('Photography filters, sorting and cache reload at '+width+'px',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.setViewportSize({width,height:900});
 await page.goto(base+'search.html?category=electronics.photo.lenses&lang=de',{waitUntil:'networkidle'});
 const lenses=products.filter(p=>p.category==='electronics.photo.lenses');await expect(cards(page)).toHaveCount(lenses.length);
 if(width<800)await page.locator('.mobile-filter-toggle').click();
 const merchant=page.locator('#filters input[data-key="merchant"][value="SIRUI DE"]');await merchant.check();
 const type=page.locator('#filters input[data-key="type"][value="Objektiv"]');await expect(type).toHaveCount(1);await type.check();
 if(width<800)await page.locator('.mobile-filter-apply').click();
 await page.locator('#sort').selectOption('price-asc');
 await expect.poll(()=>cards(page).evaluateAll(nodes=>nodes.map(n=>Number(n.querySelector('.price strong').textContent.replace(/[^0-9,]/g,'').replace(',','.'))))).toEqual(lenses.map(p=>p.price).sort((a,b)=>a-b));
 await page.reload({waitUntil:'networkidle'});await expect(cards(page)).toHaveCount(lenses.length);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);expect(errors).toEqual([]);
});
test('Source image and exact variant remain bound across consent decisions without real tracking',async({page,context})=>{
 const p=products[0];await page.goto(base+'search.html?q='+encodeURIComponent(p.name)+'&lang=de',{waitUntil:'networkidle'});
 const card=cards(page).filter({hasText:p.name}).first(),link=card.locator('.merchant-link');
 await expect(card.locator('h2')).toHaveText(p.name);await expect(card.locator('.availability-status')).toHaveText('Lieferbar');
 const image=card.locator('img').first();await expect(image).toHaveAttribute('src',p.image);await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>=200&&img.naturalHeight>=200),{timeout:30000}).toBe(true);await expect(link).toHaveAttribute('href',p.directUrl);
 for(const [decision,signal] of [['granted','1'],['denied','0']]){
  if(decision==='denied')await page.locator('[data-affiliate-settings]').first().click();
  await page.locator('#fbConsent [data-consent="'+decision+'"]').click();const expected=new URL(p.affiliateUrl);expected.searchParams.set('cons',signal);
  await expect(link).toHaveAttribute('href',expected.href);
  const popupPromise=context.waitForEvent('page');await link.click();const popup=await popupPromise;await popup.waitForLoadState();expect(popup.url()).toBe(expected.href);await expect(popup.locator('body')).toContainText('abgefangen');await popup.close();
 }
 await page.reload({waitUntil:'networkidle'});await expect(card.locator('h2')).toHaveText(p.name);
});
test('Russian photography categories and own types are translated',async({page})=>{
 await page.goto(base+'search.html?category=electronics.photo.lenses&lang=ru',{waitUntil:'networkidle'});
 const type=page.locator('#filters input[data-key="type"][value="Objektiv"]');await expect(type.locator('xpath=..')).toContainText('Объективы');await type.check();await expect(type).toHaveValue('Objektiv');await expect(cards(page).first().locator('.product-type')).toContainText('Объективы');
});
