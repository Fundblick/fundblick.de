'use strict';
const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:4173/search.html';

async function waitSearch(page){
  await expect(page.locator('#summary')).not.toContainText(/geladen|loading/i,{timeout:15000});
}
async function waitExternal(page){
  await expect(page.locator('#external-results')).toBeVisible({timeout:10000});
  await expect(page.locator('#external-results .external-product').first()).toBeVisible();
}

test('zero own results triggers external fallback and keeps source disclosure',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalMock=1',{waitUntil:'networkidle'});
  await waitSearch(page);await waitExternal(page);
  await expect(page.locator('#external-results .external-results-heading')).toContainText('keine eigenen passenden Angebote');
  await expect(page.locator('#external-results .external-product')).toHaveCount(4);
  const cta=page.locator('#external-results .external-cta').first();
  await expect(cta).toHaveText('Extern ansehen');
  await expect(cta).toHaveAttribute('rel',/nofollow/);
  await expect(page.locator('#external-results')).toContainText('keine FundBlick-Partnerangebote');
  expect(errors).toEqual([]);
});

test('external facets filter by brand attribute and price',async({page})=>{
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalMock=1',{waitUntil:'networkidle'});
  await waitExternal(page);
  const brand=page.locator('[data-external-facet="brand"][value="Testwerkzeug"]');
  await brand.check();
  await expect(page.locator('#external-results .external-product')).toHaveCount(2);
  await brand.uncheck();
  const voltage=page.locator('[data-external-facet="Spannung"][value="18 V"]');
  await voltage.check();
  await expect(page.locator('#external-results .external-product')).toHaveCount(2);
  await page.locator('#external-reset').click();
  await expect(page.locator('#external-results .external-product')).toHaveCount(4);
  await page.locator('#external-min').fill('100');
  await page.locator('#external-apply').click();
  await expect(page.locator('#external-results .external-product')).toHaveCount(1);
});

test('six own results suppress external fallback',async({page})=>{
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalMock=1',{waitUntil:'networkidle'});
  await waitExternal(page);
  await page.evaluate(()=>{
    const cards=document.querySelector('#cards');
    cards.innerHTML=Array.from({length:6},(_,i)=>`<article class="product" data-real-merchant="true"><h2>Own ${i}</h2></article>`).join('');
  });
  await expect(page.locator('#external-results')).toBeHidden({timeout:5000});
});

test('few own results keep external fallback below own results',async({page})=>{
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalMock=1',{waitUntil:'networkidle'});
  await waitExternal(page);
  await page.evaluate(()=>{
    document.querySelector('#cards').innerHTML='<article class="product" data-real-merchant="true"><h2>Own A</h2></article><article class="product" data-real-merchant="true"><h2>Own B</h2></article>';
  });
  await expect(page.locator('#external-results')).toBeVisible();
  await expect(page.locator('#external-results .external-results-heading')).toContainText('nur 2 eigene passende Treffer');
});

test('Russian fallback copy is localized while external source data stays intact',async({page})=>{
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=ru&externalMock=1',{waitUntil:'networkidle'});
  await waitExternal(page);
  await expect(page.locator('#external-results .external-results-heading h2')).toHaveText('Другие предложения в интернете');
  await expect(page.locator('#external-results .external-cta').first()).toHaveText('Открыть внешний сайт');
  await expect(page.locator('#external-results .external-product').first()).toContainText('18 V Akku-Bohrschrauber');
});

test('mobile external result and filters stay inside viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalMock=1',{waitUntil:'networkidle'});
  await waitExternal(page);
  const panel=page.locator('.external-filter-panel'),card=page.locator('.external-product').first(),cta=card.locator('.external-cta');
  for(const el of [panel,card,cta]){
    const box=await el.boundingBox();expect(box).not.toBeNull();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(390);
  }
});
