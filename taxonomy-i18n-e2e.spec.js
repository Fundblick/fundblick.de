'use strict';
const {test,expect}=require('@playwright/test');
const BASE='http://127.0.0.1:4173';

for(const profile of [
  {name:'desktop',viewport:{width:1440,height:1000}},
  {name:'mobile',viewport:{width:390,height:844}}
]){
  test(`RU taxonomy labels preserve filter/source values on ${profile.name}`,async({page})=>{
    test.setTimeout(30000);
    await page.setViewportSize(profile.viewport);
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error&&error.message||error)));

    await page.goto(`${BASE}/search.html?lang=ru`,{waitUntil:'domcontentloaded'});
    const sideTable=page.locator('#filters input[type="checkbox"][value="Beistelltisch"]');
    await expect(sideTable).toHaveCount(1,{timeout:15000});
    await expect(sideTable).toHaveValue('Beistelltisch');
    await expect(sideTable.locator('xpath=..')).toContainText('Приставной столик');

    const bench=page.locator('#filters input[type="checkbox"][value="Bank"]');
    await expect(bench).toHaveValue('Bank');
    await expect(bench.locator('xpath=..')).toContainText('Скамья');

    const wood=page.locator('#filters input[type="checkbox"][value="Holz"]');
    await expect(wood).toHaveValue('Holz');
    await expect(wood.locator('xpath=..')).toContainText('Дерево');

    await sideTable.check();
    await expect(sideTable).toBeChecked();
    await expect(page.locator('#chips')).toContainText('Приставной столик');

    // Merchant-owned product title remains source text; taxonomy tags may be localized.
    await expect(page.locator('#cards')).toContainText(/Hakenleiste Belluno|Boho Sitzwürfel Pouf Lara|Metall Wanddeko Baum/);
    expect(errors).toEqual([]);
  });
}