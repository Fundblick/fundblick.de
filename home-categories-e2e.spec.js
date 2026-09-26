'use strict';
const {test,expect}=require('@playwright/test');

const base='http://127.0.0.1:4173/';

test('homepage categories follow the production taxonomy manifest',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'?lang=de',{waitUntil:'networkidle'});
  const links=page.locator('.category-links a[data-live-category="true"]');
  await expect(links).toHaveCount(7);
  await expect(page.locator('.category-links')).toContainText('Pferd & Reitsport');
  await expect(page.locator('.category-links')).toContainText('Hund');
  await expect(page.locator('.category-links')).toContainText('Gesundheit & Nahrungsergänzung');
  await expect(page.locator('.category-links a[data-catalog-category="pet.equestrian"]')).toHaveAttribute('title','29 Produkte');
  await expect(page.locator('.category-links a[data-catalog-category="pet.dog"]')).toHaveAttribute('title','1 Produkt');
  await expect(page.locator('.category-links a[data-catalog-category="health.supplements"]')).toHaveAttribute('title','1 Produkt');

  await page.locator('#language').selectOption('ru');
  await expect(page.locator('.category-links')).toContainText('Лошади и конный спорт');
  await expect(page.locator('.category-links')).toContainText('Собаки');
  await expect(page.locator('.category-links')).toContainText('Здоровье и пищевые добавки');

  await page.locator('#language').selectOption('de');
  await page.locator('.category-links a[data-catalog-category="pet.equestrian"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/search\.html\?.*category=pet\.equestrian/);
  await expect(page.locator('#summary')).toContainText('29');
  await expect(page.locator('#cards article.product')).toHaveCount(29);
  await expect(page.locator('#cards')).toContainText('Ahipos');
  expect(errors).toEqual([]);
});