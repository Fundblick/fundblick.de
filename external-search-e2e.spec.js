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

test('Amazon relay is not requested without explicit development activation',async({page})=>{
  const requested=[];page.on('request',request=>requested.push(request.url()));
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de',{waitUntil:'networkidle'});
  await waitSearch(page);await page.waitForTimeout(300);
  expect(requested.some(url=>url.includes('/__mock_amazon_relay__/search'))).toBeFalsy();
  expect(requested.some(url=>url.includes('/__mock_ebay_relay__/search'))).toBeFalsy();
});

test('Amazon relay wins before eBay fallback',async({page})=>{
  let amazonCalls=0,ebayCalls=0;
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{
    amazonCalls++;
    const url=new URL(route.request().url());
    expect(url.searchParams.get('q')).toBe('Akkuschrauber');
    expect(Number(url.searchParams.get('limit'))).toBeLessThanOrEqual(10);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,provider:'amazon-creators-api',marketplace:'www.amazon.de',itemCount:2,items:[
      {id:'amazon-1',title:'Amazon Akku-Bohrschrauber 18 V',brand:'AmazonTest',merchant:'Amazon',image:'',price:94.9,currency:'EUR',shipping:'',url:'https://example.com/amazon-1',attributes:{Spannung:'18 V',Ausführung:'mit Akku'}},
      {id:'amazon-2',title:'Amazon Akkuschrauber 12 V',brand:'AmazonTest',merchant:'Amazon',image:'',price:64.9,currency:'EUR',shipping:'',url:'https://example.com/amazon-2',attributes:{Spannung:'12 V'}}
    ]})});
  });
  await page.route('http://127.0.0.1:4173/__mock_ebay_relay__/search**',async route=>{ebayCalls++;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,provider:'ebay-browse',items:[{id:'ebay-1',title:'eBay should not render',url:'https://example.com/ebay-1'}]})});});
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1&externalEbayRelayMock=1',{waitUntil:'networkidle'});
  await waitSearch(page);await waitExternal(page);
  expect(amazonCalls).toBeGreaterThan(0);
  expect(ebayCalls).toBe(0);
  await expect(page.locator('#external-results .external-product')).toHaveCount(2);
  await expect(page.locator('#external-results .external-product').first()).toContainText('Amazon Akku-Bohrschrauber');
  await expect(page.locator('#external-results .external-product').first()).toHaveAttribute('data-provider','amazon-creators-api-relay');
});

test('eBay relay is used when Amazon relay fails',async({page})=>{
  let amazonCalls=0,ebayCalls=0;
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{amazonCalls++;await route.fulfill({status:502,contentType:'application/json',body:JSON.stringify({error:'provider_unavailable',items:[]})});});
  await page.route('http://127.0.0.1:4173/__mock_ebay_relay__/search**',async route=>{
    ebayCalls++;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,provider:'ebay-browse',marketplace:'EBAY_DE',itemCount:1,items:[
      {id:'ebay-fallback-1',title:'eBay Fallback Akkuschrauber',brand:'FallbackMarke',merchant:'eBay Händler',image:'',price:79.9,currency:'EUR',shipping:'',url:'https://example.com/ebay-fallback-1',attributes:{Spannung:'18 V'}}
    ]})});
  });
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1&externalEbayRelayMock=1',{waitUntil:'networkidle'});
  await waitSearch(page);await waitExternal(page);
  expect(amazonCalls).toBeGreaterThan(0);
  expect(ebayCalls).toBeGreaterThan(0);
  await expect(page.locator('#external-results .external-product')).toHaveCount(1);
  await expect(page.locator('#external-results .external-product').first()).toContainText('eBay Fallback Akkuschrauber');
  await expect(page.locator('#external-results .external-product').first()).toHaveAttribute('data-provider','ebay-browse-relay');
});
