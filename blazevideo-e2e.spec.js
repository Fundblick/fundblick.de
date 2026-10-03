'use strict';
const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:4173/';
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 test('BlazeVideo categories, images and affiliate consent '+viewport.width,async({page})=>{
  await page.setViewportSize(viewport);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'?lang=de',{waitUntil:'networkidle'});
  const cameras=page.locator('a[data-catalog-category="electronics.cameras.trail-cameras"]');
  await expect(cameras).toHaveText('Wildkameras');await expect(cameras).toHaveAttribute('title','14 Produkte');
  await cameras.click();await page.waitForLoadState('networkidle');
  await expect(page.locator('#cards article.product')).toHaveCount(14);
  await expect(page.locator('#summary')).toContainText('Wildkameras');
  const images=page.locator('#cards article.product img');
  for(let i=0;i<await images.count();i++){await images.nth(i).scrollIntoViewIfNeeded();await expect.poll(()=>images.nth(i).evaluate(img=>img.complete&&img.naturalWidth>=200)).toBe(true);}
  const imageState=await images.evaluateAll(imgs=>imgs.map(img=>({complete:img.complete,width:img.naturalWidth,src:img.currentSrc})));
  expect(imageState.length).toBeGreaterThanOrEqual(14);
  expect(imageState.every(img=>img.complete&&img.width>=200&&new URL(img.src).hostname==='cdn.shopify.com')).toBe(true);
  const link=page.locator('#cards article.product').first().locator('.merchant-link');
  await expect(link).toHaveAttribute('href',/^https:\/\/www\.blazevideos\.de\/products\//);
  await expect(link).toHaveAttribute('data-link-mode','direct');
  const affiliate=new URL(await link.getAttribute('data-offer-affiliate-url'));
  expect(affiliate.searchParams.get('m')).toBe('25962');expect(affiliate.searchParams.get('a')).toBe('3106259');
  await page.locator('#fbConsent [data-consent="granted"]').click();
  affiliate.searchParams.set('cons','1');await expect(link).toHaveAttribute('href',affiliate.href);
  await expect(link).toHaveAttribute('data-link-mode','affiliate');
  await page.locator('[data-affiliate-settings]').first().click();
  await page.locator('#fbConsent [data-consent="denied"]').click();
  affiliate.searchParams.set('cons','0');await expect(link).toHaveAttribute('href',affiliate.href);
  await expect(link).toHaveAttribute('data-link-mode','affiliate-no-track');
  await page.goto(base+'search.html?category=electronics.cameras.trail-camera-accessories&lang=de',{waitUntil:'networkidle'});
  await expect(page.locator('#cards article.product')).toHaveCount(2);
  await expect(page.locator('#filters')).toContainText('Solarpanel für Wildkameras');
  await expect(page.locator('#filters')).toContainText('Kamerahalterung');
  await expect(page.locator('#cards')).not.toContainText('BLAZES');
  await page.locator('#language').selectOption('ru');
  await expect(page.locator('#summary')).toContainText('Аксессуары для фотоловушек');
  await expect(page.locator('#cards article.product')).toHaveCount(2);
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 });
}
