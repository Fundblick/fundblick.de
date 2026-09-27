'use strict';
const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:4173/search.html';

test('Amazon rejects MinReviewsRating 5 and only forwards valid integer ratings 1-4',async({page})=>{
  const requests=[];
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{
    const url=new URL(route.request().url());
    requests.push(url.href);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      schemaVersion:1,provider:'amazon-creators-api',marketplace:'www.amazon.de',itemPage:1,totalResultCount:1,itemCount:1,
      refinements:[{type:'other',id:'Brand',displayName:'Marke',bins:[{id:'Test',displayName:'Test'}]}],
      items:[{id:'rating-test',title:'Amazon Rating Test',brand:'Test',merchant:'Amazon',image:'',price:99,currency:'EUR',shipping:'',url:'https://example.com/rating-test',attributes:{}}]
    })});
  });

  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1&amazonMinRating=5',{waitUntil:'networkidle'});
  await expect(page.locator('#external-results')).toBeVisible({timeout:10000});
  expect(await page.evaluate(()=>window.FundBlickAmazonRefinementUI.getState().minRating)).toBe('');
  expect(new URL(page.url()).searchParams.get('amazonMinRating')).toBeNull();
  expect(requests.some(value=>new URL(value).searchParams.has('minRating'))).toBeFalsy();
  await expect(page.locator('#amazon-min-rating option[value="5"]')).toHaveCount(0);

  await page.locator('#amazon-min-rating').selectOption('4');
  await page.locator('#amazon-advanced-apply').click();
  await expect.poll(()=>requests.some(value=>new URL(value).searchParams.get('minRating')==='4')).toBeTruthy();
  expect(new URL(page.url()).searchParams.get('amazonMinRating')).toBe('4');
});
