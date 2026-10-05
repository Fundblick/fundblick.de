'use strict';
const {test,expect}=require('@playwright/test');
const approvals=JSON.parse(require('node:fs').readFileSync('production-merchant-approvals.json','utf8'));
const amazgiftsApproved=approvals.merchants.amazgifts.approved===true;
const blazevideoApproved=approvals.merchants.blazevideo?.approved===true;

const base='http://127.0.0.1:4173/search.html?lang=de';

function facet(page,title){
  return page.locator('section.facet').filter({has:page.locator('h2',{hasText:title})});
}
function euro(text){
  const raw=String(text||'').replace(/\s/g,'').replace(/[^\d,.-]/g,'');
  const comma=raw.lastIndexOf(','),dot=raw.lastIndexOf('.');
  let normalized=raw;
  if(comma>dot)normalized=raw.replace(/\./g,'').replace(',','.');
  else if(dot>comma&&comma>=0)normalized=raw.replace(/,/g,'');
  else if(comma>=0)normalized=raw.replace(',','.');
  return Number(normalized);
}
async function visiblePrices(page){return (await page.locator('#cards article.product .price strong').allTextContents()).map(euro);}
async function visibleBrands(page){
  return page.locator('#cards article.product').evaluateAll(cards=>cards.map(article=>{
    const explicit=article.querySelector('.product-brand bdi,[data-brand]');
    if(explicit)return String(explicit.getAttribute('data-brand')||explicit.textContent||'').trim();
    const meta=[...article.querySelectorAll('p')].find(p=>/^\s*(Hersteller|Marke|Manufacturer|Brand)\s*:/i.test(p.textContent||''));
    return String(meta?.querySelector('bdi')?.textContent||meta?.textContent?.replace(/^\s*[^:]+:\s*/,'')||'').trim();
  }));
}

async function openCatalog(page){
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'networkidle'});
  await expect(page.locator('#cards article.product').first()).toBeVisible();
  return errors;
}

test('multi-merchant facets follow the remaining result set',async({page})=>{
  const errors=await openCatalog(page);
  const merchantFacet=facet(page,'Händler');
  await expect(merchantFacet).toBeVisible();
  await expect(merchantFacet.locator('input[data-key="merchant"]')).toHaveCount(3+Number(amazgiftsApproved)+Number(blazevideoApproved));
  await expect(merchantFacet).toContainText('Casa Moro');
  await expect(merchantFacet).toContainText('Ahipos Horses DE');
  await expect(merchantFacet).toContainText('ANTHBOT');
  if(amazgiftsApproved)await expect(merchantFacet).toContainText('Amazgifts DE');
  else await expect(merchantFacet).not.toContainText('Amazgifts DE');
  if(blazevideoApproved)await expect(merchantFacet).toContainText('BlazeVideo DE');
  else await expect(merchantFacet).not.toContainText('BlazeVideo DE');
  await merchantFacet.locator('input[value="Ahipos Horses DE"]').check();
  await expect(page.locator('#summary')).toContainText('31');
  const brandFacet=facet(page,'Hersteller');
  await expect(brandFacet.locator('input[data-key="brand"]')).toHaveCount(2);
  await expect(brandFacet).toContainText('Ahipos Horses');
  await expect(brandFacet).toContainText('Equinox Equine');
  await expect(brandFacet).not.toContainText('ahipos-horses');
  await expect(brandFacet).not.toContainText('Fast Bundle');
  await expect(brandFacet).not.toContainText('Casa Moro');
  await expect(brandFacet).not.toContainText('ANTHBOT');
  const typeFacet=facet(page,'Produkttyp');
  await expect(typeFacet).toBeVisible();
  await expect(typeFacet).toContainText('Ergänzungsfutter');
  await expect(typeFacet).toContainText('Pferdepflege');
  await expect(typeFacet).toContainText('Bundle');
  await expect(typeFacet).not.toContainText('Couchtisch');
  await expect(typeFacet).not.toContainText('Bistrotisch');
  await expect(typeFacet.locator('label').filter({hasText:/\b0\b/})).toHaveCount(0);
  await brandFacet.locator('input[value="Equinox Equine"]').check();
  await expect(page.locator('#summary')).toContainText('5');
  const equinoxType=facet(page,'Produkttyp');
  await expect(equinoxType).toContainText('Ergänzungsfutter');
  await expect(equinoxType).not.toContainText('Couchtisch');
  await expect(equinoxType.locator('label')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('Casa Moro keeps furniture product types without equestrian leakage',async({page})=>{
  const errors=await openCatalog(page);
  const merchantFacet=facet(page,'Händler');
  const casaLabel=merchantFacet.locator('label').filter({hasText:'Casa Moro'});
  await expect(casaLabel).toHaveCount(1);
  await casaLabel.locator('input[data-key="merchant"]').check();
  await expect(page.locator('#summary')).toContainText('1428');
  const casaType=facet(page,'Produkttyp');
  await expect(casaType).toContainText('Couchtisch');
  await expect(casaType).not.toContainText('Ergänzungsfutter');
  await expect(casaType.locator('label').filter({hasText:/\b0\b/})).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('central sort changes visible cards for price and brand',async({page})=>{
  const errors=await openCatalog(page);
  await page.locator('#sort').evaluate((select)=>{select.value='price-asc';select.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForTimeout(100);
  const asc=await visiblePrices(page);
  expect(asc.length).toBeGreaterThan(1);
  expect(asc).toEqual([...asc].sort((a,b)=>a-b));
  await page.locator('#sort').selectOption('price-desc');
  await page.waitForTimeout(100);
  const desc=await visiblePrices(page);
  expect(desc).toEqual([...desc].sort((a,b)=>b-a));
  expect(desc[0]).toBeGreaterThanOrEqual(desc.at(-1));
  await page.locator('#sort').selectOption('brand');
  await page.waitForTimeout(100);
  const brands=await visibleBrands(page);
  const collator=new Intl.Collator('de',{numeric:true,sensitivity:'base'});
  expect(brands).toEqual([...brands].sort((a,b)=>collator.compare(a,b)));
  expect(errors).toEqual([]);
});

test('availability facet filters globally and reset restores result set',async({page})=>{
  const errors=await openCatalog(page);
  const before=Number((await page.locator('#summary').textContent()).match(/\d+/)?.[0]);
  const availability=facet(page,'Verfügbarkeit');
  await expect(availability).toBeVisible();
  const available=availability.locator('input[data-key="shipping"][value="Sofort lieferbar"]');
  await expect(available).toHaveCount(1);
  await available.check();
  await expect(page.locator('#chips')).toContainText('Sofort lieferbar');
  const filtered=Number((await page.locator('#summary').textContent()).match(/\d+/)?.[0]);
  expect(filtered).toBeGreaterThan(0);
  expect(filtered).toBeLessThanOrEqual(before);
  await page.locator('#reset').click();
  await expect(page.locator('#chips')).not.toContainText('Sofort lieferbar');
  const restored=Number((await page.locator('#summary').textContent()).match(/\d+/)?.[0]);
  expect(restored).toBe(before);
  expect(errors).toEqual([]);
});

test('facets remain usable on a mobile viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const errors=await openCatalog(page);
  const toggle=page.locator('.mobile-filter-toggle');
  await expect(toggle).toBeVisible();
  await expect(page.locator('.desktop-sort-control')).toBeHidden();
  await expect(page.locator('.mobile-sort-toggle')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await toggle.click();
  await expect(page.locator('#filter-panel')).toHaveAttribute('open','');
  await expect(facet(page,'Verfügbarkeit')).toBeVisible();
  await facet(page,'Verfügbarkeit').locator('input[value="Sofort lieferbar"]').check();
  await expect(page.locator('#chips')).toContainText('Sofort lieferbar');
  await page.locator('.mobile-filter-apply').click();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await page.locator('#sort').evaluate(select=>{select.value='price-asc';select.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForTimeout(100);
  const prices=await visiblePrices(page);
  expect(prices).toEqual([...prices].sort((a,b)=>a-b));
  expect(errors).toEqual([]);
});
