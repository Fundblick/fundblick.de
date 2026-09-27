'use strict';
const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:4173/search.html';

function item(page,index){
  const n=(page-1)*10+index+1;
  return {id:`amazon-${n}`,title:`Amazon Treffer ${n}`,brand:'Test',merchant:'Amazon',image:'',price:50+n,currency:'EUR',shipping:'',url:`https://example.com/amazon-${n}`,attributes:{Brand:'Test'}};
}

test('Amazon +10 appends the next SearchItems page and stops at total count',async({page})=>{
  const requestedPages=[];
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{
    const url=new URL(route.request().url());
    const itemPage=Number(url.searchParams.get('itemPage')||1);
    requestedPages.push(itemPage);
    const count=itemPage===1?10:(itemPage===2?5:0);
    const items=Array.from({length:count},(_,index)=>item(itemPage,index));
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      schemaVersion:1,
      provider:'amazon-creators-api',
      marketplace:'www.amazon.de',
      itemPage,
      totalResultCount:15,
      itemCount:items.length,
      refinements:[{type:'other',id:'Brand',displayName:'Marke',bins:[{id:'Test',displayName:'Test'}]}],
      items
    })});
  });

  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  await expect(page.locator('#external-results .external-product')).toHaveCount(10,{timeout:10000});
  await expect(page.locator('#amazon-load-more')).toBeVisible();
  await expect(page.locator('.amazon-pagination')).toContainText('10 / 15');

  await page.locator('#amazon-load-more').click();
  await expect.poll(()=>requestedPages.includes(2)).toBeTruthy();
  await expect(page.locator('#external-results .external-product')).toHaveCount(15,{timeout:10000});
  await expect(page.locator('#external-results')).toContainText('Amazon Treffer 15');
  await expect(page.locator('#amazon-load-more')).toHaveCount(0);
  expect(await page.evaluate(()=>window.FundBlickAmazonRefinementUI.getPagination())).toEqual({page:2,total:15,loaded:15,canLoadMore:false});
});

test('changing an Amazon refinement resets pagination to page one',async({page})=>{
  const requested=[];
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{
    const url=new URL(route.request().url());
    const itemPage=Number(url.searchParams.get('itemPage')||1);
    const brand=url.searchParams.get('brand')||'';
    requested.push({itemPage,brand});
    const items=Array.from({length:itemPage===1?10:5},(_,index)=>item(itemPage,index));
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,provider:'amazon-creators-api',marketplace:'www.amazon.de',itemPage,totalResultCount:15,itemCount:items.length,refinements:[{type:'other',id:'Brand',displayName:'Marke',bins:[{id:'Bosch',displayName:'Bosch'}]}],items})});
  });

  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  await page.locator('#amazon-load-more').click();
  await expect.poll(()=>requested.some(x=>x.itemPage===2)).toBeTruthy();
  const bosch=page.locator('[data-amazon-refinement-key="brand"][data-amazon-refinement-value="Bosch"]');
  await expect(bosch).toBeVisible();
  await bosch.click();
  await expect.poll(()=>requested.some(x=>x.itemPage===1&&x.brand==='Bosch')).toBeTruthy();
  expect(await page.evaluate(()=>window.FundBlickAmazonRefinementUI.getPagination().page)).toBe(1);
});
