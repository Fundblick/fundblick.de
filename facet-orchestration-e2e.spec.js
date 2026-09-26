'use strict';
const {test,expect}=require('@playwright/test');

const base='http://127.0.0.1:4173/search.html?lang=de';

function facet(page,title){
  return page.locator('section.facet').filter({has:page.locator('h2',{hasText:title})});
}

test('Ahipos merchant, brand and product-type facets follow the remaining result set',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'networkidle'});
  await expect(page.locator('#cards article.product').first()).toBeVisible();

  const merchantFacet=facet(page,'Händler');
  await expect(merchantFacet).toBeVisible();
  await expect(merchantFacet.locator('input[data-key="merchant"]')).toHaveCount(2);
  await expect(merchantFacet).toContainText('Casa Moro');
  await expect(merchantFacet).toContainText('Ahipos Horses DE');

  await merchantFacet.locator('input[value="Ahipos Horses DE"]').check();
  await expect(page.locator('#summary')).toContainText('31');

  const brandFacet=facet(page,'Hersteller');
  await expect(brandFacet.locator('input[data-key="brand"]')).toHaveCount(2);
  await expect(brandFacet).toContainText('Ahipos Horses');
  await expect(brandFacet).toContainText('Equinox Equine');
  await expect(brandFacet).not.toContainText('ahipos-horses');
  await expect(brandFacet).not.toContainText('Fast Bundle');
  await expect(brandFacet).not.toContainText('Casa Moro');

  const typeFacet=facet(page,'Produkttyp');
  await expect(typeFacet).toBeVisible();
  await expect(typeFacet).toContainText('Ergänzungsfutter');
  await expect(typeFacet).toContainText('Pferdepflege');
  await expect(typeFacet).toContainText('Bundle');
  await expect(typeFacet).not.toContainText('Couchtisch');
  await expect(typeFacet).not.toContainText('Bistrotisch');
  await expect(typeFacet.locator('label').filter({hasText:/\b0\b/})).toHaveCount(0);

  await brandFacet.locator('input[value="Equinox Equine"]').check();
  await expect(page.locator('#summary')).toContainText('5');
  const equinoxType=facet(page,'Produkttyp');
  await expect(equinoxType).toContainText('Ergänzungsfutter');
  await expect(equinoxType).not.toContainText('Couchtisch');
  await expect(equinoxType.locator('label')).toHaveCount(1);

  expect(errors).toEqual([]);
});

test('Casa Moro keeps furniture product types without equestrian leakage',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'networkidle'});
  await expect(page.locator('#cards article.product').first()).toBeVisible();

  const merchantFacet=facet(page,'Händler');
  const casaLabel=merchantFacet.locator('label').filter({hasText:'Casa Moro'});
  await expect(casaLabel).toHaveCount(1);
  await casaLabel.locator('input[data-key="merchant"]').check();
  await expect(page.locator('#summary')).toContainText('1428');
  const casaType=facet(page,'Produkttyp');
  await expect(casaType).toContainText('Couchtisch');
  await expect(casaType).not.toContainText('Ergänzungsfutter');
  await expect(casaType.locator('label').filter({hasText:/\b0\b/})).toHaveCount(0);
  expect(errors).toEqual([]);
});