'use strict';
const {test,expect}=require('@playwright/test');

const base='http://127.0.0.1:4173/';

test('homepage renders a real daily offer without invented discount evidence',async({page})=>{
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
  await expect(page.locator('#dealCta')).toHaveAttribute('href',/search\.html\?/);

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
  await page.locator('#language').selectOption('ru');
  await expect(page.locator('#dealCta span').first()).toHaveText('Посмотреть предложение');
  await expect(page.locator('#dealCta')).toHaveAttribute('href',/search\.html\?.*lang=ru/);
  await expect(page.locator('#dealName')).toHaveText(sourceName||'');
  expect(errors).toEqual([]);
});
