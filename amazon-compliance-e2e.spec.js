'use strict';
const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:4173/search.html';

async function mockAmazon(page){
  await page.route('http://127.0.0.1:4173/__mock_amazon_relay__/search**',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      schemaVersion:1,
      provider:'amazon-creators-api',
      marketplace:'www.amazon.de',
      itemCount:1,
      items:[{
        id:'ASIN-TEST',
        title:'Amazon Test Akkuschrauber',
        brand:'TestBrand',
        merchant:'Amazon',
        image:'',
        price:99.99,
        currency:'EUR',
        shipping:'',
        url:'https://www.amazon.de/dp/ASINTEST',
        attributes:{Spannung:'18 V'}
      }]
    })});
  });
}

test('Amazon relay results show required FundBlick Amazon disclosure and price timestamp',async({page})=>{
  await mockAmazon(page);
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=de&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  await expect(page.locator('#external-results')).toBeVisible({timeout:10000});
  const amazon=page.locator('.external-product[data-provider="amazon-creators-api-relay"]');
  await expect(amazon).toHaveCount(1);
  await expect(page.locator('#amazon-associate-disclosure')).toBeVisible();
  await expect(page.locator('#amazon-associate-disclosure')).toContainText('Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.');
  await expect(page.locator('#amazon-associate-disclosure')).toContainText('kann seit der letzten Aktualisierung gestiegen sein');
  await expect(amazon.locator('.amazon-link-disclosure')).toHaveText('(bezahlter Link)');
  await expect(amazon.locator('.external-cta')).toHaveAttribute('aria-describedby',/amazon-link-disclosure-/);
  await expect(amazon.locator('.amazon-price-notice')).toContainText('Amazon-Preis: Stand');
  await expect(amazon.locator('.amazon-price-notice')).toContainText('Maßgeblich ist der Preis auf Amazon.de zum Zeitpunkt des Kaufs.');
});

test('Amazon compliance copy follows Russian locale',async({page})=>{
  await mockAmazon(page);
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=ru&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  const amazon=page.locator('.external-product[data-provider="amazon-creators-api-relay"]');
  await expect(amazon).toHaveCount(1);
  await expect(page.locator('#amazon-associate-disclosure')).toContainText('Как участник партнерской программы Amazon');
  await expect(amazon.locator('.amazon-link-disclosure')).toHaveText('(платная ссылка)');
  await expect(amazon.locator('.amazon-price-notice')).toContainText('Цена Amazon: по состоянию на');
});

test('Amazon compliance copy keeps exact zh-Hans locale',async({page})=>{
  await mockAmazon(page);
  await page.goto(base+'?q='+encodeURIComponent('Akkuschrauber')+'&lang=zh-Hans&externalAmazonRelayMock=1',{waitUntil:'networkidle'});
  const amazon=page.locator('.external-product[data-provider="amazon-creators-api-relay"]');
  await expect(amazon).toHaveCount(1);
  await expect(page.locator('#amazon-associate-disclosure')).toContainText('作为 Amazon 合作伙伴');
  await expect(amazon.locator('.amazon-link-disclosure')).toHaveText('（付费链接）');
  await expect(amazon.locator('.amazon-price-notice')).toContainText('Amazon 价格：更新于');
});
