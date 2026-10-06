'use strict';
const {test,expect}=require('playwright/test'),fs=require('node:fs');
const {readProducts}=require('./destination-link-health.js');
const {classify}=require('./home-facet-classifier.js');
const profile=JSON.parse(fs.readFileSync('development/merchant-preview-profile.json','utf8'));
const products=profile.merchants.deluxehomeart.sources.flatMap(readProducts);
const base=process.env.FUNDBLICK_E2E_BASE||'http://127.0.0.1:4173/';
test.use({...(process.env.FUNDBLICK_BROWSER_CHANNEL?{channel:process.env.FUNDBLICK_BROWSER_CHANNEL}:{}),viewport:{width:1440,height:1000}});
test.setTimeout(120000);
const cards=page=>page.locator('#cards article.product');
async function open(page,query='',lang='de'){await page.goto(base+'search.html?lang='+lang+(query?'&q='+encodeURIComponent(query):''),{waitUntil:'networkidle'});await expect(cards(page).first()).toBeVisible();await expect(page.locator('html')).toHaveAttribute('data-search-health','ok');}
async function merchant(page,count=products.length){await page.locator('#filters input[data-key="merchant"][value="Deluxehomeartshop DE"]').check();if(count!==null)await expect(cards(page)).toHaveCount(count);}
async function mobileFilters(page){if(await page.locator('.mobile-filter-toggle').isVisible())await page.locator('.mobile-filter-toggle').click();}
test('Homepage categories include the complete qualified merchant catalog',async({page})=>{
 const baseline=JSON.parse(fs.readFileSync('build/production-baseline/categories.json','utf8')).categories;
 const counts=Object.fromEntries(baseline.map(c=>[c.id,c.count]));
 const approvals=JSON.parse(fs.readFileSync('production-merchant-approvals.json','utf8'));
 if(approvals.merchants.deluxehomeart?.approved!==true)for(const p of products)counts[p.category]=(counts[p.category]||0)+1;
 const response=await page.goto(base+'?lang=de',{waitUntil:'networkidle'});
 if(process.env.FUNDBLICK_E2E_PRODUCTION==='1'){
  expect(response.headers()['x-robots-tag']||'').not.toContain('noindex');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index,follow');
 }else{expect(response.headers()['x-robots-tag']).toContain('noindex');await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);}
 const nav=page.getByRole('navigation',{name:'Produktkategorien'});
 await expect(nav.locator('a[data-live-category="true"]')).toHaveCount(Object.keys(counts).length);
 for(const [id,count] of Object.entries(counts))await expect(nav.locator('a[data-catalog-category="'+id+'"]')).toHaveAttribute('title',count+' '+(count===1?'Produkt':'Produkte'));
 for(const id of ['home.decor','home.lighting']){await nav.locator('a[data-catalog-category="'+id+'"]').click();await expect(cards(page)).toHaveCount(counts[id]);await expect(page.locator('html')).toHaveAttribute('data-search-health','ok');await page.goBack({waitUntil:'networkidle'});}
});
for(const width of [1440,390,320]){
 test('Merchant, brand, type and colour filters remain usable at '+width+'px',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.setViewportSize({width,height:900});await open(page);await mobileFilters(page);await merchant(page);
  for(const brand of new Set(products.map(p=>p.brand)))await expect(page.locator('#filters input[data-key="brand"][value="'+brand+'"]')).toHaveCount(1);
  await expect(page.locator('#filters input[data-key="type"][value="LED-Kerze"]')).toHaveCount(1);
  await page.locator('#filters input[data-key="type"][value="LED-Kerze"]').check();
  const candles=products.filter(p=>classify(p).type==='LED-Kerze');await expect(cards(page)).toHaveCount(candles.length);
  const pink=candles.filter(p=>p.rawAttributes.facets.color==='Rosa');await expect(page.locator('#filters input[data-key="color"][value="Rosa"]')).toHaveCount(1);
  await page.locator('#filters input[data-key="color"][value="Rosa"]').check();await expect(cards(page)).toHaveCount(pink.length);
  await expect(page.locator('#chips')).toContainText('Rosa');await page.reload({waitUntil:'networkidle'});await expect(cards(page)).toHaveCount(pink.length);
  await mobileFilters(page);await page.locator('#reset').click();await merchant(page);
  await page.locator('#filters input[data-key="brand"][value="Ikon Copenhagen"]').check();await expect(cards(page)).toHaveCount(16);
  await expect(page.locator('#filters input[data-key="type"][value="Steh- / Tischlampe"]')).toHaveCount(1);
  await expect(page.locator('#filters input[data-key="type"][value="Couchtisch"]')).toHaveCount(0);
  if(width<800)await page.locator('.mobile-filter-apply').click();
  const box=await cards(page).first().boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);expect(errors).toEqual([]);
 });
}
test('Source product types make short lamp titles searchable and accessories stay distinct',async({page})=>{
 await open(page,'Tischlampe');await merchant(page,16);
 await open(page,'Schwimmleuchten');await merchant(page,5);
 await expect(page.locator('#filters input[data-key="type"][value="LED-Dekolicht"]')).toHaveCount(1);await expect(page.locator('#filters input[value="Vase / Blumentopf"]')).toHaveCount(0);
 for(const [query,type,count] of [['Batterien','Batterien',5],['Fernbedienung','Fernbedienung',3]]){
  await open(page,query);await page.locator('#filters input[data-key="merchant"][value="Deluxehomeartshop DE"]').check();
  await page.locator('#filters input[data-key="type"][value="'+type+'"]').check();await expect(cards(page)).toHaveCount(count);
 }
 await page.goto(base+'search.html?category=gifts.personalized.jewelry&lang=de',{waitUntil:'networkidle'});
 await page.locator('#query').fill('Tischlampe');await page.locator('.search-form button[type="submit"]').click();await expect(page.locator('#cards')).toContainText('Glatt');
 expect(new URL(page.url()).searchParams.has('category')).toBe(false);
});
test('Real card keeps source facts, loads its image and follows all three consent states',async({page})=>{
 const p=products.find(p=>p.name==='LED-Blockkerzen Ø 5 x 12,5 cm, Rosa')||products[0];const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await open(page,p.name);const card=cards(page).filter({hasText:p.name}).first(),link=card.locator('.merchant-link');
 await expect(card.locator('h2')).toHaveText(p.name);await expect(card.locator('.product-facts')).toContainText('Hersteller / Marke: '+p.brand);
 await expect(card.locator('.product-facts')).toContainText('Händler: Deluxehomeartshop DE');await expect(card.locator('.availability-status')).toHaveText('Lieferbar');
 await expect(card.locator('.price small').first()).toContainText('Versandkosten beim Händler prüfen');await expect(card.locator('.merchant-voucher')).toHaveCount(0);
 const image=card.locator('img').first();await image.scrollIntoViewIfNeeded();await expect(image).toHaveAttribute('src',p.image);await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>=200&&img.naturalHeight>=200),{timeout:30000}).toBe(true);
 await expect(link).toHaveAttribute('data-link-mode','direct');await expect(link).toHaveAttribute('href',p.directUrl);
 await page.locator('#fbConsent [data-consent="granted"]').click();const granted=new URL(p.affiliateUrl);granted.searchParams.set('cons','1');await expect(link).toHaveAttribute('href',granted.href);await expect(link).toHaveAttribute('rel',/sponsored/);
 await page.locator('[data-affiliate-settings]').first().click();await page.locator('#fbConsent [data-consent="denied"]').click();const denied=new URL(p.affiliateUrl);denied.searchParams.set('cons','0');await expect(link).toHaveAttribute('href',denied.href);
 expect(errors).toEqual([]);
});
test('Russian interface translates own types without changing merchant names or filter values',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.setViewportSize({width:390,height:844});await open(page,'','ru');await mobileFilters(page);await merchant(page);
 const type=page.locator('#filters input[data-key="type"][value="LED-Kerze"]');await expect(type.locator('xpath=..')).toContainText('Светодиодная свеча');await type.check();await expect(type).toBeChecked();await expect(type).toHaveValue('LED-Kerze');
 await expect(page.locator('#chips')).toContainText('Светодиодная свеча');await expect(cards(page).first().locator('.product-type')).toContainText('Светодиодная свеча');const pink=page.locator('#filters input[data-key="color"][value="Rosa"]');await expect(pink.locator('xpath=..')).toContainText('Розовый');await pink.check();await expect(pink).toHaveValue('Rosa');await expect(page.locator('#chips')).toContainText('Розовый');await expect(cards(page).first().locator('.product-facts')).toContainText('Deluxehomeartshop DE');expect(errors).toEqual([]);
});

test('Known product prices remain filterable and sortable when shipping is unknown',async({page})=>{
 await open(page);await merchant(page);await page.locator('#min').fill('10');await page.locator('#max').fill('15');await page.locator('#apply-price').click();
 const expected=products.filter(p=>p.price>=10&&p.price<=15);expect(expected.length).toBeGreaterThan(0);await expect(cards(page)).toHaveCount(expected.length);
 await expect(cards(page).first().locator('.price small').first()).toContainText('Versandkosten beim Händler prüfen');
 await page.locator('#sort').selectOption('price-asc');await expect.poll(()=>cards(page).evaluateAll(nodes=>nodes.map(n=>Number(n.querySelector('.price strong').textContent.replace(/[^0-9,]/g,'').replace(',','.'))))).toEqual(expected.map(p=>p.price).sort((a,b)=>a-b));
 await page.reload({waitUntil:'networkidle'});await expect(cards(page)).toHaveCount(expected.length);
 await page.locator('#query').fill('Mosaiktisch');await page.locator('.search-form button[type="submit"]').click();await expect(page.locator('#cards')).toContainText('Casa Moro');
 const params=new URL(page.url()).searchParams;for(const key of ['facets','brand','min','max'])expect(params.has(key)).toBe(false);
});
