'use strict';
const {test,expect}=require('@playwright/test');
const BASE='http://127.0.0.1:4173';

for(const profile of [
  {name:'desktop',viewport:{width:1440,height:1000},mobile:false},
  {name:'mobile',viewport:{width:390,height:844},mobile:true}
]){
  test(`AHIPOS search, facets and merchant handoff on ${profile.name}`,async({page})=>{
    await page.setViewportSize(profile.viewport);
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error&&error.message||error)));
    await page.goto(`${BASE}/search.html?q=pferd`,{waitUntil:'networkidle'});

    await expect(page.locator('#summary')).not.toContainText('Produkte werden geladen');
    await expect(page.locator('#cards article.product').first()).toBeVisible();
    await expect(page.locator('#cards article.product[data-real-merchant="true"]').first()).toBeVisible();
    await expect(page.locator('#cards .merchant-link').first()).toBeVisible();
    await expect(page.locator('#cards .merchant-link').first()).toHaveAttribute('data-offer-network','awin');
    await expect(page.locator('#cards .merchant-link').first()).toHaveAttribute('data-offer-affiliate-url',/awin1\.com/);
    await expect(page.locator('#cards .merchant-link').first()).toHaveAttribute('data-offer-direct-url',/ahipos-horses\.de/);

    if(profile.mobile){
      const mobileFilter=page.locator('.mobile-filter-toggle');
      await expect(mobileFilter).toBeVisible();
      await mobileFilter.click();
      await expect(page.locator('#filter-panel')).toHaveAttribute('open','');
    }

    const supplement=page.locator('#filters input[data-key="type"][value="Ergänzungsfutter"]');
    await expect(supplement).toBeVisible();
    await supplement.check();
    await expect(supplement).toBeChecked();
    await expect(page.locator('#cards article.product').first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('RU equestrian category and taxonomy values work without translating merchant titles',async({page})=>{
  await page.setViewportSize({width:1280,height:900});
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error&&error.message||error)));
  await page.goto(`${BASE}/search.html?lang=ru&q=${encodeURIComponent('лошадь')}`,{waitUntil:'networkidle'});
  await expect(page.locator('html')).toHaveAttribute('lang','ru');
  await expect(page.locator('#cards article.product').first()).toBeVisible();
  const filter=page.locator('#filters input[data-key="type"][value="Ergänzungsfutter"]');
  await expect(filter).toBeVisible();
  await expect(filter.locator('xpath=..')).toContainText('Кормовая добавка');
  await expect(filter).toHaveValue('Ergänzungsfutter');
  const merchantTitle=await page.locator('#cards article.product h2').first().textContent();
  expect(merchantTitle).toBeTruthy();
  expect(merchantTitle).toMatch(/[A-Za-zÄÖÜäöüß]/);
  expect(errors).toEqual([]);
});
