'use strict';
const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:4173/search.html';

test('Amazon refinement chip starts a second-stage relay search',async({page})=>{
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
      schemaVersion:1,
      provider:'amazon-creators-api',
      marketplace:'www.amazon.de',
      itemCount:items.length,
      refinements:[{type:'other',id:'Brand',displayName:'Marke',bins:[{id:'Bosch',displayName:'Bosch'},{id:'Makita',displayName:'Makita'}]}],
      items
    })});
  });

  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  await expect(page.locator('#external-results')).toBeVisible({timeout:10000});
  await expect(page.locator('#amazon-refinements')).toBeVisible();
  const bosch=page.locator('[data-amazon-refinement-key="brand"][data-amazon-refinement-value="Bosch"]');
  await expect(bosch).toBeVisible();
  await bosch.click();
  await expect(page.locator('#external-results .external-product')).toHaveCount(1,{timeout:10000});
  await expect(page.locator('#external-results .external-product')).toContainText('Bosch Akku-Bohrschrauber');
  expect(requests.some(url=>new URL(url).searchParams.get('brand')==='Bosch')).toBeTruthy();
  await expect(bosch).toHaveClass(/is-active/);

  await page.locator('#amazon-refinement-reset').click();
  await expect(page.locator('#external-results .external-product')).toHaveCount(2,{timeout:10000});
  expect(requests.filter(url=>!new URL(url).searchParams.get('brand')).length).toBeGreaterThanOrEqual(2);
});
