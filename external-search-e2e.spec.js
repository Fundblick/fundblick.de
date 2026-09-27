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

test('zh-Hans keeps exact language key instead of falling back to English',async({page})=>{
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=zh-Hans&externalMock=1',{waitUntil:'networkidle'});
  await waitExternal(page);
  await expect(page.locator('#external-results .external-results-heading h2')).toHaveText('更多网络优惠');
  await expect(page.locator('#external-results .external-cta').first()).toHaveText('打开外部网站');
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

test('query-pack provider feeds the same external UI contract',async({page})=>{
  const requested=[];page.on('request',request=>requested.push(request.url()));
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalPack=1',{waitUntil:'networkidle'});
  await waitSearch(page);await waitExternal(page);
  await expect(page.locator('#external-results .external-product')).toHaveCount(4);
  await expect(page.locator('#external-results .external-product').first()).toContainText('Pack-Test');
  await expect(page.locator('#external-results .external-product').first()).toHaveAttribute('data-provider','development-query-pack');
  expect(requested.some(url=>url.includes('development/external-query-pack-fixture.json'))).toBeTruthy();
});

test('query-pack fixture is not fetched without explicit development flag',async({page})=>{
  const requested=[];page.on('request',request=>requested.push(request.url()));
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de',{waitUntil:'networkidle'});
  await waitSearch(page);
  await expect(page.locator('#external-results')).toBeHidden();
  expect(requested.some(url=>url.includes('development/external-query-pack-fixture.json'))).toBeFalsy();
});

test('query-pack does not answer a different query',async({page})=>{
  await page.goto(base+'?q='+encodeURIComponent('Bohrhammer')+'&lang=de&externalPack=1',{waitUntil:'networkidle'});
  await waitSearch(page);
  await expect(page.locator('#external-results')).toBeHidden({timeout:5000});
});

test('provider errors and timeouts fail open without blocking FundBlick',async({page})=>{
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(base+'?q='+encodeURIComponent('Fehlergerät')+'&lang=de',{waitUntil:'networkidle'});
  await waitSearch(page);
  const telemetry=await page.evaluate(async()=>{
    const events=[];
    const handler=e=>events.push(e.detail);
    window.addEventListener('fundblick:external-provider',handler);
    window.FundBlickExternalSearch.registerProvider({id:'throwing-provider',async search(){throw new Error('test-provider-error')}});
    window.FundBlickExternalSearch.registerProvider({id:'hanging-provider',timeoutMs:50,async search(){return new Promise(()=>{})}});
    await window.FundBlickExternalSearch.evaluate();
    window.removeEventListener('fundblick:external-provider',handler);
    return events;
  });
  await expect(page.locator('#external-results')).toBeHidden();
  expect(telemetry.some(e=>e.provider==='throwing-provider'&&e.status==='error')).toBeTruthy();
  expect(telemetry.some(e=>e.provider==='hanging-provider'&&e.status==='timeout')).toBeTruthy();
  expect(pageErrors).toEqual([]);
});

test('external search telemetry contains no raw query',async({page})=>{
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalMock=1',{waitUntil:'networkidle'});
  await waitExternal(page);
  const detail=await page.evaluate(async()=>{
    let last=null;const handler=e=>{last=e.detail};
    window.addEventListener('fundblick:external-search',handler);
    await window.FundBlickExternalSearch.evaluate();
    window.removeEventListener('fundblick:external-search',handler);
    return last;
  });
  expect(detail.used).toBeTruthy();
  expect(detail.externalCount).toBe(4);
  expect(detail.queryLength).toBe('Akkuschrauber'.length);
  expect(Object.prototype.hasOwnProperty.call(detail,'query')).toBeFalsy();
});

test('provider tiers stop after the first tier with usable results',async({page})=>{
  await page.goto(base+'?q='+encodeURIComponent('TierTest')+'&lang=de',{waitUntil:'networkidle'});
  await waitSearch(page);
  const calls=await page.evaluate(async()=>{
    const calls=[];
    window.FundBlickExternalSearch.registerProvider({id:'structured-tier',tier:10,async search(){calls.push('structured');return [{id:'tier-1',title:'Structured result',brand:'Tier',merchant:'Tier merchant',price:10,currency:'EUR',url:'https://example.com/tier-1',attributes:{}}]}});
    window.FundBlickExternalSearch.registerProvider({id:'web-tier',tier:90,async search(){calls.push('web');return [{id:'tier-2',title:'Web result',url:'https://example.com/tier-2'}]}});
    await window.FundBlickExternalSearch.evaluate();
    return calls;
  });
  expect(calls).toEqual(['structured']);
  await expect(page.locator('#external-results .external-product')).toHaveCount(1);
  await expect(page.locator('#external-results .external-product')).toHaveAttribute('data-provider','structured-tier');
});

test('Google PSE is not requested without explicit dev activation',async({page})=>{
  const requested=[];page.on('request',request=>requested.push(request.url()));
  await page.goto(base+'?q='+encodeURIComponent('WebFallbackTest')+'&lang=de',{waitUntil:'networkidle'});
  await waitSearch(page);
  await page.waitForTimeout(400);
  expect(requested.some(url=>url.startsWith('https://cse.google.com/cse.js'))).toBeFalsy();
  await expect(page.locator('#external-web-fallback')).toBeHidden();
});

test('Google PSE renders only after structured fallback has no results',async({page})=>{
  await page.route('https://cse.google.com/cse.js**',async route=>{
    await route.fulfill({status:200,contentType:'application/javascript',body:`window.google={search:{cse:{element:{render:function(cfg){window.__pseRender=cfg;document.getElementById(cfg.div).innerHTML='<div id="pse-test-result">Google test result</div>';},getElement:function(){return {execute:function(q){window.__pseQuery=q;}}}}}}};`});
  });
  await page.goto(base+'?q='+encodeURIComponent('WebFallbackTest')+'&lang=de&externalGoogleMock=1',{waitUntil:'networkidle'});
  await waitSearch(page);
  await expect(page.locator('#external-results')).toBeHidden();
  await expect(page.locator('#external-web-fallback')).toBeVisible({timeout:5000});
  await expect(page.locator('#pse-test-result')).toHaveText('Google test result');
  const state=await page.evaluate(()=>({render:window.__pseRender,query:window.__pseQuery}));
  expect(state.render.tag).toBe('searchresults-only');
  expect(state.query).toBe('WebFallbackTest');
});

test('Google PSE stays off when structured tier returns products',async({page})=>{
  const requested=[];page.on('request',request=>requested.push(request.url()));
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalMock=1&externalGoogleMock=1',{waitUntil:'networkidle'});
  await waitExternal(page);
  await page.waitForTimeout(400);
  expect(requested.some(url=>url.startsWith('https://cse.google.com/cse.js'))).toBeFalsy();
  await expect(page.locator('#external-web-fallback')).toBeHidden();
});
