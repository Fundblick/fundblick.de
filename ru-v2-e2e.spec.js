'use strict';
const {test,expect}=require('@playwright/test');

const BASE='http://127.0.0.1:4173';

async function dismissConsent(page){
  const reject=page.locator('[data-consent="denied"]');
  if(await reject.count()){
    try{await reject.first().click({timeout:1500});}catch{}
  }
}

function collectRuntimeErrors(page){
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error&&error.message||error)));
  return errors;
}

async function assertRussianHome(page){
  await expect(page.locator('html')).toHaveAttribute('lang','ru');
  await expect(page.locator('h1')).toContainText('Ищите. Сравнивайте предложения. Готово.');
  await expect(page.locator('#language')).toHaveValue('ru');
}

for(const profile of [
  {name:'desktop',viewport:{width:1440,height:1000}},
  {name:'mobile',viewport:{width:390,height:844}}
]){
  test.describe(`RU V2 ${profile.name}`,()=>{
    test.use({viewport:profile.viewport});

    test('direct RU entry, search journey, filters and history stay usable',async({page})=>{
      const runtimeErrors=collectRuntimeErrors(page);
      await page.goto(`${BASE}/index.html?lang=ru`,{waitUntil:'domcontentloaded'});
      await assertRussianHome(page);

      await page.locator('#q').fill('лампа');
      await Promise.all([
        page.waitForURL(url=>url.pathname.endsWith('/search.html')),
        page.locator('#searchForm').evaluate(form=>form.requestSubmit())
      ]);
      await dismissConsent(page);

      await expect(page.locator('html')).toHaveAttribute('lang','ru');
      await expect(page.locator('h1')).toContainText('Результаты поиска');
      await expect(page.locator('#filter-panel > summary')).toContainText('Уточнить поиск');
      await expect(page.locator('#query')).toHaveValue('лампа');

      const filters=page.locator('#filter-panel');
      await filters.evaluate(el=>el.open=false);
      await expect(filters).not.toHaveAttribute('open','');
      await filters.locator('summary').click();
      await expect(filters).toHaveAttribute('open','');

      await page.locator('#sort').selectOption('price-asc');
      await expect(page.locator('#sort')).toHaveValue('price-asc');

      await page.locator('.results-back-button').click();
      await page.waitForLoadState('domcontentloaded');
      await assertRussianHome(page);

      await page.goBack({waitUntil:'domcontentloaded'});
      await dismissConsent(page);
      await expect(page.locator('h1')).toContainText('Результаты поиска');
      await expect(page.locator('#query')).toHaveValue('лампа');

      await page.goForward({waitUntil:'domcontentloaded'});
      await assertRussianHome(page);
      expect(runtimeErrors).toEqual([]);
    });

    test('privacy and 404 pages render Russian without German fallback',async({page})=>{
      const runtimeErrors=collectRuntimeErrors(page);
      await page.goto(`${BASE}/datenschutz.html?lang=ru`,{waitUntil:'domcontentloaded'});
      await dismissConsent(page);
      await expect(page.locator('html')).toHaveAttribute('lang','ru');
      await expect(page.locator('h1')).toContainText('Политика конфиденциальности');
      await expect(page.locator('[data-awin-status]')).toContainText(/Awin .*актив/);
      await expect(page.locator('[data-affiliate-settings]')).toContainText('Настройки отслеживания');

      await page.goto(`${BASE}/404.html?lang=ru`,{waitUntil:'domcontentloaded'});
      await expect(page.locator('html')).toHaveAttribute('lang','ru');
      await expect(page.locator('h1')).toContainText('Здесь ничего не найдено.');
      await expect(page.locator('[data-error-i18n="search"]')).toContainText('К поиску товаров');
      expect(runtimeErrors).toEqual([]);
    });
  });
}
