'use strict';
const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:4173/search.html';
const emptyState={searchIndex:'',browseNodeId:'',brand:'',minPrice:'',maxPrice:'',minRating:'',sortBy:''};

async function mockBrandRelay(page){
  const requests=[];
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{
    const url=new URL(route.request().url());
    requests.push(url.href);
    const brand=url.searchParams.get('brand')||'';
    const items=brand==='Bosch'
      ?[{id:'amazon-bosch',title:'Bosch Akku-Bohrschrauber',brand:'Bosch',merchant:'Amazon',image:'',price:89.9,currency:'EUR',shipping:'',url:'https://example.com/amazon-bosch',attributes:{Brand:'Bosch'}}]
      :[
        {id:'amazon-bosch',title:'Bosch Akku-Bohrschrauber',brand:'Bosch',merchant:'Amazon',image:'',price:89.9,currency:'EUR',shipping:'',url:'https://example.com/amazon-bosch',attributes:{Brand:'Bosch'}},
        {id:'amazon-makita',title:'Makita Akku-Bohrschrauber',brand:'Makita',merchant:'Amazon',image:'',price:109.9,currency:'EUR',shipping:'',url:'https://example.com/amazon-makita',attributes:{Brand:'Makita'}}
      ];
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      schemaVersion:1,provider:'amazon-creators-api',marketplace:'www.amazon.de',itemCount:items.length,
      refinements:[{type:'other',id:'Brand',displayName:'Marke',bins:[{id:'Bosch',displayName:'Bosch'},{id:'Makita',displayName:'Makita'}]}],items
    })});
  });
  return requests;
}

test('Amazon refinement chip starts a second-stage relay search',async({page})=>{
  const requests=await mockBrandRelay(page);
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  await expect(page.locator('#external-results')).toBeVisible({timeout:10000});
  await expect(page.locator('#amazon-refinements')).toBeVisible();
  const bosch=page.locator('[data-amazon-refinement-key="brand"][data-amazon-refinement-value="Bosch"]');
  await expect(bosch).toBeVisible();
  await expect(bosch).toHaveAttribute('aria-pressed','false');
  await bosch.click();
  await expect(page.locator('#external-results .external-product')).toHaveCount(1,{timeout:10000});
  await expect(page.locator('#external-results .external-product')).toContainText('Bosch Akku-Bohrschrauber');
  expect(requests.some(url=>new URL(url).searchParams.get('brand')==='Bosch')).toBeTruthy();
  expect(new URL(page.url()).searchParams.get('amazonBrand')).toBe('Bosch');
  await expect(bosch).toHaveClass(/is-active/);
  await expect(bosch).toHaveAttribute('aria-pressed','true');

  await page.locator('#amazon-refinement-reset').click();
  await expect(page.locator('#external-results .external-product')).toHaveCount(2,{timeout:10000});
  expect(new URL(page.url()).searchParams.get('amazonBrand')).toBeNull();
  expect(requests.filter(url=>!new URL(url).searchParams.get('brand')).length).toBeGreaterThanOrEqual(2);
});

test('Amazon refinements support category to browse-node to brand chain',async({page})=>{
  const requests=[];
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{
    const url=new URL(route.request().url());
    requests.push(url.href);
    const searchIndex=url.searchParams.get('searchIndex')||'';
    const browseNodeId=url.searchParams.get('browseNodeId')||'';
    const brand=url.searchParams.get('brand')||'';
    let refinements;
    if(!searchIndex){refinements=[{type:'searchIndex',id:'SearchIndex',displayName:'Kategorie',bins:[{id:'Tools',displayName:'Werkzeuge'}]}]}
    else if(!browseNodeId){refinements=[{type:'browseNode',id:'BrowseNode',displayName:'Unterkategorie',bins:[{id:'12345',displayName:'Akkuschrauber'}]}]}
    else{refinements=[{type:'other',id:'Brand',displayName:'Marke',bins:[{id:'Bosch',displayName:'Bosch'},{id:'Makita',displayName:'Makita'}]}]}
    const items=[{id:'chain-'+(brand||browseNodeId||searchIndex||'all'),title:`Amazon Treffer ${brand||browseNodeId||searchIndex||'Alle'}`,brand:brand||'Test',merchant:'Amazon',image:'',price:99,currency:'EUR',shipping:'',url:'https://example.com/chain-'+encodeURIComponent(brand||browseNodeId||searchIndex||'all'),attributes:{}}];
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,provider:'amazon-creators-api',marketplace:'www.amazon.de',itemCount:1,refinements,items})});
  });

  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  await expect(page.locator('[data-amazon-refinement-key="searchIndex"][data-amazon-refinement-value="Tools"]')).toBeVisible({timeout:10000});
  await page.locator('[data-amazon-refinement-key="searchIndex"][data-amazon-refinement-value="Tools"]').click();
  await expect(page.locator('[data-amazon-refinement-key="browseNodeId"][data-amazon-refinement-value="12345"]')).toBeVisible({timeout:10000});
  await page.locator('[data-amazon-refinement-key="browseNodeId"][data-amazon-refinement-value="12345"]').click();
  await expect(page.locator('[data-amazon-refinement-key="brand"][data-amazon-refinement-value="Bosch"]')).toBeVisible({timeout:10000});
  await page.locator('[data-amazon-refinement-key="brand"][data-amazon-refinement-value="Bosch"]').click();
  await expect(page.locator('#external-results .external-product')).toContainText('Amazon Treffer Bosch');

  const final=requests.map(value=>new URL(value)).find(url=>url.searchParams.get('searchIndex')==='Tools'&&url.searchParams.get('browseNodeId')==='12345'&&url.searchParams.get('brand')==='Bosch');
  expect(final).toBeTruthy();
  const currentUrl=new URL(page.url());
  expect(currentUrl.searchParams.get('amazonSearchIndex')).toBe('Tools');
  expect(currentUrl.searchParams.get('amazonBrowseNode')).toBe('12345');
  expect(currentUrl.searchParams.get('amazonBrand')).toBe('Bosch');
  const state=await page.evaluate(()=>window.FundBlickAmazonRefinementUI.getState());
  expect(state).toEqual({...emptyState,searchIndex:'Tools',browseNodeId:'12345',brand:'Bosch'});
});

test('Amazon price rating and sort controls are forwarded server-side and persisted',async({page})=>{
  const requests=await mockBrandRelay(page);
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  await expect(page.locator('#amazon-refinements')).toBeVisible({timeout:10000});
  await page.locator('#amazon-min-price').fill('50');
  await page.locator('#amazon-max-price').fill('150');
  await page.locator('#amazon-min-rating').selectOption('4');
  await page.locator('#amazon-sort').selectOption('Price:LowToHigh');
  await page.locator('#amazon-advanced-apply').click();

  await expect.poll(()=>requests.some(value=>{
    const url=new URL(value);
    return url.searchParams.get('minPrice')==='50'&&url.searchParams.get('maxPrice')==='150'&&url.searchParams.get('minRating')==='4'&&url.searchParams.get('sortBy')==='Price:LowToHigh';
  })).toBeTruthy();
  const current=new URL(page.url());
  expect(current.searchParams.get('amazonMinPrice')).toBe('50');
  expect(current.searchParams.get('amazonMaxPrice')).toBe('150');
  expect(current.searchParams.get('amazonMinRating')).toBe('4');
  expect(current.searchParams.get('amazonSort')).toBe('Price:LowToHigh');
  expect(await page.evaluate(()=>window.FundBlickAmazonRefinementUI.getState())).toEqual({...emptyState,minPrice:'50',maxPrice:'150',minRating:'4',sortBy:'Price:LowToHigh'});
});

test('Amazon refinement URL state survives reload and is used by first refined request',async({page})=>{
  const requests=[];
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{
    const url=new URL(route.request().url());requests.push(url.href);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,provider:'amazon-creators-api',marketplace:'www.amazon.de',itemCount:1,refinements:[{type:'other',id:'Brand',displayName:'Marke',bins:[{id:'Bosch',displayName:'Bosch'}]}],items:[{id:'persist',title:'Persistierter Bosch Treffer',brand:'Bosch',merchant:'Amazon',image:'',price:79,currency:'EUR',shipping:'',url:'https://example.com/persist',attributes:{Brand:'Bosch'}}]})});
  });
  const url=base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1&amazonSearchIndex=Tools&amazonBrowseNode=12345&amazonBrand=Bosch&amazonMinPrice=50&amazonMaxPrice=150&amazonMinRating=4&amazonSort=Price%3ALowToHigh';
  await page.goto(url,{waitUntil:'networkidle'});
  await expect(page.locator('#external-results .external-product')).toContainText('Persistierter Bosch Treffer',{timeout:10000});
  const state=await page.evaluate(()=>window.FundBlickAmazonRefinementUI.getState());
  expect(state).toEqual({searchIndex:'Tools',browseNodeId:'12345',brand:'Bosch',minPrice:'50',maxPrice:'150',minRating:'4',sortBy:'Price:LowToHigh'});
  expect(requests.some(value=>{const u=new URL(value);return u.searchParams.get('searchIndex')==='Tools'&&u.searchParams.get('browseNodeId')==='12345'&&u.searchParams.get('brand')==='Bosch'&&u.searchParams.get('minPrice')==='50'&&u.searchParams.get('minRating')==='4'})).toBeTruthy();
});

test('browser back restores previous Amazon refinement state',async({page})=>{
  await mockBrandRelay(page);
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  const bosch=page.locator('[data-amazon-refinement-key="brand"][data-amazon-refinement-value="Bosch"]');
  await expect(bosch).toBeVisible({timeout:10000});await bosch.click();
  await expect(page.locator('#external-results .external-product')).toHaveCount(1,{timeout:10000});
  await page.locator('#amazon-refinement-reset').click();
  await expect(page.locator('#external-results .external-product')).toHaveCount(2,{timeout:10000});
  await page.goBack({waitUntil:'domcontentloaded'});
  await expect.poll(async()=>new URL(page.url()).searchParams.get('amazonBrand')).toBe('Bosch');
  await expect.poll(async()=>page.evaluate(()=>window.FundBlickAmazonRefinementUI.getState().brand)).toBe('Bosch');
  await expect(page.locator('#external-results .external-product')).toHaveCount(1,{timeout:10000});
});

test('changing the base query clears stale Amazon refinement state',async({page})=>{
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{
    const url=new URL(route.request().url());
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,provider:'amazon-creators-api',marketplace:'www.amazon.de',itemCount:1,refinements:[{type:'other',id:'Brand',displayName:'Marke',bins:[{id:'Bosch',displayName:'Bosch'}]}],items:[{id:'q-'+url.searchParams.get('q'),title:'Amazon '+url.searchParams.get('q'),brand:'Bosch',merchant:'Amazon',image:'',price:80,currency:'EUR',shipping:'',url:'https://example.com/'+encodeURIComponent(url.searchParams.get('q')),attributes:{Brand:'Bosch'}}]})});
  });
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  await expect(page.locator('[data-amazon-refinement-key="brand"][data-amazon-refinement-value="Bosch"]')).toBeVisible({timeout:10000});
  await page.locator('[data-amazon-refinement-key="brand"][data-amazon-refinement-value="Bosch"]').click();
  await page.locator('#query').fill('Bohrhammer');
  expect(await page.evaluate(()=>window.FundBlickAmazonRefinementUI.getState())).toEqual(emptyState);
  expect(new URL(page.url()).searchParams.get('amazonBrand')).toBeNull();
  await expect(page.locator('#amazon-refinements')).toBeHidden();
});

test('Amazon zero results keep refinement context while eBay fallback is shown',async({page})=>{
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{
    const url=new URL(route.request().url());
    const active=url.searchParams.get('brand')==='Bosch';
    const items=active?[]:[{id:'amazon-base',title:'Amazon Basis',brand:'Bosch',merchant:'Amazon',image:'',price:99,currency:'EUR',shipping:'',url:'https://example.com/amazon-base',attributes:{Brand:'Bosch'}}];
    const refinements=[{type:'other',id:'Brand',displayName:'Marke',bins:[{id:'Bosch',displayName:'Bosch'}]}];
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,provider:'amazon-creators-api',marketplace:'www.amazon.de',itemCount:items.length,refinements,items})});
  });
  await page.route('http://127.0.0.1:4173/__mock_ebay_relay__/search**',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,provider:'ebay-browse',itemCount:1,items:[{id:'ebay-fallback',title:'eBay Ersatztreffer',brand:'Test',merchant:'eBay',image:'',price:88,currency:'EUR',shipping:'',url:'https://example.com/ebay-fallback',attributes:{}}]})});
  });

  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1&externalEbayRelayMock=1',{waitUntil:'networkidle'});
  const bosch=page.locator('[data-amazon-refinement-key="brand"][data-amazon-refinement-value="Bosch"]');
  await expect(bosch).toBeVisible({timeout:10000});
  await bosch.click();
  await expect(page.locator('.amazon-refinement-empty')).toBeVisible({timeout:10000});
  await expect(page.locator('.amazon-refinement-empty')).toContainText('Amazon · 0');
  await expect(page.locator('#external-results .external-product')).toContainText('eBay Ersatztreffer',{timeout:10000});
  expect(await page.evaluate(()=>window.FundBlickAmazonRefinementUI.getState().brand)).toBe('Bosch');
});
