'use strict';
const {test,expect}=require('@playwright/test');
const BASE='http://127.0.0.1:4173';

for(const profile of [
  {name:'desktop',viewport:{width:1440,height:1000}},
  {name:'mobile',viewport:{width:390,height:844}}
]){
  test(`RU taxonomy labels preserve filter/source values on ${profile.name}`,async({page})=>{
    await page.setViewportSize(profile.viewport);
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error&&error.message||error)));

    await page.goto(`${BASE}/search.html?lang=ru`,{waitUntil:'domcontentloaded'});
    await expect(page.locator('html')).toHaveAttribute('lang','ru');
    await expect.poll(()=>page.evaluate(()=>Boolean(window.FundBlickTaxonomyI18n))).toBe(true);

    // Inject representative merchant/source values into the real result containers.
    // This keeps the browser test deterministic even when local CI has no live catalog artifact.
    await page.evaluate(()=>{
      document.querySelector('#filters').innerHTML=`
        <label><input type="checkbox" data-key="type" value="Beistelltisch"> Beistelltisch <span>91</span></label>
        <label><input type="checkbox" data-key="type" value="Bank"> Bank <span>2</span></label>
        <label><input type="checkbox" data-key="material" value="Holz"> Holz <span>313</span></label>`;
      document.querySelector('#chips').innerHTML='<button data-remove="type:Beistelltisch">Beistelltisch ×</button>';
      document.querySelector('#cards').innerHTML=`<article class="product"><h2>Hakenleiste Belluno</h2><div class="tags"><span>Holz</span><span>Metall</span><span>Marokkanisch</span></div></article>`;
    });

    const sideTable=page.locator('#filters input[value="Beistelltisch"]');
    await expect(sideTable).toHaveValue('Beistelltisch');
    await expect(sideTable.locator('xpath=..')).toContainText('Приставной столик');

    const bench=page.locator('#filters input[value="Bank"]');
    await expect(bench).toHaveValue('Bank');
    await expect(bench.locator('xpath=..')).toContainText('Скамья');

    const wood=page.locator('#filters input[value="Holz"]');
    await expect(wood).toHaveValue('Holz');
    await expect(wood.locator('xpath=..')).toContainText('Дерево');

    // Visible chip and taxonomy tags localize, while merchant-owned title remains untouched.
    await expect(page.locator('#chips')).toContainText('Приставной столик');
    await expect(page.locator('.product .tags')).toContainText('Дерево');
    await expect(page.locator('.product .tags')).toContainText('Металл');
    await expect(page.locator('.product .tags')).toContainText('Марокканский стиль');
    await expect(page.locator('.product h2')).toHaveText('Hakenleiste Belluno');

    // Translation must never rewrite the functional source value used for filtering.
    await sideTable.check();
    await expect(sideTable).toBeChecked();
    await expect(sideTable).toHaveValue('Beistelltisch');
    expect(errors).toEqual([]);
  });
}