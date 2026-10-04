'use strict';
const {test,expect}=require('@playwright/test');

const base='http://127.0.0.1:4173/';

for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
  test(`homepage search feedback and language survive navigation at ${viewport.width}px`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.goto(base+'?lang=ru',{waitUntil:'networkidle'});
    await expect(page.locator('#q')).not.toBeFocused();
    await page.locator('#q').fill('   ');
    await page.locator('#searchForm button[type="submit"]').click();
    await expect(page).toHaveURL(/\?lang=ru$/);
    await expect(page.locator('#searchFeedback')).toBeVisible();
    await expect(page.locator('#searchFeedback')).toHaveText('Введите товар, бренд или модель.');
    await expect(page.locator('#q')).toHaveAttribute('aria-invalid','true');
    await expect(page.locator('#q')).toBeFocused();
    await page.locator('#language').selectOption('de');
    await expect(page.locator('#searchFeedback')).toHaveText('Bitte gib ein Produkt, eine Marke oder ein Modell ein.');
    await page.locator('#q').fill('Mosaiktisch');
    await expect(page.locator('#searchFeedback')).toBeHidden();
    await expect(page.locator('#q')).not.toHaveAttribute('aria-invalid','true');
    await page.locator('#language').selectOption('ru');
    await page.locator('#searchForm button[type="submit"]').click();
    await expect(page).toHaveURL(/search\.html\?/);
    const url=new URL(page.url());
    expect(url.searchParams.get('q')).toBe('Mosaiktisch');
    expect(url.searchParams.get('lang')).toBe('ru');
    await expect(page.locator('html')).toHaveAttribute('lang','ru');
  });
}

test('homepage renders a real daily offer and sends CTA through affiliate link when available',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await page.goto(base+'?lang=de',{waitUntil:'networkidle'});

  const content=page.locator('#deal-content');
  await expect(content).toBeVisible();
  await expect(page.locator('#deal-empty')).toBeHidden();
  await expect(page.locator('#dealName')).not.toHaveText('');
  await expect(page.locator('#dealPrice')).toContainText('€');
  await expect(page.locator('#dealMerchant')).not.toHaveText('');
  await expect(page.locator('#dealImage')).toHaveAttribute('src',/^https?:\/\//);

  const expected=await page.evaluate(async()=>{
    const products=await window.FundBlickCatalog.load();
    const deal=window.FundBlickDealOfDay.selectDaily(products);
    const affiliate=deal?.best?.affiliateUrl||deal?.affiliateUrl||'';
    const direct=deal?.best?.directUrl||deal?.directUrl||'';
    return {affiliate,direct};
  });
  expect(expected.affiliate||expected.direct).toBeTruthy();

  const cta=page.locator('#dealCta');
  await expect(cta).toHaveAttribute('data-outbound-merchant','true');
  await expect(cta).toHaveAttribute('href',/^https?:\/\//);
  await expect(cta).not.toHaveAttribute('href',/search\.html/);
  await expect(cta).toHaveAttribute('target','_blank');
  await expect(cta).toHaveAttribute('rel',/noopener/);

  if(expected.affiliate){
    await expect(cta).toHaveAttribute('data-outbound-mode','affiliate');
    await expect(cta).toHaveAttribute('href',expected.affiliate);
    await expect(cta).toHaveAttribute('rel',/sponsored/);
  }else{
    await expect(cta).toHaveAttribute('data-outbound-mode','direct');
    await expect(cta).toHaveAttribute('href',expected.direct);
  }

  const kind=await content.getAttribute('data-deal-kind');
  expect(['deal','spotlight']).toContain(kind);
  if(kind==='spotlight'){
    await expect(page.locator('#dealReference')).toBeHidden();
    await expect(page.locator('#dealDiscount')).toBeHidden();
    await expect(page.locator('#dealSaving')).toBeHidden();
    await expect(page.locator('#dealKind')).toHaveText('Heutiges Angebot');
  }else{
    await expect(page.locator('#dealReference')).toBeVisible();
    await expect(page.locator('#dealDiscount')).toBeVisible();
    await expect(page.locator('#dealSaving')).toBeVisible();
  }

  const sourceName=await page.locator('#dealName').textContent();
  const destination=await cta.getAttribute('href');
  await page.locator('#language').selectOption('ru');
  await expect(page.locator('#dealCta span').first()).toHaveText('Посмотреть предложение');
  await expect(cta).toHaveAttribute('href',destination||'');
  await expect(page.locator('#dealName')).toHaveText(sourceName||'');
  await expect(page.locator('.home-value')).toHaveCount(0);
  expect(errors).toEqual([]);
});
